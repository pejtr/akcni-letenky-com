/**
 * Price Check Cron Job
 * 
 * Automatically checks prices every 6 hours against user-set alert thresholds.
 * Records price history and sends notifications when price drops are detected.
 * Integrates with PelikanCache for real-time price data.
 */

import { pelikanCache } from "./pelikanCache";
import { recordPrice, checkPriceDropsAndNotify, getActivePriceAlerts } from "./priceAlerts";
import { notifyOwner } from "./_core/notification";
import type { FlightOffer, VacationOffer } from "./pelikanFeed";

const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
let checkInterval: NodeJS.Timeout | null = null;
let lastCheckResult: { checked: number; notified: number; recordedPrices: number; timestamp: Date } | null = null;

/**
 * Extract the lowest price for each destination from the Pelikan cache
 */
function extractDestinationPrices(
  offers: (FlightOffer | VacationOffer)[]
): Map<string, { destination: string; slug: string; price: number }> {
  const priceMap = new Map<string, { destination: string; slug: string; price: number }>();

  for (const offer of offers) {
    const destination = offer.title || "";
    // Create a slug from the destination name
    const slug = destination
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    if (!slug || !destination) continue;

    const price = typeof offer.price === "number" ? offer.price : parseFloat(String(offer.price));
    if (isNaN(price) || price <= 0) continue;

    const existing = priceMap.get(slug);
    if (!existing || price < existing.price) {
      priceMap.set(slug, { destination, slug, price });
    }
  }

  return priceMap;
}

/**
 * Run a single price check cycle:
 * 1. Fetch current prices from Pelikan cache
 * 2. Record prices in price_history table
 * 3. Check active alerts and send notifications for price drops
 */
export async function runPriceCheck(): Promise<{
  checked: number;
  notified: number;
  recordedPrices: number;
  timestamp: Date;
}> {
  const timestamp = new Date();
  console.log(`[PriceCheck] Starting price check at ${timestamp.toISOString()}`);

  let recordedPrices = 0;

  try {
    // Step 1: Get current prices from Pelikan cache
    const [flights, vacations] = await Promise.all([
      pelikanCache.getFlights(),
      pelikanCache.getVacations(),
    ]);

    const allOffers = [...flights, ...vacations] as (FlightOffer | VacationOffer)[];
    const destinationPrices = extractDestinationPrices(allOffers);

    console.log(`[PriceCheck] Found prices for ${destinationPrices.size} destinations`);

    // Step 2: Record prices in history
    const activeAlerts = await getActivePriceAlerts();
    const alertSlugs = new Set(activeAlerts.map((a) => a.destinationSlug));

    for (const [slug, data] of Array.from(destinationPrices)) {
      // Only record prices for destinations that have active alerts (to save DB space)
      if (alertSlugs.has(slug)) {
        try {
          await recordPrice({
            destination: data.destination,
            destinationSlug: slug,
            price: data.price,
            source: "pelikan_auto",
          });
          recordedPrices++;
        } catch (err) {
          console.error(`[PriceCheck] Failed to record price for ${slug}:`, err);
        }
      }
    }

    console.log(`[PriceCheck] Recorded ${recordedPrices} prices for tracked destinations`);

    // Step 3: Check alerts and notify
    const result = await checkPriceDropsAndNotify();

    const checkResult = {
      checked: result.checked,
      notified: result.notified,
      recordedPrices,
      timestamp,
    };

    lastCheckResult = checkResult;

    console.log(
      `[PriceCheck] Complete: ${result.checked} alerts checked, ${result.notified} notifications sent, ${recordedPrices} prices recorded`
    );

    // Send summary to owner if any notifications were sent
    if (result.notified > 0) {
      await notifyOwner({
        title: `📊 Hlídač cen: ${result.notified} upozornění odesláno`,
        content: `Automatická kontrola cen dokončena.\n\nZkontrolováno: ${result.checked} hlídačů\nOdesláno upozornění: ${result.notified}\nZaznamenáno cen: ${recordedPrices}\n\nČas: ${timestamp.toLocaleString("cs-CZ")}`,
      });
    }

    return checkResult;
  } catch (error) {
    console.error("[PriceCheck] Error during price check:", error);
    return { checked: 0, notified: 0, recordedPrices, timestamp };
  }
}

/**
 * Schedule the price check cron job to run every 6 hours
 */
export function schedulePriceCheckCron() {
  // Run first check after 5 minutes (give server time to warm up)
  const initialDelay = 5 * 60 * 1000;

  console.log(
    `[PriceCheck] Scheduling price check cron (every 6 hours, first run in ${Math.round(initialDelay / 1000 / 60)} minutes)`
  );

  setTimeout(() => {
    // Run first check
    runPriceCheck().catch((err) => {
      console.error("[PriceCheck] Initial check failed:", err);
    });

    // Schedule recurring checks every 6 hours
    checkInterval = setInterval(() => {
      runPriceCheck().catch((err) => {
        console.error("[PriceCheck] Scheduled check failed:", err);
      });
    }, CHECK_INTERVAL_MS);
  }, initialDelay);
}

/**
 * Get the last check result for monitoring
 */
export function getLastCheckResult() {
  return lastCheckResult;
}

/**
 * Stop the cron job (for cleanup)
 */
export function stopPriceCheckCron() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
    console.log("[PriceCheck] Cron job stopped");
  }
}
