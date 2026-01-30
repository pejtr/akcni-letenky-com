import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { pelikanCache } from "./pelikanCache";
import * as pelikanFeed from "./pelikanFeed";

// Mock pelikanFeed module
vi.mock("./pelikanFeed", () => ({
  fetchFlights: vi.fn(),
  fetchVacations: vi.fn(),
}));

describe("PelikanCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset cache state by accessing private property (for testing only)
    (pelikanCache as any).cache = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getFlights", () => {
    it("should return cached flights when cache is populated", async () => {
      const mockFlights = [
        {
          id: "1",
          title: "Praha → Londýn",
          description: "Test flight",
          link: "https://example.com",
          imageUrl: "https://example.com/image.jpg",
          price: 1000,
          salePrice: 800,
          country: "UK",
          destination: "Londýn",
          departure: "Praha",
          discount: "-20%",
          type: "flight" as const,
        },
      ];

      vi.mocked(pelikanFeed.fetchFlights).mockResolvedValue(mockFlights);
      vi.mocked(pelikanFeed.fetchVacations).mockResolvedValue([]);

      // Force cache refresh
      await pelikanCache.refreshCache();

      const flights = await pelikanCache.getFlights();
      expect(flights).toEqual(mockFlights);
      expect(pelikanFeed.fetchFlights).toHaveBeenCalledTimes(1);
    });

    it("should fetch live data when cache is empty", async () => {
      const mockFlights = [
        {
          id: "2",
          title: "Praha → Paříž",
          description: "Test flight 2",
          link: "https://example.com",
          imageUrl: "https://example.com/image2.jpg",
          price: 1200,
          salePrice: 900,
          country: "France",
          destination: "Paříž",
          departure: "Praha",
          discount: "-25%",
          type: "flight" as const,
        },
      ];

      // Clear previous mock calls
      vi.clearAllMocks();
      vi.mocked(pelikanFeed.fetchFlights).mockResolvedValue(mockFlights);
      vi.mocked(pelikanFeed.fetchVacations).mockResolvedValue([]);

      const flights = await pelikanCache.getFlights();
      expect(flights).toHaveLength(1);
      expect(flights[0].id).toBe("2");
    });
  });

  describe("getVacations", () => {
    it("should return cached vacations when cache is populated", async () => {
      const mockVacations = [
        {
          id: "1",
          title: "Dovolená v Řecku",
          description: "Test vacation",
          link: "https://example.com",
          imageUrl: "https://example.com/vacation.jpg",
          price: 15000,
          salePrice: 12000,
          country: "Řecko",
          destination: "Santorini",
          location: "Santorini",
          duration: "7 nocí",
          type: "vacation" as const,
        },
      ];

      vi.mocked(pelikanFeed.fetchFlights).mockResolvedValue([]);
      vi.mocked(pelikanFeed.fetchVacations).mockResolvedValue(mockVacations);

      // Force cache refresh
      await pelikanCache.refreshCache();

      const vacations = await pelikanCache.getVacations();
      expect(vacations).toEqual(mockVacations);
      expect(pelikanFeed.fetchVacations).toHaveBeenCalledTimes(1);
    });
  });

  describe("getInterleaved", () => {
    it("should interleave flights and vacations in 50/50 ratio", async () => {
      const mockFlights = [
        {
          id: "f1",
          title: "Flight 1",
          description: "Test",
          link: "https://example.com",
          imageUrl: "https://example.com/f1.jpg",
          price: 1000,
          salePrice: 800,
          country: "UK",
          destination: "Londýn",
          departure: "Praha",
          discount: "-20%",
          type: "flight" as const,
        },
        {
          id: "f2",
          title: "Flight 2",
          description: "Test",
          link: "https://example.com",
          imageUrl: "https://example.com/f2.jpg",
          price: 1200,
          salePrice: 900,
          country: "France",
          destination: "Paříž",
          departure: "Praha",
          discount: "-25%",
          type: "flight" as const,
        },
      ];

      const mockVacations = [
        {
          id: "v1",
          title: "Vacation 1",
          description: "Test",
          link: "https://example.com",
          imageUrl: "https://example.com/v1.jpg",
          price: 15000,
          salePrice: 12000,
          country: "Řecko",
          destination: "Santorini",
          location: "Santorini",
          duration: "7 nocí",
          type: "vacation" as const,
        },
        {
          id: "v2",
          title: "Vacation 2",
          description: "Test",
          link: "https://example.com",
          imageUrl: "https://example.com/v2.jpg",
          price: 18000,
          salePrice: 14000,
          country: "Itálie",
          destination: "Řím",
          location: "Řím",
          duration: "5 nocí",
          type: "vacation" as const,
        },
      ];

      vi.mocked(pelikanFeed.fetchFlights).mockResolvedValue(mockFlights);
      vi.mocked(pelikanFeed.fetchVacations).mockResolvedValue(mockVacations);

      await pelikanCache.refreshCache();

      const interleaved = await pelikanCache.getInterleaved();

      // Should alternate: flight, vacation, flight, vacation
      expect(interleaved).toHaveLength(4);
      expect(interleaved[0].id).toBe("f1");
      expect(interleaved[1].id).toBe("v1");
      expect(interleaved[2].id).toBe("f2");
      expect(interleaved[3].id).toBe("v2");
    });

    it("should respect limit parameter", async () => {
      const mockFlights = [
        {
          id: "f1",
          title: "Flight 1",
          description: "Test",
          link: "https://example.com",
          imageUrl: "https://example.com/f1.jpg",
          price: 1000,
          salePrice: 800,
          country: "UK",
          destination: "Londýn",
          departure: "Praha",
          discount: "-20%",
          type: "flight" as const,
        },
      ];

      const mockVacations = [
        {
          id: "v1",
          title: "Vacation 1",
          description: "Test",
          link: "https://example.com",
          imageUrl: "https://example.com/v1.jpg",
          price: 15000,
          salePrice: 12000,
          country: "Řecko",
          destination: "Santorini",
          location: "Santorini",
          duration: "7 nocí",
          type: "vacation" as const,
        },
      ];

      vi.mocked(pelikanFeed.fetchFlights).mockResolvedValue(mockFlights);
      vi.mocked(pelikanFeed.fetchVacations).mockResolvedValue(mockVacations);

      await pelikanCache.refreshCache();

      const interleaved = await pelikanCache.getInterleaved(1);
      expect(interleaved).toHaveLength(1);
    });
  });

  describe("getCacheStatus", () => {
    it("should return cache status with correct metadata", async () => {
      const mockFlights = [
        {
          id: "1",
          title: "Test",
          description: "Test",
          link: "https://example.com",
          imageUrl: "https://example.com/image.jpg",
          price: 1000,
          salePrice: 800,
          country: "UK",
          destination: "Londýn",
          departure: "Praha",
          discount: "-20%",
          type: "flight" as const,
        },
      ];

      const mockVacations = [
        {
          id: "1",
          title: "Test",
          description: "Test",
          link: "https://example.com",
          imageUrl: "https://example.com/vacation.jpg",
          price: 15000,
          salePrice: 12000,
          country: "Řecko",
          destination: "Santorini",
          location: "Santorini",
          duration: "7 nocí",
          type: "vacation" as const,
        },
      ];

      vi.mocked(pelikanFeed.fetchFlights).mockResolvedValue(mockFlights);
      vi.mocked(pelikanFeed.fetchVacations).mockResolvedValue(mockVacations);

      await pelikanCache.refreshCache();

      const status = pelikanCache.getCacheStatus();

      expect(status.isCached).toBe(true);
      expect(status.flightsCount).toBe(1);
      expect(status.vacationsCount).toBe(1);
      expect(status.lastUpdated).toBeInstanceOf(Date);
      expect(status.isRefreshing).toBe(false);
    });
  });
});
