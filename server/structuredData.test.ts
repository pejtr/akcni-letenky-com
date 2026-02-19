import { describe, it, expect } from "vitest";
import { generateArticleSchema } from "../client/src/lib/structuredData";

describe("Article JSON-LD Structured Data", () => {
  const sampleArticle = {
    title: "Zanzibar: 10 tipů pro nezapomenutelnou dovolenou v ráji",
    description: "Plánujete dovolenou na Zanzibaru? Přečtěte si 10 praktických tipů pro cestu, nejlepší období, co vidět a jak ušetřit na letenky.",
    author: "Redakce Akční-Letenky.com",
    datePublished: "2026-02-18T00:00:00.000Z",
    dateModified: "2026-02-18T00:00:00.000Z",
    image: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b",
    url: "https://akcni-letenky.com/blog/10-tipu-pro-cestu-na-zanzibar",
  };

  describe("Schema Structure", () => {
    it("should generate valid JSON-LD with @context and @type", () => {
      const schema = generateArticleSchema(sampleArticle);

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("Article");
    });

    it("should include all required Article fields", () => {
      const schema = generateArticleSchema(sampleArticle);

      expect(schema).toHaveProperty("headline");
      expect(schema).toHaveProperty("description");
      expect(schema).toHaveProperty("image");
      expect(schema).toHaveProperty("author");
      expect(schema).toHaveProperty("publisher");
      expect(schema).toHaveProperty("datePublished");
      expect(schema).toHaveProperty("dateModified");
      expect(schema).toHaveProperty("mainEntityOfPage");
    });
  });

  describe("Required Fields Validation", () => {
    it("should have headline matching article title", () => {
      const schema = generateArticleSchema(sampleArticle);

      expect(schema.headline).toBe(sampleArticle.title);
      expect(schema.headline.length).toBeGreaterThan(0);
    });

    it("should have author as Organization with name", () => {
      const schema = generateArticleSchema(sampleArticle);

      expect(schema.author).toHaveProperty("@type", "Organization");
      expect(schema.author).toHaveProperty("name", sampleArticle.author);
    });

    it("should have datePublished in ISO 8601 format", () => {
      const schema = generateArticleSchema(sampleArticle);

      expect(schema.datePublished).toBe(sampleArticle.datePublished);
      expect(schema.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it("should have dateModified in ISO 8601 format", () => {
      const schema = generateArticleSchema(sampleArticle);

      expect(schema.dateModified).toBe(sampleArticle.dateModified);
      expect(schema.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it("should have valid image URL", () => {
      const schema = generateArticleSchema(sampleArticle);

      expect(schema.image).toBe(sampleArticle.image);
      expect(schema.image).toMatch(/^https?:\/\/.+/);
    });
  });

  describe("Publisher Information", () => {
    it("should have publisher as Organization", () => {
      const schema = generateArticleSchema(sampleArticle);

      expect(schema.publisher).toHaveProperty("@type", "Organization");
      expect(schema.publisher).toHaveProperty("name", "Akční Letenky");
    });

    it("should have publisher logo as ImageObject", () => {
      const schema = generateArticleSchema(sampleArticle);

      expect(schema.publisher.logo).toHaveProperty("@type", "ImageObject");
      expect(schema.publisher.logo).toHaveProperty("url");
      expect(schema.publisher.logo.url).toMatch(/^https?:\/\/.+/);
    });
  });

  describe("Main Entity Of Page", () => {
    it("should have mainEntityOfPage as WebPage with @id", () => {
      const schema = generateArticleSchema(sampleArticle);

      expect(schema.mainEntityOfPage).toHaveProperty("@type", "WebPage");
      expect(schema.mainEntityOfPage).toHaveProperty("@id", sampleArticle.url);
    });

    it("should have valid article URL", () => {
      const schema = generateArticleSchema(sampleArticle);

      expect(schema.mainEntityOfPage["@id"]).toMatch(/^https:\/\/akcni-letenky\.com\/blog\/.+/);
    });
  });

  describe("Top 5 Destination Articles", () => {
    const topDestinationArticles = [
      {
        title: "Zanzibar: 10 tipů pro nezapomenutelnou dovolenou v ráji",
        slug: "10-tipu-pro-cestu-na-zanzibar",
        author: "Redakce Akční-Letenky.com",
      },
      {
        title: "Island: Kompletní průvodce zemí ledu a ohně pro rok 2026",
        slug: "pruvodce-islandem-tipy-pro-cestovatele",
        author: "Redakce Akční-Letenky.com",
      },
      {
        title: "New York: Kompletní průvodce městem, které nikdy nespí",
        slug: "navstivte-new-york-kompletni-pruvodce",
        author: "Redakce Akční-Letenky.com",
      },
      {
        title: "Londýn: Kompletní průvodce královským městem pro rok 2026",
        slug: "londyn-kompletni-pruvodce-pro-navstevniky",
        author: "Redakce Akční-Letenky.com",
      },
      {
        title: "Paříž: Kompletní průvodce městem lásky a světel 2026",
        slug: "pariz-mesto-lasky-a-svetel-pruvodce",
        author: "Redakce Akční-Letenky.com",
      },
    ];

    it("should generate valid schema for all 5 destination articles", () => {
      topDestinationArticles.forEach((article) => {
        const schema = generateArticleSchema({
          title: article.title,
          description: "Test description",
          author: article.author,
          datePublished: "2026-02-18T00:00:00.000Z",
          dateModified: "2026-02-18T00:00:00.000Z",
          image: "https://example.com/image.jpg",
          url: `https://akcni-letenky.com/blog/${article.slug}`,
        });

        expect(schema["@type"]).toBe("Article");
        expect(schema.headline).toBe(article.title);
        expect(schema.author.name).toBe(article.author);
        expect(schema.mainEntityOfPage["@id"]).toContain(article.slug);
      });
    });

    it("should have consistent author for all destination articles", () => {
      topDestinationArticles.forEach((article) => {
        expect(article.author).toBe("Redakce Akční-Letenky.com");
      });
    });
  });

  describe("SEO Best Practices", () => {
    it("should have description between 50-160 characters", () => {
      const schema = generateArticleSchema(sampleArticle);

      expect(schema.description.length).toBeGreaterThanOrEqual(50);
      expect(schema.description.length).toBeLessThanOrEqual(160);
    });

    it("should have headline under 110 characters for Google", () => {
      const schema = generateArticleSchema(sampleArticle);

      expect(schema.headline.length).toBeLessThanOrEqual(110);
    });
  });
});
