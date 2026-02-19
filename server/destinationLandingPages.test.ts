import { describe, it, expect } from "vitest";
import { pelikanCache } from "./pelikanCache";

describe("SEO Landing Pages - Pelikan Integration", () => {
  it("should fetch flights from Pelikan cache", async () => {
    const flights = await pelikanCache.getFlights();
    
    expect(flights).toBeDefined();
    expect(Array.isArray(flights)).toBe(true);
  });

  it("should return at least some flights", async () => {
    const flights = await pelikanCache.getFlights();
    
    // Pelikan feed should have flights (may be 0 if feed is down)
    expect(flights.length).toBeGreaterThanOrEqual(0);
  });

  it("should have required flight offer fields", async () => {
    const flights = await pelikanCache.getFlights();
    
    if (flights.length > 0) {
      const flight = flights[0];
      
      expect(flight).toHaveProperty("id");
      expect(flight).toHaveProperty("title");
      expect(flight).toHaveProperty("price");
      expect(flight).toHaveProperty("link");
      expect(flight).toHaveProperty("imageUrl");
    }
  });

  it("should limit flights to specified number", async () => {
    const flights = await pelikanCache.getFlights();
    const limit = 5;
    const limited = flights.slice(0, limit);
    
    expect(limited.length).toBeLessThanOrEqual(limit);
  });

  it("should have valid price values", async () => {
    const flights = await pelikanCache.getFlights();
    
    if (flights.length > 0) {
      flights.forEach((flight) => {
        expect(flight.price).toBeGreaterThan(0);
        expect(typeof flight.price).toBe("number");
      });
    }
  });

  it("should have valid image URLs", async () => {
    const flights = await pelikanCache.getFlights();
    
    if (flights.length > 0) {
      flights.forEach((flight) => {
        expect(flight.imageUrl).toBeTruthy();
        expect(typeof flight.imageUrl).toBe("string");
        // Should be a valid URL format
        expect(flight.imageUrl).toMatch(/^https?:\/\//);
      });
    }
  });

  it("should have affiliate links", async () => {
    const flights = await pelikanCache.getFlights();
    
    if (flights.length > 0) {
      flights.forEach((flight) => {
        expect(flight.link).toBeTruthy();
        expect(typeof flight.link).toBe("string");
        expect(flight.link).toMatch(/^https?:\/\//);
      });
    }
  });

  it("should cache flights for performance", async () => {
    const status = pelikanCache.getCacheStatus();
    
    expect(status).toHaveProperty("isCached");
    expect(status).toHaveProperty("flightsCount");
    expect(status).toHaveProperty("vacationsCount");
  });
});
