/**
 * Historical Analytics Service
 * 
 * Provides 30-day historical data for admin dashboard charts.
 * Aggregates data from daily_report_log and live database queries.
 */

import { getDb } from "./db";
import {
  affiliateClicks,
  users,
  emailCaptures,
  chatbotConversations,
  chatbotLeads,
  browsingHistory,
  socialShares,
  dailyReportLog,
} from "../drizzle/schema";
import { sql, gte, count, and, desc } from "drizzle-orm";

export interface DailyDataPoint {
  date: string; // YYYY-MM-DD
  affiliateClicks: number;
  pageViews: number;
  registrations: number;
  subscribers: number;
  chatbotConversations: number;
  chatbotLeads: number;
  socialShares: number;
}

/**
 * Get historical metrics from daily_report_log for the last N days
 */
export async function getHistoricalFromReportLog(days: number = 30): Promise<DailyDataPoint[]> {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const logs = await db
      .select({
        reportDate: dailyReportLog.reportDate,
        metricsJson: dailyReportLog.metricsJson,
      })
      .from(dailyReportLog)
      .where(gte(dailyReportLog.createdAt, startDate))
      .orderBy(dailyReportLog.reportDate);

    return logs
      .filter((log) => log.metricsJson)
      .map((log) => {
        try {
          const m = JSON.parse(log.metricsJson!);
          return {
            date: log.reportDate,
            affiliateClicks: m.affiliateClicks || 0,
            pageViews: m.pageViews || 0,
            registrations: m.newRegistrations || 0,
            subscribers: m.newSubscribers || 0,
            chatbotConversations: m.chatbotConversations || 0,
            chatbotLeads: m.chatbotLeads || 0,
            socialShares: m.socialShares || 0,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean) as DailyDataPoint[];
  } catch (err) {
    console.error("[HistoricalAnalytics] Error fetching report logs:", err);
    return [];
  }
}

/**
 * Get live historical data by querying each table directly for the last N days.
 * This is used when daily_report_log doesn't have enough data yet.
 */
export async function getLiveHistoricalData(days: number = 30): Promise<DailyDataPoint[]> {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    // Affiliate clicks per day
    const dateExpr = sql<string>`DATE(${affiliateClicks.createdAt})`;
    const clicksPerDay = await db
      .select({
        date: dateExpr,
        count: count(),
      })
      .from(affiliateClicks)
      .where(gte(affiliateClicks.createdAt, startDate))
      .groupBy(dateExpr);

    // Registrations per day
    const regDateExpr = sql<string>`DATE(${users.createdAt})`;
    const registrationsPerDay = await db
      .select({
        date: regDateExpr,
        count: count(),
      })
      .from(users)
      .where(gte(users.createdAt, startDate))
      .groupBy(regDateExpr);

    // Subscribers per day
    const subDateExpr = sql<string>`DATE(${emailCaptures.createdAt})`;
    const subscribersPerDay = await db
      .select({
        date: subDateExpr,
        count: count(),
      })
      .from(emailCaptures)
      .where(gte(emailCaptures.createdAt, startDate))
      .groupBy(subDateExpr);

    // Chatbot conversations per day
    const convDateExpr = sql<string>`DATE(${chatbotConversations.createdAt})`;
    const conversationsPerDay = await db
      .select({
        date: convDateExpr,
        count: count(),
      })
      .from(chatbotConversations)
      .where(gte(chatbotConversations.createdAt, startDate))
      .groupBy(convDateExpr);

    // Chatbot leads per day
    const leadDateExpr = sql<string>`DATE(${chatbotLeads.createdAt})`;
    const leadsPerDay = await db
      .select({
        date: leadDateExpr,
        count: count(),
      })
      .from(chatbotLeads)
      .where(gte(chatbotLeads.createdAt, startDate))
      .groupBy(leadDateExpr);

    // Browsing history (page views) per day
    const pvDateExpr = sql<string>`DATE(${browsingHistory.viewedAt})`;
    const pageViewsPerDay = await db
      .select({
        date: pvDateExpr,
        count: count(),
      })
      .from(browsingHistory)
      .where(gte(browsingHistory.viewedAt, startDate))
      .groupBy(pvDateExpr);

    // Social shares per day
    const shareDateExpr = sql<string>`DATE(${socialShares.createdAt})`;
    const sharesPerDay = await db
      .select({
        date: shareDateExpr,
        count: count(),
      })
      .from(socialShares)
      .where(gte(socialShares.createdAt, startDate))
      .groupBy(shareDateExpr);

    // Build a map of all dates
    const dateMap = new Map<string, DailyDataPoint>();

    // Generate all dates in range
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const dateStr = d.toISOString().split("T")[0];
      dateMap.set(dateStr, {
        date: dateStr,
        affiliateClicks: 0,
        pageViews: 0,
        registrations: 0,
        subscribers: 0,
        chatbotConversations: 0,
        chatbotLeads: 0,
        socialShares: 0,
      });
    }

    // Fill in data
    for (const row of clicksPerDay) {
      const existing = dateMap.get(row.date);
      if (existing) existing.affiliateClicks = row.count;
    }
    for (const row of registrationsPerDay) {
      const existing = dateMap.get(row.date);
      if (existing) existing.registrations = row.count;
    }
    for (const row of subscribersPerDay) {
      const existing = dateMap.get(row.date);
      if (existing) existing.subscribers = row.count;
    }
    for (const row of conversationsPerDay) {
      const existing = dateMap.get(row.date);
      if (existing) existing.chatbotConversations = row.count;
    }
    for (const row of leadsPerDay) {
      const existing = dateMap.get(row.date);
      if (existing) existing.chatbotLeads = row.count;
    }
    for (const row of pageViewsPerDay) {
      const existing = dateMap.get(row.date);
      if (existing) existing.pageViews = row.count;
    }
    for (const row of sharesPerDay) {
      const existing = dateMap.get(row.date);
      if (existing) existing.socialShares = row.count;
    }

    return Array.from(dateMap.values());
  } catch (err) {
    console.error("[HistoricalAnalytics] Error fetching live data:", err);
    return [];
  }
}

/**
 * Get the best data source for historical charts.
 * Prefers report log if it has enough data, otherwise uses live queries.
 */
export async function getHistoricalData(days: number = 30): Promise<{
  data: DailyDataPoint[];
  source: "report_log" | "live";
  summary: {
    totalClicks: number;
    totalPageViews: number;
    totalRegistrations: number;
    totalSubscribers: number;
    totalConversations: number;
    totalLeads: number;
    totalShares: number;
    avgDailyClicks: number;
    avgDailyPageViews: number;
    bestDay: { date: string; clicks: number } | null;
    worstDay: { date: string; clicks: number } | null;
  };
}> {
  // Try report log first
  const reportData = await getHistoricalFromReportLog(days);

  let data: DailyDataPoint[];
  let source: "report_log" | "live";

  if (reportData.length >= Math.min(days * 0.5, 7)) {
    data = reportData;
    source = "report_log";
  } else {
    data = await getLiveHistoricalData(days);
    source = "live";
  }

  // Calculate summary
  const totalClicks = data.reduce((s, d) => s + d.affiliateClicks, 0);
  const totalPageViews = data.reduce((s, d) => s + d.pageViews, 0);
  const totalRegistrations = data.reduce((s, d) => s + d.registrations, 0);
  const totalSubscribers = data.reduce((s, d) => s + d.subscribers, 0);
  const totalConversations = data.reduce((s, d) => s + d.chatbotConversations, 0);
  const totalLeads = data.reduce((s, d) => s + d.chatbotLeads, 0);
  const totalShares = data.reduce((s, d) => s + d.socialShares, 0);

  const daysWithData = data.length || 1;
  const avgDailyClicks = Math.round(totalClicks / daysWithData);
  const avgDailyPageViews = Math.round(totalPageViews / daysWithData);

  let bestDay: { date: string; clicks: number } | null = null;
  let worstDay: { date: string; clicks: number } | null = null;

  if (data.length > 0) {
    const sorted = [...data].sort((a, b) => b.affiliateClicks - a.affiliateClicks);
    bestDay = { date: sorted[0].date, clicks: sorted[0].affiliateClicks };
    worstDay = { date: sorted[sorted.length - 1].date, clicks: sorted[sorted.length - 1].affiliateClicks };
  }

  return {
    data,
    source,
    summary: {
      totalClicks,
      totalPageViews,
      totalRegistrations,
      totalSubscribers,
      totalConversations,
      totalLeads,
      totalShares,
      avgDailyClicks,
      avgDailyPageViews,
      bestDay,
      worstDay,
    },
  };
}
