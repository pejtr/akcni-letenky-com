/**
 * Thompson Sampling for Multi-Armed Bandit A/B Testing
 * 
 * Thompson Sampling is a Bayesian approach to the multi-armed bandit problem that
 * dynamically allocates traffic to variants based on their posterior probability
 * of being the best. This minimizes regret and accelerates convergence compared
 * to traditional A/B testing with equal traffic allocation.
 */

/**
 * Beta distribution class for Thompson Sampling
 */
class BetaDistribution {
  constructor(
    public alpha: number,
    public beta: number
  ) {}

  /**
   * Sample from Beta distribution using Gamma distributions
   * Beta(α, β) = Gamma(α, 1) / (Gamma(α, 1) + Gamma(β, 1))
   */
  sample(): number {
    const x = this.sampleGamma(this.alpha, 1);
    const y = this.sampleGamma(this.beta, 1);
    return x / (x + y);
  }

  /**
   * Sample from Gamma distribution using Marsaglia and Tsang method
   */
  private sampleGamma(shape: number, scale: number): number {
    if (shape < 1) {
      // Use Johnk's generator for shape < 1
      return this.sampleGamma(shape + 1, scale) * Math.pow(Math.random(), 1 / shape);
    }

    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);

    while (true) {
      let x, v;
      do {
        x = this.sampleNormal(0, 1);
        v = 1 + c * x;
      } while (v <= 0);

      v = v * v * v;
      const u = Math.random();
      const x2 = x * x;

      if (u < 1 - 0.0331 * x2 * x2) {
        return d * v * scale;
      }

      if (Math.log(u) < 0.5 * x2 + d * (1 - v + Math.log(v))) {
        return d * v * scale;
      }
    }
  }

  /**
   * Sample from standard normal distribution using Box-Muller transform
   */
  private sampleNormal(mean: number, stdDev: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }
}

export interface ThompsonSamplingVariant {
  name: string;
  successes: number;  // Number of conversions
  failures: number;   // Number of non-conversions (clicks - conversions)
}

export interface ThompsonSamplingResult {
  selectedVariant: string;
  probabilities: Record<string, number>;
  allocationPercentages: Record<string, number>;
  cumulativeRegret: number;
}

/**
 * Select a variant using Thompson Sampling
 * 
 * @param variants Array of variants with their success/failure counts
 * @param priorAlpha Prior alpha parameter for Beta distribution (default: 1 = uniform prior)
 * @param priorBeta Prior beta parameter for Beta distribution (default: 1 = uniform prior)
 * @returns Selected variant name and sampling probabilities
 */
export function thompsonSampling(
  variants: ThompsonSamplingVariant[],
  priorAlpha: number = 1,
  priorBeta: number = 1
): { selectedVariant: string; samples: Record<string, number> } {
  const samples: Record<string, number> = {};
  
  // Sample from posterior Beta distribution for each variant
  for (const variant of variants) {
    const alpha = priorAlpha + variant.successes;
    const beta = priorBeta + variant.failures;
    const distribution = new BetaDistribution(alpha, beta);
    samples[variant.name] = distribution.sample();
  }

  // Select variant with highest sample
  const selectedVariant = Object.entries(samples).reduce((best, [name, sample]) =>
    sample > samples[best] ? name : best,
    variants[0].name
  );

  return { selectedVariant, samples };
}

/**
 * Calculate traffic allocation percentages based on Thompson Sampling simulations
 * 
 * @param variants Array of variants with their success/failure counts
 * @param numSimulations Number of simulations to run (default: 10000)
 * @returns Allocation percentages for each variant
 */
export function calculateThompsonAllocation(
  variants: ThompsonSamplingVariant[],
  numSimulations: number = 10000
): Record<string, number> {
  const selectionCounts: Record<string, number> = {};
  
  // Initialize counts
  for (const variant of variants) {
    selectionCounts[variant.name] = 0;
  }

  // Run simulations
  for (let i = 0; i < numSimulations; i++) {
    const { selectedVariant } = thompsonSampling(variants);
    selectionCounts[selectedVariant]++;
  }

  // Convert counts to percentages
  const allocationPercentages: Record<string, number> = {};
  for (const [name, count] of Object.entries(selectionCounts)) {
    allocationPercentages[name] = (count / numSimulations) * 100;
  }

  return allocationPercentages;
}

/**
 * Calculate cumulative regret for Thompson Sampling
 * Regret = (optimal conversion rate - actual conversion rate) * total trials
 * 
 * @param variants Array of variants with their success/failure counts
 * @returns Cumulative regret value
 */
export function calculateRegret(variants: ThompsonSamplingVariant[]): number {
  // Handle empty array edge case
  if (variants.length === 0) {
    return 0;
  }

  // Calculate conversion rate for each variant
  const conversionRates = variants.map(v => {
    const total = v.successes + v.failures;
    return total > 0 ? v.successes / total : 0;
  });

  // Find optimal (highest) conversion rate
  const optimalRate = Math.max(...conversionRates);

  // Calculate total trials and actual conversions
  const totalTrials = variants.reduce((sum, v) => sum + v.successes + v.failures, 0);
  const actualConversions = variants.reduce((sum, v) => sum + v.successes, 0);

  // Regret = optimal conversions - actual conversions
  const optimalConversions = optimalRate * totalTrials;
  const regret = optimalConversions - actualConversions;

  return Math.max(0, regret); // Regret cannot be negative
}

/**
 * Calculate Beta distribution probability density function (PDF)
 * PDF(x; α, β) = (x^(α-1) * (1-x)^(β-1)) / B(α, β)
 * where B(α, β) is the Beta function
 * 
 * @param x Value between 0 and 1 (conversion rate)
 * @param alpha Alpha parameter (successes + prior)
 * @param beta Beta parameter (failures + prior)
 * @returns Probability density at x
 */
export function calculateBetaPDF(x: number, alpha: number, beta: number): number {
  if (x < 0 || x > 1) return 0;
  if (alpha <= 0 || beta <= 0) return 0;

  // Handle edge cases
  if (x === 0) return alpha === 1 ? beta : 0;
  if (x === 1) return beta === 1 ? alpha : 0;

  // Calculate log of Beta function: ln(B(α,β)) = ln(Γ(α)) + ln(Γ(β)) - ln(Γ(α+β))
  const logBeta = logGamma(alpha) + logGamma(beta) - logGamma(alpha + beta);

  // Calculate log of PDF: ln(PDF) = (α-1)ln(x) + (β-1)ln(1-x) - ln(B(α,β))
  const logPDF = (alpha - 1) * Math.log(x) + (beta - 1) * Math.log(1 - x) - logBeta;

  return Math.exp(logPDF);
}

/**
 * Calculate log of Gamma function using Lanczos approximation
 * More numerically stable than calculating Gamma directly
 */
function logGamma(z: number): number {
  if (z <= 0) return Infinity;

  // Lanczos coefficients for g=7
  const g = 7;
  const coef = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];

  if (z < 0.5) {
    // Use reflection formula: Γ(1-z)Γ(z) = π/sin(πz)
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  }

  z -= 1;
  let x = coef[0];
  for (let i = 1; i < g + 2; i++) {
    x += coef[i] / (z + i);
  }

  const t = z + g + 0.5;
  return Math.log(Math.sqrt(2 * Math.PI)) + Math.log(t) * (z + 0.5) - t + Math.log(x);
}

/**
 * Generate Beta distribution density curve data points
 * 
 * @param alpha Alpha parameter (successes + prior)
 * @param beta Beta parameter (failures + prior)
 * @param numPoints Number of points to generate (default: 100)
 * @returns Array of {x, y} points for plotting
 */
export function generateBetaDistributionCurve(
  alpha: number,
  beta: number,
  numPoints: number = 100
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];

  for (let i = 0; i <= numPoints; i++) {
    const x = i / numPoints;
    const y = calculateBetaPDF(x, alpha, beta);
    points.push({ x, y });
  }

  return points;
}

/**
 * Get Thompson Sampling recommendation
 * 
 * @param variants Array of variants with their success/failure counts
 * @param minSamples Minimum number of samples before making recommendation
 * @returns Recommendation object with selected variant and confidence
 */
export function getThompsonRecommendation(
  variants: ThompsonSamplingVariant[],
  minSamples: number = 100
): {
  shouldAct: boolean;
  recommendation: string;
  confidence: number;
  message: string;
} {
  const totalSamples = variants.reduce((sum, v) => sum + v.successes + v.failures, 0);

  if (totalSamples < minSamples) {
    return {
      shouldAct: false,
      recommendation: "",
      confidence: 0,
      message: `Potřebujete alespoň ${minSamples} vzorků. Aktuálně: ${totalSamples}`,
    };
  }

  const allocation = calculateThompsonAllocation(variants);
  const bestVariant = Object.entries(allocation).reduce((best, [name, pct]) =>
    pct > allocation[best] ? name : best,
    variants[0].name
  );

  const confidence = allocation[bestVariant];

  if (confidence >= 80) {
    return {
      shouldAct: true,
      recommendation: bestVariant,
      confidence,
      message: `Doporučujeme ${bestVariant} s ${confidence.toFixed(1)}% pravděpodobností`,
    };
  }

  return {
    shouldAct: false,
    recommendation: bestVariant,
    confidence,
    message: `Pokračujte v testování. Nejlepší varianta: ${bestVariant} (${confidence.toFixed(1)}%)`,
  };
}

/**
 * Store Thompson Sampling data in localStorage
 */
export function storeThompsonData(variants: ThompsonSamplingVariant[]): void {
  const data = variants.reduce((acc, v) => {
    acc[v.name] = { successes: v.successes, failures: v.failures };
    return acc;
  }, {} as Record<string, { successes: number; failures: number }>);

  localStorage.setItem("thompson_sampling_data", JSON.stringify(data));
}

/**
 * Load Thompson Sampling data from localStorage
 */
export function loadThompsonData(): Record<string, { successes: number; failures: number }> | null {
  const stored = localStorage.getItem("thompson_sampling_data");
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}
