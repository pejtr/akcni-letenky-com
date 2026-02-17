/**
 * Meta Conversion API Tests
 * 
 * Validates that Meta Pixel ID and Conversion API Access Token are configured correctly
 */

import { describe, it, expect } from "vitest";
import { sendMetaEvent } from "./_core/metaConversionApi";

describe("Meta Conversion API", () => {
  it("should have META_PIXEL_ID configured", () => {
    expect(process.env.META_PIXEL_ID).toBeDefined();
    expect(process.env.META_PIXEL_ID).not.toBe("");
    expect(process.env.META_PIXEL_ID).toMatch(/^\d+$/); // Should be numeric
  });

  it("should have META_CONVERSION_API_TOKEN configured", () => {
    expect(process.env.META_CONVERSION_API_TOKEN).toBeDefined();
    expect(process.env.META_CONVERSION_API_TOKEN).not.toBe("");
    expect(process.env.META_CONVERSION_API_TOKEN?.length).toBeGreaterThan(50);
  });

  it("should have VITE_META_PIXEL_ID configured for frontend", () => {
    expect(process.env.VITE_META_PIXEL_ID).toBeDefined();
    expect(process.env.VITE_META_PIXEL_ID).toBe(process.env.META_PIXEL_ID);
  });

  it("should send test event to Meta Conversion API", async () => {
    const result = await sendMetaEvent({
      event_name: "PageView",
      event_id: `test_${Date.now()}`,
      event_source_url: "https://test.example.com",
      user_data: {
        client_ip_address: "127.0.0.1",
        client_user_agent: "Mozilla/5.0 (Test)",
      },
    });

    // If credentials are valid, sendMetaEvent should return true
    // If invalid, it will return false and log error
    expect(result).toBe(true);
  }, 10000); // 10 second timeout for API call
});
