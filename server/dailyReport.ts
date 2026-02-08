/**
 * Daily Automated Report Service
 * 
 * Aggregates key business metrics and sends a formatted HTML email report
 * to the site owner every morning at 7:00 AM CET.
 * Includes day-over-day comparison with previous day's metrics.
 * 
 * Metrics include:
 * - Affiliate clicks (total, by source, top destinations)
 * - Price alerts (active, triggered, emails sent)
 * - Social shares and conversions
 * - New user registrations
 * - Newsletter subscribers
 * - Chatbot conversations and leads
 */

import { getDb } from "./db";
import {
  affiliateClicks,
  priceAlerts,
  notificationLog,
  socialShares,
  users,
  emailCaptures,
  chatbotConversations,
  chatbotLeads,
  browsingHistory,
  dailyReportLog,
} from "../drizzle/schema";
import { sql, gte, lte, count, eq, and, desc } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { Resend } from "resend";

// ============ Types ============

export interface DailyMetrics {
  date: string; // YYYY-MM-DD
  period: { start: Date; end: Date };

  // Affiliate
  affiliateClicks: number;
  affiliateClicksBySource: Record<string, number>;
  topDestinations: Array<{ destination: string; clicks: number }>;

  // Price Alerts
  activePriceAlerts: number;
  priceAlertNotificationsSent: number;
  priceAlertEmailsSent: number;
  priceAlertEmailsFailed: number;

  // Social Sharing
  socialShares: number;
  socialSharesByPlatform: Record<string, number>;

  // Users
  newRegistrations: number;
  totalUsers: number;

  // Newsletter
  newSubscribers: number;
  totalSubscribers: number;

  // Chatbot
  chatbotConversations: number;
  chatbotLeads: number;

  // Browsing
  pageViews: number;
  uniqueSessions: number;
}

export interface DayOverDayComparison {
  current: DailyMetrics;
  previous: DailyMetrics | null;
  changes: {
    affiliateClicks: { value: number; percent: number };
    pageViews: { value: number; percent: number };
    newRegistrations: { value: number; percent: number };
    newSubscribers: { value: number; percent: number };
    chatbotConversations: { value: number; percent: number };
    chatbotLeads: { value: number; percent: number };
    socialShares: { value: number; percent: number };
    priceAlertNotificationsSent: { value: number; percent: number };
  } | null;
}

// ============ Metrics Aggregation ============

/**
 * Collect all key metrics for a given time period
 */
export async function collectMetricsForPeriod(start: Date, end: Date): Promise<DailyMetrics> {
  const db = await getDb();
  const dateStr = end.toISOString().split("T")[0];

  const metrics: DailyMetrics = {
    date: dateStr,
    period: { start, end },
    affiliateClicks: 0,
    affiliateClicksBySource: {},
    topDestinations: [],
    activePriceAlerts: 0,
    priceAlertNotificationsSent: 0,
    priceAlertEmailsSent: 0,
    priceAlertEmailsFailed: 0,
    socialShares: 0,
    socialSharesByPlatform: {},
    newRegistrations: 0,
    totalUsers: 0,
    newSubscribers: 0,
    totalSubscribers: 0,
    chatbotConversations: 0,
    chatbotLeads: 0,
    pageViews: 0,
    uniqueSessions: 0,
  };

  if (!db) return metrics;

  try {
    // --- Affiliate Clicks ---
    const clickRows = await db
      .select()
      .from(affiliateClicks)
      .where(and(gte(affiliateClicks.createdAt, start), lte(affiliateClicks.createdAt, end)));

    metrics.affiliateClicks = clickRows.length;

    for (const row of clickRows) {
      const src = row.source || "unknown";
      metrics.affiliateClicksBySource[src] = (metrics.affiliateClicksBySource[src] || 0) + 1;
    }

    const destMap = new Map<string, number>();
    for (const row of clickRows) {
      const dest = row.destination || "unknown";
      destMap.set(dest, (destMap.get(dest) || 0) + 1);
    }
    metrics.topDestinations = Array.from(destMap.entries())
      .map(([destination, clicks]) => ({ destination, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    // --- Price Alerts ---
    const [activeAlertsResult] = await db
      .select({ count: count() })
      .from(priceAlerts)
      .where(eq(priceAlerts.isActive, 1));
    metrics.activePriceAlerts = activeAlertsResult?.count || 0;

    const notifRows = await db
      .select()
      .from(notificationLog)
      .where(and(gte(notificationLog.sentAt, start), lte(notificationLog.sentAt, end)));

    metrics.priceAlertNotificationsSent = notifRows.length;
    metrics.priceAlertEmailsSent = notifRows.filter((r) => r.status === "sent" && r.channel === "email").length;
    metrics.priceAlertEmailsFailed = notifRows.filter((r) => r.status === "failed" && r.channel === "email").length;

    // --- Social Shares ---
    const shareRows = await db
      .select()
      .from(socialShares)
      .where(and(gte(socialShares.createdAt, start), lte(socialShares.createdAt, end)));

    metrics.socialShares = shareRows.length;
    for (const row of shareRows) {
      const platform = row.platform || "unknown";
      metrics.socialSharesByPlatform[platform] = (metrics.socialSharesByPlatform[platform] || 0) + 1;
    }

    // --- Users ---
    const [newUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(and(gte(users.createdAt, start), lte(users.createdAt, end)));
    metrics.newRegistrations = newUsersResult?.count || 0;

    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    metrics.totalUsers = totalUsersResult?.count || 0;

    // --- Newsletter ---
    const [newSubsResult] = await db
      .select({ count: count() })
      .from(emailCaptures)
      .where(and(gte(emailCaptures.capturedAt, start), lte(emailCaptures.capturedAt, end)));
    metrics.newSubscribers = newSubsResult?.count || 0;

    const [totalSubsResult] = await db.select({ count: count() }).from(emailCaptures);
    metrics.totalSubscribers = totalSubsResult?.count || 0;

    // --- Chatbot ---
    const [chatConvsResult] = await db
      .select({ count: count() })
      .from(chatbotConversations)
      .where(and(gte(chatbotConversations.createdAt, start), lte(chatbotConversations.createdAt, end)));
    metrics.chatbotConversations = chatConvsResult?.count || 0;

    const [chatLeadsResult] = await db
      .select({ count: count() })
      .from(chatbotLeads)
      .where(and(gte(chatbotLeads.createdAt, start), lte(chatbotLeads.createdAt, end)));
    metrics.chatbotLeads = chatLeadsResult?.count || 0;

    // --- Browsing ---
    const browsingRows = await db
      .select()
      .from(browsingHistory)
      .where(and(gte(browsingHistory.viewedAt, start), lte(browsingHistory.viewedAt, end)));

    metrics.pageViews = browsingRows.length;
    const sessionSet = new Set(browsingRows.map((r) => r.sessionId));
    metrics.uniqueSessions = sessionSet.size;
  } catch (err) {
    console.error("[DailyReport] Error collecting metrics:", err);
  }

  return metrics;
}

/**
 * Collect all key metrics for the last 24 hours (backward compatible)
 */
export async function collectDailyMetrics(): Promise<DailyMetrics> {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return collectMetricsForPeriod(yesterday, now);
}

/**
 * Get previous day's metrics from the daily_report_log table
 */
export async function getPreviousDayMetrics(): Promise<DailyMetrics | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const rows = await db
      .select()
      .from(dailyReportLog)
      .orderBy(desc(dailyReportLog.createdAt))
      .limit(1);

    if (rows.length === 0 || !rows[0].metricsJson) return null;

    const parsed = JSON.parse(rows[0].metricsJson);
    return parsed as DailyMetrics;
  } catch (err) {
    console.error("[DailyReport] Error fetching previous metrics:", err);
    return null;
  }
}

/**
 * Save current metrics to daily_report_log for future comparison
 */
export async function saveDailyMetrics(metrics: DailyMetrics, emailSent: boolean, ownerNotified: boolean): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(dailyReportLog).values({
      reportDate: metrics.date,
      emailSent: emailSent ? 1 : 0,
      ownerNotified: ownerNotified ? 1 : 0,
      metricsJson: JSON.stringify(metrics),
    });
  } catch (err) {
    console.error("[DailyReport] Error saving metrics:", err);
  }
}

/**
 * Calculate day-over-day comparison
 */
export function calculateDayOverDay(current: DailyMetrics, previous: DailyMetrics | null): DayOverDayComparison {
  if (!previous) {
    return { current, previous: null, changes: null };
  }

  const calcChange = (curr: number, prev: number) => ({
    value: curr - prev,
    percent: prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100),
  });

  return {
    current,
    previous,
    changes: {
      affiliateClicks: calcChange(current.affiliateClicks, previous.affiliateClicks),
      pageViews: calcChange(current.pageViews, previous.pageViews),
      newRegistrations: calcChange(current.newRegistrations, previous.newRegistrations),
      newSubscribers: calcChange(current.newSubscribers, previous.newSubscribers),
      chatbotConversations: calcChange(current.chatbotConversations, previous.chatbotConversations),
      chatbotLeads: calcChange(current.chatbotLeads, previous.chatbotLeads),
      socialShares: calcChange(current.socialShares, previous.socialShares),
      priceAlertNotificationsSent: calcChange(current.priceAlertNotificationsSent, previous.priceAlertNotificationsSent),
    },
  };
}

// ============ Trend Helpers ============

function trendArrow(change: { value: number; percent: number }): string {
  if (change.value > 0) return "↑";
  if (change.value < 0) return "↓";
  return "→";
}

function trendColor(change: { value: number; percent: number }): string {
  if (change.value > 0) return "#4CAF50";
  if (change.value < 0) return "#f44336";
  return "#999";
}

function trendBadgeHTML(change: { value: number; percent: number } | undefined): string {
  if (!change) return "";
  const arrow = trendArrow(change);
  const color = trendColor(change);
  const sign = change.value > 0 ? "+" : "";
  return `<span style="font-size:11px;color:${color};font-weight:600;">${arrow} ${sign}${change.value} (${sign}${change.percent}%)</span>`;
}

// ============ HTML Email Template ============

export function generateDailyReportHTML(metrics: DailyMetrics, comparison?: DayOverDayComparison): string {
  const formatDate = (d: Date) =>
    d.toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
  const formatNum = (n: number) => new Intl.NumberFormat("cs-CZ").format(n);
  const changes = comparison?.changes;

  const topDestsHTML = metrics.topDestinations.length > 0
    ? metrics.topDestinations
        .map(
          (d, i) =>
            `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;color:#555;">${i + 1}.</td><td style="padding:6px 12px;border-bottom:1px solid #eee;font-weight:600;">${d.destination}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;color:#0052CC;font-weight:700;">${formatNum(d.clicks)}</td></tr>`
        )
        .join("")
    : '<tr><td colspan="3" style="padding:12px;color:#999;text-align:center;">Žádné kliky za posledních 24 hodin</td></tr>';

  const sourceBreakdown = Object.entries(metrics.affiliateClicksBySource)
    .sort(([, a], [, b]) => b - a)
    .map(([src, cnt]) => `${src}: ${formatNum(cnt)}`)
    .join(" · ") || "Žádné";

  const shareBreakdown = Object.entries(metrics.socialSharesByPlatform)
    .sort(([, a], [, b]) => b - a)
    .map(([platform, cnt]) => `${platform}: ${formatNum(cnt)}`)
    .join(" · ") || "Žádné";

  const comparisonNote = comparison?.previous
    ? `<p style="color:rgba(255,255,255,0.6);font-size:11px;margin:4px 0 0;">Srovnání s předchozím dnem (${comparison.previous.date})</p>`
    : `<p style="color:rgba(255,255,255,0.6);font-size:11px;margin:4px 0 0;">Období: posledních 24 hodin</p>`;

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Denní report – ${metrics.date}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f0f2f5;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#003087,#0052CC);padding:28px 40px;text-align:center;">
              <span style="font-size:28px;">📊</span>
              <h1 style="color:#ffffff;font-size:20px;margin:8px 0 4px;font-weight:700;">AKČNÍ-LETENKY.com</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">Denní report – ${formatDate(metrics.period.end)}</p>
              ${comparisonNote}
            </td>
          </tr>

          <!-- Key Metrics Grid with Day-over-Day -->
          <tr>
            <td style="padding:24px 32px 8px;">
              <h2 style="color:#003087;font-size:16px;margin:0 0 16px;border-bottom:2px solid #E91E63;padding-bottom:8px;">Klíčové metriky</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="25%" style="text-align:center;padding:12px 8px;background:#f8f9fa;border-radius:8px;">
                    <p style="color:#E91E63;font-size:28px;font-weight:800;margin:0;">${formatNum(metrics.affiliateClicks)}</p>
                    <p style="color:#666;font-size:11px;margin:4px 0 0;text-transform:uppercase;letter-spacing:0.5px;">Affiliate kliky</p>
                    ${changes ? `<p style="margin:4px 0 0;">${trendBadgeHTML(changes.affiliateClicks)}</p>` : ""}
                  </td>
                  <td width="4%"></td>
                  <td width="25%" style="text-align:center;padding:12px 8px;background:#f8f9fa;border-radius:8px;">
                    <p style="color:#FF6B35;font-size:28px;font-weight:800;margin:0;">${formatNum(metrics.pageViews)}</p>
                    <p style="color:#666;font-size:11px;margin:4px 0 0;text-transform:uppercase;letter-spacing:0.5px;">Zobrazení stránek</p>
                    ${changes ? `<p style="margin:4px 0 0;">${trendBadgeHTML(changes.pageViews)}</p>` : ""}
                  </td>
                  <td width="4%"></td>
                  <td width="25%" style="text-align:center;padding:12px 8px;background:#f8f9fa;border-radius:8px;">
                    <p style="color:#0052CC;font-size:28px;font-weight:800;margin:0;">${formatNum(metrics.newRegistrations)}</p>
                    <p style="color:#666;font-size:11px;margin:4px 0 0;text-transform:uppercase;letter-spacing:0.5px;">Nové registrace</p>
                    ${changes ? `<p style="margin:4px 0 0;">${trendBadgeHTML(changes.newRegistrations)}</p>` : ""}
                  </td>
                  <td width="4%"></td>
                  <td width="25%" style="text-align:center;padding:12px 8px;background:#f8f9fa;border-radius:8px;">
                    <p style="color:#4CAF50;font-size:28px;font-weight:800;margin:0;">${formatNum(metrics.newSubscribers)}</p>
                    <p style="color:#666;font-size:11px;margin:4px 0 0;text-transform:uppercase;letter-spacing:0.5px;">Noví odběratelé</p>
                    ${changes ? `<p style="margin:4px 0 0;">${trendBadgeHTML(changes.newSubscribers)}</p>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Affiliate Section -->
          <tr>
            <td style="padding:16px 32px 8px;">
              <h2 style="color:#003087;font-size:16px;margin:0 0 12px;border-bottom:2px solid #FFD700;padding-bottom:8px;">🔗 Affiliate výkon</h2>
              <p style="color:#555;font-size:13px;margin:0 0 8px;">Zdroje kliků: <strong>${sourceBreakdown}</strong></p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden;">
                <tr style="background:#f8f9fa;">
                  <th style="padding:8px 12px;text-align:left;font-size:12px;color:#666;">#</th>
                  <th style="padding:8px 12px;text-align:left;font-size:12px;color:#666;">Destinace</th>
                  <th style="padding:8px 12px;text-align:right;font-size:12px;color:#666;">Kliky</th>
                </tr>
                ${topDestsHTML}
              </table>
            </td>
          </tr>

          <!-- Price Alerts Section -->
          <tr>
            <td style="padding:16px 32px 8px;">
              <h2 style="color:#003087;font-size:16px;margin:0 0 12px;border-bottom:2px solid #4CAF50;padding-bottom:8px;">🔔 Hlídač cen</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:8px 0;color:#555;font-size:13px;">Aktivní hlídače:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:700;color:#333;">${formatNum(metrics.activePriceAlerts)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#555;font-size:13px;border-top:1px solid #f0f0f0;">Odeslané notifikace:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:700;color:#333;border-top:1px solid #f0f0f0;">${formatNum(metrics.priceAlertNotificationsSent)} ${changes ? trendBadgeHTML(changes.priceAlertNotificationsSent) : ""}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#555;font-size:13px;border-top:1px solid #f0f0f0;">Emaily odeslány:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:700;color:#4CAF50;border-top:1px solid #f0f0f0;">${formatNum(metrics.priceAlertEmailsSent)}</td>
                </tr>
                ${metrics.priceAlertEmailsFailed > 0 ? `<tr>
                  <td style="padding:8px 0;color:#555;font-size:13px;border-top:1px solid #f0f0f0;">Emaily selhaly:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:700;color:#f44336;border-top:1px solid #f0f0f0;">${formatNum(metrics.priceAlertEmailsFailed)}</td>
                </tr>` : ""}
              </table>
            </td>
          </tr>

          <!-- Social & Community -->
          <tr>
            <td style="padding:16px 32px 8px;">
              <h2 style="color:#003087;font-size:16px;margin:0 0 12px;border-bottom:2px solid #9C27B0;padding-bottom:8px;">📱 Sociální sdílení & Komunita</h2>
              <p style="color:#555;font-size:13px;margin:0 0 4px;">Celkem sdílení: <strong>${formatNum(metrics.socialShares)}</strong> ${changes ? trendBadgeHTML(changes.socialShares) : ""}</p>
              <p style="color:#555;font-size:13px;margin:0;">Platformy: <strong>${shareBreakdown}</strong></p>
            </td>
          </tr>

          <!-- Chatbot -->
          <tr>
            <td style="padding:16px 32px 8px;">
              <h2 style="color:#003087;font-size:16px;margin:0 0 12px;border-bottom:2px solid #FF9800;padding-bottom:8px;">🤖 Chatbot</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:8px 0;color:#555;font-size:13px;">Konverzace:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:700;color:#333;">${formatNum(metrics.chatbotConversations)} ${changes ? trendBadgeHTML(changes.chatbotConversations) : ""}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#555;font-size:13px;border-top:1px solid #f0f0f0;">Nové leady:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:700;color:#FF9800;border-top:1px solid #f0f0f0;">${formatNum(metrics.chatbotLeads)} ${changes ? trendBadgeHTML(changes.chatbotLeads) : ""}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Summary Stats -->
          <tr>
            <td style="padding:16px 32px 24px;">
              <h2 style="color:#003087;font-size:16px;margin:0 0 12px;border-bottom:2px solid #607D8B;padding-bottom:8px;">📈 Celkové statistiky</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:8px 0;color:#555;font-size:13px;">Celkem uživatelů:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:700;color:#333;">${formatNum(metrics.totalUsers)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#555;font-size:13px;border-top:1px solid #f0f0f0;">Celkem odběratelů:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:700;color:#333;border-top:1px solid #f0f0f0;">${formatNum(metrics.totalSubscribers)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#555;font-size:13px;border-top:1px solid #f0f0f0;">Unikátní session:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:700;color:#333;border-top:1px solid #f0f0f0;">${formatNum(metrics.uniqueSessions)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fa;padding:20px 32px;border-top:1px solid #eee;">
              <p style="color:#999;font-size:11px;margin:0;text-align:center;">
                Automatický denní report z AKČNÍ-LETENKY.com · ${formatDate(metrics.period.end)}
              </p>
              <p style="color:#ccc;font-size:10px;margin:8px 0 0;text-align:center;">
                Pro správu reportů navštivte admin dashboard.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============ Plain Text Version ============

export function generateDailyReportText(metrics: DailyMetrics, comparison?: DayOverDayComparison): string {
  const formatNum = (n: number) => new Intl.NumberFormat("cs-CZ").format(n);
  const changes = comparison?.changes;

  const trendText = (change: { value: number; percent: number } | undefined) => {
    if (!change) return "";
    const sign = change.value > 0 ? "+" : "";
    const arrow = change.value > 0 ? "↑" : change.value < 0 ? "↓" : "→";
    return ` ${arrow} ${sign}${change.value} (${sign}${change.percent}%)`;
  };

  const topDests = metrics.topDestinations
    .map((d, i) => `  ${i + 1}. ${d.destination}: ${formatNum(d.clicks)} kliků`)
    .join("\n") || "  Žádné kliky";

  return `📊 AKČNÍ-LETENKY.com – Denní report (${metrics.date})
═══════════════════════════════════════
${comparison?.previous ? `Srovnání s: ${comparison.previous.date}` : "Období: posledních 24 hodin"}

🔗 AFFILIATE VÝKON
  Celkem kliků: ${formatNum(metrics.affiliateClicks)}${trendText(changes?.affiliateClicks)}
  Top destinace:
${topDests}

🔔 HLÍDAČ CEN
  Aktivní hlídače: ${formatNum(metrics.activePriceAlerts)}
  Odeslané notifikace: ${formatNum(metrics.priceAlertNotificationsSent)}${trendText(changes?.priceAlertNotificationsSent)}
  Emaily odeslány: ${formatNum(metrics.priceAlertEmailsSent)}
  Emaily selhaly: ${formatNum(metrics.priceAlertEmailsFailed)}

📱 SOCIÁLNÍ SDÍLENÍ
  Celkem sdílení: ${formatNum(metrics.socialShares)}${trendText(changes?.socialShares)}

🤖 CHATBOT
  Konverzace: ${formatNum(metrics.chatbotConversations)}${trendText(changes?.chatbotConversations)}
  Nové leady: ${formatNum(metrics.chatbotLeads)}${trendText(changes?.chatbotLeads)}

📈 CELKOVÉ STATISTIKY
  Celkem uživatelů: ${formatNum(metrics.totalUsers)}
  Celkem odběratelů: ${formatNum(metrics.totalSubscribers)}
  Zobrazení stránek: ${formatNum(metrics.pageViews)}${trendText(changes?.pageViews)}
  Unikátní session: ${formatNum(metrics.uniqueSessions)}
  Nové registrace: ${formatNum(metrics.newRegistrations)}${trendText(changes?.newRegistrations)}

---
Automatický denní report z AKČNÍ-LETENKY.com`;
}

// ============ Send Report ============

/**
 * Send the daily report via email (Resend) and owner notification
 * Now includes day-over-day comparison
 */
export async function sendDailyReport(): Promise<{
  success: boolean;
  metrics: DailyMetrics;
  comparison: DayOverDayComparison;
  emailSent: boolean;
  ownerNotified: boolean;
  error?: string;
}> {
  console.log("[DailyReport] Generating daily report with day-over-day comparison...");

  const metrics = await collectDailyMetrics();
  const previousMetrics = await getPreviousDayMetrics();
  const comparison = calculateDayOverDay(metrics, previousMetrics);

  let emailSent = false;
  let ownerNotified = false;

  // Send via Resend if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromEmail = process.env.RESEND_FROM_EMAIL || "Akční Letenky <onboarding@resend.dev>";
      const toEmail = process.env.DAILY_REPORT_EMAIL || process.env.OWNER_EMAIL || "onboarding@resend.dev";

      const { error } = await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: `📊 Denní report – ${metrics.date} | ${metrics.affiliateClicks} kliků, ${metrics.newRegistrations} registrací`,
        html: generateDailyReportHTML(metrics, comparison),
        text: generateDailyReportText(metrics, comparison),
      });

      if (error) {
        console.error("[DailyReport] Email send error:", error);
      } else {
        emailSent = true;
        console.log("[DailyReport] Email report sent successfully");
      }
    } catch (err) {
      console.error("[DailyReport] Failed to send email:", err);
    }
  }

  // Always send owner notification as backup
  try {
    const changes = comparison.changes;
    const trendText = (label: string, val: number, change?: { value: number; percent: number }) => {
      const sign = change && change.value > 0 ? "+" : "";
      const trend = change ? ` (${sign}${change.value})` : "";
      return `${label}: ${val}${trend}`;
    };

    const summary = [
      trendText("Affiliate kliky", metrics.affiliateClicks, changes?.affiliateClicks),
      trendText("Zobrazení", metrics.pageViews, changes?.pageViews),
      trendText("Nové registrace", metrics.newRegistrations, changes?.newRegistrations),
      trendText("Noví odběratelé", metrics.newSubscribers, changes?.newSubscribers),
      `Hlídače cen: ${metrics.activePriceAlerts} aktivních`,
      trendText("Chatbot konverzace", metrics.chatbotConversations, changes?.chatbotConversations),
      trendText("Chatbot leady", metrics.chatbotLeads, changes?.chatbotLeads),
    ].join("\n");

    ownerNotified = await notifyOwner({
      title: `📊 Denní report – ${metrics.date}`,
      content: summary,
    });
  } catch (err) {
    console.error("[DailyReport] Failed to notify owner:", err);
  }

  // Save metrics for future comparison
  await saveDailyMetrics(metrics, emailSent, ownerNotified);

  console.log(`[DailyReport] Report complete: email=${emailSent}, owner=${ownerNotified}, hasPreviousDay=${!!previousMetrics}`);

  return {
    success: emailSent || ownerNotified,
    metrics,
    comparison,
    emailSent,
    ownerNotified,
  };
}

// ============ Cron Scheduler ============

const DAILY_REPORT_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
let dailyReportTimeout: NodeJS.Timeout | null = null;
let dailyReportInterval: NodeJS.Timeout | null = null;
let lastReportResult: Awaited<ReturnType<typeof sendDailyReport>> | null = null;

/**
 * Calculate milliseconds until next 7:00 AM CET
 */
function msUntilNext7AM(): number {
  const now = new Date();
  const cetOffset = 1; // hours
  const nowUTC = now.getTime();
  const nowCET = new Date(nowUTC + cetOffset * 60 * 60 * 1000);

  const next7AM = new Date(nowCET);
  next7AM.setHours(7, 0, 0, 0);

  if (nowCET >= next7AM) {
    next7AM.setDate(next7AM.getDate() + 1);
  }

  const next7AMUTC = next7AM.getTime() - cetOffset * 60 * 60 * 1000;
  return next7AMUTC - nowUTC;
}

/**
 * Schedule the daily report cron job to run at 7:00 AM CET every day
 */
export function scheduleDailyReport() {
  const msUntil = msUntilNext7AM();
  const hoursUntil = (msUntil / (1000 * 60 * 60)).toFixed(1);

  console.log(`[DailyReport] Scheduling daily report at 7:00 AM CET (in ${hoursUntil} hours)`);

  dailyReportTimeout = setTimeout(() => {
    sendDailyReport()
      .then((result) => {
        lastReportResult = result;
      })
      .catch((err) => {
        console.error("[DailyReport] Scheduled report failed:", err);
      });

    dailyReportInterval = setInterval(() => {
      sendDailyReport()
        .then((result) => {
          lastReportResult = result;
        })
        .catch((err) => {
          console.error("[DailyReport] Scheduled report failed:", err);
        });
    }, DAILY_REPORT_INTERVAL_MS);
  }, msUntil);
}

/**
 * Get the last report result for monitoring
 */
export function getLastReportResult() {
  return lastReportResult;
}

/**
 * Stop the daily report cron job
 */
export function stopDailyReport() {
  if (dailyReportTimeout) {
    clearTimeout(dailyReportTimeout);
    dailyReportTimeout = null;
  }
  if (dailyReportInterval) {
    clearInterval(dailyReportInterval);
    dailyReportInterval = null;
  }
  console.log("[DailyReport] Cron job stopped");
}
