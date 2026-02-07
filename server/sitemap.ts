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

import { getDb } from "./db";
import { articles } from "../drizzle/schema";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

// Base URL - should match your production domain
const BASE_URL = process.env.VITE_APP_URL || "https://akcni-letenky.com";

// Static pages with priorities
const STATIC_PAGES: SitemapUrl[] = [
  {
    loc: "/",
    changefreq: "daily",
    priority: 1.0,
  },
  {
    loc: "/blog",
    changefreq: "daily",
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

// Popular destinations with priorities
const DESTINATIONS = [
  "london-united-kingdom",
  "paris-france",
  "rome-italy",
  "barcelona-spain",
  "dubai-united-arab-emirates",
  "new-york-new-york-united-states",
  "bali-indonesia",
  "bangkok-thailand",
  "santorini-greece",
  "iceland-iceland",
  "miami-florida-united-states",
  "marrakech-morocco",
  "hanoi-vietnam",
  "colombo-sri-lanka",
  "amman-jordan",
  "africa-africa",
];

// Generate sitemap XML
export async function generateSitemap(): Promise<string> {
  const urls: SitemapUrl[] = [...STATIC_PAGES];

  // Add destination pages
  for (const slug of DESTINATIONS) {
    urls.push({
      loc: `/letenky-do-${slug}`,
      changefreq: "weekly",
      priority: 0.7,
    });
  }

  // Add blog articles from database
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const blogArticles = await db.select().from(articles);
    
    for (const article of blogArticles) {
      urls.push({
        loc: `/blog/${article.slug}`,
        lastmod: article.updatedAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
        changefreq: "monthly",
        priority: 0.6,
      });
    }
  } catch (error) {
    console.error("Error fetching blog articles for sitemap:", error);
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
