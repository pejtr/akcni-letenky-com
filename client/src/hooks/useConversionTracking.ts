/**
 * useConversionTracking Hook
 * 
 * Tracks user journey through the conversion funnel.
 * Automatically tracks page visits and provides methods for other funnel events.
 */

import { useEffect, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { 
  trackViewContent, 
  trackInitiateCheckout, 
  trackNewsletterSignup, 
  trackWishlistAdd,
  trackSearch as trackMetaSearch
} from "@/components/MetaPixel";

import { trackAffiliateRedirect } from "@/lib/leadosTracking";

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
    trackDestinationView: (slug: string) => {
      trackEvent("destination_view", { slug });
      // Meta Pixel: ViewContent event
      trackViewContent(slug, undefined, "destination");
    },
    trackOfferView: (offerId: string, price?: number, type?: "flight" | "vacation") => {
      trackEvent("offer_view", { offerId });
      // Meta Pixel: ViewContent event with price
      if (price && type) {
        trackViewContent(offerId, price, type);
      }
    },
    trackAffiliateClick: (destination: string, price?: number, provider?: string) => {
      trackEvent("affiliate_click", { destination });
      trackAffiliateRedirect(provider || destination);
      // Meta Pixel: InitiateCheckout event (user is starting purchase journey)
      if (price) {
        trackInitiateCheckout(destination, price, provider || "pelikan");
      }
    },
    trackNewsletterSignup: () => {
      trackEvent("newsletter_signup");
      // Meta Pixel: Lead event
      trackNewsletterSignup();
    },
    trackPriceAlertSet: (destination: string) => {
      trackEvent("price_alert_set", { destination });
      // Meta Pixel: AddToWishlist event (price alert is similar to wishlist)
      trackWishlistAdd(destination, undefined);
    },
    trackSearch: (query: string, origin?: string) => {
      trackEvent("search", { query, origin });
      // Meta Pixel: Search event
      trackMetaSearch(query);
    },
    trackEvent,
  };
}
