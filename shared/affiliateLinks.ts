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
  KIWI: "3791",
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

/**
 * Generate a Travelpayouts tracked affiliate link
 * Format: https://tp.media/r?marker=MARKER&trs=267609&p=PROGRAM_ID&u=ENCODED_URL
 */
function tpLink(programId: string, targetUrl: string, subId?: string): string {
  const marker = subId ? `${TRAVELPAYOUTS_MARKER}.${subId}` : TRAVELPAYOUTS_MARKER;
  const encoded = encodeURIComponent(targetUrl);
  return `https://tp.media/r?marker=${marker}&trs=267609&p=${programId}&u=${encoded}`;
}

// ============================================================
// KIWI.COM
// ============================================================

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
  const searchParams = new URLSearchParams();
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.currency) searchParams.set("currency", params.currency || "CZK");
  if (params.lang) searchParams.set("lang", params.lang || "cs");
  if (params.destination) searchParams.set("destination", params.destination);
  if (params.passengers) searchParams.set("passengers", params.passengers);
  
  const kiwiUrl = `https://www.kiwi.com/deep?${searchParams.toString()}`;
  return tpLink(PROGRAMS.KIWI, kiwiUrl, subId);
}

/**
 * Generate Kiwi.com search results link with Travelpayouts tracking
 * @param origin - origin slug (e.g., "prague-czech-republic")
 * @param destination - destination slug (e.g., "london-united-kingdom")
 * @param subId - optional sub-tracking ID
 */
export function kiwiSearchLink(origin: string, destination: string, subId?: string): string {
  const kiwiUrl = `https://www.kiwi.com/cs/search/results/${origin}/${destination}`;
  return tpLink(PROGRAMS.KIWI, kiwiUrl, subId);
}

/**
 * Generate Kiwi.com tiles search link with Travelpayouts tracking
 */
export function kiwiTilesLink(origin: string, destination: string, subId?: string): string {
  const kiwiUrl = `https://www.kiwi.com/cz/search/tiles/${origin}/${destination}/anytime/no-return/`;
  return tpLink(PROGRAMS.KIWI, kiwiUrl, subId);
}

/**
 * Wrap ANY raw kiwi.com URL through Travelpayouts affiliate tracking.
 * Use this for legacy kiwiUrl values stored in seoDestinations.ts.
 * @param rawKiwiUrl - raw kiwi.com URL (without affiliate params)
 * @param subId - optional sub-tracking ID
 */
export function kiwiAffiliateUrl(rawKiwiUrl: string, subId?: string): string {
  // Already wrapped through tp.media — return as-is
  if (rawKiwiUrl.includes("tp.media")) return rawKiwiUrl;
  return tpLink(PROGRAMS.KIWI, rawKiwiUrl, subId);
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
  const bookingUrl = `https://www.booking.com/search.html?ss=${encoded}&lang=cs`;
  return tpLink(PROGRAMS.BOOKING, bookingUrl, subId);
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

export function pelikanLink(path: string, campaign?: string): string {
  const url = `https://www.pelikan.cz${path}`;
  const separator = url.includes("?") ? "&" : "?";
  const utmCampaign = campaign || "grid";
  return `${url}${separator}a_aid=${PELIKAN_AID}&utm_source=akcni-letenky&utm_medium=affiliate&utm_campaign=${utmCampaign}`;
}

// Export constants for use in tests
export { TRAVELPAYOUTS_MARKER, PROGRAMS };
