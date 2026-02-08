/**
 * Push Notification Service
 * 
 * Manages Web Push subscriptions and sends browser push notifications
 * for price drop alerts, news, deals, and custom messages.
 * Supports user category preferences and A/B testing.
 * 
 * Uses the Web Push API with VAPID authentication.
 */

import webPush from "web-push";
import { getDb } from "./db";
import { pushSubscriptions, pushAbTests } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

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

// ============ Category Types ============

export type NotificationCategory = "price_drop" | "news" | "deal" | "custom";

export const ALL_CATEGORIES: NotificationCategory[] = ["price_drop", "news", "deal", "custom"];

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  price_drop: "Poklesy cen",
  news: "Novinky",
  deal: "Akční nabídky",
  custom: "Ostatní",
};

// ============ Subscription Management ============

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

function parsePreferences(prefsJson: string | null): NotificationCategory[] {
  if (!prefsJson) return [...ALL_CATEGORIES]; // Default: all enabled
  try {
    const parsed = JSON.parse(prefsJson);
    if (Array.isArray(parsed)) return parsed.filter((c: string) => ALL_CATEGORIES.includes(c as any));
  } catch {}
  return [...ALL_CATEGORIES];
}

/**
 * Save or update a push subscription for a user/session
 */
export async function savePushSubscription(
  subscription: PushSubscriptionData,
  userId?: number | null,
  sessionId?: string,
  preferences?: NotificationCategory[]
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    const existing = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
      .limit(1);

    const prefsJson = preferences ? JSON.stringify(preferences) : null;

    if (existing.length > 0) {
      await db
        .update(pushSubscriptions)
        .set({
          p256dhKey: subscription.keys.p256dh,
          authKey: subscription.keys.auth,
          userId: userId || existing[0].userId,
          sessionId: sessionId || existing[0].sessionId,
          isActive: 1,
          ...(prefsJson ? { notificationPreferences: prefsJson } : {}),
        })
        .where(eq(pushSubscriptions.id, existing[0].id));
    } else {
      await db.insert(pushSubscriptions).values({
        endpoint: subscription.endpoint,
        p256dhKey: subscription.keys.p256dh,
        authKey: subscription.keys.auth,
        userId: userId || null,
        sessionId: sessionId || null,
        isActive: 1,
        notificationPreferences: prefsJson || JSON.stringify(ALL_CATEGORIES),
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error("[PushNotifications] Failed to save subscription:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Update notification preferences for a subscription by endpoint
 */
export async function updateNotificationPreferences(
  endpoint: string,
  preferences: NotificationCategory[]
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    await db
      .update(pushSubscriptions)
      .set({ notificationPreferences: JSON.stringify(preferences) })
      .where(eq(pushSubscriptions.endpoint, endpoint));
    return { success: true };
  } catch (err: any) {
    console.error("[PushNotifications] Failed to update preferences:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Get notification preferences for a subscription by endpoint
 */
export async function getNotificationPreferences(
  endpoint: string
): Promise<NotificationCategory[]> {
  const db = await getDb();
  if (!db) return [...ALL_CATEGORIES];

  try {
    const result = await db
      .select({ notificationPreferences: pushSubscriptions.notificationPreferences })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint))
      .limit(1);

    if (result.length === 0) return [...ALL_CATEGORIES];
    return parsePreferences(result[0].notificationPreferences);
  } catch {
    return [...ALL_CATEGORIES];
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
 * Get all active push subscriptions, optionally filtered by category preference
 */
export async function getAllActivePushSubscriptions(category?: NotificationCategory) {
  const db = await getDb();
  if (!db) return [];

  try {
    const allSubs = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.isActive, 1));

    if (!category) return allSubs;

    // Filter by category preference
    return allSubs.filter((sub) => {
      const prefs = parsePreferences(sub.notificationPreferences);
      return prefs.includes(category);
    });
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
    if (err.statusCode === 410 || err.statusCode === 404) {
      await removePushSubscription(subscription.endpoint);
      return { success: false, error: "Subscription expired" };
    }
    console.error("[PushNotifications] Send failed:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send a price drop push notification to a user (respects preferences)
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
    // Check if user wants price_drop notifications
    const prefs = parsePreferences(sub.notificationPreferences);
    if (!prefs.includes("price_drop")) continue;

    const result = await sendPushNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dhKey, auth: sub.authKey },
      },
      payload
    );

    if (result.success) sent++;
    else failed++;
  }

  if (sent > 0) {
    console.log(`[PushNotifications] Sent ${sent} push notifications to user ${userId} for ${data.destinationName}`);
  }

  return { sent, failed };
}

/**
 * Send a push notification to all subscribers (filtered by category preferences)
 */
export async function sendBroadcastPush(
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number }> {
  const category = (payload.data?.type as NotificationCategory) || "custom";
  const subscriptions = await getAllActivePushSubscriptions(category);
  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    const result = await sendPushNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dhKey, auth: sub.authKey },
      },
      payload
    );

    if (result.success) sent++;
    else failed++;
  }

  return { sent, failed };
}

// ============ A/B Testing ============

export interface PushAbTestInput {
  testName: string;
  variantATitle: string;
  variantABody: string;
  variantBTitle: string;
  variantBBody: string;
  category?: NotificationCategory;
  url?: string;
}

/**
 * Create and run a push notification A/B test
 * Splits subscribers 50/50 and sends variant A to one half, variant B to the other
 */
export async function createAndRunAbTest(
  input: PushAbTestInput
): Promise<{
  testId: number;
  variantASent: number;
  variantBSent: number;
  totalFailed: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const category = input.category || "custom";
  const subscriptions = await getAllActivePushSubscriptions(category);

  // Create test record
  const [result] = await db.insert(pushAbTests).values({
    testName: input.testName,
    status: "active",
    variantATitle: input.variantATitle,
    variantABody: input.variantABody,
    variantBTitle: input.variantBTitle,
    variantBBody: input.variantBBody,
    category,
    url: input.url || null,
    variantASent: 0,
    variantAOpened: 0,
    variantBSent: 0,
    variantBOpened: 0,
  });

  const testId = result.insertId;

  // Shuffle and split subscribers
  const shuffled = [...subscriptions].sort(() => Math.random() - 0.5);
  const midpoint = Math.ceil(shuffled.length / 2);
  const groupA = shuffled.slice(0, midpoint);
  const groupB = shuffled.slice(midpoint);

  let variantASent = 0;
  let variantBSent = 0;
  let totalFailed = 0;

  // Send variant A
  const payloadA: PushNotificationPayload = {
    title: input.variantATitle,
    body: input.variantABody,
    url: input.url,
    tag: `ab-test-${testId}-A`,
    data: { type: category, abTestId: testId, variant: "A" },
  };

  for (const sub of groupA) {
    const res = await sendPushNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dhKey, auth: sub.authKey } },
      payloadA
    );
    if (res.success) variantASent++;
    else totalFailed++;
  }

  // Send variant B
  const payloadB: PushNotificationPayload = {
    title: input.variantBTitle,
    body: input.variantBBody,
    url: input.url,
    tag: `ab-test-${testId}-B`,
    data: { type: category, abTestId: testId, variant: "B" },
  };

  for (const sub of groupB) {
    const res = await sendPushNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dhKey, auth: sub.authKey } },
      payloadB
    );
    if (res.success) variantBSent++;
    else totalFailed++;
  }

  // Update test record with sent counts
  await db
    .update(pushAbTests)
    .set({ variantASent, variantBSent })
    .where(eq(pushAbTests.id, testId));

  console.log(`[PushABTest] Test #${testId} "${input.testName}": A=${variantASent}, B=${variantBSent}, failed=${totalFailed}`);

  return { testId, variantASent, variantBSent, totalFailed };
}

/**
 * Record a notification open for an A/B test variant
 */
export async function recordAbTestOpen(
  testId: number,
  variant: "A" | "B"
): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) return { success: false };

  try {
    if (variant === "A") {
      await db
        .update(pushAbTests)
        .set({ variantAOpened: sql`${pushAbTests.variantAOpened} + 1` })
        .where(eq(pushAbTests.id, testId));
    } else {
      await db
        .update(pushAbTests)
        .set({ variantBOpened: sql`${pushAbTests.variantBOpened} + 1` })
        .where(eq(pushAbTests.id, testId));
    }
    return { success: true };
  } catch (err) {
    console.error("[PushABTest] Failed to record open:", err);
    return { success: false };
  }
}

/**
 * Get all A/B tests with results
 */
export async function getAbTests(): Promise<Array<{
  id: number;
  testName: string;
  status: string;
  variantA: { title: string; body: string; sent: number; opened: number; openRate: number };
  variantB: { title: string; body: string; sent: number; opened: number; openRate: number };
  category: string;
  winner: string | null;
  createdAt: Date;
}>> {
  const db = await getDb();
  if (!db) return [];

  try {
    const tests = await db.select().from(pushAbTests).orderBy(pushAbTests.createdAt);
    return tests.map((t) => ({
      id: t.id,
      testName: t.testName,
      status: t.status || "active",
      variantA: {
        title: t.variantATitle,
        body: t.variantABody,
        sent: t.variantASent || 0,
        opened: t.variantAOpened || 0,
        openRate: (t.variantASent || 0) > 0 ? Math.round(((t.variantAOpened || 0) / (t.variantASent || 1)) * 100) : 0,
      },
      variantB: {
        title: t.variantBTitle,
        body: t.variantBBody,
        sent: t.variantBSent || 0,
        opened: t.variantBOpened || 0,
        openRate: (t.variantBSent || 0) > 0 ? Math.round(((t.variantBOpened || 0) / (t.variantBSent || 1)) * 100) : 0,
      },
      category: t.category || "custom",
      winner: t.winner,
      createdAt: t.createdAt,
    }));
  } catch (err) {
    console.error("[PushABTest] Failed to get tests:", err);
    return [];
  }
}

/**
 * Determine and set winner for an A/B test
 */
export async function determineAbTestWinner(
  testId: number
): Promise<{ winner: "A" | "B" | "tie"; rateA: number; rateB: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const tests = await db.select().from(pushAbTests).where(eq(pushAbTests.id, testId)).limit(1);
  if (tests.length === 0) throw new Error("Test not found");

  const t = tests[0];
  const rateA = (t.variantASent || 0) > 0 ? ((t.variantAOpened || 0) / (t.variantASent || 1)) * 100 : 0;
  const rateB = (t.variantBSent || 0) > 0 ? ((t.variantBOpened || 0) / (t.variantBSent || 1)) * 100 : 0;

  let winner: "A" | "B" | "tie" = "tie";
  if (rateA > rateB + 1) winner = "A";
  else if (rateB > rateA + 1) winner = "B";

  await db
    .update(pushAbTests)
    .set({
      status: "completed",
      winner: winner === "tie" ? null : winner,
      completedAt: new Date(),
    })
    .where(eq(pushAbTests.id, testId));

  return { winner, rateA: Math.round(rateA), rateB: Math.round(rateB) };
}

// ============ Utility ============

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
  categoryBreakdown: Record<NotificationCategory, number>;
}> {
  const db = await getDb();
  const configured = isPushConfigured();

  if (!db) {
    return {
      configured,
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      categoryBreakdown: { price_drop: 0, news: 0, deal: 0, custom: 0 },
    };
  }

  try {
    const allSubs = await db.select().from(pushSubscriptions);
    const activeSubs = allSubs.filter((s) => s.isActive === 1);

    // Count subscribers per category
    const breakdown: Record<NotificationCategory, number> = { price_drop: 0, news: 0, deal: 0, custom: 0 };
    for (const sub of activeSubs) {
      const prefs = parsePreferences(sub.notificationPreferences);
      for (const cat of prefs) {
        if (cat in breakdown) breakdown[cat]++;
      }
    }

    return {
      configured,
      totalSubscriptions: allSubs.length,
      activeSubscriptions: activeSubs.length,
      categoryBreakdown: breakdown,
    };
  } catch {
    return {
      configured,
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      categoryBreakdown: { price_drop: 0, news: 0, deal: 0, custom: 0 },
    };
  }
}
