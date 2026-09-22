import { describe, expect, it } from "vitest";
import { CTA_TESTS } from "../client/src/hooks/useCtaAbTest";

describe("homepage V2 truth and UX guards", () => {
  it("contains no fabricated countdown or scarcity copy in CTA experiments", () => {
    const serialized = JSON.stringify(CTA_TESTS);
    expect(serialized).not.toContain("COUNTDOWN");
    expect(serialized.toLowerCase()).not.toContain("jen pár míst");
    expect(serialized.toLowerCase()).not.toContain("akce končí");
  });

  it("keeps sticky CTA factual", () => {
    expect(CTA_TESTS.sticky_banner.variantA.text).toBe("Prohlédnout aktuální nabídky");
    expect(CTA_TESTS.sticky_banner.variantB.text).toBe("Nastavit hlídač cen");
  });
});
