import { describe, it, expect, vi } from "vitest";

// Build proper mock chain supporting groupBy
const mockSelect = vi.fn().mockImplementation(() => {
  const c: any = {};
  c.from = vi.fn().mockImplementation(() => {
    const inner: any = {};
    inner.where = vi.fn().mockImplementation(() => {
      const w: any = {};
      w.groupBy = vi.fn().mockImplementation(() => {
        const g: any = {};
        g.orderBy = vi.fn().mockImplementation(() => {
          const o: any = {};
          o.limit = vi.fn().mockResolvedValue([]);
          // Also make orderBy result thenable (for queries without limit)
          o.then = (resolve: any) => resolve([]);
          return o;
        });
        g.limit = vi.fn().mockResolvedValue([]);
        // Make groupBy result thenable
        g.then = (resolve: any) => resolve([]);
        return g;
      });
      w.orderBy = vi.fn().mockResolvedValue([]);
      w.limit = vi.fn().mockResolvedValue([]);
      // Make where result thenable for simple queries
      w.then = (resolve: any) => resolve([{ avgWidth: 1920, avgHeight: 1080 }]);
      return w;
    });
    return inner;
  });
  return c;
});

const mockInsert = vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue([]) });
const mockDelete = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) });

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    insert: mockInsert,
    select: mockSelect,
    delete: mockDelete,
  }),
}));

vi.mock("../drizzle/schema", () => ({
  clickEvents: {
    page: "page",
    x: "x",
    y: "y",
    viewportWidth: "viewportWidth",
    viewportHeight: "viewportHeight",
    elementTag: "elementTag",
    elementText: "elementText",
    createdAt: "createdAt",
  },
}));

vi.mock("drizzle-orm", () => ({
  sql: (strings: TemplateStringsArray, ...values: any[]) => strings.join(""),
  gte: vi.fn(),
  eq: vi.fn(),
  and: vi.fn(),
  desc: vi.fn(),
  lte: vi.fn(),
}));

describe("Click Heatmap Service", () => {
  it("should export recordClickEvent function", async () => {
    const mod = await import("./clickHeatmap");
    expect(typeof mod.recordClickEvent).toBe("function");
  });

  it("should export recordClickEventsBatch function", async () => {
    const mod = await import("./clickHeatmap");
    expect(typeof mod.recordClickEventsBatch).toBe("function");
  });

  it("should export getHeatmapData function", async () => {
    const mod = await import("./clickHeatmap");
    expect(typeof mod.getHeatmapData).toBe("function");
  });

  it("recordClickEvent should accept click event data", async () => {
    const mod = await import("./clickHeatmap");
    await expect(mod.recordClickEvent({
      page: "/",
      x: 500,
      y: 300,
      viewportWidth: 1920,
      viewportHeight: 1080,
      elementTag: "button",
      elementText: "Vyhledat letenky",
    })).resolves.not.toThrow();
  });

  it("getHeatmapData should return points array", async () => {
    const mod = await import("./clickHeatmap");
    const result = await mod.getHeatmapData("/", 7);
    expect(result).toBeDefined();
    expect(result).toHaveProperty("points");
    expect(Array.isArray(result.points)).toBe(true);
  });

  it("should handle empty heatmap data gracefully", async () => {
    const mod = await import("./clickHeatmap");
    const result = await mod.getHeatmapData("/nonexistent", 7);
    expect(result.points).toEqual([]);
  });

  it("recordClickEventsBatch should accept array of events", async () => {
    const mod = await import("./clickHeatmap");
    await expect(mod.recordClickEventsBatch([
      { page: "/", x: 100, y: 200, viewportWidth: 1920, viewportHeight: 1080 },
      { page: "/", x: 300, y: 400, viewportWidth: 1920, viewportHeight: 1080 },
    ])).resolves.not.toThrow();
  });
});
