import { describe, it, expect, vi, beforeEach } from "vitest";
import { collectDailyMetrics, generateDailyReportHTML, generateDailyReportText, calculateDayOverDay, type DailyMetrics, type DayOverDayComparison } from "./dailyReport";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe("Daily Report Service", () => {
  const mockMetrics: DailyMetrics = {
    date: "2026-02-08",
    period: { start: new Date("2026-02-07"), end: new Date("2026-02-08") },
    affiliateClicks: 42,
    affiliateClicksBySource: { featured: 20, grid: 15, search: 7 },
    topDestinations: [
      { destination: "Barcelona", clicks: 12 },
      { destination: "Řím", clicks: 8 },
      { destination: "Paříž", clicks: 5 },
    ],
    activePriceAlerts: 15,
    priceAlertNotificationsSent: 3,
    priceAlertEmailsSent: 2,
    priceAlertEmailsFailed: 1,
    socialShares: 8,
    socialSharesByPlatform: { facebook: 5, whatsapp: 3 },
    newRegistrations: 4,
    totalUsers: 120,
    newSubscribers: 6,
    totalSubscribers: 350,
    chatbotConversations: 18,
    chatbotLeads: 3,
    pageViews: 250,
    uniqueSessions: 85,
  };

  const mockPreviousMetrics: DailyMetrics = {
    ...mockMetrics,
    date: "2026-02-07",
    affiliateClicks: 30,
    pageViews: 200,
    newRegistrations: 2,
    newSubscribers: 3,
    chatbotConversations: 10,
    chatbotLeads: 1,
    socialShares: 5,
    priceAlertNotificationsSent: 2,
  };

  describe("collectDailyMetrics", () => {
    it("should return default metrics when database is not available", async () => {
      const metrics = await collectDailyMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.date).toBeTruthy();
      expect(metrics.affiliateClicks).toBe(0);
      expect(metrics.pageViews).toBe(0);
      expect(metrics.newRegistrations).toBe(0);
    });

    it("should have correct metric structure", async () => {
      const metrics = await collectDailyMetrics();
      expect(metrics).toHaveProperty("date");
      expect(metrics).toHaveProperty("period");
      expect(metrics).toHaveProperty("affiliateClicks");
      expect(metrics).toHaveProperty("affiliateClicksBySource");
      expect(metrics).toHaveProperty("topDestinations");
      expect(metrics).toHaveProperty("activePriceAlerts");
      expect(metrics).toHaveProperty("priceAlertNotificationsSent");
      expect(metrics).toHaveProperty("priceAlertEmailsSent");
      expect(metrics).toHaveProperty("socialShares");
      expect(metrics).toHaveProperty("newRegistrations");
      expect(metrics).toHaveProperty("totalUsers");
      expect(metrics).toHaveProperty("newSubscribers");
      expect(metrics).toHaveProperty("chatbotConversations");
      expect(metrics).toHaveProperty("chatbotLeads");
      expect(metrics).toHaveProperty("pageViews");
      expect(metrics).toHaveProperty("uniqueSessions");
    });
  });

  describe("calculateDayOverDay", () => {
    it("should return null changes when no previous data", () => {
      const result = calculateDayOverDay(mockMetrics, null);
      expect(result.current).toBe(mockMetrics);
      expect(result.previous).toBeNull();
      expect(result.changes).toBeNull();
    });

    it("should calculate correct positive changes", () => {
      const result = calculateDayOverDay(mockMetrics, mockPreviousMetrics);
      expect(result.changes).not.toBeNull();

      // 42 vs 30 = +12 (+40%)
      expect(result.changes!.affiliateClicks.value).toBe(12);
      expect(result.changes!.affiliateClicks.percent).toBe(40);

      // 250 vs 200 = +50 (+25%)
      expect(result.changes!.pageViews.value).toBe(50);
      expect(result.changes!.pageViews.percent).toBe(25);

      // 4 vs 2 = +2 (+100%)
      expect(result.changes!.newRegistrations.value).toBe(2);
      expect(result.changes!.newRegistrations.percent).toBe(100);
    });

    it("should calculate correct negative changes", () => {
      const betterPrevious = { ...mockPreviousMetrics, affiliateClicks: 60 };
      const result = calculateDayOverDay(mockMetrics, betterPrevious);
      // 42 vs 60 = -18 (-30%)
      expect(result.changes!.affiliateClicks.value).toBe(-18);
      expect(result.changes!.affiliateClicks.percent).toBe(-30);
    });

    it("should handle zero previous values", () => {
      const zeroPrevious = { ...mockPreviousMetrics, affiliateClicks: 0 };
      const result = calculateDayOverDay(mockMetrics, zeroPrevious);
      expect(result.changes!.affiliateClicks.percent).toBe(100);
    });

    it("should handle both current and previous being zero", () => {
      const zeroMetrics = { ...mockMetrics, affiliateClicks: 0 };
      const zeroPrevious = { ...mockPreviousMetrics, affiliateClicks: 0 };
      const result = calculateDayOverDay(zeroMetrics, zeroPrevious);
      expect(result.changes!.affiliateClicks.value).toBe(0);
      expect(result.changes!.affiliateClicks.percent).toBe(0);
    });
  });

  describe("generateDailyReportHTML", () => {
    it("should generate valid HTML email", () => {
      const html = generateDailyReportHTML(mockMetrics);
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("AKČNÍ-LETENKY.com");
      expect(html).toContain("Denní report");
    });

    it("should include key metrics in HTML", () => {
      const html = generateDailyReportHTML(mockMetrics);
      expect(html).toContain("42"); // affiliate clicks
      expect(html).toContain("250"); // page views
      expect(html).toContain("Barcelona"); // top destination
    });

    it("should include comparison badges when provided", () => {
      const comparison = calculateDayOverDay(mockMetrics, mockPreviousMetrics);
      const html = generateDailyReportHTML(mockMetrics, comparison);
      expect(html).toContain("↑"); // positive trend
      expect(html).toContain("+40%"); // affiliate clicks change
      expect(html).toContain("Srovnání s předchozím dnem");
    });

    it("should not show comparison when no previous data", () => {
      const comparison = calculateDayOverDay(mockMetrics, null);
      const html = generateDailyReportHTML(mockMetrics, comparison);
      expect(html).toContain("Období: posledních 24 hodin");
    });

    it("should include price alert section", () => {
      const html = generateDailyReportHTML(mockMetrics);
      expect(html).toContain("Hlídač cen");
      expect(html).toContain("15"); // active alerts
    });

    it("should include chatbot section", () => {
      const html = generateDailyReportHTML(mockMetrics);
      expect(html).toContain("Chatbot");
      expect(html).toContain("18"); // conversations
    });

    it("should handle empty top destinations", () => {
      const emptyMetrics = { ...mockMetrics, topDestinations: [] };
      const html = generateDailyReportHTML(emptyMetrics);
      expect(html).toContain("Žádné kliky");
    });
  });

  describe("generateDailyReportText", () => {
    it("should generate plain text report", () => {
      const text = generateDailyReportText(mockMetrics);
      expect(text).toContain("AKČNÍ-LETENKY.com");
      expect(text).toContain("AFFILIATE VÝKON");
      expect(text).toContain("HLÍDAČ CEN");
      expect(text).toContain("CHATBOT");
    });

    it("should include key metrics in text", () => {
      const text = generateDailyReportText(mockMetrics);
      expect(text).toContain("42"); // affiliate clicks
      expect(text).toContain("Barcelona"); // top destination
      expect(text).toContain("15"); // active alerts
    });

    it("should include trend indicators with comparison", () => {
      const comparison = calculateDayOverDay(mockMetrics, mockPreviousMetrics);
      const text = generateDailyReportText(mockMetrics, comparison);
      expect(text).toContain("↑");
      expect(text).toContain("+40%");
    });

    it("should show comparison date when previous data exists", () => {
      const comparison = calculateDayOverDay(mockMetrics, mockPreviousMetrics);
      const text = generateDailyReportText(mockMetrics, comparison);
      expect(text).toContain("Srovnání s: 2026-02-07");
    });
  });
});
