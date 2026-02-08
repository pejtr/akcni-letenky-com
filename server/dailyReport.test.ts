import { describe, it, expect, vi, beforeEach } from "vitest";
import { collectDailyMetrics, generateDailyReportHTML, generateDailyReportText, type DailyMetrics } from "./dailyReport";

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
  });
});
