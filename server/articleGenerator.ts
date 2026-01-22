import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { articles, destinations } from "../drizzle/schema";
import { eq } from "drizzle-orm";

interface ArticleTemplate {
  type: "destination_guide" | "airline_review" | "seasonal_deals" | "travel_tips";
  title: string;
  keywords: string[];
  prompt: string;
}

const articleTemplates: ArticleTemplate[] = [
  {
    type: "destination_guide",
    title: "Akční letenky do {destination} - Kompletní průvodce 2026",
    keywords: ["akční letenky", "levné letenky", "letenky do {destination}", "{destination} letenky"],
    prompt: `Napiš SEO-optimalizovaný článek o akčních letenkách do destinace {destination}. Článek by měl obsahovat:

1. Úvod - proč letět do {destination} (100-150 slov)
2. Kdy je nejlepší čas na návštěvu (100 slov)
3. Jak najít nejlevnější letenky (150 slov)
4. Tipy na úsporu při cestování (150 slov)
5. Co navštívit v {destination} (200 slov)
6. Praktické informace (letiště, doprava, víza) (100 slov)
7. Závěr s výzvou k akci (50 slov)

Použij přirozený, přátelský tón. Zahrň konkrétní ceny letenek (např. "od 1 500 Kč") a praktické rady. Článek by měl být 800-900 slov.`,
  },
  {
    type: "seasonal_deals",
    title: "Nejlevnější letenky na {season} 2026 - Kam letět výhodně",
    keywords: ["levné letenky", "akční letenky", "{season} letenky", "letenky 2026"],
    prompt: `Napiš SEO-optimalizovaný článek o nejlevnějších letenkách na {season} 2026. Článek by měl obsahovat:

1. Úvod - proč je {season} skvělý čas na cestování (100 slov)
2. Top 5 destinací na {season} s cenami letenek (300 slov)
3. Jak najít nejlepší nabídky (150 slov)
4. Tipy na rezervaci letenek s předstihem (100 slov)
5. Co si zabalit a jak se připravit (150 slov)
6. Závěr s výzvou k akci (50 slov)

Použij přirozený, přátelský tón. Zahrň konkrétní ceny letenek a praktické rady. Článek by měl být 750-850 slov.`,
  },
  {
    type: "airline_review",
    title: "Letenky {airline} - Recenze, ceny a zkušenosti 2026",
    keywords: ["letenky {airline}", "{airline} recenze", "{airline} ceny", "akční letenky {airline}"],
    prompt: `Napiš SEO-optimalizovaný článek o letecké společnosti {airline}. Článek by měl obsahovat:

1. Úvod - základní informace o {airline} (100 slov)
2. Destinace a síť letů (150 slov)
3. Ceny letenek a akční nabídky (200 slov)
4. Služby na palubě (zavazadla, jídlo, zábava) (200 slov)
5. Zkušenosti cestujících - klady a zápory (150 slov)
6. Tipy jak ušetřit při rezervaci (100 slov)
7. Závěr a doporučení (50 slov)

Použij objektivní, informativní tón. Zahrň konkrétní ceny a praktické rady. Článek by měl být 850-950 slov.`,
  },
  {
    type: "travel_tips",
    title: "Jak najít nejlevnější letenky - 10 osvědčených tipů pro rok 2026",
    keywords: ["nejlevnější letenky", "jak najít levné letenky", "tipy na letenky", "ušetřit na letenkách"],
    prompt: `Napiš SEO-optimalizovaný článek s tipy na hledání nejlevnějších letenek. Článek by měl obsahovat:

1. Úvod - proč je důležité hledat levné letenky (100 slov)
2. Tip 1: Rezervujte s předstihem (100 slov)
3. Tip 2: Buďte flexibilní s daty (100 slov)
4. Tip 3: Porovnávejte ceny (100 slov)
5. Tip 4: Využijte akční nabídky (100 slov)
6. Tip 5: Letěte mimo sezónu (100 slov)
7. Tip 6-10: Další tipy (300 slov)
8. Závěr s výzvou k akci (50 slov)

Použij přirozený, přátelský tón. Zahrň konkrétní příklady a praktické rady. Článek by měl být 850-950 slov.`,
  },
];

/**
 * Generate a single article using AI
 */
export async function generateArticle(
  template: ArticleTemplate,
  variables: Record<string, string>
): Promise<{ title: string; content: string; excerpt: string; keywords: string }> {
  // Replace variables in template
  let title = template.title;
  let prompt = template.prompt;
  let keywords = template.keywords.join(", ");

  for (const [key, value] of Object.entries(variables)) {
    title = title.replace(new RegExp(`\\{${key}\\}`, "g"), value);
    prompt = prompt.replace(new RegExp(`\\{${key}\\}`, "g"), value);
    keywords = keywords.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }

  // Generate article content using LLM
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Jsi profesionální copywriter specializující se na cestovní obsah a SEO. Píšeš v češtině přirozeným, přátelským stylem. Tvé články jsou informativní, čtivé a optimalizované pro vyhledávače.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const rawContent = response.choices[0]?.message?.content || "";
  const content = typeof rawContent === "string" ? rawContent : "";

  // Generate excerpt (first 150 characters)
  const excerpt = content.substring(0, 150).trim() + "...";

  return {
    title,
    content,
    excerpt,
    keywords,
  };
}

/**
 * Generate daily articles automatically
 */
export async function generateDailyArticles(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error("[ArticleGenerator] Database not available");
    return;
  }

  try {
    // Get random destinations for article generation
    const allDestinations = await db.select().from(destinations).limit(10);
    
    if (allDestinations.length === 0) {
      console.log("[ArticleGenerator] No destinations found, skipping article generation");
      return;
    }

    // Generate 1-2 articles per day
    const numArticles = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < numArticles; i++) {
      // Select random template and destination
      const template = articleTemplates[Math.floor(Math.random() * articleTemplates.length)];
      const destination = allDestinations[Math.floor(Math.random() * allDestinations.length)];

      // Prepare variables
      const variables: Record<string, string> = {};
      
      if (template.type === "destination_guide") {
        variables.destination = destination!.name;
      } else if (template.type === "seasonal_deals") {
        const seasons = ["jaro", "léto", "podzim", "zimu"];
        variables.season = seasons[Math.floor(Math.random() * seasons.length)]!;
      } else if (template.type === "airline_review") {
        const airlines = ["Ryanair", "Wizz Air", "Czech Airlines", "Lufthansa", "Austrian Airlines"];
        variables.airline = airlines[Math.floor(Math.random() * airlines.length)]!;
      }

      console.log(`[ArticleGenerator] Generating article: ${template.type} with variables:`, variables);

      // Generate article
      const article = await generateArticle(template, variables);

      // Create slug from title
      const slug = article.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Check if article with this slug already exists
      const existing = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
      
      if (existing.length > 0) {
        console.log(`[ArticleGenerator] Article with slug "${slug}" already exists, skipping`);
        continue;
      }

      // Insert article into database
      await db.insert(articles).values({
        title: article.title,
        slug,
        content: article.content,
        excerpt: article.excerpt,
        metaDescription: article.excerpt.substring(0, 160),
        keywords: article.keywords,
        featuredImage: destination?.featuredImage || "/hero-bg.webp",
        author: "Akční Letenky",
        category: template.type.replace("_", "-"),
        status: "published",
        publishedAt: new Date(),
      });

      console.log(`[ArticleGenerator] Successfully generated and published article: ${article.title}`);
    }
  } catch (error) {
    console.error("[ArticleGenerator] Error generating articles:", error);
  }
}

/**
 * Schedule daily article generation (call this from a cron job or scheduler)
 */
export function scheduleDailyArticleGeneration() {
  // Run at 6:00 AM every day
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(6, 0, 0, 0);

  // If 6 AM has passed today, schedule for tomorrow
  if (now > scheduledTime) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const timeUntilRun = scheduledTime.getTime() - now.getTime();

  setTimeout(async () => {
    console.log("[ArticleGenerator] Running daily article generation...");
    await generateDailyArticles();
    
    // Schedule next run (24 hours later)
    setInterval(async () => {
      console.log("[ArticleGenerator] Running daily article generation...");
      await generateDailyArticles();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }, timeUntilRun);

  console.log(`[ArticleGenerator] Scheduled daily generation at 6:00 AM (in ${Math.round(timeUntilRun / 1000 / 60)} minutes)`);
}
