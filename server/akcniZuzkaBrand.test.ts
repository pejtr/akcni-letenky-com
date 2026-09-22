import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("Akční Zuzka public brand hierarchy", () => {
  it("uses Akční Zuzka as the public guide and retires KÁNĚ from homepage copy", () => {
    const home = fs.readFileSync("client/src/pages/Home.tsx", "utf8");
    expect(home).toContain("AKČNÍ ZUZKA · virtuální průvodkyně");
    expect(home).toContain("Akční Zuzka doporučuje");
    expect(home).not.toContain("KÁNĚ");
  });

  it("keeps OMNISOJKA internal and out of consumer homepage copy", () => {
    const home = fs.readFileSync("client/src/pages/Home.tsx", "utf8");
    expect(home).not.toContain("OMNISOJKA");
  });

  it("renders live deal facts in HTML instead of relying on the character image", () => {
    const home = fs.readFileSync("client/src/pages/Home.tsx", "utf8");
    expect(home).toContain("formatPrice(deals[0].salePrice)");
    expect(home).toContain('encodeURIComponent(deals[0].id)');
    expect(home).toContain("Cena a dostupnost se ověří u partnera");
  });

  it("keeps ZIPPY as a secondary delivery helper", () => {
    const home = fs.readFileSync("client/src/pages/Home.tsx", "utf8");
    expect(home).toContain("ZIPPY · pomocník Akční Zuzky");
    expect(home).toContain("ZIPPY DROP · od Akční Zuzky");
  });

  it("includes the generated character asset", () => {
    expect(fs.existsSync("client/public/brand/akcni-zuzka-promo.webp")).toBe(true);
  });
});
