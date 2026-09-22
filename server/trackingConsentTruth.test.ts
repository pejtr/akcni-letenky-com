import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("tracking consent truth gate", () => {
  it("does not fire LeadOS from static HTML before consent", () => {
    const html = fs.readFileSync("client/index.html", "utf8");
    expect(html).not.toContain("leados.cz/api/ingest");
    expect(html).not.toContain("maximum-scale=1");
  });

  it("renders the consent manager in the application shell", () => {
    const app = fs.readFileSync("client/src/App.tsx", "utf8");
    expect(app).toContain("<GdprConsentBanner />");
  });

  it("gates Meta and LeadOS tracking on explicit preferences", () => {
    const meta = fs.readFileSync("client/src/components/MetaPixel.tsx", "utf8");
    const leadOS = fs.readFileSync("client/src/lib/leadosTracking.ts", "utf8");
    expect(meta).toContain("hasMarketingConsent");
    expect(leadOS).toContain("hasAnalyticsConsent");
  });

  it("starts optional consent categories disabled for new visitors", () => {
    const banner = fs.readFileSync("client/src/components/GdprConsentBanner.tsx", "utf8");
    expect(banner).toContain("initial?.analytics ?? false");
    expect(banner).toContain("initial?.marketing ?? false");
  });
});
