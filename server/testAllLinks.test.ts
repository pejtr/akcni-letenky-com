/**
 * Unit Test Suite for System-Wide Link Validation
 */

import { describe, it, expect } from "vitest";
import { testAllSystemLinks } from "./testAllLinks";

describe("System-Wide Link Validation Test Suite", () => {
  it("should validate all internal static routes, sitemap URLs, blog articles, and affiliate links", async () => {
    const report = await testAllSystemLinks();

    console.log(`[LinkCheck] Total links tested: ${report.totalChecked}`);
    console.log(`[LinkCheck] Passed: ${report.passedCount}`);
    console.log(`[LinkCheck] Failed: ${report.failedCount}`);

    expect(report.totalChecked).toBeGreaterThan(30);
    expect(report.failedCount).toBe(0);
    expect(report.passedCount).toBe(report.totalChecked);
  });
});
