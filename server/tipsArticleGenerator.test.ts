/**
 * Tests for tipsArticleGenerator.ts
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock DB ──────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

// ─── Mock LLM ─────────────────────────────────────────────────────────────────
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

// ─── Mock notification ────────────────────────────────────────────────────────
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import { getDb } from "./db";
import { invokeLLM } from "./_core/llm";
import { generateDailyTipArticle, getTipsGenerationStats, scheduleDailyTipArticle } from "./tipsArticleGenerator";

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockResolvedValue(undefined),
};

describe("tipsArticleGenerator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getDb as any).mockResolvedValue(mockDb);
  });

  describe("generateDailyTipArticle", () => {
    it("returns error when DB is unavailable", async () => {
      (getDb as any).mockResolvedValue(null);

      const result = await generateDailyTipArticle();

      expect(result.success).toBe(false);
      expect(result.error).toContain("Database not available");
    });

    it("generates and inserts an article successfully", async () => {
      // Simulate no existing articles (topic not used yet)
      mockDb.limit.mockResolvedValue([]);

      const mockLLMResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "Proč vždy hledat letenky v inkognito režimu",
                excerpt: "Vyhledávače letenek sledují vaše cookies a zvyšují ceny. Naučte se jak tomu zabránit.",
                metaDescription: "Jak ušetřit na letenkách pomocí inkognito režimu. Krok za krokem průvodce.",
                content: "<article><h2>Inkognito mód</h2><p>Obsah článku...</p></article>",
              }),
            },
          },
        ],
      };

      (invokeLLM as any).mockResolvedValue(mockLLMResponse);

      const result = await generateDailyTipArticle();

      expect(result.success).toBe(true);
      expect(result.title).toBe("Proč vždy hledat letenky v inkognito režimu");
      expect(result.slug).toBeTruthy();
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "tips",
          status: "published",
          author: "Akční Letenky",
        })
      );
    });

    it("handles LLM error gracefully", async () => {
      mockDb.limit.mockResolvedValue([]);
      (invokeLLM as any).mockRejectedValue(new Error("LLM API timeout"));

      const result = await generateDailyTipArticle();

      expect(result.success).toBe(false);
      expect(result.error).toContain("LLM API timeout");
    });

    it("skips already-used topics and picks the next available one", async () => {
      // First call returns existing article (topic used), second returns empty
      mockDb.limit
        .mockResolvedValueOnce([{ id: 1 }]) // first topic exists
        .mockResolvedValueOnce([]) // second topic is free
        .mockResolvedValue([]); // subsequent calls

      const mockLLMResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "Nejlevnější den na koupi letenky",
                excerpt: "Kdy jsou letenky nejlevnější? Úterý a středa jsou statisticky nejlepší dny.",
                metaDescription: "Nejlevnější den na koupi letenky. Statistiky a tipy pro ušetření.",
                content: "<article><p>Obsah...</p></article>",
              }),
            },
          },
        ],
      };

      (invokeLLM as any).mockResolvedValue(mockLLMResponse);

      const result = await generateDailyTipArticle();

      expect(result.success).toBe(true);
      // Should have used the second topic
      expect(result.slug).toBe("nejlevnejsi-den-na-koupi-letenky");
    });

    it("includes affiliate link in the LLM prompt", async () => {
      mockDb.limit.mockResolvedValue([]);

      const mockLLMResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "Test tip",
                excerpt: "Test excerpt.",
                metaDescription: "Test meta.",
                content: "<article><p>Test content with <a href='https://www.kiwi.com/cs/?affilid=155221'>Kiwi.com</a></p></article>",
              }),
            },
          },
        ],
      };

      (invokeLLM as any).mockResolvedValue(mockLLMResponse);

      await generateDailyTipArticle();

      // Check that LLM was called with affiliate marker in prompt
      const llmCall = (invokeLLM as any).mock.calls[0][0];
      const userMessage = llmCall.messages.find((m: any) => m.role === "user");
      expect(userMessage.content).toContain("155221");
    });
  });

  describe("getTipsGenerationStats", () => {
    it("returns zeros when DB is unavailable", async () => {
      (getDb as any).mockResolvedValue(null);

      const stats = await getTipsGenerationStats();

      expect(stats.totalTips).toBe(0);
      expect(stats.lastGenerated).toBeNull();
      expect(stats.topicsAvailable).toBeGreaterThan(0);
    });

    it("returns correct stats from DB", async () => {
      const mockArticles = [
        { id: 1, title: "Tip 1", slug: "tip-1", publishedAt: new Date("2026-04-09") },
        { id: 2, title: "Tip 2", slug: "tip-2", publishedAt: new Date("2026-04-08") },
      ];

      mockDb.limit.mockResolvedValue(mockArticles);

      const stats = await getTipsGenerationStats();

      expect(stats.totalTips).toBe(2);
      expect(stats.lastGenerated).toEqual(new Date("2026-04-09"));
      expect(stats.topicsAvailable).toBeGreaterThanOrEqual(25);
      expect(stats.recentArticles).toHaveLength(2);
    });
  });

  describe("scheduleDailyTipArticle", () => {
    it("schedules without throwing", () => {
      // Just verify it doesn't throw when called
      expect(() => scheduleDailyTipArticle()).not.toThrow();
    });
  });
});
