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
