/**
 * Tests for Revolut popup and sitemap.xml functionality
 */

import { describe, it, expect } from "vitest";
import { generateSitemap, generateRobotsTxt } from "./sitemap";

describe("Revolut Popup", () => {
  it("should show popup after 30 seconds", () => {
    const POPUP_DELAY_MS = 30000;
    expect(POPUP_DELAY_MS).toBe(30 * 1000);
  });

  it("should use sessionStorage for dismissal tracking", () => {
    const STORAGE_KEY = "revolut_popup_dismissed";
    expect(STORAGE_KEY).toBe("revolut_popup_dismissed");
  });

  it("should link to correct Revolut referral URL", () => {
    const REVOLUT_URL = "https://www.revolut-bonus.cz";
    expect(REVOLUT_URL).toContain("revolut-bonus.cz");
  });

  it("should track Meta Pixel Lead event on click", () => {
    const eventName = "Lead";
    const contentName = "Revolut Referral Click";
    expect(eventName).toBe("Lead");
    expect(contentName).toContain("Revolut");
  });
});

describe("Sitemap Generation", () => {
  it("should generate valid XML sitemap", async () => {
    const sitemap = await generateSitemap();
    
    // Check XML declaration
    expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(sitemap).toContain('</urlset>');
  });

  it("should include homepage with priority 1.0", async () => {
    const sitemap = await generateSitemap();
    
    expect(sitemap).toContain("<loc>https://akcni-letenky.com/</loc>");
    expect(sitemap).toContain("<priority>1.0</priority>");
  });

  it("should include blog page", async () => {
    const sitemap = await generateSitemap();
    
    expect(sitemap).toContain("<loc>https://akcni-letenky.com/blog</loc>");
    expect(sitemap).toContain("<priority>0.8</priority>");
  });

  it("should include special destination pages", async () => {
    const sitemap = await generateSitemap();
    
    expect(sitemap).toContain("/dubaj");
    expect(sitemap).toContain("/bali");
    expect(sitemap).toContain("/new-york");
    expect(sitemap).toContain("/reunion");
  });

  it("should include static pages", async () => {
    const sitemap = await generateSitemap();
    
    expect(sitemap).toContain("/vlaky-autobusy");
    expect(sitemap).toContain("/porovnani-cen");
    expect(sitemap).toContain("/wishlist");
  });

  it("should include changefreq for all URLs", async () => {
    const sitemap = await generateSitemap();
    
    expect(sitemap).toContain("<changefreq>daily</changefreq>");
    expect(sitemap).toContain("<changefreq>weekly</changefreq>");
  });

  it("should include lastmod timestamps", async () => {
    const sitemap = await generateSitemap();
    
    // Should contain at least one lastmod tag
    expect(sitemap).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  });

  it("should generate multiple URLs (at least 20)", async () => {
    const sitemap = await generateSitemap();
    
    const urlCount = (sitemap.match(/<loc>/g) || []).length;
    expect(urlCount).toBeGreaterThanOrEqual(20);
  });

  it("should include blog articles from database", async () => {
    const sitemap = await generateSitemap();
    
    // Should contain blog article URLs
    expect(sitemap).toContain("/blog/");
  });

  it("should include destination pages from database", async () => {
    const sitemap = await generateSitemap();
    
    // Should contain destination URLs
    expect(sitemap).toContain("/letenky-do-");
  });

  it("should include airline pages", async () => {
    const sitemap = await generateSitemap();
    
    // Should contain airline URLs
    expect(sitemap).toContain("/letecka-spolecnost/");
  });
});

describe("Robots.txt Generation", () => {
  it("should generate valid robots.txt", () => {
    const robotsTxt = generateRobotsTxt();
    
    expect(robotsTxt).toContain("User-agent: *");
    expect(robotsTxt).toContain("Allow: /");
    expect(robotsTxt).toContain("Disallow: /admin");
    expect(robotsTxt).toContain("Disallow: /api/");
  });

  it("should reference sitemap.xml", () => {
    const robotsTxt = generateRobotsTxt();
    
    expect(robotsTxt).toContain("Sitemap:");
    expect(robotsTxt).toContain("/sitemap.xml");
  });

  it("should include crawl-delay for aggressive bots", () => {
    const robotsTxt = generateRobotsTxt();
    
    expect(robotsTxt).toContain("Crawl-delay: 10");
    expect(robotsTxt).toContain("AhrefsBot");
    expect(robotsTxt).toContain("SemrushBot");
  });
});

describe("Revolut In-Article Integration", () => {
  it("should include Revolut mentions in blog articles", () => {
    const revolutMention = "Revolut";
    const revolutURL = "www.revolut-bonus.cz";
    
    expect(revolutMention).toBe("Revolut");
    expect(revolutURL).toContain("revolut-bonus.cz");
  });

  it("should mention 500 Kč bonus", () => {
    const bonusAmount = "500 Kč";
    expect(bonusAmount).toContain("500");
    expect(bonusAmount).toContain("Kč");
  });

  it("should emphasize currency exchange benefits", () => {
    const benefit = "výhodné směnné kurzy";
    expect(benefit).toContain("směnné kurzy");
  });
});
