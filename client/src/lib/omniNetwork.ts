export type OmniNetworkTopic = "travel" | "business" | "wellbeing";
export type OmniNetworkIntent = "inspiration" | "flight" | "package" | "planning";
export type OmniNetworkOwner = "owned_project" | "affiliate_partner";

export interface OmniNetworkContext {
  topic: OmniNetworkTopic;
  intent?: OmniNetworkIntent;
  route?: string;
}

export interface OmniNetworkCampaign {
  id: string;
  owner: OmniNetworkOwner;
  project: string;
  label: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  image?: string;
  topics: OmniNetworkTopic[];
  intents: OmniNetworkIntent[];
  routes?: string[];
  enabled: boolean;
  approved: boolean;
  campaign: string;
}

export const OMNI_NETWORK_CAMPAIGNS: OmniNetworkCampaign[] = [
  {
    id: "do-italie-travel-inspiration-v1",
    owner: "owned_project",
    project: "Do-Italie.cz",
    label: "Reklama · náš projekt",
    title: "Itálie začíná inspirací.",
    description:
      "Průvodci, místa a tipy pro cestu po Itálii. Pokračujte na našem specializovaném projektu Do-Italie.cz.",
    cta: "Objevit Itálii",
    href: "https://do-italie.cz/",
    image: "/featured-rome.webp",
    topics: ["travel"],
    intents: ["inspiration", "planning", "flight"],
    routes: ["/", "/letenky", "/tipy-pro-cestovatele"],
    enabled: true,
    approved: true,
    campaign: "owned_travel_do_italie",
  },
  {
    id: "last-minute-package-v1",
    owner: "owned_project",
    project: "LastMinuteDovolene.cz",
    label: "Reklama · náš projekt",
    title: "Letenka nestačí? Podívejte se i na celý pobyt.",
    description:
      "Když hledáte spíš dovolenou než samotnou letenku, pokračujte na náš specializovaný projekt LastMinuteDovolene.cz.",
    cta: "Prohlédnout dovolené",
    href: "https://www.lastminutedovolene.cz/",
    image: "/dest-bali.webp",
    topics: ["travel"],
    intents: ["package"],
    routes: ["/", "/dovolene"],
    enabled: true,
    approved: true,
    campaign: "owned_travel_lastminute",
  },
];

export function selectOmniNetworkCampaign(
  context: OmniNetworkContext,
  excludeIds: string[] = [],
): OmniNetworkCampaign | null {
  const candidates = OMNI_NETWORK_CAMPAIGNS
    .filter(
      (campaign) =>
        campaign.enabled &&
        campaign.approved &&
        !excludeIds.includes(campaign.id) &&
        campaign.topics.includes(context.topic),
    )
    .map((campaign) => {
      let score = 10;

      if (context.intent && campaign.intents.includes(context.intent)) score += 10;
      if (context.route && campaign.routes?.includes(context.route)) score += 5;
      if (campaign.owner === "owned_project") score += 2;

      return { campaign, score };
    })
    .sort((a, b) => b.score - a.score || a.campaign.id.localeCompare(b.campaign.id));

  return candidates[0]?.campaign ?? null;
}

export function buildOmniNetworkUrl(
  campaign: OmniNetworkCampaign,
  placement: string,
): string {
  const url = new URL(campaign.href);
  url.searchParams.set("utm_source", "akcni-letenky.com");
  url.searchParams.set("utm_medium", "omni_network");
  url.searchParams.set("utm_campaign", campaign.campaign);
  url.searchParams.set("utm_content", placement);
  return url.toString();
}
