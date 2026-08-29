import { fetchFlights, fetchVacations } from "./pelikanFeed";
import type { FlightOffer, VacationOffer } from "./pelikanFeed";
import { getDb } from "./db";
import { flightProviderOffers } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

type PelikanOffer = FlightOffer | VacationOffer;

interface CacheEntry {
  flights: FlightOffer[];
  vacations: VacationOffer[];
  lastUpdated: Date;
}

class PelikanCacheService {
  private cache: CacheEntry | null = null;
  private refreshInterval: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  constructor() {
    // Start initial cache load
    this.refreshCache().catch((err) => {
      console.error("[PelikanCache] Initial cache load failed:", err);
    });

    // Schedule daily refresh at midnight (Prague timezone)
    this.scheduleMidnightRefresh();
  }

  private scheduleMidnightRefresh() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Midnight

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    console.log(
      `[PelikanCache] Scheduled next refresh at midnight (in ${Math.round(msUntilMidnight / 1000 / 60)} minutes)`
    );

    setTimeout(() => {
      this.refreshCache().catch((err) => {
        console.error("[PelikanCache] Midnight refresh failed:", err);
      });

      // Schedule next midnight refresh (24 hours)
      this.refreshInterval = setInterval(
        () => {
          this.refreshCache().catch((err) => {
            console.error("[PelikanCache] Daily refresh failed:", err);
          });
        },
        24 * 60 * 60 * 1000
      ); // 24 hours
    }, msUntilMidnight);
  }

  async refreshCache(): Promise<void> {
    if (this.isRefreshing) {
      console.log("[PelikanCache] Refresh already in progress, skipping");
      return;
    }

    this.isRefreshing = true;
    console.log("[PelikanCache] Starting cache refresh...");

    try {
      const [fetchedFlights, fetchedVacations] = await Promise.all([
        fetchFlights(100), // Fetch 100 flights
        fetchVacations(100), // Fetch 100 vacations
      ]);
      const flights = fetchedFlights ?? [];
      const vacations = fetchedVacations ?? [];

      this.cache = {
        flights,
        vacations,
        lastUpdated: new Date(),
      };

      console.log(
        `[PelikanCache] Cache refreshed successfully: ${flights.length} flights, ${vacations.length} vacations`
      );
    } catch (error) {
      console.error("[PelikanCache] Failed to refresh cache:", error);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  async getFlights(): Promise<FlightOffer[]> {
    const isPelikanDealsEnabled = process.env.PELIKAN_DEALS_ENABLED === "true";
    
    // Feature flag kill-switch: if disabled, skip DB provider offers and use safe defaults
    if (isPelikanDealsEnabled) {
      const pilotLimit = process.env.PELIKAN_PILOT_LIMIT ? parseInt(process.env.PELIKAN_PILOT_LIMIT, 10) : 10;
      const db = await getDb();
      if (db) {
        // Fetch all active provider offers
        const activeOffers = await db
          .select()
          .from(flightProviderOffers)
          .where(eq(flightProviderOffers.status, "active"));

        if (activeOffers.length > 0) {
          // Czech-market origin ranking priorities:
          const ORIGIN_PRIORITY: Record<string, number> = {
            PRG: 1, // Prague
            BRQ: 2, // Brno
            OSR: 3, // Ostrava
            VIE: 4, // Vienna (major gateway for CZ travelers)
            BTS: 5, // Bratislava (major gateway for CZ travelers)
            KTW: 6, // Katowice (major gateway for North Moravia)
          };

          // Deterministic pilot selector:
          // 1. Valid price (> 0) and CZK currency
          // 2. Allowed hostname (www.pelikan.cz, pelikan.cz)
          // 3. Ranked by Origin Priority, then Price Ascending, then stable deterministic ID
          const validOffers = activeOffers.filter((o: any) => {
            if (!o.price || o.price <= 0 || o.currency !== "CZK") return false;
            try {
              const url = new URL(o.deeplink);
              const host = url.hostname.toLowerCase();
              return host === "www.pelikan.cz" || host === "pelikan.cz";
            } catch {
              return false;
            }
          });

          validOffers.sort((a: any, b: any) => {
            const pA = ORIGIN_PRIORITY[a.origin?.toUpperCase()] || 99;
            const pB = ORIGIN_PRIORITY[b.origin?.toUpperCase()] || 99;
            if (pA !== pB) return pA - pB;
            if (a.price !== b.price) return a.price - b.price;
            return (a.id || "").localeCompare(b.id || "");
          });

          const selectedPilotOffers = validOffers.slice(0, pilotLimit);

          if (selectedPilotOffers.length > 0) {
            return selectedPilotOffers.map((offer: any) => ({
              id: offer.id,
              title: `Letenky do ${offer.destination}`,
              description: `Zpáteční letenka z ${offer.origin} do ${offer.destination}`,
              link: `/r/flights/${offer.id}`, // opaque internal redirect ID
              imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
              price: Math.round(offer.price * 1.2),
              salePrice: offer.price,
              country: offer.destination,
              destination: offer.destination,
              departure: offer.origin,
              discount: 10,
              airline: offer.airline || "Neznámá",
              type: "flight",
              rating: undefined,
              source: "pelikan",
              destinationIata: offer.destination,
              departureIata: offer.origin,
            }));
          }
        }
      }
    }

    // Fallback to in-memory cache if DB is empty or unavailable
    if (!this.cache) {
      console.log("[PelikanCache] Cache miss, fetching live data...");
      try {
        await this.refreshCache();
      } catch (error) {
        console.error("[PelikanCache] Failed to fetch live data:", error);
        return await fetchFlights();
      }
    }
    return this.cache?.flights || [];
  }

  async getVacations(): Promise<VacationOffer[]> {
    // If cache is empty, try to refresh
    if (!this.cache) {
      console.log("[PelikanCache] Cache miss, fetching live data...");
      try {
        await this.refreshCache();
      } catch (error) {
        console.error("[PelikanCache] Failed to fetch live data:", error);
        // Fallback to live API
        return await fetchVacations();
      }
    }

    return this.cache?.vacations || [];
  }

  async getInterleaved(limit?: number): Promise<PelikanOffer[]> {
    const [flights, vacations] = await Promise.all([
      this.getFlights(),
      this.getVacations(),
    ]);

    // Interleave offers to maintain 50/50 ratio
    const interleaved: PelikanOffer[] = [];
    const maxLength = Math.max(flights.length, vacations.length);

    for (let i = 0; i < maxLength; i++) {
      if (i < flights.length) {
        interleaved.push(flights[i]);
      }
      if (i < vacations.length) {
        interleaved.push(vacations[i]);
      }
    }

    return limit ? interleaved.slice(0, limit) : interleaved;
  }

  getCacheStatus() {
    return {
      isCached: !!this.cache,
      lastUpdated: this.cache?.lastUpdated,
      flightsCount: this.cache?.flights.length || 0,
      vacationsCount: this.cache?.vacations.length || 0,
      isRefreshing: this.isRefreshing,
    };
  }

  cleanup() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}

// Singleton instance
export const pelikanCache = new PelikanCacheService();
