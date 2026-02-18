import { describe, it, expect } from "vitest";
import {
  BetaDistribution,
  calculateBayesianABTest,
  shouldStopTest,
  getBayesianRecommendation,
  formatCredibleInterval,
} from "../client/src/lib/bayesianABTest";

describe("Bayesian A/B Testing", () => {
  describe("BetaDistribution", () => {
    it("should calculate mean correctly", () => {
      const dist = new BetaDistribution(10, 90); // 10 successes, 90 failures
      const mean = dist.mean();
      
      // With uniform prior (alpha=1, beta=1), mean should be (10+1)/(10+90+1+1) = 11/102 ≈ 0.108
      expect(mean).toBeCloseTo(0.108, 2);
    });

    it("should calculate mode correctly", () => {
      const dist = new BetaDistribution(20, 80); // 20 successes, 80 failures
      const mode = dist.mode();
      
      // Mode = (alpha-1)/(alpha+beta-2) = (21-1)/(21+81-2) = 20/100 = 0.20
      expect(mode).toBeCloseTo(0.20, 2);
    });

    it("should calculate variance correctly", () => {
      const dist = new BetaDistribution(10, 90);
      const variance = dist.variance();
      
      // Variance should be positive and less than 0.25 (max variance for Beta)
      expect(variance).toBeGreaterThan(0);
      expect(variance).toBeLessThan(0.25);
    });

    it("should calculate standard deviation correctly", () => {
      const dist = new BetaDistribution(10, 90);
      const std = dist.std();
      
      // Std should be sqrt(variance)
      expect(std).toBeCloseTo(Math.sqrt(dist.variance()), 4);
    });

    it("should generate samples within [0, 1]", () => {
      const dist = new BetaDistribution(10, 90);
      
      for (let i = 0; i < 100; i++) {
        const sample = dist.sample();
        expect(sample).toBeGreaterThanOrEqual(0);
        expect(sample).toBeLessThanOrEqual(1);
      }
    });

    it("should generate samples with correct mean (Monte Carlo)", () => {
      const dist = new BetaDistribution(50, 50); // Should be centered around 0.5
      const samples = Array.from({ length: 10000 }, () => dist.sample());
      const sampleMean = samples.reduce((sum, s) => sum + s, 0) / samples.length;
      
      // Sample mean should be close to theoretical mean
      expect(sampleMean).toBeCloseTo(dist.mean(), 1);
    });

    it("should calculate credible interval correctly", () => {
      const samples = Array.from({ length: 1000 }, (_, i) => i / 1000); // Uniform samples
      const [lower, upper] = BetaDistribution.credibleInterval(samples, 0.95);
      
      // For uniform distribution, 95% CI should be approximately [0.025, 0.975]
      expect(lower).toBeCloseTo(0.025, 1);
      expect(upper).toBeCloseTo(0.975, 1);
    });
  });

  describe("calculateBayesianABTest", () => {
    it("should calculate results for all variants", () => {
      const variants = [
        { name: "A", successes: 12, failures: 73 }, // 85 clicks, 12 conversions = 14.1%
        { name: "B", successes: 18, failures: 84 }, // 102 clicks, 18 conversions = 17.6%
        { name: "C", successes: 9, failures: 69 },  // 78 clicks, 9 conversions = 11.5%
      ];

      const results = calculateBayesianABTest(variants, 5000);

      expect(results).toHaveLength(3);
      expect(results[0].variant).toBe("A");
      expect(results[1].variant).toBe("B");
      expect(results[2].variant).toBe("C");
    });

    it("should identify best variant correctly", () => {
      const variants = [
        { name: "A", successes: 10, failures: 90 },  // 10% conversion
        { name: "B", successes: 20, failures: 80 },  // 20% conversion (clearly best)
        { name: "C", successes: 5, failures: 95 },   // 5% conversion
      ];

      const results = calculateBayesianABTest(variants, 5000);
      const bestVariant = results.reduce((best, current) =>
        current.probabilityBest > best.probabilityBest ? current : best
      );

      // Variant B should have highest probability of being best
      expect(bestVariant.variant).toBe("B");
      expect(bestVariant.probabilityBest).toBeGreaterThan(0.9);
    });

    it("should calculate probability of being best summing to ~1", () => {
      const variants = [
        { name: "A", successes: 15, failures: 85 },
        { name: "B", successes: 18, failures: 82 },
        { name: "C", successes: 12, failures: 88 },
      ];

      const results = calculateBayesianABTest(variants, 5000);
      const totalProbability = results.reduce((sum, r) => sum + r.probabilityBest, 0);

      // Total probability should be close to 1 (within Monte Carlo error)
      expect(totalProbability).toBeCloseTo(1, 1);
    });

    it("should calculate expected loss correctly", () => {
      const variants = [
        { name: "A", successes: 10, failures: 90 },
        { name: "B", successes: 20, failures: 80 },  // Best variant
        { name: "C", successes: 5, failures: 95 },
      ];

      const results = calculateBayesianABTest(variants, 5000);
      const bestVariant = results.find((r) => r.variant === "B")!;

      // Best variant should have lowest expected loss (close to 0)
      expect(bestVariant.expectedLoss).toBeLessThan(0.01);
      
      // Other variants should have higher expected loss
      const variantA = results.find((r) => r.variant === "A")!;
      const variantC = results.find((r) => r.variant === "C")!;
      expect(variantA.expectedLoss).toBeGreaterThan(bestVariant.expectedLoss);
      expect(variantC.expectedLoss).toBeGreaterThan(variantA.expectedLoss);
    });

    it("should calculate credible intervals correctly", () => {
      const variants = [
        { name: "A", successes: 15, failures: 85 },
      ];

      const results = calculateBayesianABTest(variants, 5000);
      const [lower, upper] = results[0].credibleInterval;

      // Credible interval should contain the mean
      expect(lower).toBeLessThan(results[0].mean);
      expect(upper).toBeGreaterThan(results[0].mean);
      
      // Credible interval should be within [0, 1]
      expect(lower).toBeGreaterThanOrEqual(0);
      expect(upper).toBeLessThanOrEqual(1);
    });

    it("should have wider credible intervals for smaller samples", () => {
      const smallSample = [{ name: "A", successes: 5, failures: 45 }];
      const largeSample = [{ name: "B", successes: 50, failures: 450 }];

      const smallResults = calculateBayesianABTest(smallSample, 5000);
      const largeResults = calculateBayesianABTest(largeSample, 5000);

      const smallWidth = smallResults[0].credibleInterval[1] - smallResults[0].credibleInterval[0];
      const largeWidth = largeResults[0].credibleInterval[1] - largeResults[0].credibleInterval[0];

      expect(smallWidth).toBeGreaterThan(largeWidth);
    });
  });

  describe("shouldStopTest", () => {
    it("should recommend stopping when probability is high and loss is low", () => {
      const results = [
        { variant: "A", mean: 0.10, mode: 0.10, std: 0.03, credibleInterval: [0.05, 0.15] as [number, number], probabilityBest: 0.02, expectedLoss: 0.08 },
        { variant: "B", mean: 0.18, mode: 0.18, std: 0.03, credibleInterval: [0.13, 0.23] as [number, number], probabilityBest: 0.96, expectedLoss: 0.005 },
        { variant: "C", mean: 0.12, mode: 0.12, std: 0.03, credibleInterval: [0.07, 0.17] as [number, number], probabilityBest: 0.02, expectedLoss: 0.06 },
      ];

      const { shouldStop, winner } = shouldStopTest(results, 0.95, 0.01);

      expect(shouldStop).toBe(true);
      expect(winner).toBe("B");
    });

    it("should not recommend stopping when probability is low", () => {
      const results = [
        { variant: "A", mean: 0.15, mode: 0.15, std: 0.03, credibleInterval: [0.10, 0.20] as [number, number], probabilityBest: 0.40, expectedLoss: 0.02 },
        { variant: "B", mean: 0.16, mode: 0.16, std: 0.03, credibleInterval: [0.11, 0.21] as [number, number], probabilityBest: 0.45, expectedLoss: 0.01 },
        { variant: "C", mean: 0.14, mode: 0.14, std: 0.03, credibleInterval: [0.09, 0.19] as [number, number], probabilityBest: 0.15, expectedLoss: 0.03 },
      ];

      const { shouldStop, winner } = shouldStopTest(results, 0.95, 0.01);

      expect(shouldStop).toBe(false);
      expect(winner).toBeNull();
    });

    it("should not recommend stopping when expected loss is high", () => {
      const results = [
        { variant: "A", mean: 0.10, mode: 0.10, std: 0.03, credibleInterval: [0.05, 0.15] as [number, number], probabilityBest: 0.02, expectedLoss: 0.08 },
        { variant: "B", mean: 0.18, mode: 0.18, std: 0.03, credibleInterval: [0.13, 0.23] as [number, number], probabilityBest: 0.96, expectedLoss: 0.05 }, // High loss
        { variant: "C", mean: 0.12, mode: 0.12, std: 0.03, credibleInterval: [0.07, 0.17] as [number, number], probabilityBest: 0.02, expectedLoss: 0.06 },
      ];

      const { shouldStop, winner } = shouldStopTest(results, 0.95, 0.01);

      expect(shouldStop).toBe(false);
      expect(winner).toBeNull();
    });
  });

  describe("getBayesianRecommendation", () => {
    it("should recommend strong winner when probability >= 0.95", () => {
      const results = [
        { variant: "A", mean: 0.10, mode: 0.10, std: 0.03, credibleInterval: [0.05, 0.15] as [number, number], probabilityBest: 0.02, expectedLoss: 0.08 },
        { variant: "B", mean: 0.18, mode: 0.18, std: 0.03, credibleInterval: [0.13, 0.23] as [number, number], probabilityBest: 0.96, expectedLoss: 0.005 },
        { variant: "C", mean: 0.12, mode: 0.12, std: 0.03, credibleInterval: [0.07, 0.17] as [number, number], probabilityBest: 0.02, expectedLoss: 0.06 },
      ];

      const recommendation = getBayesianRecommendation(results);

      expect(recommendation).toContain("Silně doporučujeme");
      expect(recommendation).toContain("B");
    });

    it("should recommend waiting when probability is between 0.80 and 0.95", () => {
      const results = [
        { variant: "A", mean: 0.15, mode: 0.15, std: 0.03, credibleInterval: [0.10, 0.20] as [number, number], probabilityBest: 0.10, expectedLoss: 0.03 },
        { variant: "B", mean: 0.18, mode: 0.18, std: 0.03, credibleInterval: [0.13, 0.23] as [number, number], probabilityBest: 0.85, expectedLoss: 0.01 },
        { variant: "C", mean: 0.14, mode: 0.14, std: 0.03, credibleInterval: [0.09, 0.19] as [number, number], probabilityBest: 0.05, expectedLoss: 0.04 },
      ];

      const recommendation = getBayesianRecommendation(results);

      expect(recommendation).toContain("pravděpodobně nejlepší");
      expect(recommendation).toContain("počkat");
    });

    it("should recommend continuing test when no clear winner", () => {
      const results = [
        { variant: "A", mean: 0.15, mode: 0.15, std: 0.03, credibleInterval: [0.10, 0.20] as [number, number], probabilityBest: 0.35, expectedLoss: 0.02 },
        { variant: "B", mean: 0.16, mode: 0.16, std: 0.03, credibleInterval: [0.11, 0.21] as [number, number], probabilityBest: 0.40, expectedLoss: 0.01 },
        { variant: "C", mean: 0.14, mode: 0.14, std: 0.03, credibleInterval: [0.09, 0.19] as [number, number], probabilityBest: 0.25, expectedLoss: 0.03 },
      ];

      const recommendation = getBayesianRecommendation(results);

      expect(recommendation).toContain("Pokračujte v testování");
    });
  });

  describe("formatCredibleInterval", () => {
    it("should format credible interval correctly", () => {
      const ci: [number, number] = [0.123, 0.456];
      const formatted = formatCredibleInterval(ci);

      expect(formatted).toBe("12.3% - 45.6%");
    });

    it("should handle edge cases", () => {
      const ci1: [number, number] = [0, 1];
      const formatted1 = formatCredibleInterval(ci1);
      expect(formatted1).toBe("0.0% - 100.0%");

      const ci2: [number, number] = [0.001, 0.999];
      const formatted2 = formatCredibleInterval(ci2);
      expect(formatted2).toBe("0.1% - 99.9%");
    });
  });

  describe("Integration: Frequentist vs Bayesian comparison", () => {
    it("should provide consistent conclusions for clear winner", () => {
      // Variant B is clearly better with large sample
      const variants = [
        { name: "A", successes: 140, failures: 860 },  // 14%
        { name: "B", successes: 220, failures: 780 },  // 22% (8% absolute lift)
        { name: "C", successes: 100, failures: 900 },  // 10%
      ];

      const bayesianResults = calculateBayesianABTest(variants, 10000);
      const bestBayesian = bayesianResults.reduce((best, current) =>
        current.probabilityBest > best.probabilityBest ? current : best
      );

      // Both methods should identify B as winner
      expect(bestBayesian.variant).toBe("B");
      expect(bestBayesian.probabilityBest).toBeGreaterThan(0.99);
    });

    it("should handle uncertain scenarios differently", () => {
      // Small sample, unclear winner
      const variants = [
        { name: "A", successes: 12, failures: 73 },
        { name: "B", successes: 18, failures: 84 },
        { name: "C", successes: 9, failures: 69 },
      ];

      const bayesianResults = calculateBayesianABTest(variants, 10000);
      const bestBayesian = bayesianResults.reduce((best, current) =>
        current.probabilityBest > best.probabilityBest ? current : best
      );

      // Bayesian should still provide probability estimate
      expect(bestBayesian.probabilityBest).toBeGreaterThan(0.3);
      expect(bestBayesian.probabilityBest).toBeLessThan(0.95);
      
      // Expected loss should be relatively small for best variant
      expect(bestBayesian.expectedLoss).toBeLessThan(0.02);
    });
  });
});
