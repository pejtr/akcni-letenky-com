/**
 * Conversion Funnel Service
 * 
 * Tracks user journey through the conversion funnel:
 * Visit → Browse Destination → View Offer → Click Affiliate → Convert
 * 
 * Provides aggregated funnel data for admin dashboard visualization.
 */

import { getDb } from "./db";
import { conversionEvents } from "../drizzle/schema";
import { sql, and, gte, eq } from "drizzle-orm";

export interface ConversionEventInput {
  sessionId: string;
  userId?: number;
  eventType: string;
  page?: string;
  metadata?: Record<string, any>;
}

// Funnel steps in order
export const FUNNEL_STEPS = [
  { key: "page_visit", label: "Návštěva stránky" },
  { key: "destination_view", label: "Prohlížení destinace" },
  { key: "offer_view", label: "Zobrazení nabídky" },
  { key: "affiliate_click", label: "Klik na affiliate" },
  { key: "newsletter_signup", label: "Registrace odběru" },
  { key: "price_alert_set", label: "Nastavení hlídače" },
] as const;

/**
 * Record a conversion event
 */
export async function recordConversionEvent(event: ConversionEventInput): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(conversionEvents).values({
    sessionId: event.sessionId,
    userId: event.userId || null,
    eventType: event.eventType,
    page: event.page || null,
    metadata: event.metadata ? JSON.stringify(event.metadata) : null,
  });
}

export interface FunnelStep {
  step: string;
  label: string;
  count: number;
  percentage: number;
  dropoff: number;
  dropoffPercent: number;
}

export interface FunnelData {
  steps: FunnelStep[];
  totalSessions: number;
  overallConversionRate: number;
  period: number;
}

/**
 * Get conversion funnel data for the specified period
 */
export async function getConversionFunnel(days: number = 30): Promise<FunnelData> {
  const db = await getDb();
  if (!db) {
    return { steps: [], totalSessions: 0, overallConversionRate: 0, period: days };
  }

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Count unique sessions per event type
  const eventCounts = await db
    .select({
      eventType: conversionEvents.eventType,
      uniqueSessions: sql<number>`COUNT(DISTINCT sessionId)`,
    })
    .from(conversionEvents)
    .where(gte(conversionEvents.createdAt, since))
    .groupBy(conversionEvents.eventType);

  const countMap = new Map<string, number>();
  for (const ec of eventCounts) {
    countMap.set(ec.eventType, Number(ec.uniqueSessions));
  }

  // Total unique sessions
  const totalResult = await db
    .select({ count: sql<number>`COUNT(DISTINCT sessionId)` })
    .from(conversionEvents)
    .where(gte(conversionEvents.createdAt, since));
  const totalSessions = Number(totalResult[0]?.count || 0);

  // Build funnel steps
  const steps: FunnelStep[] = FUNNEL_STEPS.map((step, index) => {
    const count = countMap.get(step.key) || 0;
    const prevCount = index === 0 ? totalSessions : (countMap.get(FUNNEL_STEPS[index - 1].key) || totalSessions);
    const percentage = totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0;
    const dropoff = prevCount - count;
    const dropoffPercent = prevCount > 0 ? Math.round((dropoff / prevCount) * 100) : 0;

    return {
      step: step.key,
      label: step.label,
      count,
      percentage,
      dropoff,
      dropoffPercent,
    };
  });

  // Overall conversion rate (affiliate clicks / page visits)
  const visits = countMap.get("page_visit") || 0;
  const conversions = countMap.get("affiliate_click") || 0;
  const overallConversionRate = visits > 0 ? Math.round((conversions / visits) * 10000) / 100 : 0;

  return { steps, totalSessions, overallConversionRate, period: days };
}

export interface FunnelSummary {
  biggestDropoff: { step: string; label: string; dropoffPercent: number } | null;
  bestConversion: { step: string; label: string; percentage: number } | null;
  dailyConversions: { date: string; sessions: number; conversions: number; rate: number }[];
  topPages: { page: string; count: number }[];
}

/**
 * Get funnel summary with insights
 */
export async function getFunnelSummary(days: number = 30): Promise<FunnelSummary> {
  const db = await getDb();
  if (!db) {
    return { biggestDropoff: null, bestConversion: null, dailyConversions: [], topPages: [] };
  }

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const funnel = await getConversionFunnel(days);

  // Find biggest dropoff
  let biggestDropoff: FunnelSummary["biggestDropoff"] = null;
  let maxDropoff = 0;
  for (const step of funnel.steps) {
    if (step.dropoffPercent > maxDropoff && step.count > 0) {
      maxDropoff = step.dropoffPercent;
      biggestDropoff = { step: step.step, label: step.label, dropoffPercent: step.dropoffPercent };
    }
  }

  // Find best conversion step
  let bestConversion: FunnelSummary["bestConversion"] = null;
  let maxPct = 0;
  for (const step of funnel.steps) {
    if (step.percentage > maxPct) {
      maxPct = step.percentage;
      bestConversion = { step: step.step, label: step.label, percentage: step.percentage };
    }
  }

  // Daily conversion trend
  const dailyResult = await db
    .select({
      date: sql<string>`DATE(createdAt)`,
      sessions: sql<number>`COUNT(DISTINCT sessionId)`,
      conversions: sql<number>`COUNT(DISTINCT CASE WHEN eventType = 'affiliate_click' THEN sessionId END)`,
    })
    .from(conversionEvents)
    .where(gte(conversionEvents.createdAt, since))
    .groupBy(sql`DATE(createdAt)`)
    .orderBy(sql`DATE(createdAt)`);

  const dailyConversions = dailyResult.map((r: any) => ({
    date: String(r.date),
    sessions: Number(r.sessions),
    conversions: Number(r.conversions),
    rate: Number(r.sessions) > 0 ? Math.round((Number(r.conversions) / Number(r.sessions)) * 10000) / 100 : 0,
  }));

  // Top pages by event count
  const topPagesResult = await db
    .select({
      page: conversionEvents.page,
      count: sql<number>`COUNT(*)`,
    })
    .from(conversionEvents)
    .where(
      and(
        gte(conversionEvents.createdAt, since),
        sql`${conversionEvents.page} IS NOT NULL`
      )
    )
    .groupBy(conversionEvents.page)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(10);

  const topPages = topPagesResult.map((r: any) => ({
    page: r.page || "/",
    count: Number(r.count),
  }));

  return { biggestDropoff, bestConversion, dailyConversions, topPages };
}
