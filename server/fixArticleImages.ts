import "dotenv/config";
import { getDb } from "./db";
import { articles } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const DESTINATION_IMAGE_MAP: Record<string, string> = {
  skandinavie: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&q=80",
  kanarske: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
  chorvatsko: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80",
  tunisko: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
  egypt: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&q=80",
  maroko: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80",
  pariz: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
  londyn: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
  dubaj: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
  bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
  rim: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
  barcelona: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
};

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("Database connection not available");
    process.exit(1);
  }

  const allArticles = await db.select().from(articles);
  console.log(`Checking ${allArticles.length} articles for broken/duplicate image URLs...`);

  let updatedCount = 0;

  for (const article of allArticles) {
    const slug = article.slug.toLowerCase();
    let newImage = article.featuredImage;
    let needsUpdate = false;

    // Check if featuredImage is invalid (does not start with http or /) or contains raw title text
    if (!newImage || !newImage.startsWith("http") || newImage.length > 250 || newImage.includes("<") || newImage.includes("Letenky do")) {
      needsUpdate = true;
    }

    // Match destination for distinct image
    for (const [key, imgUrl] of Object.entries(DESTINATION_IMAGE_MAP)) {
      if (slug.includes(key)) {
        newImage = imgUrl;
        needsUpdate = true;
        break;
      }
    }

    if (!needsUpdate && !newImage) {
      newImage = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";
      needsUpdate = true;
    }

    if (needsUpdate && newImage) {
      await db.update(articles).set({ featuredImage: newImage }).where(eq(articles.id, article.id));
      updatedCount++;
      console.log(`Updated image for article [${article.title}]: ${newImage}`);
    }
  }

  console.log(`✅ Finished fixing ${updatedCount} article images!`);
}

main().catch(console.error);
