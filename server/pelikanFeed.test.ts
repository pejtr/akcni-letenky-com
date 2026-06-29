import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();

const mockFlightsXml = `<?xml version="1.0" encoding="UTF-8"?>
<SERVER>
  <Calendar>
    <Calendar>
      <CALENDAR_ID>LCC-1996</CALENDAR_ID>
      <URL>https://www.pelikan.cz/akcni-letenka/LCC-1996</URL>
      <IMAGE_580x400>https://cdn.pelikan.sk/photos/BCN/BCN-580x400.jpg</IMAGE_580x400>
      <PRICE>1038</PRICE>
      <TO>Barcelona</TO>
      <FROM>Bratislava</FROM>
      <AIRLINE>W6</AIRLINE>
      <DEPARTURE_IATA>BTS</DEPARTURE_IATA>
      <DESTINATION_IATA>BCN</DESTINATION_IATA>
    </Calendar>
  </Calendar>
</SERVER>`;

const mockVacationsXml = `<?xml version="1.0" encoding="UTF-8"?>
<dealDiscountList>
  <dealDiscounts>
    <dealDiscounts>
      <dealName>Wellness pobyt v hotelu</dealName>
      <shortDescription>Golfovy resort, vstup do wellness v cene</shortDescription>
      <price>1890</price>
      <priceBeforeDiscount>3000</priceBeforeDiscount>
      <length>3</length>
      <dealUrl>https://www.pelikan.cz//pobyt/kurim-hotel-kaskada</dealUrl>
      <city>Brno</city>
      <region>Stredni Morava</region>
      <country>Ceska republika</country>
      <images>
        <images>https://cdn.pelikan.sk/hotel.jpg</images>
      </images>
      <discount>30.00</discount>
    </dealDiscounts>
  </dealDiscounts>
</dealDiscountList>`;

async function importFeedModule() {
  vi.resetModules();
  vi.stubGlobal("fetch", mockFetch);
  const mod = await import("./pelikanFeed");
  mod.__resetPelikanFeedCacheForTests();
  return mod;
}

describe("Pelikan Feed Parser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches flight offers from the Pelikan xmlpromo feed", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockFlightsXml),
    });

    const { fetchFlights, PELIKAN_FLIGHT_FEED_URL } = await importFeedModule();
    const flights = await fetchFlights(10);

    expect(mockFetch).toHaveBeenCalledWith(
      PELIKAN_FLIGHT_FEED_URL,
      expect.objectContaining({
        headers: expect.objectContaining({ Accept: "application/xml, text/xml" }),
      })
    );
    expect(flights).toHaveLength(1);
    expect(flights[0]).toMatchObject({
      id: "lcc-1996",
      destination: "Barcelona",
      departure: "Bratislava",
      salePrice: 1038,
      airline: "W6",
      type: "flight",
    });
    expect(flights[0].link).toContain("www.pelikan.cz/akcni-letenka/LCC-1996");
    expect(flights[0].link).toContain("a_aid=levne-letenky");
    expect(flights[0].link).toContain("utm_campaign=flight-feed");
  });

  it("fetches vacation offers from the Pelikan deals feed", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockVacationsXml),
    });

    const { fetchVacations, PELIKAN_VACATION_FEED_URL } = await importFeedModule();
    const vacations = await fetchVacations(10);

    expect(mockFetch).toHaveBeenCalledWith(
      PELIKAN_VACATION_FEED_URL,
      expect.objectContaining({
        headers: expect.objectContaining({ Accept: "application/xml, text/xml" }),
      })
    );
    expect(vacations).toHaveLength(1);
    expect(vacations[0]).toMatchObject({
      id: "kurim-hotel-kaskada",
      title: "Wellness pobyt v hotelu",
      destination: "Brno",
      country: "Ceska republika",
      price: 3000,
      salePrice: 1890,
      discount: 30,
      type: "vacation",
    });
    expect(vacations[0].link).toContain("www.pelikan.cz/pobyt/kurim-hotel-kaskada");
    expect(vacations[0].link).toContain("a_aid=levne-letenky");
    expect(vacations[0].link).toContain("utm_campaign=vacation-feed");
  });

  it("handles fetch errors gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { fetchFlights } = await importFeedModule();
    await expect(fetchFlights(10)).resolves.toEqual([]);
  });

  it("returns cache status for both Pelikan feeds", async () => {
    const { getCacheStatus } = await importFeedModule();
    const status = getCacheStatus();

    expect(status.flights).toMatchObject({
      count: 0,
      cached: false,
      feedUrl: expect.stringContaining("xmlpromo"),
    });
    expect(status.vacations).toMatchObject({
      count: 0,
      cached: false,
      feedUrl: expect.stringContaining("deals/discount/deals"),
    });
  });
});
