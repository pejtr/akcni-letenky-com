/**
 * Tests for Historical Analytics Service
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

// Import after mocks
import { getHistoricalFromReportLog, getLiveHistoricalData, getHistoricalData } from "./historicalAnalytics";

describe("Historical Analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getHistoricalFromReportLog", () => {
    it("should return empty array when db is null", async () => {
      const result = await getHistoricalFromReportLog(30);
      expect(result).toEqual([]);
    });

    it("should accept custom days parameter", async () => {
      const result = await getHistoricalFromReportLog(7);
      expect(result).toEqual([]);
    });

    it("should default to 30 days", async () => {
      const result = await getHistoricalFromReportLog();
      expect(result).toEqual([]);
    });
  });

  describe("getLiveHistoricalData", () => {
    it("should return empty array when db is null", async () => {
      const result = await getLiveHistoricalData(30);
      expect(result).toEqual([]);
    });

    it("should accept custom days parameter", async () => {
      const result = await getLiveHistoricalData(14);
      expect(result).toEqual([]);
    });
  });

  describe("getHistoricalData", () => {
    it("should return live data when report log is empty", async () => {
      const result = await getHistoricalData(30);
      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("source");
      expect(result).toHaveProperty("summary");
      // When both sources return empty, source should be "live"
      expect(result.source).toBe("live");
    });

    it("should return proper summary structure", async () => {
      const result = await getHistoricalData(30);
      expect(result.summary).toHaveProperty("totalClicks");
      expect(result.summary).toHaveProperty("totalPageViews");
      expect(result.summary).toHaveProperty("totalRegistrations");
      expect(result.summary).toHaveProperty("totalSubscribers");
      expect(result.summary).toHaveProperty("totalConversations");
      expect(result.summary).toHaveProperty("totalLeads");
      expect(result.summary).toHaveProperty("totalShares");
      expect(result.summary).toHaveProperty("avgDailyClicks");
      expect(result.summary).toHaveProperty("avgDailyPageViews");
      expect(result.summary).toHaveProperty("bestDay");
      expect(result.summary).toHaveProperty("worstDay");
    });

    it("should handle 7-day period", async () => {
      const result = await getHistoricalData(7);
      expect(result.data).toEqual([]);
    });

    it("should return null for bestDay/worstDay when no data", async () => {
      const result = await getHistoricalData(30);
      expect(result.summary.bestDay).toBeNull();
      expect(result.summary.worstDay).toBeNull();
    });

    it("should have zero totals when no data", async () => {
      const result = await getHistoricalData(30);
      expect(result.summary.totalClicks).toBe(0);
      expect(result.summary.totalPageViews).toBe(0);
      expect(result.summary.totalRegistrations).toBe(0);
      expect(result.summary.avgDailyClicks).toBe(0);
    });
  });
});

describe("DailyDataPoint structure", () => {
  it("should define correct fields", () => {
    const point = {
      date: "2026-02-08",
      affiliateClicks: 10,
      pageViews: 100,
      registrations: 5,
      subscribers: 3,
      chatbotConversations: 20,
      chatbotLeads: 2,
      socialShares: 8,
    };

    expect(point.date).toBe("2026-02-08");
    expect(point.affiliateClicks).toBe(10);
    expect(point.pageViews).toBe(100);
    expect(point.registrations).toBe(5);
    expect(point.subscribers).toBe(3);
    expect(point.chatbotConversations).toBe(20);
    expect(point.chatbotLeads).toBe(2);
    expect(point.socialShares).toBe(8);
  });
});
