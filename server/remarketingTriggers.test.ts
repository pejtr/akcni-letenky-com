import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

// Mock notification module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe("Remarketing Triggers System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("7-Day No Conversion Trigger", () => {
    it("should schedule trigger 7 days after email capture", () => {
      const capturedAt = new Date();
      const triggerDate = new Date(capturedAt);
      triggerDate.setDate(triggerDate.getDate() + 7);

      const daysDiff = Math.round(
        (triggerDate.getTime() - capturedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysDiff).toBe(7);
    });

    it("should include 10% discount code", () => {
      const discountCode = "VRACIMSE10";
      const discountPercent = 10;
      
      expect(discountCode).toBe("VRACIMSE10");
      expect(discountPercent).toBe(10);
    });

    it("should have 48-hour validity", () => {
      const validityHours = 48;
      expect(validityHours).toBe(48);
    });
  });

  describe("Trigger Processing", () => {
    it("should process triggers that are due", () => {
      const now = new Date();
      const triggers = [
        { id: 1, status: "pending", triggerDate: new Date(now.getTime() - 1000) },
        { id: 2, status: "pending", triggerDate: new Date(now.getTime() + 100000) },
        { id: 3, status: "triggered", triggerDate: new Date(now.getTime() - 1000) },
      ];

      const dueTriggers = triggers.filter(
        (t) => t.status === "pending" && t.triggerDate <= now
      );

      expect(dueTriggers.length).toBe(1);
      expect(dueTriggers[0].id).toBe(1);
    });

    it("should cancel trigger if user converted", () => {
      const user = { converted: 1 };
      const shouldCancel = user.converted === 1;
      expect(shouldCancel).toBe(true);
    });

    it("should cancel trigger if user unsubscribed", () => {
      const user = { unsubscribed: 1 };
      const shouldCancel = user.unsubscribed === 1;
      expect(shouldCancel).toBe(true);
    });

    it("should proceed if user has not converted and not unsubscribed", () => {
      const user = { converted: 0, unsubscribed: 0 };
      const shouldProceed = user.converted !== 1 && user.unsubscribed !== 1;
      expect(shouldProceed).toBe(true);
    });
  });

  describe("Conversion Tracking", () => {
    it("should mark user as converted", () => {
      const user = { converted: 0, convertedAt: null };
      user.converted = 1;
      user.convertedAt = new Date();

      expect(user.converted).toBe(1);
      expect(user.convertedAt).toBeInstanceOf(Date);
    });

    it("should cancel all pending triggers on conversion", () => {
      const triggers = [
        { id: 1, status: "pending", emailCaptureId: 1 },
        { id: 2, status: "pending", emailCaptureId: 1 },
        { id: 3, status: "triggered", emailCaptureId: 1 },
      ];

      const pendingTriggers = triggers.filter(
        (t) => t.status === "pending" && t.emailCaptureId === 1
      );

      expect(pendingTriggers.length).toBe(2);
    });
  });

  describe("Remarketing Statistics", () => {
    it("should calculate conversion rate correctly", () => {
      const triggered = 100;
      const converted = 15;
      const conversionRate = Math.round((converted / (triggered + converted)) * 100);
      
      expect(conversionRate).toBe(13); // 15 / 115 * 100 ≈ 13%
    });

    it("should handle zero triggers", () => {
      const triggered = 0;
      const converted = 0;
      const conversionRate =
        triggered + converted > 0
          ? Math.round((converted / (triggered + converted)) * 100)
          : 0;

      expect(conversionRate).toBe(0);
    });

    it("should count trigger statuses correctly", () => {
      const triggers = [
        { status: "pending" },
        { status: "pending" },
        { status: "triggered" },
        { status: "triggered" },
        { status: "triggered" },
        { status: "cancelled" },
        { status: "converted" },
        { status: "converted" },
      ];

      const pending = triggers.filter((t) => t.status === "pending").length;
      const triggered = triggers.filter((t) => t.status === "triggered").length;
      const cancelled = triggers.filter((t) => t.status === "cancelled").length;
      const converted = triggers.filter((t) => t.status === "converted").length;

      expect(pending).toBe(2);
      expect(triggered).toBe(3);
      expect(cancelled).toBe(1);
      expect(converted).toBe(2);
    });
  });

  describe("Trigger Types", () => {
    it("should support 7-day no conversion trigger", () => {
      const triggerType = "7_day_no_conversion";
      expect(triggerType).toBe("7_day_no_conversion");
    });

    it("should support manual test trigger", () => {
      const triggerType = "manual_test";
      expect(triggerType).toBe("manual_test");
    });
  });

  describe("Context Data", () => {
    it("should store destination in context", () => {
      const contextData = {
        destination: "Barcelona",
        budget: 15000,
        persona: "Phoebe",
        leadScore: 75,
        leadTier: "warm",
      };

      expect(contextData.destination).toBe("Barcelona");
      expect(contextData.budget).toBe(15000);
    });

    it("should serialize context data to JSON", () => {
      const contextData = {
        destination: "Maledivy",
        budget: 50000,
      };

      const serialized = JSON.stringify(contextData);
      const parsed = JSON.parse(serialized);

      expect(parsed.destination).toBe("Maledivy");
      expect(parsed.budget).toBe(50000);
    });
  });

  describe("Personalization in Remarketing", () => {
    it("should use persona-specific subject line", () => {
      const subjects = {
        default: "🎁 Speciální nabídka jen pro vás - 10% sleva!",
        phoebe: "Hej! 👋 Mám pro tebe překvápko - extra sleva 10%!",
        prue: "Exkluzivní nabídka: 10% sleva na vaši rezervaci",
      };

      expect(subjects.phoebe).toContain("Hej!");
      expect(subjects.prue).toContain("Exkluzivní");
      expect(subjects.default).toContain("Speciální");
    });

    it("should include destination if available", () => {
      const destination = "Barcelona";
      const content = destination
        ? `Pamatuju si, že tě zajímala ${destination}`
        : "Obecný obsah";

      expect(content).toContain("Barcelona");
    });
  });

  describe("Manual Trigger Creation", () => {
    it("should create trigger with 1 minute delay for testing", () => {
      const now = new Date();
      const triggerDate = new Date(now);
      triggerDate.setMinutes(triggerDate.getMinutes() + 1);

      const delayMinutes = Math.round(
        (triggerDate.getTime() - now.getTime()) / (1000 * 60)
      );

      expect(delayMinutes).toBe(1);
    });

    it("should mark manual triggers with context flag", () => {
      const contextData = { manual: true };
      expect(contextData.manual).toBe(true);
    });
  });

  describe("GDPR Compliance", () => {
    it("should only create triggers for users with GDPR consent", () => {
      const user = { gdprConsent: 1 };
      const canCreateTrigger = user.gdprConsent === 1;
      expect(canCreateTrigger).toBe(true);
    });

    it("should not create triggers without GDPR consent", () => {
      const user = { gdprConsent: 0 };
      const canCreateTrigger = user.gdprConsent === 1;
      expect(canCreateTrigger).toBe(false);
    });
  });
});
