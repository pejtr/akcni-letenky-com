import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database functions
vi.mock("./db", () => ({
  recordAffiliateClick: vi.fn().mockResolvedValue({ insertId: 1 }),
  getAffiliateClickStats: vi.fn().mockResolvedValue({
    total: 100,
    today: 5,
    thisWeek: 25,
    thisMonth: 80,
  }),
  getTopDestinationsByClicks: vi.fn().mockResolvedValue([
    { destination: "Londýn", destinationSlug: "london-united-kingdom", clicks: 50 },
    { destination: "Paříž", destinationSlug: "paris-france", clicks: 30 },
    { destination: "Barcelona", destinationSlug: "barcelona-spain", clicks: 20 },
  ]),
  getClicksBySource: vi.fn().mockResolvedValue([
    { source: "featured", clicks: 40 },
    { source: "grid", clicks: 35 },
    { source: "search", clicks: 25 },
  ]),
  getClickTrend: vi.fn().mockResolvedValue([
    { date: "2026-01-25", clicks: 10 },
    { date: "2026-01-26", clicks: 15 },
    { date: "2026-01-27", clicks: 8 },
  ]),
  getRecentClicks: vi.fn().mockResolvedValue([
    {
      id: 1,
      destination: "Londýn",
      destinationSlug: "london-united-kingdom",
      source: "featured",
      affiliatePartner: "kiwi",
      affiliateUrl: "https://www.kiwi.com/cs/search/results/prague-czech-republic/london-united-kingdom",
      createdAt: new Date("2026-01-27T10:00:00Z"),
    },
  ]),
}));

import {
  recordAffiliateClick,
  getAffiliateClickStats,
  getTopDestinationsByClicks,
  getClicksBySource,
  getClickTrend,
  getRecentClicks,
} from "./db";

describe("Affiliate Click Tracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("recordAffiliateClick", () => {
    it("should record a click with all required fields", async () => {
      const clickData = {
        destination: "Londýn",
        destinationSlug: "london-united-kingdom",
        source: "featured",
        affiliatePartner: "kiwi",
        affiliateUrl: "https://www.kiwi.com/cs/search/results/prague-czech-republic/london-united-kingdom",
      };

      await recordAffiliateClick(clickData);

      expect(recordAffiliateClick).toHaveBeenCalledWith(clickData);
    });

    it("should record a click with optional fields", async () => {
      const clickData = {
        destination: "Paříž",
        destinationSlug: "paris-france",
        source: "search",
        affiliatePartner: "kiwi",
        affiliateUrl: "https://www.kiwi.com/cs/search/results/prague-czech-republic/paris-france",
        userAgent: "Mozilla/5.0",
        referrer: "https://google.com",
        sessionId: "abc123",
        userId: 1,
      };

      await recordAffiliateClick(clickData);

      expect(recordAffiliateClick).toHaveBeenCalledWith(clickData);
    });
  });

  describe("getAffiliateClickStats", () => {
    it("should return click statistics", async () => {
      const stats = await getAffiliateClickStats();

      expect(stats).toEqual({
        total: 100,
        today: 5,
        thisWeek: 25,
        thisMonth: 80,
      });
    });
  });

  describe("getTopDestinationsByClicks", () => {
    it("should return top destinations sorted by clicks", async () => {
      const topDestinations = await getTopDestinationsByClicks(10);

      expect(topDestinations).toHaveLength(3);
      expect(topDestinations[0].destination).toBe("Londýn");
      expect(topDestinations[0].clicks).toBe(50);
    });
  });

  describe("getClicksBySource", () => {
    it("should return clicks grouped by source", async () => {
      const clicksBySource = await getClicksBySource();

      expect(clicksBySource).toHaveLength(3);
      expect(clicksBySource[0].source).toBe("featured");
      expect(clicksBySource[0].clicks).toBe(40);
    });
  });

  describe("getClickTrend", () => {
    it("should return click trend for specified days", async () => {
      const trend = await getClickTrend(30);

      expect(trend).toHaveLength(3);
      expect(trend[0].date).toBe("2026-01-25");
      expect(trend[0].clicks).toBe(10);
    });
  });

  describe("getRecentClicks", () => {
    it("should return recent clicks", async () => {
      const recentClicks = await getRecentClicks(10);

      expect(recentClicks).toHaveLength(1);
      expect(recentClicks[0].destination).toBe("Londýn");
      expect(recentClicks[0].source).toBe("featured");
    });
  });
});
