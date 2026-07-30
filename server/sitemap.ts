/**
 * Dynamic Sitemap Generation
 * 
 * Generates sitemap.xml with proper priorities for SEO
 * 
 * Priority hierarchy:
 * - Homepage: 1.0
 * - Main category pages: 0.9
 * - Blog listing: 0.8
 * - Blog articles: 0.6
 * - Destination pages: 0.7
 * - Other pages: 0.5
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

// Base URL - MUST match production domain https://www.akcni-letenky.com for Google Search Console
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

// Special destination pages (not in database)
const SPECIAL_DESTINATIONS = [
  { path: "/dubaj", priority: 0.8 },
  { path: "/bali", priority: 0.8 },
  { path: "/new-york", priority: 0.8 },
  { path: "/reunion", priority: 0.7 },
  { path: "/letenky-do-1500", priority: 0.7 },
];

// Generate sitemap XML
export async function generateSitemap(): Promise<string> {
  const urls: SitemapUrl[] = [...STATIC_PAGES];

  // Add special destination pages
  for (const dest of SPECIAL_DESTINATIONS) {
    urls.push({
      loc: dest.path,
      changefreq: "weekly",
      priority: dest.priority,
    });
  }

  // Add SEO Country destination pages - priority 0.8
  for (const country of destinationCountries) {
    urls.push({
      loc: `/letenky-do-${country.slug}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "weekly",
      priority: 0.8,
    });
  }

  // Add SEO City destination pages - priority 0.7
  for (const city of destinationCities) {
    urls.push({
      loc: `/letenky-${city.slug}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "weekly",
      priority: 0.7,
    });
  }

  // Add Airline pages - priority 0.6
  const airlinePages = [
    "ryanair", "wizz-air", "czech-airlines", "lufthansa", "emirates",
    "qatar-airways", "turkish-airlines", "klm", "air-france", "british-airways"
  ];
  for (const slug of airlinePages) {
    urls.push({
      loc: `/letecka-spolecnost/${slug}`,
      changefreq: "weekly",
      priority: 0.6,
    });
    urls.push({
      loc: `/letecke-spolecnosti/${slug}`,
      changefreq: "weekly",
      priority: 0.6,
    });
  }

  // Add dynamic content from database (or FALLBACK_ARTICLES)
  try {
    const db = await getDb();
    if (db) {
      // Blog articles from DB (or FALLBACK_ARTICLES) - priority 0.7
      const blogArticles = await db.select().from(articles).where(eq(articles.status, "published"));
      if (blogArticles && blogArticles.length > 0) {
        for (const article of blogArticles) {
          urls.push({
            loc: `/blog/${article.slug}`,
            lastmod: article.updatedAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
            changefreq: "weekly",
            priority: 0.7,
          });
        }
      } else {
        for (const article of FALLBACK_ARTICLES) {
          urls.push({
            loc: `/blog/${article.slug}`,
            lastmod: new Date().toISOString().split("T")[0],
            changefreq: "weekly",
            priority: 0.7,
          });
        }
      }

      // Database destination pages - priority 0.8
      const allDestinations = await db.select().from(destinations);
      for (const dest of allDestinations) {
        urls.push({
          loc: `/letenky-do-${dest.slug}`,
          lastmod: dest.updatedAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
          changefreq: "daily",
          priority: 0.8,
        });
      }
    } else {
      // Fallback articles when DB is offline
      for (const article of FALLBACK_ARTICLES) {
        urls.push({
          loc: `/blog/${article.slug}`,
          lastmod: new Date().toISOString().split("T")[0],
          changefreq: "weekly",
          priority: 0.7,
        });
      }
    }
  } catch (error) {
    console.error("Error fetching dynamic content for sitemap:", error);
    for (const article of FALLBACK_ARTICLES) {
      urls.push({
        loc: `/blog/${article.slug}`,
        lastmod: new Date().toISOString().split("T")[0],
        changefreq: "weekly",
        priority: 0.7,
      });
    }
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
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

# Crawl-delay for aggressive bots
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10
`;
}
