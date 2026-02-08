import { describe, it, expect } from "vitest";

describe("RESEND_API_KEY", () => {
  it("should be set in environment", () => {
    // The key should be set via webdev_request_secrets
    const key = process.env.RESEND_API_KEY;
    expect(key).toBeDefined();
    expect(typeof key).toBe("string");
    expect(key!.length).toBeGreaterThan(0);
  });

  it("should start with re_ prefix (Resend format)", () => {
    const key = process.env.RESEND_API_KEY;
    if (key) {
      expect(key.startsWith("re_")).toBe(true);
    }
  });
});
