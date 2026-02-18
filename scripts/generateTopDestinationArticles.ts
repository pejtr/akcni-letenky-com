/**
 * Generate Blog Articles for Top 5 Destinations
 * 
 * Creates SEO-optimized travel guide articles with internal linking
 */

import { getDb } from "../server/db";
import { articles } from "../drizzle/schema";
import { invokeLLM } from "../server/_core/llm";

interface DestinationArticle {
  destination: string;
  slug: string;
  seoPageSlug: string; // For internal linking
  searchVolume: number;
  keywords: string[];
}

const TOP_DESTINATIONS: DestinationArticle[] = [
  {
    destination: "Zanzibar",
    slug: "10-tipu-pro-cestu-na-zanzibar",
    seoPageSlug: "zanzibar",
    searchVolume: 5000,
    keywords: ["letenky zanzibar", "zanzibar letenky", "dovolená zanzibar", "tipy zanzibar"],
  },
  {
    destination: "Island",
    slug: "pruvodce-islandem-tipy-pro-cestovatele",
    seoPageSlug: "island",
    searchVolume: 5000,
    keywords: ["letenky island", "island letenky", "dovolená island", "tipy island", "polární záře"],
  },
  {
    destination: "New York",
    slug: "navstivte-new-york-kompletni-pruvodce",
    seoPageSlug: "new-york",
    searchVolume: 5000,
    keywords: ["letenky new york", "new york letenky", "dovolená new york", "tipy new york"],
  },
  {
    destination: "Londýn",
    slug: "londyn-kompletni-pruvodce-pro-navstevniky",
    seoPageSlug: "londyn",
    searchVolume: 5000,
    keywords: ["letenky londýn", "londýn letenky", "dovolená londýn", "tipy londýn"],
  },
  {
    destination: "Paříž",
    slug: "pariz-mesto-lasky-a-svetel-pruvodce",
    seoPageSlug: "pariz",
    searchVolume: 5000,
    keywords: ["letenky paříž", "paříž letenky", "dovolená paříž", "tipy paříž"],
  },
];

async function generateArticleContent(dest: DestinationArticle): Promise<{ title: string; content: string; metaDescription: string }> {
  const prompt = `Vytvoř SEO-optimalizovaný blogový článek v češtině o destinaci ${dest.destination} pro web s levnými letenkami.

POŽADAVKY:
- Délka: 1200-1500 slov
- Styl: Praktický průvodce s konkrétními tipy pro cestovatele
- Tón: Přátelský, inspirativní, ale profesionální
- Cílová skupina: Čeští cestovatelé hledající levné letenky a praktické rady

STRUKTURA:
1. Úvod (100-150 slov) - Proč navštívit ${dest.destination}
2. Kdy jet (150-200 slov) - Nejlepší období, počasí, sezónnost
3. Co vidět a zažít (400-500 slov) - Top 5-7 míst a aktivit s konkrétními tipy
4. Praktické informace (300-400 slov) - Doprava, ubytování, jídlo, rozpočet
5. Tipy pro úsporu (200-250 slov) - Jak ušetřit na letenky, ubytování, stravování
6. Závěr (100-150 slov) - Shrnutí a motivace k cestě

KLÍČOVÁ SLOVA K POUŽITÍ: ${dest.keywords.join(", ")}

INTERNÍ ODKAZY (PŘIDEJ DO TEXTU):
- V úvodu: odkaz na stránku s letenkami: [letenky do ${dest.destination}](/letenky-${dest.seoPageSlug})
- V sekci "Tipy pro úsporu": odkaz na stránku s letenkami: [nejlevnější letenky do ${dest.destination}](/letenky-${dest.seoPageSlug})

FORMÁT VÝSTUPU:
Vrať JSON objekt s těmito poli:
{
  "title": "SEO-optimalizovaný titulek (max 60 znaků, obsahuje klíčové slovo)",
  "metaDescription": "Meta popis (150-160 znaků, obsahuje klíčové slovo a CTA)",
  "content": "Plný text článku ve formátu Markdown s nadpisy H2 a H3"
}

DŮLEŽITÉ:
- Používej markdown formátování (## pro H2, ### pro H3, **tučné**, *kurzíva*)
- Přidej konkrétní ceny v Kč kde je to relevantní
- Zahrň praktické tipy (např. "Rezervujte letenky 2-3 měsíce dopředu")
- Nezapomeň na interní odkazy na stránku s letenkami
- Buď konkrétní - uveď názvy míst, restaurací, hotelů
- Piš v češtině, používej české znaky (č, ř, š, ž, ý, á, í, é, ů, ú)`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "Jsi expert na cestování a SEO copywriting. Píšeš praktické a inspirativní cestovní průvodce v češtině." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "article_content",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string", description: "SEO-optimized article title" },
            metaDescription: { type: "string", description: "Meta description for SEO" },
            content: { type: "string", description: "Full article content in Markdown" },
          },
          required: ["title", "metaDescription", "content"],
          additionalProperties: false,
        },
      },
    },
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return result;
}

async function generateAllArticles() {
  console.log("🚀 Starting blog article generation for top 5 destinations...\n");

  for (const dest of TOP_DESTINATIONS) {
    console.log(`📝 Generating article for ${dest.destination}...`);
    
    try {
      // Generate content with LLM
      const { title, content, metaDescription } = await generateArticleContent(dest);
      
      console.log(`   ✅ Generated: "${title}"`);
      console.log(`   📊 Content length: ${content.length} characters`);
      
      // Save to database
      const db = await getDb();
      if (!db) {
        console.error("   ❌ Database not available");
        continue;
      }
      
      await db.insert(articles).values({
        title,
        slug: dest.slug,
        content,
        metaDescription,
        keywords: dest.keywords.join(", "),
        featuredImage: `/destinations/${dest.seoPageSlug}.jpg`,
        author: "Redakce Akční-Letenky.com",
        publishedAt: new Date(),
        category: "destination-guides",
      });
      
      console.log(`   💾 Saved to database with slug: ${dest.slug}\n`);
      
      // Wait 2 seconds between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`   ❌ Error generating article for ${dest.destination}:`, error);
    }
  }

  console.log("✨ All articles generated successfully!");
}

// Run the script
generateAllArticles().catch(console.error);
