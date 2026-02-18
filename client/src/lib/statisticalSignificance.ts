/**
 * Statistical significance calculator for A/B testing
 * Implements z-test for proportions comparison
 */

/**
 * Calculate z-score for two proportions
 * @param p1 - Conversion rate of variant 1 (0-1)
 * @param n1 - Sample size of variant 1
 * @param p2 - Conversion rate of variant 2 (0-1)
 * @param n2 - Sample size of variant 2
 * @returns z-score
 */
export function calculateZScore(p1: number, n1: number, p2: number, n2: number): number {
  // Pooled proportion
  const pooledP = (p1 * n1 + p2 * n2) / (n1 + n2);
  
  // Standard error
  const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
  
  // Z-score
  const z = (p1 - p2) / se;
  
  return z;
}

/**
 * Calculate p-value from z-score (two-tailed test)
 * @param z - z-score
 * @returns p-value
 */
export function calculatePValue(z: number): number {
  // Approximation of cumulative distribution function for standard normal
  const absZ = Math.abs(z);
  
  // Using error function approximation
  const t = 1 / (1 + 0.2316419 * absZ);
  const d = 0.3989423 * Math.exp(-absZ * absZ / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  // Two-tailed test
  return 2 * p;
}

/**
 * Calculate 95% confidence interval for a proportion
 * @param p - Conversion rate (0-1)
 * @param n - Sample size
 * @returns [lower bound, upper bound]
 */
export function calculateConfidenceInterval(p: number, n: number): [number, number] {
  // Z-value for 95% confidence (1.96)
  const z = 1.96;
  
  // Standard error
  const se = Math.sqrt((p * (1 - p)) / n);
  
  // Confidence interval
  const lower = Math.max(0, p - z * se);
  const upper = Math.min(1, p + z * se);
  
  return [lower, upper];
}

/**
 * Calculate minimum sample size needed for statistical power
 * @param p1 - Expected conversion rate of variant 1
 * @param p2 - Expected conversion rate of variant 2
 * @param alpha - Significance level (default 0.05)
 * @param power - Statistical power (default 0.8)
 * @returns minimum sample size per variant
 */
export function calculateMinimumSampleSize(
  p1: number,
  p2: number,
  alpha: number = 0.05,
  power: number = 0.8
): number {
  // Z-values for alpha and power
  const zAlpha = 1.96; // For alpha = 0.05 (two-tailed)
  const zBeta = 0.84;  // For power = 0.8
  
  // Pooled proportion
  const pooledP = (p1 + p2) / 2;
  
  // Effect size
  const delta = Math.abs(p1 - p2);
  
  // Sample size calculation
  const n = (
    Math.pow(zAlpha + zBeta, 2) * 
    (p1 * (1 - p1) + p2 * (1 - p2))
  ) / Math.pow(delta, 2);
  
  return Math.ceil(n);
}

/**
 * Check if result is statistically significant
 * @param pValue - p-value from test
 * @param alpha - Significance level (default 0.05)
 * @returns true if statistically significant
 */
export function isStatisticallySignificant(pValue: number, alpha: number = 0.05): boolean {
  return pValue < alpha;
}

/**
 * Get significance level label
 * @param pValue - p-value
 * @returns label string
 */
export function getSignificanceLabel(pValue: number): string {
  if (pValue < 0.001) return "Vysoce významné (p < 0.001)";
  if (pValue < 0.01) return "Velmi významné (p < 0.01)";
  if (pValue < 0.05) return "Významné (p < 0.05)";
  return "Není významné (p ≥ 0.05)";
}

/**
 * Format percentage with confidence interval
 * @param rate - Conversion rate (0-1)
 * @param ci - Confidence interval [lower, upper]
 * @returns formatted string
 */
export function formatWithCI(rate: number, ci: [number, number]): string {
  return `${(rate * 100).toFixed(1)}% (95% CI: ${(ci[0] * 100).toFixed(1)}% - ${(ci[1] * 100).toFixed(1)}%)`;
}
