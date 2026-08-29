import { PelikanProvider } from "../providers/PelikanProvider";
import { PelikanXmlFetcher } from "../providers/PelikanXmlFetcher";
import { PelikanXmlParser } from "../providers/PelikanXmlParser";
import { PelikanOfferNormalizer } from "../providers/PelikanOfferNormalizer";

async function runLiveDryRun() {
  console.log("=== PELIKAN LIVE FEED DRY RUN ===");
  const fetcher = new PelikanXmlFetcher();
  const parser = new PelikanXmlParser();
  const normalizer = new PelikanOfferNormalizer();

  const startTime = Date.now();
  console.log("Fetching live XML from https://www.pelikan.cz/gf3/pelijee-cz/calendars/xmlpromo ...");
  const xmlContent = await fetcher.fetchXml({
    url: "https://www.pelikan.cz/gf3/pelijee-cz/calendars/xmlpromo",
    timeoutMs: 30000,
  });
  const fetchDuration = Date.now() - startTime;
  console.log(`Fetched ${xmlContent.length} bytes in ${fetchDuration}ms`);

  const parseStartTime = Date.now();
  const rawItems = parser.parse(xmlContent);
  const parseDuration = Date.now() - parseStartTime;

  const normalizeStartTime = Date.now();
  const normalized = normalizer.normalize(rawItems, Date.now());
  const normalizeDuration = Date.now() - normalizeStartTime;

  const totalDuration = Date.now() - startTime;

  // Analysis
  const received = rawItems.length;
  const valid = normalized.length;
  const invalid = received - valid;

  // Check duplicates by naturalKey
  const seenKeys = new Set<string>();
  let duplicates = 0;
  for (const item of normalized) {
    if (seenKeys.has(item.naturalKey)) {
      duplicates++;
    } else {
      seenKeys.add(item.naturalKey);
    }
  }

  // Check currencies
  const currencies = Array.from(new Set(normalized.map((n) => n.currency)));

  // Check deeplink hostnames
  const hostnames = new Set<string>();
  let unresolvedDeeplinks = 0;
  for (const item of normalized) {
    try {
      const url = new URL(item.deeplink);
      hostnames.add(url.hostname.toLowerCase());
    } catch {
      unresolvedDeeplinks++;
    }
  }

  // Sample top 5 offers for verification
  const sample = normalized.slice(0, 5).map((o) => ({
    id: o.externalOfferId,
    route: `${o.origin} -> ${o.destination}`,
    price: `${o.price} ${o.currency}`,
    airline: o.airline,
    deeplink: o.deeplink,
  }));

  const report = {
    received,
    valid,
    invalid,
    duplicate: duplicates,
    unresolved: unresolvedDeeplinks,
    currencies,
    observedDeeplinkHostnames: Array.from(hostnames),
    durations: {
      fetchDurationMs: fetchDuration,
      parseDurationMs: parseDuration,
      normalizeDurationMs: normalizeDuration,
      totalDurationMs: totalDuration,
    },
    sample,
  };

  console.log("\n=== DRY RUN REPORT JSON ===");
  console.log(JSON.stringify(report, null, 2));
}

runLiveDryRun().catch((err) => {
  console.error("Dry run failed:", err);
  process.exit(1);
});
