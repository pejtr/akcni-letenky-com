/**
 * Email A/B Test Service
 * 
 * Manages A/B testing for remarketing email templates.
 * Tests different subject lines and CTA button texts to optimize open rates and click-through rates.
 */

import { getDb } from "./db";
import { emailAbTests } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export interface EmailVariant {
  subject: string;
  ctaText: string;
  variant: "A" | "B";
}

/**
 * Create a new email A/B test
 */
export async function createEmailAbTest(input: {
  testName: string;
  variantASubject: string;
  variantACtaText: string;
  variantBSubject: string;
  variantBCtaText: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(emailAbTests).values({
    testName: input.testName,
    variantASubject: input.variantASubject,
    variantACtaText: input.variantACtaText,
    variantBSubject: input.variantBSubject,
    variantBCtaText: input.variantBCtaText,
  });

  return Number(result[0].insertId);
}

/**
 * Get the active A/B test (most recent active test)
 */
export async function getActiveEmailAbTest() {
  const db = await getDb();
  if (!db) return null;

  const tests = await db
    .select()
    .from(emailAbTests)
    .where(eq(emailAbTests.status, "active"))
    .orderBy(desc(emailAbTests.createdAt))
    .limit(1);

  return tests[0] || null;
}

/**
 * Get all email A/B tests
 */
export async function getAllEmailAbTests() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(emailAbTests)
    .orderBy(desc(emailAbTests.createdAt))
    .limit(20);
}

/**
 * Pick which variant to use for the next email send.
 * First checks for completed tests with a winner (auto-switch) and uses that variant.
 * If no winner exists, uses round-robin on the active test.
 * Returns the variant details (subject + CTA text) along with which variant was picked.
 */
export async function pickEmailVariant(): Promise<EmailVariant | null> {
  const db = await getDb();
  if (!db) return null;

  // First: check for most recent completed test with a winner (auto-switch)
  const completedTests = await db
    .select()
    .from(emailAbTests)
    .where(and(eq(emailAbTests.status, "completed"), eq(emailAbTests.winner, "A")))
    .orderBy(desc(emailAbTests.createdAt))
    .limit(1);

  const completedTestsB = await db
    .select()
    .from(emailAbTests)
    .where(and(eq(emailAbTests.status, "completed"), eq(emailAbTests.winner, "B")))
    .orderBy(desc(emailAbTests.createdAt))
    .limit(1);

  // Find the most recent completed test with a winner
  const allCompleted = [...completedTests, ...completedTestsB]
    .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  
  if (allCompleted.length > 0) {
    const winnerTest = allCompleted[0];
    const variant = winnerTest.winner as "A" | "B";
    console.log(`[EmailAbTest] Auto-switching to winning variant ${variant} from test "${winnerTest.testName}"`);
    return {
      subject: variant === "A" ? winnerTest.variantASubject : winnerTest.variantBSubject,
      ctaText: variant === "A" ? winnerTest.variantACtaText : winnerTest.variantBCtaText,
      variant,
    };
  }

  // Fallback: use active test with round-robin
  const test = await getActiveEmailAbTest();
  if (!test) return null;

  // Simple round-robin: pick the variant with fewer sends
  const variant: "A" | "B" = test.variantASent <= test.variantBSent ? "A" : "B";

  return {
    subject: variant === "A" ? test.variantASubject : test.variantBSubject,
    ctaText: variant === "A" ? test.variantACtaText : test.variantBCtaText,
    variant,
  };
}

/**
 * Record that an email was sent for a specific variant
 */
export async function recordEmailSent(variant: "A" | "B"): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const test = await getActiveEmailAbTest();
  if (!test) return;

  if (variant === "A") {
    await db
      .update(emailAbTests)
      .set({ variantASent: test.variantASent + 1 })
      .where(eq(emailAbTests.id, test.id));
  } else {
    await db
      .update(emailAbTests)
      .set({ variantBSent: test.variantBSent + 1 })
      .where(eq(emailAbTests.id, test.id));
  }
}

/**
 * Record that an email was opened for a specific variant
 */
export async function recordEmailOpened(testId: number, variant: "A" | "B"): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const tests = await db.select().from(emailAbTests).where(eq(emailAbTests.id, testId)).limit(1);
  const test = tests[0];
  if (!test) return;

  if (variant === "A") {
    await db
      .update(emailAbTests)
      .set({ variantAOpened: test.variantAOpened + 1 })
      .where(eq(emailAbTests.id, testId));
  } else {
    await db
      .update(emailAbTests)
      .set({ variantBOpened: test.variantBOpened + 1 })
      .where(eq(emailAbTests.id, testId));
  }
}

/**
 * Record that a CTA was clicked for a specific variant
 */
export async function recordEmailClicked(testId: number, variant: "A" | "B"): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const tests = await db.select().from(emailAbTests).where(eq(emailAbTests.id, testId)).limit(1);
  const test = tests[0];
  if (!test) return;

  if (variant === "A") {
    await db
      .update(emailAbTests)
      .set({ variantAClicked: test.variantAClicked + 1 })
      .where(eq(emailAbTests.id, testId));
  } else {
    await db
      .update(emailAbTests)
      .set({ variantBClicked: test.variantBClicked + 1 })
      .where(eq(emailAbTests.id, testId));
  }
}

/**
 * Determine the winner of an A/B test based on click-through rate.
 * Requires minimum 10 sends per variant to declare a winner.
 */
export async function determineEmailAbTestWinner(testId: number): Promise<{
  winner: "A" | "B" | "none";
  variantARate: number;
  variantBRate: number;
  confidence: string;
}> {
  const db = await getDb();
  if (!db) return { winner: "none", variantARate: 0, variantBRate: 0, confidence: "insufficient_data" };

  const tests = await db.select().from(emailAbTests).where(eq(emailAbTests.id, testId)).limit(1);
  const test = tests[0];
  if (!test) return { winner: "none", variantARate: 0, variantBRate: 0, confidence: "not_found" };

  const minSends = 10;
  if (test.variantASent < minSends || test.variantBSent < minSends) {
    return { winner: "none", variantARate: 0, variantBRate: 0, confidence: "insufficient_data" };
  }

  // Click-through rate (CTR) = clicks / sent
  const variantARate = test.variantASent > 0 ? (test.variantAClicked / test.variantASent) * 100 : 0;
  const variantBRate = test.variantBSent > 0 ? (test.variantBClicked / test.variantBSent) * 100 : 0;

  // Determine winner with at least 10% relative difference
  let winner: "A" | "B" | "none" = "none";
  const diff = Math.abs(variantARate - variantBRate);
  const avgRate = (variantARate + variantBRate) / 2;
  const relativeDiff = avgRate > 0 ? (diff / avgRate) * 100 : 0;

  if (relativeDiff >= 10) {
    winner = variantARate > variantBRate ? "A" : "B";
  }

  // Update the test with the winner
  if (winner !== "none") {
    await db
      .update(emailAbTests)
      .set({ winner, status: "completed" })
      .where(eq(emailAbTests.id, testId));
  }

  return {
    winner,
    variantARate: Math.round(variantARate * 100) / 100,
    variantBRate: Math.round(variantBRate * 100) / 100,
    confidence: relativeDiff >= 10 ? "significant" : "not_significant",
  };
}

/**
 * Automatically evaluate all active A/B tests.
 * If both variants have 50+ sends, determine the winner based on CTR
 * and automatically switch to the winning variant.
 * Called after each remarketing batch or on a schedule.
 */
export async function autoEvaluateAbTests(): Promise<{
  evaluated: number;
  winnersFound: number;
  results: Array<{ testId: number; testName: string; winner: "A" | "B" | "none"; variantARate: number; variantBRate: number }>
}> {
  const db = await getDb();
  if (!db) return { evaluated: 0, winnersFound: 0, results: [] };

  const activeTests = await db
    .select()
    .from(emailAbTests)
    .where(eq(emailAbTests.status, "active"));

  const MIN_SENDS_FOR_AUTO_EVAL = 50;
  const results: Array<{ testId: number; testName: string; winner: "A" | "B" | "none"; variantARate: number; variantBRate: number }> = [];
  let winnersFound = 0;

  for (const test of activeTests) {
    // Skip tests that haven't reached minimum sends
    if (test.variantASent < MIN_SENDS_FOR_AUTO_EVAL || test.variantBSent < MIN_SENDS_FOR_AUTO_EVAL) {
      continue;
    }

    // Calculate CTR for each variant
    const variantARate = test.variantASent > 0 ? (test.variantAClicked / test.variantASent) * 100 : 0;
    const variantBRate = test.variantBSent > 0 ? (test.variantBClicked / test.variantBSent) * 100 : 0;

    // Determine winner: variant with higher CTR wins if difference is >= 5% relative
    const diff = Math.abs(variantARate - variantBRate);
    const avgRate = (variantARate + variantBRate) / 2;
    const relativeDiff = avgRate > 0 ? (diff / avgRate) * 100 : 0;

    let winner: "A" | "B" | "none" = "none";
    if (relativeDiff >= 5) {
      winner = variantARate > variantBRate ? "A" : "B";
    } else if (test.variantASent >= 100 && test.variantBSent >= 100) {
      // At 100+ sends, even small differences matter - pick the better one
      winner = variantARate >= variantBRate ? "A" : "B";
    }

    if (winner !== "none") {
      // Auto-complete the test and set the winner
      await db
        .update(emailAbTests)
        .set({ winner, status: "completed" })
        .where(eq(emailAbTests.id, test.id));
      winnersFound++;
      console.log(`[EmailAbTest] Auto-evaluated test "${test.testName}": Winner is Variant ${winner} (A: ${variantARate.toFixed(1)}% vs B: ${variantBRate.toFixed(1)}% CTR)`);
    }

    results.push({
      testId: test.id,
      testName: test.testName,
      winner,
      variantARate: Math.round(variantARate * 100) / 100,
      variantBRate: Math.round(variantBRate * 100) / 100,
    });
  }

  return { evaluated: results.length, winnersFound, results };
}

/**
 * Get the winning variant for completed tests.
 * If a test has a winner, always use that variant instead of round-robin.
 */
export async function getWinningVariant(testId: number): Promise<EmailVariant | null> {
  const db = await getDb();
  if (!db) return null;

  const tests = await db.select().from(emailAbTests).where(eq(emailAbTests.id, testId)).limit(1);
  const test = tests[0];
  if (!test || !test.winner || test.winner === "none") return null;

  const variant = test.winner as "A" | "B";
  return {
    subject: variant === "A" ? test.variantASubject : test.variantBSubject,
    ctaText: variant === "A" ? test.variantACtaText : test.variantBCtaText,
    variant,
  };
}

/**
 * Pause or resume an A/B test
 */
export async function toggleEmailAbTestStatus(testId: number): Promise<string> {
  const db = await getDb();
  if (!db) return "error";

  const tests = await db.select().from(emailAbTests).where(eq(emailAbTests.id, testId)).limit(1);
  const test = tests[0];
  if (!test) return "not_found";

  const newStatus = test.status === "active" ? "paused" : "active";
  await db
    .update(emailAbTests)
    .set({ status: newStatus as any })
    .where(eq(emailAbTests.id, testId));

  return newStatus;
}
