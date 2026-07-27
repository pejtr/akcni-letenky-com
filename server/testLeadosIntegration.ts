/**
 * Direct verification script for LeadOS / Travel Revenue Network integration
 */
// Mock browser environment for Node test execution
const store: Record<string, string> = {};
(globalThis as any).window = globalThis;
(globalThis as any).document = { cookie: "" };
(globalThis as any).sessionStorage = {
  getItem: (k: string) => store[k] || null,
  setItem: (k: string, v: string) => { store[k] = v; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};
(globalThis as any).localStorage = {
  getItem: (k: string) => store[k] || null,
  setItem: (k: string, v: string) => { store[k] = v; },
};

import {
  getVisitorId,
  getSessionId,
  getJourneyToken,
  setJourneyToken,
  appendOnyxSubId,
  isAffiliateUrl,
  initOnyxJourney,
  trackAffiliateRedirect,
} from "../client/src/lib/leadosTracking";

console.log("=== Testing LeadOS Travel Revenue Network Integration ===");

// 1. Storage & Cookie tests
console.log("[1/5] Testing visitor and session ID generation...");
const vid = getVisitorId();
const sid = getSessionId();
console.log("  - Visitor ID:", vid);
console.log("  - Session ID:", sid);
if (!vid || !sid) throw new Error("Visitor or Session ID failed to generate");

// 2. Token persistence
console.log("[2/5] Testing journey token persistence...");
setJourneyToken("onyx_test_token_12345");
const retrievedToken = getJourneyToken();
console.log("  - Retrieved Token:", retrievedToken);
if (retrievedToken !== "onyx_test_token_12345") throw new Error("Journey token failed to persist");

// 3. SubID appending
console.log("[3/5] Testing subID url decoration...");
const rawUrl = "https://www.pelikan.cz/cs/akcni-letenky?a_aid=levne-letenky";
const decoratedUrl = appendOnyxSubId(rawUrl);
console.log("  - Original URL:", rawUrl);
console.log("  - Decorated URL:", decoratedUrl);
if (!decoratedUrl.includes("subid1=onyx_test_token_12345")) {
  throw new Error("subid1 attribution parameter was not appended to affiliate link");
}

// 4. Affiliate URL detection
console.log("[4/5] Testing affiliate URL detection...");
console.log("  - Pelikan URL affiliate?", isAffiliateUrl("https://www.pelikan.cz/cs/akce"));
console.log("  - Kiwi URL affiliate?", isAffiliateUrl("https://www.kiwi.com/cs/search"));
console.log("  - Internal page affiliate?", isAffiliateUrl("https://akcni-letenky.com/dovolene"));

if (!isAffiliateUrl("https://www.pelikan.cz") || !isAffiliateUrl("/redirect?url=test")) {
  throw new Error("Affiliate URL detection failed");
}

console.log("=== All LeadOS Integration Checks Passed Successfully! ===");
