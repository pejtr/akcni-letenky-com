/**
 * Social Sharing Incentive System
 * 
 * Generates unique share codes and discount codes when users share deals.
 * Tracks viral referrals and conversions for ROI analysis.
 */

import { getDb } from "./db";
import { socialShares } from "../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";

// ============ Code Generation ============

function generateShareCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SH";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateDiscountCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SDIL";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ============ Social Share CRUD ============

export async function createSocialShare(data: {
  platform: string;
  destination?: string;
  destinationSlug?: string;
  pageUrl?: string;
  referrerEmail?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const shareCode = generateShareCode();
  const discountCode = generateDiscountCode();

  const result = await db.insert(socialShares).values({
    shareCode,
    platform: data.platform,
    destination: data.destination || null,
    destinationSlug: data.destinationSlug || null,
    pageUrl: data.pageUrl || null,
    referrerEmail: data.referrerEmail || null,
    discountCode,
  });

  return {
    id: Number(result[0].insertId),
    shareCode,
    discountCode,
    shareUrl: `https://akcni-letenky.com/?ref=${shareCode}`,
  };
}

export async function trackShareClick(shareCode: string) {
  const db = await getDb();
  if (!db) return null;

  const share = await db
    .select()
    .from(socialShares)
    .where(eq(socialShares.shareCode, shareCode))
    .limit(1);

  if (share.length === 0) return null;

  await db
    .update(socialShares)
    .set({
      referralClicks: sql`${socialShares.referralClicks} + 1`,
    })
    .where(eq(socialShares.id, share[0].id));

  return share[0];
}

export async function trackShareConversion(shareCode: string) {
  const db = await getDb();
  if (!db) return null;

  const share = await db
    .select()
    .from(socialShares)
    .where(eq(socialShares.shareCode, shareCode))
    .limit(1);

  if (share.length === 0) return null;

  await db
    .update(socialShares)
    .set({
      referralConversions: sql`${socialShares.referralConversions} + 1`,
    })
    .where(eq(socialShares.id, share[0].id));

  return share[0];
}

export async function validateDiscountCode(code: string) {
  const db = await getDb();
  if (!db) return null;

  const share = await db
    .select()
    .from(socialShares)
    .where(eq(socialShares.discountCode, code))
    .limit(1);

  if (share.length === 0) return null;
  if (share[0].discountUsed === 1) return { valid: false, reason: "already_used" };

  return { valid: true, share: share[0] };
}

export async function useDiscountCode(code: string) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(socialShares)
    .set({ discountUsed: 1 })
    .where(eq(socialShares.discountCode, code));

  return true;
}

// ============ Social Share Stats ============

export async function getSocialShareStats() {
  const db = await getDb();
  if (!db) return { totalShares: 0, totalClicks: 0, totalConversions: 0, byPlatform: {} };

  const all = await db.select().from(socialShares).orderBy(desc(socialShares.createdAt));

  const totalClicks = all.reduce((sum, s) => sum + (s.referralClicks || 0), 0);
  const totalConversions = all.reduce((sum, s) => sum + (s.referralConversions || 0), 0);

  // Group by platform
  const byPlatform: Record<string, { shares: number; clicks: number; conversions: number }> = {};
  for (const share of all) {
    if (!byPlatform[share.platform]) {
      byPlatform[share.platform] = { shares: 0, clicks: 0, conversions: 0 };
    }
    byPlatform[share.platform].shares++;
    byPlatform[share.platform].clicks += share.referralClicks || 0;
    byPlatform[share.platform].conversions += share.referralConversions || 0;
  }

  return {
    totalShares: all.length,
    totalClicks,
    totalConversions,
    byPlatform,
    recentShares: all.slice(0, 10),
  };
}

export async function getRecentShares(limit = 20) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(socialShares)
    .orderBy(desc(socialShares.createdAt))
    .limit(limit);
}
