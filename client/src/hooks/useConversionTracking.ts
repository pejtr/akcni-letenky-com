/**
 * useConversionTracking Hook
 * 
 * Tracks user journey through the conversion funnel.
 * Automatically tracks page visits and provides methods for other funnel events.
 */

import { useEffect, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";

function getSessionId(): string {
  let sid = sessionStorage.getItem("conversion_session_id");
  if (!sid) {
    sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem("conversion_session_id", sid);
  }
  return sid;
}

export function useConversionTracking() {
  const trackMutation = trpc.conversionFunnel.trackEvent.useMutation();
  const trackedRef = useRef(false);

  // Track page visit on mount
  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    
    const sessionId = getSessionId();
    trackMutation.mutate({
      sessionId,
      eventType: "page_visit",
      page: window.location.pathname,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const trackEvent = useCallback((eventType: string, metadata?: Record<string, any>) => {
    const sessionId = getSessionId();
    trackMutation.mutate({
      sessionId,
      eventType,
      page: window.location.pathname,
      metadata,
    });
  }, [trackMutation]);

  return {
    trackDestinationView: (slug: string) => trackEvent("destination_view", { slug }),
    trackOfferView: (offerId: string) => trackEvent("offer_view", { offerId }),
    trackAffiliateClick: (destination: string) => trackEvent("affiliate_click", { destination }),
    trackNewsletterSignup: () => trackEvent("newsletter_signup"),
    trackPriceAlertSet: (destination: string) => trackEvent("price_alert_set", { destination }),
    trackEvent,
  };
}
