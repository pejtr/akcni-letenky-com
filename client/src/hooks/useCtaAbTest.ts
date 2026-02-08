/**
 * CTA A/B Testing Hook
 * 
 * Manages A/B testing for CTA (Call-to-Action) button texts on the homepage.
 * Supports multiple CTA positions with different variant texts.
 * Tracks impressions and clicks for conversion analysis.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { getVariant, trackCTAClick, trackEvent, type ABTestVariant } from "@/lib/abTest";

export interface CtaVariant {
  text: string;
  subtext?: string;
  emoji?: string;
  color?: string;
}

export interface CtaTestConfig {
  testName: string;
  position: string; // e.g., 'hero', 'featured', 'footer', 'sticky_banner'
  variantA: CtaVariant;
  variantB: CtaVariant;
}

// Pre-defined CTA A/B tests for different positions on the homepage
export const CTA_TESTS: Record<string, CtaTestConfig> = {
  hero_cta: {
    testName: "cta_hero_v2",
    position: "hero",
    variantA: {
      text: "Vyhledat letenky",
      emoji: "🔍",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    variantB: {
      text: "Najít nejlevnější let",
      emoji: "✈️",
      subtext: "Ušetřete až 60%",
      color: "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
    },
  },
  featured_cta: {
    testName: "cta_featured_v2",
    position: "featured",
    variantA: {
      text: "Zobrazit nabídku",
      emoji: "→",
    },
    variantB: {
      text: "Chci tuto cenu!",
      emoji: "🔥",
      subtext: "Jen pár míst",
    },
  },
  footer_cta: {
    testName: "cta_footer_v2",
    position: "footer",
    variantA: {
      text: "Zobrazit nejvýhodnější letenky",
      emoji: "👉",
    },
    variantB: {
      text: "Nechci přijít o slevu!",
      emoji: "⚡",
      subtext: "Akce končí brzy",
    },
  },
  sticky_banner: {
    testName: "cta_sticky_v2",
    position: "sticky_banner",
    variantA: {
      text: "Akční nabídka: Letenky od 590 Kč",
      emoji: "✈️",
    },
    variantB: {
      text: "Zbývá jen {{12}} letenek od {{1 499 Kč}}!",
      emoji: "🔥",
      subtext: "Klikněte a ušetřete",
    },
  },
};

export function useCtaAbTest(testKey: string) {
  const config = CTA_TESTS[testKey];
  if (!config) {
    throw new Error(`Unknown CTA test: ${testKey}`);
  }

  const variant = getVariant(config.testName);
  const ctaVariant = variant === "A" ? config.variantA : config.variantB;
  const impressionTracked = useRef(false);

  // Track impression once
  useEffect(() => {
    if (!impressionTracked.current) {
      trackEvent(config.testName, "cta_impression", {
        position: config.position,
        variant,
        text: ctaVariant.text,
      }).catch(() => {});
      impressionTracked.current = true;
    }
  }, [config.testName, config.position, variant, ctaVariant.text]);

  // Track click
  const trackClick = useCallback(() => {
    trackCTAClick(config.testName, ctaVariant.text);
    // Store the last clicked CTA variant for exit-intent personalization
    try {
      sessionStorage.setItem("last_cta_variant", JSON.stringify({
        testName: config.testName,
        position: config.position,
        variant,
        text: ctaVariant.text,
        timestamp: Date.now(),
      }));
    } catch {}
  }, [config.testName, config.position, variant, ctaVariant.text]);

  return {
    variant,
    ctaVariant,
    config,
    trackClick,
    testName: config.testName,
  };
}

/**
 * Get the last CTA variant the user interacted with
 * Used for exit-intent popup personalization
 */
export function getLastCtaInteraction(): {
  testName: string;
  position: string;
  variant: ABTestVariant;
  text: string;
  timestamp: number;
} | null {
  try {
    const stored = sessionStorage.getItem("last_cta_variant");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return null;
}
