/**
 * A/B Testing Server-Side Logic
 * 
 * Handles database operations for A/B test assignments and events
 */

import { getDb } from "./db";
import { abTestAssignments, abTestEvents, type InsertAbTestAssignment, type InsertAbTestEvent } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Record A/B test assignment in database
 */
export async function recordAssignment(
  testName: string,
  variant: 'A' | 'B',
  sessionId: string,
  userId?: number
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('[A/B Test] Database not available');
      return;
    }

    // Check if assignment already exists
    const existing = await db
      .select()
      .from(abTestAssignments)
      .where(
        and(
          eq(abTestAssignments.sessionId, sessionId),
          eq(abTestAssignments.testName, testName)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      // Create new assignment
      const assignment: InsertAbTestAssignment = {
        sessionId,
        userId: userId || null,
        testName,
        variant,
      };

      await db.insert(abTestAssignments).values(assignment);
    }
  } catch (error) {
    console.error('Failed to record A/B test assignment:', error);
    throw error;
  }
}

/**
 * Record A/B test event in database
 */
export async function recordEvent(
  testName: string,
  variant: 'A' | 'B',
  sessionId: string,
  eventType: string,
  eventData?: string | null
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('[A/B Test] Database not available');
      return;
    }

    const event: InsertAbTestEvent = {
      sessionId,
      testName,
      variant,
      eventType,
      eventData: eventData || null,
    };

    await db.insert(abTestEvents).values(event);
  } catch (error) {
    console.error('Failed to record A/B test event:', error);
    throw error;
  }
}

/**
 * Get A/B test results for a specific test
 */
export async function getTestResults(testName: string) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    // Add type annotations to fix TS errors
    type AssignmentRow = { variant: string; count: number };
    type ConversionRow = { variant: string; count: number };

    // Get total assignments per variant
    const assignments = await db
      .select({
        variant: abTestAssignments.variant,
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(abTestAssignments)
      .where(eq(abTestAssignments.testName, testName))
      .groupBy(abTestAssignments.variant);

    // Get conversion events (CTA clicks) per variant
    const conversions = await db
      .select({
        variant: abTestEvents.variant,
        count: sql<number>`COUNT(DISTINCT ${abTestEvents.sessionId})`.as('count'),
      })
      .from(abTestEvents)
      .where(
        and(
          eq(abTestEvents.testName, testName),
          eq(abTestEvents.eventType, 'cta_click')
        )
      )
      .groupBy(abTestEvents.variant);

    // Calculate conversion rates
    const results = {
      variantA: {
        assignments: assignments.find((a: AssignmentRow) => a.variant === 'A')?.count || 0,
        conversions: conversions.find((c: ConversionRow) => c.variant === 'A')?.count || 0,
        conversionRate: 0,
      },
      variantB: {
        assignments: assignments.find((a: AssignmentRow) => a.variant === 'B')?.count || 0,
        conversions: conversions.find((c: ConversionRow) => c.variant === 'B')?.count || 0,
        conversionRate: 0,
      },
    };

    // Calculate conversion rates
    if (results.variantA.assignments > 0) {
      results.variantA.conversionRate = (results.variantA.conversions / results.variantA.assignments) * 100;
    }
    if (results.variantB.assignments > 0) {
      results.variantB.conversionRate = (results.variantB.conversions / results.variantB.assignments) * 100;
    }

    return results;
  } catch (error) {
    console.error('Failed to get A/B test results:', error);
    throw error;
  }
}

/**
 * Get detailed event breakdown for a test
 */
export async function getEventBreakdown(testName: string) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    const events = await db
      .select({
        variant: abTestEvents.variant,
        eventType: abTestEvents.eventType,
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(abTestEvents)
      .where(eq(abTestEvents.testName, testName))
      .groupBy(abTestEvents.variant, abTestEvents.eventType);

    return events;
  } catch (error) {
    console.error('Failed to get event breakdown:', error);
    throw error;
  }
}

/**
 * Calculate statistical significance using Z-test
 */
export function calculateSignificance(
  conversionsA: number,
  assignmentsA: number,
  conversionsB: number,
  assignmentsB: number
): { isSignificant: boolean; pValue: number; zScore: number } {
  // Calculate conversion rates
  const p1 = conversionsA / assignmentsA;
  const p2 = conversionsB / assignmentsB;
  
  // Pooled probability
  const pPool = (conversionsA + conversionsB) / (assignmentsA + assignmentsB);
  
  // Standard error
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / assignmentsA + 1 / assignmentsB));
  
  // Z-score
  const zScore = (p2 - p1) / se;
  
  // P-value (two-tailed test)
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));
  
  // Significant if p-value < 0.05
  const isSignificant = pValue < 0.05;
  
  return { isSignificant, pValue, zScore };
}

/**
 * Normal cumulative distribution function (approximation)
 */
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - probability : probability;
}

/**
 * Get daily trend data for a specific test over the last N days
 */
export async function getDailyTrend(testName: string, days: number = 30) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Get daily assignments per variant
    const dailyAssignments = await db
      .select({
        date: sql<string>`DATE(${abTestAssignments.assignedAt})`.as('date'),
        variant: abTestAssignments.variant,
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(abTestAssignments)
      .where(
        and(
          eq(abTestAssignments.testName, testName),
          sql`${abTestAssignments.assignedAt} >= DATE_SUB(NOW(), INTERVAL ${sql.raw(String(days))} DAY)`
        )
      )
      .groupBy(sql`DATE(${abTestAssignments.assignedAt})`, abTestAssignments.variant)
      .orderBy(sql`DATE(${abTestAssignments.assignedAt})`);

    // Get daily events (clicks) per variant
    const dailyClicks = await db
      .select({
        date: sql<string>`DATE(${abTestEvents.timestamp})`.as('date'),
        variant: abTestEvents.variant,
        eventType: abTestEvents.eventType,
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(abTestEvents)
      .where(
        and(
          eq(abTestEvents.testName, testName),
          sql`${abTestEvents.timestamp} >= DATE_SUB(NOW(), INTERVAL ${sql.raw(String(days))} DAY)`
        )
      )
      .groupBy(sql`DATE(${abTestEvents.timestamp})`, abTestEvents.variant, abTestEvents.eventType)
      .orderBy(sql`DATE(${abTestEvents.timestamp})`);

    return { dailyAssignments, dailyClicks };
  } catch (error) {
    console.error('Failed to get daily trend:', error);
    throw error;
  }
}

/**
 * Get conversion funnel data for a specific test
 * Tracks: impressions → clicks → shares (completed)
 */
export async function getConversionFunnel(testName: string) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Get total assignments (impressions) per variant
    const impressions = await db
      .select({
        variant: abTestAssignments.variant,
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(abTestAssignments)
      .where(eq(abTestAssignments.testName, testName))
      .groupBy(abTestAssignments.variant);

    // Get events by type per variant
    const eventsByType = await db
      .select({
        variant: abTestEvents.variant,
        eventType: abTestEvents.eventType,
        count: sql<number>`COUNT(*)`.as('count'),
        uniqueSessions: sql<number>`COUNT(DISTINCT ${abTestEvents.sessionId})`.as('uniqueSessions'),
      })
      .from(abTestEvents)
      .where(eq(abTestEvents.testName, testName))
      .groupBy(abTestEvents.variant, abTestEvents.eventType);

    return { impressions, eventsByType };
  } catch (error) {
    console.error('Failed to get conversion funnel:', error);
    throw error;
  }
}

/**
 * Get comprehensive share placement A/B test analytics
 */
export async function getSharePlacementAnalytics() {
  const testName = 'share_placement';
  const results = await getTestResults(testName);
  const events = await getEventBreakdown(testName);
  const funnel = await getConversionFunnel(testName);
  const trend = await getDailyTrend(testName, 30);

  let significance = null;
  if (results.variantA.assignments >= 10 && results.variantB.assignments >= 10) {
    significance = calculateSignificance(
      results.variantA.conversions,
      results.variantA.assignments,
      results.variantB.conversions,
      results.variantB.assignments
    );
  }

  // Build daily trend data structure
  const dateSet = new Set<string>();
  trend.dailyAssignments.forEach(d => dateSet.add(d.date));
  trend.dailyClicks.forEach(d => dateSet.add(d.date));
  const dates = Array.from(dateSet).sort();

  const dailyData = dates.map(date => {
    const aAssign = trend.dailyAssignments.find(d => d.date === date && d.variant === 'A');
    const bAssign = trend.dailyAssignments.find(d => d.date === date && d.variant === 'B');
    const aClicks = trend.dailyClicks.filter(d => d.date === date && d.variant === 'A');
    const bClicks = trend.dailyClicks.filter(d => d.date === date && d.variant === 'B');

    return {
      date,
      variantA: {
        impressions: aAssign?.count || 0,
        clicks: aClicks.reduce((sum, c) => sum + c.count, 0),
      },
      variantB: {
        impressions: bAssign?.count || 0,
        clicks: bClicks.reduce((sum, c) => sum + c.count, 0),
      },
    };
  });

  // Build funnel data
  const funnelData = {
    variantA: {
      impressions: funnel.impressions.find(i => i.variant === 'A')?.count || 0,
      clicks: funnel.eventsByType.filter(e => e.variant === 'A' && e.eventType === 'click').reduce((s, e) => s + e.uniqueSessions, 0),
      shares: funnel.eventsByType.filter(e => e.variant === 'A' && e.eventType === 'share_complete').reduce((s, e) => s + e.uniqueSessions, 0),
      ctaClicks: funnel.eventsByType.filter(e => e.variant === 'A' && e.eventType === 'cta_click').reduce((s, e) => s + e.uniqueSessions, 0),
    },
    variantB: {
      impressions: funnel.impressions.find(i => i.variant === 'B')?.count || 0,
      clicks: funnel.eventsByType.filter(e => e.variant === 'B' && e.eventType === 'click').reduce((s, e) => s + e.uniqueSessions, 0),
      shares: funnel.eventsByType.filter(e => e.variant === 'B' && e.eventType === 'share_complete').reduce((s, e) => s + e.uniqueSessions, 0),
      ctaClicks: funnel.eventsByType.filter(e => e.variant === 'B' && e.eventType === 'cta_click').reduce((s, e) => s + e.uniqueSessions, 0),
    },
  };

  // Determine winner
  const winner = results.variantA.conversionRate > results.variantB.conversionRate ? 'A' : 
                 results.variantB.conversionRate > results.variantA.conversionRate ? 'B' : null;
  const lift = results.variantA.conversionRate > 0 && results.variantB.conversionRate > 0
    ? ((Math.max(results.variantA.conversionRate, results.variantB.conversionRate) / 
        Math.min(results.variantA.conversionRate, results.variantB.conversionRate)) - 1) * 100
    : 0;

  return {
    variantA: { ...results.variantA, label: 'Na kartě destinace' },
    variantB: { ...results.variantB, label: 'V detailu destinace' },
    events,
    significance,
    totalSessions: results.variantA.assignments + results.variantB.assignments,
    dailyData,
    funnelData,
    winner,
    lift: Math.round(lift * 10) / 10,
    recommendation: getRecommendation(results, significance),
  };
}

function getRecommendation(
  results: { variantA: { assignments: number; conversions: number; conversionRate: number }; variantB: { assignments: number; conversions: number; conversionRate: number } },
  significance: { isSignificant: boolean; pValue: number; zScore: number } | null
): string {
  const total = results.variantA.assignments + results.variantB.assignments;
  
  if (total < 50) {
    return `Nedostatek dat pro rozhodnutí. Aktuálně ${total} sessions, doporučeno minimálně 100 pro spolehlivé výsledky.`;
  }
  
  if (!significance) {
    return 'Nedostatek dat v jedné z variant pro statistický test. Počkejte na více dat.';
  }
  
  if (!significance.isSignificant) {
    return `Rozdíl mezi variantami není statisticky významný (p=${significance.pValue.toFixed(3)}). Pokračujte ve sběru dat nebo zvažte větší změnu v designu.`;
  }
  
  const winner = results.variantA.conversionRate > results.variantB.conversionRate ? 'A' : 'B';
  const winnerLabel = winner === 'A' ? 'Na kartě destinace' : 'V detailu destinace';
  const winnerRate = winner === 'A' ? results.variantA.conversionRate : results.variantB.conversionRate;
  
  return `Varianta ${winner} (${winnerLabel}) je statisticky významně lepší s konverzí ${winnerRate.toFixed(1)}% (p=${significance.pValue.toFixed(3)}). Doporučujeme nasadit tuto variantu pro všechny uživatele.`;
}
