import { describe, expect, it } from "vitest";
import {
  OMNI_NETWORK_CAMPAIGNS,
  buildOmniNetworkUrl,
  selectOmniNetworkCampaign,
} from "../client/src/lib/omniNetwork";

describe("OMNI NETWORK contextual ads v1", () => {
  it("selects owned travel inspiration for the homepage inspiration context", () => {
    const campaign = selectOmniNetworkCampaign({
      topic: "travel",
      intent: "inspiration",
      route: "/",
    });

    expect(campaign?.id).toBe("do-italie-travel-inspiration-v1");
    expect(campaign?.owner).toBe("owned_project");
    expect(campaign?.approved).toBe(true);
  });

  it("selects package travel campaign when requested", () => {
    const campaign = selectOmniNetworkCampaign(
      { topic: "travel", intent: "package", route: "/" },
      ["do-italie-travel-inspiration-v1"],
    );

    expect(campaign?.id).toBe("last-minute-package-v1");
  });

  it("does not return disabled or unapproved campaigns", () => {
    const eligible = OMNI_NETWORK_CAMPAIGNS.filter(
      (campaign) => campaign.enabled && campaign.approved,
    );

    expect(eligible.length).toBe(OMNI_NETWORK_CAMPAIGNS.length);
    expect(eligible.every((campaign) => campaign.href.startsWith("https://"))).toBe(true);
  });

  it("adds network attribution without changing the destination host", () => {
    const campaign = OMNI_NETWORK_CAMPAIGNS[0];
    const url = new URL(buildOmniNetworkUrl(campaign, "home_after_hero"));

    expect(url.hostname).toBe("do-italie.cz");
    expect(url.searchParams.get("utm_source")).toBe("akcni-letenky.com");
    expect(url.searchParams.get("utm_medium")).toBe("omni_network");
    expect(url.searchParams.get("utm_content")).toBe("home_after_hero");
  });

  it("keeps public ad disclosure explicit", () => {
    expect(
      OMNI_NETWORK_CAMPAIGNS.every((campaign) =>
        campaign.label.toLowerCase().includes("reklama"),
      ),
    ).toBe(true);
  });
});
