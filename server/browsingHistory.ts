/**
 * Browsing History & Personalization System
 * 
 * Tracks user browsing patterns server-side and generates
 * personalized destination recommendations based on history.
 */

import { getDb } from "./db";
import { browsingHistory } from "../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";

// ============ Track Browsing ============

export async function trackPageView(data: {
  sessionId: string;
  destination: string;
  destinationSlug: string;
  price?: number;
  source?: string;
}) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(browsingHistory).values({
      sessionId: data.sessionId,
      destinationSlug: data.destinationSlug,
      destinationName: data.destination,
      pageType: data.source || "homepage",
    });
  } catch (e) {
    console.error("[BrowsingHistory] Failed to track page view:", e);
  }
}

// ============ Get Browsing History ============

export async function getSessionHistory(sessionId: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(browsingHistory)
      .where(eq(browsingHistory.sessionId, sessionId))
      .orderBy(desc(browsingHistory.viewedAt))
      .limit(limit);
  } catch (e) {
    console.error("[BrowsingHistory] Failed to get session history:", e);
    return [];
  }
}

// ============ Personalized Recommendations ============

interface Recommendation {
  destination: string;
  destinationSlug: string;
  score: number;
  reason: string;
  estimatedPrice: number;
}

// Destination similarity map (related destinations)
const destinationSimilarity: Record<string, string[]> = {
  "london-united-kingdom": ["paris-france", "amsterdam-netherlands", "berlin-germany"],
  "paris-france": ["london-united-kingdom", "rome-italy", "barcelona-spain"],
  "rome-italy": ["paris-france", "barcelona-spain", "venice-italy"],
  "barcelona-spain": ["rome-italy", "lisbon-portugal", "madrid-spain"],
  "amsterdam-netherlands": ["london-united-kingdom", "berlin-germany", "brussels-belgium"],
  "berlin-germany": ["amsterdam-netherlands", "vienna-austria", "prague-czech-republic"],
  "vienna-austria": ["berlin-germany", "budapest-hungary", "prague-czech-republic"],
  "dubai-united-arab-emirates": ["bangkok-thailand", "istanbul-turkey", "doha-qatar"],
  "bangkok-thailand": ["dubai-united-arab-emirates", "hanoi-vietnam", "bali-indonesia"],
  "new-york-city-new-york-united-states": ["miami-united-states", "los-angeles-united-states", "london-united-kingdom"],
  "miami-united-states": ["new-york-city-new-york-united-states", "cancun-mexico", "havana-cuba"],
  "lisbon-portugal": ["barcelona-spain", "madrid-spain", "porto-portugal"],
  "istanbul-turkey": ["dubai-united-arab-emirates", "athens-greece", "rome-italy"],
  "athens-greece": ["istanbul-turkey", "santorini-greece", "rome-italy"],
};

// Destination display names and base prices
const destinationInfo: Record<string, { name: string; price: number }> = {
  "london-united-kingdom": { name: "Londýn", price: 733 },
  "paris-france": { name: "Paříž", price: 1027 },
  "rome-italy": { name: "Řím", price: 860 },
  "barcelona-spain": { name: "Barcelona", price: 746 },
  "amsterdam-netherlands": { name: "Amsterdam", price: 890 },
  "berlin-germany": { name: "Berlín", price: 650 },
  "vienna-austria": { name: "Vídeň", price: 450 },
  "dubai-united-arab-emirates": { name: "Dubaj", price: 4990 },
  "bangkok-thailand": { name: "Bangkok", price: 8990 },
  "new-york-city-new-york-united-states": { name: "New York", price: 6990 },
  "miami-united-states": { name: "Miami", price: 7490 },
  "lisbon-portugal": { name: "Lisabon", price: 980 },
  "istanbul-turkey": { name: "Istanbul", price: 1590 },
  "athens-greece": { name: "Athény", price: 1290 },
  "venice-italy": { name: "Benátky", price: 920 },
  "madrid-spain": { name: "Madrid", price: 850 },
  "budapest-hungary": { name: "Budapešť", price: 380 },
  "hanoi-vietnam": { name: "Hanoj", price: 9990 },
  "bali-indonesia": { name: "Bali", price: 11990 },
  "santorini-greece": { name: "Santorini", price: 2490 },
  "cancun-mexico": { name: "Cancún", price: 12990 },
};

export async function getPersonalizedRecommendations(
  sessionId: string,
  limit = 6
): Promise<Recommendation[]> {
  const history = await getSessionHistory(sessionId, 10);

  if (history.length === 0) {
    // Return popular destinations for new users
    return getDefaultRecommendations(limit);
  }

  const recommendations: Recommendation[] = [];
  const viewedSlugs = new Set(history.map((h) => h.destinationSlug));

  // Score based on browsing patterns
  for (const entry of history) {
    const similar = destinationSimilarity[entry.destinationSlug] || [];

    for (const slug of similar) {
      if (viewedSlugs.has(slug)) continue; // Don't recommend already viewed

      const info = destinationInfo[slug];
      if (!info) continue;

      const existing = recommendations.find((r) => r.destinationSlug === slug);
      if (existing) {
        existing.score += 10; // Boost score for multiple related views
      } else {
        recommendations.push({
          destination: info.name,
          destinationSlug: slug,
          score: 50 + Math.floor(Math.random() * 30),
          reason: `Protože jste se zajímali o ${entry.destinationName}`,
          estimatedPrice: info.price,
        });
      }
    }
  }

  // Sort by score and return top N
  recommendations.sort((a, b) => b.score - a.score);

  // If not enough recommendations, fill with defaults
  if (recommendations.length < limit) {
    const defaults = getDefaultRecommendations(limit - recommendations.length);
    const existingSlugs = new Set(recommendations.map((r) => r.destinationSlug));
    for (const d of defaults) {
      if (!existingSlugs.has(d.destinationSlug) && !viewedSlugs.has(d.destinationSlug)) {
        recommendations.push(d);
      }
    }
  }

  return recommendations.slice(0, limit);
}

function getDefaultRecommendations(limit: number): Recommendation[] {
  const popular = [
    { slug: "barcelona-spain", name: "Barcelona", price: 746, reason: "Nejprodávanější destinace" },
    { slug: "rome-italy", name: "Řím", price: 860, reason: "Oblíbená destinace" },
    { slug: "london-united-kingdom", name: "Londýn", price: 733, reason: "Nejlevnější letenky" },
    { slug: "paris-france", name: "Paříž", price: 1027, reason: "Romantická destinace" },
    { slug: "dubai-united-arab-emirates", name: "Dubaj", price: 4990, reason: "Luxusní dovolená" },
    { slug: "bangkok-thailand", name: "Bangkok", price: 8990, reason: "Exotická destinace" },
    { slug: "lisbon-portugal", name: "Lisabon", price: 980, reason: "Skrytý klenot Evropy" },
    { slug: "berlin-germany", name: "Berlín", price: 650, reason: "Eurovíkend" },
  ];

  return popular.slice(0, limit).map((p) => ({
    destination: p.name,
    destinationSlug: p.slug,
    score: 30 + Math.floor(Math.random() * 20),
    reason: p.reason,
    estimatedPrice: p.price,
  }));
}

// ============ Popular Destinations Analytics ============

export async function getPopularDestinations(limit = 10) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select({
        destination: browsingHistory.destinationName,
        destinationSlug: browsingHistory.destinationSlug,
        viewCount: sql<number>`COUNT(*)`.as("viewCount"),
      })
      .from(browsingHistory)
      .groupBy(browsingHistory.destinationName, browsingHistory.destinationSlug)
      .orderBy(desc(sql`viewCount`))
      .limit(limit);

    return result;
  } catch (e) {
    console.error("[BrowsingHistory] Failed to get popular destinations:", e);
    return [];
  }
}
