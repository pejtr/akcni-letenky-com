/**
 * Chatbot RAG (Retrieval-Augmented Generation) System
 * Provides persistent memory and intelligent content retrieval for better responses
 */

import { getDb } from "./db";
import { 
  chatbotUserMemory, 
  knowledgeBase, 
  flights, 
  destinations, 
  articles,
  chatbotMessages,
  chatbotConversations
} from "../drizzle/schema";
import { eq, desc, like, or, and, gte, sql } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

// ============================================
// USER MEMORY FUNCTIONS
// ============================================

export interface UserMemory {
  preferredDestinations: string[];
  preferredBudget: number | null;
  preferredTravelStyle: string | null;
  preferredAirlines: string[];
  lastDestinationAsked: string | null;
  lastBudgetMentioned: number | null;
  conversationSummary: string | null;
  totalConversations: number;
  totalMessages: number;
}

/**
 * Get or create user memory for a session
 */
export async function getUserMemory(sessionId: string, userId?: number): Promise<UserMemory | null> {
  const db = await getDb();
  if (!db) return null;

  const memory = (await db
    .select()
    .from(chatbotUserMemory)
    .where(eq(chatbotUserMemory.sessionId, sessionId))
    .limit(1))[0];

  if (!memory) {
    return null;
  }

  return {
    preferredDestinations: memory.preferredDestinations ? JSON.parse(memory.preferredDestinations) : [],
    preferredBudget: memory.preferredBudget,
    preferredTravelStyle: memory.preferredTravelStyle,
    preferredAirlines: memory.preferredAirlines ? JSON.parse(memory.preferredAirlines) : [],
    lastDestinationAsked: memory.lastDestinationAsked,
    lastBudgetMentioned: memory.lastBudgetMentioned,
    conversationSummary: memory.conversationSummary,
    totalConversations: memory.totalConversations || 0,
    totalMessages: memory.totalMessages || 0,
  };
}

/**
 * Update user memory with extracted information from conversation
 */
export async function updateUserMemory(
  sessionId: string,
  updates: Partial<{
    preferredDestinations: string[];
    preferredBudget: number;
    preferredTravelStyle: string;
    preferredAirlines: string[];
    lastDestinationAsked: string;
    lastBudgetMentioned: number;
    lastTravelDate: Date;
    lastPassengerCount: number;
    conversationSummary: string;
  }>,
  userId?: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const existingMemory = await getUserMemory(sessionId, userId);

  if (existingMemory) {
    // Merge destinations (keep unique)
    let mergedDestinations = existingMemory.preferredDestinations;
    if (updates.preferredDestinations) {
      mergedDestinations = Array.from(new Set([...mergedDestinations, ...updates.preferredDestinations]));
    }

    // Merge airlines (keep unique)
    let mergedAirlines = existingMemory.preferredAirlines;
    if (updates.preferredAirlines) {
      mergedAirlines = Array.from(new Set([...mergedAirlines, ...updates.preferredAirlines]));
    }

    await db
      .update(chatbotUserMemory)
      .set({
        preferredDestinations: JSON.stringify(mergedDestinations),
        preferredBudget: updates.preferredBudget ?? existingMemory.preferredBudget,
        preferredTravelStyle: updates.preferredTravelStyle ?? existingMemory.preferredTravelStyle,
        preferredAirlines: JSON.stringify(mergedAirlines),
        lastDestinationAsked: updates.lastDestinationAsked ?? existingMemory.lastDestinationAsked,
        lastBudgetMentioned: updates.lastBudgetMentioned ?? existingMemory.lastBudgetMentioned,
        lastTravelDate: updates.lastTravelDate,
        lastPassengerCount: updates.lastPassengerCount,
        conversationSummary: updates.conversationSummary ?? existingMemory.conversationSummary,
        totalMessages: existingMemory.totalMessages + 1,
        lastInteractionAt: new Date(),
      })
      .where(eq(chatbotUserMemory.sessionId, sessionId));
  } else {
    // Create new memory
    await db.insert(chatbotUserMemory).values({
      sessionId,
      userId,
      preferredDestinations: updates.preferredDestinations ? JSON.stringify(updates.preferredDestinations) : "[]",
      preferredBudget: updates.preferredBudget,
      preferredTravelStyle: updates.preferredTravelStyle,
      preferredAirlines: updates.preferredAirlines ? JSON.stringify(updates.preferredAirlines) : "[]",
      lastDestinationAsked: updates.lastDestinationAsked,
      lastBudgetMentioned: updates.lastBudgetMentioned,
      lastTravelDate: updates.lastTravelDate,
      lastPassengerCount: updates.lastPassengerCount,
      conversationSummary: updates.conversationSummary,
      totalConversations: 1,
      totalMessages: 1,
    });
  }
}

/**
 * Extract preferences from user message using LLM
 */
export async function extractPreferencesFromMessage(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<{
  destinations: string[];
  budget: number | null;
  travelStyle: string | null;
  airlines: string[];
  travelDate: string | null;
  passengerCount: number | null;
}> {
  const extractionPrompt = `Analyzuj následující zprávu uživatele a extrahuj cestovní preference.
Odpověz POUZE ve formátu JSON bez dalšího textu.

Zpráva uživatele: "${userMessage}"

Kontext konverzace:
${conversationHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join("\n")}

Vrať JSON ve formátu:
{
  "destinations": ["seznam destinací zmíněných uživatelem"],
  "budget": číslo nebo null (rozpočet v Kč),
  "travelStyle": "budget" | "comfort" | "luxury" | null,
  "airlines": ["seznam preferovaných aerolinek"],
  "travelDate": "datum ve formátu YYYY-MM-DD" nebo null,
  "passengerCount": číslo nebo null
}`;

  try {
    const response = await invokeLLM({
      messages: [{ role: "user", content: extractionPrompt }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "preferences",
          strict: true,
          schema: {
            type: "object",
            properties: {
              destinations: { type: "array", items: { type: "string" } },
              budget: { type: ["number", "null"] },
              travelStyle: { type: ["string", "null"] },
              airlines: { type: "array", items: { type: "string" } },
              travelDate: { type: ["string", "null"] },
              passengerCount: { type: ["number", "null"] },
            },
            required: ["destinations", "budget", "travelStyle", "airlines", "travelDate", "passengerCount"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error extracting preferences:", error);
  }

  return {
    destinations: [],
    budget: null,
    travelStyle: null,
    airlines: [],
    travelDate: null,
    passengerCount: null,
  };
}

// ============================================
// RAG RETRIEVAL FUNCTIONS
// ============================================

export interface RAGContext {
  flights: Array<{
    fromCity: string;
    toCity: string;
    price: number;
    remainingSeats: number;
    airline: string | null;
    departureDate: Date;
  }>;
  destinations: Array<{
    name: string;
    country: string;
    description: string | null;
    averagePrice: number | null;
  }>;
  articles: Array<{
    title: string;
    excerpt: string | null;
    slug: string;
  }>;
  userMemory: UserMemory | null;
}

/**
 * Retrieve relevant content based on user query
 */
export async function retrieveRAGContext(
  userMessage: string,
  sessionId: string,
  userId?: number
): Promise<RAGContext> {
  const db = await getDb();
  if (!db) {
    return { flights: [], destinations: [], articles: [], userMemory: null };
  }

  // Get user memory
  const userMemory = await getUserMemory(sessionId, userId);

  // Extract keywords from message
  const keywords = extractKeywords(userMessage);

  // Search for relevant flights
  const relevantFlights = await searchFlights(keywords, userMemory);

  // Search for relevant destinations
  const relevantDestinations = await searchDestinations(keywords);

  // Search for relevant articles
  const relevantArticles = await searchArticles(keywords);

  return {
    flights: relevantFlights,
    destinations: relevantDestinations,
    articles: relevantArticles,
    userMemory,
  };
}

/**
 * Extract keywords from user message for search
 */
function extractKeywords(message: string): string[] {
  // Common Czech travel-related words to look for
  const travelKeywords = [
    "barcelona", "londýn", "paříž", "řím", "new york", "thajsko", "bali",
    "dubaj", "vietnam", "maroko", "island", "santorini", "miami", "jordánsko",
    "afrika", "srí lanka", "letenky", "dovolená", "hotel", "levné", "akce",
    "sleva", "zpáteční", "jednosměrná", "víkend", "týden", "moře", "hory",
    "pláž", "město", "romantika", "rodina", "děti", "luxus", "budget"
  ];

  const messageLower = message.toLowerCase();
  const foundKeywords: string[] = [];

  for (const keyword of travelKeywords) {
    if (messageLower.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  }

  // Also extract any capitalized words (likely proper nouns/destinations)
  const words = message.split(/\s+/);
  for (const word of words) {
    if (word.length > 2 && word[0] === word[0].toUpperCase()) {
      foundKeywords.push(word.toLowerCase());
    }
  }

  return Array.from(new Set(foundKeywords));
}

/**
 * Search flights based on keywords and user preferences
 */
async function searchFlights(
  keywords: string[],
  userMemory: UserMemory | null
): Promise<RAGContext["flights"]> {
  const db = await getDb();
  if (!db) return [];

  // Get all flights
  let allFlights = await db
    .select()
    .from(flights)
    .orderBy(desc(flights.isFeatured), flights.price)
    .limit(20);

  // Filter by keywords
  if (keywords.length > 0) {
    allFlights = allFlights.filter(f => {
      const searchText = `${f.fromCity} ${f.toCity} ${f.airline || ""}`.toLowerCase();
      return keywords.some(k => searchText.includes(k));
    });
  }

  // If user has budget preference, prioritize within budget
  if (userMemory?.preferredBudget) {
    allFlights.sort((a, b) => {
      const aInBudget = a.price <= userMemory.preferredBudget! ? 0 : 1;
      const bInBudget = b.price <= userMemory.preferredBudget! ? 0 : 1;
      return aInBudget - bInBudget || a.price - b.price;
    });
  }

  // If user has preferred destinations, prioritize them
  if (userMemory?.preferredDestinations.length) {
    allFlights.sort((a, b) => {
      const aPreferred = userMemory.preferredDestinations.some(d => 
        a.toCity.toLowerCase().includes(d.toLowerCase())
      ) ? 0 : 1;
      const bPreferred = userMemory.preferredDestinations.some(d => 
        b.toCity.toLowerCase().includes(d.toLowerCase())
      ) ? 0 : 1;
      return aPreferred - bPreferred;
    });
  }

  return allFlights.slice(0, 5).map(f => ({
    fromCity: f.fromCity,
    toCity: f.toCity,
    price: f.price,
    remainingSeats: f.remainingSeats || 10,
    airline: f.airline,
    departureDate: f.departureDate,
  }));
}

/**
 * Search destinations based on keywords
 */
async function searchDestinations(keywords: string[]): Promise<RAGContext["destinations"]> {
  const db = await getDb();
  if (!db) return [];

  let allDestinations = await db
    .select()
    .from(destinations)
    .orderBy(desc(destinations.popularityScore))
    .limit(20);

  // Filter by keywords
  if (keywords.length > 0) {
    allDestinations = allDestinations.filter(d => {
      const searchText = `${d.name} ${d.country} ${d.region || ""}`.toLowerCase();
      return keywords.some(k => searchText.includes(k));
    });
  }

  return allDestinations.slice(0, 5).map(d => ({
    name: d.name,
    country: d.country,
    description: d.description,
    averagePrice: d.averagePrice,
  }));
}

/**
 * Search articles based on keywords
 */
async function searchArticles(keywords: string[]): Promise<RAGContext["articles"]> {
  const db = await getDb();
  if (!db) return [];

  let allArticles = await db
    .select()
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.viewCount))
    .limit(20);

  // Filter by keywords
  if (keywords.length > 0) {
    allArticles = allArticles.filter(a => {
      const searchText = `${a.title} ${a.excerpt || ""} ${a.keywords || ""}`.toLowerCase();
      return keywords.some(k => searchText.includes(k));
    });
  }

  return allArticles.slice(0, 3).map(a => ({
    title: a.title,
    excerpt: a.excerpt,
    slug: a.slug,
  }));
}

// ============================================
// KNOWLEDGE BASE FUNCTIONS
// ============================================

/**
 * Index content into knowledge base for RAG
 */
export async function indexContent(
  contentType: "flight" | "destination" | "article" | "faq" | "airline",
  contentId: number,
  title: string,
  content: string,
  keywords: string[],
  metadata: Record<string, unknown>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Create search vector (simple keyword extraction)
  const searchVector = `${title} ${content} ${keywords.join(" ")}`.toLowerCase();

  await db.insert(knowledgeBase).values({
    contentType,
    contentId,
    title,
    content,
    keywords: keywords.join(","),
    metadata: JSON.stringify(metadata),
    searchVector,
    relevanceScore: 0,
  });
}

/**
 * Search knowledge base for relevant content
 */
export async function searchKnowledgeBase(
  query: string,
  contentTypes?: Array<"flight" | "destination" | "article" | "faq" | "airline">,
  limit: number = 5
): Promise<Array<{
  contentType: string;
  contentId: number | null;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
}>> {
  const db = await getDb();
  if (!db) return [];

  const keywords = extractKeywords(query);
  
  let results = await db
    .select()
    .from(knowledgeBase)
    .limit(50);

  // Filter by content type if specified
  if (contentTypes && contentTypes.length > 0) {
    results = results.filter(r => contentTypes.includes(r.contentType as any));
  }

  // Score and sort by relevance
  const scoredResults = results.map(r => {
    let score = 0;
    const searchText = (r.searchVector || "").toLowerCase();
    
    for (const keyword of keywords) {
      if (searchText.includes(keyword)) {
        score += 10;
      }
    }
    
    // Boost by base relevance score
    score += r.relevanceScore || 0;
    
    return { ...r, score };
  });

  scoredResults.sort((a, b) => b.score - a.score);

  return scoredResults.slice(0, limit).map(r => ({
    contentType: r.contentType,
    contentId: r.contentId,
    title: r.title,
    content: r.content,
    metadata: r.metadata ? JSON.parse(r.metadata) : {},
  }));
}

/**
 * Generate conversation summary for memory
 */
export async function generateConversationSummary(
  conversationId: number
): Promise<string> {
  const db = await getDb();
  if (!db) return "";

  const messages = await db
    .select()
    .from(chatbotMessages)
    .where(eq(chatbotMessages.conversationId, conversationId))
    .orderBy(chatbotMessages.createdAt);

  if (messages.length < 3) {
    return "";
  }

  const conversationText = messages
    .map(m => `${m.role}: ${m.content}`)
    .join("\n");

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Vytvoř stručné shrnutí konverzace (max 100 slov). Zaměř se na: destinace, rozpočet, preference, stav rozhodování.",
        },
        {
          role: "user",
          content: conversationText,
        },
      ],
    });

    const content = response.choices[0].message.content;
    return typeof content === "string" ? content : "";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "";
  }
}

/**
 * Build enhanced context for LLM with RAG and memory
 */
export function buildEnhancedContext(ragContext: RAGContext): string {
  let context = "";

  // Add user memory context
  if (ragContext.userMemory) {
    const mem = ragContext.userMemory;
    context += "📝 PAMĚŤ UŽIVATELE:\n";
    
    if (mem.preferredDestinations.length > 0) {
      context += `- Oblíbené destinace: ${mem.preferredDestinations.join(", ")}\n`;
    }
    if (mem.preferredBudget) {
      context += `- Obvyklý rozpočet: ${mem.preferredBudget} Kč\n`;
    }
    if (mem.preferredTravelStyle) {
      context += `- Styl cestování: ${mem.preferredTravelStyle}\n`;
    }
    if (mem.lastDestinationAsked) {
      context += `- Naposledy se ptal na: ${mem.lastDestinationAsked}\n`;
    }
    if (mem.conversationSummary) {
      context += `- Shrnutí minulých konverzací: ${mem.conversationSummary}\n`;
    }
    if (mem.totalConversations > 1) {
      context += `- Počet předchozích konverzací: ${mem.totalConversations}\n`;
    }
    context += "\n";
  }

  // Add relevant flights
  if (ragContext.flights.length > 0) {
    context += "✈️ RELEVANTNÍ LETENKY:\n";
    for (const f of ragContext.flights) {
      context += `- ${f.fromCity} → ${f.toCity}: ${f.price} Kč`;
      if (f.remainingSeats < 5) {
        context += ` (⚠️ zbývá jen ${f.remainingSeats} míst!)`;
      }
      if (f.airline) {
        context += ` [${f.airline}]`;
      }
      context += "\n";
    }
    context += "\n";
  }

  // Add relevant destinations
  if (ragContext.destinations.length > 0) {
    context += "🌍 RELEVANTNÍ DESTINACE:\n";
    for (const d of ragContext.destinations) {
      context += `- ${d.name} (${d.country})`;
      if (d.averagePrice) {
        context += `: průměrně ${d.averagePrice} Kč`;
      }
      context += "\n";
    }
    context += "\n";
  }

  // Add relevant articles
  if (ragContext.articles.length > 0) {
    context += "📰 SOUVISEJÍCÍ ČLÁNKY:\n";
    for (const a of ragContext.articles) {
      context += `- "${a.title}" (/blog/${a.slug})\n`;
    }
    context += "\n";
  }

  // Add community info
  context += "👥 KOMUNITA:\n";
  context += "- FB: AKČNÍ LETENKY & CESTOVÁNÍ ✈️🌎 (33 500 členů)\n";
  context += "- FB: TOUR de SVĚT 🌏 Levné letenky (29 200 členů)\n";

  return context;
}
