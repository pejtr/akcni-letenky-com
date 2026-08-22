import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("Footer and vacation filter UX", () => {
  it("shows a non-blocking loading transition while vacation filters refetch", () => {
    const content = readFileSync(join(__dirname, "../client/src/pages/Dovolene.tsx"), "utf-8");

    expect(content).toContain("isFetching");
    expect(content).toContain("transition-opacity duration-200");
    expect(content).toContain("animate-spin");
    expect(content).toContain("Aktualizuji nabídky");
  });

  it("keeps the Revolut link and adds an accessible travel-news form", () => {
    const content = readFileSync(join(__dirname, "../client/src/components/Footer.tsx"), "utf-8");

    expect(content).toContain("Revolut pro cestovatele");
    expect(content).toContain("FooterNewsletterSignup");
    expect(content).toContain("trpc.newsletter.subscribe.useMutation");
    expect(content).toContain("footer-travel-news-email");
    expect(content).toContain("Bez zbytečného spamu");
  });
});

