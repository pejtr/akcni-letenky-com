/**
 * Automatic Blog Article Generator
 * Generates SEO-optimized blog articles about flight deals using LLM
 */

import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { articles } from "../drizzle/schema";

export interface ArticleGenerationParams {
  destination: string;
  destinationSlug: string;
  price?: number;
  currency?: string;
  airline?: string;
  departureDate?: string;
  returnDate?: string;
}

/**
 * Generate a blog article about a flight deal
 */
export async function generateFlightArticle(params: ArticleGenerationParams): Promise<{
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  tags: string[];
}> {
  const { destination, destinationSlug, price, currency = "CZK", airline, departureDate, returnDate } = params;

  // Use a default placeholder image for now
  // In production, you would search for images using Manus search API
  const featuredImage = `https://source.unsplash.com/800x600/?${encodeURIComponent(destination)},travel`;

  // Generate article content using LLM
  const prompt = `Napiš SEO-optimalizovaný článek o akčních letenkách do destinace ${destination}.

PARAMETRY NABÍDKY:
- Destinace: ${destination}
${price ? `- Cena: ${price} ${currency}` : ""}
${airline ? `- Aerolinka: ${airline}` : ""}
${departureDate ? `- Datum odletu: ${departureDate}` : ""}
${returnDate ? `- Datum návratu: ${returnDate}` : ""}

POŽADAVKY NA ČLÁNEK:
1. **Titulek (30-60 znaků)**: Obsahuje klíčová slova "letenky", destinaci a cenu/slevu
2. **Perex (150-200 znaků)**: Stručný úvod s hlavními výhodami nabídky
3. **Obsah (800-1200 slov)**: Strukturovaný článek s těmito sekcemi:
   - Úvod (proč jet do ${destination})
   - Nejlepší čas na návštěvu
   - Top 5 míst k návštěvě
   - Praktické tipy (ubytování, doprava, jídlo)
   - Jak ušetřit na cestě (zmínka o Revolut kartě s odkazem na www.revolut-bonus.cz)
   - Závěr s call-to-action

4. **Formátování**: Markdown s H2/H3 nadpisy, seznamy, tučným textem
5. **SEO**: Klíčová slova "letenky do ${destination}", "akční letenky", "levné letenky"
6. **Tagy**: 5-7 relevantních tagů (destinace, region, typ dovolené)
7. **Kategorie**: "deals" nebo "guides" nebo "destinations"

STYL:
- Přátelský, nadšený tón (jako cestovní expert)
- Konkrétní tipy a doporučení
- Zmínka o aktuální nabídce letenek
- Call-to-action na konci (odkaz na vyhledávání letenek)

VÝSTUP (JSON):
{
  "title": "...",
  "excerpt": "...",
  "content": "...",
  "category": "deals|guides|destinations",
  "tags": ["tag1", "tag2", ...]
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Jsi expert na cestování a SEO copywriting. Píšeš poutavé články o cestování s důrazem na praktické tipy a SEO optimalizaci.",
      },
      {
        role: "user",
        content: [{ type: "text", text: prompt }],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "article_generation",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Article title (30-60 characters)" },
            excerpt: { type: "string", description: "Article excerpt (150-200 characters)" },
            content: { type: "string", description: "Full article content in Markdown format" },
            category: { type: "string", enum: ["deals", "guides", "destinations"], description: "Article category" },
            tags: { type: "array", items: { type: "string" }, description: "Article tags (5-7 tags)" },
          },
          required: ["title", "excerpt", "content", "category", "tags"],
          additionalProperties: false,
        },
      },
    },
  });

  const messageContent = response.choices[0].message.content;
  const contentString = typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent);
  const articleData = JSON.parse(contentString || "{}");

  return {
    title: articleData.title,
    slug: destinationSlug,
    excerpt: articleData.excerpt,
    content: articleData.content,
    featuredImage,
    category: articleData.category,
    tags: articleData.tags,
  };
}

/**
 * Save generated article to database
 */
export async function saveGeneratedArticle(article: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  tags: string[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();

  await db.insert(articles).values({
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    featuredImage: article.featuredImage,
    author: "Akční Letenky",
    category: article.category,
    keywords: article.tags.join(", "),
    status: "published",
    publishedAt: now,
  });

  return article.slug;
}

/**
 * Generate article from Pelikan deal
 */
export async function generateArticleFromDeal(deal: {
  destination: string;
  price: number;
  currency: string;
  airline?: string;
  departureDate?: string;
  returnDate?: string;
}) {
  const destinationSlug = deal.destination.toLowerCase().replace(/\s+/g, "-");

  const article = await generateFlightArticle({
    destination: deal.destination,
    destinationSlug: `letenky-do-${destinationSlug}-${Date.now()}`,
    price: deal.price,
    currency: deal.currency,
    airline: deal.airline,
    departureDate: deal.departureDate,
    returnDate: deal.returnDate,
  });

  const slug = await saveGeneratedArticle(article);

  return { slug, article };
}

/**
 * Generate daily article from top Pelikan deal
 */
export async function generateDailyArticle() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get cheapest flight from flights table
  const { flights } = await import("../drizzle/schema");
  const { asc, desc } = await import("drizzle-orm");
  
  const deals = await db
    .select()
    .from(flights)
    .orderBy(asc(flights.price))
    .limit(1);

  if (!deals || deals.length === 0) {
    throw new Error("No deals available for article generation");
  }

  const deal = deals[0];

  return await generateArticleFromDeal({
    destination: deal.toCity,
    price: deal.price,
    currency: "CZK",
    airline: deal.airline || undefined,
    departureDate: deal.departureDate ? new Date(deal.departureDate).toISOString().split('T')[0] : undefined,
    returnDate: deal.returnDate ? new Date(deal.returnDate).toISOString().split('T')[0] : undefined,
  });
}
