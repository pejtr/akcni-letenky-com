/**
 * Centralized affiliate link generator for all travel partners via Travelpayouts
 * Partner ID: 155221
 * Project: Akcni-letenky.com
 * 
 * All Kiwi.com links MUST go through this helper to ensure proper tracking.
 * Pelikan.cz links use direct a_aid=levne-letenky (separate affiliate program).
 */

const TRAVELPAYOUTS_MARKER = "155221";

// Travelpayouts program IDs
const PROGRAMS = {
  KIWI: "4114",
  BOOKING: "2584",
  AVIASALES: "2688",
  VIATOR: "3610",
  GETYOURGUIDE: "3506",
  DISCOVERCARS: "3817",
  CHEAPOAIR: "4146",
  TRIP_COM: "3993",
  AGODA: "4015",
  KLOOK: "3615",
} as const;

/** Helper to append active LeadOS onyx_journey token as subid1 in client environments */
function appendOnyxSubIdIfClient(url: string): string {
  if (typeof window !== "undefined") {
    try {
      const matchCookie = typeof document !== "undefined" ? document.cookie.match(/(?:^| )onyx_journey_token=([^;]+)/) : null;
      const token =
        sessionStorage.getItem("onyx_journey_token") ||
        (matchCookie ? decodeURIComponent(matchCookie[1]) : null);
      if (token && url && !url.includes("subid1=")) {
        const baseUrl = window.location && window.location.origin ? window.location.origin : "https://www.pelikan.cz";
        const urlObj = new URL(url, baseUrl);
        urlObj.searchParams.set("subid1", token);
        return urlObj.toString();
      }
    } catch {}
  }
  return url;
}

/**
 * Generate a Travelpayouts tracked affiliate link
 * Format: https://tp.media/r?marker=MARKER&trs=267609&p=PROGRAM_ID&u=ENCODED_URL
 */
function tpLink(programId: string, targetUrl: string, subId?: string): string {
  const matchCookie = typeof document !== "undefined" ? document.cookie.match(/(?:^| )onyx_journey_token=([^;]+)/) : null;
  const token = typeof window !== "undefined"
    ? sessionStorage.getItem("onyx_journey_token") || (matchCookie ? decodeURIComponent(matchCookie[1]) : null)
    : null;
  const effectiveSubId = token ? (subId ? `${subId}.${token}` : token) : subId;
  const marker = effectiveSubId ? `${TRAVELPAYOUTS_MARKER}.${effectiveSubId}` : TRAVELPAYOUTS_MARKER;
  const encoded = encodeURIComponent(targetUrl);
  let res = `https://tp.media/r?marker=${marker}&trs=267609&p=${programId}&u=${encoded}`;
  if (token && !res.includes("subid1=")) {
    res += `&subid1=${encodeURIComponent(token)}`;
  }
  return res;
}

// ============================================================
// KIWI.COM
// ============================================================

/**
 * Clean up Kiwi URL (ensure /cs/ lang code, valid origin slug, etc.)
 */
function cleanKiwiUrl(url: string): string {
  let cleaned = url.trim();
  // Fix language code (/cz/ is invalid on Kiwi.com, must be /cs/)
  cleaned = cleaned.replace("kiwi.com/cz/", "kiwi.com/cs/");
  // Fix origin airport slug
  cleaned = cleaned.replace("letiste-vaclava-havla-praha-praha-cesko", "prague-czech-republic");
  // Fix generic broken /deep endpoints
  if (cleaned.includes("kiwi.com/deep")) {
    const parsed = new URL(cleaned);
    const from = parsed.searchParams.get("from") || "prague-czech-republic";
    const to = parsed.searchParams.get("to") || parsed.searchParams.get("destination") || "";
    cleaned = `https://www.kiwi.com/cs/search/results/${from}/${to}`;
  }
  if (!cleaned.startsWith("http")) {
    cleaned = `https://www.kiwi.com${cleaned.startsWith("/") ? "" : "/"}${cleaned}`;
  }
  return cleaned;
}

/**
 * Generate Kiwi.com affiliate link wrapped via Travelpayouts (p=4114)
 */
export function kiwiAffiliateUrl(rawKiwiUrl: string, subId?: string): string {
  if (!rawKiwiUrl) return "https://tp.media/r?marker=155221&trs=267609&p=4114&u=https%3A%2F%2Fwww.kiwi.com%2Fcs%2F";
  // If already a tp.media URL with p=4114, return as is (or update subId if provided)
  if (rawKiwiUrl.includes("tp.media") && rawKiwiUrl.includes("p=4114")) {
    return rawKiwiUrl;
  }
  const clean = cleanKiwiUrl(rawKiwiUrl);
  return tpLink(PROGRAMS.KIWI, clean, subId);
}

/**
 * Generate Kiwi.com deep link with Travelpayouts tracking
 * @param params - Kiwi deep link params (from, to, currency, lang, etc.)
 * @param subId - optional sub-tracking ID (e.g., "homepage", "exit-popup")
 */
export function kiwiDeepLink(params: {
  from?: string;
  to?: string;
  currency?: string;
  lang?: string;
  destination?: string;
  passengers?: string;
}, subId?: string): string {
  const from = params.from || "prague-czech-republic";
  const to = params.to || params.destination || "";
  const lang = params.lang || "cs";
  const targetUrl = `https://www.kiwi.com/${lang}/search/results/${from}/${to}`;
  return kiwiAffiliateUrl(targetUrl, subId);
}

/**
 * Generate Kiwi.com search results link with Travelpayouts tracking
 * @param origin - origin slug (e.g., "prague-czech-republic")
 * @param destination - destination slug (e.g., "london-united-kingdom")
 * @param subId - optional sub-tracking ID
 */
export function kiwiSearchLink(origin: string, destination: string, subId?: string): string {
  const originSlug = origin === "PRG" || origin === "praha" ? "prague-czech-republic" : origin;
  const kiwiUrl = `https://www.kiwi.com/cs/search/results/${originSlug}/${destination}`;
  return kiwiAffiliateUrl(kiwiUrl, subId);
}

/**
 * Generate Kiwi.com tiles search link with Travelpayouts tracking
 */
export function kiwiTilesLink(origin: string, destination: string, subId?: string): string {
  const originSlug = origin === "PRG" || origin === "praha" ? "prague-czech-republic" : origin;
  const kiwiUrl = `https://www.kiwi.com/cs/search/tiles/${originSlug}/${destination}/anytime/no-return/`;
  return kiwiAffiliateUrl(kiwiUrl, subId);
}

// ============================================================
// BOOKING.COM
// ============================================================

/**
 * Generate Booking.com search link with Travelpayouts tracking
 * @param destination - destination name for search
 * @param subId - optional sub-tracking ID
 */
export function bookingSearchLink(destination: string, subId?: string): string {
  const encoded = encodeURIComponent(destination);
  // Bypass TravelPayouts wrapper since it returns 'promo not found'
  return `https://www.booking.com/searchresults.html?ss=${encoded}&lang=cs`;
}

export function bookingHotelLink(hotelSlug: string, _subId?: string): string {
  return `https://www.booking.com/hotel/es/${hotelSlug}.cs.html`;
}

export function aviasalesAffiliateUrl(pathOrUrl = "https://www.aviasales.com/", subId?: string): string {
  const aviasalesUrl = new URL(pathOrUrl, "https://www.aviasales.com");
  return tpLink(PROGRAMS.AVIASALES, aviasalesUrl.toString(), subId);
}

// ============================================================
// OTHER PARTNERS
// ============================================================

export function viatorLink(destination: string, subId?: string): string {
  const viatorUrl = `https://www.viator.com/searchResults/all?text=${encodeURIComponent(destination)}`;
  return tpLink(PROGRAMS.VIATOR, viatorUrl, subId);
}

export function getYourGuideLink(destination: string, subId?: string): string {
  const gygUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(destination)}`;
  return tpLink(PROGRAMS.GETYOURGUIDE, gygUrl, subId);
}

export function discoverCarsLink(destination: string, subId?: string): string {
  const dcUrl = `https://www.discovercars.com/?location=${encodeURIComponent(destination)}`;
  return tpLink(PROGRAMS.DISCOVERCARS, dcUrl, subId);
}

// ============================================================
// PELIKAN.CZ (direct affiliate - NOT via Travelpayouts)
// ============================================================

export const PELIKAN_AID = "levne-letenky";

export interface PelikanTrackingParams {
  campaign?: string;
  channel?: string;
  content?: string;
  medium?: string;
  source?: string;
}

function normalizePelikanUrl(pathOrUrl: string): URL {
  const url = new URL(pathOrUrl, "https://www.pelikan.cz");
  url.protocol = "https:";
  if (url.hostname === "pelikan.cz") {
    url.hostname = "www.pelikan.cz";
  }
  if (url.hostname === "www.pelikan.cz") {
    url.pathname = url.pathname.replace(/\/{2,}/g, "/");
  }
  return url;
}

export function pelikanAffiliateUrl(pathOrUrl: string, params: PelikanTrackingParams = {}): string {
  const url = normalizePelikanUrl(pathOrUrl);
  url.searchParams.set("a_aid", PELIKAN_AID);
  url.searchParams.set("utm_source", params.source || "akcni-letenky");
  url.searchParams.set("utm_medium", params.medium || "affiliate");
  url.searchParams.set("utm_campaign", params.campaign || "grid");
  if (params.channel) url.searchParams.set("utm_channel", params.channel);
  if (params.content) url.searchParams.set("utm_content", params.content);
  return appendOnyxSubIdIfClient(url.toString());
}

export function pelikanLink(path: string, campaign?: string): string {
  return pelikanAffiliateUrl(path, { campaign });
}

/**
 * Pelikan partner panel can generate wrapped deeplinks for a target URL.
 * If PELIKAN_DEEPLINK_TEMPLATE is configured server-side, use a template such as:
 * https://partners.pelikan.cz/...?url={encodedUrl}&a_aid={aid}&campaign={campaign}&channel={channel}
 *
 * In browser/shared contexts without the template, this intentionally falls back
 * to a direct affiliate URL with full UTM tracking.
 */
export function pelikanDeepLink(pathOrUrl: string, params: PelikanTrackingParams = {}): string {
  const template = typeof process !== "undefined" ? process.env?.PELIKAN_DEEPLINK_TEMPLATE : undefined;
  if (template) {
    const directUrl = pelikanAffiliateUrl(pathOrUrl, params);
    return template
      .replace("{encodedUrl}", encodeURIComponent(directUrl))
      .replace("{aid}", encodeURIComponent(PELIKAN_AID))
      .replace("{campaign}", encodeURIComponent(params.campaign || "grid"))
      .replace("{channel}", encodeURIComponent(params.channel || ""))
      .replace("{content}", encodeURIComponent(params.content || ""));
  }
  return pelikanAffiliateUrl(pathOrUrl, params);
}

// Export constants for use in tests
export { TRAVELPAYOUTS_MARKER, PROGRAMS };
