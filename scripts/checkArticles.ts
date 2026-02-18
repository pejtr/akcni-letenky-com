import { getDb } from "../server/db";
import { articles } from "../drizzle/schema";
import { desc } from "drizzle-orm";

async function checkArticles() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  const recentArticles = await db
    .select()
    .from(articles)
    .orderBy(desc(articles.publishedAt))
    .limit(10);

  console.log("\n📰 Recent articles in database:\n");
  recentArticles.forEach((a) => {
    const date = a.publishedAt?.toISOString().split("T")[0] || "No date";
    console.log(`- ${date} | ${a.title}`);
    console.log(`  Slug: ${a.slug}`);
    console.log(`  Category: ${a.category}\n`);
  });
}

checkArticles().catch(console.error);
