import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { articles, destinations } from "../drizzle/schema";

describe("Articles API", () => {
  beforeAll(async () => {
    // Ensure database is available
    const db = await getDb();
    expect(db).toBeDefined();
  });

  describe("articles.list", () => {
    it("should return all published articles", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.articles.list();
      expect(Array.isArray(result)).toBe(true);
      // All returned articles should be published
      result.forEach((article) => {
        expect(article.status).toBe("published");
      });
    });

    it("should respect limit parameter", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.articles.list({ limit: 5 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  describe("articles.recent", () => {
    it("should return recent articles with default limit", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.articles.recent({ limit: 5 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);
      
      // Articles should be sorted by publishedAt descending
      if (result.length > 1) {
        const dates = result.map(a => a.publishedAt?.getTime() || 0);
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i]!).toBeGreaterThanOrEqual(dates[i + 1]!);
        }
      }
    });
  });

  describe("articles.bySlug", () => {
    it("should throw error for non-existent article", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.articles.bySlug({ slug: "non-existent-article-slug-12345" })
      ).rejects.toThrow("Article not found");
    });

    it("should return article if it exists", async () => {
      const db = await getDb();
      if (!db) return;

      // Get first article from database
      const existingArticles = await db
        .select()
        .from(articles)
        .limit(1);

      if (existingArticles.length > 0) {
        const caller = appRouter.createCaller({
          user: null,
          req: {} as any,
          res: {} as any,
        });

        const article = existingArticles[0]!;
        const result = await caller.articles.bySlug({ slug: article.slug });
        
        expect(result).toBeDefined();
        expect(result.slug).toBe(article.slug);
        expect(result.title).toBe(article.title);
      }
    });
  });

  describe("articles.generateDaily", () => {
    it("should require authentication", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      await expect(caller.articles.generateDaily()).rejects.toThrow();
    });

    it("should require admin role", async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, role: "user", openId: "test" } as any,
        req: {} as any,
        res: {} as any,
      });

      await expect(caller.articles.generateDaily()).rejects.toThrow("Unauthorized");
    });
  });
});

describe("Destinations API", () => {
  beforeAll(async () => {
    const db = await getDb();
    expect(db).toBeDefined();
  });

  describe("destinations.list", () => {
    it("should return all destinations", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.destinations.list();
      expect(Array.isArray(result)).toBe(true);
      
      // Should have destinations from seed data
      expect(result.length).toBeGreaterThan(0);
      
      // Each destination should have required fields
      result.forEach((dest) => {
        expect(dest.name).toBeDefined();
        expect(dest.slug).toBeDefined();
        expect(dest.country).toBeDefined();
      });
    });
  });

  describe("destinations.bySlug", () => {
    it("should throw error for non-existent destination", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.destinations.bySlug({ slug: "non-existent-destination-12345" })
      ).rejects.toThrow("Destination not found");
    });

    it("should return destination if it exists", async () => {
      const db = await getDb();
      if (!db) return;

      // Get first destination from database
      const existingDestinations = await db
        .select()
        .from(destinations)
        .limit(1);

      if (existingDestinations.length > 0) {
        const caller = appRouter.createCaller({
          user: null,
          req: {} as any,
          res: {} as any,
        });

        const destination = existingDestinations[0]!;
        const result = await caller.destinations.bySlug({ slug: destination.slug });
        
        expect(result).toBeDefined();
        expect(result.slug).toBe(destination.slug);
        expect(result.name).toBe(destination.name);
        expect(result.country).toBe(destination.country);
      }
    });
  });

  describe("destinations.featured", () => {
    it("should return featured destinations with default limit", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.destinations.featured({ limit: 8 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(8);
      
      // Destinations should be sorted by popularity score descending
      if (result.length > 1) {
        const scores = result.map(d => d.popularityScore || 0);
        for (let i = 0; i < scores.length - 1; i++) {
          expect(scores[i]!).toBeGreaterThanOrEqual(scores[i + 1]!);
        }
      }
    });

    it("should respect custom limit", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.destinations.featured({ limit: 3 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(3);
    });
  });
});
