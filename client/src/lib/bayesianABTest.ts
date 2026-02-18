/**
 * Bayesian A/B Testing Library
 * Uses Beta distribution for conversion rate inference
 * Provides probability of being best, expected loss, and credible intervals
 */

/**
 * Beta distribution class for Bayesian inference
 */
export class BetaDistribution {
  alpha: number; // successes + prior alpha
  beta: number;  // failures + prior beta

  constructor(successes: number, failures: number, priorAlpha: number = 1, priorBeta: number = 1) {
    // Uniform prior (alpha=1, beta=1) is uninformative
    this.alpha = successes + priorAlpha;
    this.beta = failures + priorBeta;
  }

  /**
   * Get mean of the distribution (expected conversion rate)
   */
  mean(): number {
    return this.alpha / (this.alpha + this.beta);
  }

  /**
   * Get mode of the distribution (most likely conversion rate)
   */
  mode(): number {
    if (this.alpha > 1 && this.beta > 1) {
      return (this.alpha - 1) / (this.alpha + this.beta - 2);
    }
    return this.mean();
  }

  /**
   * Get variance of the distribution
   */
  variance(): number {
    const sum = this.alpha + this.beta;
    return (this.alpha * this.beta) / (sum * sum * (sum + 1));
  }

  /**
   * Get standard deviation
   */
  std(): number {
    return Math.sqrt(this.variance());
  }

  /**
   * Sample from Beta distribution using rejection sampling
   */
  sample(): number {
    // Use Gamma distribution approximation for Beta sampling
    const gammaA = this.gammaRandom(this.alpha);
    const gammaB = this.gammaRandom(this.beta);
    return gammaA / (gammaA + gammaB);
  }

  /**
   * Generate random sample from Gamma distribution
   * Using Marsaglia and Tsang's method
   */
  private gammaRandom(shape: number): number {
    if (shape < 1) {
      // Use Johnk's generator for shape < 1
      return this.gammaRandom(shape + 1) * Math.pow(Math.random(), 1 / shape);
    }

    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);

    while (true) {
      let x, v;
      do {
        x = this.normalRandom();
        v = 1 + c * x;
      } while (v <= 0);

      v = v * v * v;
      const u = Math.random();
      const x2 = x * x;

      if (u < 1 - 0.0331 * x2 * x2) {
        return d * v;
      }

      if (Math.log(u) < 0.5 * x2 + d * (1 - v + Math.log(v))) {
        return d * v;
      }
    }
  }

  /**
   * Generate random sample from standard normal distribution
   * Using Box-Muller transform
   */
  private normalRandom(): number {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  /**
   * Calculate credible interval using percentile method
   * @param samples - Array of samples from the distribution
   * @param credibility - Credibility level (e.g., 0.95 for 95% CI)
   */
  static credibleInterval(samples: number[], credibility: number = 0.95): [number, number] {
    const sorted = samples.slice().sort((a, b) => a - b);
    const lower = Math.floor(samples.length * (1 - credibility) / 2);
    const upper = Math.floor(samples.length * (1 + credibility) / 2);
    return [sorted[lower], sorted[upper]];
  }
}

/**
 * Bayesian A/B test result for a single variant
 */
export interface BayesianVariantResult {
  variant: string;
  mean: number;
  mode: number;
  std: number;
  credibleInterval: [number, number];
  probabilityBest: number;
  expectedLoss: number;
}

/**
 * Calculate Bayesian A/B test results for multiple variants
 * @param variants - Array of variant data {name, successes, failures}
 * @param numSamples - Number of Monte Carlo samples (default 10000)
 * @returns Array of Bayesian results for each variant
 */
export function calculateBayesianABTest(
  variants: Array<{ name: string; successes: number; failures: number }>,
  numSamples: number = 10000
): BayesianVariantResult[] {
  // Create Beta distributions for each variant
  const distributions = variants.map(
    (v) => new BetaDistribution(v.successes, v.failures)
  );

  // Generate samples for each variant
  const allSamples: number[][] = distributions.map((dist) =>
    Array.from({ length: numSamples }, () => dist.sample())
  );

  // Calculate probability of being best for each variant
  const probabilityBest = distributions.map((_, i) => {
    let countBest = 0;
    for (let j = 0; j < numSamples; j++) {
      const isBest = allSamples.every((samples, k) => 
        k === i || allSamples[i][j] >= samples[j]
      );
      if (isBest) countBest++;
    }
    return countBest / numSamples;
  });

  // Calculate expected loss for each variant
  const expectedLoss = distributions.map((_, i) => {
    let totalLoss = 0;
    for (let j = 0; j < numSamples; j++) {
      // Loss is the difference between the best variant and this variant
      const maxValue = Math.max(...allSamples.map((samples) => samples[j]));
      totalLoss += maxValue - allSamples[i][j];
    }
    return totalLoss / numSamples;
  });

  // Calculate credible intervals
  const credibleIntervals = allSamples.map((samples) =>
    BetaDistribution.credibleInterval(samples, 0.95)
  );

  // Return results
  return variants.map((v, i) => ({
    variant: v.name,
    mean: distributions[i].mean(),
    mode: distributions[i].mode(),
    std: distributions[i].std(),
    credibleInterval: credibleIntervals[i],
    probabilityBest: probabilityBest[i],
    expectedLoss: expectedLoss[i],
  }));
}

/**
 * Determine if we should stop the test based on Bayesian criteria
 * @param results - Bayesian results for all variants
 * @param minProbability - Minimum probability threshold (default 0.95)
 * @param maxLoss - Maximum acceptable loss (default 0.01 = 1%)
 * @returns {shouldStop, winner} - Whether to stop and which variant won
 */
export function shouldStopTest(
  results: BayesianVariantResult[],
  minProbability: number = 0.95,
  maxLoss: number = 0.01
): { shouldStop: boolean; winner: string | null } {
  // Find variant with highest probability of being best
  const bestVariant = results.reduce((best, current) =>
    current.probabilityBest > best.probabilityBest ? current : best
  );

  // Stop if probability is high enough and expected loss is low enough
  const shouldStop =
    bestVariant.probabilityBest >= minProbability &&
    bestVariant.expectedLoss <= maxLoss;

  return {
    shouldStop,
    winner: shouldStop ? bestVariant.variant : null,
  };
}

/**
 * Get recommendation based on Bayesian results
 * @param results - Bayesian results for all variants
 * @returns Human-readable recommendation
 */
export function getBayesianRecommendation(results: BayesianVariantResult[]): string {
  const bestVariant = results.reduce((best, current) =>
    current.probabilityBest > best.probabilityBest ? current : best
  );

  if (bestVariant.probabilityBest >= 0.95) {
    return `Silně doporučujeme variantu "${bestVariant.variant}" (${(bestVariant.probabilityBest * 100).toFixed(1)}% pravděpodobnost, že je nejlepší)`;
  } else if (bestVariant.probabilityBest >= 0.80) {
    return `Varianta "${bestVariant.variant}" je pravděpodobně nejlepší (${(bestVariant.probabilityBest * 100).toFixed(1)}%), ale doporučujeme ještě počkat na více dat`;
  } else if (bestVariant.probabilityBest >= 0.60) {
    return `Varianta "${bestVariant.variant}" mírně vede (${(bestVariant.probabilityBest * 100).toFixed(1)}%), ale rozdíly nejsou dostatečně jasné`;
  } else {
    return `Žádná varianta výrazně nevede. Pokračujte v testování pro jasnější výsledky.`;
  }
}

/**
 * Format credible interval as string
 */
export function formatCredibleInterval(ci: [number, number]): string {
  return `${(ci[0] * 100).toFixed(1)}% - ${(ci[1] * 100).toFixed(1)}%`;
}
