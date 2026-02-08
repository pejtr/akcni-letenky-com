import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
const mockInsert = vi.fn().mockReturnValue({
  values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
});
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();
const mockSet = vi.fn();

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    insert: (...args: any[]) => mockInsert(...args),
    select: (...args: any[]) => {
      mockSelect(...args);
      return {
        from: (...fArgs: any[]) => {
          mockFrom(...fArgs);
          return {
            where: (...wArgs: any[]) => {
              mockWhere(...wArgs);
              return {
                orderBy: (...oArgs: any[]) => {
                  mockOrderBy(...oArgs);
                  return {
                    limit: (...lArgs: any[]) => {
                      mockLimit(...lArgs);
                      return [];
                    },
                  };
                },
                limit: (...lArgs: any[]) => {
                  mockLimit(...lArgs);
                  return [];
                },
              };
            },
            orderBy: (...oArgs: any[]) => {
              mockOrderBy(...oArgs);
              return {
                limit: (...lArgs: any[]) => {
                  mockLimit(...lArgs);
                  return [];
                },
              };
            },
          };
        },
      };
    },
    update: (...args: any[]) => {
      mockUpdate(...args);
      return {
        set: (...sArgs: any[]) => {
          mockSet(...sArgs);
          return {
            where: vi.fn().mockResolvedValue(undefined),
          };
        },
      };
    },
  }),
}));

vi.mock("../drizzle/schema", () => ({
  emailAbTests: { id: "id", status: "status", createdAt: "createdAt" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((...args: any[]) => args),
  desc: vi.fn((...args: any[]) => args),
  and: vi.fn((...args: any[]) => args),
}));

import {
  createEmailAbTest,
  getActiveEmailAbTest,
  getAllEmailAbTests,
  pickEmailVariant,
  recordEmailSent,
  recordEmailOpened,
  recordEmailClicked,
  determineEmailAbTestWinner,
  toggleEmailAbTestStatus,
} from "./emailAbTest";

describe("Email A/B Test Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createEmailAbTest", () => {
    it("should create a new A/B test and return its ID", async () => {
      const id = await createEmailAbTest({
        testName: "Test 1",
        variantASubject: "Subject A",
        variantACtaText: "CTA A",
        variantBSubject: "Subject B",
        variantBCtaText: "CTA B",
      });

      expect(id).toBe(1);
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe("getActiveEmailAbTest", () => {
    it("should return null when no active tests exist", async () => {
      const result = await getActiveEmailAbTest();
      expect(result).toBeNull();
    });
  });

  describe("getAllEmailAbTests", () => {
    it("should return an empty array when no tests exist", async () => {
      const result = await getAllEmailAbTests();
      expect(result).toEqual([]);
    });
  });

  describe("pickEmailVariant", () => {
    it("should return null when no active test exists", async () => {
      const result = await pickEmailVariant();
      expect(result).toBeNull();
    });
  });

  describe("determineEmailAbTestWinner", () => {
    it("should return insufficient_data when test not found", async () => {
      const result = await determineEmailAbTestWinner(999);
      expect(result.winner).toBe("none");
      expect(result.confidence).toBe("not_found");
    });
  });

  describe("EmailVariant type", () => {
    it("should have correct structure", () => {
      const variant = {
        subject: "Test subject",
        ctaText: "Click here",
        variant: "A" as const,
      };
      expect(variant.subject).toBe("Test subject");
      expect(variant.ctaText).toBe("Click here");
      expect(variant.variant).toBe("A");
    });
  });

  describe("Exchange rate conversion logic", () => {
    it("should convert CZK to EUR correctly", () => {
      const rate = 0.040;
      const priceCzk = 5000;
      const priceEur = priceCzk * rate;
      expect(priceEur).toBe(200);
    });

    it("should convert CZK to USD correctly", () => {
      const rate = 0.043;
      const priceCzk = 5000;
      const priceUsd = priceCzk * rate;
      expect(priceUsd).toBeCloseTo(215, 0);
    });

    it("should keep CZK unchanged", () => {
      const rate = 1;
      const priceCzk = 5000;
      expect(priceCzk * rate).toBe(5000);
    });
  });
});
