/**
 * Chatbot Tests - High-Converting Sales System
 */

import { describe, it, expect, beforeAll } from "vitest";
import { processChatbotMessage } from "./chatbot";
import { getDb } from "./db";
import { chatbotConversations } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Chatbot System Tests", () => {
  beforeAll(async () => {
    // Ensure database is available
    const db = await getDb();
    expect(db).toBeDefined();
  });

  it("should create a new conversation and process first message", async () => {
    const sessionId = `test-session-${Date.now()}`;
    const result = await processChatbotMessage(
      sessionId,
      "Ahoj, hledám levné letenky do Barcelony",
      "akcni-letenky"
    );

    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.message.length).toBeGreaterThan(0);
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
  }, 15000); // 15 second timeout for LLM call

  it("should continue existing conversation with context", async () => {
    const sessionId = `test-session-${Date.now()}`;
    
    // First message
    const firstResult = await processChatbotMessage(
      sessionId,
      "Hledám letenky do Paříže",
      "akcni-letenky"
    );

    expect(firstResult.conversationId).toBeDefined();

    // Second message in same conversation
    const secondResult = await processChatbotMessage(
      sessionId,
      "Jaká je cena?",
      "akcni-letenky"
    );

    expect(secondResult.conversationId).toBe(firstResult.conversationId);
    expect(secondResult.message).toBeDefined();
    
    // Verify message count increased
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const [conversation] = await db
      .select()
      .from(chatbotConversations)
      .where(eq(chatbotConversations.id, firstResult.conversationId))
      .limit(1);
    
    expect(conversation.messageCount).toBeGreaterThanOrEqual(2);
  }, 20000); // 20 second timeout for 2 LLM calls

  it("should generate AI response using LLM", async () => {
    const sessionId = `test-session-${Date.now()}`;
    
    const result = await processChatbotMessage(
      sessionId,
      "Potřebuji letenku do New Yorku co nejdřív",
      "akcni-letenky"
    );

    expect(result.conversationId).toBeDefined();
    expect(result.message).toBeDefined();
    // AI should generate a meaningful response
    expect(result.message.length).toBeGreaterThan(20);
  }, 15000); // 15 second timeout for LLM call
});
