/**
 * Weekly Summary Report Service
 * 
 * Aggregates key business metrics for the past week and compares them
 * with the previous week. Sent every Monday at 8:00 AM CET.
 * 
 * Provides strategic insights and trend analysis for decision-making.
 */

import { collectMetricsForPeriod, type DailyMetrics } from "./dailyReport";
import { notifyOwner } from "./_core/notification";
import { Resend } from "resend";
import { getDb } from "./db";
import { dailyReportLog } from "../drizzle/schema";
import { desc, gte, lte, and } from "drizzle-orm";
import { generateStrategicRecommendations, generateRecommendationsHTML, type WeeklyStrategy } from "./strategicRecommendations";

// ============ Types ============

export interface WeeklyMetrics {
  weekLabel: string; // e.g. "3. - 9. února 2026"
  period: { start: Date; end: Date };
  dailyBreakdown: Array<{ date: string; metrics: DailyMetrics }>;

  // Aggregated totals
  totalAffiliateClicks: number;
  totalPageViews: number;
  totalNewRegistrations: number;
  totalNewSubscribers: number;
  totalChatbotConversations: number;
  totalChatbotLeads: number;
  totalSocialShares: number;
  totalPriceAlertNotifications: number;
  totalEmailsSent: number;

  // Averages
  avgDailyClicks: number;
  avgDailyPageViews: number;

  // Top performers
  topDestinations: Array<{ destination: string; clicks: number }>;
  bestDay: { date: string; clicks: number } | null;
  worstDay: { date: string; clicks: number } | null;
}

export interface WeekOverWeekComparison {
  current: WeeklyMetrics;
  previous: WeeklyMetrics | null;
  changes: {
    affiliateClicks: { value: number; percent: number };
    pageViews: { value: number; percent: number };
    newRegistrations: { value: number; percent: number };
    newSubscribers: { value: number; percent: number };
    chatbotConversations: { value: number; percent: number };
    chatbotLeads: { value: number; percent: number };
    socialShares: { value: number; percent: number };
  } | null;
}

// ============ Metrics Collection ============

/**
 * Collect weekly metrics by aggregating daily data
 */
export async function collectWeeklyMetrics(weekStart: Date, weekEnd: Date): Promise<WeeklyMetrics> {
  const formatDateCZ = (d: Date) =>
    d.toLocaleDateString("cs-CZ", { day: "numeric", month: "long" });

  const weekLabel = `${formatDateCZ(weekStart)} - ${formatDateCZ(weekEnd)} ${weekEnd.getFullYear()}`;

  // Collect daily metrics for each day
  const dailyBreakdown: Array<{ date: string; metrics: DailyMetrics }> = [];
  const current = new Date(weekStart);

  while (current < weekEnd) {
    const dayStart = new Date(current);
    const dayEnd = new Date(current.getTime() + 24 * 60 * 60 * 1000);
    if (dayEnd > weekEnd) break;

    const dayMetrics = await collectMetricsForPeriod(dayStart, dayEnd);
    dailyBreakdown.push({
      date: dayStart.toISOString().split("T")[0],
      metrics: dayMetrics,
    });

    current.setDate(current.getDate() + 1);
  }

  // Aggregate totals
  const totals = dailyBreakdown.reduce(
    (acc, day) => ({
      affiliateClicks: acc.affiliateClicks + day.metrics.affiliateClicks,
      pageViews: acc.pageViews + day.metrics.pageViews,
      newRegistrations: acc.newRegistrations + day.metrics.newRegistrations,
      newSubscribers: acc.newSubscribers + day.metrics.newSubscribers,
      chatbotConversations: acc.chatbotConversations + day.metrics.chatbotConversations,
      chatbotLeads: acc.chatbotLeads + day.metrics.chatbotLeads,
      socialShares: acc.socialShares + day.metrics.socialShares,
      priceAlertNotifications: acc.priceAlertNotifications + day.metrics.priceAlertNotificationsSent,
      emailsSent: acc.emailsSent + day.metrics.priceAlertEmailsSent,
    }),
    {
      affiliateClicks: 0,
      pageViews: 0,
      newRegistrations: 0,
      newSubscribers: 0,
      chatbotConversations: 0,
      chatbotLeads: 0,
      socialShares: 0,
      priceAlertNotifications: 0,
      emailsSent: 0,
    }
  );

  // Top destinations across the week
  const destMap = new Map<string, number>();
  for (const day of dailyBreakdown) {
    for (const dest of day.metrics.topDestinations) {
      destMap.set(dest.destination, (destMap.get(dest.destination) || 0) + dest.clicks);
    }
  }
  const topDestinations = Array.from(destMap.entries())
    .map(([destination, clicks]) => ({ destination, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  // Best and worst days
  const sortedByClicks = [...dailyBreakdown].sort(
    (a, b) => b.metrics.affiliateClicks - a.metrics.affiliateClicks
  );
  const bestDay = sortedByClicks.length > 0
    ? { date: sortedByClicks[0].date, clicks: sortedByClicks[0].metrics.affiliateClicks }
    : null;
  const worstDay = sortedByClicks.length > 0
    ? { date: sortedByClicks[sortedByClicks.length - 1].date, clicks: sortedByClicks[sortedByClicks.length - 1].metrics.affiliateClicks }
    : null;

  const days = dailyBreakdown.length || 1;

  return {
    weekLabel,
    period: { start: weekStart, end: weekEnd },
    dailyBreakdown,
    totalAffiliateClicks: totals.affiliateClicks,
    totalPageViews: totals.pageViews,
    totalNewRegistrations: totals.newRegistrations,
    totalNewSubscribers: totals.newSubscribers,
    totalChatbotConversations: totals.chatbotConversations,
    totalChatbotLeads: totals.chatbotLeads,
    totalSocialShares: totals.socialShares,
    totalPriceAlertNotifications: totals.priceAlertNotifications,
    totalEmailsSent: totals.emailsSent,
    avgDailyClicks: Math.round(totals.affiliateClicks / days),
    avgDailyPageViews: Math.round(totals.pageViews / days),
    topDestinations,
    bestDay,
    worstDay,
  };
}

/**
 * Calculate week-over-week comparison
 */
export function calculateWeekOverWeek(
  current: WeeklyMetrics,
  previous: WeeklyMetrics | null
): WeekOverWeekComparison {
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
      affiliateClicks: calcChange(current.totalAffiliateClicks, previous.totalAffiliateClicks),
      pageViews: calcChange(current.totalPageViews, previous.totalPageViews),
      newRegistrations: calcChange(current.totalNewRegistrations, previous.totalNewRegistrations),
      newSubscribers: calcChange(current.totalNewSubscribers, previous.totalNewSubscribers),
      chatbotConversations: calcChange(current.totalChatbotConversations, previous.totalChatbotConversations),
      chatbotLeads: calcChange(current.totalChatbotLeads, previous.totalChatbotLeads),
      socialShares: calcChange(current.totalSocialShares, previous.totalSocialShares),
    },
  };
}

// ============ HTML Email Template ============

function trendBadge(change: { value: number; percent: number }): string {
  const arrow = change.value > 0 ? "↑" : change.value < 0 ? "↓" : "→";
  const color = change.value > 0 ? "#4CAF50" : change.value < 0 ? "#f44336" : "#999";
  const sign = change.value > 0 ? "+" : "";
  return `<span style="font-size:11px;color:${color};font-weight:600;">${arrow} ${sign}${change.percent}%</span>`;
}

export function generateWeeklyReportHTML(metrics: WeeklyMetrics, comparison?: WeekOverWeekComparison): string {
  const formatNum = (n: number) => new Intl.NumberFormat("cs-CZ").format(n);
  const changes = comparison?.changes;

  const topDestsHTML = metrics.topDestinations.length > 0
    ? metrics.topDestinations
        .map((d, i) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;color:#555;">${i + 1}.</td><td style="padding:6px 12px;border-bottom:1px solid #eee;font-weight:600;">${d.destination}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;color:#0052CC;font-weight:700;">${formatNum(d.clicks)}</td></tr>`)
        .join("")
    : '<tr><td colspan="3" style="padding:12px;color:#999;text-align:center;">Žádné kliky tento týden</td></tr>';

  // Daily trend mini-chart (text-based bar chart)
  const maxClicks = Math.max(...metrics.dailyBreakdown.map(d => d.metrics.affiliateClicks), 1);
  const dailyBarsHTML = metrics.dailyBreakdown.map(day => {
    const dayName = new Date(day.date).toLocaleDateString("cs-CZ", { weekday: "short" });
    const barWidth = Math.max(5, Math.round((day.metrics.affiliateClicks / maxClicks) * 100));
    return `<tr>
      <td style="padding:4px 8px;font-size:11px;color:#666;width:40px;">${dayName}</td>
      <td style="padding:4px 8px;">
        <div style="background:#E91E63;height:16px;width:${barWidth}%;border-radius:3px;min-width:4px;"></div>
      </td>
      <td style="padding:4px 8px;font-size:11px;color:#333;font-weight:600;text-align:right;width:50px;">${day.metrics.affiliateClicks}</td>
    </tr>`;
  }).join("");

  const comparisonNote = comparison?.previous
    ? `<p style="color:rgba(255,255,255,0.6);font-size:11px;margin:4px 0 0;">Srovnání s předchozím týdnem (${comparison.previous.weekLabel})</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Týdenní report – ${metrics.weekLabel}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f0f2f5;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a237e,#3949ab);padding:28px 40px;text-align:center;">
              <span style="font-size:28px;">📈</span>
              <h1 style="color:#ffffff;font-size:20px;margin:8px 0 4px;font-weight:700;">AKČNÍ-LETENKY.com</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">Týdenní souhrn – ${metrics.weekLabel}</p>
              ${comparisonNote}
            </td>
          </tr>

          <!-- Key Weekly Metrics -->
          <tr>
            <td style="padding:24px 32px 8px;">
              <h2 style="color:#1a237e;font-size:16px;margin:0 0 16px;border-bottom:2px solid #E91E63;padding-bottom:8px;">📊 Týdenní přehled</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="25%" style="text-align:center;padding:12px 8px;background:#f8f9fa;border-radius:8px;">
                    <p style="color:#E91E63;font-size:28px;font-weight:800;margin:0;">${formatNum(metrics.totalAffiliateClicks)}</p>
                    <p style="color:#666;font-size:10px;margin:4px 0 0;text-transform:uppercase;">Affiliate kliky</p>
                    ${changes ? `<p style="margin:2px 0 0;">${trendBadge(changes.affiliateClicks)}</p>` : ""}
                  </td>
                  <td width="4%"></td>
                  <td width="25%" style="text-align:center;padding:12px 8px;background:#f8f9fa;border-radius:8px;">
                    <p style="color:#FF6B35;font-size:28px;font-weight:800;margin:0;">${formatNum(metrics.totalPageViews)}</p>
                    <p style="color:#666;font-size:10px;margin:4px 0 0;text-transform:uppercase;">Zobrazení</p>
                    ${changes ? `<p style="margin:2px 0 0;">${trendBadge(changes.pageViews)}</p>` : ""}
                  </td>
                  <td width="4%"></td>
                  <td width="25%" style="text-align:center;padding:12px 8px;background:#f8f9fa;border-radius:8px;">
                    <p style="color:#0052CC;font-size:28px;font-weight:800;margin:0;">${formatNum(metrics.totalNewRegistrations)}</p>
                    <p style="color:#666;font-size:10px;margin:4px 0 0;text-transform:uppercase;">Registrace</p>
                    ${changes ? `<p style="margin:2px 0 0;">${trendBadge(changes.newRegistrations)}</p>` : ""}
                  </td>
                  <td width="4%"></td>
                  <td width="25%" style="text-align:center;padding:12px 8px;background:#f8f9fa;border-radius:8px;">
                    <p style="color:#4CAF50;font-size:28px;font-weight:800;margin:0;">${formatNum(metrics.totalNewSubscribers)}</p>
                    <p style="color:#666;font-size:10px;margin:4px 0 0;text-transform:uppercase;">Odběratelé</p>
                    ${changes ? `<p style="margin:2px 0 0;">${trendBadge(changes.newSubscribers)}</p>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Daily Trend Chart -->
          <tr>
            <td style="padding:16px 32px 8px;">
              <h2 style="color:#1a237e;font-size:16px;margin:0 0 12px;border-bottom:2px solid #FFD700;padding-bottom:8px;">📅 Denní trend (affiliate kliky)</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${dailyBarsHTML}
              </table>
              <p style="color:#999;font-size:11px;margin:8px 0 0;">Průměr: <strong>${formatNum(metrics.avgDailyClicks)}</strong> kliků/den · Zobrazení: <strong>${formatNum(metrics.avgDailyPageViews)}</strong>/den</p>
              ${metrics.bestDay ? `<p style="color:#4CAF50;font-size:11px;margin:4px 0 0;">🏆 Nejlepší den: <strong>${metrics.bestDay.date}</strong> (${formatNum(metrics.bestDay.clicks)} kliků)</p>` : ""}
              ${metrics.worstDay ? `<p style="color:#f44336;font-size:11px;margin:2px 0 0;">📉 Nejslabší den: <strong>${metrics.worstDay.date}</strong> (${formatNum(metrics.worstDay.clicks)} kliků)</p>` : ""}
            </td>
          </tr>

          <!-- Top Destinations -->
          <tr>
            <td style="padding:16px 32px 8px;">
              <h2 style="color:#1a237e;font-size:16px;margin:0 0 12px;border-bottom:2px solid #4CAF50;padding-bottom:8px;">🏆 Top destinace týdne</h2>
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

          <!-- Additional Metrics -->
          <tr>
            <td style="padding:16px 32px 8px;">
              <h2 style="color:#1a237e;font-size:16px;margin:0 0 12px;border-bottom:2px solid #9C27B0;padding-bottom:8px;">📋 Další metriky</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:8px 0;color:#555;font-size:13px;">Chatbot konverzace:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:700;color:#333;">${formatNum(metrics.totalChatbotConversations)} ${changes ? trendBadge(changes.chatbotConversations) : ""}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#555;font-size:13px;border-top:1px solid #f0f0f0;">Chatbot leady:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:700;color:#FF9800;border-top:1px solid #f0f0f0;">${formatNum(metrics.totalChatbotLeads)} ${changes ? trendBadge(changes.chatbotLeads) : ""}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#555;font-size:13px;border-top:1px solid #f0f0f0;">Sociální sdílení:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:700;color:#333;border-top:1px solid #f0f0f0;">${formatNum(metrics.totalSocialShares)} ${changes ? trendBadge(changes.socialShares) : ""}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#555;font-size:13px;border-top:1px solid #f0f0f0;">Price alert notifikace:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:700;color:#333;border-top:1px solid #f0f0f0;">${formatNum(metrics.totalPriceAlertNotifications)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#555;font-size:13px;border-top:1px solid #f0f0f0;">Emaily odeslány:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:700;color:#4CAF50;border-top:1px solid #f0f0f0;">${formatNum(metrics.totalEmailsSent)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fa;padding:20px 32px;border-top:1px solid #eee;">
              <p style="color:#999;font-size:11px;margin:0;text-align:center;">
                Automatický týdenní report z AKČNÍ-LETENKY.com · ${metrics.weekLabel}
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

export function generateWeeklyReportText(metrics: WeeklyMetrics, comparison?: WeekOverWeekComparison): string {
  const formatNum = (n: number) => new Intl.NumberFormat("cs-CZ").format(n);
  const changes = comparison?.changes;

  const trendText = (change: { value: number; percent: number } | undefined) => {
    if (!change) return "";
    const sign = change.value > 0 ? "+" : "";
    const arrow = change.value > 0 ? "↑" : change.value < 0 ? "↓" : "→";
    return ` ${arrow} ${sign}${change.percent}%`;
  };

  const topDests = metrics.topDestinations
    .map((d, i) => `  ${i + 1}. ${d.destination}: ${formatNum(d.clicks)} kliků`)
    .join("\n") || "  Žádné kliky";

  const dailyTrend = metrics.dailyBreakdown
    .map(d => {
      const dayName = new Date(d.date).toLocaleDateString("cs-CZ", { weekday: "short" });
      return `  ${dayName} (${d.date}): ${d.metrics.affiliateClicks} kliků, ${d.metrics.pageViews} zobrazení`;
    })
    .join("\n");

  return `📈 AKČNÍ-LETENKY.com – Týdenní souhrn (${metrics.weekLabel})
═══════════════════════════════════════

🔗 AFFILIATE VÝKON
  Celkem kliků: ${formatNum(metrics.totalAffiliateClicks)}${trendText(changes?.affiliateClicks)}
  Průměr/den: ${formatNum(metrics.avgDailyClicks)}
  Top destinace:
${topDests}

📅 DENNÍ TREND
${dailyTrend}
${metrics.bestDay ? `  🏆 Nejlepší: ${metrics.bestDay.date} (${metrics.bestDay.clicks} kliků)` : ""}
${metrics.worstDay ? `  📉 Nejslabší: ${metrics.worstDay.date} (${metrics.worstDay.clicks} kliků)` : ""}

📊 CELKOVÝ PŘEHLED
  Zobrazení stránek: ${formatNum(metrics.totalPageViews)}${trendText(changes?.pageViews)}
  Nové registrace: ${formatNum(metrics.totalNewRegistrations)}${trendText(changes?.newRegistrations)}
  Noví odběratelé: ${formatNum(metrics.totalNewSubscribers)}${trendText(changes?.newSubscribers)}
  Chatbot konverzace: ${formatNum(metrics.totalChatbotConversations)}${trendText(changes?.chatbotConversations)}
  Chatbot leady: ${formatNum(metrics.totalChatbotLeads)}${trendText(changes?.chatbotLeads)}
  Sociální sdílení: ${formatNum(metrics.totalSocialShares)}${trendText(changes?.socialShares)}

---
Automatický týdenní report z AKČNÍ-LETENKY.com`;
}

// ============ Send Report ============

let lastWeeklyResult: any = null;

export async function sendWeeklyReport(): Promise<{
  success: boolean;
  metrics: WeeklyMetrics;
  comparison: WeekOverWeekComparison;
  emailSent: boolean;
  ownerNotified: boolean;
}> {
  console.log("[WeeklyReport] Generating weekly report...");

  const now = new Date();
  // Current week: last 7 days
  const weekEnd = new Date(now);
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Previous week: 7-14 days ago
  const prevWeekEnd = new Date(weekStart);
  const prevWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  const currentMetrics = await collectWeeklyMetrics(weekStart, weekEnd);
  const previousMetrics = await collectWeeklyMetrics(prevWeekStart, prevWeekEnd);
  const comparison = calculateWeekOverWeek(currentMetrics, previousMetrics);

  // Generate strategic recommendations via LLM
  let strategy: WeeklyStrategy | null = null;
  try {
    strategy = await generateStrategicRecommendations(comparison);
    console.log(`[WeeklyReport] Generated ${strategy.recommendations.length} strategic recommendations`);
  } catch (err) {
    console.error("[WeeklyReport] Failed to generate strategic recommendations:", err);
  }

  let emailSent = false;
  let ownerNotified = false;

  // Send via Resend if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromEmail = process.env.RESEND_FROM_EMAIL || "Akční Letenky <onboarding@resend.dev>";
      const toEmail = process.env.DAILY_REPORT_EMAIL || process.env.OWNER_EMAIL || "onboarding@resend.dev";

      // Append strategic recommendations to email HTML
      let emailHtml = generateWeeklyReportHTML(currentMetrics, comparison);
      if (strategy) {
        emailHtml = emailHtml.replace(
          "</body>",
          `${generateRecommendationsHTML(strategy)}</body>`
        );
      }

      const { error } = await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: `📈 Týdenní souhrn – ${currentMetrics.weekLabel} | ${currentMetrics.totalAffiliateClicks} kliků`,
        html: emailHtml,
        text: generateWeeklyReportText(currentMetrics, comparison),
      });

      if (error) {
        console.error("[WeeklyReport] Email send error:", error);
      } else {
        emailSent = true;
      }
    } catch (err) {
      console.error("[WeeklyReport] Failed to send email:", err);
    }
  }

  // Owner notification
  try {
    const changes = comparison.changes;
    const trendText = (label: string, val: number, change?: { value: number; percent: number }) => {
      const sign = change && change.value > 0 ? "+" : "";
      const trend = change ? ` (${sign}${change.percent}%)` : "";
      return `${label}: ${val}${trend}`;
    };

    const summary = [
      `Týden: ${currentMetrics.weekLabel}`,
      "",
      trendText("Affiliate kliky", currentMetrics.totalAffiliateClicks, changes?.affiliateClicks),
      trendText("Zobrazení", currentMetrics.totalPageViews, changes?.pageViews),
      trendText("Registrace", currentMetrics.totalNewRegistrations, changes?.newRegistrations),
      trendText("Odběratelé", currentMetrics.totalNewSubscribers, changes?.newSubscribers),
      trendText("Chatbot", currentMetrics.totalChatbotConversations, changes?.chatbotConversations),
      "",
      `Průměr/den: ${currentMetrics.avgDailyClicks} kliků`,
      currentMetrics.bestDay ? `Nejlepší den: ${currentMetrics.bestDay.date} (${currentMetrics.bestDay.clicks})` : "",
    ].filter(Boolean).join("\n");

    ownerNotified = await notifyOwner({
      title: `📈 Týdenní souhrn – ${currentMetrics.weekLabel}`,
      content: summary,
    });
  } catch (err) {
    console.error("[WeeklyReport] Failed to notify owner:", err);
  }

  const result = {
    success: emailSent || ownerNotified,
    metrics: currentMetrics,
    comparison,
    strategy,
    emailSent,
    ownerNotified,
  };

  lastWeeklyResult = result;
  return result;
}

export function getLastWeeklyResult() {
  return lastWeeklyResult;
}

// ============ Cron Scheduler ============

const WEEKLY_REPORT_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
let weeklyReportTimeout: NodeJS.Timeout | null = null;
let weeklyReportInterval: NodeJS.Timeout | null = null;

/**
 * Calculate ms until next Monday 8:00 AM CET
 */
function msUntilNextMonday8AM(): number {
  const now = new Date();
  const cetOffset = 1;
  const nowUTC = now.getTime();
  const nowCET = new Date(nowUTC + cetOffset * 60 * 60 * 1000);

  const nextMonday = new Date(nowCET);
  nextMonday.setHours(8, 0, 0, 0);

  // Find next Monday
  const dayOfWeek = nowCET.getDay(); // 0=Sun, 1=Mon, ...
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? (nowCET.getHours() >= 8 ? 7 : 0) : 8 - dayOfWeek;
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);

  const nextMondayUTC = nextMonday.getTime() - cetOffset * 60 * 60 * 1000;
  return nextMondayUTC - nowUTC;
}

export function scheduleWeeklyReport() {
  const msUntil = msUntilNextMonday8AM();
  const hoursUntil = (msUntil / (1000 * 60 * 60)).toFixed(1);

  console.log(`[WeeklyReport] Scheduling weekly report for Monday 8:00 AM CET (in ${hoursUntil} hours)`);

  weeklyReportTimeout = setTimeout(() => {
    sendWeeklyReport().catch((err) => {
      console.error("[WeeklyReport] Scheduled report failed:", err);
    });

    weeklyReportInterval = setInterval(() => {
      sendWeeklyReport().catch((err) => {
        console.error("[WeeklyReport] Scheduled report failed:", err);
      });
    }, WEEKLY_REPORT_INTERVAL_MS);
  }, msUntil);
}

export function stopWeeklyReport() {
  if (weeklyReportTimeout) {
    clearTimeout(weeklyReportTimeout);
    weeklyReportTimeout = null;
  }
  if (weeklyReportInterval) {
    clearInterval(weeklyReportInterval);
    weeklyReportInterval = null;
  }
  console.log("[WeeklyReport] Cron job stopped");
}
