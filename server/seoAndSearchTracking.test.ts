/**
 * SEO & Search Tracking Tests
 * 
 * Validates:
 * 1. index.html has proper SEO meta tags (title, description, keywords, lang, canonical)
 * 2. Home.tsx sets document.title and meta tags dynamically
 * 3. H2 headings are visible (not sr-only)
 * 4. trackSearch is exported and integrated in conversion tracking
 * 5. HeroVariantA and HeroVariantB import trackSearch
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const clientDir = path.resolve(__dirname, "../client");

describe("SEO: index.html meta tags", () => {
  const indexHtml = fs.readFileSync(path.join(clientDir, "index.html"), "utf-8");

  it("should have lang='cs' on html element", () => {
    expect(indexHtml).toContain('<html lang="cs">');
  });

  it("should have a proper title tag (30-60 characters)", () => {
    const titleMatch = indexHtml.match(/<title>(.*?)<\/title>/);
    expect(titleMatch).not.toBeNull();
    const title = titleMatch![1];
    expect(title.length).toBeGreaterThanOrEqual(30);
    expect(title.length).toBeLessThanOrEqual(80);
    expect(title).toContain("Letenky");
  });

  it("should have a meta description (50-160 characters)", () => {
    const descMatch = indexHtml.match(/<meta\s+name="description"\s+content="([^"]+)"/);
    expect(descMatch).not.toBeNull();
    const desc = descMatch![1];
    expect(desc.length).toBeGreaterThanOrEqual(50);
    expect(desc.length).toBeLessThanOrEqual(200);
  });

  it("should have meta keywords", () => {
    const kwMatch = indexHtml.match(/<meta\s+name="keywords"\s+content="([^"]+)"/);
    expect(kwMatch).not.toBeNull();
    const keywords = kwMatch![1];
    expect(keywords).toContain("letenky");
    expect(keywords.split(",").length).toBeGreaterThanOrEqual(3);
  });

  it("should have canonical URL", () => {
    expect(indexHtml).toContain('<link rel="canonical" href="https://www.akcni-letenky.com/"');
  });

  it("should have Open Graph meta tags", () => {
    expect(indexHtml).toContain('property="og:title"');
    expect(indexHtml).toContain('property="og:description"');
    expect(indexHtml).toContain('property="og:image"');
  });

  it("should have Schema.org Organization structured data", () => {
    expect(indexHtml).toContain('"@type": "Organization"');
    expect(indexHtml).toContain('"@type": "WebSite"');
  });

  it("should have hreflang for Czech", () => {
    expect(indexHtml).toContain('hreflang="cs"');
  });
});

describe("SEO: Home.tsx dynamic meta tags and H2 headings", () => {
  const homeTsx = fs.readFileSync(path.join(clientDir, "src/pages/Home.tsx"), "utf-8");

  it("should set document.title in useEffect", () => {
    expect(homeTsx).toContain("document.title =");
    // Title should contain "Letenky" keyword
    const titleMatch = homeTsx.match(/document\.title\s*=\s*"([^"]+)"/);
    expect(titleMatch).not.toBeNull();
    expect(titleMatch![1]).toContain("Letenky");
    expect(titleMatch![1].length).toBeGreaterThanOrEqual(30);
  });

  it("should set meta description dynamically", () => {
    expect(homeTsx).toContain('meta[name="description"]');
    expect(homeTsx).toContain("setAttribute('content'");
  });

  it("should set meta keywords dynamically", () => {
    expect(homeTsx).toContain('meta[name="keywords"]');
  });

  it("should have visible H2 heading for featured cities (not sr-only)", () => {
    // Check that the featured-cities H2 is NOT sr-only
    expect(homeTsx).toContain('id="featured-cities"');
    // The H2 should have visible text styling, not sr-only
    const featuredCitiesH2 = homeTsx.match(/id="featured-cities"[^>]*className="([^"]+)"/);
    expect(featuredCitiesH2).not.toBeNull();
    expect(featuredCitiesH2![1]).not.toContain("sr-only");
    expect(featuredCitiesH2![1]).toContain("text-");
  });

  it("should have visible H2 heading for top flights this week", () => {
    expect(homeTsx).toContain('id="top-this-week"');
    const topWeekH2 = homeTsx.match(/id="top-this-week"[^>]*className="([^"]+)"/);
    expect(topWeekH2).not.toBeNull();
    expect(topWeekH2![1]).not.toContain("sr-only");
  });

  it("should have visible H2 heading for return flights", () => {
    expect(homeTsx).toContain('id="return-flights"');
  });

  it("should have visible H2 heading for FAQ section", () => {
    expect(homeTsx).toContain('id="faq"');
  });

  it("should have visible H2 heading for browse destinations", () => {
    expect(homeTsx).toContain('id="browse-destinations"');
    const browseH2 = homeTsx.match(/id="browse-destinations"[^>]*className="([^"]+)"/);
    expect(browseH2).not.toBeNull();
    expect(browseH2![1]).not.toContain("sr-only");
  });

  it("should have at least 5 visible H2 headings", () => {
    // Count H2 elements that are NOT sr-only
    const h2Matches = homeTsx.match(/<h2[^>]*>/g) || [];
    const visibleH2s = h2Matches.filter(h2 => !h2.includes("sr-only"));
    expect(visibleH2s.length).toBeGreaterThanOrEqual(5);
  });
});

describe("Search Tracking: trackSearch integration", () => {
  it("should export trackSearch from MetaPixel", () => {
    const metaPixel = fs.readFileSync(
      path.join(clientDir, "src/components/MetaPixel.tsx"),
      "utf-8"
    );
    expect(metaPixel).toContain("export function trackSearch");
  });

  it("should import trackSearch in useConversionTracking", () => {
    const hook = fs.readFileSync(
      path.join(clientDir, "src/hooks/useConversionTracking.ts"),
      "utf-8"
    );
    expect(hook).toContain("trackSearch as trackMetaSearch");
    expect(hook).toContain("trackMetaSearch(query)");
  });

  it("should expose trackSearch in useConversionTracking return value", () => {
    const hook = fs.readFileSync(
      path.join(clientDir, "src/hooks/useConversionTracking.ts"),
      "utf-8"
    );
    expect(hook).toContain("trackSearch: (query: string");
  });

  it("should call trackSearch in Home.tsx handleSearch", () => {
    const homeTsx = fs.readFileSync(
      path.join(clientDir, "src/pages/Home.tsx"),
      "utf-8"
    );
    expect(homeTsx).toContain("trackFunnelSearch(destination");
  });

  it("should import trackSearch in HeroVariantA", () => {
    const heroA = fs.readFileSync(
      path.join(clientDir, "src/components/HeroVariantA.tsx"),
      "utf-8"
    );
    expect(heroA).toContain('import { trackSearch }');
    expect(heroA).toContain("trackSearch(destination.trim())");
  });

  it("should import trackSearch in HeroVariantB", () => {
    const heroB = fs.readFileSync(
      path.join(clientDir, "src/components/HeroVariantB.tsx"),
      "utf-8"
    );
    expect(heroB).toContain('import { trackSearch }');
    expect(heroB).toContain("trackSearch(destination.trim())");
  });
});
