import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "./db";
import {
  trackPageView,
  getSessionHistory,
  getPersonalizedRecommendations,
  getPopularDestinations,
} from "./browsingHistory";

describe("Browsing History Module", () => {
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
      groupBy: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
    };
    (getDb as any).mockResolvedValue(mockDb);
  });

  describe("trackPageView", () => {
    it("should record a page view", async () => {
      await trackPageView({
        sessionId: "test-session",
        destination: "Londýn",
        destinationSlug: "london-united-kingdom",
        price: 733,
        source: "homepage",
      });

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
    });

    it("should handle missing optional fields", async () => {
      await trackPageView({
        sessionId: "test-session",
        destination: "Londýn",
        destinationSlug: "london-united-kingdom",
      });

      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("should not throw when database is not available", async () => {
      (getDb as any).mockResolvedValue(null);

      // Should not throw
      await trackPageView({
        sessionId: "test-session",
        destination: "Londýn",
        destinationSlug: "london-united-kingdom",
      });
    });
  });

  describe("getSessionHistory", () => {
    it("should return browsing history for a session", async () => {
      const mockHistory = [
        { destination: "Londýn", destinationSlug: "london-united-kingdom" },
        { destination: "Paříž", destinationSlug: "paris-france" },
      ];
      mockDb.limit.mockResolvedValueOnce(mockHistory);

      const result = await getSessionHistory("test-session");
      expect(mockDb.select).toHaveBeenCalled();
    });

    it("should return empty array when database is not available", async () => {
      (getDb as any).mockResolvedValue(null);
      const result = await getSessionHistory("test-session");
      expect(result).toEqual([]);
    });
  });

  describe("getPersonalizedRecommendations", () => {
    it("should return default recommendations for new users (no history)", async () => {
      mockDb.limit.mockResolvedValueOnce([]); // No browsing history

      const result = await getPersonalizedRecommendations("new-session", 6);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(6);
      
      // Each recommendation should have required fields
      for (const rec of result) {
        expect(rec).toHaveProperty("destination");
        expect(rec).toHaveProperty("destinationSlug");
        expect(rec).toHaveProperty("score");
        expect(rec).toHaveProperty("reason");
        expect(rec).toHaveProperty("estimatedPrice");
        expect(rec.estimatedPrice).toBeGreaterThan(0);
      }
    });

    it("should return personalized recommendations based on history", async () => {
      const mockHistory = [
        { destination: "Londýn", destinationSlug: "london-united-kingdom" },
        { destination: "Paříž", destinationSlug: "paris-france" },
      ];
      mockDb.limit.mockResolvedValueOnce(mockHistory);

      const result = await getPersonalizedRecommendations("returning-session", 6);
      expect(result.length).toBeGreaterThan(0);
      
      // Should not recommend already viewed destinations
      const viewedSlugs = new Set(mockHistory.map(h => h.destinationSlug));
      for (const rec of result) {
        expect(viewedSlugs.has(rec.destinationSlug)).toBe(false);
      }
    });

    it("should respect the limit parameter", async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await getPersonalizedRecommendations("test-session", 3);
      expect(result.length).toBeLessThanOrEqual(3);
    });
  });

  describe("getPopularDestinations", () => {
    it("should return popular destinations aggregated by view count", async () => {
      const mockPopular = [
        { destination: "Londýn", destinationSlug: "london-united-kingdom", viewCount: 150 },
        { destination: "Paříž", destinationSlug: "paris-france", viewCount: 120 },
      ];
      mockDb.limit.mockResolvedValueOnce(mockPopular);

      const result = await getPopularDestinations(10);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.groupBy).toHaveBeenCalled();
    });

    it("should return empty array when database is not available", async () => {
      (getDb as any).mockResolvedValue(null);
      const result = await getPopularDestinations();
      expect(result).toEqual([]);
    });
  });
});
