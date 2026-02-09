import { describe, it, expect } from "vitest";

describe("RESEND_API_KEY", () => {
  it("should be set in environment", () => {
    const key = process.env.RESEND_API_KEY;
    expect(key).toBeDefined();
    expect(typeof key).toBe("string");
    expect(key!.length).toBeGreaterThan(0);
  });

  it("should start with re_ prefix (Resend format)", () => {
    const key = process.env.RESEND_API_KEY;
    expect(key).toBeDefined();
    expect(key!.startsWith("re_")).toBe(true);
  });

  it("should be a valid Resend API key (list domains)", async () => {
    const key = process.env.RESEND_API_KEY;
    if (!key) return;

    const response = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${key}` },
    });
    // 200 = valid key, we just check it's not 401/403
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
  });
});
