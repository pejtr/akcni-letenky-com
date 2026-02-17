/**
 * Daily Article Generation Cron Job
 * Automatically generates blog articles from cheapest flight deals
 */

import { CronJob } from "cron";
import { generateDailyArticle } from "./blogGenerator";

let dailyArticleJob: CronJob | null = null;

/**
 * Start daily article generation cron job
 * Runs every day at 8:00 AM CET
 */
export function startDailyArticleCron() {
  if (dailyArticleJob) {
    console.log("[DailyArticle] Cron job already running");
    return;
  }

  // Run every day at 8:00 AM CET (7:00 AM UTC in winter, 6:00 AM UTC in summer)
  // Using 0 8 * * * for 8:00 AM local time
  dailyArticleJob = new CronJob(
    "0 8 * * *", // Every day at 8:00 AM
    async () => {
      try {
        console.log("[DailyArticle] Starting daily article generation...");
        const result = await generateDailyArticle();
        console.log(`[DailyArticle] Article generated successfully: ${result.slug}`);
        console.log(`[DailyArticle] Title: ${result.article.title}`);
      } catch (error) {
        console.error("[DailyArticle] Error generating daily article:", error);
      }
    },
    null, // onComplete
    true, // start immediately
    "Europe/Prague" // timezone
  );

  console.log("[DailyArticle] Cron job started - will run daily at 8:00 AM CET");
}

/**
 * Stop daily article generation cron job
 */
export function stopDailyArticleCron() {
  if (dailyArticleJob) {
    dailyArticleJob.stop();
    dailyArticleJob = null;
    console.log("[DailyArticle] Cron job stopped");
  }
}

/**
 * Get next scheduled run time
 */
export function getNextArticleGeneration(): Date | null {
  if (!dailyArticleJob) return null;
  return dailyArticleJob.nextDate().toJSDate();
}
