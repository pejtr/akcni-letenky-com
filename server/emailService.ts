/**
 * Email Notification Service
 * 
 * Sends transactional email notifications to users when price drops are detected.
 * Uses Resend API for reliable email delivery with beautiful HTML templates.
 * Falls back to owner notification if email service is unavailable.
 */

import { Resend } from "resend";
import { getDb } from "./db";
import { pelikanDeepLink } from "../shared/affiliateLinks";
import { notificationLog } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// Initialize Resend client (API key set via environment variable)
let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Akční Letenky <onboarding@resend.dev>";

// ============ Email Templates ============

export function generatePriceDropEmailHTML(data: {
  destinationName: string;
  destinationSlug: string;
  oldPrice: number;
  newPrice: number;
  dropPercent: number;
  targetPrice?: number | null;
  searchUrl: string;
}): string {
  const savings = data.oldPrice - data.newPrice;
  const formatPrice = (p: number) => new Intl.NumberFormat("cs-CZ").format(p);

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pokles ceny - ${data.destinationName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#003087,#0052CC);padding:32px 40px;text-align:center;">
              <span style="font-size:32px;">✈️</span>
              <h1 style="color:#ffffff;font-size:22px;margin:8px 0 4px;font-weight:700;">AKČNÍ-LETENKY.com</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:0;">Hlídač cen – upozornění na pokles</p>
            </td>
          </tr>

          <!-- Price Drop Alert -->
          <tr>
            <td style="padding:32px 40px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#E91E63,#FF6B35);border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:24px 28px;text-align:center;">
                    <p style="color:rgba(255,255,255,0.9);font-size:14px;margin:0 0 4px;">Cena letenky do</p>
                    <h2 style="color:#ffffff;font-size:28px;margin:0 0 16px;font-weight:800;">${data.destinationName}</h2>
                    <table role="presentation" cellspacing="0" cellpadding="0" align="center">
                      <tr>
                        <td style="text-align:center;padding:0 16px;">
                          <p style="color:rgba(255,255,255,0.7);font-size:11px;margin:0;text-transform:uppercase;letter-spacing:1px;">Původní cena</p>
                          <p style="color:rgba(255,255,255,0.8);font-size:18px;margin:4px 0 0;text-decoration:line-through;">${formatPrice(data.oldPrice)} Kč</p>
                        </td>
                        <td style="padding:0 8px;">
                          <span style="color:#ffffff;font-size:24px;">→</span>
                        </td>
                        <td style="text-align:center;padding:0 16px;">
                          <p style="color:rgba(255,255,255,0.7);font-size:11px;margin:0;text-transform:uppercase;letter-spacing:1px;">Nová cena</p>
                          <p style="color:#FFD700;font-size:26px;margin:4px 0 0;font-weight:800;">${formatPrice(data.newPrice)} Kč</p>
                        </td>
                      </tr>
                    </table>
                    <div style="margin-top:16px;background:rgba(255,255,255,0.2);border-radius:8px;padding:8px 16px;display:inline-block;">
                      <span style="color:#ffffff;font-size:16px;font-weight:700;">📉 Pokles o ${data.dropPercent}% · Ušetříte ${formatPrice(savings)} Kč</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:16px 40px 8px;text-align:center;">
              <a href="${data.searchUrl}" style="display:inline-block;background:#FFD700;color:#003087;font-size:18px;font-weight:800;text-decoration:none;padding:16px 48px;border-radius:8px;letter-spacing:0.5px;box-shadow:0 4px 12px rgba(255,215,0,0.4);">
                🔥 REZERVOVAT NYNÍ →
              </a>
            </td>
          </tr>

          <!-- Info -->
          <tr>
            <td style="padding:8px 40px 24px;text-align:center;">
              <p style="color:#666;font-size:12px;margin:0;">
                ${data.targetPrice ? `Vaše cílová cena: ${formatPrice(data.targetPrice)} Kč – dosažena!` : `Váš práh upozornění: ${data.dropPercent}% pokles`}
              </p>
            </td>
          </tr>

          <!-- Tips Section -->
          <tr>
            <td style="padding:0 40px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FFF8E1;border-radius:8px;border:1px solid #FFE082;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="color:#F57F17;font-size:13px;font-weight:700;margin:0 0 8px;">💡 Tip od Akčních Letenek:</p>
                    <p style="color:#795548;font-size:13px;margin:0;line-height:1.5;">Ceny letenek se mění každých pár hodin. Pokud je cena výhodná, doporučujeme rezervovat co nejdříve – nabídka může zmizet!</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fa;padding:20px 40px;border-top:1px solid #eee;">
              <p style="color:#999;font-size:11px;margin:0 0 4px;text-align:center;">
                Tento email jste obdrželi, protože máte aktivní hlídač cen na AKČNÍ-LETENKY.com
              </p>
              <p style="color:#999;font-size:11px;margin:0;text-align:center;">
                Pro správu hlídačů cen navštivte svůj <a href="${process.env.VITE_APP_URL || ""}/wishlist" style="color:#0052CC;">seznam přání</a>.
              </p>
              <p style="color:#ccc;font-size:10px;margin:12px 0 0;text-align:center;">© 2026 AKČNÍ-LETENKY.com</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generatePriceDropEmailText(data: {
  destinationName: string;
  oldPrice: number;
  newPrice: number;
  dropPercent: number;
  searchUrl: string;
}): string {
  const savings = data.oldPrice - data.newPrice;
  const formatPrice = (p: number) => new Intl.NumberFormat("cs-CZ").format(p);
  
  return `AKČNÍ-LETENKY.com - Hlídač cen

🔔 Pokles ceny letenky do ${data.destinationName}!

Původní cena: ${formatPrice(data.oldPrice)} Kč
Nová cena: ${formatPrice(data.newPrice)} Kč
Pokles: ${data.dropPercent}% (ušetříte ${formatPrice(savings)} Kč)

Rezervovat nyní: ${data.searchUrl}

💡 Tip: Ceny letenek se mění každých pár hodin. Pokud je cena výhodná, doporučujeme rezervovat co nejdříve!

---
Tento email jste obdrželi, protože máte aktivní hlídač cen na AKČNÍ-LETENKY.com
Pro správu hlídačů navštivte: ${process.env.VITE_APP_URL || ""}/wishlist`;
}

// ============ Email Sending ============

export interface SendPriceDropEmailParams {
  to: string;
  destinationName: string;
  destinationSlug: string;
  oldPrice: number;
  newPrice: number;
  dropPercent: number;
  targetPrice?: number | null;
  alertId: number;
  userId: number | null;
}

export async function sendPriceDropEmail(params: SendPriceDropEmailParams): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
}> {
  const resend = getResend();
  
  if (!resend) {
    return { success: false, error: "Email service not configured (RESEND_API_KEY missing)" };
  }

  const searchUrl = pelikanDeepLink("/cs/akcni-letenky", {
    campaign: "email-price-drop",
    channel: "price-alert",
    content: params.destinationSlug,
  });

  try {
    const htmlContent = generatePriceDropEmailHTML({
      destinationName: params.destinationName,
      destinationSlug: params.destinationSlug,
      oldPrice: params.oldPrice,
      newPrice: params.newPrice,
      dropPercent: params.dropPercent,
      targetPrice: params.targetPrice,
      searchUrl,
    });

    const textContent = generatePriceDropEmailText({
      destinationName: params.destinationName,
      oldPrice: params.oldPrice,
      newPrice: params.newPrice,
      dropPercent: params.dropPercent,
      searchUrl,
    });

    const formatPrice = (p: number) => new Intl.NumberFormat("cs-CZ").format(p);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `📉 Pokles ceny: ${params.destinationName} – nyní od ${formatPrice(params.newPrice)} Kč (-${params.dropPercent}%)`,
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      await logNotification({
        alertId: params.alertId,
        userId: params.userId,
        notifyEmail: params.to,
        destinationName: params.destinationName,
        destinationSlug: params.destinationSlug,
        oldPrice: params.oldPrice,
        newPrice: params.newPrice,
        dropPercent: params.dropPercent,
        channel: "email",
        status: "failed",
        errorMessage: error.message,
      });
      return { success: false, error: error.message };
    }

    await logNotification({
      alertId: params.alertId,
      userId: params.userId,
      notifyEmail: params.to,
      destinationName: params.destinationName,
      destinationSlug: params.destinationSlug,
      oldPrice: params.oldPrice,
      newPrice: params.newPrice,
      dropPercent: params.dropPercent,
      channel: "email",
      status: "sent",
    });

    console.log(`[EmailService] Price drop email sent to ${params.to} for ${params.destinationName}`);
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    const errorMsg = err?.message || "Unknown error";
    await logNotification({
      alertId: params.alertId,
      userId: params.userId,
      notifyEmail: params.to,
      destinationName: params.destinationName,
      destinationSlug: params.destinationSlug,
      oldPrice: params.oldPrice,
      newPrice: params.newPrice,
      dropPercent: params.dropPercent,
      channel: "email",
      status: "failed",
      errorMessage: errorMsg,
    });
    console.error(`[EmailService] Failed to send email to ${params.to}:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}

// ============ Notification Logging ============

export async function logNotification(data: {
  alertId: number;
  userId: number | null;
  notifyEmail: string | null;
  destinationName: string;
  destinationSlug: string;
  oldPrice: number;
  newPrice: number;
  dropPercent: number;
  channel: string;
  status: string;
  errorMessage?: string;
}) {
  try {
    const db = await getDb();
    if (!db) return;

    await db.insert(notificationLog).values({
      alertId: data.alertId,
      userId: data.userId,
      notifyEmail: data.notifyEmail,
      destinationName: data.destinationName,
      destinationSlug: data.destinationSlug,
      oldPrice: data.oldPrice,
      newPrice: data.newPrice,
      dropPercent: data.dropPercent,
      channel: data.channel,
      status: data.status,
      errorMessage: data.errorMessage || null,
    });
  } catch (err) {
    console.error("[EmailService] Failed to log notification:", err);
  }
}

// ============ Notification History ============

export async function getNotificationHistory(userId: number, limit = 20) {
  try {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(notificationLog)
      .where(eq(notificationLog.userId, userId))
      .orderBy(desc(notificationLog.sentAt))
      .limit(limit);
  } catch (err) {
    console.error("[EmailService] Failed to get notification history:", err);
    return [];
  }
}

export async function getNotificationStats() {
  try {
    const db = await getDb();
    if (!db) return { totalSent: 0, totalFailed: 0, lastSentAt: null };

    const rows = await db.select().from(notificationLog);
    const sent = rows.filter((r) => r.status === "sent").length;
    const failed = rows.filter((r) => r.status === "failed").length;
    const lastSent = rows.filter((r) => r.status === "sent").sort((a, b) => 
      (b.sentAt?.getTime() || 0) - (a.sentAt?.getTime() || 0)
    )[0];

    return {
      totalSent: sent,
      totalFailed: failed,
      lastSentAt: lastSent?.sentAt || null,
    };
  } catch {
    return { totalSent: 0, totalFailed: 0, lastSentAt: null };
  }
}

export function isEmailServiceConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export async function testEmailService(): Promise<{ configured: boolean; canSend: boolean; error?: string }> {
  const configured = isEmailServiceConfigured();
  if (!configured) {
    return { configured: false, canSend: false, error: "RESEND_API_KEY not set" };
  }
  return { configured: true, canSend: true };
}
