import { createHash } from "crypto";
import { NormalizedFlightOffer } from "./types";
import { PelikanRawCalendar } from "./PelikanXmlParser";

export class PelikanOfferNormalizer {
  
  /**
   * Generates a deterministic hash for an offer ignoring volatile fields like price.
   * This is used to track the same offer across different sync runs.
   */
  private generateNaturalKey(raw: PelikanRawCalendar): string {
    const components = [
      "pelikan",
      raw.DEPARTURE_IATA || "",
      raw.DESTINATION_IATA || "",
      raw.AIRLINE || "",
      raw.URL || "" // The URL is usually a stable identifier for Pelikan (e.g. /akcni-letenka/LCC-2026)
    ];
    
    // We do NOT include PRICE in the natural key. 
    // We want price updates to map to the same natural key.
    
    return createHash("sha256").update(components.join("|")).digest("hex");
  }
  
  /**
   * Generates a hash of the raw payload to detect if ANYTHING changed (including price)
   */
  private generatePayloadHash(raw: PelikanRawCalendar): string {
    return createHash("sha256").update(JSON.stringify(raw)).digest("hex");
  }

  normalize(rawItems: PelikanRawCalendar[], fetchTime: number): NormalizedFlightOffer[] {
    const normalized: NormalizedFlightOffer[] = [];

    for (const item of rawItems) {
      try {
        // Validate required fields
        if (!item.PRICE || !item.DEPARTURE_IATA || !item.DESTINATION_IATA || !item.URL) {
          continue; // Skip malformed items
        }

        const sourceUpdatedAt = item.CREATED ? parseInt(item.CREATED.toString(), 10) : null;
        
        const offer: NormalizedFlightOffer = {
          provider: "pelikan",
          externalOfferId: item.CALENDAR_ID || "",
          origin: item.DEPARTURE_IATA,
          destination: item.DESTINATION_IATA,
          departureDate: null, // Pelikan promo feed usually doesn't provide exact dates, just a calendar link
          returnDate: null, 
          price: Number(item.PRICE),
          currency: "CZK", // Assuming CZK based on the .cz feed
          deeplink: item.URL,
          sourceUpdatedAt: isNaN(sourceUpdatedAt as number) ? null : sourceUpdatedAt,
          fetchedAt: fetchTime,
          firstSeenAt: fetchTime,
          lastSeenAt: fetchTime,
          status: "active",
          naturalKey: this.generateNaturalKey(item),
          rawPayloadHash: this.generatePayloadHash(item),
          airline: item.AIRLINE
        };

        normalized.push(offer);
      } catch (error) {
        console.error("Error normalizing Pelikan offer:", error);
        // Continue with the next item
      }
    }

    return normalized;
  }
}
