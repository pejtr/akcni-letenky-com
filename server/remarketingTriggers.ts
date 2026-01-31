import { getDb } from "./db";
import {
  emailCaptures,
  emailCampaigns,
  emailQueue,
  remarketingTriggers,
} from "../drizzle/schema";
import { eq, and, lte, ne } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

/**
 * Remarketing Trigger System
 *
 * Automatically sends remarketing emails to users who:
 * - Captured email but didn't convert within 7 days
 * - Showed high intent (lead score) but abandoned
 * - Haven't engaged with emails
 *
 * Features:
 * - Automatic trigger scheduling on email capture
 * - Conversion tracking to cancel triggers
 * - Personalized remarketing content
 * - Multiple trigger types support
 */

// Remarketing email template
const REMARKETING_TEMPLATE = {
  name: "Remarketing - 7 Day No Conversion",
  type: "remarketing",
  subject: {
    default: "🎁 Speciální nabídka jen pro vás - 10% sleva!",
    phoebe: "Hej! 👋 Mám pro tebe překvápko - extra sleva 10%!",
    prue: "Exkluzivní nabídka: 10% sleva na vaši rezervaci",
  },
  preheader: {
    default: "Chybíte nám! Připravili jsme pro vás speciální slevu.",
    phoebe: "Scházíš mi! Mrkni na super nabídku co mám jen pro tebe 🎁",
    prue: "Limitovaná nabídka pro vybrané zákazníky.",
  },
};

/**
 * Process pending remarketing triggers
 */
export async function processRemarketingTriggers(): Promise<{
  triggered: number;
  cancelled: number;
  errors: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();

  // Get pending triggers that are due
  const pendingTriggers = await db
    .select()
    .from(remarketingTriggers)
    .where(
      and(
        eq(remarketingTriggers.status, "pending"),
        lte(remarketingTriggers.triggerDate, now)
      )
    );

  let triggered = 0;
  let cancelled = 0;
  let errors = 0;

  for (const trigger of pendingTriggers) {
    try {
      // Get email capture data
      const [capture] = await db
        .select()
        .from(emailCaptures)
        .where(eq(emailCaptures.id, trigger.emailCaptureId));

      if (!capture) {
        throw new Error("Email capture not found");
      }

      // Check if user already converted
      if (capture.converted === 1) {
        await db
          .update(remarketingTriggers)
          .set({
            status: "converted",
            triggeredAt: new Date(),
          })
          .where(eq(remarketingTriggers.id, trigger.id));
        cancelled++;
        continue;
      }

      // Check if user unsubscribed
      if (capture.unsubscribed === 1) {
        await db
          .update(remarketingTriggers)
          .set({
            status: "cancelled",
            triggeredAt: new Date(),
          })
          .where(eq(remarketingTriggers.id, trigger.id));
        cancelled++;
        continue;
      }

      // Get or create remarketing campaign
      let [campaign] = await db
        .select()
        .from(emailCampaigns)
        .where(eq(emailCampaigns.name, REMARKETING_TEMPLATE.name));

      if (!campaign) {
        await db.insert(emailCampaigns).values({
          name: REMARKETING_TEMPLATE.name,
          type: REMARKETING_TEMPLATE.type,
          subject: REMARKETING_TEMPLATE.subject.default,
          preheader: REMARKETING_TEMPLATE.preheader.default,
          htmlContent: generateRemarketingEmailHtml({
            email: "example@test.com",
            persona: null,
            destination: null,
          }),
          isActive: 1,
        });

        [campaign] = await db
          .select()
          .from(emailCampaigns)
          .where(eq(emailCampaigns.name, REMARKETING_TEMPLATE.name));
      }

      // Schedule remarketing email immediately
      await db.insert(emailQueue).values({
        emailCaptureId: capture.id,
        campaignId: campaign.id,
        scheduledFor: new Date(), // Send immediately
        status: "pending",
      });

      // Mark trigger as triggered
      await db
        .update(remarketingTriggers)
        .set({
          status: "triggered",
          triggeredAt: new Date(),
        })
        .where(eq(remarketingTriggers.id, trigger.id));

      // Notify owner
      await notifyOwner({
        title: `🔔 Remarketing trigger aktivován`,
        content: `Email: ${capture.email}\nTyp: ${trigger.triggerType}\nLead Score: ${capture.leadScore || 0}\nDestinace: ${capture.lastDestinationMentioned || "N/A"}`,
      });

      triggered++;
    } catch (error) {
      console.error(
        `[Remarketing] Error processing trigger ${trigger.id}:`,
        error
      );
      errors++;
    }
  }

  return { triggered, cancelled, errors };
}

/**
 * Generate remarketing email HTML
 */
function generateRemarketingEmailHtml(data: {
  email: string;
  persona?: string | null;
  destination?: string | null;
}): string {
  const persona = data.persona?.toLowerCase() as "phoebe" | "prue" | undefined;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎁 Speciální nabídka!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0;">
          ${persona === "phoebe" ? "Hej! Dlouho jsme se neviděli! 👋" : "Dobrý den,"}
        </h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          ${persona === "phoebe"
            ? "Všimla jsem si, že jsi ještě nerezervoval/a svou dovolenou. Mám pro tebe speciální překvápko - extra slevu 10%! 🎉"
            : "Zaznamenali jsme, že jste dosud nedokončili svou rezervaci. Připravili jsme pro Vás exkluzivní nabídku."}
        </p>
        
        <!-- Special Discount Box -->
        <div style="background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
          <p style="color: #6d28d9; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Exkluzivní slevový kód</p>
          <p style="color: #5b21b6; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 3px;">VRACIMSE10</p>
          <p style="color: #7c3aed; font-size: 16px; margin: 15px 0 0 0;">
            <strong>10% sleva</strong> na jakoukoli rezervaci<br>
            <span style="font-size: 14px;">Platí pouze 48 hodin!</span>
          </p>
        </div>
        
        ${data.destination ? `
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          ${persona === "phoebe"
            ? `Pamatuju si, že tě zajímala <strong>${data.destination}</strong>! Mrkni na aktuální ceny - jsou super! 🔥`
            : `Připomínáme Váš zájem o destinaci <strong>${data.destination}</strong>. Aktuální nabídky jsou stále k dispozici.`}
        </p>
        ` : ""}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://akcni-letenky.manus.space/levne-letenky" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 8px; font-size: 20px; font-weight: bold;">
            ${persona === "phoebe" ? "🎁 Využít slevu 10%!" : "Využít nabídku"}
          </a>
        </div>
        
        <p style="color: #dc2626; font-size: 14px; text-align: center; font-weight: bold;">
          ⏰ Nabídka platí pouze 48 hodin!
        </p>
      </td>
    </tr>
    <tr>
      <td style="background: #1f2937; padding: 20px; text-align: center;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          <a href="#" style="color: #9ca3af;">Odhlásit odběr</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Mark user as converted (cancels pending triggers)
 */
export async function markUserConverted(
  emailCaptureId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Update email capture
  await db
    .update(emailCaptures)
    .set({
      converted: 1,
      convertedAt: new Date(),
    })
    .where(eq(emailCaptures.id, emailCaptureId));

  // Cancel pending triggers
  await db
    .update(remarketingTriggers)
    .set({
      status: "converted",
    })
    .where(
      and(
        eq(remarketingTriggers.emailCaptureId, emailCaptureId),
        eq(remarketingTriggers.status, "pending")
      )
    );

  return true;
}

/**
 * Get remarketing trigger statistics
 */
export async function getRemarketingStats(): Promise<{
  total: number;
  pending: number;
  triggered: number;
  cancelled: number;
  converted: number;
  conversionRate: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const triggers = await db.select().from(remarketingTriggers);

  const pending = triggers.filter((t) => t.status === "pending").length;
  const triggered = triggers.filter((t) => t.status === "triggered").length;
  const cancelled = triggers.filter((t) => t.status === "cancelled").length;
  const converted = triggers.filter((t) => t.status === "converted").length;

  return {
    total: triggers.length,
    pending,
    triggered,
    cancelled,
    converted,
    conversionRate:
      triggered + converted > 0
        ? Math.round((converted / (triggered + converted)) * 100)
        : 0,
  };
}

/**
 * Create manual remarketing trigger (for testing)
 */
export async function createManualTrigger(
  emailCaptureId: number,
  triggerType: string = "manual_test"
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const triggerDate = new Date();
  triggerDate.setMinutes(triggerDate.getMinutes() + 1); // Trigger in 1 minute

  await db.insert(remarketingTriggers).values({
    emailCaptureId,
    triggerType,
    triggerDate,
    status: "pending",
    contextData: JSON.stringify({ manual: true }),
  });

  return true;
}

/**
 * Get all triggers for an email capture
 */
export async function getTriggersByEmailCapture(
  emailCaptureId: number
): Promise<typeof remarketingTriggers.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(remarketingTriggers)
    .where(eq(remarketingTriggers.emailCaptureId, emailCaptureId));
}
