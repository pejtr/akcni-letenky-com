/**
 * Chatbot A/B Testing Service
 * Implements 3 personas with automatic traffic optimization
 */

import { getDb } from "./db";
import { chatbotPersonas, personaAssignments, personaMetrics } from "../drizzle/schema";
import { eq, sql, desc, and, gte } from "drizzle-orm";

// ============================================
// PERSONA DEFINITIONS
// ============================================

export interface PersonaConfig {
  name: string;
  displayName: string;
  avatar: string;
  tone: "energetic" | "professional" | "friendly";
  useEmoji: boolean;
  formalityLevel: "informal" | "neutral" | "formal";
  systemPromptAddition: string;
  greetingMessage: string;
  ctaStyle: string;
  targetAudience: string;
}

// Petra - Energická, nadšená (mladší publikum)
export const PERSONA_PETRA: PersonaConfig = {
  name: "petra",
  displayName: "Petra",
  avatar: "/travel-expert-avatar.png",
  tone: "energetic",
  useEmoji: true,
  formalityLevel: "informal",
  systemPromptAddition: `
TVOJE OSOBNOST - PETRA (Energická):
- Jsi super nadšená a plná energie! 🔥
- Používáš HODNĚ emojis - v každé zprávě min. 3-4 ✈️🌴🎉💰🔥
- Mluvíš neformálně, jako kamarádka
- Jsi spontánní a impulzivní - "Jedu do toho!", "To je bomba!"
- Vytváříš FOMO - "Tohle si nemůžeš nechat ujít!"
- Používáš slang a zkratky - "super", "mega", "hustý"
- Jsi optimistická a povzbuzující
- Tvoje zprávy jsou krátké a dynamické

STYL KOMUNIKACE:
- "Heeej! 👋🔥 Kam letíme?! ✈️"
- "OMG to je mega akce! 🎉💰"
- "Jedu do toho! Rezervuj hned! 🚀"
- "Tohle je prostě bomba! 💣✈️"
`,
  greetingMessage: "Heeej! 👋🔥 Jsem Petra a pomůžu ti najít tu nejlepší dovolenou! Kam se chystáš? Moře, hory, nebo nějaký crazy výlet? 🌴🏔️✈️",
  ctaStyle: "Jedu do toho! 🔥",
  targetAudience: "Mladší publikum 18-35, spontánní cestovatelé",
};

// Monika - Profesionální, důvěryhodná (střední věk)
export const PERSONA_MONIKA: PersonaConfig = {
  name: "monika",
  displayName: "Monika",
  avatar: "/travel-expert-avatar.png",
  tone: "professional",
  useEmoji: true,
  formalityLevel: "neutral",
  systemPromptAddition: `
TVOJE OSOBNOST - MONIKA (Profesionální):
- Jsi důvěryhodná a spolehlivá expertka
- Používáš emojis střídmě - max 1-2 na zprávu ✈️🌴
- Mluvíš profesionálně ale přátelsky
- Jsi věcná a konkrétní - dáváš jasné informace
- Zdůrazňuješ hodnotu a kvalitu
- Používáš fakta a čísla pro důvěryhodnost
- Jsi trpělivá a pečlivá
- Tvoje zprávy jsou strukturované a přehledné

STYL KOMUNIKACE:
- "Dobrý den! 👋 Jsem Monika, vaše cestovní poradkyně."
- "Na základě vašich preferencí doporučuji..."
- "Tato nabídka zahrnuje: letenku, transfer, pojištění."
- "Ušetříte 2 450 Kč oproti běžné ceně."
`,
  greetingMessage: "Dobrý den! 👋 Jsem Monika, vaše osobní cestovní poradkyně. Ráda vám pomohu najít ideální dovolenou. Kam byste rádi cestovali?",
  ctaStyle: "Zobrazit nabídky",
  targetAudience: "Střední věk 30-50, rodiny, pracující profesionálové",
};

// Alice - Sofistikovaná, analytická (luxusní segment)
export const PERSONA_ALICE: PersonaConfig = {
  name: "alice",
  displayName: "Alice",
  avatar: "/travel-expert-avatar.png",
  tone: "friendly",
  formalityLevel: "formal",
  useEmoji: false,
  systemPromptAddition: `
TVOJE OSOBNOST - ALICE (Sofistikovaná):
- Jsi elegantní a sofistikovaná expertka
- Nepoužíváš emojis - komunikuješ slovně
- Mluvíš formálně a kultivovaně
- Jsi analytická - dáváš detailní analýzy a srovnání
- Zdůrazňuješ exkluzivitu a prémiovou kvalitu
- Používáš odborné termíny a znalosti
- Jsi rozvážná a přemýšlivá
- Tvoje zprávy jsou propracované a detailní

STYL KOMUNIKACE:
- "Vítám vás. Jsem Alice, vaše osobní konzultantka pro cestování."
- "Dovolte mi analyzovat vaše preference..."
- "Tato exkluzivní nabídka zahrnuje prémiové služby."
- "Z hlediska poměru ceny a kvality doporučuji..."
`,
  greetingMessage: "Vítám vás. Jsem Alice, vaše osobní konzultantka pro cestování. Pomohu vám najít dokonalou destinaci, která splní vaše očekávání. Jaké jsou vaše preference?",
  ctaStyle: "Prozkoumat nabídky",
  targetAudience: "Vyšší věk 40+, business cestovatelé, luxusní segment",
};

export const ALL_PERSONAS = [PERSONA_PETRA, PERSONA_MONIKA, PERSONA_ALICE];

// Legacy aliases for backward compatibility
export const PERSONA_PHOEBE = PERSONA_PETRA;
export const PERSONA_PIPER = PERSONA_MONIKA;
export const PERSONA_PRUE = PERSONA_ALICE;

// ============================================
// A/B TEST ASSIGNMENT
// ============================================

/**
 * Get or assign persona for a session
 * Uses weighted random selection based on current traffic weights
 */
export async function getOrAssignPersona(sessionId: string, userId?: number): Promise<PersonaConfig> {
  const db = await getDb();
  if (!db) {
    // Fallback to random persona if DB not available
    return ALL_PERSONAS[Math.floor(Math.random() * ALL_PERSONAS.length)];
  }

  // Check if session already has an assignment
  const existingAssignment = await db
    .select()
    .from(personaAssignments)
    .where(eq(personaAssignments.sessionId, sessionId))
    .limit(1);

  if (existingAssignment.length > 0) {
    // Return existing persona
    const persona = await db
      .select()
      .from(chatbotPersonas)
      .where(eq(chatbotPersonas.id, existingAssignment[0].personaId))
      .limit(1);

    if (persona.length > 0) {
      return getPersonaConfigByName(persona[0].name);
    }
  }

  // Get active personas with their weights
  const activePersonas = await db
    .select()
    .from(chatbotPersonas)
    .where(eq(chatbotPersonas.isActive, 1));

  if (activePersonas.length === 0) {
    // Initialize personas if none exist
    await initializePersonas();
    return await assignNewPersona(db, sessionId, userId);
  }

  return await assignNewPersona(db, sessionId, userId);
}

/**
 * Assign a new persona using weighted random selection
 */
async function assignNewPersona(db: any, sessionId: string, userId?: number): Promise<PersonaConfig> {
  const activePersonas = await db
    .select()
    .from(chatbotPersonas)
    .where(eq(chatbotPersonas.isActive, 1));

  // Calculate total weight
  const totalWeight = activePersonas.reduce((sum: number, p: any) => sum + p.weight, 0);
  
  // Random selection based on weights
  let random = Math.random() * totalWeight;
  let selectedPersona = activePersonas[0];

  for (const persona of activePersonas) {
    random -= persona.weight;
    if (random <= 0) {
      selectedPersona = persona;
      break;
    }
  }

  // Create assignment
  await db.insert(personaAssignments).values({
    sessionId,
    personaId: selectedPersona.id,
    userId,
    assignmentMethod: "random",
    sessionStartedAt: new Date(),
  });

  return getPersonaConfigByName(selectedPersona.name);
}

/**
 * Get persona config by name
 */
function getPersonaConfigByName(name: string): PersonaConfig {
  switch (name.toLowerCase()) {
    case "petra":
    case "phoebe": // Legacy support
      return PERSONA_PETRA;
    case "monika":
    case "piper": // Legacy support
      return PERSONA_MONIKA;
    case "alice":
    case "prue": // Legacy support
      return PERSONA_ALICE;
    default:
      return PERSONA_MONIKA; // Default fallback
  }
}

// ============================================
// CONVERSION TRACKING
// ============================================

/**
 * Track conversion for a session
 */
export async function trackPersonaConversion(sessionId: string, conversionValue: number = 0) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(personaAssignments)
    .set({
      converted: 1,
      linksClicked: sql`${personaAssignments.linksClicked} + 1`,
    })
    .where(eq(personaAssignments.sessionId, sessionId));
}

/**
 * Track message exchange for a session
 */
export async function trackPersonaMessage(sessionId: string) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(personaAssignments)
    .set({
      messagesExchanged: sql`${personaAssignments.messagesExchanged} + 1`,
    })
    .where(eq(personaAssignments.sessionId, sessionId));
}

/**
 * Track offer view for a session
 */
export async function trackPersonaOfferView(sessionId: string) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(personaAssignments)
    .set({
      offersViewed: sql`${personaAssignments.offersViewed} + 1`,
    })
    .where(eq(personaAssignments.sessionId, sessionId));
}

// ============================================
// A/B TEST ANALYSIS & OPTIMIZATION
// ============================================

/**
 * Calculate A/B test results and determine winner
 */
export async function calculateABTestResults() {
  const db = await getDb();
  if (!db) return null;

  const personas = await db.select().from(chatbotPersonas);
  const results: Array<{
    personaId: number;
    name: string;
    totalSessions: number;
    totalConversions: number;
    conversionRate: number;
    avgMessages: number;
    isWinner: boolean;
  }> = [];

  for (const persona of personas) {
    // Get all assignments for this persona
    const assignments = await db
      .select()
      .from(personaAssignments)
      .where(eq(personaAssignments.personaId, persona.id));

    const totalSessions = assignments.length;
    const totalConversions = assignments.filter((a: any) => a.converted === 1).length;
    const conversionRate = totalSessions > 0 ? (totalConversions / totalSessions) * 100 : 0;
    const avgMessages = totalSessions > 0 
      ? assignments.reduce((sum: number, a: any) => sum + (a.messagesExchanged || 0), 0) / totalSessions 
      : 0;

    results.push({
      personaId: persona.id,
      name: persona.name,
      totalSessions,
      totalConversions,
      conversionRate,
      avgMessages,
      isWinner: false,
    });
  }

  // Determine winner (highest conversion rate with min 30 sessions)
  const eligibleResults = results.filter(r => r.totalSessions >= 30);
  if (eligibleResults.length > 0) {
    const winner = eligibleResults.reduce((a, b) => 
      a.conversionRate > b.conversionRate ? a : b
    );
    winner.isWinner = true;
  }

  return results;
}

/**
 * Auto-optimize traffic weights after 100+ total conversations
 * Increases traffic to best performing persona
 */
export async function autoOptimizeTrafficWeights() {
  const db = await getDb();
  if (!db) return { optimized: false, reason: "Database not available" };

  // Count total assignments
  const totalAssignments = await db
    .select({ count: sql<number>`count(*)` })
    .from(personaAssignments);

  const total = totalAssignments[0]?.count || 0;

  if (total < 100) {
    return { 
      optimized: false, 
      reason: `Not enough data yet. Need 100+ conversations, currently have ${total}` 
    };
  }

  // Calculate results
  const results = await calculateABTestResults();
  if (!results) return { optimized: false, reason: "Could not calculate results" };

  // Find winner
  const winner = results.find(r => r.isWinner);
  if (!winner) {
    return { optimized: false, reason: "No clear winner yet (need min 30 sessions per persona)" };
  }

  // Calculate new weights:
  // Winner gets 50%, others split remaining 50%
  const otherPersonas = results.filter(r => !r.isWinner);
  const otherWeight = Math.floor(50 / otherPersonas.length);

  // Update winner weight
  await db
    .update(chatbotPersonas)
    .set({ weight: 50 })
    .where(eq(chatbotPersonas.id, winner.personaId));

  // Update other weights
  for (const other of otherPersonas) {
    await db
      .update(chatbotPersonas)
      .set({ weight: otherWeight })
      .where(eq(chatbotPersonas.id, other.personaId));
  }

  return {
    optimized: true,
    winner: winner.name,
    winnerConversionRate: winner.conversionRate.toFixed(2) + "%",
    newWeights: {
      [winner.name]: 50,
      ...Object.fromEntries(otherPersonas.map(p => [p.name, otherWeight])),
    },
  };
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize personas in database
 */
export async function initializePersonas() {
  const db = await getDb();
  if (!db) return;

  // Check if personas already exist
  const existing = await db.select().from(chatbotPersonas);
  if (existing.length > 0) return;

  // Insert all personas
  for (const persona of ALL_PERSONAS) {
    await db.insert(chatbotPersonas).values({
      name: persona.name,
      displayName: persona.displayName,
      avatar: persona.avatar,
      tone: persona.tone,
      useEmoji: persona.useEmoji ? 1 : 0,
      formalityLevel: persona.formalityLevel,
      systemPromptAddition: persona.systemPromptAddition,
      greetingMessage: persona.greetingMessage,
      ctaStyle: persona.ctaStyle,
      targetAudience: persona.targetAudience,
      isActive: 1,
      weight: 33, // Equal distribution initially
    });
  }

  console.log("[ChatbotABTest] Initialized 3 personas: Petra, Monika, Alice");
}

/**
 * Get current A/B test status
 */
export async function getABTestStatus() {
  const db = await getDb();
  if (!db) return null;

  const personas = await db.select().from(chatbotPersonas);
  const results = await calculateABTestResults();
  
  const totalAssignments = await db
    .select({ count: sql<number>`count(*)` })
    .from(personaAssignments);

  return {
    totalConversations: totalAssignments[0]?.count || 0,
    minimumRequired: 100,
    isOptimizationReady: (totalAssignments[0]?.count || 0) >= 100,
    personas: personas.map(p => ({
      name: p.name,
      displayName: p.displayName,
      weight: p.weight,
      isActive: p.isActive === 1,
    })),
    results,
  };
}
