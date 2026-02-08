import { describe, it, expect, vi } from "vitest";

// Build a mock chain that supports all the query patterns used
const mockChain = () => {
  const chain: any = {};
  chain.from = vi.fn().mockReturnValue(chain);
  chain.where = vi.fn().mockReturnValue(chain);
  chain.groupBy = vi.fn().mockResolvedValue([]);
  chain.orderBy = vi.fn().mockResolvedValue([]);
  chain.limit = vi.fn().mockResolvedValue([]);
  // For count queries, resolve to [{count: 0}]
  chain.then = undefined; // remove default then
  return chain;
};

const selectChain = mockChain();
// Make select return the chain, but also make the chain itself thenable for simple queries
const mockSelect = vi.fn().mockReturnValue(selectChain);

// Override from to return a new chain each time to avoid shared state
mockSelect.mockImplementation(() => {
  const c: any = {};
  c.from = vi.fn().mockImplementation(() => {
    const inner: any = {};
    inner.where = vi.fn().mockImplementation(() => {
      const w: any = {};
      w.groupBy = vi.fn().mockResolvedValue([]);
      w.orderBy = vi.fn().mockResolvedValue([]);
      w.limit = vi.fn().mockResolvedValue([]);
      // Make w itself resolve to [{count: 0}] for COUNT queries
      w.then = (resolve: any) => resolve([{ count: 0 }]);
      return w;
    });
    inner.orderBy = vi.fn().mockResolvedValue([]);
    return inner;
  });
  return c;
});

const mockInsert = vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue([]) });

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    insert: mockInsert,
    select: mockSelect,
  }),
}));

vi.mock("../drizzle/schema", () => ({
  conversionEvents: {
    sessionId: "sessionId",
    eventType: "eventType",
    page: "page",
    metadata: "metadata",
    createdAt: "createdAt",
  },
}));

vi.mock("drizzle-orm", () => ({
  sql: (strings: TemplateStringsArray, ...values: any[]) => strings.join(""),
  gte: vi.fn(),
  desc: vi.fn(),
  eq: vi.fn(),
  and: vi.fn(),
}));

describe("Conversion Funnel Service", () => {
  it("should export recordConversionEvent function", async () => {
    const mod = await import("./conversionFunnel");
    expect(typeof mod.recordConversionEvent).toBe("function");
  });

  it("should export getConversionFunnel function", async () => {
    const mod = await import("./conversionFunnel");
    expect(typeof mod.getConversionFunnel).toBe("function");
  });

  it("should export getFunnelSummary function", async () => {
    const mod = await import("./conversionFunnel");
    expect(typeof mod.getFunnelSummary).toBe("function");
  });

  it("should export FUNNEL_STEPS constant", async () => {
    const mod = await import("./conversionFunnel");
    expect(Array.isArray(mod.FUNNEL_STEPS)).toBe(true);
    expect(mod.FUNNEL_STEPS.length).toBeGreaterThan(0);
  });

  it("FUNNEL_STEPS should contain correct step keys", async () => {
    const mod = await import("./conversionFunnel");
    const keys = mod.FUNNEL_STEPS.map((s: any) => s.key);
    expect(keys).toContain("page_visit");
    expect(keys).toContain("affiliate_click");
  });

  it("recordConversionEvent should accept event data", async () => {
    const mod = await import("./conversionFunnel");
    await expect(mod.recordConversionEvent({
      sessionId: "test-session-123",
      eventType: "page_visit",
      page: "/",
    })).resolves.not.toThrow();
  });

  it("getConversionFunnel should return structured funnel data", async () => {
    const mod = await import("./conversionFunnel");
    const result = await mod.getConversionFunnel(30);
    expect(result).toBeDefined();
    expect(result).toHaveProperty("steps");
    expect(result).toHaveProperty("totalSessions");
    expect(result).toHaveProperty("overallConversionRate");
  });

  it("getConversionFunnel steps should have correct structure", async () => {
    const mod = await import("./conversionFunnel");
    const result = await mod.getConversionFunnel(30);
    if (result.steps.length > 0) {
      const step = result.steps[0];
      expect(step).toHaveProperty("step");
      expect(step).toHaveProperty("label");
      expect(step).toHaveProperty("count");
      expect(step).toHaveProperty("percentage");
    }
  });
});
