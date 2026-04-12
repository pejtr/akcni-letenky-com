/**
 * Travelpayouts Flight Prices Cache
 * Fetches cheapest flights from Prague (PRG) using Travelpayouts Data API v1
 * Cache refreshes every 24 hours at midnight (server-side, instant for users)
 */

import { ENV } from "./_core/env";

export interface CheapFlight {
  destination: string; // IATA code e.g. "LHR"
  price: number;       // Price in CZK
  airline: string;     // IATA airline code
  departureAt: string; // ISO date string
  expiresAt: string;   // ISO date string
}

interface TpApiResponse {
  success: boolean;
  data: Record<string, Record<string, {
    price: number;
    airline: string;
    flight_number: number;
    departure_at: string;
    return_at: string;
    expires_at: string;
  }>>;
  error?: string;
}

// In-memory cache
let cachedPrices: CheapFlight[] = [];
let lastFetchedAt: Date | null = null;
let isFetching = false;

// Destination IATA → Czech city name mapping
const DEST_NAMES: Record<string, string> = {
  LHR: "Londýn",
  LGW: "Londýn",
  STN: "Londýn",
  CDG: "Paříž",
  ORY: "Paříž",
  FCO: "Řím",
  CIA: "Řím",
  BCN: "Barcelona",
  MAD: "Madrid",
  AMS: "Amsterdam",
  VIE: "Vídeň",
  BER: "Berlín",
  DXB: "Dubaj",
  JFK: "New York",
  EWR: "New York",
  BKK: "Bangkok",
  HAN: "Hanoi",
  SGN: "Ho Či Minovo Město",
  LIS: "Lisabon",
  ATH: "Atény",
  HAV: "Havana",
  MLE: "Maledivy",
  AGP: "Málaga",
  MXP: "Milán",
  MAN: "Manchester",
  DUB: "Dublin",
  CPH: "Kodaň",
  OSL: "Oslo",
  ARN: "Stockholm",
  HEL: "Helsinky",
  WAW: "Varšava",
  BUD: "Budapešť",
  OTP: "Bukurešť",
  SOF: "Sofie",
  IST: "Istanbul",
  SAW: "Istanbul",
  CAI: "Káhira",
  NBO: "Nairobi",
  JNB: "Johannesburg",
  SYD: "Sydney",
  MEL: "Melbourne",
  LAX: "Los Angeles",
  MIA: "Miami",
  ORD: "Chicago",
  YYZ: "Toronto",
  GRU: "São Paulo",
  EZE: "Buenos Aires",
  MEX: "Mexico City",
  NRT: "Tokio",
  HND: "Tokio",
  PEK: "Peking",
  PVG: "Šanghaj",
  HKG: "Hongkong",
  SIN: "Singapur",
  KUL: "Kuala Lumpur",
  DEL: "Dillí",
  BOM: "Bombaj",
  CMB: "Srí Lanka",
  RIX: "Riga",
  TLL: "Tallinn",
  VNO: "Vilnius",
  GDN: "Gdaňsk",
  KRK: "Krakov",
  BRU: "Brusel",
  ZRH: "Curych",
  GVA: "Ženeva",
  MRS: "Marseille",
  NCE: "Nice",
  MUC: "Mnichov",
  FRA: "Frankfurt",
  HAM: "Hamburk",
  DUS: "Düsseldorf",
  PMI: "Mallorca",
  IBZ: "Ibiza",
  TFS: "Tenerife",
  LPA: "Gran Canaria",
  HER: "Kréta",
  RHO: "Rhodos",
  CFU: "Korfu",
  SKG: "Soluň",
  SPU: "Split",
  DBV: "Dubrovník",
  TIV: "Tivat",
  OPO: "Porto",
  FAO: "Algarve",
  RAK: "Marrákeš",
  CMN: "Casablanca",
  TUN: "Tunis",
  AYT: "Antalya",
  ADB: "Izmir",
  ESB: "Ankara",
  TLV: "Tel Aviv",
  AMM: "Ammán",
  BEY: "Bejrút",
  MCT: "Muskat",
  AUH: "Abú Dhabí",
  DOH: "Dauhá",
  KWI: "Kuvajt",
  RUH: "Rijád",
  JED: "Džidda",
  ADD: "Addis Abeba",
  DAR: "Dar es Salaam",
  LOS: "Lagos",
  ACC: "Accra",
  CMK: "Malawi",
};

/**
 * Get city name for IATA code
 */
export function getDestinationName(iata: string): string {
  return DEST_NAMES[iata] || iata;
}

/**
 * Fetch cheapest flights from Prague using Travelpayouts API
 */
async function fetchCheapFlightsFromPrague(): Promise<CheapFlight[]> {
  const token = process.env.TRAVELPAYOUTS_API_TOKEN;
  if (!token) {
    console.warn("[TpCache] TRAVELPAYOUTS_API_TOKEN not set — using empty prices");
    return [];
  }

  try {
    const url = `https://api.travelpayouts.com/v1/prices/cheap?origin=PRG&destination=-&currency=CZK&token=${token}`;
    const res = await fetch(url, {
      headers: { "X-Access-Token": token },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      console.error(`[TpCache] API error ${res.status}: ${res.statusText}`);
      return [];
    }

    const json: TpApiResponse = await res.json();
    if (!json.success || !json.data) {
      console.error("[TpCache] API returned success=false:", json.error);
      return [];
    }

    // Flatten: data is { DEST_IATA: { "0": { price, airline, ... }, "1": {...} } }
    const flights: CheapFlight[] = [];
    for (const [dest, stops] of Object.entries(json.data)) {
      // Take the cheapest stop option (key "0" = direct, "1" = 1 stop, "2" = 2 stops)
      const cheapest = Object.values(stops).sort((a, b) => a.price - b.price)[0];
      if (cheapest && cheapest.price > 0) {
        flights.push({
          destination: dest,
          price: Math.round(cheapest.price),
          airline: cheapest.airline,
          departureAt: cheapest.departure_at,
          expiresAt: cheapest.expires_at,
        });
      }
    }

    // Sort by price ascending
    flights.sort((a, b) => a.price - b.price);
    console.log(`[TpCache] Fetched ${flights.length} cheap flights from PRG`);
    return flights;

  } catch (err) {
    console.error("[TpCache] Fetch error:", err);
    return [];
  }
}

/**
 * Get cached prices (instant — served from memory)
 * Automatically refreshes in background if cache is stale (>24h)
 */
export async function getCachedCheapFlights(): Promise<CheapFlight[]> {
  const now = new Date();
  const cacheAge = lastFetchedAt ? (now.getTime() - lastFetchedAt.getTime()) : Infinity;
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  // Return cached data immediately if fresh
  if (cachedPrices.length > 0 && cacheAge < CACHE_TTL) {
    return cachedPrices;
  }

  // Refresh in background (non-blocking) if already fetching
  if (isFetching) {
    return cachedPrices; // Return stale data while refreshing
  }

  // Fetch fresh data
  isFetching = true;
  try {
    const fresh = await fetchCheapFlightsFromPrague();
    if (fresh.length > 0) {
      cachedPrices = fresh;
      lastFetchedAt = now;
    }
  } finally {
    isFetching = false;
  }

  return cachedPrices;
}

/**
 * Get cheapest flights for specific destinations (for homepage quick stats)
 */
export async function getCheapFlightsForDestinations(
  iatas: string[]
): Promise<Array<{ iata: string; name: string; price: number | null }>> {
  const all = await getCachedCheapFlights();
  const priceMap = new Map(all.map(f => [f.destination, f.price]));

  return iatas.map(iata => ({
    iata,
    name: getDestinationName(iata),
    price: priceMap.get(iata) ?? null,
  }));
}

/**
 * Schedule midnight cache refresh
 */
export function scheduleMidnightPriceRefresh(): void {
  const scheduleNext = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 5, 0, 0); // 00:05 next day
    const msUntilMidnight = midnight.getTime() - now.getTime();

    setTimeout(async () => {
      console.log("[TpCache] Midnight refresh started");
      isFetching = false; // Reset lock
      await getCachedCheapFlights();
      scheduleNext(); // Schedule next midnight
    }, msUntilMidnight);

    console.log(`[TpCache] Next price refresh in ${Math.round(msUntilMidnight / 60000)} minutes`);
  };

  // Initial fetch on startup (non-blocking)
  getCachedCheapFlights().catch(console.error);
  scheduleNext();
}
