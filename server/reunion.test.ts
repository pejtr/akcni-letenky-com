import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

describe("Réunion Landing Page", () => {
  const pagePath = join(__dirname, "../client/src/pages/ReunionPage.tsx");

  it("should have ReunionPage component file", () => {
    expect(existsSync(pagePath)).toBe(true);
  });

  it("should contain key SEO elements", () => {
    const content = readFileSync(pagePath, "utf-8");
    // Title tag
    expect(content).toContain("Letenky na Réunion");
    // Metadata is managed by the shared SEO component.
    expect(content).toContain('import SEO from "@/components/SEO"');
    expect(content).toContain("description=");
  });

  it("should contain flight pricing information", () => {
    const content = readFileSync(pagePath, "utf-8");
    expect(content).toContain("1 790");
    expect(content).toContain("8 290");
    expect(content).toContain("Corsair");
    expect(content).toContain("Air France");
  });

  it("should contain affiliate link", () => {
    const content = readFileSync(pagePath, "utf-8");
    expect(content).toContain("pelikanDeepLink");
    expect(content).toContain("/cs/akcni-letenky/AT:RUN,S:PRI");
    expect(content).toContain("reunion");
    expect(content).toContain("RUN");
  });

  it("should contain destination highlights", () => {
    const content = readFileSync(pagePath, "utf-8");
    expect(content).toContain("Piton de la Fournaise");
    expect(content).toContain("laguna");
    expect(content).toContain("pralesy");
    expect(content).toContain("Kreolská");
  });

  it("should contain practical info section", () => {
    const content = readFileSync(pagePath, "utf-8");
    expect(content).toContain("Francouzština");
    expect(content).toContain("Euro");
    expect(content).toContain("Není potřeba");
    expect(content).toContain("Květen");
  });

  it("should contain CDN image URLs", () => {
    const content = readFileSync(pagePath, "utf-8");
    expect(content).toContain("files.manuscdn.com");
    // Should have multiple images
    const imageMatches = content.match(/files\.manuscdn\.com/g);
    expect(imageMatches).not.toBeNull();
    expect(imageMatches!.length).toBeGreaterThanOrEqual(6);
  });

  it("should contain CTA buttons", () => {
    const content = readFileSync(pagePath, "utf-8");
    expect(content).toContain("ZOBRAZIT LETENKY");
    expect(content).toContain("ZOBRAZIT TERMÍNY");
    expect(content).toContain("REZERVOVAT LETENKY");
  });

  it("should avoid artificial urgency elements", () => {
    const content = readFileSync(pagePath, "utf-8");
    expect(content).not.toContain("Akce končí za");
    expect(content).not.toContain("Zbývá posledních");
    expect(content).toContain("orientační");
  });

  it("should contain social proof", () => {
    const content = readFileSync(pagePath, "utf-8");
    expect(content).toContain("847 lidí");
    expect(content).toContain("60 000 členů");
  });

  it("should have route registered in App.tsx", () => {
    const appPath = join(__dirname, "../client/src/App.tsx");
    const appContent = readFileSync(appPath, "utf-8");
    expect(appContent).toContain("/reunion");
    expect(appContent).toContain("/letenky-reunion");
    expect(appContent).toContain("ReunionPage");
  });

  it("should contain Paris stopover tip", () => {
    const content = readFileSync(pagePath, "utf-8");
    expect(content).toContain("Paříží");
    expect(content).toContain("Eiffelovu věž");
  });

  it("should contain community links", () => {
    const content = readFileSync(pagePath, "utf-8");
    expect(content).toContain("facebook.com/groups/akcniletenky");
    expect(content).toContain("facebook.com/groups/tourdesvet");
    expect(content).toContain("whatsapp.com");
  });
});
