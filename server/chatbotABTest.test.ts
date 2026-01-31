/**
 * Unit tests for Chatbot A/B Testing Service
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  PERSONA_PHOEBE,
  PERSONA_PIPER,
  PERSONA_PRUE,
  ALL_PERSONAS,
} from "./chatbotABTest";

describe("Chatbot A/B Test Personas", () => {
  describe("Persona Definitions", () => {
    it("should have 3 personas defined", () => {
      expect(ALL_PERSONAS).toHaveLength(3);
    });

    it("should have Phoebe with energetic tone", () => {
      expect(PERSONA_PHOEBE.name).toBe("phoebe");
      expect(PERSONA_PHOEBE.tone).toBe("energetic");
      expect(PERSONA_PHOEBE.useEmoji).toBe(true);
      expect(PERSONA_PHOEBE.formalityLevel).toBe("informal");
    });

    it("should have Piper with professional tone", () => {
      expect(PERSONA_PIPER.name).toBe("piper");
      expect(PERSONA_PIPER.tone).toBe("professional");
      expect(PERSONA_PIPER.useEmoji).toBe(true);
      expect(PERSONA_PIPER.formalityLevel).toBe("neutral");
    });

    it("should have Prue with friendly tone and no emoji", () => {
      expect(PERSONA_PRUE.name).toBe("prue");
      expect(PERSONA_PRUE.tone).toBe("friendly");
      expect(PERSONA_PRUE.useEmoji).toBe(false);
      expect(PERSONA_PRUE.formalityLevel).toBe("formal");
    });

    it("each persona should have required fields", () => {
      for (const persona of ALL_PERSONAS) {
        expect(persona.name).toBeDefined();
        expect(persona.displayName).toBeDefined();
        expect(persona.avatar).toBeDefined();
        expect(persona.tone).toBeDefined();
        expect(persona.systemPromptAddition).toBeDefined();
        expect(persona.greetingMessage).toBeDefined();
        expect(persona.ctaStyle).toBeDefined();
        expect(persona.targetAudience).toBeDefined();
      }
    });

    it("each persona should have unique name", () => {
      const names = ALL_PERSONAS.map(p => p.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it("Phoebe greeting should contain multiple emojis", () => {
      const emojiCount = (PERSONA_PHOEBE.greetingMessage.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
      expect(emojiCount).toBeGreaterThanOrEqual(3);
    });

    it("Prue greeting should not contain emojis", () => {
      const emojiCount = (PERSONA_PRUE.greetingMessage.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
      expect(emojiCount).toBe(0);
    });
  });

  describe("Persona System Prompts", () => {
    it("Phoebe system prompt should mention energetic personality", () => {
      expect(PERSONA_PHOEBE.systemPromptAddition.toLowerCase()).toContain("energi");
    });

    it("Piper system prompt should mention professional personality", () => {
      expect(PERSONA_PIPER.systemPromptAddition.toLowerCase()).toContain("profesionál");
    });

    it("Prue system prompt should mention sophisticated personality", () => {
      expect(PERSONA_PRUE.systemPromptAddition.toLowerCase()).toContain("sofistikovan");
    });
  });

  describe("Target Audiences", () => {
    it("Phoebe should target younger audience", () => {
      expect(PERSONA_PHOEBE.targetAudience.toLowerCase()).toContain("mlad");
    });

    it("Piper should target middle-aged audience", () => {
      expect(PERSONA_PIPER.targetAudience.toLowerCase()).toContain("střední");
    });

    it("Prue should target luxury segment", () => {
      expect(PERSONA_PRUE.targetAudience.toLowerCase()).toContain("luxus");
    });
  });
});
