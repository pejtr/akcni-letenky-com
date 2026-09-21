/**
 * Script to add Revolut referral mentions to existing blog articles
 * Run with: node add-revolut-mentions.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { articles } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;
const REVOLUT_AFFILIATE_URL = process.env.REVOLUT_AFFILIATE_URL?.trim();

if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in environment");
  process.exit(1);
}

if (!REVOLUT_AFFILIATE_URL) {
  console.error("REVOLUT_AFFILIATE_URL is not configured; refusing to publish Revolut links.");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

// Revolut mention templates for different article categories
const partnerMention = `\n\n### 💳 Tip pro cestovatele: platby v zahraničí\n\nPodívejte se na [aktuální nabídku Revolut](${REVOLUT_AFFILIATE_URL}) pro cestovatele. Jde o partnerský odkaz; konkrétní podmínky, dostupnost a případná zvýhodnění vždy ověřte přímo na stránce Revolutu.\n\n`;

const revolutMentions = {
  deals: partnerMention,
  guides: partnerMention,
  destinations: partnerMention,
  airlines: partnerMention,
};

async function addRevolutMentions() {
  try {
    // Get all published articles
    const allArticles = await db.select().from(articles).where(eq(articles.status, "published"));
    
    console.log(`Found ${allArticles.length} published articles`);
    
    let updated = 0;
    
    for (const article of allArticles) {
      // Skip if article already mentions Revolut
      if (article.content.toLowerCase().includes("revolut")) {
        console.log(`⏭️  Skipping "${article.title}" - already mentions Revolut`);
        continue;
      }
      
      // Get appropriate mention based on category
      const category = article.category || "general";
      const mention = revolutMentions[category] || revolutMentions.guides;
      
      // Insert mention after first paragraph (after first \n\n)
      const firstParagraphEnd = article.content.indexOf("\n\n");
      let newContent;
      
      if (firstParagraphEnd > 0) {
        // Insert after first paragraph
        newContent = article.content.slice(0, firstParagraphEnd + 2) + 
                    mention + 
                    article.content.slice(firstParagraphEnd + 2);
      } else {
        // Append at the end
        newContent = article.content + "\n\n" + mention;
      }
      
      // Update article
      await db
        .update(articles)
        .set({ 
          content: newContent,
          updatedAt: new Date()
        })
        .where(eq(articles.id, article.id));
      
      console.log(`✅ Updated "${article.title}" (${category})`);
      updated++;
    }
    
    console.log(`\n✨ Successfully updated ${updated} articles with Revolut mentions`);
    
  } catch (error) {
    console.error("Error adding Revolut mentions:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

addRevolutMentions();
