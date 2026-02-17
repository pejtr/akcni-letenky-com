/**
 * Script to add Revolut referral mentions to existing blog articles
 * Run with: node add-revolut-mentions.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { articles } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in environment");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

// Revolut mention templates for different article categories
const revolutMentions = {
  deals: `\n\n## 💳 Tip pro cestovatele: Ušetřete na směnných kurzech\n\nPři cestování do zahraničí doporučujeme použít [Revolut kartu](https://www.revolut-bonus.cz), která nabízí výhodné směnné kurzy bez skrytých poplatků. Ideální pro výběry z bankomatů i platby v obchodech. **Získejte 500 Kč bonus za registraci.**\n\n`,
  
  guides: `\n\n### 💰 Platby v zahraničí bez poplatků\n\nJedním z nejlepších tipů pro cestování je mít správnou platební kartu. [Revolut](https://www.revolut-bonus.cz) nabízí bezplatné směny do 1000 EUR měsíčně s mezibankovním kurzem - ušetříte stovky korun oproti klasickým bankám. **Registrací získáte 500 Kč bonus.**\n\n`,
  
  destinations: `\n\n## 🏦 Jak ušetřit na platbách v destinaci\n\nPři cestování do této destinace určitě využijte [Revolut kartu](https://www.revolut-bonus.cz) - ušetříte až 3-5% na směnných kurzech oproti klasickým bankám. Ideální pro výběry hotovosti i platby kartou. **Bonus 500 Kč za registraci.**\n\n`,
  
  airlines: `\n\n### 💳 Platba letenek bez poplatků\n\nPři nákupu mezinárodních letenek doporučujeme platit kartou [Revolut](https://www.revolut-bonus.cz), která nabízí výhodné kurzy a žádné poplatky za zahraniční transakce. **Získejte 500 Kč bonus za registraci.**\n\n`
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
