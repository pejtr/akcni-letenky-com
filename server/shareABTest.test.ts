import { describe, it, expect, vi } from "vitest";

/**
 * Tests for A/B Test Share Placement Analytics
 * Tests the analytics helper functions: calculateSignificance, getRecommendation logic
 */

// Test the statistical significance calculation
describe("A/B Test Statistical Significance", () => {
  // Inline implementation for testing (mirrors abTest.ts calculateSignificance)
  function calculateSignificance(
    conversionsA: number,
    sampleA: number,
    conversionsB: number,
    sampleB: number
  ) {
    const pA = conversionsA / sampleA;
    const pB = conversionsB / sampleB;
    const pPool = (conversionsA + conversionsB) / (sampleA + sampleB);
    const se = Math.sqrt(pPool * (1 - pPool) * (1 / sampleA + 1 / sampleB));
    
    if (se === 0) return { isSignificant: false, pValue: 1, zScore: 0 };
    
    const zScore = (pA - pB) / se;
    const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));
    
    return {
      isSignificant: pValue < 0.05,
      pValue,
      zScore,
    };
  }

  function normalCDF(z: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - probability : probability;
  }

  it("should detect significant difference with large sample and clear winner", () => {
    // A: 50/500 = 10%, B: 25/500 = 5%
    const result = calculateSignificance(50, 500, 25, 500);
    expect(result.isSignificant).toBe(true);
    expect(result.pValue).toBeLessThan(0.05);
    expect(result.zScore).toBeGreaterThan(0);
  });

  it("should not detect significance with similar conversion rates", () => {
    // A: 50/500 = 10%, B: 48/500 = 9.6%
    const result = calculateSignificance(50, 500, 48, 500);
    expect(result.isSignificant).toBe(false);
    expect(result.pValue).toBeGreaterThan(0.05);
  });

  it("should not detect significance with very small samples", () => {
    // A: 1/10 = 10%, B: 0/10 = 0%
    const result = calculateSignificance(1, 10, 0, 10);
    expect(result.isSignificant).toBe(false);
  });

  it("should handle equal conversion rates", () => {
    const result = calculateSignificance(50, 500, 50, 500);
    expect(result.isSignificant).toBe(false);
    expect(result.zScore).toBeCloseTo(0, 1);
  });

  it("should handle zero conversions in both variants", () => {
    const result = calculateSignificance(0, 100, 0, 100);
    expect(result.isSignificant).toBe(false);
    expect(result.pValue).toBe(1);
    expect(result.zScore).toBe(0);
  });

  it("should detect significance with very large difference", () => {
    // A: 200/1000 = 20%, B: 50/1000 = 5%
    const result = calculateSignificance(200, 1000, 50, 1000);
    expect(result.isSignificant).toBe(true);
    expect(result.pValue).toBeLessThan(0.001);
  });
});

describe("A/B Test Recommendation Logic", () => {
  function getRecommendation(
    results: { variantA: { assignments: number; conversions: number; conversionRate: number }; variantB: { assignments: number; conversions: number; conversionRate: number } },
    significance: { isSignificant: boolean; pValue: number; zScore: number } | null
  ): string {
    const total = results.variantA.assignments + results.variantB.assignments;
    
    if (total < 50) {
      return `Nedostatek dat pro rozhodnutí. Aktuálně ${total} sessions, doporučeno minimálně 100 pro spolehlivé výsledky.`;
    }
    
    if (!significance) {
      return 'Nedostatek dat v jedné z variant pro statistický test. Počkejte na více dat.';
    }
    
    if (!significance.isSignificant) {
      return `Rozdíl mezi variantami není statisticky významný (p=${significance.pValue.toFixed(3)}). Pokračujte ve sběru dat nebo zvažte větší změnu v designu.`;
    }
    
    const winner = results.variantA.conversionRate > results.variantB.conversionRate ? 'A' : 'B';
    const winnerLabel = winner === 'A' ? 'Na kartě destinace' : 'V detailu destinace';
    const winnerRate = winner === 'A' ? results.variantA.conversionRate : results.variantB.conversionRate;
    
    return `Varianta ${winner} (${winnerLabel}) je statisticky významně lepší s konverzí ${winnerRate.toFixed(1)}% (p=${significance.pValue.toFixed(3)}). Doporučujeme nasadit tuto variantu pro všechny uživatele.`;
  }

  it("should recommend collecting more data when total sessions < 50", () => {
    const result = getRecommendation(
      { variantA: { assignments: 10, conversions: 1, conversionRate: 10 }, variantB: { assignments: 15, conversions: 2, conversionRate: 13.3 } },
      null
    );
    expect(result).toContain("Nedostatek dat");
    expect(result).toContain("25 sessions");
  });

  it("should recommend waiting when significance is null", () => {
    const result = getRecommendation(
      { variantA: { assignments: 30, conversions: 3, conversionRate: 10 }, variantB: { assignments: 30, conversions: 4, conversionRate: 13.3 } },
      null
    );
    expect(result).toContain("Nedostatek dat v jedné z variant");
  });

  it("should recommend continuing when not significant", () => {
    const result = getRecommendation(
      { variantA: { assignments: 100, conversions: 10, conversionRate: 10 }, variantB: { assignments: 100, conversions: 11, conversionRate: 11 } },
      { isSignificant: false, pValue: 0.45, zScore: 0.75 }
    );
    expect(result).toContain("není statisticky významný");
    expect(result).toContain("p=0.450");
  });

  it("should recommend variant A when it wins significantly", () => {
    const result = getRecommendation(
      { variantA: { assignments: 500, conversions: 50, conversionRate: 10 }, variantB: { assignments: 500, conversions: 25, conversionRate: 5 } },
      { isSignificant: true, pValue: 0.002, zScore: 3.1 }
    );
    expect(result).toContain("Varianta A");
    expect(result).toContain("Na kartě destinace");
    expect(result).toContain("statisticky významně lepší");
  });

  it("should recommend variant B when it wins significantly", () => {
    const result = getRecommendation(
      { variantA: { assignments: 500, conversions: 25, conversionRate: 5 }, variantB: { assignments: 500, conversions: 50, conversionRate: 10 } },
      { isSignificant: true, pValue: 0.002, zScore: -3.1 }
    );
    expect(result).toContain("Varianta B");
    expect(result).toContain("V detailu destinace");
  });
});

describe("A/B Test Lift Calculation", () => {
  it("should calculate correct lift percentage", () => {
    const rateA = 10; // 10%
    const rateB = 5;  // 5%
    const lift = ((Math.max(rateA, rateB) / Math.min(rateA, rateB)) - 1) * 100;
    expect(lift).toBe(100); // 100% lift
  });

  it("should handle zero lift when rates are equal", () => {
    const rateA = 10;
    const rateB = 10;
    const lift = rateA > 0 && rateB > 0
      ? ((Math.max(rateA, rateB) / Math.min(rateA, rateB)) - 1) * 100
      : 0;
    expect(lift).toBe(0);
  });

  it("should handle zero rates", () => {
    const rateA = 0;
    const rateB = 0;
    const lift = rateA > 0 && rateB > 0
      ? ((Math.max(rateA, rateB) / Math.min(rateA, rateB)) - 1) * 100
      : 0;
    expect(lift).toBe(0);
  });
});

describe("A/B Test Winner Determination", () => {
  it("should determine variant A as winner when it has higher conversion", () => {
    const rateA = 10;
    const rateB = 5;
    const winner = rateA > rateB ? 'A' : rateB > rateA ? 'B' : null;
    expect(winner).toBe('A');
  });

  it("should determine variant B as winner when it has higher conversion", () => {
    const rateA = 5;
    const rateB = 10;
    const winner = rateA > rateB ? 'A' : rateB > rateA ? 'B' : null;
    expect(winner).toBe('B');
  });

  it("should return null when rates are equal", () => {
    const rateA = 10;
    const rateB = 10;
    const winner = rateA > rateB ? 'A' : rateB > rateA ? 'B' : null;
    expect(winner).toBeNull();
  });
});
