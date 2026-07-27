import "dotenv/config";
import { getDb } from "./db";
import { articles } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Script to enrich existing blog and tip articles in the database
 * with rich contextual internal links (SEO cross-linking).
 */
async function main() {
  const db = await getDb();
  if (!db) {
    console.error("Database connection not available");
    process.exit(1);
  }

  const allArticles = await db.select().from(articles);
  console.log(`Found ${allArticles.length} articles in database. Updating internal links...`);

  let updatedCount = 0;

  for (const article of allArticles) {
    let content = article.content;
    let modified = false;

    // Check if internal links are already present
    if (!content.includes("/levne-letenky") && !content.includes("/last-minute")) {
      content += `\n\n---\n\n### ✈️ Užitečné odkazy a akční nabídky\n\n- [🔥 Akční a last minute letenky z Prahy](/last-minute)\n- [✈️ Nejlevnější letenky do 1 500 Kč](/letenky-do-1500)\n- [🚆 Vlaky a autobusové spoje po Evropě](/vlaky-autobusy)\n- [🏖️ Výhodné dovolené a zájezdy od Pelikán.cz](/dovolene)\n- [📊 Porovnání cen letenek a letové tipy](/porovnani-cen)`;
      modified = true;
    }

    if (modified) {
      await db
        .update(articles)
        .set({ content, updatedAt: new Date() })
        .where(eq(articles.id, article.id));
      updatedCount++;
    }
  }

  console.log(`✅ Successfully updated ${updatedCount} articles with SEO internal links!`);
}

main().catch(console.error);
