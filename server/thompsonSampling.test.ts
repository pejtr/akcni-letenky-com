import { describe, it, expect, beforeEach } from "vitest";

// Mock localStorage for Node.js environment
global.localStorage = {
  getItem: (key: string) => {
    return (global as any)[`localStorage_${key}`] || null;
  },
  setItem: (key: string, value: string) => {
    (global as any)[`localStorage_${key}`] = value;
  },
  removeItem: (key: string) => {
    delete (global as any)[`localStorage_${key}`];
  },
  clear: () => {
    Object.keys(global).forEach(key => {
      if (key.startsWith('localStorage_')) {
        delete (global as any)[key];
      }
    });
  },
  get length() {
    return Object.keys(global).filter(k => k.startsWith('localStorage_')).length;
  },
  key: (index: number) => {
    const keys = Object.keys(global).filter(k => k.startsWith('localStorage_'));
    return keys[index]?.replace('localStorage_', '') || null;
  },
} as Storage;
import {
  thompsonSampling,
  calculateThompsonAllocation,
  calculateRegret,
  getThompsonRecommendation,
  storeThompsonData,
  loadThompsonData,
  type ThompsonSamplingVariant,
} from "../client/src/lib/thompsonSampling";

describe("Thompson Sampling", () => {
  describe("thompsonSampling", () => {
    it("should select a variant based on Beta distribution sampling", () => {
      const variants: ThompsonSamplingVariant[] = [
        { name: "A", successes: 10, failures: 90 },
        { name: "B", successes: 20, failures: 80 },
        { name: "C", successes: 5, failures: 95 },
      ];

      const result = thompsonSampling(variants);

      expect(result.selectedVariant).toBeDefined();
      expect(["A", "B", "C"]).toContain(result.selectedVariant);
      expect(result.samples).toHaveProperty("A");
      expect(result.samples).toHaveProperty("B");
      expect(result.samples).toHaveProperty("C");
      expect(result.samples.A).toBeGreaterThanOrEqual(0);
      expect(result.samples.A).toBeLessThanOrEqual(1);
    });

    it("should favor variant with higher conversion rate over many samples", () => {
      const variants: ThompsonSamplingVariant[] = [
        { name: "A", successes: 10, failures: 90 },  // 10% CR
        { name: "B", successes: 50, failures: 50 },  // 50% CR
        { name: "C", successes: 5, failures: 95 },   // 5% CR
      ];

      // Run 1000 simulations and count selections
      const selections: Record<string, number> = { A: 0, B: 0, C: 0 };
      for (let i = 0; i < 1000; i++) {
        const result = thompsonSampling(variants);
        selections[result.selectedVariant]++;
      }

      // B should be selected most often (highest conversion rate)
      expect(selections.B).toBeGreaterThan(selections.A);
      expect(selections.B).toBeGreaterThan(selections.C);
    });

    it("should use uniform prior when no data exists", () => {
      const variants: ThompsonSamplingVariant[] = [
        { name: "A", successes: 0, failures: 0 },
        { name: "B", successes: 0, failures: 0 },
        { name: "C", successes: 0, failures: 0 },
      ];

      const result = thompsonSampling(variants);

      // With no data, all variants have equal probability
      expect(result.selectedVariant).toBeDefined();
      expect(["A", "B", "C"]).toContain(result.selectedVariant);
    });
  });

  describe("calculateThompsonAllocation", () => {
    it("should return allocation percentages that sum to 100%", () => {
      const variants: ThompsonSamplingVariant[] = [
        { name: "banner", successes: 12, failures: 73 },
        { name: "text", successes: 18, failures: 84 },
        { name: "minimal", successes: 9, failures: 69 },
      ];

      const allocation = calculateThompsonAllocation(variants, 10000);

      const total = allocation.banner + allocation.text + allocation.minimal;
      expect(total).toBeCloseTo(100, 0); // Allow small rounding error
    });

    it("should allocate more traffic to better-performing variant", () => {
      const variants: ThompsonSamplingVariant[] = [
        { name: "A", successes: 10, failures: 90 },  // 10% CR
        { name: "B", successes: 50, failures: 50 },  // 50% CR
        { name: "C", successes: 5, failures: 95 },   // 5% CR
      ];

      const allocation = calculateThompsonAllocation(variants, 10000);

      // B should get highest allocation
      expect(allocation.B).toBeGreaterThan(allocation.A);
      expect(allocation.B).toBeGreaterThan(allocation.C);
    });

    it("should handle edge case with all zeros", () => {
      const variants: ThompsonSamplingVariant[] = [
        { name: "A", successes: 0, failures: 0 },
        { name: "B", successes: 0, failures: 0 },
        { name: "C", successes: 0, failures: 0 },
      ];

      const allocation = calculateThompsonAllocation(variants, 1000);

      // With no data, allocation should be roughly equal
      const total = allocation.A + allocation.B + allocation.C;
      expect(total).toBeCloseTo(100, 0);
      expect(allocation.A).toBeGreaterThan(20); // Roughly 33%
      expect(allocation.A).toBeLessThan(45);
    });
  });

  describe("calculateRegret", () => {
    it("should return 0 regret when only best variant is tested", () => {
      const variants: ThompsonSamplingVariant[] = [
        { name: "A", successes: 0, failures: 0 },
        { name: "B", successes: 50, failures: 50 },  // 50% CR, only variant tested
        { name: "C", successes: 0, failures: 0 },
      ];

      const regret = calculateRegret(variants);

      expect(regret).toBe(0);
    });

    it("should calculate positive regret when suboptimal variants are tested", () => {
      const variants: ThompsonSamplingVariant[] = [
        { name: "A", successes: 10, failures: 90 },  // 10% CR
        { name: "B", successes: 50, failures: 50 },  // 50% CR (best)
        { name: "C", successes: 5, failures: 95 },   // 5% CR
      ];

      const regret = calculateRegret(variants);

      // Regret should be positive because we tested A and C instead of only B
      expect(regret).toBeGreaterThan(0);
    });

    it("should calculate correct regret value", () => {
      const variants: ThompsonSamplingVariant[] = [
        { name: "A", successes: 10, failures: 90 },  // 10% CR, 100 trials
        { name: "B", successes: 20, failures: 80 },  // 20% CR, 100 trials (best)
      ];

      const regret = calculateRegret(variants);

      // Optimal: 200 trials * 0.2 = 40 conversions
      // Actual: 10 + 20 = 30 conversions
      // Regret: 40 - 30 = 10
      expect(regret).toBeCloseTo(10, 1);
    });

    it("should return 0 for empty variants", () => {
      const variants: ThompsonSamplingVariant[] = [];

      const regret = calculateRegret(variants);

      // Empty array returns NaN from Math.max(...[]), but we expect 0
      expect(regret).toBe(0);
    });
  });

  describe("getThompsonRecommendation", () => {
    it("should not recommend action when insufficient samples", () => {
      const variants: ThompsonSamplingVariant[] = [
        { name: "A", successes: 5, failures: 15 },
        { name: "B", successes: 8, failures: 12 },
      ];

      const recommendation = getThompsonRecommendation(variants, 100);

      expect(recommendation.shouldAct).toBe(false);
      expect(recommendation.message).toContain("Potřebujete alespoň");
    });

    it("should recommend action when high confidence and sufficient samples", () => {
      const variants: ThompsonSamplingVariant[] = [
        { name: "A", successes: 10, failures: 90 },
        { name: "B", successes: 80, failures: 20 },  // Clear winner
        { name: "C", successes: 5, failures: 95 },
      ];

      const recommendation = getThompsonRecommendation(variants, 100);

      expect(recommendation.shouldAct).toBe(true);
      expect(recommendation.recommendation).toBe("B");
      expect(recommendation.confidence).toBeGreaterThan(80);
      expect(recommendation.message).toContain("Doporučujeme");
    });

    it("should not recommend action when confidence is low", () => {
      const variants: ThompsonSamplingVariant[] = [
        { name: "A", successes: 30, failures: 70 },
        { name: "B", successes: 32, failures: 68 },
        { name: "C", successes: 31, failures: 69 },
      ];

      const recommendation = getThompsonRecommendation(variants, 100);

      expect(recommendation.shouldAct).toBe(false);
      expect(recommendation.message).toContain("Pokračujte v testování");
    });
  });

  describe("storeThompsonData and loadThompsonData", () => {
    it("should store and load Thompson Sampling data from localStorage", () => {
      const variants: ThompsonSamplingVariant[] = [
        { name: "banner", successes: 12, failures: 73 },
        { name: "text", successes: 18, failures: 84 },
        { name: "minimal", successes: 9, failures: 69 },
      ];

      storeThompsonData(variants);
      const loaded = loadThompsonData();

      expect(loaded).not.toBeNull();
      expect(loaded?.banner.successes).toBe(12);
      expect(loaded?.banner.failures).toBe(73);
      expect(loaded?.text.successes).toBe(18);
      expect(loaded?.text.failures).toBe(84);
      expect(loaded?.minimal.successes).toBe(9);
      expect(loaded?.minimal.failures).toBe(69);
    });

    it("should return null when no data exists in localStorage", () => {
      localStorage.removeItem("thompson_sampling_data");

      const loaded = loadThompsonData();

      expect(loaded).toBeNull();
    });

    it("should handle corrupted localStorage data gracefully", () => {
      localStorage.setItem("thompson_sampling_data", "invalid json");

      const loaded = loadThompsonData();

      expect(loaded).toBeNull();
    });
  });

  describe("Integration: Full Thompson Sampling workflow", () => {
    it("should work end-to-end: select variant, store data, load data, calculate metrics", () => {
      const variants: ThompsonSamplingVariant[] = [
        { name: "banner", successes: 12, failures: 73 },
        { name: "text", successes: 18, failures: 84 },
        { name: "minimal", successes: 9, failures: 69 },
      ];

      // 1. Select variant using Thompson Sampling
      const selection = thompsonSampling(variants);
      expect(["banner", "text", "minimal"]).toContain(selection.selectedVariant);

      // 2. Store data
      storeThompsonData(variants);

      // 3. Load data
      const loaded = loadThompsonData();
      expect(loaded).not.toBeNull();

      // 4. Calculate allocation
      const allocation = calculateThompsonAllocation(variants);
      const total = allocation.banner + allocation.text + allocation.minimal;
      expect(total).toBeCloseTo(100, 0);

      // 5. Calculate regret
      const regret = calculateRegret(variants);
      expect(regret).toBeGreaterThanOrEqual(0);

      // 6. Get recommendation
      const recommendation = getThompsonRecommendation(variants, 50);
      expect(recommendation.recommendation).toBeDefined();
    });
  });
});
