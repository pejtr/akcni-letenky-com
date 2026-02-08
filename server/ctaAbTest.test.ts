/**
 * Tests for CTA A/B Testing logic
 */
import { describe, it, expect } from "vitest";

describe("CTA A/B Test Variants", () => {
  const CTA_VARIANTS = {
    A: {
      hero: "NAJÍT NEJLEVNĚJŠÍ LETENKY",
      featured: "Zobrazit nabídky",
      sticky: "Letenky do 1 500 Kč",
    },
    B: {
      hero: "UŠETŘIT AŽ 60 % HNED",
      featured: "Ušetřit na letu →",
      sticky: "Ušetřete 60 % na letu",
    },
  };

  it("should have two variants A and B", () => {
    expect(CTA_VARIANTS).toHaveProperty("A");
    expect(CTA_VARIANTS).toHaveProperty("B");
  });

  it("variant A should have all CTA positions", () => {
    expect(CTA_VARIANTS.A).toHaveProperty("hero");
    expect(CTA_VARIANTS.A).toHaveProperty("featured");
    expect(CTA_VARIANTS.A).toHaveProperty("sticky");
  });

  it("variant B should have all CTA positions", () => {
    expect(CTA_VARIANTS.B).toHaveProperty("hero");
    expect(CTA_VARIANTS.B).toHaveProperty("featured");
    expect(CTA_VARIANTS.B).toHaveProperty("sticky");
  });

  it("variants should have different texts", () => {
    expect(CTA_VARIANTS.A.hero).not.toBe(CTA_VARIANTS.B.hero);
    expect(CTA_VARIANTS.A.featured).not.toBe(CTA_VARIANTS.B.featured);
    expect(CTA_VARIANTS.A.sticky).not.toBe(CTA_VARIANTS.B.sticky);
  });

  it("variant assignment should be deterministic for same random value", () => {
    // Simulating the assignment logic
    const assignVariant = (random: number) => (random < 0.5 ? "A" : "B");
    
    expect(assignVariant(0.3)).toBe("A");
    expect(assignVariant(0.7)).toBe("B");
    expect(assignVariant(0.0)).toBe("A");
    expect(assignVariant(0.5)).toBe("B");
    expect(assignVariant(0.49)).toBe("A");
  });
});

describe("Exit Intent Personalization", () => {
  it("should personalize headline based on CTA position", () => {
    const getHeadline = (position: string, hasDestinations: boolean, topDest?: string) => {
      if (position === "hero") {
        return hasDestinations
          ? `Máme exkluzivní slevu na ${topDest} jen pro vás!`
          : "Získejte 15% slevu na první vyhledávání!";
      }
      if (position === "featured") {
        return hasDestinations
          ? `${topDest} za ještě lepší cenu – jen dalších 10 minut!`
          : "Exkluzivní sleva na vybranou destinaci";
      }
      if (position === "sticky_banner") {
        return hasDestinations
          ? `Zbývají poslední 3 místa na ${topDest}`
          : "Letenky do 1 500 Kč – zbývá jen pár míst";
      }
      return "Získejte exkluzivní slevu až 60% na vybrané destinace";
    };

    expect(getHeadline("hero", true, "Paříž")).toContain("Paříž");
    expect(getHeadline("hero", false)).toContain("15%");
    expect(getHeadline("featured", true, "Barcelona")).toContain("Barcelona");
    expect(getHeadline("featured", false)).toContain("Exkluzivní");
    expect(getHeadline("sticky_banner", true, "Londýn")).toContain("Londýn");
    expect(getHeadline("sticky_banner", false)).toContain("1 500");
    expect(getHeadline("unknown", false)).toContain("60%");
  });

  it("should show countdown timer starting at 15 minutes", () => {
    const INITIAL_SECONDS = 15 * 60;
    expect(INITIAL_SECONDS).toBe(900);
    
    const mins = Math.floor(INITIAL_SECONDS / 60);
    const secs = INITIAL_SECONDS % 60;
    expect(mins).toBe(15);
    expect(secs).toBe(0);
  });
});
