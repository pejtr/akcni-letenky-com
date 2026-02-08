/**
 * Email Follow-up Service
 * 
 * Schedules and sends personalized follow-up emails after exit-intent popup captures.
 * Sends a follow-up email 2 hours after capture with destination-specific offers.
 */

import { getDb } from "./db";
import { emailFollowups } from "../drizzle/schema";
import { sql, eq, and, lte, gte } from "drizzle-orm";
import { isEmailServiceConfigured } from "./emailService";

export interface FollowupInput {
  email: string;
  destinationName?: string;
  destinationSlug?: string;
  triggerSource?: string;
}

/**
 * Schedule a follow-up email (2 hours from now)
 */
export async function scheduleFollowup(input: FollowupInput): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Check if we already have a pending followup for this email
  const existing = await db
    .select({ id: emailFollowups.id })
    .from(emailFollowups)
    .where(
      and(
        eq(emailFollowups.email, input.email),
        eq(emailFollowups.status, "pending")
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Already scheduled, skip
    return;
  }

  const scheduledAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

  await db.insert(emailFollowups).values({
    email: input.email,
    destinationName: input.destinationName || null,
    destinationSlug: input.destinationSlug || null,
    triggerSource: input.triggerSource || "exit_intent",
    scheduledAt,
    status: "pending",
    metadata: JSON.stringify({ scheduledBy: "auto" }),
  });
}

/**
 * Process the follow-up queue - send all due emails
 */
export async function processFollowupQueue(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const configured = await isEmailServiceConfigured();
  if (!configured) {
    console.log("[EmailFollowup] Email service not configured, skipping");
    return 0;
  }

  const now = new Date();
  const dueEmails = await db
    .select()
    .from(emailFollowups)
    .where(
      and(
        eq(emailFollowups.status, "pending"),
        lte(emailFollowups.scheduledAt, now)
      )
    )
    .limit(50);

  let sentCount = 0;

  for (const followup of dueEmails) {
    try {
      await sendFollowupEmail(followup);
      await db
        .update(emailFollowups)
        .set({ status: "sent", sentAt: new Date() })
        .where(eq(emailFollowups.id, followup.id));
      sentCount++;
    } catch (error) {
      console.error(`[EmailFollowup] Failed to send to ${followup.email}:`, error);
      await db
        .update(emailFollowups)
        .set({ status: "failed" })
        .where(eq(emailFollowups.id, followup.id));
    }
  }

  return sentCount;
}

/**
 * Send a single follow-up email
 */
async function sendFollowupEmail(followup: any): Promise<void> {
  const { Resend } = await import("resend");

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Akční Letenky <onboarding@resend.dev>";

  const destinationName = followup.destinationName || "vaší vysněné destinaci";
  const destinationSlug = followup.destinationSlug || "levne-letenky";
  const siteUrl = process.env.VITE_APP_URL || "https://akcni-letenky.manus.space";

  const html = buildFollowupEmailHtml(destinationName, destinationSlug, siteUrl, followup.id);

  await resend.emails.send({
    from: fromEmail,
    to: followup.email,
    subject: `✈️ Stále hledáte letenky do ${destinationName}? Máme pro vás exkluzivní nabídku!`,
    html,
  });
}

function buildFollowupEmailHtml(
  destinationName: string,
  destinationSlug: string,
  siteUrl: string,
  followupId: number
): string {
  const trackingPixel = `${siteUrl}/api/trpc/emailFollowup.trackOpen?id=${followupId}`;
  const offerLink = `${siteUrl}/destinace/${destinationSlug}?utm_source=followup&utm_medium=email&utm_campaign=exit_intent&fid=${followupId}`;
  const allDealsLink = `${siteUrl}/levne-letenky?utm_source=followup&utm_medium=email&utm_campaign=exit_intent`;

  return `
<!DOCTYPE html>
<html lang="cs">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#003087,#0052cc);padding:30px 40px;text-align:center;">
    <h1 style="color:#FFD700;margin:0;font-size:24px;">✈️ Akční Letenky</h1>
    <p style="color:#fff;margin:8px 0 0;font-size:14px;opacity:0.9;">Vaše vysněná dovolená čeká!</p>
  </td></tr>
  
  <!-- Body -->
  <tr><td style="padding:30px 40px;">
    <h2 style="color:#003087;margin:0 0 15px;font-size:20px;">Stále hledáte letenky do ${destinationName}?</h2>
    <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Všimli jsme si, že jste prohlíželi nabídky do <strong>${destinationName}</strong>. 
      Máme pro vás skvělou zprávu – aktuální ceny jsou stále velmi výhodné!
    </p>
    
    <!-- CTA Box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8E1;border:2px solid #FFD700;border-radius:8px;margin:20px 0;">
    <tr><td style="padding:20px;text-align:center;">
      <p style="color:#E91E63;font-weight:bold;font-size:16px;margin:0 0 5px;">🔥 Exkluzivní nabídka jen pro vás</p>
      <p style="color:#333;font-size:14px;margin:0 0 15px;">Podívejte se na nejlevnější letenky do ${destinationName}</p>
      <a href="${offerLink}" style="display:inline-block;background:#E91E63;color:#fff;padding:12px 30px;border-radius:25px;text-decoration:none;font-weight:bold;font-size:15px;">
        Zobrazit nabídky →
      </a>
    </td></tr>
    </table>
    
    <p style="color:#666;font-size:14px;line-height:1.5;margin:15px 0;">
      💡 <strong>Tip:</strong> Nastavte si <a href="${siteUrl}/wishlist" style="color:#0052cc;">hlídač cen</a> 
      a budeme vás automaticky informovat, až cena klesne!
    </p>
    
    <!-- Secondary CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr><td style="text-align:center;">
      <a href="${allDealsLink}" style="display:inline-block;background:#003087;color:#fff;padding:10px 25px;border-radius:20px;text-decoration:none;font-size:14px;">
        📋 Všechny akční letenky
      </a>
    </td></tr>
    </table>
  </td></tr>
  
  <!-- Footer -->
  <tr><td style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
    <p style="color:#999;font-size:12px;margin:0;">
      Tento email jste obdrželi, protože jste projevili zájem o letenky na Akční Letenky.<br>
      <a href="${siteUrl}/odhlasit?email=${encodeURIComponent('')}" style="color:#999;">Odhlásit se z odběru</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
<img src="${trackingPixel}" width="1" height="1" style="display:none;" alt="" />
</body>
</html>`;
}

/**
 * Get follow-up email statistics
 */
export async function getFollowupStats(): Promise<{
  total: number;
  pending: number;
  sent: number;
  failed: number;
  opened: number;
  clicked: number;
}> {
  const db = await getDb();
  if (!db) {
    return { total: 0, pending: 0, sent: 0, failed: 0, opened: 0, clicked: 0 };
  }

  const stats = await db
    .select({
      status: emailFollowups.status,
      count: sql<number>`COUNT(*)`,
    })
    .from(emailFollowups)
    .groupBy(emailFollowups.status);

  const result = { total: 0, pending: 0, sent: 0, failed: 0, opened: 0, clicked: 0 };
  for (const s of stats) {
    const count = Number(s.count);
    result.total += count;
    if (s.status === "pending") result.pending = count;
    if (s.status === "sent") result.sent = count;
    if (s.status === "failed") result.failed = count;
    if (s.status === "opened") result.opened = count;
    if (s.status === "clicked") result.clicked = count;
  }

  return result;
}

/**
 * Schedule the follow-up processor to run every 15 minutes
 */
export function scheduleFollowupProcessor(): void {
  setInterval(async () => {
    try {
      const sent = await processFollowupQueue();
      if (sent > 0) {
        console.log(`[EmailFollowup] Processed ${sent} follow-up emails`);
      }
    } catch (error) {
      console.error("[EmailFollowup] Queue processing error:", error);
    }
  }, 15 * 60 * 1000); // Every 15 minutes

  console.log("[EmailFollowup] Follow-up processor scheduled (every 15 min)");
}
