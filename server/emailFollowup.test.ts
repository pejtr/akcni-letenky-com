import { describe, it, expect, vi } from "vitest";

// Mock getDb
const mockInsert = vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue([]) });
const mockSelectChain = () => {
  const c: any = {};
  c.from = vi.fn().mockImplementation(() => {
    const inner: any = {};
    inner.where = vi.fn().mockImplementation(() => {
      const w: any = {};
      w.limit = vi.fn().mockResolvedValue([]);
      w.orderBy = vi.fn().mockResolvedValue([]);
      w.then = (resolve: any) => resolve([]);
      return w;
    });
    return inner;
  });
  return c;
};
const mockSelect = vi.fn().mockImplementation(mockSelectChain);
const mockUpdate = vi.fn().mockReturnValue({
  set: vi.fn().mockReturnValue({
    where: vi.fn().mockResolvedValue([]),
  }),
});

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    insert: mockInsert,
    select: mockSelect,
    update: mockUpdate,
  }),
}));

vi.mock("../drizzle/schema", () => ({
  emailFollowups: {
    id: "id",
    email: "email",
    status: "status",
    scheduledAt: "scheduledAt",
    sentAt: "sentAt",
    createdAt: "createdAt",
    destination: "destination",
    destinationSlug: "destinationSlug",
    source: "source",
  },
}));

vi.mock("drizzle-orm", () => ({
  sql: (strings: TemplateStringsArray, ...values: any[]) => strings.join(""),
  gte: vi.fn(),
  eq: vi.fn(),
  and: vi.fn(),
  lte: vi.fn(),
  desc: vi.fn(),
}));

// Mock Resend
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: "test-email-id" }),
    },
  })),
}));

describe("Email Followup Service", () => {
  it("should export scheduleFollowup function", async () => {
    const mod = await import("./emailFollowup");
    expect(typeof mod.scheduleFollowup).toBe("function");
  });

  it("should export processFollowupQueue function", async () => {
    const mod = await import("./emailFollowup");
    expect(typeof mod.processFollowupQueue).toBe("function");
  });

  it("should export scheduleFollowupProcessor function", async () => {
    const mod = await import("./emailFollowup");
    expect(typeof mod.scheduleFollowupProcessor).toBe("function");
  });

  it("should export getFollowupStats function", async () => {
    const mod = await import("./emailFollowup");
    expect(typeof mod.getFollowupStats).toBe("function");
  });

  it("scheduleFollowup should accept email and destination data", async () => {
    const mod = await import("./emailFollowup");
    await expect(mod.scheduleFollowup({
      email: "test@example.com",
      destination: "Barcelona",
      destinationSlug: "barcelona",
      source: "exit_intent",
    })).resolves.not.toThrow();
  });

  it("processFollowupQueue should handle empty queue", async () => {
    const mod = await import("./emailFollowup");
    const result = await mod.processFollowupQueue();
    expect(typeof result).toBe("number");
    expect(result).toBe(0);
  });
});
