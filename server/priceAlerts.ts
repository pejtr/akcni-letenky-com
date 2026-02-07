/**
 * Price Alerts System
 * 
 * Allows users to subscribe to price drop notifications for specific destinations.
 * Checks prices periodically and notifies users when prices drop below their threshold.
 */

import { getDb } from "./db";
import { priceAlerts, priceHistory } from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

// ============ Price Alert CRUD ============

export async function createPriceAlert(data: {
  email: string;
  destination: string;
  destinationSlug: string;
  currentPrice: number;
  targetPrice?: number;
  alertThreshold?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check for existing alert for same email + destination
  const existing = await db
    .select()
    .from(priceAlerts)
    .where(
      and(
        eq(priceAlerts.email, data.email),
        eq(priceAlerts.destinationSlug, data.destinationSlug),
        eq(priceAlerts.isActive, 1)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing alert
    await db
      .update(priceAlerts)
      .set({
        currentPrice: data.currentPrice,
        targetPrice: data.targetPrice || null,
        alertThreshold: data.alertThreshold || 10,
      })
      .where(eq(priceAlerts.id, existing[0].id));
    return { id: existing[0].id, updated: true };
  }

  const result = await db.insert(priceAlerts).values({
    email: data.email,
    destination: data.destination,
    destinationSlug: data.destinationSlug,
    currentPrice: data.currentPrice,
    targetPrice: data.targetPrice || null,
    alertThreshold: data.alertThreshold || 10,
  });

  return { id: Number(result[0].insertId), updated: false };
}

export async function getPriceAlertsByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(priceAlerts)
    .where(eq(priceAlerts.email, email))
    .orderBy(desc(priceAlerts.createdAt));
}

export async function getActivePriceAlerts() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(priceAlerts)
    .where(eq(priceAlerts.isActive, 1));
}

export async function deactivatePriceAlert(id: number) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(priceAlerts)
    .set({ isActive: 0 })
    .where(eq(priceAlerts.id, id));
  return true;
}

export async function deletePriceAlert(id: number) {
  const db = await getDb();
  if (!db) return false;

  await db.delete(priceAlerts).where(eq(priceAlerts.id, id));
  return true;
}

// ============ Price History ============

export async function recordPrice(data: {
  destination: string;
  destinationSlug: string;
  price: number;
  source?: string;
}) {
  const db = await getDb();
  if (!db) return;

  await db.insert(priceHistory).values({
    destination: data.destination,
    destinationSlug: data.destinationSlug,
    price: data.price,
    source: data.source || "pelikan",
  });
}

export async function getPriceHistoryForDestination(
  destinationSlug: string,
  limit = 30
) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(priceHistory)
    .where(eq(priceHistory.destinationSlug, destinationSlug))
    .orderBy(desc(priceHistory.recordedAt))
    .limit(limit);
}

export async function getLatestPriceForDestination(destinationSlug: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(priceHistory)
    .where(eq(priceHistory.destinationSlug, destinationSlug))
    .orderBy(desc(priceHistory.recordedAt))
    .limit(1);

  return result[0] || null;
}

// ============ Price Check & Notification ============

export async function checkPriceDropsAndNotify() {
  const db = await getDb();
  if (!db) return { checked: 0, notified: 0 };

  const activeAlerts = await getActivePriceAlerts();
  let notified = 0;

  for (const alert of activeAlerts) {
    const latestPrice = await getLatestPriceForDestination(alert.destinationSlug);
    if (!latestPrice) continue;

    const priceDrop = alert.currentPrice - latestPrice.price;
    const dropPercent = (priceDrop / alert.currentPrice) * 100;

    // Check if price dropped enough
    const shouldNotify =
      (alert.targetPrice && latestPrice.price <= alert.targetPrice) ||
      dropPercent >= (alert.alertThreshold || 10);

    if (shouldNotify && priceDrop > 0) {
      // Don't notify more than once per day
      if (alert.lastNotifiedAt) {
        const hoursSinceLastNotification =
          (Date.now() - new Date(alert.lastNotifiedAt).getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastNotification < 24) continue;
      }

      // Send notification to owner (who can forward to user)
      await notifyOwner({
        title: `🔔 Pokles ceny: ${alert.destination}`,
        content: `Cena letenky do ${alert.destination} klesla o ${dropPercent.toFixed(0)}%!\n\nPůvodní cena: ${alert.currentPrice} Kč\nNová cena: ${latestPrice.price} Kč\nÚspora: ${priceDrop} Kč\n\nEmail uživatele: ${alert.email}`,
      });

      // Update alert record
      await db
        .update(priceAlerts)
        .set({
          lastCheckedPrice: latestPrice.price,
          lastNotifiedAt: new Date(),
          notificationCount: sql`${priceAlerts.notificationCount} + 1`,
        })
        .where(eq(priceAlerts.id, alert.id));

      notified++;
    } else {
      // Update last checked price
      await db
        .update(priceAlerts)
        .set({ lastCheckedPrice: latestPrice.price })
        .where(eq(priceAlerts.id, alert.id));
    }
  }

  return { checked: activeAlerts.length, notified };
}

// ============ Price Alert Stats ============

export async function getPriceAlertStats() {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, notified: 0 };

  const all = await db.select().from(priceAlerts);
  const active = all.filter((a) => a.isActive === 1);
  const totalNotifications = all.reduce(
    (sum, a) => sum + (a.notificationCount || 0),
    0
  );

  return {
    total: all.length,
    active: active.length,
    notified: totalNotifications,
  };
}
