import { getDb } from "./db";
import { emailCaptures, leadScoreHistory } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Lead Scoring System
 * 
 * Calculates lead quality based on multiple factors:
 * - Message engagement (0-25 points)
 * - Budget indication (0-25 points)
 * - Destination interest (0-20 points)
 * - Email engagement (0-20 points)
 * - Recency (0-10 points)
 * 
 * Total: 0-100 points
 * 
 * Tiers:
 * - Hot: 80-100 (high intent, ready to convert)
 * - Warm: 50-79 (interested, needs nurturing)
 * - Cold: 0-49 (low engagement, needs reactivation)
 */

interface LeadScoringInput {
  messageCount: number;
  lastBudgetMentioned?: number | null;
  lastDestinationMentioned?: string | null;
  emailOpened?: number;
  emailClicked?: number;
  capturedAt: Date;
  personaName?: string | null;
  segment?: string | null;
}

interface LeadScoreResult {
  score: number;
  tier: "hot" | "warm" | "cold";
  breakdown: {
    messageEngagement: number;
    budgetScore: number;
    destinationScore: number;
    emailEngagement: number;
    recencyScore: number;
  };
}

/**
 * Calculate lead score based on multiple factors
 */
export function calculateLeadScore(input: LeadScoringInput): LeadScoreResult {
  const breakdown = {
    messageEngagement: calculateMessageEngagementScore(input.messageCount),
    budgetScore: calculateBudgetScore(input.lastBudgetMentioned),
    destinationScore: calculateDestinationScore(input.lastDestinationMentioned),
    emailEngagement: calculateEmailEngagementScore(
      input.emailOpened || 0,
      input.emailClicked || 0
    ),
    recencyScore: calculateRecencyScore(input.capturedAt),
  };

  const totalScore =
    breakdown.messageEngagement +
    breakdown.budgetScore +
    breakdown.destinationScore +
    breakdown.emailEngagement +
    breakdown.recencyScore;

  const tier = determineTier(totalScore);

  return {
    score: Math.min(100, Math.max(0, totalScore)),
    tier,
    breakdown,
  };
}

/**
 * Message engagement score (0-25 points)
 * More messages = higher intent
 */
function calculateMessageEngagementScore(messageCount: number): number {
  if (messageCount >= 10) return 25; // Very engaged
  if (messageCount >= 7) return 20;
  if (messageCount >= 5) return 15;
  if (messageCount >= 3) return 10;
  if (messageCount >= 1) return 5;
  return 0;
}

/**
 * Budget score (0-25 points)
 * Higher budget = higher value lead
 */
function calculateBudgetScore(budget?: number | null): number {
  if (!budget) return 0;

  // Higher budgets indicate more serious buyers
  if (budget >= 30000) return 25; // Luxury traveler
  if (budget >= 20000) return 22;
  if (budget >= 15000) return 18;
  if (budget >= 10000) return 15;
  if (budget >= 7000) return 12;
  if (budget >= 5000) return 8;
  if (budget >= 3000) return 5;
  return 3; // At least mentioned a budget
}

/**
 * Destination score (0-20 points)
 * Specific destination = higher intent
 */
function calculateDestinationScore(destination?: string | null): number {
  if (!destination) return 0;

  // Premium destinations get higher scores
  const premiumDestinations = [
    "maledivy",
    "seychely",
    "mauricius",
    "bali",
    "dubaj",
    "new york",
    "los angeles",
    "tokio",
  ];

  const popularDestinations = [
    "barcelona",
    "paříž",
    "londýn",
    "řím",
    "amsterdam",
    "berlín",
    "vídeň",
    "madrid",
  ];

  const beachDestinations = [
    "egypt",
    "turecko",
    "řecko",
    "chorvatsko",
    "bulharsko",
    "španělsko",
    "itálie",
    "kapverdy",
    "zanzibar",
    "phuket",
    "cancún",
    "miami",
  ];

  const destLower = destination.toLowerCase();

  if (premiumDestinations.some((d) => destLower.includes(d))) return 20;
  if (popularDestinations.some((d) => destLower.includes(d))) return 15;
  if (beachDestinations.some((d) => destLower.includes(d))) return 12;

  return 8; // At least mentioned a specific destination
}

/**
 * Email engagement score (0-20 points)
 * Opens and clicks indicate interest
 */
function calculateEmailEngagementScore(
  emailOpened: number,
  emailClicked: number
): number {
  let score = 0;

  if (emailClicked > 0) score += 15; // Clicked = very engaged
  else if (emailOpened > 0) score += 8; // Opened = somewhat engaged

  // Bonus for multiple interactions
  if (emailClicked > 2) score += 5;
  else if (emailOpened > 2) score += 2;

  return Math.min(20, score);
}

/**
 * Recency score (0-10 points)
 * More recent = higher score
 */
function calculateRecencyScore(capturedAt: Date): number {
  const now = new Date();
  const daysSinceCapture = Math.floor(
    (now.getTime() - capturedAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceCapture <= 1) return 10; // Today or yesterday
  if (daysSinceCapture <= 3) return 8;
  if (daysSinceCapture <= 7) return 6;
  if (daysSinceCapture <= 14) return 4;
  if (daysSinceCapture <= 30) return 2;
  return 0; // More than 30 days old
}

/**
 * Determine lead tier based on score
 */
function determineTier(score: number): "hot" | "warm" | "cold" {
  if (score >= 80) return "hot";
  if (score >= 50) return "warm";
  return "cold";
}

/**
 * Update lead score for an email capture
 */
export async function updateLeadScore(
  emailCaptureId: number,
  reason?: string
): Promise<LeadScoreResult | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get current email capture data
  const [capture] = await db
    .select()
    .from(emailCaptures)
    .where(eq(emailCaptures.id, emailCaptureId));

  if (!capture) return null;

  // Calculate new score
  const result = calculateLeadScore({
    messageCount: capture.messageCount || 0,
    lastBudgetMentioned: capture.lastBudgetMentioned,
    lastDestinationMentioned: capture.lastDestinationMentioned,
    emailOpened: capture.emailOpened || 0,
    emailClicked: capture.emailClicked || 0,
    capturedAt: capture.capturedAt,
    personaName: capture.personaName,
    segment: capture.segment,
  });

  const previousScore = capture.leadScore || 0;

  // Update email capture with new score
  await db
    .update(emailCaptures)
    .set({
      leadScore: result.score,
      leadTier: result.tier,
    })
    .where(eq(emailCaptures.id, emailCaptureId));

  // Log score change if significant
  if (Math.abs(result.score - previousScore) >= 5) {
    await db.insert(leadScoreHistory).values({
      emailCaptureId,
      previousScore,
      newScore: result.score,
      reason: reason || "Automatic recalculation",
    });
  }

  return result;
}

/**
 * Batch update all lead scores
 */
export async function recalculateAllLeadScores(): Promise<{
  updated: number;
  errors: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const captures = await db.select().from(emailCaptures);

  let updated = 0;
  let errors = 0;

  for (const capture of captures) {
    try {
      await updateLeadScore(capture.id, "Batch recalculation");
      updated++;
    } catch (error) {
      console.error(`Error updating lead score for ${capture.id}:`, error);
      errors++;
    }
  }

  return { updated, errors };
}

/**
 * Get lead score statistics
 */
export async function getLeadScoreStats(): Promise<{
  total: number;
  byTier: Record<string, number>;
  averageScore: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const captures = await db.select().from(emailCaptures);

  const byTier = captures.reduce(
    (acc: Record<string, number>, capture) => {
      const tier = capture.leadTier || "cold";
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    },
    {}
  );

  const totalScore = captures.reduce(
    (sum, capture) => sum + (capture.leadScore || 0),
    0
  );

  return {
    total: captures.length,
    byTier,
    averageScore: captures.length > 0 ? Math.round(totalScore / captures.length) : 0,
    hotLeads: byTier["hot"] || 0,
    warmLeads: byTier["warm"] || 0,
    coldLeads: byTier["cold"] || 0,
  };
}

/**
 * Get leads by tier for targeted campaigns
 */
export async function getLeadsByTier(
  tier: "hot" | "warm" | "cold"
): Promise<typeof emailCaptures.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const captures = await db
    .select()
    .from(emailCaptures)
    .where(eq(emailCaptures.leadTier, tier));

  return captures;
}
