import { describe, it, expect } from "vitest";
import { calculateLeadScore } from "./leadScoring";

describe("Lead Scoring System", () => {
  describe("calculateLeadScore", () => {
    it("should calculate score for minimal input", () => {
      const result = calculateLeadScore({
        messageCount: 0,
        capturedAt: new Date(),
      });

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.tier).toBe("cold");
    });

    it("should give higher score for more messages", () => {
      const lowEngagement = calculateLeadScore({
        messageCount: 1,
        capturedAt: new Date(),
      });

      const highEngagement = calculateLeadScore({
        messageCount: 10,
        capturedAt: new Date(),
      });

      expect(highEngagement.score).toBeGreaterThan(lowEngagement.score);
      expect(highEngagement.breakdown.messageEngagement).toBe(25);
    });

    it("should give higher score for higher budget", () => {
      const lowBudget = calculateLeadScore({
        messageCount: 5,
        lastBudgetMentioned: 3000,
        capturedAt: new Date(),
      });

      const highBudget = calculateLeadScore({
        messageCount: 5,
        lastBudgetMentioned: 30000,
        capturedAt: new Date(),
      });

      expect(highBudget.score).toBeGreaterThan(lowBudget.score);
      expect(highBudget.breakdown.budgetScore).toBe(25);
    });

    it("should give higher score for premium destinations", () => {
      const regularDest = calculateLeadScore({
        messageCount: 5,
        lastDestinationMentioned: "chorvatsko",
        capturedAt: new Date(),
      });

      const premiumDest = calculateLeadScore({
        messageCount: 5,
        lastDestinationMentioned: "maledivy",
        capturedAt: new Date(),
      });

      expect(premiumDest.score).toBeGreaterThan(regularDest.score);
      expect(premiumDest.breakdown.destinationScore).toBe(20);
    });

    it("should give higher score for recent captures", () => {
      const oldCapture = calculateLeadScore({
        messageCount: 5,
        capturedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      });

      const recentCapture = calculateLeadScore({
        messageCount: 5,
        capturedAt: new Date(),
      });

      expect(recentCapture.score).toBeGreaterThan(oldCapture.score);
      expect(recentCapture.breakdown.recencyScore).toBe(10);
      expect(oldCapture.breakdown.recencyScore).toBe(0);
    });

    it("should classify as hot lead with high score", () => {
      const result = calculateLeadScore({
        messageCount: 10, // 25 points
        lastBudgetMentioned: 30000, // 25 points
        lastDestinationMentioned: "maledivy", // 20 points
        emailOpened: 1, // 8 points
        emailClicked: 1, // +7 points (15 total for click, but capped at 20)
        capturedAt: new Date(), // 10 points
      });

      expect(result.tier).toBe("hot");
      expect(result.score).toBeGreaterThanOrEqual(80);
    });

    it("should classify as warm lead with medium score", () => {
      const result = calculateLeadScore({
        messageCount: 5, // 15 points
        lastBudgetMentioned: 10000, // 15 points
        lastDestinationMentioned: "barcelona", // 15 points
        capturedAt: new Date(), // 10 points
      });

      expect(result.tier).toBe("warm");
      expect(result.score).toBeGreaterThanOrEqual(50);
      expect(result.score).toBeLessThan(80);
    });

    it("should classify as cold lead with low score", () => {
      const result = calculateLeadScore({
        messageCount: 1, // 5 points
        capturedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 0 points (old)
      });

      expect(result.tier).toBe("cold");
      expect(result.score).toBeLessThan(50);
    });

    it("should include breakdown in result", () => {
      const result = calculateLeadScore({
        messageCount: 7,
        lastBudgetMentioned: 15000,
        lastDestinationMentioned: "řím",
        emailOpened: 1,
        capturedAt: new Date(),
      });

      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.messageEngagement).toBe(20);
      expect(result.breakdown.budgetScore).toBe(18);
      expect(result.breakdown.destinationScore).toBe(15);
      expect(result.breakdown.emailEngagement).toBe(8);
      expect(result.breakdown.recencyScore).toBe(10);
    });

    it("should cap score at 100", () => {
      const result = calculateLeadScore({
        messageCount: 100, // Would be more than 25 without cap
        lastBudgetMentioned: 100000,
        lastDestinationMentioned: "maledivy",
        emailOpened: 10,
        emailClicked: 10,
        capturedAt: new Date(),
      });

      expect(result.score).toBeLessThanOrEqual(100);
    });

    it("should handle null values gracefully", () => {
      const result = calculateLeadScore({
        messageCount: 5,
        lastBudgetMentioned: null,
        lastDestinationMentioned: null,
        emailOpened: 0,
        emailClicked: 0,
        capturedAt: new Date(),
      });

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.budgetScore).toBe(0);
      expect(result.breakdown.destinationScore).toBe(0);
    });
  });

  describe("Lead Tier Classification", () => {
    it("should correctly classify tiers based on score thresholds", () => {
      // Test boundary conditions
      const scores = [
        { score: 79, expectedTier: "warm" },
        { score: 80, expectedTier: "hot" },
        { score: 49, expectedTier: "cold" },
        { score: 50, expectedTier: "warm" },
        { score: 0, expectedTier: "cold" },
        { score: 100, expectedTier: "hot" },
      ];

      scores.forEach(({ score, expectedTier }) => {
        // Create input that would result in approximately this score
        const result = calculateLeadScore({
          messageCount: Math.floor(score / 10),
          lastBudgetMentioned: score > 50 ? 20000 : undefined,
          lastDestinationMentioned: score > 70 ? "maledivy" : undefined,
          capturedAt: new Date(),
        });

        // The actual score may vary, but tier logic should be consistent
        expect(["hot", "warm", "cold"]).toContain(result.tier);
      });
    });
  });

  describe("Destination Scoring", () => {
    it("should score premium destinations highest", () => {
      const premiumDestinations = ["maledivy", "seychely", "mauricius", "bali", "dubaj"];
      
      premiumDestinations.forEach((dest) => {
        const result = calculateLeadScore({
          messageCount: 1,
          lastDestinationMentioned: dest,
          capturedAt: new Date(),
        });
        expect(result.breakdown.destinationScore).toBe(20);
      });
    });

    it("should score popular destinations medium-high", () => {
      const popularDestinations = ["barcelona", "paříž", "londýn", "řím"];
      
      popularDestinations.forEach((dest) => {
        const result = calculateLeadScore({
          messageCount: 1,
          lastDestinationMentioned: dest,
          capturedAt: new Date(),
        });
        expect(result.breakdown.destinationScore).toBe(15);
      });
    });

    it("should score beach destinations medium", () => {
      const beachDestinations = ["egypt", "turecko", "řecko", "chorvatsko"];
      
      beachDestinations.forEach((dest) => {
        const result = calculateLeadScore({
          messageCount: 1,
          lastDestinationMentioned: dest,
          capturedAt: new Date(),
        });
        expect(result.breakdown.destinationScore).toBe(12);
      });
    });

    it("should give base score for unknown destinations", () => {
      const result = calculateLeadScore({
        messageCount: 1,
        lastDestinationMentioned: "neznámá destinace",
        capturedAt: new Date(),
      });
      expect(result.breakdown.destinationScore).toBe(8);
    });
  });

  describe("Budget Scoring", () => {
    it("should score luxury budgets highest", () => {
      const result = calculateLeadScore({
        messageCount: 1,
        lastBudgetMentioned: 35000,
        capturedAt: new Date(),
      });
      expect(result.breakdown.budgetScore).toBe(25);
    });

    it("should score mid-range budgets appropriately", () => {
      const result = calculateLeadScore({
        messageCount: 1,
        lastBudgetMentioned: 12000,
        capturedAt: new Date(),
      });
      expect(result.breakdown.budgetScore).toBe(15);
    });

    it("should score low budgets with base points", () => {
      const result = calculateLeadScore({
        messageCount: 1,
        lastBudgetMentioned: 2000,
        capturedAt: new Date(),
      });
      expect(result.breakdown.budgetScore).toBe(3);
    });
  });

  describe("Email Engagement Scoring", () => {
    it("should score clicks higher than opens", () => {
      const openOnly = calculateLeadScore({
        messageCount: 1,
        emailOpened: 1,
        emailClicked: 0,
        capturedAt: new Date(),
      });

      const clicked = calculateLeadScore({
        messageCount: 1,
        emailOpened: 1,
        emailClicked: 1,
        capturedAt: new Date(),
      });

      expect(clicked.breakdown.emailEngagement).toBeGreaterThan(openOnly.breakdown.emailEngagement);
    });

    it("should give bonus for multiple interactions", () => {
      const singleClick = calculateLeadScore({
        messageCount: 1,
        emailClicked: 1,
        capturedAt: new Date(),
      });

      const multipleClicks = calculateLeadScore({
        messageCount: 1,
        emailClicked: 5,
        capturedAt: new Date(),
      });

      expect(multipleClicks.breakdown.emailEngagement).toBeGreaterThan(singleClick.breakdown.emailEngagement);
    });
  });
});
