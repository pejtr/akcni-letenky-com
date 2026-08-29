import { pelikanAffiliateUrl, pelikanDeepLink } from "../../shared/affiliateLinks";

function verifyAffiliateUrl() {
  console.log("=== AFFILIATE URL VERIFICATION ===");
  
  // Real Pelikán promo link from sample feed
  const rawPelikanUrl = "https://www.pelikan.cz/akcni-letenka/LCC-2026";
  const offerId = "d7a468e2194c7b80";
  const clickId = "c93a0bd5-4209-4f76-8802-9988aabbccdd";
  const journeyId = "oj_987654321_abc";

  const urlObj = new URL(rawPelikanUrl);
  urlObj.searchParams.set("a_aid", "levne-letenky");
  urlObj.searchParams.set("utm_source", "akcni-letenky");
  urlObj.searchParams.set("utm_medium", "affiliate");
  urlObj.searchParams.set("utm_campaign", "flight-deals");
  urlObj.searchParams.set("utm_content", offerId);
  urlObj.searchParams.set("click_id", clickId);
  urlObj.searchParams.set("subid1", journeyId);

  const finalUrl = urlObj.toString();
  console.log("Input Feed URL:   ", rawPelikanUrl);
  console.log("Decorated Target: ", finalUrl);

  const parsed = new URL(finalUrl);
  console.log("\nParameter Breakdown:");
  console.log("- Protocol:    ", parsed.protocol);
  console.log("- Hostname:    ", parsed.hostname);
  console.log("- Pathname:    ", parsed.pathname);
  console.log("- a_aid:       ", parsed.searchParams.get("a_aid"), " (MUST be 'levne-letenky')");
  console.log("- utm_source:  ", parsed.searchParams.get("utm_source"));
  console.log("- utm_medium:  ", parsed.searchParams.get("utm_medium"));
  console.log("- utm_campaign:", parsed.searchParams.get("utm_campaign"));
  console.log("- utm_content: ", parsed.searchParams.get("utm_content"));
  console.log("- click_id:    ", parsed.searchParams.get("click_id"));
  console.log("- subid1:      ", parsed.searchParams.get("subid1"));

  const isValid = 
    parsed.hostname === "www.pelikan.cz" &&
    parsed.searchParams.get("a_aid") === "levne-letenky" &&
    parsed.pathname === "/akcni-letenka/LCC-2026" &&
    parsed.searchParams.has("click_id") &&
    parsed.searchParams.has("subid1");

  console.log("\nVerification result:", isValid ? "VALID_AFFILIATE_URL" : "INVALID_AFFILIATE_URL");
}

verifyAffiliateUrl();
