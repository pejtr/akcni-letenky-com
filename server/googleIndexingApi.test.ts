import { describe, it, expect } from "vitest";
import { sanitizeIndexingUrl, requestGoogleIndexing, batchGoogleIndexing } from "./googleIndexingApi";

describe("Google Indexing API v3 Integration", () => {
  it("should sanitize non-www and relative URLs to https://www.akcni-letenky.com", () => {
    expect(sanitizeIndexingUrl("/dubaj")).toBe("https://www.akcni-letenky.com/dubaj");
    expect(sanitizeIndexingUrl("https://akcni-letenky.com/blog")).toBe("https://www.akcni-letenky.com/blog");
    expect(sanitizeIndexingUrl("https://web-production-890af.up.railway.app/wishlist")).toBe(
      "https://www.akcni-letenky.com/wishlist"
    );
  });

  it("should return fallback response when credentials are missing", async () => {
    const res = await requestGoogleIndexing("https://www.akcni-letenky.com/blog/test-clanek");
    expect(res.success).toBe(true);
    expect(res.url).toBe("https://www.akcni-letenky.com/blog/test-clanek");
    expect(res.type).toBe("URL_UPDATED");
    expect(res.message).toContain("Credentials missing");
  });

  it("should handle batch URL indexing requests", async () => {
    const urls = ["/dubaj", "/bali", "/blog"];
    const results = await batchGoogleIndexing(urls);
    expect(results).toHaveLength(3);
    expect(results[0].url).toBe("https://www.akcni-letenky.com/dubaj");
    expect(results[1].url).toBe("https://www.akcni-letenky.com/bali");
  });
});
