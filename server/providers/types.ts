export type FlightProviderKey = "pelikan" | "skyscanner" | "kayak" | "kiwi" | string;

export interface NormalizedFlightOffer {
  provider: FlightProviderKey;
  externalOfferId: string;
  origin: string; // IATA code
  destination: string; // IATA code
  departureDate: string | null; // ISO Date String
  returnDate: string | null; // ISO Date String
  price: number;
  currency: string;
  deeplink: string;
  sourceUpdatedAt: number | null; // When the source claims it was updated (unix ms)
  fetchedAt: number; // When we actually downloaded the data (unix ms)
  firstSeenAt: number; // When we first discovered this specific offer (unix ms)
  lastSeenAt: number; // When we last verified this offer existed (unix ms)
  status: "active" | "stale" | "expired" | "invalid";
  naturalKey: string; // Deterministic hash of immutable properties (origin, dest, dates, airline, provider)
  rawPayloadHash: string; // Hash of the raw payload to detect changes
  airline?: string; // Carrier code
}

export interface ProviderSnapshot {
  provider: FlightProviderKey;
  timestamp: number;
  rawItems: any[]; // The un-normalized items from the feed
  metadata?: any;
}

export interface FlightOfferProvider {
  key: FlightProviderKey;
  
  /**
   * Fetches the latest data from the provider's remote source
   * Should handle timeouts, limits, and retries.
   */
  fetch(): Promise<ProviderSnapshot>;

  /**
   * Normalizes the raw snapshot items into our unified format
   */
  normalize(snapshot: ProviderSnapshot): Promise<NormalizedFlightOffer[]>;
}
