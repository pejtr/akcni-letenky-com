import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

// Mock the email service
vi.mock("./emailService", () => ({
  isEmailServiceConfigured: vi.fn(),
}));

// Mock resend
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: "test-email-id" }),
    },
  })),
}));

describe("WishlistRemarketing", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "test-key";
  });

  describe("processWishlistRemarketing", () => {
    it("should return 0 when db is not available", async () => {
      const { getDb } = await import("./db");
      (getDb as any).mockResolvedValue(null);

      const mod = await import("./wishlistRemarketing");
      const result = await mod.processWishlistRemarketing();
      expect(result).toBe(0);
    });

    it("should return 0 when email service is not configured", async () => {
      const { getDb } = await import("./db");
      (getDb as any).mockResolvedValue({});

      const { isEmailServiceConfigured } = await import("./emailService");
      (isEmailServiceConfigured as any).mockResolvedValue(false);

      const mod = await import("./wishlistRemarketing");
      const result = await mod.processWishlistRemarketing();
      expect(result).toBe(0);
    });

    it("should return 0 when no stale wishlist items found", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      const { getDb } = await import("./db");
      (getDb as any).mockResolvedValue(mockDb);

      const { isEmailServiceConfigured } = await import("./emailService");
      (isEmailServiceConfigured as any).mockResolvedValue(true);

      const mod = await import("./wishlistRemarketing");
      const result = await mod.processWishlistRemarketing();
      expect(result).toBe(0);
    });

    it("should skip items without user email", async () => {
      const mockItems = [
        {
          wishlistId: 1,
          userId: 1,
          flightId: 10,
          destinationId: "paris",
          addedAt: Date.now() - 48 * 60 * 60 * 1000,
          userName: "Test",
          userEmail: null, // No email
          flightTitle: "Paris",
          flightPrice: 2990,
          flightCountry: "Francie",
          flightImageUrl: null,
          flightAffiliateUrl: "https://example.com",
        },
      ];

      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockItems),
      };

      const { getDb } = await import("./db");
      (getDb as any).mockResolvedValue(mockDb);

      const { isEmailServiceConfigured } = await import("./emailService");
      (isEmailServiceConfigured as any).mockResolvedValue(true);

      const mod = await import("./wishlistRemarketing");
      const result = await mod.processWishlistRemarketing();
      expect(result).toBe(0);
    });

    it("should send email and mark items as remarketed for valid items", async () => {
      const mockItems = [
        {
          wishlistId: 1,
          userId: 1,
          flightId: 10,
          destinationId: "paris",
          addedAt: Date.now() - 48 * 60 * 60 * 1000,
          userName: "Jan",
          userEmail: "jan@test.com",
          flightTitle: "Paris",
          flightPrice: 2990,
          flightCountry: "Francie",
          flightImageUrl: "https://example.com/paris.jpg",
          flightAffiliateUrl: "https://example.com/book",
        },
      ];

      const mockUpdate = vi.fn().mockReturnThis();
      const mockSet = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockResolvedValue(undefined);

      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockItems),
        update: mockUpdate,
        set: mockSet,
      };
      // Chain update().set().where()
      mockUpdate.mockReturnValue({ set: mockSet });
      mockSet.mockReturnValue({ where: mockWhere });

      const { getDb } = await import("./db");
      (getDb as any).mockResolvedValue(mockDb);

      const { isEmailServiceConfigured } = await import("./emailService");
      (isEmailServiceConfigured as any).mockResolvedValue(true);

      const mod = await import("./wishlistRemarketing");
      const result = await mod.processWishlistRemarketing();
      expect(result).toBe(1);
      // Verify update was called to mark as remarketed
      expect(mockUpdate).toHaveBeenCalled();
    });

    it("should group multiple items by user and send one email", async () => {
      const mockItems = [
        {
          wishlistId: 1,
          userId: 1,
          flightId: 10,
          destinationId: "paris",
          addedAt: Date.now() - 48 * 60 * 60 * 1000,
          userName: "Jan",
          userEmail: "jan@test.com",
          flightTitle: "Paris",
          flightPrice: 2990,
          flightCountry: "Francie",
          flightImageUrl: null,
          flightAffiliateUrl: "https://example.com/book1",
        },
        {
          wishlistId: 2,
          userId: 1,
          flightId: 11,
          destinationId: "london",
          addedAt: Date.now() - 48 * 60 * 60 * 1000,
          userName: "Jan",
          userEmail: "jan@test.com",
          flightTitle: "London",
          flightPrice: 1990,
          flightCountry: "Anglie",
          flightImageUrl: null,
          flightAffiliateUrl: "https://example.com/book2",
        },
      ];

      const mockUpdate = vi.fn().mockReturnThis();
      const mockSet = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockResolvedValue(undefined);

      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockItems),
        update: mockUpdate,
      };
      mockUpdate.mockReturnValue({ set: mockSet });
      mockSet.mockReturnValue({ where: mockWhere });

      const { getDb } = await import("./db");
      (getDb as any).mockResolvedValue(mockDb);

      const { isEmailServiceConfigured } = await import("./emailService");
      (isEmailServiceConfigured as any).mockResolvedValue(true);

      const mod = await import("./wishlistRemarketing");
      const result = await mod.processWishlistRemarketing();
      // Should send 1 email (grouped by user)
      expect(result).toBe(1);
      // Should update 2 wishlist items
      expect(mockUpdate).toHaveBeenCalledTimes(2);
    });
  });

  describe("getWishlistRemarketingStats", () => {
    it("should return zeros when db is not available", async () => {
      const { getDb } = await import("./db");
      (getDb as any).mockResolvedValue(null);

      const mod = await import("./wishlistRemarketing");
      const stats = await mod.getWishlistRemarketingStats();
      expect(stats).toEqual({
        totalFavorites: 0,
        pendingRemarketing: 0,
        alreadyRemarketed: 0,
      });
    });

    it("should return correct stats from database", async () => {
      const mockStats = [
        { isFavorite: 1, count: 5 },
        { isFavorite: 2, count: 3 },
      ];

      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockResolvedValue(mockStats),
      };

      const { getDb } = await import("./db");
      (getDb as any).mockResolvedValue(mockDb);

      const mod = await import("./wishlistRemarketing");
      const stats = await mod.getWishlistRemarketingStats();
      expect(stats.totalFavorites).toBe(8);
      expect(stats.pendingRemarketing).toBe(5);
      expect(stats.alreadyRemarketed).toBe(3);
    });
  });

  describe("scheduleWishlistRemarketing", () => {
    it("should set up an interval", async () => {
      const spy = vi.spyOn(global, "setInterval");
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const mod = await import("./wishlistRemarketing");
      mod.scheduleWishlistRemarketing();

      expect(spy).toHaveBeenCalledWith(expect.any(Function), 30 * 60 * 1000);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[WishlistRemarketing]")
      );

      spy.mockRestore();
      consoleSpy.mockRestore();
    });
  });
});
