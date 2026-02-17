import { useState, useEffect } from "react";

export type CTAVariant = "zobrazit" | "koupit" | "zjistit";

interface ABTestConfig {
  name: string;
  variants: CTAVariant[];
}

const CTA_TEXT: Record<CTAVariant, string> = {
  zobrazit: "Zobrazit nabídku",
  koupit: "Koupit teď",
  zjistit: "Zjistit více",
};

/**
 * A/B Testing hook for CTA button text variants
 * Randomly assigns user to a variant and persists it in localStorage
 */
export function useABTest(config: ABTestConfig) {
  const [variant, setVariant] = useState<CTAVariant>("zobrazit");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storageKey = `ab_test_${config.name}`;
    
    // Check if user already has a variant assigned
    const storedVariant = localStorage.getItem(storageKey) as CTAVariant | null;
    
    if (storedVariant && config.variants.includes(storedVariant)) {
      setVariant(storedVariant);
    } else {
      // Randomly assign a variant
      const randomVariant = config.variants[Math.floor(Math.random() * config.variants.length)];
      setVariant(randomVariant);
      localStorage.setItem(storageKey, randomVariant);
    }
    
    setIsLoading(false);
  }, [config.name, config.variants]);

  return {
    variant,
    isLoading,
    ctaText: CTA_TEXT[variant],
  };
}

/**
 * Track A/B test conversion (click on CTA button)
 */
export function trackABTestConversion(testName: string, variant: CTAVariant) {
  // Send to analytics or backend
  console.log(`[A/B Test] ${testName} - Variant: ${variant} - Conversion`);
  
  // You can integrate with Google Analytics, Meta Pixel, or your own backend here
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "ab_test_conversion", {
      test_name: testName,
      variant: variant,
    });
  }
}
