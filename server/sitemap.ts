/**
 * Dynamic Sitemap Generation
 * 
 * Generates sitemap.xml with proper priorities for SEO
 * 
 * Priority hierarchy:
 * - Homepage: 1.0
 * - Main category & tool pages: 0.9
 * - Category listing / blog listing: 0.8
 * - Destination & guide pages: 0.8
 * - Blog articles: 0.6
 * - Airline & secondary pages: 0.6
 */

import { getDb, FALLBACK_ARTICLES } from "./db";
import { articles, destinations } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { destinationCountries, destinationCities } from "../shared/seoDestinations";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

// Base URL - MUST strictly match production domain https://www.akcni-letenky.com for Google Search Console
const BASE_URL = "https://www.akcni-letenky.com";

// Static pages with priorities
const STATIC_PAGES: SitemapUrl[] = [
  {
    loc: "/",
    changefreq: "daily",
    priority: 1.0,
  },
  {
    loc: "/levne-letenky",
    changefreq: "daily",
    priority: 0.9,
  },
  {
    loc: "/last-minute",
    changefreq: "daily",
    priority: 0.9,
  },
  {
    loc: "/letenky",
    changefreq: "daily",
    priority: 0.9,
  },
  {
    loc: "/dovolene",
    changefreq: "daily",
    priority: 0.9,
  },
  {
    loc: "/hlidac-cen",
    changefreq: "daily",
    priority: 0.9,
  },
  {
    loc: "/odskodneni-za-let",
    changefreq: "daily",
    priority: 0.9,
  },
  {
    loc: "/kalkulacka-zavazadel",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    loc: "/ebook-zdarma",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    loc: "/blog",
    changefreq: "daily",
    priority: 0.8,
  },
  {
    loc: "/tipy-pro-cestovatele",
    changefreq: "daily",
    priority: 0.8,
  },
  {
    loc: "/aerolinky",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    loc: "/vlaky-autobusy",
    changefreq: "weekly",
    priority: 0.7,
  },
  {
    loc: "/porovnani-cen",
    changefreq: "weekly",
    priority: 0.7,
  },
  {
    loc: "/wishlist",
    changefreq: "weekly",
    priority: 0.5,
  },
];

// Special destination pages
const SPECIAL_DESTINATIONS = [
  { path: "/dubaj", priority: 0.8 },
  { path: "/bali", priority: 0.8 },
  { path: "/new-york", priority: 0.8 },
  { path: "/reunion", priority: 0.7 },
  { path: "/letenky-do-1500", priority: 0.7 },
];

// Generate sitemap XML
export async function generateSitemap(): Promise<string> {
  const rawUrls: SitemapUrl[] = [...STATIC_PAGES];

  // Add special destination pages
  for (const dest of SPECIAL_DESTINATIONS) {
    rawUrls.push({
      loc: dest.path,
      changefreq: "weekly",
      priority: dest.priority,
    });
  }

  // Add SEO Country destination pages - priority 0.8
  for (const country of destinationCountries) {
    rawUrls.push({
      loc: `/letenky-do-${country.slug}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "weekly",
      priority: 0.8,
    });
  }

  // Add SEO City destination pages - priority 0.7 (canonical: /letenky-{slug})
  for (const city of destinationCities) {
    rawUrls.push({
      loc: `/letenky-${city.slug}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "weekly",
      priority: 0.7,
    });
  }

  // Add Airline pages - priority 0.6
  const airlinePages = [
    "ryanair", "wizz-air", "czech-airlines", "lufthansa", "emirates",
    "qatar-airways", "turkish-airlines", "klm", "air-france", "british-airways", "austrian-airlines", "lot"
  ];
  for (const slug of airlinePages) {
    rawUrls.push({
      loc: `/letecka-spolecnost/${slug}`,
      changefreq: "weekly",
      priority: 0.6,
    });
  }

  // Add dynamic content from database (or FALLBACK_ARTICLES)
  try {
    const db = await getDb();
    if (db) {
      // Blog articles from DB - priority 0.6
      const blogArticles = await db.select().from(articles).where(eq(articles.status, "published"));
      if (blogArticles && blogArticles.length > 0) {
        for (const article of blogArticles) {
          rawUrls.push({
            loc: `/blog/${article.slug}`,
            lastmod: article.updatedAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
            changefreq: "weekly",
            priority: 0.6,
          });
        }
      } else {
        for (const article of FALLBACK_ARTICLES) {
          rawUrls.push({
            loc: `/blog/${article.slug}`,
            lastmod: new Date().toISOString().split("T")[0],
            changefreq: "weekly",
            priority: 0.6,
          });
        }
      }

      // Database destination pages - priority 0.8
      const allDestinations = await db.select().from(destinations);
      for (const dest of allDestinations) {
        rawUrls.push({
          loc: `/letenky-do-${dest.slug}`,
          lastmod: dest.updatedAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
          changefreq: "daily",
          priority: 0.8,
        });
      }
    } else {
      // Fallback articles when DB is offline
      for (const article of FALLBACK_ARTICLES) {
        rawUrls.push({
          loc: `/blog/${article.slug}`,
          lastmod: new Date().toISOString().split("T")[0],
          changefreq: "weekly",
          priority: 0.6,
        });
      }
    }
  } catch (error) {
    console.error("Error fetching dynamic content for sitemap:", error);
    for (const article of FALLBACK_ARTICLES) {
      rawUrls.push({
        loc: `/blog/${article.slug}`,
        lastmod: new Date().toISOString().split("T")[0],
        changefreq: "weekly",
        priority: 0.6,
      });
    }
  }

  // Deduplicate URLs by location (keep highest priority if duplicate)
  const urlMap = new Map<string, SitemapUrl>();
  for (const item of rawUrls) {
    const existing = urlMap.get(item.loc);
    if (!existing || (item.priority || 0) > (existing.priority || 0)) {
      urlMap.set(item.loc, item);
    }
  }
  const urls = Array.from(urlMap.values());

  // Generate XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${BASE_URL}${url.loc}</loc>${
      url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ""
    }${
      url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ""
    }${
      url.priority !== undefined ? `\n    <priority>${url.priority.toFixed(1)}</priority>` : ""
    }
  </url>`
  )
  .join("\n")}
</urlset>`;

  // Sanitize any domain mismatches or legacy environment variable host overrides
  xml = xml.replace(/https?:\/\/[^\s"'<>\\]*railway\.app/g, "https://www.akcni-letenky.com");
  xml = xml.replace(/https?:\/\/akcni-letenky\.com/g, "https://www.akcni-letenky.com");

  return xml;
}

// Generate sitemap_index.xml
export function generateSitemapIndex(): string {
  const today = new Date().toISOString().split("T")[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

  xml = xml.replace(/https?:\/\/[^\s"'<>\\]*railway\.app/g, "https://www.akcni-letenky.com");
  xml = xml.replace(/https?:\/\/akcni-letenky\.com/g, "https://www.akcni-letenky.com");

  return xml;
}

// Generate robots.txt
export function generateRobotsTxt(): string {
  return `# Robots.txt for Akční Letenky
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/sitemap_index.xml

# Crawl-delay for aggressive bots
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10
`;
}
