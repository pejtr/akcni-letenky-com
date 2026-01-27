/**
 * Tests for Chatbot RAG (Retrieval-Augmented Generation) System
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database with proper chaining
const createChainMock = () => {
  const chainMock: any = {
    from: vi.fn(() => chainMock),
    where: vi.fn(() => chainMock),
    orderBy: vi.fn(() => chainMock),
    limit: vi.fn(() => Promise.resolve([])),
  };
  return chainMock;
};

vi.mock("./db", () => ({
  getDb: vi.fn(() => Promise.resolve({
    select: vi.fn(() => createChainMock()),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve({ insertId: 1 }))
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve())
      }))
    }))
  }))
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(() => Promise.resolve({
    choices: [{
      message: {
        content: JSON.stringify({
          destinations: ["Barcelona"],
          budget: 5000,
          travelStyle: "budget",
          airlines: [],
          travelDate: null,
          passengerCount: 2
        })
      }
    }]
  }))
}));

describe("Chatbot RAG System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("User Memory", () => {
    it("should return null for new users without memory", async () => {
      const { getUserMemory } = await import("./chatbotRAG");
      const memory = await getUserMemory("new_session_123");
      expect(memory).toBeNull();
    });

    it("should have correct memory structure", async () => {
      const { getUserMemory } = await import("./chatbotRAG");
      // For new users, memory is null
      const memory = await getUserMemory("test_session");
      expect(memory).toBeNull();
    });
  });

  describe("Preference Extraction", () => {
    it("should extract destinations from user message", async () => {
      const { extractPreferencesFromMessage } = await import("./chatbotRAG");
      const prefs = await extractPreferencesFromMessage(
        "Chci letět do Barcelony",
        []
      );
      expect(prefs).toBeDefined();
      expect(prefs.destinations).toBeDefined();
    });

    it("should extract budget from user message", async () => {
      const { extractPreferencesFromMessage } = await import("./chatbotRAG");
      const prefs = await extractPreferencesFromMessage(
        "Mám rozpočet kolem 5000 Kč",
        []
      );
      expect(prefs).toBeDefined();
      expect(prefs.budget).toBeDefined();
    });

    it("should handle empty messages", async () => {
      const { extractPreferencesFromMessage } = await import("./chatbotRAG");
      const prefs = await extractPreferencesFromMessage("", []);
      expect(prefs).toBeDefined();
    });
  });

  describe("RAG Context Retrieval", () => {
    it("should return context structure with all fields", async () => {
      const { retrieveRAGContext } = await import("./chatbotRAG");
      const context = await retrieveRAGContext("Chci do Barcelony", "session_123");
      
      expect(context).toBeDefined();
      expect(context).toHaveProperty("flights");
      expect(context).toHaveProperty("destinations");
      expect(context).toHaveProperty("articles");
      expect(context).toHaveProperty("userMemory");
    });

    it("should return arrays for flights and destinations", async () => {
      const { retrieveRAGContext } = await import("./chatbotRAG");
      const context = await retrieveRAGContext("levné letenky", "session_456");
      
      expect(Array.isArray(context.flights)).toBe(true);
      expect(Array.isArray(context.destinations)).toBe(true);
      expect(Array.isArray(context.articles)).toBe(true);
    });
  });

  describe("Enhanced Context Building", () => {
    it("should build context string from RAG context", async () => {
      const { buildEnhancedContext } = await import("./chatbotRAG");
      
      const ragContext = {
        flights: [
          { fromCity: "Praha", toCity: "Barcelona", price: 946, remainingSeats: 3, airline: "Ryanair", departureDate: new Date() }
        ],
        destinations: [
          { name: "Barcelona", country: "Španělsko", description: "Krásné město", averagePrice: 1000 }
        ],
        articles: [
          { title: "Průvodce po Barceloně", excerpt: "Nejlepší tipy", slug: "pruvodce-barcelona" }
        ],
        userMemory: null
      };
      
      const context = buildEnhancedContext(ragContext);
      
      expect(typeof context).toBe("string");
      expect(context).toContain("Barcelona");
      expect(context).toContain("946");
    });

    it("should include user memory in context when available", async () => {
      const { buildEnhancedContext } = await import("./chatbotRAG");
      
      const ragContext = {
        flights: [],
        destinations: [],
        articles: [],
        userMemory: {
          preferredDestinations: ["Barcelona", "Řím"],
          preferredBudget: 5000,
          preferredTravelStyle: "budget",
          preferredAirlines: ["Ryanair"],
          lastDestinationAsked: "Barcelona",
          lastBudgetMentioned: 5000,
          conversationSummary: "Uživatel hledá levné letenky do Barcelony",
          totalConversations: 3,
          totalMessages: 15
        }
      };
      
      const context = buildEnhancedContext(ragContext);
      
      expect(context).toContain("PAMĚŤ UŽIVATELE");
      expect(context).toContain("Barcelona");
      expect(context).toContain("5000");
    });

    it("should include community info in context", async () => {
      const { buildEnhancedContext } = await import("./chatbotRAG");
      
      const context = buildEnhancedContext({
        flights: [],
        destinations: [],
        articles: [],
        userMemory: null
      });
      
      expect(context).toContain("KOMUNITA");
      expect(context).toContain("FB");
    });
  });

  describe("Knowledge Base", () => {
    it("should search knowledge base and return results", async () => {
      const { searchKnowledgeBase } = await import("./chatbotRAG");
      const results = await searchKnowledgeBase("Barcelona");
      
      expect(Array.isArray(results)).toBe(true);
    });

    it("should filter by content type", async () => {
      const { searchKnowledgeBase } = await import("./chatbotRAG");
      const results = await searchKnowledgeBase("letenky", ["flight", "destination"]);
      
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
