import { getDb } from "../db";
import { 
  flightProviderOffers, 
  flightProviderSyncRuns, 
  flightOfferPriceHistory, 
  flightProviderSyncLocks,
  InsertFlightProviderOffer, 
  InsertFlightProviderSyncRun, 
  InsertFlightOfferPriceHistory 
} from "../../drizzle/schema";
import { PelikanProvider } from "../providers/PelikanProvider";
import { FlightOfferProvider, NormalizedFlightOffer } from "../providers/types";
import { eq, and, ne, inArray, notInArray, sql } from "drizzle-orm";

export class FlightDealEngine {
  private providers: FlightOfferProvider[] = [];
  private instanceId = `inst_${process.pid}_${Math.random().toString(36).substring(2, 9)}`;

  constructor() {
    this.providers.push(new PelikanProvider());
  }

  /**
   * Distributed Lease Lock mechanism:
   * Ensures multiple application instances do not run sync for the same provider concurrently.
   * Auto-recovers after crash when leaseExpiresAt < NOW().
   */
  async acquireLock(providerKey: string, leaseDurationSec = 300): Promise<boolean> {
    const db = await getDb();
    if (!db) return true; // allow single-instance dev when DB is mocked

    try {
      const now = new Date();
      const expires = new Date(now.getTime() + leaseDurationSec * 1000);

      const rows = await db
        .select()
        .from(flightProviderSyncLocks)
        .where(eq(flightProviderSyncLocks.provider, providerKey))
        .limit(1);
      const existing = rows[0];

      if (!existing) {
        await db.insert(flightProviderSyncLocks).values({
          provider: providerKey,
          lockedBy: this.instanceId,
          lockedAt: now,
          leaseExpiresAt: expires,
        });
        return true;
      }

      // Check if lock expired (crash recovery)
      if (existing.leaseExpiresAt.getTime() < now.getTime()) {
        await db.update(flightProviderSyncLocks).set({
          lockedBy: this.instanceId,
          lockedAt: now,
          leaseExpiresAt: expires,
        }).where(eq(flightProviderSyncLocks.provider, providerKey));
        return true;
      }

      // Already locked by this instance
      if (existing.lockedBy === this.instanceId) {
        await db.update(flightProviderSyncLocks).set({
          leaseExpiresAt: expires,
        }).where(eq(flightProviderSyncLocks.provider, providerKey));
        return true;
      }

      // Active lock held by another instance
      return false;
    } catch (err) {
      console.warn("[FlightDealEngine] Lease lock check exception:", err);
      return true; // fail-open for resilience if lock table query fails
    }
  }

  async releaseLock(providerKey: string): Promise<void> {
    const db = await getDb();
    if (!db) return;
    try {
      await db.delete(flightProviderSyncLocks).where(
        and(
          eq(flightProviderSyncLocks.provider, providerKey),
          eq(flightProviderSyncLocks.lockedBy, this.instanceId)
        )
      );
    } catch (err) {
      console.warn("[FlightDealEngine] Lock release exception:", err);
    }
  }

  /**
   * Run synchronization for all providers.
   * This should only be called from a background worker/cron.
   */
  async syncAll() {
    for (const provider of this.providers) {
      await this.syncProvider(provider);
    }
  }

  async syncProvider(provider: FlightOfferProvider) {
    const lockAcquired = await this.acquireLock(provider.key, 300);
    if (!lockAcquired) {
      console.log(`[FlightDealEngine] Sync for provider '${provider.key}' is currently locked by another active instance. Skipping.`);
      return;
    }

    const db = await getDb();
    if (!db) {
      console.warn("DB not available, skipping sync");
      await this.releaseLock(provider.key);
      return;
    }

    const syncRun: InsertFlightProviderSyncRun = {
      provider: provider.key,
      startedAt: new Date(),
    };

    const runResult = await db.insert(flightProviderSyncRuns).values(syncRun).$returningId();
    const runId = runResult[0]?.id;

    if (!runId) {
       console.error("Failed to create sync run record.");
       await this.releaseLock(provider.key);
       return;
    }

    try {
      const snapshot = await provider.fetch();
      const normalizedOffers = await provider.normalize(snapshot);

      let itemsInserted = 0;
      let itemsUpdated = 0;
      let itemsUnchanged = 0;

      // Ensure we have offers
      if (normalizedOffers.length === 0) {
        throw new Error("Provider returned 0 offers. Aborting sync to prevent false stale marking.");
      }

      // Track the keys we saw in this run
      const seenKeys = new Set<string>();

      for (const offer of normalizedOffers) {
        if (!offer.naturalKey) continue;
        seenKeys.add(offer.naturalKey);

        const offerRows = await db
          .select()
          .from(flightProviderOffers)
          .where(eq(flightProviderOffers.id, offer.naturalKey))
          .limit(1);
        const existingOffer = offerRows[0];

        const now = new Date();
        const departureDate = offer.departureDate ? new Date(offer.departureDate) : null;
        const returnDate = offer.returnDate ? new Date(offer.returnDate) : null;
        const sourceUpdatedAt = offer.sourceUpdatedAt ? new Date(offer.sourceUpdatedAt) : null;

        if (!existingOffer) {
          // INSERT
          await db.insert(flightProviderOffers).values({
            id: offer.naturalKey,
            provider: offer.provider,
            externalOfferId: offer.externalOfferId,
            origin: offer.origin,
            destination: offer.destination,
            departureDate,
            returnDate,
            price: offer.price,
            currency: offer.currency,
            deeplink: offer.deeplink,
            sourceUpdatedAt,
            fetchedAt: now,
            firstSeenAt: now,
            lastSeenAt: now,
            status: "active",
            rawPayloadHash: offer.rawPayloadHash,
            airline: offer.airline
          });
          
          await db.insert(flightOfferPriceHistory).values({
            offerId: offer.naturalKey,
            price: offer.price,
            currency: offer.currency,
            observedAt: now,
            syncRunId: runId
          });

          itemsInserted++;
        } else {
          // Check if payload changed
          if (existingOffer.rawPayloadHash !== offer.rawPayloadHash) {
            // UPDATE
            await db.update(flightProviderOffers).set({
              price: offer.price,
              currency: offer.currency,
              deeplink: offer.deeplink,
              sourceUpdatedAt,
              fetchedAt: now,
              lastSeenAt: now,
              status: "active",
              rawPayloadHash: offer.rawPayloadHash,
            }).where(eq(flightProviderOffers.id, offer.naturalKey));

            // Record price history only if price/currency changed
            if (existingOffer.price !== offer.price || existingOffer.currency !== offer.currency) {
              await db.insert(flightOfferPriceHistory).values({
                offerId: offer.naturalKey,
                price: offer.price,
                currency: offer.currency,
                observedAt: now,
                syncRunId: runId
              });
            }
            itemsUpdated++;
          } else {
            // UNCHANGED - just update lastSeenAt and fetchedAt
            await db.update(flightProviderOffers).set({
              fetchedAt: now,
              lastSeenAt: now,
              status: "active"
            }).where(eq(flightProviderOffers.id, offer.naturalKey));
            itemsUnchanged++;
          }
        }
      }

      // Mark unseen offers for this provider as 'stale'
      // Only do this if the fetch was completely successful
      if (seenKeys.size > 0) {
        await db.update(flightProviderOffers).set({
          status: "stale"
        }).where(
          and(
            eq(flightProviderOffers.provider, provider.key),
            notInArray(flightProviderOffers.id, Array.from(seenKeys)),
            eq(flightProviderOffers.status, "active")
          )
        );
      }

      await db.update(flightProviderSyncRuns).set({
        finishedAt: new Date(),
        httpStatus: 200,
        itemsReceived: snapshot.rawItems.length,
        itemsValid: normalizedOffers.length,
        itemsInserted,
        itemsUpdated,
        itemsUnchanged,
      }).where(eq(flightProviderSyncRuns.id, runId));

    } catch (error: any) {
      console.error(`Sync failed for provider ${provider.key}:`, error);
      await db.update(flightProviderSyncRuns).set({
        finishedAt: new Date(),
        error: error.message || String(error)
      }).where(eq(flightProviderSyncRuns.id, runId));
    } finally {
      await this.releaseLock(provider.key);
    }
  }
}
