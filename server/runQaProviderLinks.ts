/**
 * QA Functional Test Execution Script for All Provider Affiliate Links & LeadOS Tracking
 */
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
(globalThis as any).window.location = { origin: "https://www.akcni-letenky.com", href: "https://www.akcni-letenky.com/" };

import {
  pelikanAffiliateUrl,
  pelikanLink,
  pelikanDeepLink,
  kiwiAffiliateUrl,
  bookingSearchLink,
  PELIKAN_AID,
} from "../shared/affiliateLinks";

import {
  getVisitorId,
  getSessionId,
  getJourneyToken,
  setJourneyToken,
  appendOnyxSubId,
  isAffiliateUrl,
  trackAffiliateRedirect,
} from "../client/src/lib/leadosTracking";

console.log("=================================================");
console.log("   QA TESTY FUNKČNOSTI PROKLIKŮ POSKYTOVATELŮ");
console.log("=================================================\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, title: string, details?: string) {
  if (condition) {
    console.log(` ✅ PASS: ${title}`);
    if (details) console.log(`        ↳ ${details}`);
    passed++;
  } else {
    console.error(` ❌ FAIL: ${title}`);
    if (details) console.error(`        ↳ ${details}`);
    failed++;
  }
}

// 1. Pelikán.cz links test
console.log("--- 1. TESTOVÁNÍ PELIKÁN.CZ ODKAZŮ ---");
const pelikan1 = pelikanAffiliateUrl("/cs/akcni-letenky/praha/londyn", { campaign: "qa-test", channel: "button" });
assert(pelikan1.includes("a_aid=levne-letenky"), "Pelikán obsahuje a_aid=levne-letenky", pelikan1);
assert(pelikan1.includes("utm_campaign=qa-test"), "Pelikán obsahuje utm_campaign=qa-test", pelikan1);
assert(pelikan1.includes("utm_channel=button"), "Pelikán obsahuje utm_channel=button", pelikan1);

const pelikanClean = pelikanAffiliateUrl("http://pelikan.cz//cs//pobyty//kategorie/104");
assert(pelikanClean.startsWith("https://www.pelikan.cz/cs/pobyty/kategorie/104"), "Pelikán URL je normalizována (https, bez //)", pelikanClean);

// 2. Kiwi & Booking & Travelpayouts test
console.log("\n--- 2. TESTOVÁNÍ KIWI A BOOKING.COM ODKAZŮ ---");
const kiwi = kiwiAffiliateUrl("prague-czech-republic", "barcelona-spain");
assert(kiwi.includes("kiwi.com") && kiwi.includes("barcelona-spain"), "Kiwi odkaz je validní a správně směrovaný", kiwi);

const booking = bookingSearchLink("Barcelona");
assert(booking.includes("booking.com") && booking.includes("ss=Barcelona"), "Booking odkaz je validní a správně kódovaný", booking);

// 3. LeadOS Journey Token Attribution (subid1) test
console.log("\n--- 3. TESTOVÁNÍ LEADOS ONYX_JOURNEY ATRIBUCE (subid1) ---");
setJourneyToken("onyx_qa_token_9999");
const token = getJourneyToken();
assert(token === "onyx_qa_token_9999", "Onyx journey token uložen a načten z paměti", token || "");

const pelikanWithSubid = pelikanAffiliateUrl("/cs/akcni-letenky/praha/dubaj");
assert(pelikanWithSubid.includes("subid1=onyx_qa_token_9999"), "Pelikán odkaz obsahuje subid1 atribuce tokenu", pelikanWithSubid);

const redirectLink = "/redirect?url=" + encodeURIComponent("https://www.pelikan.cz/cs/akcni-letenky?a_aid=levne-letenky") + "&dest=pelikan";
const decoratedRedirect = appendOnyxSubId(redirectLink);
assert(decodeURIComponent(decoratedRedirect).includes("subid1=onyx_qa_token_9999"), "/redirect link odchytává a dekoruje inner URL s subid1", decoratedRedirect);

// 4. Detekce affiliate URL test
console.log("\n--- 4. TESTOVÁNÍ DETEKCE AFFILIATE ODKAZŮ ---");
assert(isAffiliateUrl("https://www.pelikan.cz/cs/akcni-letenky"), "Detekce Pelikán URL", "true");
assert(isAffiliateUrl("https://www.kiwi.com/cs/search"), "Detekce Kiwi URL", "true");
assert(isAffiliateUrl("https://www.booking.com/searchresults"), "Detekce Booking URL", "true");
assert(isAffiliateUrl("/redirect?url=xyz"), "Detekce interního /redirect odkazu", "true");
assert(!isAffiliateUrl("https://www.akcni-letenky.com/dovolene"), "Interní stránka neoznačena jako affiliate", "false");

// Summary
console.log("\n=================================================");
console.log(` VÝSLEDEK QA TESTŮ: ${passed} PASSED | ${failed} FAILED`);
console.log("=================================================");

if (failed > 0) {
  process.exit(1);
}
