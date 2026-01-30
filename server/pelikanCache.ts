import { fetchFlights, fetchVacations } from "./pelikanFeed";
import type { FlightOffer, VacationOffer } from "./pelikanFeed";

type PelikanOffer = FlightOffer | VacationOffer;

interface CacheEntry {
  flights: PelikanOffer[];
  vacations: PelikanOffer[];
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
      const [flights, vacations] = await Promise.all([
        fetchFlights(true), // Force refresh
        fetchVacations(true), // Force refresh
      ]);

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

  async getFlights(): Promise<PelikanOffer[]> {
    // If cache is empty, try to refresh
    if (!this.cache) {
      console.log("[PelikanCache] Cache miss, fetching live data...");
      try {
        await this.refreshCache();
      } catch (error) {
        console.error("[PelikanCache] Failed to fetch live data:", error);
        // Fallback to live API
        return await fetchFlights();
      }
    }

    return this.cache?.flights || [];
  }

  async getVacations(): Promise<PelikanOffer[]> {
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
