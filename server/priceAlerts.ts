/**
 * Price Alerts System
 * 
 * Allows users to subscribe to price drop notifications for specific destinations.
 * Checks prices periodically and notifies users when prices drop below their threshold.
 * Supports email notifications via Resend integration.
 */

import { getDb } from "./db";
import { priceAlerts, priceHistory } from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { sendPriceDropEmail, logNotification } from "./emailService";

// ============ Price Alert CRUD ============

export async function createPriceAlert(data: {
  userId?: number;
  destination: string;
  destinationSlug: string;
  currentPrice: number;
  targetPrice?: number;
  priceDropPercent?: number;
  notifyEmail?: string;
  emailEnabled?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [
    eq(priceAlerts.destinationSlug, data.destinationSlug),
    eq(priceAlerts.isActive, 1),
  ];
  if (data.userId) {
    conditions.push(eq(priceAlerts.userId, data.userId));
  }

  const existing = await db
    .select()
    .from(priceAlerts)
    .where(and(...conditions))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(priceAlerts)
      .set({
        currentPrice: data.currentPrice,
        targetPrice: data.targetPrice || null,
        priceDropPercent: data.priceDropPercent || 10,
        notifyEmail: data.notifyEmail || existing[0].notifyEmail,
        emailEnabled: data.emailEnabled !== undefined ? (data.emailEnabled ? 1 : 0) : existing[0].emailEnabled,
      })
      .where(eq(priceAlerts.id, existing[0].id));
    return { id: existing[0].id, updated: true };
  }

  const result = await db.insert(priceAlerts).values({
    userId: data.userId || null,
    destinationName: data.destination,
    destinationSlug: data.destinationSlug,
    currentPrice: data.currentPrice,
    targetPrice: data.targetPrice || null,
    priceDropPercent: data.priceDropPercent || 10,
    notifyEmail: data.notifyEmail || null,
    emailEnabled: data.emailEnabled ? 1 : 0,
  });

  return { id: Number(result[0].insertId), updated: false };
}

export async function updatePriceAlertEmail(alertId: number, email: string | null, enabled: boolean) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(priceAlerts)
    .set({
      notifyEmail: email,
      emailEnabled: enabled ? 1 : 0,
    })
    .where(eq(priceAlerts.id, alertId));
  return true;
}

export async function getPriceAlertsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(priceAlerts)
    .where(eq(priceAlerts.userId, userId))
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

// ============ Price Check & Notification (with Email) ============

export async function checkPriceDropsAndNotify() {
  const db = await getDb();
  if (!db) return { checked: 0, notified: 0, emailsSent: 0, emailsFailed: 0 };

  const activeAlerts = await getActivePriceAlerts();
  let notified = 0;
  let emailsSent = 0;
  let emailsFailed = 0;

  for (const alert of activeAlerts) {
    const latestPrice = await getLatestPriceForDestination(alert.destinationSlug);
    if (!latestPrice) continue;

    const priceDrop = alert.currentPrice - latestPrice.price;
    const dropPercent = (priceDrop / alert.currentPrice) * 100;

    const shouldNotify =
      (alert.targetPrice && latestPrice.price <= alert.targetPrice) ||
      dropPercent >= (alert.priceDropPercent || 10);

    if (shouldNotify && priceDrop > 0) {
      // Don't notify more than once per day
      if (alert.lastAlertSentAt) {
        const hoursSinceLastNotification =
          (Date.now() - new Date(alert.lastAlertSentAt).getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastNotification < 24) continue;
      }

      // 1. Always send owner notification
      await notifyOwner({
        title: `🔔 Pokles ceny: ${alert.destinationName}`,
        content: `Cena letenky do ${alert.destinationName} klesla o ${dropPercent.toFixed(0)}%!\n\nPůvodní cena: ${alert.currentPrice} Kč\nNová cena: ${latestPrice.price} Kč\nÚspora: ${priceDrop} Kč`,
      });

      // 2. Send email notification if enabled and email is set
      if (alert.emailEnabled && alert.notifyEmail) {
        const emailResult = await sendPriceDropEmail({
          to: alert.notifyEmail,
          destinationName: alert.destinationName,
          destinationSlug: alert.destinationSlug,
          oldPrice: alert.currentPrice,
          newPrice: latestPrice.price,
          dropPercent: Math.round(dropPercent),
          targetPrice: alert.targetPrice,
          alertId: alert.id,
          userId: alert.userId,
        });

        if (emailResult.success) {
          emailsSent++;
        } else {
          emailsFailed++;
          console.warn(`[PriceAlerts] Email failed for alert ${alert.id}: ${emailResult.error}`);
        }
      } else {
        // Log as owner-only notification
        await logNotification({
          alertId: alert.id,
          userId: alert.userId,
          notifyEmail: null,
          destinationName: alert.destinationName,
          destinationSlug: alert.destinationSlug,
          oldPrice: alert.currentPrice,
          newPrice: latestPrice.price,
          dropPercent: Math.round(dropPercent),
          channel: "owner_notification",
          status: "sent",
        });
      }

      // Update alert record
      await db
        .update(priceAlerts)
        .set({
          lastCheckedAt: new Date(),
          lastAlertSentAt: new Date(),
          alertCount: sql`${priceAlerts.alertCount} + 1`,
        })
        .where(eq(priceAlerts.id, alert.id));

      notified++;
    } else {
      await db
        .update(priceAlerts)
        .set({ lastCheckedAt: new Date() })
        .where(eq(priceAlerts.id, alert.id));
    }
  }

  return { checked: activeAlerts.length, notified, emailsSent, emailsFailed };
}

// ============ Price Alert Stats ============

export async function getPriceAlertStats() {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, notified: 0, withEmail: 0 };

  const all = await db.select().from(priceAlerts);
  const active = all.filter((a) => a.isActive === 1);
  const totalNotifications = all.reduce(
    (sum, a) => sum + (a.alertCount || 0),
    0
  );
  const withEmail = all.filter((a) => a.notifyEmail && a.emailEnabled === 1).length;

  return {
    total: all.length,
    active: active.length,
    notified: totalNotifications,
    withEmail,
  };
}
