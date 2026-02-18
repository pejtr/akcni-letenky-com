import { describe, it, expect } from "vitest";
import {
  calculateZScore,
  calculatePValue,
  calculateConfidenceInterval,
  calculateMinimumSampleSize,
  isStatisticallySignificant,
  getSignificanceLabel,
} from "../client/src/lib/statisticalSignificance";

describe("Statistical Significance Calculator", () => {
  describe("calculateZScore", () => {
    it("should calculate z-score correctly for two proportions", () => {
      // Example: variant A has 18/102 conversions, variant B has 12/85 conversions
      const p1 = 18 / 102; // 0.176
      const n1 = 102;
      const p2 = 12 / 85; // 0.141
      const n2 = 85;

      const zScore = calculateZScore(p1, n1, p2, n2);
      
      // Z-score should be positive (variant A is better)
      expect(zScore).toBeGreaterThan(0);
      expect(zScore).toBeCloseTo(0.68, 1); // Approximate expected value
    });

    it("should return negative z-score when variant is worse", () => {
      const p1 = 0.10; // 10% conversion
      const n1 = 100;
      const p2 = 0.15; // 15% conversion
      const n2 = 100;

      const zScore = calculateZScore(p1, n1, p2, n2);
      
      expect(zScore).toBeLessThan(0);
    });

    it("should return zero when proportions are equal", () => {
      const p1 = 0.15;
      const n1 = 100;
      const p2 = 0.15;
      const n2 = 100;

      const zScore = calculateZScore(p1, n1, p2, n2);
      
      expect(zScore).toBeCloseTo(0, 2);
    });
  });

  describe("calculatePValue", () => {
    it("should return p-value close to 0 for large z-scores", () => {
      const zScore = 3.0; // Very significant
      const pValue = calculatePValue(zScore);
      
      expect(pValue).toBeLessThan(0.01);
      expect(pValue).toBeGreaterThan(0);
    });

    it("should return p-value close to 1 for z-score of 0", () => {
      const zScore = 0;
      const pValue = calculatePValue(zScore);
      
      expect(pValue).toBeCloseTo(1, 1);
    });

    it("should return same p-value for positive and negative z-scores (two-tailed)", () => {
      const zScore1 = 2.0;
      const zScore2 = -2.0;
      
      const pValue1 = calculatePValue(zScore1);
      const pValue2 = calculatePValue(zScore2);
      
      expect(pValue1).toBeCloseTo(pValue2, 4);
    });

    it("should return p-value around 0.05 for z-score of 1.96", () => {
      const zScore = 1.96; // Critical value for 95% confidence
      const pValue = calculatePValue(zScore);
      
      expect(pValue).toBeCloseTo(0.05, 2);
    });
  });

  describe("calculateConfidenceInterval", () => {
    it("should calculate 95% CI correctly", () => {
      const p = 0.15; // 15% conversion rate
      const n = 100;

      const [lower, upper] = calculateConfidenceInterval(p, n);
      
      expect(lower).toBeLessThan(p);
      expect(upper).toBeGreaterThan(p);
      expect(lower).toBeGreaterThanOrEqual(0);
      expect(upper).toBeLessThanOrEqual(1);
      
      // CI should be approximately ±7% for this sample
      expect(upper - lower).toBeCloseTo(0.14, 1);
    });

    it("should have wider CI for smaller sample sizes", () => {
      const p = 0.15;
      
      const [lower1, upper1] = calculateConfidenceInterval(p, 50);
      const [lower2, upper2] = calculateConfidenceInterval(p, 200);
      
      const width1 = upper1 - lower1;
      const width2 = upper2 - lower2;
      
      expect(width1).toBeGreaterThan(width2);
    });

    it("should never return CI outside [0, 1]", () => {
      const p = 0.01; // Very low conversion rate
      const n = 10;

      const [lower, upper] = calculateConfidenceInterval(p, n);
      
      expect(lower).toBeGreaterThanOrEqual(0);
      expect(upper).toBeLessThanOrEqual(1);
    });
  });

  describe("calculateMinimumSampleSize", () => {
    it("should calculate minimum sample size for detectable difference", () => {
      const p1 = 0.15; // 15% conversion
      const p2 = 0.10; // 10% conversion (5% absolute difference)

      const minN = calculateMinimumSampleSize(p1, p2);
      
      // For 5% difference, should need several hundred samples
      expect(minN).toBeGreaterThan(200);
      expect(minN).toBeLessThan(1000);
    });

    it("should require larger sample for smaller differences", () => {
      const p1 = 0.15;
      const p2a = 0.10; // 5% difference
      const p2b = 0.14; // 1% difference

      const minN1 = calculateMinimumSampleSize(p1, p2a);
      const minN2 = calculateMinimumSampleSize(p1, p2b);
      
      expect(minN2).toBeGreaterThan(minN1);
    });

    it("should return same sample size for symmetric differences", () => {
      const p1 = 0.15;
      const p2 = 0.10;

      const minN1 = calculateMinimumSampleSize(p1, p2);
      const minN2 = calculateMinimumSampleSize(p2, p1);
      
      expect(minN1).toBeCloseTo(minN2, 0);
    });
  });

  describe("isStatisticallySignificant", () => {
    it("should return true for p-value < 0.05", () => {
      expect(isStatisticallySignificant(0.01)).toBe(true);
      expect(isStatisticallySignificant(0.04)).toBe(true);
    });

    it("should return false for p-value >= 0.05", () => {
      expect(isStatisticallySignificant(0.05)).toBe(false);
      expect(isStatisticallySignificant(0.10)).toBe(false);
      expect(isStatisticallySignificant(0.50)).toBe(false);
    });

    it("should respect custom alpha level", () => {
      const pValue = 0.03;
      
      expect(isStatisticallySignificant(pValue, 0.05)).toBe(true);
      expect(isStatisticallySignificant(pValue, 0.01)).toBe(false);
    });
  });

  describe("getSignificanceLabel", () => {
    it("should return correct labels for different p-values", () => {
      expect(getSignificanceLabel(0.0001)).toContain("Vysoce významné");
      expect(getSignificanceLabel(0.005)).toContain("Velmi významné");
      expect(getSignificanceLabel(0.03)).toContain("Významné");
      expect(getSignificanceLabel(0.10)).toContain("Není významné");
    });
  });

  describe("Integration test: Full A/B test scenario", () => {
    it("should correctly identify significant winner", () => {
      // Variant A (control): 12/85 conversions = 14.1%
      // Variant B (test): 18/102 conversions = 17.6%
      const controlRate = 12 / 85;
      const controlN = 85;
      const testRate = 18 / 102;
      const testN = 102;

      const zScore = calculateZScore(testRate, testN, controlRate, controlN);
      const pValue = calculatePValue(zScore);
      const isSignificant = isStatisticallySignificant(pValue);
      const [lower, upper] = calculateConfidenceInterval(testRate, testN);

      // Test variant is better but not significantly (small sample)
      expect(testRate).toBeGreaterThan(controlRate);
      expect(isSignificant).toBe(false); // Not enough data yet
      expect(lower).toBeLessThan(testRate);
      expect(upper).toBeGreaterThan(testRate);
    });

    it("should identify significant winner with large sample", () => {
      // Variant A: 140/1000 = 14%
      // Variant B: 180/1000 = 18% (4% absolute lift)
      const controlRate = 140 / 1000;
      const controlN = 1000;
      const testRate = 180 / 1000;
      const testN = 1000;

      const zScore = calculateZScore(testRate, testN, controlRate, controlN);
      const pValue = calculatePValue(zScore);
      const isSignificant = isStatisticallySignificant(pValue);

      // With large sample, 4% difference should be significant
      expect(isSignificant).toBe(true);
      expect(pValue).toBeLessThan(0.05);
    });
  });
});
