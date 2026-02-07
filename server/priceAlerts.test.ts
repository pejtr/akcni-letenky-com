import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

// Mock the notification module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import { getDb } from "./db";
import {
  createPriceAlert,
  getPriceAlertsByUserId,
  deactivatePriceAlert,
  deletePriceAlert,
  getPriceHistoryForDestination,
  recordPrice,
  getPriceAlertStats,
} from "./priceAlerts";

describe("Price Alerts Module", () => {
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
      delete: vi.fn().mockReturnThis(),
    };
    (getDb as any).mockResolvedValue(mockDb);
  });

  describe("createPriceAlert", () => {
    it("should create a new price alert when none exists", async () => {
      // Mock no existing alert
      mockDb.limit.mockResolvedValueOnce([]);
      mockDb.values.mockResolvedValueOnce([{ insertId: 42 }]);

      const result = await createPriceAlert({
        destination: "Londýn",
        destinationSlug: "london-united-kingdom",
        currentPrice: 733,
        targetPrice: 600,
        priceDropPercent: 10,
      });

      expect(result).toEqual({ id: 42, updated: false });
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("should update existing alert for same destination", async () => {
      // Mock existing alert
      mockDb.limit.mockResolvedValueOnce([{ id: 5, userId: 1 }]);

      const result = await createPriceAlert({
        destination: "Londýn",
        destinationSlug: "london-united-kingdom",
        currentPrice: 700,
      });

      expect(result).toEqual({ id: 5, updated: true });
      expect(mockDb.update).toHaveBeenCalled();
    });

    it("should throw error when database is not available", async () => {
      (getDb as any).mockResolvedValue(null);

      await expect(
        createPriceAlert({
          destination: "Londýn",
          destinationSlug: "london-united-kingdom",
          currentPrice: 733,
        })
      ).rejects.toThrow("Database not available");
    });
  });

  describe("getPriceAlertsByUserId", () => {
    it("should return alerts for a given userId", async () => {
      const mockAlerts = [
        { id: 1, userId: 1, destinationName: "Londýn" },
        { id: 2, userId: 1, destinationName: "Paříž" },
      ];
      mockDb.orderBy.mockResolvedValueOnce(mockAlerts);

      const result = await getPriceAlertsByUserId(1);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it("should return empty array when database is not available", async () => {
      (getDb as any).mockResolvedValue(null);
      const result = await getPriceAlertsByUserId(1);
      expect(result).toEqual([]);
    });
  });

  describe("deactivatePriceAlert", () => {
    it("should deactivate an alert by setting isActive to 0", async () => {
      const result = await deactivatePriceAlert(1);
      expect(result).toBe(true);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it("should return false when database is not available", async () => {
      (getDb as any).mockResolvedValue(null);
      const result = await deactivatePriceAlert(1);
      expect(result).toBe(false);
    });
  });

  describe("deletePriceAlert", () => {
    it("should delete an alert", async () => {
      const result = await deletePriceAlert(1);
      expect(result).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it("should return false when database is not available", async () => {
      (getDb as any).mockResolvedValue(null);
      const result = await deletePriceAlert(1);
      expect(result).toBe(false);
    });
  });

  describe("recordPrice", () => {
    it("should record a price entry", async () => {
      await recordPrice({
        destination: "Londýn",
        destinationSlug: "london-united-kingdom",
        price: 733,
        source: "pelikan",
      });

      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("should use default source when not provided", async () => {
      await recordPrice({
        destination: "Londýn",
        destinationSlug: "london-united-kingdom",
        price: 733,
      });

      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe("getPriceAlertStats", () => {
    it("should return stats summary", async () => {
      // Override the chain for this specific call
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockResolvedValue([
          { id: 1, isActive: 1, alertCount: 3 },
          { id: 2, isActive: 0, alertCount: 1 },
          { id: 3, isActive: 1, alertCount: 0 },
        ]),
      });

      const result = await getPriceAlertStats();
      expect(result).toEqual({
        total: 3,
        active: 2,
        notified: 4,
      });
    });

    it("should return zeros when database is not available", async () => {
      (getDb as any).mockResolvedValue(null);
      const result = await getPriceAlertStats();
      expect(result).toEqual({ total: 0, active: 0, notified: 0 });
    });
  });
});
