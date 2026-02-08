/**
 * Tests for Reservation Button A/B Test, UTM Source Detection, and Sticky Banner Pulse
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the CTA_TESTS config
describe("Reservation Button A/B Test", () => {
  it("should have reservation_button test config defined", async () => {
    const { CTA_TESTS } = await import("../client/src/hooks/useCtaAbTest");
    expect(CTA_TESTS.reservation_button).toBeDefined();
    expect(CTA_TESTS.reservation_button.testName).toBe("cta_reservation_v1");
    expect(CTA_TESTS.reservation_button.position).toBe("header_reservation");
  });

  it("should have correct variant A text - RYCHLÁ REZERVACE", async () => {
    const { CTA_TESTS } = await import("../client/src/hooks/useCtaAbTest");
    expect(CTA_TESTS.reservation_button.variantA.text).toBe("RYCHLÁ REZERVACE");
    expect(CTA_TESTS.reservation_button.variantA.emoji).toBe("✈️");
  });

  it("should have correct variant B text - ZAREZERVOVAT TEĎ", async () => {
    const { CTA_TESTS } = await import("../client/src/hooks/useCtaAbTest");
    expect(CTA_TESTS.reservation_button.variantB.text).toBe("ZAREZERVOVAT TEĎ");
    expect(CTA_TESTS.reservation_button.variantB.emoji).toBe("🚀");
  });

  it("should have all required CTA test configs", async () => {
    const { CTA_TESTS } = await import("../client/src/hooks/useCtaAbTest");
    const requiredTests = ["hero_cta", "featured_cta", "footer_cta", "sticky_banner", "reservation_button"];
    for (const testKey of requiredTests) {
      expect(CTA_TESTS[testKey]).toBeDefined();
      expect(CTA_TESTS[testKey].testName).toBeTruthy();
      expect(CTA_TESTS[testKey].position).toBeTruthy();
      expect(CTA_TESTS[testKey].variantA.text).toBeTruthy();
      expect(CTA_TESTS[testKey].variantB.text).toBeTruthy();
    }
  });

  it("sticky banner variant B should contain template markers for highlighting", async () => {
    const { CTA_TESTS } = await import("../client/src/hooks/useCtaAbTest");
    const stickyB = CTA_TESTS.sticky_banner.variantB;
    expect(stickyB.text).toContain("{{");
    expect(stickyB.text).toContain("}}");
    // Should contain price
    expect(stickyB.text).toContain("Kč");
  });
});

describe("UTM Source Detection", () => {
  it("should export getCampaignMessage function", async () => {
    const { getCampaignMessage } = await import("../client/src/hooks/useUtmSource");
    expect(typeof getCampaignMessage).toBe("function");
  });

  it("should return default Facebook message for generic campaign", async () => {
    const { getCampaignMessage } = await import("../client/src/hooks/useUtmSource");
    const msg = getCampaignMessage({
      source: "facebook",
      medium: "cpc",
      campaign: "general",
      content: null,
      term: null,
    });
    expect(msg).toContain("Facebook");
    expect(msg).toContain("nabídka");
  });

  it("should return summer message for summer campaign", async () => {
    const { getCampaignMessage } = await import("../client/src/hooks/useUtmSource");
    const msg = getCampaignMessage({
      source: "facebook",
      medium: "cpc",
      campaign: "leto_2026",
      content: null,
      term: null,
    });
    expect(msg).toContain("letní");
    expect(msg).toContain("Facebook");
  });

  it("should return winter message for winter campaign", async () => {
    const { getCampaignMessage } = await import("../client/src/hooks/useUtmSource");
    const msg = getCampaignMessage({
      source: "facebook",
      medium: "cpc",
      campaign: "zima_special",
      content: null,
      term: null,
    });
    expect(msg).toContain("zimní");
  });

  it("should return weekend message for weekend campaign", async () => {
    const { getCampaignMessage } = await import("../client/src/hooks/useUtmSource");
    const msg = getCampaignMessage({
      source: "facebook",
      medium: "cpc",
      campaign: "vikend_akce",
      content: null,
      term: null,
    });
    expect(msg).toContain("Víkendová");
  });

  it("should return last minute message for last minute campaign", async () => {
    const { getCampaignMessage } = await import("../client/src/hooks/useUtmSource");
    const msg = getCampaignMessage({
      source: "facebook",
      medium: "cpc",
      campaign: "last_minute_feb",
      content: null,
      term: null,
    });
    expect(msg).toContain("Last Minute");
  });

  it("should return beach message for beach campaign", async () => {
    const { getCampaignMessage } = await import("../client/src/hooks/useUtmSource");
    const msg = getCampaignMessage({
      source: "facebook",
      medium: "cpc",
      campaign: "plaz_dovolena",
      content: null,
      term: null,
    });
    expect(msg).toContain("Plážová");
  });

  it("should return valentine message for valentine campaign", async () => {
    const { getCampaignMessage } = await import("../client/src/hooks/useUtmSource");
    const msg = getCampaignMessage({
      source: "facebook",
      medium: "cpc",
      campaign: "valentyn_2026",
      content: null,
      term: null,
    });
    expect(msg).toContain("Valentýnská");
  });
});
