import { getDb } from "./db";
import { emailCaptures, type EmailCapture } from "../drizzle/schema";

interface CaptureEmailInput {
  email: string;
  sessionId: string;
  personaId?: number;
  personaName?: string;
  messageCount?: number;
  lastDestinationMentioned?: string;
  lastBudgetMentioned?: number;
  gdprConsent: boolean;
  consentText?: string;
}

/**
 * Capture email from chatbot for remarketing
 */
export async function captureEmail(input: CaptureEmailInput) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Insert email capture record
    const result = await db.insert(emailCaptures).values({
      email: input.email,
      sessionId: input.sessionId,
      personaId: input.personaId || null,
      personaName: input.personaName || null,
      source: "chatbot",
      captureMethod: "email_popup",
      messageCount: input.messageCount || 0,
      lastDestinationMentioned: input.lastDestinationMentioned || null,
      lastBudgetMentioned: input.lastBudgetMentioned || null,
      gdprConsent: input.gdprConsent ? 1 : 0,
      consentText: input.consentText || null,
      // Auto-segment based on context
      segment: determineSegment(input),
      // Auto-tag based on persona and context
      tags: JSON.stringify(generateTags(input)),
    });

    return {
      success: true,
      message: "Email captured successfully",
    };
  } catch (error) {
    console.error("Error capturing email:", error);
    throw new Error("Failed to capture email");
  }
}

/**
 * Determine user segment based on context
 */
function determineSegment(input: CaptureEmailInput): string {
  // Budget-based segmentation
  if (input.lastBudgetMentioned) {
    if (input.lastBudgetMentioned < 5000) return "budget_traveler";
    if (input.lastBudgetMentioned > 20000) return "luxury_traveler";
    return "mid_range_traveler";
  }

  // Default segment
  return "general";
}

/**
 * Generate tags for segmentation
 */
function generateTags(input: CaptureEmailInput): string[] {
  const tags: string[] = [];

  // Add persona tag
  if (input.personaName) {
    tags.push(`persona:${input.personaName.toLowerCase()}`);
  }

  // Add destination tag
  if (input.lastDestinationMentioned) {
    tags.push(`destination:${input.lastDestinationMentioned.toLowerCase()}`);
  }

  // Add budget tag
  if (input.lastBudgetMentioned) {
    if (input.lastBudgetMentioned < 5000) tags.push("budget:low");
    else if (input.lastBudgetMentioned < 15000) tags.push("budget:medium");
    else tags.push("budget:high");
  }

  // Add engagement tag based on message count
  if (input.messageCount && input.messageCount >= 5) {
    tags.push("engagement:high");
  } else if (input.messageCount && input.messageCount >= 3) {
    tags.push("engagement:medium");
  } else {
    tags.push("engagement:low");
  }

  return tags;
}

/**
 * Get all captured emails (admin only)
 */
export async function getAllEmailCaptures(filters?: {
  personaName?: string;
  segment?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    let query = db.select().from(emailCaptures);

    // Apply filters if provided
    // Note: For production, use proper query builder with where clauses
    // This is a simplified version

    const results = await query;

    return results;
  } catch (error) {
    console.error("Error fetching email captures:", error);
    throw new Error("Failed to fetch email captures");
  }
}

/**
 * Get email capture statistics
 */
export async function getEmailCaptureStats() {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const allCaptures = await db.select().from(emailCaptures);

    // Calculate statistics
    const total = allCaptures.length;
    const withConsent = allCaptures.filter((c: EmailCapture) => c.gdprConsent === 1).length;
    const byPersona = allCaptures.reduce(
      (acc: Record<string, number>, capture: EmailCapture) => {
        const persona = capture.personaName || "unknown";
        acc[persona] = (acc[persona] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const bySegment = allCaptures.reduce(
      (acc: Record<string, number>, capture: EmailCapture) => {
        const segment = capture.segment || "unknown";
        acc[segment] = (acc[segment] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get recent captures (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCaptures = allCaptures.filter(
      (c: any) => c.capturedAt && new Date(c.capturedAt) >= sevenDaysAgo
    );

    return {
      total,
      withConsent,
      consentRate: total > 0 ? Math.round((withConsent / total) * 100) : 0,
      byPersona,
      bySegment,
      last7Days: recentCaptures.length,
      growthRate:
        total > 0
          ? Math.round(((recentCaptures.length / total) * 100 * 52) / 7)
          : 0, // Annualized growth rate
    };
  } catch (error) {
    console.error("Error calculating email capture stats:", error);
    throw new Error("Failed to calculate stats");
  }
}

/**
 * Export emails to CSV format
 */
export function exportEmailsToCSV(captures: typeof emailCaptures.$inferSelect[]) {
  const headers = [
    "Email",
    "Persona",
    "Segment",
    "Message Count",
    "Last Destination",
    "Budget",
    "GDPR Consent",
    "Captured At",
  ];

  const rows = captures.map((c) => [
    c.email,
    c.personaName || "",
    c.segment || "",
    c.messageCount?.toString() || "0",
    c.lastDestinationMentioned || "",
    c.lastBudgetMentioned?.toString() || "",
    c.gdprConsent === 1 ? "Yes" : "No",
    c.capturedAt ? new Date(c.capturedAt).toISOString() : "",
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

  return csv;
}

/**
 * Export emails in Mailchimp-compatible format
 */
export function exportEmailsToMailchimp(
  captures: typeof emailCaptures.$inferSelect[]
) {
  const headers = [
    "Email Address",
    "First Name",
    "Tags",
    "Segment",
    "Persona",
    "Last Destination",
    "Budget Range",
  ];

  const rows = captures
    .filter((c) => c.gdprConsent === 1) // Only export consented emails
    .map((c) => {
      // Extract first name from email (simple heuristic)
      const firstName = c.email.split("@")[0].split(".")[0];

      // Parse tags
      const tags = c.tags ? JSON.parse(c.tags).join(";") : "";

      // Budget range
      let budgetRange = "";
      if (c.lastBudgetMentioned) {
        if (c.lastBudgetMentioned < 5000) budgetRange = "Under 5000 CZK";
        else if (c.lastBudgetMentioned < 15000)
          budgetRange = "5000-15000 CZK";
        else budgetRange = "Over 15000 CZK";
      }

      return [
        c.email,
        firstName,
        tags,
        c.segment || "",
        c.personaName || "",
        c.lastDestinationMentioned || "",
        budgetRange,
      ];
    });

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

  return csv;
}
