import { afterEach, describe, expect, it } from "vitest";
import { pelikanAffiliateUrl, pelikanDeepLink } from "../shared/affiliateLinks";

const originalTemplate = process.env.PELIKAN_DEEPLINK_TEMPLATE;

afterEach(() => {
  if (originalTemplate === undefined) {
    delete process.env.PELIKAN_DEEPLINK_TEMPLATE;
  } else {
    process.env.PELIKAN_DEEPLINK_TEMPLATE = originalTemplate;
  }
});

describe("Pelikan affiliate links", () => {
  it("normalizes Pelikan URLs and adds affiliate tracking", () => {
    const result = pelikanAffiliateUrl(
      "https://pelikan.cz//cs/pobyt/maledivy-levna-dovolena?foo=bar&a_aid=old",
      {
        campaign: "maledivy_primary",
        channel: "curated_pelikan",
        content: "maledivy-levna-dovolena",
      }
    );

    const url = new URL(result);

    expect(url.protocol).toBe("https:");
    expect(url.hostname).toBe("www.pelikan.cz");
    expect(url.pathname).toBe("/cs/pobyt/maledivy-levna-dovolena");
    expect(url.searchParams.get("foo")).toBe("bar");
    expect(url.searchParams.get("a_aid")).toBe("levne-letenky");
    expect(url.searchParams.get("utm_source")).toBe("akcni-letenky");
    expect(url.searchParams.get("utm_medium")).toBe("affiliate");
    expect(url.searchParams.get("utm_campaign")).toBe("maledivy_primary");
    expect(url.searchParams.get("utm_channel")).toBe("curated_pelikan");
    expect(url.searchParams.get("utm_content")).toBe("maledivy-levna-dovolena");
  });

  it("falls back to direct affiliate URL when no deeplink template is configured", () => {
    delete process.env.PELIKAN_DEEPLINK_TEMPLATE;

    const result = pelikanDeepLink("/cs/akcni-letenky", {
      campaign: "hero-search",
      channel: "homepage",
      content: "tenerife",
    });

    const url = new URL(result);

    expect(url.hostname).toBe("www.pelikan.cz");
    expect(url.searchParams.get("a_aid")).toBe("levne-letenky");
    expect(url.searchParams.get("utm_campaign")).toBe("hero-search");
    expect(url.searchParams.get("utm_channel")).toBe("homepage");
    expect(url.searchParams.get("utm_content")).toBe("tenerife");
  });

  it("uses the direct Pelikan deeplink contract with full tracking parameters", () => {
    delete process.env.PELIKAN_DEEPLINK_TEMPLATE;

    const result = pelikanDeepLink("/cs/pobyty", {
      campaign: "top-destinations",
      channel: "homepage",
      content: "maledivy",
    });

    const url = new URL(result);

    expect(url.hostname).toBe("www.pelikan.cz");
    expect(url.pathname).toBe("/cs/pobyty");
    expect(url.searchParams.get("a_aid")).toBe("levne-letenky");
    expect(url.searchParams.get("utm_campaign")).toBe("top-destinations");
    expect(url.searchParams.get("utm_channel")).toBe("homepage");
    expect(url.searchParams.get("utm_content")).toBe("maledivy");
  });
});
