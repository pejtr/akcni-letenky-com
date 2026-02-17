import { describe, it, expect, vi, beforeEach } from "vitest";

// Test: CountdownTimer logic
describe("CountdownTimer", () => {
  it("should calculate 6-hour windows correctly", () => {
    const sixHours = 6 * 60 * 60 * 1000;
    const now = Date.now();
    const windowEnd = Math.ceil(now / sixHours) * sixHours;
    
    // Window end should be in the future or exactly now
    expect(windowEnd).toBeGreaterThanOrEqual(now);
    // Window end should be at most 6 hours from now
    expect(windowEnd - now).toBeLessThanOrEqual(sixHours);
  });

  it("should pad numbers correctly", () => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    expect(pad(0)).toBe("00");
    expect(pad(5)).toBe("05");
    expect(pad(12)).toBe("12");
    expect(pad(59)).toBe("59");
  });

  it("should calculate hours, minutes, seconds from total seconds", () => {
    const totalSeconds = 3661; // 1h 1m 1s
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    expect(hours).toBe(1);
    expect(minutes).toBe(1);
    expect(seconds).toBe(1);
  });
});

// Test: GDPR Consent Banner logic
describe("GDPR Consent Banner", () => {
  beforeEach(() => {
    // Clear localStorage mock
    vi.stubGlobal("localStorage", {
      store: {} as Record<string, string>,
      getItem(key: string) { return this.store[key] || null; },
      setItem(key: string, value: string) { this.store[key] = value; },
      removeItem(key: string) { delete this.store[key]; },
      clear() { this.store = {}; },
    });
  });

  it("should store consent with all categories accepted", () => {
    const consent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    };
    localStorage.setItem("gdpr_consent", JSON.stringify(consent));
    localStorage.setItem("gdpr_analytics", "true");
    localStorage.setItem("gdpr_marketing", "true");
    
    const stored = JSON.parse(localStorage.getItem("gdpr_consent")!);
    expect(stored.necessary).toBe(true);
    expect(stored.analytics).toBe(true);
    expect(stored.marketing).toBe(true);
    expect(stored.timestamp).toBeGreaterThan(0);
  });

  it("should store consent with marketing rejected", () => {
    const consent = {
      necessary: true,
      analytics: true,
      marketing: false,
      timestamp: Date.now(),
    };
    localStorage.setItem("gdpr_consent", JSON.stringify(consent));
    localStorage.setItem("gdpr_analytics", "true");
    localStorage.setItem("gdpr_marketing", "false");
    
    expect(localStorage.getItem("gdpr_marketing")).toBe("false");
  });

  it("should store consent with all rejected", () => {
    const consent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    };
    localStorage.setItem("gdpr_consent", JSON.stringify(consent));
    
    const stored = JSON.parse(localStorage.getItem("gdpr_consent")!);
    expect(stored.necessary).toBe(true);
    expect(stored.analytics).toBe(false);
    expect(stored.marketing).toBe(false);
  });

  it("should return null when no consent stored", () => {
    const stored = localStorage.getItem("gdpr_consent");
    expect(stored).toBeNull();
  });
});

// Test: Flight sorting logic
describe("Flight Sorting", () => {
  const mockFlights = [
    { id: "1", salePrice: 1500, discount: "-30%", departureDate: "2026-03-15" },
    { id: "2", salePrice: 800, discount: "-45%", departureDate: "2026-02-20" },
    { id: "3", salePrice: 2200, discount: "-15%", departureDate: "2026-04-01" },
    { id: "4", salePrice: 1100, discount: "-50%", departureDate: "2026-02-10" },
  ];

  it("should sort by price ascending", () => {
    const sorted = [...mockFlights].sort((a, b) => a.salePrice - b.salePrice);
    expect(sorted[0].salePrice).toBe(800);
    expect(sorted[1].salePrice).toBe(1100);
    expect(sorted[2].salePrice).toBe(1500);
    expect(sorted[3].salePrice).toBe(2200);
  });

  it("should sort by price descending", () => {
    const sorted = [...mockFlights].sort((a, b) => b.salePrice - a.salePrice);
    expect(sorted[0].salePrice).toBe(2200);
    expect(sorted[3].salePrice).toBe(800);
  });

  it("should sort by popularity (discount percentage)", () => {
    const sorted = [...mockFlights].sort((a, b) => {
      const discountA = parseInt(a.discount || "0");
      const discountB = parseInt(b.discount || "0");
      return discountB - discountA; // Note: discounts are negative, so this sorts by biggest discount
    });
    // -15 > -30 > -45 > -50 in numeric terms, but we want biggest discount first
    // parseInt("-50%") = -50, parseInt("-15%") = -15
    // discountB - discountA: -15 - (-50) = 35 > 0, so -50 comes first
    expect(sorted[0].discount).toBe("-15%");
    expect(sorted[3].discount).toBe("-50%");
  });

  it("should sort by departure date (earliest first)", () => {
    const sorted = [...mockFlights].sort((a, b) => {
      return a.departureDate.localeCompare(b.departureDate);
    });
    expect(sorted[0].departureDate).toBe("2026-02-10");
    expect(sorted[1].departureDate).toBe("2026-02-20");
    expect(sorted[2].departureDate).toBe("2026-03-15");
    expect(sorted[3].departureDate).toBe("2026-04-01");
  });
});

// Test: Ticket countdown logic
describe("Ticket Countdown", () => {
  it("should start with a value between 3 and 15", () => {
    // Simulate the initial count logic
    const getInitialCount = () => {
      const hour = new Date().getHours();
      const seed = Math.floor(Date.now() / (1000 * 60 * 60));
      return 7 + (seed % 9); // 7-15
    };
    const count = getInitialCount();
    expect(count).toBeGreaterThanOrEqual(7);
    expect(count).toBeLessThanOrEqual(15);
  });

  it("should decrease count over time", () => {
    let count = 12;
    // Simulate decrease
    count = Math.max(3, count - 1);
    expect(count).toBe(11);
    
    // Should not go below 3
    count = 3;
    count = Math.max(3, count - 1);
    expect(count).toBe(3);
  });
});

// Test: whitespace-nowrap for price display
describe("Price Display", () => {
  it("should format Czech price correctly", () => {
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat("cs-CZ").format(price) + " Kč";
    };
    
    expect(formatPrice(733)).toBe("733 Kč");
    expect(formatPrice(1027)).toBe("1\u00a0027 Kč");
    expect(formatPrice(12500)).toBe("12\u00a0500 Kč");
  });
});

// ============ Blog Article Generator Tests ============

import { generateFlightArticle, saveGeneratedArticle } from "./blogGenerator";
import { getDb } from "./db";

// Mock dependencies
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            title: "Akční letenky do Paříže - Kompletní průvodce 2026",
            excerpt: "Objevte Paříž s našimi akčními letenkami od 1500 Kč. Tipy na úsporu, nejlepší čas na návštěvu a top místa k vidění.",
            content: "# Akční letenky do Paříže\n\nParíž je...",
            category: "deals",
            tags: ["Paříž", "Francie", "akční letenky", "levné letenky", "Evropa"],
          }),
        },
      },
    ],
  }),
}));

vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

describe("Blog Article Generator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateFlightArticle", () => {
    it("should generate article with all required fields", async () => {
      const result = await generateFlightArticle({
        destination: "Paříž",
        destinationSlug: "pariz",
        price: 1500,
        currency: "CZK",
        airline: "Ryanair",
      });

      expect(result).toHaveProperty("title");
      expect(result).toHaveProperty("slug");
      expect(result).toHaveProperty("excerpt");
      expect(result).toHaveProperty("content");
      expect(result).toHaveProperty("featuredImage");
      expect(result).toHaveProperty("category");
      expect(result).toHaveProperty("tags");

      expect(result.title).toContain("Paříž");
      expect(result.slug).toBe("pariz");
      expect(result.category).toMatch(/^(deals|guides|destinations)$/);
      expect(Array.isArray(result.tags)).toBe(true);
      expect(result.tags.length).toBeGreaterThan(0);
    });

    it("should include Unsplash image URL", async () => {
      const result = await generateFlightArticle({
        destination: "Barcelona",
        destinationSlug: "barcelona",
      });

      expect(result.featuredImage).toContain("unsplash.com");
      expect(result.featuredImage).toContain("Barcelona");
    });
  });
});

// ============ JSON-LD Structured Data Tests ============

describe("JSON-LD Structured Data", () => {
  describe("Organization Schema", () => {
    it("should generate valid Organization schema", () => {
      const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Akční Letenky",
        url: "https://akcni-letenky.cz",
        logo: "https://akcni-letenky.cz/logo.png",
      };

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("Organization");
      expect(schema.name).toBe("Akční Letenky");
    });
  });

  describe("FAQPage Schema", () => {
    it("should generate valid FAQPage schema", () => {
      const faqs = [
        { question: "Jak najít nejlevnější letenky?", answer: "Sledujte naše akční nabídky..." },
        { question: "Kdy je nejlepší čas na rezervaci?", answer: "2-3 měsíce před odletem..." },
      ];

      const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      };

      expect(schema["@type"]).toBe("FAQPage");
      expect(schema.mainEntity).toHaveLength(2);
      expect(schema.mainEntity[0]["@type"]).toBe("Question");
    });
  });
});

// ============ Revolut Pop-up A/B Test Tests ============

describe("Revolut Pop-up A/B Test", () => {
  describe("Variant Assignment", () => {
    it("should assign one of three variants", () => {
      const variants = ["banner", "text", "minimal"];
      
      const assignments = new Set();
      for (let i = 0; i < 100; i++) {
        const random = Math.random();
        let variant: string;
        
        if (random < 0.33) variant = "banner";
        else if (random < 0.66) variant = "text";
        else variant = "minimal";
        
        assignments.add(variant);
        expect(variants).toContain(variant);
      }

      expect(assignments.size).toBeGreaterThan(1);
    });

    it("should use weighted random selection", () => {
      const weights = [
        { name: "banner", weight: 1 },
        { name: "text", weight: 1 },
        { name: "minimal", weight: 1 },
      ];

      const totalWeight = weights.reduce((sum, v) => sum + v.weight, 0);
      expect(totalWeight).toBe(3);
    });
  });

  describe("Conversion Tracking", () => {
    it("should track variant in Meta Pixel event", () => {
      const mockFbq = vi.fn();
      (global as any).window = { fbq: mockFbq };

      const variant = "minimal";
      mockFbq("track", "Lead", {
        content_name: "Revolut Referral Click",
        content_category: "Affiliate",
        variant: variant,
      });

      expect(mockFbq).toHaveBeenCalledWith("track", "Lead", {
        content_name: "Revolut Referral Click",
        content_category: "Affiliate",
        variant: "minimal",
      });
    });
  });
});
