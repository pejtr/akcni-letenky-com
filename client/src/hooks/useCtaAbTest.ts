/**
 * CTA A/B Testing Hook
 *
 * Legacy CTA experiments are kept factual and free of fabricated scarcity.
 * The redesigned homepage establishes a stable baseline and does not use these
 * experiments until enough first-party funnel data is collected.
 */

import { useEffect, useCallback, useRef } from "react";
import { getVariant, trackCTAClick, trackEvent, type ABTestVariant } from "@/lib/abTest";

export interface CtaVariant {
  text: string;
  subtext?: string;
  emoji?: string;
  color?: string;
}

export interface CtaTestConfig {
  testName: string;
  position: string;
  variantA: CtaVariant;
  variantB: CtaVariant;
}

export const CTA_TESTS: Record<string, CtaTestConfig> = {
  hero_cta: {
    testName: "cta_hero_v2",
    position: "hero",
    variantA: { text: "Prohlédnout dnešní akce" },
    variantB: { text: "Najít konkrétní let" },
  },
  featured_cta: {
    testName: "cta_featured_v2",
    position: "featured",
    variantA: { text: "Zobrazit nabídku" },
    variantB: { text: "Ověřit cenu u partnera" },
  },
  footer_cta: {
    testName: "cta_footer_v2",
    position: "footer",
    variantA: { text: "Prohlédnout letenky" },
    variantB: { text: "Nastavit hlídač cen" },
  },
  reservation_button: {
    testName: "cta_reservation_v1",
    position: "header_reservation",
    variantA: { text: "Najít let" },
    variantB: { text: "Prohlédnout nabídky" },
  },
  sticky_banner: {
    testName: "cta_sticky_v3",
    position: "sticky_banner",
    variantA: { text: "Prohlédnout aktuální nabídky" },
    variantB: { text: "Nastavit hlídač cen" },
  },
};

export function useCtaAbTest(testKey: string) {
  const config = CTA_TESTS[testKey];
  if (!config) throw new Error(`Unknown CTA test: ${testKey}`);

  const variant = getVariant(config.testName);
  const ctaVariant = variant === "A" ? config.variantA : config.variantB;
  const impressionTracked = useRef(false);

  useEffect(() => {
    if (impressionTracked.current) return;
    trackEvent(config.testName, "cta_impression", {
      position: config.position,
      variant,
      text: ctaVariant.text,
    }).catch(() => {});
    impressionTracked.current = true;
  }, [config.testName, config.position, variant, ctaVariant.text]);

  const trackClick = useCallback(() => {
    trackCTAClick(config.testName, ctaVariant.text);
    try {
      sessionStorage.setItem(
        "last_cta_variant",
        JSON.stringify({
          testName: config.testName,
          position: config.position,
          variant,
          text: ctaVariant.text,
          timestamp: Date.now(),
        }),
      );
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

export function getLastCtaInteraction(): {
  testName: string;
  position: string;
  variant: ABTestVariant;
  text: string;
  timestamp: number;
} | null {
  try {
    const stored = sessionStorage.getItem("last_cta_variant");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}
