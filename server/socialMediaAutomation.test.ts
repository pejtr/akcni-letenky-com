/**
 * Unit Tests for Social Media Automation (Facebook & Instagram)
 */

import { describe, it, expect } from "vitest";
import { formatFlightDealPost, formatBlogArticlePost, DEFAULT_HASHTAGS, publishToFacebook, publishToInstagram } from "./socialMediaAutomation";

describe("Social Media Post Generator", () => {
  it("should format a flight deal into a high-converting social post", () => {
    const flight = {
      fromCity: "Praha",
      toCity: "Dubaj",
      price: 4990,
      originalPrice: 12500,
      discountPercent: 60,
      airline: "Emirates",
      remainingSeats: 3,
      affiliateUrl: "https://pelikan.cz/deal/dubaj",
      imageUrl: "https://www.akcni-letenky.com/dubai.jpg",
    };

    const formatted = formatFlightDealPost(flight);

    expect(formatted.title).toContain("Praha ↔ Dubaj");
    expect(formatted.title).toContain("4");
    expect(formatted.title).toContain("990 Kč");
    expect(formatted.caption).toContain("⚡ EXKLUZIVNÍ NABÍDKA LETENEK!");
    expect(formatted.caption).toContain("📍 Trasa: Praha ↔ Dubaj");
    expect(formatted.caption).toContain("990 Kč");
    expect(formatted.caption).toContain("Ušetříte 60%");
    expect(formatted.caption).toContain("⏰ Rychle! Zbývá pouze 3 volných míst");
    expect(formatted.caption).toContain("#akcniletenky");
    expect(formatted.caption).toContain("Co vás čeká v destinaci Dubaj?");
    expect(formatted.caption).toContain("Burj Khalifa");
    expect(formatted.linkUrl).toBe("https://pelikan.cz/deal/dubaj");
    expect(formatted.imageUrl).toBe("https://www.akcni-letenky.com/dubai.jpg");
  });

  it("should format a blog article into a social post", () => {
    const article = {
      title: "Vatikán a Vatikánská muzea: Kompletní průvodce",
      excerpt: "Vše o vstupenkách, Sixtinské kapli a Bazilice sv. Petra bez front.",
      slug: "vatikan-a-vatikanska-muzea-pruvodce",
      featuredImage: "https://images.unsplash.com/photo-vatikan.jpg",
    };

    const formatted = formatBlogArticlePost(article);

    expect(formatted.title).toContain("📖 NOVÝ ČLÁNEK: Vatikán a Vatikánská muzea");
    expect(formatted.caption).toContain("💡 PRŮVODCE PRO CESTOVATELE 🗺️");
    expect(formatted.caption).toContain("Vše o vstupenkách, Sixtinské kapli");
    expect(formatted.caption).toContain("🔗 Čtěte celý článek zdarma");
    expect(formatted.caption).toContain("https://www.akcni-letenky.com/blog/vatikan-a-vatikanska-muzea-pruvodce");
    expect(formatted.imageUrl).toBe("https://images.unsplash.com/photo-vatikan.jpg");
  });

  it("should include relevant travel hashtags", () => {
    expect(DEFAULT_HASHTAGS).toContain("#akcniletenky");
    expect(DEFAULT_HASHTAGS).toContain("#levneletenky");
    expect(DEFAULT_HASHTAGS).toContain("#cestovani");
  });

  it("should support dry-run simulation mode for Facebook API", async () => {
    const res = await publishToFacebook({
      caption: "Test post text for FB",
      imageUrl: "https://www.akcni-letenky.com/hero.jpg",
    });

    expect(res.success).toBe(true);
    expect(res.isSimulated).toBe(true);
    expect(res.postId).toContain("simulated_fb_post_");
  });

  it("should support dry-run simulation mode for Instagram API", async () => {
    const res = await publishToInstagram({
      caption: "Test post text for IG",
      imageUrl: "https://www.akcni-letenky.com/hero.jpg",
    });

    expect(res.success).toBe(true);
    expect(res.isSimulated).toBe(true);
    expect(res.mediaId).toContain("simulated_ig_media_");
  });
});
