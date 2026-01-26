/**
 * Chatbot Backend - High-Converting Sales System
 * Based on Alex Hormozi principles: Value First, Scarcity, Urgency, Social Proof
 */

import { getDb } from "./db";
import { chatbotConversations, chatbotMessages, chatbotLeads, chatbotConversions, flights, destinations } from "../drizzle/schema";
import { invokeLLM } from "./_core/llm";
import { eq, and, gte, desc } from "drizzle-orm";

// System prompt with Hormozi sales principles
const CHATBOT_SYSTEM_PROMPT = `Jsi expertní cestovní poradce pro Akční-Letenky.com s výjimečnými prodejními schopnostmi.

TVOJE OSOBNOST:
- Přátelský, nadšený a nápomocný
- Používáš emojis pro teplejší komunikaci (✈️🌴🎉💰)
- Mluvíš česky, neformálně ale profesionálně
- Zaměřuješ se na hodnotu pro zákazníka, ne na prodej

HORMOZI PRODEJNÍ PRINCIPY:
1. **Value First** - Nejdřív dej hodnotu, pak nabídni
   - Ptej se na sny a přání zákazníka
   - Dej tipy na destinace, nejlepší období, co vidět
   - Teprve pak nabídni konkrétní letenky

2. **Scarcity & Urgency** - Vytvoř pocit nedostatku
   - "Zbývá jen X míst na tento let!"
   - "Tato cena platí jen do konce týdne"
   - "Právě teď si to prohlíží dalších X lidí"

3. **Social Proof** - Ukaž, že jiní už kupují
   - "Dnes už 12 lidí zakoupilo letenky do Barcelony"
   - "Naše FB skupina má 33 500 členů, kteří sdílí tipy"
   - "Jana z Prahy právě koupila letenku do Thajska za 12 390 Kč"

4. **Offer Stack** - Nabídni víc než jen letenku
   - Letenka + Hotel bundle (ušetří 20%)
   - Cestovní pojištění (klid na cestách)
   - Priority boarding (bez fronty)
   - Přístup do VIP FB skupiny s exkluzivními tipy

5. **Objection Handling** - Řeš námitky proaktivně
   - "Je to drahé" → Ukaž cenu za den, porovnej s kávou
   - "Nemám čas teď" → Rezervuj teď, plať později
   - "Nevím, kam jet" → Nabídni 3 destinace podle rozpočtu

6. **Community Building** - Buduj komunitu, ne jen prodej
   - Pozvi do FB skupiny: "AKČNÍ LETENKY & CESTOVÁNÍ ✈️🌎" (33 500 členů)
   - Pozvi do WhatsApp skupiny pro exkluzivní flash dealy
   - Sbírej email pro newsletter s nejlepšími nabídkami

KONVERZAČNÍ FLOW:
1. **Úvod** - Přivítej, ptej se na sny
   "Ahoj! 👋 Kam se chystáš? Moře, hory, nebo městská dobrodružství? 🌴🏔️🏙️"

2. **Kvalifikace** - Zjisti rozpočet, datum, počet lidí
   "Skvělá volba! Kolik lidí cestuje? A máš představu o rozpočtu?"

3. **Value Delivery** - Dej tipy PŘED nabídkou
   "Barcelona je úžasná v dubnu! Sagrada Familia, tapas, pláže... Chceš tipy na nejlepší čtvrti?"

4. **Offer** - Nabídni konkrétní letenky s urgencí
   "Mám pro tebe bombu! ✈️ Praha → Barcelona za 946 Kč (zpáteční)
   ⚠️ Zbývá jen 3 místa na tento let!
   🔥 12 lidí si to právě prohlíží
   💰 Ušetříš 40% oproti běžné ceně"

5. **Upsell** - Nabídni bundle
   "Chceš k tomu hotel? Mám balíček Letenka+Hotel se slevou 20%"

6. **Community** - Pozvi do komunity
   "Btw, jsme FB skupina 33 500 cestovatelů! Sdílíme tajné tipy a flash dealy. Chceš pozvánku? 🎉"

7. **Close** - Usnadni rozhodnutí
   "Klikni na tlačítko a rezervuj si místo. Platit můžeš až později! 👇"

DŮLEŽITÉ:
- VŽDY ptej se na sny a přání PŘED nabídkou
- VŽDY používej urgenci a scarcity
- VŽDY nabídni víc než jen letenku (bundle)
- VŽDY pozvi do FB/WhatsApp komunity
- NIKDY netlač, buď nápomocný
- Používej krátké zprávy (max 3-4 věty)
- Používej emojis pro teplejší komunikaci`;

export interface ChatbotContext {
  sessionId: string;
  userId?: number;
  projectId: string;
}

export interface ChatbotMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Initialize new chatbot conversation
 */
export async function initChatbotConversation(ctx: ChatbotContext) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [conversation] = await db.insert(chatbotConversations).values({
    sessionId: ctx.sessionId,
    userId: ctx.userId,
    projectId: ctx.projectId,
    status: "active",
    leadQuality: "cold",
  });

  // Send welcome message
  const welcomeMessage = "Ahoj! 👋 Jsem tvoje průvodkyně světem zájezdů. Kam se chystáš? Moře, hory, nebo městská dobrodružství? 🌴🏔️🏙️";
  
  await db.insert(chatbotMessages).values({
    conversationId: conversation.insertId,
    role: "assistant",
    content: welcomeMessage,
  });

  return {
    conversationId: conversation.insertId,
    message: welcomeMessage,
  };
}

/**
 * Process user message and generate AI response with Hormozi principles
 */
export async function processChatbotMessage(
  sessionId: string,
  userMessage: string,
  projectId: string = "akcni-letenky"
) {
  // Get or create conversation
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let conversation = (await db.select().from(chatbotConversations).where(eq(chatbotConversations.sessionId, sessionId)).limit(1))[0];

  if (!conversation) {
    const result = await initChatbotConversation({ sessionId, projectId });
    conversation = (await db.select().from(chatbotConversations).where(eq(chatbotConversations.sessionId, sessionId)).limit(1))[0];
  }

  if (!conversation) {
    throw new Error("Failed to create conversation");
  }

  // Save user message
  await db.insert(chatbotMessages).values({
    conversationId: conversation.id,
    role: "user",
    content: userMessage,
  });

  // Update message count
  await db
    .update(chatbotConversations)
    .set({
      messageCount: (conversation.messageCount || 0) + 1,
      lastMessageAt: new Date(),
    })
    .where(eq(chatbotConversations.id, conversation.id));

  // Get conversation history
  const messages = await db.select().from(chatbotMessages).where(eq(chatbotMessages.conversationId, conversation.id)).orderBy(chatbotMessages.createdAt);

  // Get relevant flight offers for context
  const relevantFlights = await getRelevantFlights(userMessage);
  
  // Get popular destinations for suggestions
  const popularDestinations = await db.select().from(destinations).orderBy(desc(destinations.popularityScore)).limit(5);

  // Build context for LLM
  const contextInfo = `
AKTUÁLNÍ NABÍDKY:
${relevantFlights.map((f: typeof relevantFlights[0]) => `- ${f.fromCity} → ${f.toCity}: ${f.price} Kč (zbývá ${f.remainingSeats} míst)`).join("\n")}

POPULÁRNÍ DESTINACE:
${popularDestinations.map((d: typeof popularDestinations[0]) => `- ${d.name} (${d.country}): průměrně ${d.averagePrice} Kč`).join("\n")}

FB SKUPINY:
- AKČNÍ LETENKY & CESTOVÁNÍ ✈️🌎: 33 500 členů
- TOUR de SVĚT 🌏 Levné letenky: 29 200 členů
`;

  // Generate AI response
  const llmMessages = [
    { role: "system" as const, content: CHATBOT_SYSTEM_PROMPT + "\n\n" + contextInfo },
    ...messages.map((m: typeof messages[0]) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  const response = await invokeLLM({
    messages: llmMessages,
  });

  const content = response.choices[0].message.content;
  const assistantMessage = typeof content === 'string' ? content : "Omlouvám se, něco se pokazilo. Můžeš to zkusit znovu?";

  // Save assistant response
  const containsOffer = assistantMessage.includes("Kč") || assistantMessage.includes("letenka");
  const containsCommunityInvite = assistantMessage.toLowerCase().includes("skupina") || assistantMessage.toLowerCase().includes("komunita");

  await db.insert(chatbotMessages).values({
    conversationId: conversation.id,
    role: "assistant",
    content: assistantMessage,
    containsOffer: containsOffer ? 1 : 0,
    containsCommunityInvite: containsCommunityInvite ? 1 : 0,
  });

  // Extract lead information from conversation
  await extractLeadInfo(conversation.id, userMessage, assistantMessage);

  return {
    message: assistantMessage,
    conversationId: conversation.id,
  };
}

/**
 * Get relevant flight offers based on user message
 */
async function getRelevantFlights(userMessage: string) {
  // Simple keyword matching for now
  const keywords = userMessage.toLowerCase();
  
  const db = await getDb();
  if (!db) return [];
  
  const allFlights = await db.select().from(flights).orderBy(desc(flights.isFeatured), flights.price).limit(10);

  // Filter by destination keywords
  const relevantFlights = allFlights.filter((f: typeof allFlights[0]) => {
    const destination = f.toCity.toLowerCase();
    return keywords.includes(destination) || 
           keywords.includes(f.toCity.toLowerCase()) ||
           keywords.includes("kam");
  });

  return relevantFlights.length > 0 ? relevantFlights.slice(0, 3) : allFlights.slice(0, 3);
}

/**
 * Extract lead information from conversation
 */
async function extractLeadInfo(conversationId: number, userMessage: string, assistantMessage: string) {
  const db = await getDb();
  if (!db) return;
  
  const conversation = (await db.select().from(chatbotConversations).where(eq(chatbotConversations.id, conversationId)).limit(1))[0];

  if (!conversation) return;

  // Extract email from user message
  const emailMatch = userMessage.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    await db
      .update(chatbotConversations)
      .set({ email: emailMatch[0] })
      .where(eq(chatbotConversations.id, conversationId));
  }

  // Extract destination
  const allDestinations = await db.select().from(destinations);
  for (const dest of allDestinations) {
    if (userMessage.toLowerCase().includes(dest.name.toLowerCase())) {
      await db
        .update(chatbotConversations)
        .set({ destination: dest.name })
        .where(eq(chatbotConversations.id, conversationId));
      break;
    }
  }

  // Update lead quality based on engagement
  const messageCount = conversation.messageCount || 0;
  let leadQuality: "hot" | "warm" | "cold" = "cold";
  
  if (messageCount > 5 && conversation.email) {
    leadQuality = "hot";
  } else if (messageCount > 3 || conversation.destination) {
    leadQuality = "warm";
  }

  await db
    .update(chatbotConversations)
    .set({ leadQuality })
    .where(eq(chatbotConversations.id, conversationId));
}

/**
 * Track chatbot conversion (booking completed)
 */
export async function trackChatbotConversion(
  conversationId: number,
  flightId: number,
  bookingValue: number,
  commissionRate: number = 5
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const commissionAmount = Math.floor((bookingValue * commissionRate) / 100);

  await db.insert(chatbotConversions).values({
    conversationId,
    flightId,
    bookingValue,
    commissionRate,
    commissionAmount,
    affiliateSource: "akcni-letenky",
  });

  // Update conversation status
  await db
    .update(chatbotConversations)
    .set({
      status: "converted",
      converted: 1,
      conversionValue: commissionAmount,
    })
    .where(eq(chatbotConversations.id, conversationId));

  return { success: true, commissionAmount };
}

/**
 * Track community join (FB group or WhatsApp)
 */
export async function trackCommunityJoin(
  conversationId: number,
  communityType: "facebook" | "whatsapp"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(chatbotConversations)
    .set({ joinedCommunity: 1 })
    .where(eq(chatbotConversations.id, conversationId));

  return { success: true };
}
