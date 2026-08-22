/**
 * Daily Social Media Post Cron Job
 * 
 * Automatically generates and publishes a daily social post to Facebook & Instagram
 * featuring either the top discounted flight deal or a newly published blog article.
 */

import { getDb } from "./db";
import { flights, articles, socialPosts } from "../drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { formatFlightDealPost, formatBlogArticlePost, executeSocialPublishing } from "./socialMediaAutomation";

/**
 * Generate and schedule/publish daily social media post
 */
export async function generateDailySocialPost(): Promise<{
  success: boolean;
  postId?: number;
  message: string;
}> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, message: "Database not available" };
    }

    // 1. Pick top discounted flight deal
    const [topFlight] = await db
      .select()
      .from(flights)
      .orderBy(desc(flights.discountPercent), desc(flights.id))
      .limit(1);

    let postData;

    if (topFlight) {
      postData = formatFlightDealPost(topFlight);
    } else {
      // Fallback: Pick top published article
      const [topArticle] = await db
        .select()
        .from(articles)
        .where(eq(articles.status, "published"))
        .orderBy(desc(articles.id))
        .limit(1);

      if (topArticle) {
        postData = formatBlogArticlePost(topArticle);
      } else {
        postData = formatFlightDealPost({
          fromCity: "Praha",
          toCity: "Dubaj",
          price: 4990,
          originalPrice: 12500,
          discountPercent: 60,
          airline: "Emirates",
          remainingSeats: 3,
        });
      }
    }

    // Insert draft post into database
    const [result] = await db.insert(socialPosts).values({
      platform: "both",
      postType: "flight_deal",
      contentType: "deal",
      title: postData.title,
      caption: postData.caption,
      imageUrl: postData.imageUrl,
      linkUrl: postData.linkUrl,
      hashtags: postData.hashtags,
      status: "scheduled",
      scheduledAt: new Date(),
    });

    const newPostId = Number(result.insertId);

    // Publish post
    const publishRes = await executeSocialPublishing(newPostId);

    return {
      success: publishRes.success,
      postId: newPostId,
      message: publishRes.isSimulated
        ? `Post #${newPostId} generated and processed in SIMULATION mode`
        : `Post #${newPostId} published successfully to Facebook and Instagram`,
    };
  } catch (error: any) {
    console.error("[DailySocialPostCron] Error generating daily social post:", error);
    return {
      success: false,
      message: error.message || "Failed to generate daily social post",
    };
  }
}

/**
 * Schedule daily cron job (runs every day at 09:00 AM)
 */
export function scheduleDailySocialPostCron() {
  const checkIntervalMs = 24 * 60 * 60 * 1000; // 24 hours
  
  // Initial run after 2 minutes server uptime
  setTimeout(() => {
    generateDailySocialPost().catch((err) =>
      console.error("[DailySocialPostCron] Initial run error:", err)
    );
  }, 120000);

  setInterval(() => {
    generateDailySocialPost().catch((err) =>
      console.error("[DailySocialPostCron] Scheduled run error:", err)
    );
  }, checkIntervalMs);

  console.log("[DailySocialPostCron] Daily social media post scheduler initialized.");
}
