import { describe, it, expect, vi, beforeEach } from "vitest";
import { isPushConfigured, getPushStats } from "./pushNotifications";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

// Mock web-push
vi.mock("web-push", () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn().mockResolvedValue({}),
  },
}));

describe("Push Notifications Service", () => {
  describe("isPushConfigured", () => {
    it("should return false when VAPID keys are not set", () => {
      const originalPublic = process.env.VAPID_PUBLIC_KEY;
      const originalPrivate = process.env.VAPID_PRIVATE_KEY;
      delete process.env.VAPID_PUBLIC_KEY;
      delete process.env.VAPID_PRIVATE_KEY;

      expect(isPushConfigured()).toBe(false);

      // Restore
      if (originalPublic) process.env.VAPID_PUBLIC_KEY = originalPublic;
      if (originalPrivate) process.env.VAPID_PRIVATE_KEY = originalPrivate;
    });

    it("should return true when VAPID keys are set", () => {
      process.env.VAPID_PUBLIC_KEY = "test-public-key";
      process.env.VAPID_PRIVATE_KEY = "test-private-key";

      expect(isPushConfigured()).toBe(true);
    });
  });

  describe("getPushStats", () => {
    it("should return stats with zero subscriptions when db is unavailable", async () => {
      const stats = await getPushStats();
      expect(stats).toBeDefined();
      expect(stats.totalSubscriptions).toBe(0);
      expect(stats.activeSubscriptions).toBe(0);
      expect(typeof stats.configured).toBe("boolean");
    });
  });
});
