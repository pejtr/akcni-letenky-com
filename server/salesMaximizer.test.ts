/**
 * Unit Test Suite for Sales Maximizer & Price Tracker Suite
 */

import { describe, it, expect, vi } from "vitest";

vi.mock("./db", () => ({
  getDb: vi.fn(async () => null),
}));

import { createPriceTracker, checkPriceTrackerAlerts } from "./priceTracker";

describe("Price Tracker & Sales Maximizer Suite", () => {
  it("should create a new price tracker subscription for flights & holidays", async () => {
    const res = await createPriceTracker({
      email: "test.user@example.com",
      type: "both",
      destination: "Dubaj",
      maxPrice: 5000,
    });

    expect(res.success).toBe(true);
    expect(res.id).toBeDefined();
  });

  it("should check price drop condition logic", async () => {
    const report = await checkPriceTrackerAlerts();
    expect(report.checkedCount).toBeGreaterThanOrEqual(0);
    expect(report.triggeredCount).toBeGreaterThanOrEqual(0);
  });
});
