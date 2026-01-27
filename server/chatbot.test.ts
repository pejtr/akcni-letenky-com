/**
 * Chatbot Tests - High-Converting Sales System
 */

import { describe, it, expect, beforeAll } from "vitest";
import { processChatbotMessage, trackChatbotConversion, trackCommunityJoin } from "./chatbot";
import { getDb } from "./db";
import { chatbotConversations, chatbotMessages, chatbotLeads } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Chatbot System Tests", () => {
  beforeAll(async () => {
    // Ensure database is available
    const db = await getDb();
    expect(db).toBeDefined();
  });

  it("should create a new conversation and process first message", async () => {
    const result = await processChatbotMessage({
      sessionId: `test-session-${Date.now()}`,
      message: "Ahoj, hledám levné letenky do Barcelony",
      userInfo: {
        name: "Test User",
        email: "test@example.com",
      },
    });

    expect(result).toBeDefined();
    expect(result.reply).toBeDefined();
    expect(result.reply.length).toBeGreaterThan(0);
    expect(result.conversationId).toBeDefined();
    
    // Verify conversation was created in database
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const [conversation] = await db
      .select()
      .from(chatbotConversations)
      .where(eq(chatbotConversations.id, result.conversationId))
      .limit(1);
    
    expect(conversation).toBeDefined();
    expect(conversation.sessionId).toContain("test-session-");
    expect(conversation.status).toBe("active");
  });

  it("should continue existing conversation with context", async () => {
    const sessionId = `test-session-${Date.now()}`;
    
    // First message
    const firstResult = await processChatbotMessage({
      sessionId,
      message: "Hledám letenky do Paříže",
      userInfo: {
        name: "Test User 2",
        email: "test2@example.com",
      },
    });

    expect(firstResult.conversationId).toBeDefined();

    // Second message in same conversation
    const secondResult = await processChatbotMessage({
      sessionId,
      message: "Jaká je cena?",
      conversationId: firstResult.conversationId,
    });

    expect(secondResult.conversationId).toBe(firstResult.conversationId);
    expect(secondResult.reply).toBeDefined();
    
    // Verify message count increased
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const [conversation] = await db
      .select()
      .from(chatbotConversations)
      .where(eq(chatbotConversations.id, firstResult.conversationId))
      .limit(1);
    
    expect(conversation.messageCount).toBeGreaterThanOrEqual(2);
  });

  it("should track chatbot conversion correctly", async () => {
    const sessionId = `test-session-${Date.now()}`;
    
    // Create conversation first
    const chatResult = await processChatbotMessage({
      sessionId,
      message: "Chci koupit letenku do Londýna",
      userInfo: {
        name: "Conversion Test",
        email: "conversion@example.com",
      },
    });

    // Track conversion
    const conversionResult = await trackChatbotConversion({
      conversationId: chatResult.conversationId,
      destination: "Londýn",
      flightPrice: 1500,
      commission: 150,
    });

    expect(conversionResult.success).toBe(true);
    
    // Verify conversion in database
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const [conversation] = await db
      .select()
      .from(chatbotConversations)
      .where(eq(chatbotConversations.id, chatResult.conversationId))
      .limit(1);
    
    expect(conversation.converted).toBe(1);
    expect(conversation.conversionValue).toBe(150);
    expect(conversation.status).toBe("converted");
  });

  it("should track community joins (Facebook and WhatsApp)", async () => {
    const sessionId = `test-session-${Date.now()}`;
    
    // Create conversation
    const chatResult = await processChatbotMessage({
      sessionId,
      message: "Zajímá mě FB skupina",
      userInfo: {
        name: "Community Test",
        email: "community@example.com",
      },
    });

    // Track Facebook join
    const fbResult = await trackCommunityJoin(
      chatResult.conversationId,
      "facebook"
    );

    expect(fbResult.success).toBe(true);
    
    // Track WhatsApp join
    const waResult = await trackCommunityJoin(
      chatResult.conversationId,
      "whatsapp"
    );

    expect(waResult.success).toBe(true);
    
    // Verify in database
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const [conversation] = await db
      .select()
      .from(chatbotConversations)
      .where(eq(chatbotConversations.id, chatResult.conversationId))
      .limit(1);
    
    expect(conversation.joinedFacebook).toBe(1);
    expect(conversation.joinedWhatsapp).toBe(1);
  });

  it("should create lead with quality scoring", async () => {
    const sessionId = `test-session-${Date.now()}`;
    
    const result = await processChatbotMessage({
      sessionId,
      message: "Potřebuji letenku do New Yorku co nejdřív, rozpočet až 30 000 Kč",
      userInfo: {
        name: "Hot Lead Test",
        email: "hotlead@example.com",
        phone: "+420123456789",
      },
    });

    expect(result.conversationId).toBeDefined();
    
    // Verify lead was created
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const [lead] = await db
      .select()
      .from(chatbotLeads)
      .where(eq(chatbotLeads.conversationId, result.conversationId))
      .limit(1);
    
    expect(lead).toBeDefined();
    expect(lead.email).toBe("hotlead@example.com");
    expect(lead.leadQuality).toBe("hot"); // High budget + urgency = hot lead
  });
});
