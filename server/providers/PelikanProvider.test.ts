import { expect, test, describe } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { PelikanXmlParser } from "./PelikanXmlParser";
import { PelikanOfferNormalizer } from "./PelikanOfferNormalizer";

describe("PelikanProvider", () => {
  test("successfully parses and normalizes real XML fixture", () => {
    const xmlContent = readFileSync(
      join(__dirname, "__fixtures__", "pelikan-sample.xml"),
      "utf-8"
    );

    const parser = new PelikanXmlParser();
    const rawItems = parser.parse(xmlContent);

    expect(Array.isArray(rawItems)).toBe(true);
    expect(rawItems.length).toBe(650);

    const normalizer = new PelikanOfferNormalizer();
    const fetchTime = Date.now();
    const normalized = normalizer.normalize(rawItems, fetchTime);

    // 643 valid offers normalized (7 items skipped due to missing mandatory IATA/URL fields)
    expect(normalized.length).toBe(643);
    expect(normalized.length).toBeLessThanOrEqual(rawItems.length);
    
    const firstOffer = normalized[0];
    expect(firstOffer).toBeDefined();
    if (firstOffer) {
      expect(firstOffer.provider).toBe("pelikan");
      expect(firstOffer.externalOfferId).toBeTruthy();
      expect(firstOffer.origin).toBeTruthy();
      expect(firstOffer.destination).toBeTruthy();
      expect(typeof firstOffer.price).toBe("number");
      expect(firstOffer.currency).toBe("CZK");
      expect(firstOffer.naturalKey).toBeTruthy();
      expect(firstOffer.rawPayloadHash).toBeTruthy();
      expect(firstOffer.fetchedAt).toBe(fetchTime);
      expect(firstOffer.status).toBe("active");
    }
  });

  test("deterministic natural key: price changes do NOT change naturalKey", () => {
    const normalizer = new PelikanOfferNormalizer();
    const fetchTime = Date.now();

    const raw1 = {
      CALENDAR_ID: "TEST-1",
      URL: "https://www.pelikan.cz/akcni-letenka/TEST-1",
      PRICE: 1490,
      DEPARTURE_IATA: "PRG",
      DESTINATION_IATA: "CTA",
      AIRLINE: "W6",
    };

    const raw2 = {
      CALENDAR_ID: "TEST-1",
      URL: "https://www.pelikan.cz/akcni-letenka/TEST-1",
      PRICE: 1290, // price changed
      DEPARTURE_IATA: "PRG",
      DESTINATION_IATA: "CTA",
      AIRLINE: "W6",
    };

    const [offer1] = normalizer.normalize([raw1], fetchTime);
    const [offer2] = normalizer.normalize([raw2], fetchTime);

    expect(offer1?.naturalKey).toBe(offer2?.naturalKey);
    expect(offer1?.price).toBe(1490);
    expect(offer2?.price).toBe(1290);
    expect(offer1?.rawPayloadHash).not.toBe(offer2?.rawPayloadHash);
  });

  test("rejects DOCTYPE declaration (XXE protection)", () => {
    const maliciousXml = `<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE foo [
<!ELEMENT foo ANY >
<!ENTITY xxe SYSTEM "file:///etc/passwd" >]>
<SERVER><Calendar><PRICE>&xxe;</PRICE></Calendar></SERVER>`;

    const parser = new PelikanXmlParser();
    expect(() => parser.parse(maliciousXml)).toThrowError(/DOCTYPE/);
  });

  test("handles malformed XML properly", () => {
    const malformedXml = `<SERVER><Calendar><PRICE>1490</SERVER>`;
    const parser = new PelikanXmlParser();
    expect(() => parser.parse(malformedXml)).toThrow();
  });
});
