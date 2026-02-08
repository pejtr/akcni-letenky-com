/**
 * Facebook Pixel tracking helper for retargeting events.
 * Only fires events if the user has consented to cookies and Pixel is loaded.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function isPixelReady(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

/**
 * Track when a user views a flight offer (ViewContent event)
 */
export function trackViewContent(params: {
  contentName: string;
  contentCategory: string;
  value: number;
  currency?: string;
}) {
  if (!isPixelReady()) return;
  window.fbq!("track", "ViewContent", {
    content_name: params.contentName,
    content_category: params.contentCategory,
    value: params.value,
    currency: params.currency || "CZK",
  });
}

/**
 * Track when a user adds a flight to wishlist (AddToWishlist event)
 */
export function trackAddToWishlist(params: {
  contentName: string;
  contentCategory: string;
  value: number;
  currency?: string;
}) {
  if (!isPixelReady()) return;
  window.fbq!("track", "AddToWishlist", {
    content_name: params.contentName,
    content_category: params.contentCategory,
    value: params.value,
    currency: params.currency || "CZK",
  });
}

/**
 * Track when a user clicks through to affiliate (InitiateCheckout event)
 */
export function trackInitiateCheckout(params: {
  contentName: string;
  value: number;
  currency?: string;
  numItems?: number;
}) {
  if (!isPixelReady()) return;
  window.fbq!("track", "InitiateCheckout", {
    content_name: params.contentName,
    value: params.value,
    currency: params.currency || "CZK",
    num_items: params.numItems || 1,
  });
}

/**
 * Track search events
 */
export function trackSearch(params: {
  searchString: string;
  contentCategory?: string;
}) {
  if (!isPixelReady()) return;
  window.fbq!("track", "Search", {
    search_string: params.searchString,
    content_category: params.contentCategory || "flights",
  });
}

/**
 * Track lead events (e.g., newsletter signup)
 */
export function trackLead(params?: {
  contentName?: string;
  value?: number;
}) {
  if (!isPixelReady()) return;
  window.fbq!("track", "Lead", {
    content_name: params?.contentName || "newsletter_signup",
    value: params?.value || 0,
    currency: "CZK",
  });
}
