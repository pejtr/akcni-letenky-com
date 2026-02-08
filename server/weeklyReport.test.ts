import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  collectWeeklyMetrics,
  calculateWeekOverWeek,
  generateWeeklyReportHTML,
  generateWeeklyReportText,
  type WeeklyMetrics,
} from "./weeklyReport";

// Mock database
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe("Weekly Report Service", () => {
  const mockWeeklyMetrics: WeeklyMetrics = {
    weekLabel: "3. února - 9. února 2026",
    period: {
      start: new Date("2026-02-03"),
      end: new Date("2026-02-09"),
    },
    dailyBreakdown: [
      {
        date: "2026-02-03",
        metrics: {
          date: "2026-02-03",
          period: { start: new Date("2026-02-03"), end: new Date("2026-02-04") },
          affiliateClicks: 50,
          affiliateClicksBySource: { homepage: 30, search: 20 },
          topDestinations: [{ destination: "Barcelona", clicks: 25 }],
          activePriceAlerts: 10,
          priceAlertNotificationsSent: 5,
          priceAlertEmailsSent: 3,
          priceAlertEmailsFailed: 0,
          socialShares: 8,
          socialSharesByPlatform: { facebook: 5, twitter: 3 },
          newRegistrations: 3,
          totalUsers: 100,
          newSubscribers: 2,
          totalSubscribers: 50,
          chatbotConversations: 12,
          chatbotLeads: 2,
          pageViews: 200,
          uniqueSessions: 80,
        },
      },
      {
        date: "2026-02-04",
        metrics: {
          date: "2026-02-04",
          period: { start: new Date("2026-02-04"), end: new Date("2026-02-05") },
          affiliateClicks: 75,
          affiliateClicksBySource: { homepage: 45, search: 30 },
          topDestinations: [{ destination: "Řím", clicks: 40 }],
          activePriceAlerts: 12,
          priceAlertNotificationsSent: 8,
          priceAlertEmailsSent: 6,
          priceAlertEmailsFailed: 1,
          socialShares: 15,
          socialSharesByPlatform: { facebook: 10, twitter: 5 },
          newRegistrations: 5,
          totalUsers: 105,
          newSubscribers: 4,
          totalSubscribers: 54,
          chatbotConversations: 18,
          chatbotLeads: 4,
          pageViews: 350,
          uniqueSessions: 120,
        },
      },
    ],
    totalAffiliateClicks: 125,
    totalPageViews: 550,
    totalNewRegistrations: 8,
    totalNewSubscribers: 6,
    totalChatbotConversations: 30,
    totalChatbotLeads: 6,
    totalSocialShares: 23,
    totalPriceAlertNotifications: 13,
    totalEmailsSent: 9,
    avgDailyClicks: 63,
    avgDailyPageViews: 275,
    topDestinations: [
      { destination: "Řím", clicks: 40 },
      { destination: "Barcelona", clicks: 25 },
    ],
    bestDay: { date: "2026-02-04", clicks: 75 },
    worstDay: { date: "2026-02-03", clicks: 50 },
  };

  const mockPreviousWeekMetrics: WeeklyMetrics = {
    ...mockWeeklyMetrics,
    weekLabel: "27. ledna - 2. února 2026",
    totalAffiliateClicks: 100,
    totalPageViews: 400,
    totalNewRegistrations: 5,
    totalNewSubscribers: 3,
    totalChatbotConversations: 20,
    totalChatbotLeads: 3,
    totalSocialShares: 15,
  };

  describe("calculateWeekOverWeek", () => {
    it("should return null changes when no previous data", () => {
      const result = calculateWeekOverWeek(mockWeeklyMetrics, null);
      expect(result.current).toBe(mockWeeklyMetrics);
      expect(result.previous).toBeNull();
      expect(result.changes).toBeNull();
    });

    it("should calculate correct percentage changes", () => {
      const result = calculateWeekOverWeek(mockWeeklyMetrics, mockPreviousWeekMetrics);
      expect(result.changes).not.toBeNull();

      // 125 vs 100 = +25%
      expect(result.changes!.affiliateClicks.value).toBe(25);
      expect(result.changes!.affiliateClicks.percent).toBe(25);

      // 550 vs 400 = +37.5% → 38%
      expect(result.changes!.pageViews.value).toBe(150);
      expect(result.changes!.pageViews.percent).toBe(38);

      // 8 vs 5 = +60%
      expect(result.changes!.newRegistrations.value).toBe(3);
      expect(result.changes!.newRegistrations.percent).toBe(60);

      // 6 vs 3 = +100%
      expect(result.changes!.newSubscribers.value).toBe(3);
      expect(result.changes!.newSubscribers.percent).toBe(100);
    });

    it("should handle zero previous values", () => {
      const zeroPrevious = {
        ...mockPreviousWeekMetrics,
        totalAffiliateClicks: 0,
        totalPageViews: 0,
      };
      const result = calculateWeekOverWeek(mockWeeklyMetrics, zeroPrevious);
      expect(result.changes!.affiliateClicks.percent).toBe(100);
      expect(result.changes!.pageViews.percent).toBe(100);
    });

    it("should handle negative changes (decline)", () => {
      const betterPrevious = {
        ...mockPreviousWeekMetrics,
        totalAffiliateClicks: 200,
        totalPageViews: 800,
      };
      const result = calculateWeekOverWeek(mockWeeklyMetrics, betterPrevious);
      expect(result.changes!.affiliateClicks.value).toBe(-75);
      // 125/200 = 62.5%, change = -37.5%, Math.round(-37.5) = -37
      expect(result.changes!.affiliateClicks.percent).toBe(-37);
    });
  });

  describe("generateWeeklyReportHTML", () => {
    it("should generate valid HTML with weekly metrics", () => {
      const html = generateWeeklyReportHTML(mockWeeklyMetrics);
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("Týdenní souhrn");
      expect(html).toContain("125"); // total affiliate clicks
      expect(html).toContain("550"); // total page views
      expect(html).toContain("Řím"); // top destination
      expect(html).toContain("Barcelona");
    });

    it("should include comparison badges when provided", () => {
      const comparison = calculateWeekOverWeek(mockWeeklyMetrics, mockPreviousWeekMetrics);
      const html = generateWeeklyReportHTML(mockWeeklyMetrics, comparison);
      expect(html).toContain("↑"); // positive trend
      expect(html).toContain("+25%"); // affiliate clicks change
      expect(html).toContain("Srovnání s předchozím týdnem");
    });

    it("should include daily trend bars", () => {
      const html = generateWeeklyReportHTML(mockWeeklyMetrics);
      expect(html).toContain("Denní trend");
      expect(html).toContain("Průměr:");
      expect(html).toContain("63"); // avg daily clicks
    });

    it("should show best and worst days", () => {
      const html = generateWeeklyReportHTML(mockWeeklyMetrics);
      expect(html).toContain("Nejlepší den");
      expect(html).toContain("2026-02-04");
      expect(html).toContain("Nejslabší den");
      expect(html).toContain("2026-02-03");
    });
  });

  describe("generateWeeklyReportText", () => {
    it("should generate plain text report", () => {
      const text = generateWeeklyReportText(mockWeeklyMetrics);
      expect(text).toContain("Týdenní souhrn");
      expect(text).toContain("125"); // total clicks
      expect(text).toContain("Řím");
      expect(text).toContain("Průměr/den:");
    });

    it("should include trend indicators with comparison", () => {
      const comparison = calculateWeekOverWeek(mockWeeklyMetrics, mockPreviousWeekMetrics);
      const text = generateWeeklyReportText(mockWeeklyMetrics, comparison);
      expect(text).toContain("↑");
      expect(text).toContain("+25%");
    });
  });

  describe("collectWeeklyMetrics", () => {
    it("should return empty metrics when db is null", async () => {
      const start = new Date("2026-02-03");
      const end = new Date("2026-02-10");
      const metrics = await collectWeeklyMetrics(start, end);
      expect(metrics.totalAffiliateClicks).toBe(0);
      expect(metrics.totalPageViews).toBe(0);
      expect(metrics.weekLabel).toContain("2026");
    });
  });
});
