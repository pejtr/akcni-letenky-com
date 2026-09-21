import { describe, expect, it, vi } from "vitest";
import { generateRobotsTxt, generateSitemap } from "./sitemap";
import { prerenderSeoHtml } from "./_core/seoPrerender";
import { legacyAirlineRedirects, legacyUrlHandler } from "./_core/seoMiddleware";

const htmlTemplate = `<!doctype html><html><head>
<title>Homepage</title>
<meta name="description" content="Homepage" />
<link rel="canonical" href="https://www.akcni-letenky.com/" />
<meta name="robots" content="index, follow" />
<meta property="og:url" content="https://www.akcni-letenky.com/" />
</head><body><div id="root"></div></body></html>`;

describe("SEO indexing recovery", () => {
  it("emits only canonical public sitemap URLs", async () => {
    const xml = await generateSitemap();
    expect(xml).toContain("<loc>https://www.akcni-letenky.com/letenky</loc>");
    expect(xml).toContain("<loc>https://www.akcni-letenky.com/o-nas</loc>");
    expect(xml).not.toContain("<loc>https://www.akcni-letenky.com/levne-letenky</loc>");
    expect(xml).not.toContain("<loc>https://www.akcni-letenky.com/last-minute</loc>");
    expect(xml).not.toContain("<loc>https://www.akcni-letenky.com/wishlist</loc>");

    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(new Set(locs).size).toBe(locs.length);
  });

  it("advertises one canonical sitemap in robots.txt", () => {
    const robots = generateRobotsTxt();
    expect(robots).toContain("Sitemap: https://www.akcni-letenky.com/sitemap.xml");
    expect(robots).not.toContain("Sitemap: https://www.akcni-letenky.com/sitemap_index.xml");
    expect(robots).toContain("Disallow: /wishlist");
    expect(robots).toContain("Disallow: /redirect");
  });

  it("server-renders a self canonical for /letenky", () => {
    const html = prerenderSeoHtml(htmlTemplate, "/letenky");
    expect(html).toContain('<link rel="canonical" href="https://www.akcni-letenky.com/letenky" />');
    expect((html.match(/rel="canonical"/g) || []).length).toBe(1);
  });

  it("normalizes aliases and private routes", () => {
    const alias = prerenderSeoHtml(htmlTemplate, "/last-minute");
    expect(alias).toContain('href="https://www.akcni-letenky.com/letenky"');

    const contact = prerenderSeoHtml(htmlTemplate, "/kontakt");
    expect(contact).toContain('href="https://www.akcni-letenky.com/o-nas"');

    const wishlist = prerenderSeoHtml(htmlTemplate, "/wishlist");
    expect(wishlist).toContain('content="noindex, nofollow"');
  });

  it("redirects duplicate content aliases with 301", () => {
    const req = { path: "/last-minute" } as any;
    const res = { redirect: vi.fn() } as any;
    const next = vi.fn();
    legacyAirlineRedirects(req, res, next);
    expect(res.redirect).toHaveBeenCalledWith(301, "/letenky");
    expect(next).not.toHaveBeenCalled();
  });

  it("does not retire the live about/contact routes as legacy content", () => {
    for (const path of ["/o-nas", "/kontakt"]) {
      const req = { path } as any;
      const res = { status: vi.fn(() => res), send: vi.fn() } as any;
      const next = vi.fn();
      legacyUrlHandler(req, res, next);
      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    }
  });
});
