import { getDb } from "./db";
import {
  emailCaptures,
  emailCampaigns,
  emailQueue,
  remarketingTriggers,
  type EmailCapture,
} from "../drizzle/schema";
import { eq, and, lte, desc } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

/**
 * Email Marketing Automation System
 *
 * Features:
 * - Welcome email series (3 emails over 5 days)
 * - Personalized content based on persona and segment
 * - Automatic scheduling and queue management
 * - Remarketing triggers for non-converted users
 */

// Email templates for welcome series
const WELCOME_SERIES_TEMPLATES = {
  // Email 1: Immediate - Discount code + top destinations
  welcome_1: {
    name: "Welcome Email #1 - Discount Code",
    type: "welcome_series",
    sequenceOrder: 1,
    delayDays: 0,
    subject: {
      default: "🎉 Váš slevový kód 5% je připraven!",
      petra: "🔥 Tvoje sleva 5% je tady! Let's go!",
      tereza: "Váš exkluzivní slevový kód 5% - platí 30 dní",
    },
    preheader: {
      default: "Využijte slevu na vaši první rezervaci a objevte nejlepší nabídky.",
      petra: "Kam letíme? Mám pro tebe super tipy! ✈️",
      tereza: "Profesionální cestovní služby s garantovanou kvalitou.",
    },
    htmlContent: (data: EmailTemplateData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Váš slevový kód</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✈️ Akční Letenky</h1>
        <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Váš průvodce světem levného cestování</p>
      </td>
    </tr>
    
    <!-- Main Content -->
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
          ${data.persona === "petra" ? "Ahoj! 👋" : data.persona === "tereza" ? "Vážený zákazníku," : "Dobrý den!"}
        </h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          ${data.persona === "petra" 
            ? "Děkuju, že jsi se přidal/a k naší komunitě cestovatelů! 🌍 Mám pro tebe super dárek - tvůj osobní slevový kód na první rezervaci!"
            : data.persona === "tereza"
              ? "Děkujeme za Vaši registraci. Jako poděkování Vám zasíláme exkluzivní slevový kód na Vaši první rezervaci."
              : "Děkujeme za registraci! Připravili jsme pro vás speciální slevový kód na vaši první rezervaci."}
        </p>
        
        <!-- Discount Code Box -->
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
          <p style="color: #92400e; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Váš slevový kód</p>
          <p style="color: #78350f; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 3px;">AKCNI5</p>
          <p style="color: #92400e; font-size: 14px; margin: 10px 0 0 0;">Sleva 5% na první rezervaci • Platí 30 dní</p>
        </div>
        
        ${data.destination ? `
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0;">
          ${data.persona === "petra"
            ? `Viděla jsem, že tě zajímá <strong>${data.destination}</strong>! Super volba! 🔥 Mrkni na aktuální nabídky:`
            : `Zaznamenali jsme Váš zájem o destinaci <strong>${data.destination}</strong>. Připravili jsme pro Vás aktuální nabídky:`}
        </p>
        ` : ""}
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://akcni-letenky.manus.space/levne-letenky" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: bold;">
            ${data.persona === "petra" ? "🔥 Prohlédnout nabídky" : "Zobrazit aktuální nabídky"}
          </a>
        </div>
        
        <!-- Top Destinations -->
        <h3 style="color: #1f2937; font-size: 18px; margin: 30px 0 15px 0;">
          ${data.persona === "petra" ? "🌴 Nejžhavější destinace:" : "Doporučené destinace:"}
        </h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 10px; background: #f9fafb; border-radius: 8px; margin-bottom: 10px;">
              <strong style="color: #1f2937;">🇪🇸 Barcelona</strong> - od 2 490 Kč
            </td>
          </tr>
          <tr><td style="height: 10px;"></td></tr>
          <tr>
            <td style="padding: 10px; background: #f9fafb; border-radius: 8px;">
              <strong style="color: #1f2937;">🇮🇹 Řím</strong> - od 1 990 Kč
            </td>
          </tr>
          <tr><td style="height: 10px;"></td></tr>
          <tr>
            <td style="padding: 10px; background: #f9fafb; border-radius: 8px;">
              <strong style="color: #1f2937;">🇬🇷 Řecko</strong> - od 3 490 Kč
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background: #1f2937; padding: 30px; text-align: center;">
        <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">
          Akční Letenky | Váš partner pro levné cestování
        </p>
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          <a href="#" style="color: #9ca3af;">Odhlásit odběr</a> | 
          <a href="https://akcni-letenky.manus.space" style="color: #9ca3af;">Navštívit web</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // Email 2: Day 2 - Personalized recommendations
  welcome_2: {
    name: "Welcome Email #2 - Personalized Recommendations",
    type: "welcome_series",
    sequenceOrder: 2,
    delayDays: 2,
    subject: {
      default: "✨ Vybrali jsme pro vás nejlepší nabídky",
      petra: "Hej! 👋 Mám pro tebe super tipy kam vyrazit!",
      tereza: "Personalizované doporučení na základě vašich preferencí",
    },
    preheader: {
      default: "Na základě vašich preferencí jsme vybrali ideální destinace.",
      petra: "Podívej se, co jsem pro tebe našla! 🔥",
      tereza: "Exkluzivní nabídky odpovídající vašim požadavkům.",
    },
    htmlContent: (data: EmailTemplateData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✈️ Akční Letenky</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0;">
          ${data.persona === "petra" ? "Hej! 👋" : "Dobrý den,"}
        </h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          ${data.persona === "petra"
            ? `Jak se máš? 😊 Přemýšlela jsem o tobě a vybrala jsem pár super nabídek${data.segment === "budget_traveler" ? " za super ceny" : data.segment === "luxury_traveler" ? " na luxusní dovolené" : ""}!`
            : `Na základě vašich preferencí${data.destination ? ` a zájmu o ${data.destination}` : ""} jsme pro vás připravili personalizovaná doporučení.`}
        </p>
        
        ${data.segment === "budget_traveler" ? `
        <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
          <p style="color: #065f46; margin: 0; font-weight: bold;">💰 Tip pro chytré cestovatele:</p>
          <p style="color: #047857; margin: 5px 0 0 0;">Rezervujte 6-8 týdnů předem pro nejlepší ceny!</p>
        </div>
        ` : data.segment === "luxury_traveler" ? `
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p style="color: #92400e; margin: 0; font-weight: bold;">⭐ VIP tip:</p>
          <p style="color: #b45309; margin: 5px 0 0 0;">Business class letenky nyní se slevou až 30%!</p>
        </div>
        ` : ""}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://akcni-letenky.manus.space/levne-letenky" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: bold;">
            Zobrazit doporučení
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; text-align: center;">
          Nezapomeňte použít kód <strong>AKCNI5</strong> pro 5% slevu!
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
</html>`,
  },

  // Email 3: Day 5 - Social proof + urgency
  welcome_3: {
    name: "Welcome Email #3 - Social Proof & Urgency",
    type: "welcome_series",
    sequenceOrder: 3,
    delayDays: 5,
    subject: {
      default: "⏰ Poslední šance! Vaše sleva brzy vyprší",
      petra: "🚨 Pozor! Tvoje sleva brzy zmizí!",
      tereza: "Upozornění: Platnost vašeho slevového kódu končí",
    },
    preheader: {
      default: "Využijte slevu 5% než vyprší. Tisíce cestovatelů už rezervovalo!",
      petra: "Nečekej! Ostatní už balí kufry! 🧳",
      tereza: "Zbývá omezený počet míst za zvýhodněné ceny.",
    },
    htmlContent: (data: EmailTemplateData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">⏰ Poslední šance!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0;">
          ${data.persona === "petra" ? "Hej, nespěchej, ale..." : "Vážený zákazníku,"}
        </h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          ${data.persona === "petra"
            ? "Tvůj slevový kód AKCNI5 brzy vyprší! 😱 Nechci, abys přišel/a o super slevu!"
            : "Rádi bychom Vás upozornili, že platnost Vašeho slevového kódu AKCNI5 brzy končí."}
        </p>
        
        <!-- Urgency Box -->
        <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0;">
          <p style="color: #dc2626; font-size: 18px; font-weight: bold; margin: 0;">
            ⏰ Zbývá pouze 25 dní!
          </p>
        </div>
        
        <!-- Social Proof -->
        <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 25px 0;">
          <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 16px;">
            ${data.persona === "petra" ? "🔥 Co dělají ostatní:" : "Statistiky z posledních 7 dní:"}
          </h3>
          <ul style="color: #15803d; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li><strong>2,847</strong> cestovatelů rezervovalo letenky</li>
            <li><strong>Barcelona</strong> je nejoblíbenější destinace</li>
            <li>Průměrná úspora: <strong>3,200 Kč</strong></li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://akcni-letenky.manus.space/levne-letenky" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 8px; font-size: 20px; font-weight: bold;">
            ${data.persona === "petra" ? "🔥 Využít slevu teď!" : "Využít slevu"}
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 20px;">
          Kód: <strong style="color: #dc2626;">AKCNI5</strong> | Sleva 5% na první rezervaci
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
</html>`,
  },

  // Remarketing email: 7-day no conversion
  remarketing_7day: {
    name: "Remarketing - 7 Day No Conversion",
    type: "remarketing",
    sequenceOrder: 1,
    delayDays: 7,
    subject: {
      default: "🎁 Speciální nabídka jen pro vás - 10% sleva!",
      petra: "Hej! 👋 Mám pro tebe překvápko - extra sleva 10%!",
      tereza: "Exkluzivní nabídka: 10% sleva na vaši rezervaci",
    },
    preheader: {
      default: "Chybíte nám! Připravili jsme pro vás speciální slevu.",
      petra: "Scházíš mi! Mrkni na super nabídku co mám jen pro tebe 🎁",
      tereza: "Limitovaná nabídka pro vybrané zákazníky.",
    },
    htmlContent: (data: EmailTemplateData) => `
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
          ${data.persona === "petra" ? "Hej! Dlouho jsme se neviděli! 👋" : "Dobrý den,"}
        </h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          ${data.persona === "petra"
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
          ${data.persona === "petra"
            ? `Pamatuju si, že tě zajímala <strong>${data.destination}</strong>! Mrkni na aktuální ceny - jsou super! 🔥`
            : `Připomínáme Váš zájem o destinaci <strong>${data.destination}</strong>. Aktuální nabídky jsou stále k dispozici.`}
        </p>
        ` : ""}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://akcni-letenky.manus.space/levne-letenky" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 8px; font-size: 20px; font-weight: bold;">
            ${data.persona === "petra" ? "🎁 Využít slevu 10%!" : "Využít nabídku"}
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
</html>`,
  },
};

interface EmailTemplateData {
  email: string;
  persona?: string | null;
  segment?: string | null;
  destination?: string | null;
  budget?: number | null;
  leadScore?: number;
  leadTier?: string;
}

/**
 * Schedule welcome email series for a new email capture
 */
export async function scheduleWelcomeSeries(
  emailCaptureId: number
): Promise<{ scheduled: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get email capture data
  const [capture] = await db
    .select()
    .from(emailCaptures)
    .where(eq(emailCaptures.id, emailCaptureId));

  if (!capture || capture.gdprConsent !== 1) {
    return { scheduled: 0 };
  }

  // Get or create campaign records
  const campaigns = await ensureCampaignsExist(db);

  let scheduled = 0;
  const now = new Date();

  // Schedule each email in the welcome series
  for (const [key, template] of Object.entries(WELCOME_SERIES_TEMPLATES)) {
    if (template.type !== "welcome_series") continue;

    const campaign = campaigns.find((c) => c.name === template.name);
    if (!campaign) continue;

    const scheduledFor = new Date(now);
    scheduledFor.setDate(scheduledFor.getDate() + template.delayDays);

    await db.insert(emailQueue).values({
      emailCaptureId,
      campaignId: campaign.id,
      scheduledFor,
      status: "pending",
    });

    scheduled++;
  }

  // Mark email as sent (welcome series scheduled)
  await db
    .update(emailCaptures)
    .set({ emailSent: 1 })
    .where(eq(emailCaptures.id, emailCaptureId));

  return { scheduled };
}

/**
 * Ensure all campaign templates exist in database
 */
async function ensureCampaignsExist(db: NonNullable<Awaited<ReturnType<typeof getDb>>>) {
  const existingCampaigns = await db.select().from(emailCampaigns);

  for (const [key, template] of Object.entries(WELCOME_SERIES_TEMPLATES)) {
    const exists = existingCampaigns.find((c) => c.name === template.name);
    if (!exists) {
      await db.insert(emailCampaigns).values({
        name: template.name,
        type: template.type,
        subject: template.subject.default,
        preheader: template.preheader.default,
        htmlContent: template.htmlContent({
          email: "example@test.com",
          persona: null,
          segment: null,
        }),
        sequenceOrder: template.sequenceOrder,
        delayDays: template.delayDays,
        isActive: 1,
      });
    }
  }

  return db.select().from(emailCampaigns);
}

/**
 * Process pending emails in the queue
 */
export async function processEmailQueue(): Promise<{
  sent: number;
  failed: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();

  // Get pending emails that are due
  const pendingEmails = await db
    .select()
    .from(emailQueue)
    .where(
      and(eq(emailQueue.status, "pending"), lte(emailQueue.scheduledFor, now))
    );

  let sent = 0;
  let failed = 0;

  for (const queueItem of pendingEmails) {
    try {
      // Get email capture and campaign data
      const [capture] = await db
        .select()
        .from(emailCaptures)
        .where(eq(emailCaptures.id, queueItem.emailCaptureId));

      const [campaign] = await db
        .select()
        .from(emailCampaigns)
        .where(eq(emailCampaigns.id, queueItem.campaignId));

      if (!capture || !campaign) {
        throw new Error("Missing capture or campaign data");
      }

      // Check if user unsubscribed
      if (capture.unsubscribed === 1) {
        await db
          .update(emailQueue)
          .set({ status: "cancelled" })
          .where(eq(emailQueue.id, queueItem.id));
        continue;
      }

      // Generate personalized email content
      const templateKey = Object.keys(WELCOME_SERIES_TEMPLATES).find(
        (k) =>
          WELCOME_SERIES_TEMPLATES[k as keyof typeof WELCOME_SERIES_TEMPLATES]
            .name === campaign.name
      );

      if (templateKey) {
        const template =
          WELCOME_SERIES_TEMPLATES[
            templateKey as keyof typeof WELCOME_SERIES_TEMPLATES
          ];
        const persona = capture.personaName?.toLowerCase() as
          | "petra"
          | "tereza"
          | undefined;

        const subject =
          template.subject[persona || "default"] || template.subject.default;
        const htmlContent = template.htmlContent({
          email: capture.email,
          persona: capture.personaName,
          segment: capture.segment,
          destination: capture.lastDestinationMentioned,
          budget: capture.lastBudgetMentioned,
          leadScore: capture.leadScore || 0,
          leadTier: capture.leadTier || "cold",
        });

        // Send email via notification API (or external service)
        // For now, we'll log and notify owner
        console.log(`[EmailMarketing] Sending email to ${capture.email}`);
        console.log(`[EmailMarketing] Subject: ${subject}`);

        // Notify owner about email sent (for monitoring)
        await notifyOwner({
          title: `📧 Email odeslán: ${campaign.name}`,
          content: `Email odeslán na: ${capture.email}\nKampaň: ${campaign.name}\nPersona: ${capture.personaName || "default"}\nLead Score: ${capture.leadScore || 0}`,
        });
      }

      // Mark as sent
      await db
        .update(emailQueue)
        .set({
          status: "sent",
          sentAt: new Date(),
        })
        .where(eq(emailQueue.id, queueItem.id));

      // Update campaign stats
      await db
        .update(emailCampaigns)
        .set({
          totalSent: (campaign.totalSent || 0) + 1,
        })
        .where(eq(emailCampaigns.id, campaign.id));

      sent++;
    } catch (error) {
      console.error(
        `[EmailMarketing] Failed to send email ${queueItem.id}:`,
        error
      );

      await db
        .update(emailQueue)
        .set({
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        })
        .where(eq(emailQueue.id, queueItem.id));

      failed++;
    }
  }

  return { sent, failed };
}

/**
 * Get email marketing statistics
 */
export async function getEmailMarketingStats(): Promise<{
  totalCampaigns: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  queuePending: number;
  queueSent: number;
  queueFailed: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const campaigns = await db.select().from(emailCampaigns);
  const queue = await db.select().from(emailQueue);

  const totalSent = campaigns.reduce((sum, c) => sum + (c.totalSent || 0), 0);
  const totalOpened = campaigns.reduce(
    (sum, c) => sum + (c.totalOpened || 0),
    0
  );
  const totalClicked = campaigns.reduce(
    (sum, c) => sum + (c.totalClicked || 0),
    0
  );

  return {
    totalCampaigns: campaigns.length,
    totalSent,
    totalOpened,
    totalClicked,
    openRate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
    clickRate: totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0,
    queuePending: queue.filter((q) => q.status === "pending").length,
    queueSent: queue.filter((q) => q.status === "sent").length,
    queueFailed: queue.filter((q) => q.status === "failed").length,
  };
}
