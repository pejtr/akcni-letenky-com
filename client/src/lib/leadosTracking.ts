/**
 * LeadOS / Travel Revenue Network Integration for akcni-letenky.com
 * Handles cross-domain journey token capture (onyx_journey) and affiliate attribution tracking.
 */

const JOURNEY_TOKEN_KEY = "onyx_journey_token";
const VISITOR_ID_KEY = "onyx_visitor_id";
const SESSION_ID_KEY = "onyx_session_id";

const LEADOS_API_ENDPOINT = "https://leados.cz/api/travel/events";
const PROJECT_KEY =
  (import.meta as any).env?.VITE_LEADOS_PROJECT_KEY || "akcni-letenky-com";

/** Cookie helper for reading cookies */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

/** Cookie helper for writing cookies with expiration */
function setCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/** Get or create persistent visitor ID */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let vid = localStorage.getItem(VISITOR_ID_KEY) || getCookie(VISITOR_ID_KEY);
  if (!vid) {
    vid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "v_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    try {
      localStorage.setItem(VISITOR_ID_KEY, vid);
    } catch {}
    setCookie(VISITOR_ID_KEY, vid, 365);
  }
  return vid;
}

/** Get or create session ID */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem(SESSION_ID_KEY) || getCookie(SESSION_ID_KEY);
  if (!sid) {
    sid = "s_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    try {
      sessionStorage.setItem(SESSION_ID_KEY, sid);
    } catch {}
    setCookie(SESSION_ID_KEY, sid, 1);
  }
  return sid;
}

/** Get current active journey token */
export function getJourneyToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem(JOURNEY_TOKEN_KEY) ||
    getCookie(JOURNEY_TOKEN_KEY) ||
    null
  );
}

/** Store journey token */
export function setJourneyToken(token: string) {
  if (typeof window === "undefined" || !token) return;
  try {
    sessionStorage.setItem(JOURNEY_TOKEN_KEY, token);
  } catch {}
  setCookie(JOURNEY_TOKEN_KEY, token, 30);
}

/** Send event to LeadOS Ingestion API */
export async function sendLeadOSEvent(eventData: Record<string, any>) {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      events: [
        {
          timestamp: new Date().toISOString(),
          visitor_id: getVisitorId(),
          session_id: getSessionId(),
          journey_token: getJourneyToken() || "",
          ...eventData,
        }
      ],
    };

    fetch(LEADOS_API_ENDPOINT, {
      method: "POST",
      headers: {
        "x-project-key": PROJECT_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch((err) => {
      console.warn("[LeadOS Tracking Network Error]", err);
    });
  } catch (err) {
    console.warn("[LeadOS Tracking Exception]", err);
  }
}

/**
 * 1. Capture incoming onyx_journey token on page load and send cross_domain_arrival event
 */
export function initOnyxJourney() {
  if (typeof window === "undefined") return;

  const urlParams = new URLSearchParams(window.location.search);
  const onyxJourney = urlParams.get("onyx_journey");

  if (onyxJourney) {
    setJourneyToken(onyxJourney);

    sendLeadOSEvent({
      event_name: "cross_domain_arrival",
      page_url: window.location.href,
    });
  }

  // Setup non-intrusive global click tracking for affiliate links
  setupGlobalAffiliateClickListener();
}

/**
 * 2. Append subid1=<JOURNEY_TOKEN> to an affiliate URL if token exists
 */
export function appendOnyxSubId(targetUrl: string): string {
  const token = getJourneyToken();
  if (!token || !targetUrl) return targetUrl;

  try {
    if (targetUrl.startsWith("/redirect") || targetUrl.startsWith("/r/flights") || targetUrl.startsWith("http")) {
      const urlObj = new URL(targetUrl, window.location.origin);

      // If it's an internal redirect link, decorate inner 'url' param if available
      if (urlObj.pathname === "/redirect") {
        const innerUrl = urlObj.searchParams.get("url");
        if (innerUrl) {
          const decoratedInner = appendOnyxSubId(innerUrl);
          urlObj.searchParams.set("url", decoratedInner);
          return urlObj.pathname + urlObj.search;
        }
      }

      if (!urlObj.searchParams.has("subid1")) {
        urlObj.searchParams.set("subid1", token);
      }
      return urlObj.toString();
    }
  } catch {
    if (!targetUrl.includes("subid1=")) {
      const separator = targetUrl.includes("?") ? "&" : "?";
      return `${targetUrl}${separator}subid1=${encodeURIComponent(token)}`;
    }
  }

  return targetUrl;
}

/**
 * Send affiliate_redirect event to LeadOS when user clicks an affiliate link
 */
export function trackAffiliateRedirect(targetUrl: string, metadata: Record<string, any> = {}) {
  sendLeadOSEvent({
    event_name: "affiliate_redirect",
    page_url: window.location.href,
    target_url: targetUrl,
    ...metadata,
  });
}

/**
 * Send fare_impression event to LeadOS when flight deal offers are displayed
 */
export function trackFareImpression(offer: { id: string; origin?: string; destination?: string; price: number; provider?: string }) {
  sendLeadOSEvent({
    event_name: "fare_impression",
    offer_id: offer.id,
    origin: offer.origin,
    destination: offer.destination,
    price: offer.price,
    provider: offer.provider || "pelikan",
    page_url: window.location.href,
  });
}

/**
 * Send fare_click event to LeadOS when a user clicks a flight offer
 */
export function trackFareClick(offer: { id: string; origin?: string; destination?: string; price: number; provider?: string; placement?: string }) {
  sendLeadOSEvent({
    event_name: "fare_click",
    offer_id: offer.id,
    origin: offer.origin,
    destination: offer.destination,
    price: offer.price,
    provider: offer.provider || "pelikan",
    placement: offer.placement || "deals_card",
    page_url: window.location.href,
  });
}

/** Check if a given URL is an outgoing affiliate URL or redirect */
export function isAffiliateUrl(url: string): boolean {
  if (!url) return false;
  return (
    url.includes("pelikan.cz") ||
    url.includes("kiwi.com") ||
    url.includes("booking.com") ||
    url.includes("tp.media") ||
    url.includes("tradedoubler.com") ||
    url.includes("omio.com") ||
    url.includes("aviasales.com") ||
    url.includes("/r/flights/") ||
    url.includes("/redirect")
  );
}

let listenerAttached = false;

function setupGlobalAffiliateClickListener() {
  if (typeof window === "undefined" || listenerAttached) return;
  listenerAttached = true;

  document.addEventListener(
    "click",
    (e) => {
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor || !anchor.href) return;

      const href = anchor.href;
      if (isAffiliateUrl(href)) {
        const token = getJourneyToken();
        if (token) {
          const decorated = appendOnyxSubId(href);
          if (decorated !== href) {
            anchor.href = decorated;
          }
        }
        
        // For /r/flights/ internal redirect routes, the SERVER is the authoritative emitter of affiliate_redirect.
        // We emit client-side fare_click instead, avoiding double counting.
        if (href.includes("/r/flights/")) {
          const parts = href.split("/r/flights/")[1]?.split("?")[0] || "";
          trackFareClick({ id: parts, price: 0 });
        } else {
          trackAffiliateRedirect(anchor.href);
        }
      }
    },
    { capture: true }
  );
}
