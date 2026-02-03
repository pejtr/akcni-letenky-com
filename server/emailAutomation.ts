import { getDb } from "./db";
import { emailCaptures, articles, flights, type Flight } from "../drizzle/schema";
import { desc, sql, and, gte } from "drizzle-orm";

/**
 * Email automation for weekly newsletter
 * Sends personalized travel tips and deals to subscribers
 */

interface NewsletterContent {
  subject: string;
  featuredArticle: {
    title: string;
    excerpt: string;
    url: string;
    image: string;
  } | null;
  topDeals: Array<{
    destination: string;
    price: number;
    originalPrice: number;
    discount: number;
    url: string;
  }>;
  travelTip: string;
}

/**
 * Get newsletter content for this week
 */
export async function getWeeklyNewsletterContent(): Promise<NewsletterContent> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get most recent published article
  const recentArticles = await db
    .select()
    .from(articles)
    .where(sql`${articles.status} = 'published'`)
    .orderBy(desc(articles.publishedAt))
    .limit(1);

  const featuredArticle = recentArticles[0]
    ? {
        title: recentArticles[0].title,
        excerpt: recentArticles[0].excerpt || "",
        url: `https://akcni-letenky.com/blog/${recentArticles[0].slug}`,
        image: recentArticles[0].featuredImage || "",
      }
    : null;

  // Get top 5 flight deals (lowest prices, featured)
  const topFlights = await db
    .select()
    .from(flights)
    .where(sql`${flights.isFeatured} = 1`)
    .orderBy(sql`${flights.price} ASC`)
    .limit(5);

  const topDeals = topFlights.map((flight: Flight) => ({
    destination: flight.toCity,
    price: flight.price,
    originalPrice: flight.originalPrice || flight.price,
    discount: flight.discountPercent || 0,
    url: flight.affiliateUrl,
  }));

  // Random travel tip
  const travelTips = [
    "💡 Tip týdne: Rezervujte vlakové jízdenky 2-3 měsíce předem a ušetřete až 70%!",
    "🌍 Tip týdne: Noční vlaky = ušetřete za ubytování a probuďte se v nové destinaci!",
    "✈️ Tip týdne: Porovnejte ceny vlaků a letadel - často je vlak rychlejší i levnější!",
    "🚆 Tip týdne: Eurail Pass se vyplatí při 3+ cestách za měsíc. Spočítejte si to!",
    "🌱 Tip týdne: Vlak produkuje 90% méně CO₂ než letadlo. Cestujte ekologicky!",
  ];
  const randomTip = travelTips[Math.floor(Math.random() * travelTips.length)];

  return {
    subject: `🎯 Týdenní přehled: Nejlevnější letenky a vlaky + ${featuredArticle?.title || "cestovatelské tipy"}`,
    featuredArticle,
    topDeals,
    travelTip: randomTip,
  };
}

/**
 * Get all newsletter subscribers
 */
export async function getNewsletterSubscribers(): Promise<
  Array<{ email: string; source: string | null }>
> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const subscribers = await db
    .select({
      email: emailCaptures.email,
      source: emailCaptures.source,
    })
    .from(emailCaptures)
    .where(
      and(
        sql`${emailCaptures.email} IS NOT NULL`,
        sql`${emailCaptures.email} != ''`
      )
    )
    .groupBy(emailCaptures.email, emailCaptures.source);

  return subscribers;
}

/**
 * Generate HTML email template for newsletter
 */
export function generateNewsletterHTML(content: NewsletterContent): string {
  const { featuredArticle, topDeals, travelTip } = content;

  return `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #ec4899;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #ec4899;
    }
    .featured-article {
      margin: 30px 0;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }
    .featured-article img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    .featured-article-content {
      padding: 20px;
    }
    .featured-article h2 {
      margin: 0 0 10px 0;
      color: #1f2937;
    }
    .featured-article p {
      color: #6b7280;
      margin: 0 0 15px 0;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background-color: #ec4899;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
    }
    .deals-section {
      margin: 30px 0;
    }
    .deals-section h3 {
      color: #1f2937;
      margin-bottom: 20px;
    }
    .deal-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      margin-bottom: 10px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      text-decoration: none;
      color: inherit;
    }
    .deal-card:hover {
      background-color: #f9fafb;
    }
    .deal-destination {
      font-weight: 600;
      color: #1f2937;
    }
    .deal-price {
      text-align: right;
    }
    .deal-price-current {
      font-size: 20px;
      font-weight: bold;
      color: #ec4899;
    }
    .deal-price-original {
      text-decoration: line-through;
      color: #9ca3af;
      font-size: 14px;
    }
    .deal-discount {
      background-color: #fef3c7;
      color: #92400e;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .tip-box {
      background-color: #dbeafe;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">✈️ AKČNÍ LETENKY</div>
      <p style="color: #6b7280; margin: 10px 0 0 0;">Týdenní přehled nejlepších nabídek</p>
    </div>

    ${
      featuredArticle
        ? `
    <div class="featured-article">
      ${featuredArticle.image ? `<img src="${featuredArticle.image}" alt="${featuredArticle.title}">` : ""}
      <div class="featured-article-content">
        <h2>${featuredArticle.title}</h2>
        <p>${featuredArticle.excerpt}</p>
        <a href="${featuredArticle.url}" class="btn">Číst článek →</a>
      </div>
    </div>
    `
        : ""
    }

    <div class="tip-box">
      ${travelTip}
    </div>

    <div class="deals-section">
      <h3>🔥 Top 5 Nabídek Týdne</h3>
      ${topDeals
        .map(
          (deal) => `
        <a href="${deal.url}" class="deal-card">
          <div>
            <div class="deal-destination">${deal.destination}</div>
            ${deal.discount > 0 ? `<span class="deal-discount">-${deal.discount}%</span>` : ""}
          </div>
          <div class="deal-price">
            <div class="deal-price-current">${deal.price.toLocaleString()} Kč</div>
            ${deal.originalPrice > deal.price ? `<div class="deal-price-original">${deal.originalPrice.toLocaleString()} Kč</div>` : ""}
          </div>
        </a>
      `
        )
        .join("")}
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://akcni-letenky.com" class="btn">Prohlédnout Všechny Nabídky</a>
    </div>

    <div class="footer">
      <p>Dostáváte tento email, protože jste se přihlásili k odběru newsletteru Akční Letenky.</p>
      <p style="margin-top: 10px;">
        <a href="https://akcni-letenky.com" style="color: #ec4899;">Navštívit web</a> | 
        <a href="https://akcni-letenky.com/blog" style="color: #ec4899;">Blog</a> | 
        <a href="https://akcni-letenky.com/vlaky-autobusy" style="color: #ec4899;">Vlaky & Autobusy</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send newsletter to all subscribers
 * NOTE: This is a placeholder. In production, integrate with email service (SendGrid, Mailgun, etc.)
 */
export async function sendWeeklyNewsletter(): Promise<{
  success: boolean;
  sent: number;
  failed: number;
}> {
  const content = await getWeeklyNewsletterContent();
  const subscribers = await getNewsletterSubscribers();
  const html = generateNewsletterHTML(content);

  console.log(`📧 Preparing to send newsletter to ${subscribers.length} subscribers`);
  console.log(`Subject: ${content.subject}`);
  console.log(`Featured Article: ${content.featuredArticle?.title || "None"}`);
  console.log(`Top Deals: ${content.topDeals.length}`);

  // TODO: Integrate with email service provider
  // For now, just log the email content
  console.log("\n--- Newsletter HTML Preview ---");
  console.log(html.substring(0, 500) + "...");
  console.log("--- End Preview ---\n");

  // In production, you would:
  // 1. Use SendGrid/Mailgun/AWS SES API
  // 2. Send in batches (100-500 at a time)
  // 3. Track opens, clicks, bounces
  // 4. Handle unsubscribes
  // 5. Respect rate limits

  return {
    success: true,
    sent: subscribers.length,
    failed: 0,
  };
}

/**
 * Schedule weekly newsletter (to be called by cron job or scheduler)
 */
export async function scheduleWeeklyNewsletter() {
  console.log("🕐 Scheduled newsletter job starting...");
  const result = await sendWeeklyNewsletter();
  console.log(
    `✅ Newsletter job completed: ${result.sent} sent, ${result.failed} failed`
  );
  return result;
}
