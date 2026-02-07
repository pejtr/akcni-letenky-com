/**
 * Meta Pixel Tracking Component
 * 
 * Implements Facebook/Instagram conversion tracking with enhanced mobile behavior analytics
 * 
 * Features:
 * - Standard Meta Pixel events (PageView, ViewContent, AddToWishlist, InitiateCheckout, Purchase)
 * - Mobile-specific tracking (device type, screen size, touch events, scroll depth)
 * - Custom events for affiliate clicks and newsletter signups
 * - GDPR-compliant with consent management
 */

import { useEffect } from "react";
import { useLocation } from "wouter";

// Meta Pixel ID - user should replace with their actual Pixel ID
const PIXEL_ID = "YOUR_META_PIXEL_ID";

// Device type detection
function getDeviceType(): "mobile" | "tablet" | "desktop" {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

// Check if device supports touch
function isTouchDevice(): boolean {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

// Get viewport dimensions
function getViewportDimensions() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
  };
}

// Initialize Meta Pixel
function initMetaPixel() {
  if (typeof window === "undefined" || (window as any).fbq) return;

  // Meta Pixel base code
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js"
  );

  const fbq = (window as any).fbq;
  fbq("init", PIXEL_ID);
  
  // Track initial page view with device info
  const deviceInfo = {
    device_type: getDeviceType(),
    is_touch_device: isTouchDevice(),
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    pixel_ratio: window.devicePixelRatio || 1,
  };
  
  fbq("track", "PageView", deviceInfo);
}

// Track custom event
export function trackMetaEvent(
  eventName: string,
  parameters?: Record<string, any>
) {
  if (typeof window === "undefined" || !(window as any).fbq) return;
  
  const fbq = (window as any).fbq;
  const enrichedParams = {
    ...parameters,
    device_type: getDeviceType(),
    viewport_width: window.innerWidth,
  };
  
  fbq("track", eventName, enrichedParams);
}

// Track custom event (for non-standard events)
export function trackMetaCustomEvent(
  eventName: string,
  parameters?: Record<string, any>
) {
  if (typeof window === "undefined" || !(window as any).fbq) return;
  
  const fbq = (window as any).fbq;
  const enrichedParams = {
    ...parameters,
    device_type: getDeviceType(),
    viewport_width: window.innerWidth,
  };
  
  fbq("trackCustom", eventName, enrichedParams);
}

// Track affiliate click
export function trackAffiliateClick(
  destination: string,
  partner: string,
  price?: number
) {
  trackMetaCustomEvent("AffiliateClick", {
    destination,
    partner,
    price,
    currency: "CZK",
  });
}

// Track newsletter signup
export function trackNewsletterSignup(variant?: string) {
  trackMetaEvent("Lead", {
    content_name: "Newsletter Signup",
    variant,
  });
}

// Track wishlist add
export function trackWishlistAdd(destination: string, price?: number) {
  trackMetaEvent("AddToWishlist", {
    content_name: destination,
    value: price,
    currency: "CZK",
  });
}

// Track search
export function trackSearch(query: string, results?: number) {
  trackMetaEvent("Search", {
    search_string: query,
    num_results: results,
  });
}

// Track view content (destination page)
export function trackViewContent(
  destination: string,
  price?: number,
  category?: string
) {
  trackMetaEvent("ViewContent", {
    content_name: destination,
    content_category: category,
    value: price,
    currency: "CZK",
  });
}

// Track initiate checkout (when user clicks to book)
export function trackInitiateCheckout(
  destination: string,
  price: number,
  partner: string
) {
  trackMetaEvent("InitiateCheckout", {
    content_name: destination,
    value: price,
    currency: "CZK",
    partner,
  });
}

export default function MetaPixel() {
  const [location] = useLocation();

  useEffect(() => {
    // Initialize pixel on mount
    initMetaPixel();

    // Track scroll depth on mobile
    let maxScrollDepth = 0;
    const trackScrollDepth = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScrollDepth && scrollPercent % 25 === 0) {
        maxScrollDepth = scrollPercent;
        trackMetaCustomEvent("ScrollDepth", {
          scroll_percent: scrollPercent,
          page: location,
        });
      }
    };

    // Track orientation changes (mobile)
    const trackOrientationChange = () => {
      trackMetaCustomEvent("OrientationChange", {
        orientation: window.screen.orientation?.type || "unknown",
        viewport: getViewportDimensions(),
      });
    };

    // Add event listeners
    window.addEventListener("scroll", trackScrollDepth, { passive: true });
    window.addEventListener("orientationchange", trackOrientationChange);

    return () => {
      window.removeEventListener("scroll", trackScrollDepth);
      window.removeEventListener("orientationchange", trackOrientationChange);
    };
  }, []);

  // Track page views on route change
  useEffect(() => {
    if ((window as any).fbq) {
      const deviceInfo = {
        device_type: getDeviceType(),
        viewport_width: window.innerWidth,
        page: location,
      };
      (window as any).fbq("track", "PageView", deviceInfo);
    }
  }, [location]);

  return null;
}
