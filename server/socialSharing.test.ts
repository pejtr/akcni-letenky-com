import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "./db";
import {
  createSocialShare,
  trackShareClick,
  trackShareConversion,
  validateDiscountCode,
  getSocialShareStats,
} from "./socialSharing";

describe("Social Sharing Module", () => {
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
    };
    (getDb as any).mockResolvedValue(mockDb);
  });

  describe("createSocialShare", () => {
    it("should create a share with generated codes", async () => {
      mockDb.values.mockResolvedValueOnce([{ insertId: 10 }]);

      const result = await createSocialShare({
        platform: "facebook",
        destination: "Londýn",
        destinationSlug: "london-united-kingdom",
        pageUrl: "https://example.com/london",
      });

      expect(result).toHaveProperty("id", 10);
      expect(result).toHaveProperty("shareCode");
      expect(result).toHaveProperty("discountCode");
      expect(result).toHaveProperty("shareUrl");
      expect(result.shareCode).toMatch(/^SH[A-Z0-9]{6}$/);
      expect(result.discountCode).toMatch(/^SDIL[A-Z0-9]{4}$/);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("should throw error when database is not available", async () => {
      (getDb as any).mockResolvedValue(null);

      await expect(
        createSocialShare({ platform: "facebook" })
      ).rejects.toThrow("Database not available");
    });

    it("should handle share without optional fields", async () => {
      mockDb.values.mockResolvedValueOnce([{ insertId: 5 }]);

      const result = await createSocialShare({
        platform: "whatsapp",
      });

      expect(result.id).toBe(5);
      expect(result.shareCode).toBeTruthy();
    });
  });

  describe("trackShareClick", () => {
    it("should increment referral clicks for valid share code", async () => {
      mockDb.limit.mockResolvedValueOnce([
        { id: 1, shareCode: "SHTEST01", referralClicks: 5 },
      ]);

      const result = await trackShareClick("SHTEST01");
      expect(result).toBeTruthy();
      expect(mockDb.update).toHaveBeenCalled();
    });

    it("should return null for invalid share code", async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await trackShareClick("INVALID");
      expect(result).toBeNull();
    });

    it("should return null when database is not available", async () => {
      (getDb as any).mockResolvedValue(null);
      const result = await trackShareClick("SHTEST01");
      expect(result).toBeNull();
    });
  });

  describe("trackShareConversion", () => {
    it("should increment referral conversions for valid share code", async () => {
      mockDb.limit.mockResolvedValueOnce([
        { id: 1, shareCode: "SHTEST01", referralConversions: 2 },
      ]);

      const result = await trackShareConversion("SHTEST01");
      expect(result).toBeTruthy();
      expect(mockDb.update).toHaveBeenCalled();
    });

    it("should return null for invalid share code", async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await trackShareConversion("INVALID");
      expect(result).toBeNull();
    });
  });

  describe("validateDiscountCode", () => {
    it("should validate an unused discount code", async () => {
      mockDb.limit.mockResolvedValueOnce([
        { id: 1, discountCode: "SDILTEST", discountUsed: 0 },
      ]);

      const result = await validateDiscountCode("SDILTEST");
      expect(result).toEqual({
        valid: true,
        share: expect.objectContaining({ discountCode: "SDILTEST" }),
      });
    });

    it("should reject an already used discount code", async () => {
      mockDb.limit.mockResolvedValueOnce([
        { id: 1, discountCode: "SDILTEST", discountUsed: 1 },
      ]);

      const result = await validateDiscountCode("SDILTEST");
      expect(result).toEqual({ valid: false, reason: "already_used" });
    });

    it("should return null for non-existent discount code", async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await validateDiscountCode("NONEXIST");
      expect(result).toBeNull();
    });
  });

  describe("getSocialShareStats", () => {
    it("should aggregate stats by platform", async () => {
      const mockShares = [
        { platform: "facebook", referralClicks: 10, referralConversions: 2 },
        { platform: "facebook", referralClicks: 5, referralConversions: 1 },
        { platform: "whatsapp", referralClicks: 8, referralConversions: 3 },
      ];

      mockDb.orderBy.mockResolvedValueOnce(mockShares);

      const result = await getSocialShareStats();
      expect(result.totalShares).toBe(3);
      expect(result.totalClicks).toBe(23);
      expect(result.totalConversions).toBe(6);
      expect(result.byPlatform).toHaveProperty("facebook");
      expect(result.byPlatform).toHaveProperty("whatsapp");
      expect(result.byPlatform.facebook.shares).toBe(2);
      expect(result.byPlatform.whatsapp.clicks).toBe(8);
    });

    it("should return empty stats when database is not available", async () => {
      (getDb as any).mockResolvedValue(null);
      const result = await getSocialShareStats();
      expect(result).toEqual({
        totalShares: 0,
        totalClicks: 0,
        totalConversions: 0,
        byPlatform: {},
      });
    });
  });
});
