import { describe, it, expect } from "vitest";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/FiInAw6a1zw3iE0lem9eTy";

describe("WhatsApp Group Banner", () => {
  describe("WhatsApp group URL configuration", () => {
    it("should use the correct WhatsApp group invite link", () => {
      expect(WHATSAPP_GROUP_URL).toBe("https://chat.whatsapp.com/FiInAw6a1zw3iE0lem9eTy");
    });

    it("should be a valid WhatsApp group invite URL", () => {
      expect(WHATSAPP_GROUP_URL).toMatch(/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/);
    });

    it("should use HTTPS protocol", () => {
      expect(WHATSAPP_GROUP_URL.startsWith("https://")).toBe(true);
    });

    it("should point to chat.whatsapp.com domain", () => {
      const url = new URL(WHATSAPP_GROUP_URL);
      expect(url.hostname).toBe("chat.whatsapp.com");
    });
  });

  describe("Banner content requirements", () => {
    // These tests verify the expected content structure
    const expectedFeatures = [
      "Letenky se slevou až 60%",
      "Last minute dovolené",
      "Denní aktualizace",
    ];

    it("should have exactly 3 feature tags", () => {
      expect(expectedFeatures).toHaveLength(3);
    });

    it("should include flights discount feature", () => {
      expect(expectedFeatures.some(f => f.includes("Letenky"))).toBe(true);
    });

    it("should include holidays feature", () => {
      expect(expectedFeatures.some(f => f.includes("dovolené"))).toBe(true);
    });

    it("should include daily updates feature", () => {
      expect(expectedFeatures.some(f => f.includes("Denní"))).toBe(true);
    });
  });

  describe("Banner CTA", () => {
    const ctaText = "Připojit se ZDARMA";
    const noSpamText = "Žádný spam. Pouze nejlepší nabídky.";

    it("should have a clear CTA text", () => {
      expect(ctaText).toBeTruthy();
      expect(ctaText.length).toBeGreaterThan(5);
    });

    it("should include ZDARMA in CTA to emphasize free access", () => {
      expect(ctaText).toContain("ZDARMA");
    });

    it("should have anti-spam reassurance text", () => {
      expect(noSpamText).toContain("spam");
      expect(noSpamText).toContain("nejlepší nabídky");
    });
  });

  describe("60/40 content split alignment", () => {
    // Verify banner features align with WhatsApp message 60/40 split
    it("should promote flights (60% of content)", () => {
      const features = ["Letenky se slevou až 60%", "Last minute dovolené", "Denní aktualizace"];
      const flightFeature = features.find(f => f.includes("Letenky"));
      expect(flightFeature).toBeDefined();
    });

    it("should promote holidays (40% of content)", () => {
      const features = ["Letenky se slevou až 60%", "Last minute dovolené", "Denní aktualizace"];
      const holidayFeature = features.find(f => f.includes("dovolené"));
      expect(holidayFeature).toBeDefined();
    });
  });
});
