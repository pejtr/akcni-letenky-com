import { FlightDealEngine } from "./services/FlightDealEngine";

// Flag to prevent overlapping syncs
let isSyncing = false;

export function scheduleFlightDealSync() {
  console.log("[FlightDealCron] Scheduling background sync every 15 minutes...");
  
  const engine = new FlightDealEngine();

  // Run immediately on boot
  runSync(engine);

  // Then every 15 minutes
  setInterval(() => {
    runSync(engine);
  }, 15 * 60 * 1000);
}

async function runSync(engine: FlightDealEngine) {
  if (isSyncing) {
    console.log("[FlightDealCron] Sync already in progress, skipping.");
    return;
  }

  isSyncing = true;
  try {
    console.log(`[FlightDealCron] Starting provider sync at ${new Date().toISOString()}`);
    await engine.syncAll();
    console.log(`[FlightDealCron] Finished provider sync at ${new Date().toISOString()}`);
  } catch (err) {
    console.error("[FlightDealCron] Sync failed:", err);
  } finally {
    isSyncing = false;
  }
}
