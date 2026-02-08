/**
 * Push Notification Service
 * 
 * Manages Web Push subscriptions and sends browser push notifications
 * for price drop alerts. Integrates with the existing price alert system.
 * 
 * Uses the Web Push API with VAPID authentication.
 */

import webPush from "web-push";
import { getDb } from "./db";
import { pushSubscriptions } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// ============ Configuration ============

function initWebPush() {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn("[PushNotifications] VAPID keys not configured, push notifications disabled");
    return false;
  }

  try {
    webPush.setVapidDetails(
      "mailto:info@akcni-letenky.com",
      vapidPublicKey,
      vapidPrivateKey
    );
    return true;
  } catch (err) {
    console.error("[PushNotifications] Failed to initialize VAPID:", err);
    return false;
  }
}

let isInitialized = false;

function ensureInitialized(): boolean {
  if (!isInitialized) {
    isInitialized = initWebPush();
  }
  return isInitialized;
}

// ============ Subscription Management ============

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Save or update a push subscription for a user/session
 */
export async function savePushSubscription(
  subscription: PushSubscriptionData,
  userId?: number | null,
  sessionId?: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    // Check if subscription already exists (by endpoint)
    const existing = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
      .limit(1);

    if (existing.length > 0) {
      // Update existing subscription
      await db
        .update(pushSubscriptions)
        .set({
          p256dhKey: subscription.keys.p256dh,
          authKey: subscription.keys.auth,
          userId: userId || existing[0].userId,
          sessionId: sessionId || existing[0].sessionId,
          isActive: 1,
        })
        .where(eq(pushSubscriptions.id, existing[0].id));
    } else {
      // Insert new subscription
      await db.insert(pushSubscriptions).values({
        endpoint: subscription.endpoint,
        p256dhKey: subscription.keys.p256dh,
        authKey: subscription.keys.auth,
        userId: userId || null,
        sessionId: sessionId || null,
        isActive: 1,
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error("[PushNotifications] Failed to save subscription:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Remove a push subscription (unsubscribe)
 */
export async function removePushSubscription(
  endpoint: string
): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) return { success: false };

  try {
    await db
      .update(pushSubscriptions)
      .set({ isActive: 0 })
      .where(eq(pushSubscriptions.endpoint, endpoint));
    return { success: true };
  } catch (err) {
    console.error("[PushNotifications] Failed to remove subscription:", err);
    return { success: false };
  }
}

/**
 * Get all active push subscriptions for a user
 */
export async function getUserPushSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(pushSubscriptions)
      .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.isActive, 1)));
  } catch (err) {
    console.error("[PushNotifications] Failed to get user subscriptions:", err);
    return [];
  }
}

/**
 * Get all active push subscriptions
 */
export async function getAllActivePushSubscriptions() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.isActive, 1));
  } catch (err) {
    console.error("[PushNotifications] Failed to get all subscriptions:", err);
    return [];
  }
}

// ============ Send Notifications ============

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  data?: Record<string, any>;
}

/**
 * Send a push notification to a specific subscription
 */
export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushNotificationPayload
): Promise<{ success: boolean; error?: string }> {
  if (!ensureInitialized()) {
    return { success: false, error: "Push notifications not configured" };
  }

  try {
    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/favicon.ico",
      badge: payload.badge || "/favicon.ico",
      url: payload.url || "/",
      tag: payload.tag || "price-alert",
      data: payload.data || {},
    });

    await webPush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      pushPayload
    );

    return { success: true };
  } catch (err: any) {
    // Handle expired/invalid subscriptions
    if (err.statusCode === 410 || err.statusCode === 404) {
      // Subscription expired, mark as inactive
      await removePushSubscription(subscription.endpoint);
      return { success: false, error: "Subscription expired" };
    }
    console.error("[PushNotifications] Send failed:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send a price drop push notification to a user
 */
export async function sendPriceDropPush(
  userId: number,
  data: {
    destinationName: string;
    destinationSlug: string;
    oldPrice: number;
    newPrice: number;
    dropPercent: number;
  }
): Promise<{ sent: number; failed: number }> {
  const subscriptions = await getUserPushSubscriptions(userId);
  let sent = 0;
  let failed = 0;

  const formatPrice = (p: number) => new Intl.NumberFormat("cs-CZ").format(p);
  const savings = data.oldPrice - data.newPrice;

  const payload: PushNotificationPayload = {
    title: `📉 ${data.destinationName} – ${formatPrice(data.newPrice)} Kč`,
    body: `Cena klesla o ${data.dropPercent}%! Ušetříte ${formatPrice(savings)} Kč. Klikněte pro zobrazení nabídky.`,
    icon: "/favicon.ico",
    url: `/destinace/${data.destinationSlug}`,
    tag: `price-drop-${data.destinationSlug}`,
    data: {
      type: "price_drop",
      destinationSlug: data.destinationSlug,
      newPrice: data.newPrice,
      dropPercent: data.dropPercent,
    },
  };

  for (const sub of subscriptions) {
    const result = await sendPushNotification(
      {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dhKey,
          auth: sub.authKey,
        },
      },
      payload
    );

    if (result.success) {
      sent++;
    } else {
      failed++;
    }
  }

  if (sent > 0) {
    console.log(`[PushNotifications] Sent ${sent} push notifications to user ${userId} for ${data.destinationName}`);
  }

  return { sent, failed };
}

/**
 * Send a push notification to all subscribers (e.g., for a general deal alert)
 */
export async function sendBroadcastPush(
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number }> {
  const subscriptions = await getAllActivePushSubscriptions();
  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    const result = await sendPushNotification(
      {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dhKey,
          auth: sub.authKey,
        },
      },
      payload
    );

    if (result.success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}

/**
 * Check if push notifications are configured
 */
export function isPushConfigured(): boolean {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

/**
 * Get push notification statistics
 */
export async function getPushStats(): Promise<{
  configured: boolean;
  totalSubscriptions: number;
  activeSubscriptions: number;
}> {
  const db = await getDb();
  const configured = isPushConfigured();

  if (!db) {
    return { configured, totalSubscriptions: 0, activeSubscriptions: 0 };
  }

  try {
    const allSubs = await db.select().from(pushSubscriptions);
    const activeSubs = allSubs.filter((s) => s.isActive === 1);

    return {
      configured,
      totalSubscriptions: allSubs.length,
      activeSubscriptions: activeSubs.length,
    };
  } catch {
    return { configured, totalSubscriptions: 0, activeSubscriptions: 0 };
  }
}
