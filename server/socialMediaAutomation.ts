/**
 * Social Media Automation (Facebook & Instagram)
 * 
 * Meta Graph API Integration & Post Generator for Akční Letenky.
 * Automatically formats and publishes top flight deals and blog guides
 * to Facebook Pages and Instagram Business accounts.
 */

import { getDb } from "./db";
import { socialPosts, flights, articles, type Flight, type Article, type InsertSocialPost } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

interface PublishResult {
  success: boolean;
  fbPostId?: string;
  igMediaId?: string;
  fbError?: string;
  igError?: string;
  isSimulated: boolean;
}

// Default hashtags for travel & cheap flights
export const DEFAULT_HASHTAGS = [
  "#akcniletenky",
  "#levneletenky",
  "#cestovani",
  "#letenky",
  "#dovolenky",
  "#akcniceny",
  "#dnescestujem",
  "#dnesletim",
  "#tipnacestovani",
  "#vyhodneletenky",
];

/**
 * Format a Flight Deal into an engaging Social Media Caption for FB & IG
 */
export function formatFlightDealPost(flight: Partial<Flight>): {
  title: string;
  caption: string;
  hashtags: string;
  imageUrl: string;
  linkUrl: string;
} {
  const from = flight.fromCity || "Praha";
  const to = flight.toCity || "Destinace";
  const price = flight.price ? `${flight.price.toLocaleString("cs-CZ")} Kč` : "Super cena";
  const originalPrice = flight.originalPrice ? `${flight.originalPrice.toLocaleString("cs-CZ")} Kč` : null;
  const discountPercent = flight.discountPercent || (flight.originalPrice && flight.price ? Math.round((1 - flight.price / flight.originalPrice) * 100) : 0);
  const airline = flight.airline || "Letecká společnost";
  
  const title = `🔥 AKČNÍ LETENKY: ${from} ↔ ${to} za ${price}!`;
  
  let caption = `⚡ EXKLUZIVNÍ NABÍDKA LETENEK! ✈️\n\n`;
  caption += `📍 Trasa: ${from} ↔ ${to}\n`;
  caption += `💰 Akční cena: ${price}\n`;
  if (originalPrice) {
    caption += `🏷️ Běžná cena: ${originalPrice} (Ušetříte ${discountPercent}%!)\n`;
  }
  caption += `✈️ Aerolinka: ${airline}\n`;
  if (flight.remainingSeats && flight.remainingSeats <= 5) {
    caption += `⏰ Rychle! Zbývá pouze ${flight.remainingSeats} volných míst za tuto cenu.\n`;
  }
  caption += `\n✨ Proč navštívit ${to}?\n`;
  caption += `Užijte si skvělou dovolenou za zlomek běžné ceny. Počet letenek za nejnižší cenu je omezen!\n\n`;
  
  const linkUrl = flight.affiliateUrl || `https://www.akcni-letenky.com/letenky`;
  caption += `🔗 Rezervujte ihned zde: ${linkUrl}\n\n`;
  
  const hashtags = DEFAULT_HASHTAGS.join(" ") + ` #${to.replace(/\s+/g, "").toLowerCase()} #letenky${to.replace(/\s+/g, "").toLowerCase()}`;
  caption += hashtags;

  const imageUrl = flight.imageUrl || "https://www.akcni-letenky.com/hero-coastal.jpg";

  return { title, caption, hashtags, imageUrl, linkUrl };
}

/**
 * Format a Blog Article into an engaging Social Media Caption
 */
export function formatBlogArticlePost(article: Partial<Article>): {
  title: string;
  caption: string;
  hashtags: string;
  imageUrl: string;
  linkUrl: string;
} {
  const articleTitle = article.title || "Tipy pro cestovatele";
  const excerpt = article.excerpt || article.metaDescription || "Přečtěte si nejnovější průvodce a tipy pro cestování.";
  const linkUrl = article.slug ? `https://www.akcni-letenky.com/blog/${article.slug}` : "https://www.akcni-letenky.com/blog";

  const title = `📖 NOVÝ ČLÁNEK: ${articleTitle}`;

  let caption = `💡 PRŮVODCE PRO CESTOVATELE 🗺️\n\n`;
  caption += `👉 ${articleTitle}\n\n`;
  caption += `${excerpt}\n\n`;
  caption += `📌 V článku se dozvíte:\n`;
  caption += `• Praktické tipy a doporučení\n`;
  caption += `• Kde najít nejlepší místa a zážitky\n`;
  caption += `• Jak ušetřit při plánování cesty\n\n`;
  caption += `🔗 Čtěte celý článek zdarma na webu: ${linkUrl}\n\n`;

  const hashtags = DEFAULT_HASHTAGS.join(" ") + " #pruvodce #dovolenacesko #cestovani2026";
  caption += hashtags;

  const imageUrl = article.featuredImage || "https://www.akcni-letenky.com/hero-coastal.jpg";

  return { title, caption, hashtags, imageUrl, linkUrl };
}

/**
 * Publish post to Facebook Page via Meta Graph API
 */
export async function publishToFacebook(post: {
  title?: string;
  caption: string;
  imageUrl?: string;
  linkUrl?: string;
}): Promise<{ success: boolean; postId?: string; error?: string; isSimulated: boolean }> {
  const pageId = process.env.FB_PAGE_ID;
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;

  // Dry-run simulation mode when credentials not configured
  if (!pageId || !accessToken) {
    console.log("[SocialMedia] Facebook API credentials missing. Running in DRY-RUN SIMULATION mode.");
    return {
      success: true,
      postId: `simulated_fb_post_${Date.now()}`,
      isSimulated: true,
    };
  }

  try {
    let url = `https://graph.facebook.com/v19.0/${pageId}/feed`;
    let body: Record<string, any> = {
      message: post.caption,
      access_token: accessToken,
    };

    if (post.linkUrl) {
      body.link = post.linkUrl;
    }

    // If image URL is provided and valid HTTP link, publish photo post
    if (post.imageUrl && post.imageUrl.startsWith("http")) {
      url = `https://graph.facebook.com/v19.0/${pageId}/photos`;
      body = {
        url: post.imageUrl,
        caption: post.caption,
        access_token: accessToken,
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      const errorMsg = data.error?.message || response.statusText || "Facebook Graph API returned error";
      console.error("[SocialMedia] Facebook API error:", data.error);
      return { success: false, error: errorMsg, isSimulated: false };
    }

    return {
      success: true,
      postId: data.id || data.post_id,
      isSimulated: false,
    };
  } catch (err: any) {
    console.error("[SocialMedia] Error publishing to Facebook:", err);
    return {
      success: false,
      error: err.message || "Network error publishing to Facebook",
      isSimulated: false,
    };
  }
}

/**
 * Publish post to Instagram Business Account via Meta Graph API
 */
export async function publishToInstagram(post: {
  caption: string;
  imageUrl: string;
}): Promise<{ success: boolean; mediaId?: string; error?: string; isSimulated: boolean }> {
  const igUserId = process.env.IG_USER_ID;
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;

  // Dry-run simulation mode when credentials not configured
  if (!igUserId || !accessToken) {
    console.log("[SocialMedia] Instagram API credentials missing. Running in DRY-RUN SIMULATION mode.");
    return {
      success: true,
      mediaId: `simulated_ig_media_${Date.now()}`,
      isSimulated: true,
    };
  }

  try {
    const validImageUrl = post.imageUrl && post.imageUrl.startsWith("http")
      ? post.imageUrl
      : "https://www.akcni-letenky.com/hero-coastal.jpg";

    // Step 1: Create IG Media Container
    const containerUrl = `https://graph.facebook.com/v19.0/${igUserId}/media`;
    const containerRes = await fetch(containerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: validImageUrl,
        caption: post.caption,
        access_token: accessToken,
      }),
    });

    const containerData = await containerRes.json();

    if (!containerRes.ok || containerData.error || !containerData.id) {
      const errorMsg = containerData.error?.message || "Failed to create Instagram media container";
      console.error("[SocialMedia] Instagram Container Error:", containerData.error);
      return { success: false, error: errorMsg, isSimulated: false };
    }

    const creationId = containerData.id;

    // Step 2: Publish IG Media Container
    const publishUrl = `https://graph.facebook.com/v19.0/${igUserId}/media_publish`;
    const publishRes = await fetch(publishUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken,
      }),
    });

    const publishData = await publishRes.json();

    if (!publishRes.ok || publishData.error || !publishData.id) {
      const errorMsg = publishData.error?.message || "Failed to publish Instagram media";
      console.error("[SocialMedia] Instagram Publish Error:", publishData.error);
      return { success: false, error: errorMsg, isSimulated: false };
    }

    return {
      success: true,
      mediaId: publishData.id,
      isSimulated: false,
    };
  } catch (err: any) {
    console.error("[SocialMedia] Error publishing to Instagram:", err);
    return {
      success: false,
      error: err.message || "Network error publishing to Instagram",
      isSimulated: false,
    };
  }
}

/**
 * Execute full publication flow for a socialPost entry
 */
export async function executeSocialPublishing(postId: number): Promise<PublishResult> {
  const db = await getDb();
  if (!db) {
    return {
      success: true,
      fbPostId: `simulated_fb_${Date.now()}`,
      igMediaId: `simulated_ig_${Date.now()}`,
      isSimulated: true,
    };
  }

  const [post] = await db.select().from(socialPosts).where(eq(socialPosts.id, postId)).limit(1);

  if (!post) {
    throw new Error(`Social post with ID ${postId} not found`);
  }

  let fbResult = { success: true, postId: undefined as string | undefined, error: undefined as string | undefined, isSimulated: true };
  let igResult = { success: true, mediaId: undefined as string | undefined, error: undefined as string | undefined, isSimulated: true };

  const targetPlatform = post.platform || "both";

  // Publish to Facebook if target is facebook, both, or all
  if (targetPlatform === "facebook" || targetPlatform === "both" || targetPlatform === "all") {
    fbResult = await publishToFacebook({
      title: post.title || undefined,
      caption: post.caption,
      imageUrl: post.imageUrl || undefined,
      linkUrl: post.linkUrl || undefined,
    });
  }

  // Publish to Instagram if target is instagram, both, or all
  if (targetPlatform === "instagram" || targetPlatform === "both" || targetPlatform === "all") {
    igResult = await publishToInstagram({
      caption: post.caption,
      imageUrl: post.imageUrl || "https://www.akcni-letenky.com/hero-coastal.jpg",
    });
  }

  const isOverallSuccess = fbResult.success && igResult.success;
  const status = isOverallSuccess ? "published" : "failed";

  await db
    .update(socialPosts)
    .set({
      status,
      publishedAt: new Date(),
      fbPostId: fbResult.postId,
      igMediaId: igResult.mediaId,
      fbError: fbResult.error,
      igError: igResult.error,
      updatedAt: new Date(),
    })
    .where(eq(socialPosts.id, postId));

  return {
    success: isOverallSuccess,
    fbPostId: fbResult.postId,
    igMediaId: igResult.mediaId,
    fbError: fbResult.error,
    igError: igResult.error,
    isSimulated: fbResult.isSimulated || igResult.isSimulated,
  };
}
