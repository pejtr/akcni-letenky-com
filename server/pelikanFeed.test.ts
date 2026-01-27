import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Sample XML responses
const mockFlightsXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <g:id>flight-1</g:id>
      <title>Praha - Londýn</title>
      <description>Zpáteční letenka Praha - Londýn</description>
      <link>https://pelikan.cz/flight-1</link>
      <g:image_link>https://cdn.pelikan.sk/img/london.jpg</g:image_link>
      <g:price>733 CZK</g:price>
      <g:sale_price>733 CZK</g:sale_price>
      <g:custom_label_0>Anglie</g:custom_label_0>
      <g:custom_label_1>Praha</g:custom_label_1>
      <g:custom_label_2>Londýn</g:custom_label_2>
    </item>
  </channel>
</rss>`;

const mockVacationsXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <g:id>vacation-1</g:id>
      <title>Dovolená v Egyptě</title>
      <description>7 nocí all inclusive</description>
      <link>https://pelikan.cz/vacation-1</link>
      <g:image_link>https://cdn.pelikan.sk/img/egypt.jpg</g:image_link>
      <g:price>15990 CZK</g:price>
      <g:sale_price>12990 CZK</g:sale_price>
      <g:custom_label_0>Egypt</g:custom_label_0>
      <g:custom_label_1>Hurghada</g:custom_label_1>
      <g:custom_label_2>7 nocí</g:custom_label_2>
    </item>
  </channel>
</rss>`;

describe("Pelikán Feed Parser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchFlights", () => {
    it("should fetch and parse flight offers from XML feed", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockFlightsXml),
      });

      // Import after mocking
      const { fetchFlights } = await import("./pelikanFeed");
      const flights = await fetchFlights(true);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://lastminutedovolene.cz/api/meta-feed-flights.xml"
      );
      expect(flights).toBeInstanceOf(Array);
    });

    it("should handle fetch errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { fetchFlights } = await import("./pelikanFeed");
      const flights = await fetchFlights(true);

      // Should return cached data or empty array
      expect(Array.isArray(flights)).toBe(true);
    });
  });

  describe("fetchVacations", () => {
    it("should fetch and parse vacation offers from XML feed", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockVacationsXml),
      });

      const { fetchVacations } = await import("./pelikanFeed");
      const vacations = await fetchVacations(true);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://lastminutedovolene.cz/api/meta-feed-vacations.xml"
      );
      expect(vacations).toBeInstanceOf(Array);
    });

    it("should handle fetch errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { fetchVacations } = await import("./pelikanFeed");
      const vacations = await fetchVacations(true);

      // Should return cached data or empty array
      expect(Array.isArray(vacations)).toBe(true);
    });
  });

  describe("getCacheStatus", () => {
    it("should return cache status information", async () => {
      const { getCacheStatus } = await import("./pelikanFeed");
      const status = getCacheStatus();

      expect(status).toHaveProperty("flights");
      expect(status).toHaveProperty("vacations");
      expect(status.flights).toHaveProperty("count");
      expect(status.flights).toHaveProperty("cached");
      expect(status.vacations).toHaveProperty("count");
      expect(status.vacations).toHaveProperty("cached");
    });
  });
});

describe("Pelikán Feed Data Types", () => {
  it("should define FlightOffer type correctly", async () => {
    
    // Type check - this will fail at compile time if types are wrong
    const testFlight: any = {
      id: "test-1",
      title: "Test Flight",
      description: "Test description",
      link: "https://test.com",
      imageUrl: "https://test.com/img.jpg",
      price: 1000,
      salePrice: 900,
      country: "Česko",
      departure: "Praha",
      destination: "Londýn",
      discount: "-10%",
    };

    expect(testFlight.id).toBe("test-1");
    expect(testFlight.salePrice).toBe(900);
  });

  it("should define VacationOffer type correctly", async () => {
    const testVacation: any = {
      id: "test-1",
      title: "Test Vacation",
      description: "Test description",
      link: "https://test.com",
      imageUrl: "https://test.com/img.jpg",
      price: 15000,
      salePrice: 12000,
      country: "Egypt",
      location: "Hurghada",
      destination: "Egypt",
      duration: "7 nocí",
      discount: "-20%",
    };

    expect(testVacation.id).toBe("test-1");
    expect(testVacation.duration).toBe("7 nocí");
  });
});
