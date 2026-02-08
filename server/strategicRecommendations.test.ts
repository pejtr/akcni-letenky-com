/**
 * Tests for Strategic Recommendations Service
 */
import { describe, it, expect, vi } from "vitest";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          summary: "Testovací týden: 150 affiliate kliků, 5 registrací.",
          keyInsight: "Affiliate kliky vzrostly o 20% oproti minulému týdnu.",
          recommendations: [
            {
              priority: "high",
              category: "growth",
              title: "Zvýšit návštěvnost",
              description: "Zaměřte se na SEO optimalizaci pro top destinace.",
              expectedImpact: "2x nárůst organické návštěvnosti",
              actionSteps: ["Optimalizovat meta tagy", "Vytvořit blog posty"],
            },
            {
              priority: "medium",
              category: "monetization",
              title: "Optimalizovat affiliate konverze",
              description: "Testovat různé CTA texty na kartách destinací.",
              expectedImpact: "15% zvýšení CTR",
              actionSteps: ["A/B test CTA tlačítek", "Přidat urgency prvky"],
            },
          ],
        }),
      },
    }],
  }),
}));

describe("Strategic Recommendations", () => {
  it("should import generateStrategicRecommendations", async () => {
    const mod = await import("./strategicRecommendations");
    expect(mod.generateStrategicRecommendations).toBeDefined();
    expect(typeof mod.generateStrategicRecommendations).toBe("function");
  });

  it("should import generateRecommendationsHTML", async () => {
    const mod = await import("./strategicRecommendations");
    expect(mod.generateRecommendationsHTML).toBeDefined();
    expect(typeof mod.generateRecommendationsHTML).toBe("function");
  });

  it("should generate recommendations from comparison data", async () => {
    const { generateStrategicRecommendations } = await import("./strategicRecommendations");
    
    const mockComparison = {
      current: {
        weekLabel: "27.1. – 2.2.2026",
        totalAffiliateClicks: 150,
        totalPageViews: 2000,
        totalNewRegistrations: 5,
        totalNewSubscribers: 8,
        totalChatbotConversations: 25,
        totalChatbotLeads: 3,
        totalSocialShares: 12,
        totalPriceAlertNotifications: 7,
        totalEmailsSent: 50,
        avgDailyClicks: 21,
        avgDailyPageViews: 286,
        topDestinations: [
          { destination: "Barcelona", clicks: 30 },
          { destination: "Řím", clicks: 25 },
        ],
        bestDay: { date: "2026-01-29", clicks: 35 },
        worstDay: { date: "2026-01-27", clicks: 10 },
      },
      previous: {
        weekLabel: "20.1. – 26.1.2026",
        totalAffiliateClicks: 125,
        totalPageViews: 1800,
        totalNewRegistrations: 4,
        totalNewSubscribers: 6,
        totalChatbotConversations: 20,
        totalChatbotLeads: 2,
        totalSocialShares: 10,
        totalPriceAlertNotifications: 5,
        totalEmailsSent: 40,
        avgDailyClicks: 18,
        avgDailyPageViews: 257,
        topDestinations: [],
        bestDay: null,
        worstDay: null,
      },
      changes: {
        affiliateClicks: { value: 25, percent: 20 },
        pageViews: { value: 200, percent: 11 },
        newRegistrations: { value: 1, percent: 25 },
        newSubscribers: { value: 2, percent: 33 },
        chatbotConversations: { value: 5, percent: 25 },
        chatbotLeads: { value: 1, percent: 50 },
        socialShares: { value: 2, percent: 20 },
      },
    };

    const result = await generateStrategicRecommendations(mockComparison as any);
    
    expect(result).toBeDefined();
    expect(result.summary).toBeDefined();
    expect(result.keyInsight).toBeDefined();
    expect(result.recommendations).toBeDefined();
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.generatedAt).toBeDefined();
  });

  it("should validate recommendation structure", async () => {
    const { generateStrategicRecommendations } = await import("./strategicRecommendations");
    
    const mockComparison = {
      current: {
        weekLabel: "test",
        totalAffiliateClicks: 100,
        totalPageViews: 1000,
        totalNewRegistrations: 3,
        totalNewSubscribers: 5,
        totalChatbotConversations: 15,
        totalChatbotLeads: 2,
        totalSocialShares: 8,
        totalPriceAlertNotifications: 4,
        totalEmailsSent: 30,
        avgDailyClicks: 14,
        avgDailyPageViews: 143,
        topDestinations: [],
        bestDay: null,
        worstDay: null,
      },
      previous: null,
      changes: null,
    };

    const result = await generateStrategicRecommendations(mockComparison as any);
    
    for (const rec of result.recommendations) {
      expect(["high", "medium", "low"]).toContain(rec.priority);
      expect(["growth", "retention", "optimization", "content", "monetization"]).toContain(rec.category);
      expect(rec.title).toBeDefined();
      expect(rec.description).toBeDefined();
      expect(rec.expectedImpact).toBeDefined();
      expect(Array.isArray(rec.actionSteps)).toBe(true);
    }
  });

  it("should generate valid HTML from strategy", async () => {
    const { generateRecommendationsHTML } = await import("./strategicRecommendations");
    
    const mockStrategy = {
      summary: "Test summary",
      keyInsight: "Test insight",
      recommendations: [
        {
          priority: "high" as const,
          category: "growth" as const,
          title: "Test recommendation",
          description: "Test description",
          expectedImpact: "Test impact",
          actionSteps: ["Step 1", "Step 2"],
        },
      ],
      generatedAt: new Date().toISOString(),
    };

    const html = generateRecommendationsHTML(mockStrategy);
    
    expect(html).toContain("Strategická doporučení");
    expect(html).toContain("Test insight");
    expect(html).toContain("Test recommendation");
    expect(html).toContain("Test description");
    expect(html).toContain("Test impact");
    expect(html).toContain("Step 1");
    expect(html).toContain("Step 2");
  });
});
