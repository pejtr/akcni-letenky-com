import { describe, it, expect } from "vitest";

describe("Travelpayouts API token", () => {
  it("should fetch cheap flights from PRG with valid token", async (ctx) => {
    const token = process.env.TRAVELPAYOUTS_API_TOKEN;
    if (!token) {
      ctx.skip();
      return;
    }

    const res = await fetch(
      "https://api.travelpayouts.com/v1/prices/cheap?origin=PRG&destination=-&currency=CZK&limit=3",
      { headers: { "X-Access-Token": token! } }
    );
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(typeof data.data).toBe("object");
    const keys = Object.keys(data.data);
    expect(keys.length).toBeGreaterThan(0);
  });
});
