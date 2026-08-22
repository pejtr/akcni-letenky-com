/**
 * Unit Tests for Google Indexing API & Web Push Notifications
 */

import { describe, it, expect, vi } from "vitest";
import { submitUrlToGoogleIndexing, notifyGoogleForNewArticle } from "./googleIndexingApi";
import { getVapidPublicKey, sendPushNotificationToAll } from "./webPushNotifications";

describe("Google Indexing API Integration", () => {
  it("should support dry-run simulation mode when credentials missing", async () => {
    const result = await submitUrlToGoogleIndexing("https://www.akcni-letenky.com/blog/vatikan-a-vatikanska-muzea-pruvodce");

    expect(result.success).toBe(true);
    expect(result.isSimulated).toBe(true);
    expect(result.url).toContain("https://www.akcni-letenky.com/blog/vatikan-a-vatikanska-muzea-pruvodce");
    expect(result.type).toBe("URL_UPDATED");
  });

  it("should format article slug into full canonical URL", async () => {
    const result = await notifyGoogleForNewArticle("top-termalni-prameny-v-italii-wellness");

    expect(result.success).toBe(true);
    expect(result.url).toBe("https://www.akcni-letenky.com/blog/top-termalni-prameny-v-italii-wellness");
  });
});

describe("Web Push Notifications Engine", () => {
  it("should provide VAPID public key or fallback key", () => {
    const key = getVapidPublicKey();
    expect(key).toBeDefined();
    expect(typeof key).toBe("string");
    expect(key.length).toBeGreaterThan(10);
  });

  it("should support dry-run simulation mode when sending web push payload", async () => {
    vi.stubEnv("VAPID_PUBLIC_KEY", "");
    vi.stubEnv("VAPID_PRIVATE_KEY", "");

    try {
      const result = await sendPushNotificationToAll({
        title: "⚡ Mistake Fare: Dubaj za 4 990 Kč!",
        body: "Zpáteční letenky s garancí nejnižší ceny.",
        url: "https://www.akcni-letenky.com/dubaj",
      });

      expect(result.success).toBe(true);
      expect(result.isSimulated).toBe(true);
      expect(result.sentCount).toBeGreaterThan(0);
      expect(result.message).toContain("SIMULATION mode");
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
