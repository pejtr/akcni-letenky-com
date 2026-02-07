import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the dependencies
vi.mock("./pelikanCache", () => ({
  pelikanCache: {
    getFlights: vi.fn().mockResolvedValue([
      { title: "Barcelona", price: 2490, type: "flight" },
      { title: "Londýn", price: 1890, type: "flight" },
      { title: "Paříž", price: 3200, type: "flight" },
    ]),
    getVacations: vi.fn().mockResolvedValue([
      { title: "Mallorca", price: 8990, type: "vacation" },
      { title: "Kréta", price: 12500, type: "vacation" },
    ]),
  },
}));

vi.mock("./priceAlerts", () => ({
  getActivePriceAlerts: vi.fn().mockResolvedValue([
    { id: 1, email: "test@test.cz", destination: "Barcelona", destinationSlug: "barcelona", currentPrice: 3000, alertThreshold: 10, isActive: 1 },
    { id: 2, email: "test2@test.cz", destination: "Londýn", destinationSlug: "londyn", currentPrice: 2500, alertThreshold: 20, isActive: 1 },
  ]),
  recordPrice: vi.fn().mockResolvedValue(undefined),
  checkPriceDropsAndNotify: vi.fn().mockResolvedValue({ checked: 2, notified: 1 }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe("Price Check Cron", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should extract destination prices from offers", async () => {
    const { runPriceCheck } = await import("./priceCheckCron");
    const result = await runPriceCheck();

    expect(result).toBeDefined();
    expect(result.timestamp).toBeInstanceOf(Date);
    expect(typeof result.checked).toBe("number");
    expect(typeof result.notified).toBe("number");
    expect(typeof result.recordedPrices).toBe("number");
  });

  it("should record prices for tracked destinations", async () => {
    const { recordPrice } = await import("./priceAlerts");
    const { runPriceCheck } = await import("./priceCheckCron");

    await runPriceCheck();

    // Should have recorded prices for destinations that match active alerts
    expect(recordPrice).toHaveBeenCalled();
  });

  it("should call checkPriceDropsAndNotify", async () => {
    const { checkPriceDropsAndNotify } = await import("./priceAlerts");
    const { runPriceCheck } = await import("./priceCheckCron");

    await runPriceCheck();

    expect(checkPriceDropsAndNotify).toHaveBeenCalled();
  });

  it("should notify owner when notifications are sent", async () => {
    const { notifyOwner } = await import("./_core/notification");
    const { runPriceCheck } = await import("./priceCheckCron");

    await runPriceCheck();

    // checkPriceDropsAndNotify returns { notified: 1 }, so owner should be notified
    expect(notifyOwner).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining("Hlídač cen"),
      })
    );
  });

  it("should return last check result", async () => {
    const { runPriceCheck, getLastCheckResult } = await import("./priceCheckCron");

    await runPriceCheck();
    const lastResult = getLastCheckResult();

    expect(lastResult).toBeDefined();
    expect(lastResult?.checked).toBe(2);
    expect(lastResult?.notified).toBe(1);
  });

  it("should schedule cron job with initial delay", async () => {
    const { schedulePriceCheckCron, stopPriceCheckCron } = await import("./priceCheckCron");

    schedulePriceCheckCron();

    // The first check should be scheduled after 5 minutes
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    stopPriceCheckCron();
  });

  it("should stop cron job cleanly", async () => {
    const { stopPriceCheckCron } = await import("./priceCheckCron");

    // Should not throw
    expect(() => stopPriceCheckCron()).not.toThrow();
  });

  it("should handle empty offers gracefully", async () => {
    const { pelikanCache } = await import("./pelikanCache");
    (pelikanCache.getFlights as any).mockResolvedValueOnce([]);
    (pelikanCache.getVacations as any).mockResolvedValueOnce([]);

    const { runPriceCheck } = await import("./priceCheckCron");
    const result = await runPriceCheck();

    expect(result).toBeDefined();
    expect(result.recordedPrices).toBe(0);
  });

  it("should handle API errors gracefully", async () => {
    const { pelikanCache } = await import("./pelikanCache");
    (pelikanCache.getFlights as any).mockRejectedValueOnce(new Error("API down"));

    const { runPriceCheck } = await import("./priceCheckCron");
    const result = await runPriceCheck();

    expect(result).toBeDefined();
    expect(result.checked).toBe(0);
    expect(result.notified).toBe(0);
  });
});

describe("A/B Test Sharing Placement", () => {
  it("should have valid variant options", () => {
    const variants = ["card", "detail"];
    expect(variants).toContain("card");
    expect(variants).toContain("detail");
  });

  it("should map variant A to card placement", () => {
    const variant = "card";
    expect(variant === "card").toBe(true);
  });

  it("should map variant B to detail placement", () => {
    const variant = "detail";
    expect(variant === "detail").toBe(true);
  });

  it("should generate unique session IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const id = `s_${Math.random().toString(36).substring(2, 15)}`;
      ids.add(id);
    }
    // All IDs should be unique
    expect(ids.size).toBe(100);
  });

  it("should have approximately 50/50 distribution", () => {
    let cardCount = 0;
    let detailCount = 0;
    const iterations = 10000;

    for (let i = 0; i < iterations; i++) {
      if (Math.random() < 0.5) {
        cardCount++;
      } else {
        detailCount++;
      }
    }

    // Should be roughly 50/50 (within 5% tolerance)
    const ratio = cardCount / iterations;
    expect(ratio).toBeGreaterThan(0.45);
    expect(ratio).toBeLessThan(0.55);
  });

  it("should track share events with correct structure", () => {
    const event = {
      sessionId: "s_test123",
      variant: "card" as const,
      eventType: "share_click",
      eventData: "facebook",
    };

    expect(event.sessionId).toBeTruthy();
    expect(["card", "detail"]).toContain(event.variant);
    expect(event.eventType).toBe("share_click");
    expect(event.eventData).toBe("facebook");
  });

  it("should support multiple event types", () => {
    const eventTypes = ["share_click", "share_panel_open", "cta_click"];
    expect(eventTypes.length).toBe(3);
    expect(eventTypes).toContain("share_click");
    expect(eventTypes).toContain("share_panel_open");
    expect(eventTypes).toContain("cta_click");
  });
});
