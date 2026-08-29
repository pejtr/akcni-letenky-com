import { describe, it, expect, beforeAll } from "vitest";
import { captureEmail, getEmailCaptureStats, exportEmailsToCSV, exportEmailsToMailchimp } from "./emailCapture";
import { getDb } from "./db";
import { emailCaptures } from "../drizzle/schema";

describe.skipIf(!process.env.DATABASE_URL)("Email Capture System", () => {
  beforeAll(async () => {
    // Clean up test data
    const db = await getDb();
    if (db) {
      await db.delete(emailCaptures);
    }
  });

  describe("captureEmail", () => {
    it("should capture email with basic information", async () => {
      const result = await captureEmail({
        email: "test@example.com",
        sessionId: "test-session-1",
        gdprConsent: true,
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Email captured successfully");
    });

    it("should capture email with persona information", async () => {
      const result = await captureEmail({
        email: "persona-test@example.com",
        sessionId: "test-session-2",
        personaId: 1,
        personaName: "Petra",
        messageCount: 5,
        gdprConsent: true,
      });

      expect(result.success).toBe(true);
    });

    it("should capture email with destination and budget context", async () => {
      const result = await captureEmail({
        email: "context-test@example.com",
        sessionId: "test-session-3",
        personaId: 2,
        personaName: "Monika",
        messageCount: 7,
        lastDestinationMentioned: "Barcelona",
        lastBudgetMentioned: 15000,
        gdprConsent: true,
        consentText: "Souhlasím se zasíláním marketingových nabídek.",
      });

      expect(result.success).toBe(true);
    });

    it("should auto-segment budget travelers", async () => {
      await captureEmail({
        email: "budget@example.com",
        sessionId: "test-session-4",
        lastBudgetMentioned: 3000,
        gdprConsent: true,
      });

      const db = await getDb();
      if (db) {
        const captures = await db.select().from(emailCaptures).where();
        const budgetCapture = captures.find((c) => c.email === "budget@example.com");
        expect(budgetCapture?.segment).toBe("budget_traveler");
      }
    });

    it("should auto-segment luxury travelers", async () => {
      await captureEmail({
        email: "luxury@example.com",
        sessionId: "test-session-5",
        lastBudgetMentioned: 25000,
        gdprConsent: true,
      });

      const db = await getDb();
      if (db) {
        const captures = await db.select().from(emailCaptures).where();
        const luxuryCapture = captures.find((c) => c.email === "luxury@example.com");
        expect(luxuryCapture?.segment).toBe("luxury_traveler");
      }
    });

    it("should handle emails without GDPR consent", async () => {
      const result = await captureEmail({
        email: "no-consent@example.com",
        sessionId: "test-session-6",
        gdprConsent: false,
      });

      expect(result.success).toBe(true);

      const db = await getDb();
      if (db) {
        const captures = await db.select().from(emailCaptures).where();
        const noConsentCapture = captures.find((c) => c.email === "no-consent@example.com");
        expect(noConsentCapture?.gdprConsent).toBe(0);
      }
    });
  });

  describe("getEmailCaptureStats", () => {
    it("should return statistics for captured emails", async () => {
      const stats = await getEmailCaptureStats();

      expect(stats).toBeDefined();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.withConsent).toBeGreaterThanOrEqual(0);
      expect(stats.consentRate).toBeGreaterThanOrEqual(0);
      expect(stats.consentRate).toBeLessThanOrEqual(100);
      expect(stats.byPersona).toBeDefined();
      expect(stats.bySegment).toBeDefined();
    });

    it("should calculate consent rate correctly", async () => {
      const stats = await getEmailCaptureStats();

      if (stats.total > 0) {
        const expectedRate = Math.round((stats.withConsent / stats.total) * 100);
        expect(stats.consentRate).toBe(expectedRate);
      }
    });

    it("should track personas correctly", async () => {
      const stats = await getEmailCaptureStats();

      expect(stats.byPersona).toBeDefined();
      expect(typeof stats.byPersona).toBe("object");
      // Should have at least "Petra" and "Monika" from previous tests
      expect(Object.keys(stats.byPersona).length).toBeGreaterThan(0);
    });

    it("should track segments correctly", async () => {
      const stats = await getEmailCaptureStats();

      expect(stats.bySegment).toBeDefined();
      expect(typeof stats.bySegment).toBe("object");
      // Should have budget_traveler and luxury_traveler from previous tests
      expect(stats.bySegment["budget_traveler"]).toBeGreaterThan(0);
      expect(stats.bySegment["luxury_traveler"]).toBeGreaterThan(0);
    });
  });

  describe("exportEmailsToCSV", () => {
    it("should export emails in CSV format", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const captures = await db.select().from(emailCaptures);
      const csv = exportEmailsToCSV(captures);

      expect(csv).toBeDefined();
      expect(csv).toContain("Email,Persona,Segment");
      expect(csv).toContain("test@example.com");
    });

    it("should include all required columns", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const captures = await db.select().from(emailCaptures);
      const csv = exportEmailsToCSV(captures);

      const headers = csv.split("\n")[0];
      expect(headers).toContain("Email");
      expect(headers).toContain("Persona");
      expect(headers).toContain("Segment");
      expect(headers).toContain("Message Count");
      expect(headers).toContain("Last Destination");
      expect(headers).toContain("Budget");
      expect(headers).toContain("GDPR Consent");
      expect(headers).toContain("Captured At");
    });
  });

  describe("exportEmailsToMailchimp", () => {
    it("should export emails in Mailchimp format", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const captures = await db.select().from(emailCaptures);
      const csv = exportEmailsToMailchimp(captures);

      expect(csv).toBeDefined();
      expect(csv).toContain("Email Address,First Name,Tags");
    });

    it("should only export emails with GDPR consent", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const captures = await db.select().from(emailCaptures);
      const csv = exportEmailsToMailchimp(captures);

      // Should not contain the email without consent
      expect(csv).not.toContain("no-consent@example.com");
      // Should contain emails with consent
      expect(csv).toContain("test@example.com");
    });

    it("should include budget ranges", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const captures = await db.select().from(emailCaptures);
      const csv = exportEmailsToMailchimp(captures);

      expect(csv).toContain("Under 5000 CZK");
      expect(csv).toContain("Over 15000 CZK");
    });

    it("should extract first name from email", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const captures = await db.select().from(emailCaptures);
      const csv = exportEmailsToMailchimp(captures);

      const lines = csv.split("\n");
      // Check that first names are extracted (e.g., "test" from "test@example.com")
      expect(lines.some((line) => line.includes("test,"))).toBe(true);
    });
  });

  describe("Email Capture Integration", () => {
    it("should handle multiple captures for same session", async () => {
      const sessionId = "multi-capture-session";

      await captureEmail({
        email: "first@example.com",
        sessionId,
        gdprConsent: true,
      });

      await captureEmail({
        email: "second@example.com",
        sessionId,
        gdprConsent: true,
      });

      const db = await getDb();
      if (db) {
        const captures = await db.select().from(emailCaptures).where();
        const sessionCaptures = captures.filter((c) => c.sessionId === sessionId);
        expect(sessionCaptures.length).toBe(2);
      }
    });

    it("should preserve all metadata fields", async () => {
      const testEmail = "metadata-test@example.com";
      const testData = {
        email: testEmail,
        sessionId: "metadata-session",
        personaId: 3,
        personaName: "Tereza",
        messageCount: 10,
        lastDestinationMentioned: "Paříž",
        lastBudgetMentioned: 12000,
        gdprConsent: true,
        consentText: "Full consent text here",
      };

      await captureEmail(testData);

      const db = await getDb();
      if (db) {
        const captures = await db.select().from(emailCaptures).where();
        const capture = captures.find((c) => c.email === testEmail);

        expect(capture).toBeDefined();
        expect(capture?.personaName).toBe("Tereza");
        expect(capture?.messageCount).toBe(10);
        expect(capture?.lastDestinationMentioned).toBe("Paříž");
        expect(capture?.lastBudgetMentioned).toBe(12000);
        expect(capture?.gdprConsent).toBe(1);
        expect(capture?.consentText).toBe("Full consent text here");
      }
    });
  });
});
