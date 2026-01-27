import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import {
  chatbotConversations,
  chatbotMessages,
  chatbotLeads,
  chatbotConversions,
  chatbotAnalytics,
} from "../drizzle/schema";
import { eq, and, gte, lte, desc, sql, count } from "drizzle-orm";

/**
 * Admin Analytics Router
 * 
 * Provides real-time metrics for:
 * - Conversion rates
 * - ROI calculation
 * - Top destinations
 * - Chatbot statistics
 * - Lead quality scoring
 */

export const adminAnalyticsRouter = router({
  // Get dashboard overview metrics
  getDashboardMetrics: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);

      // Total conversations
      const [conversationsResult] = await db
        .select({ count: count() })
        .from(chatbotConversations)
        .where(
          and(
            gte(chatbotConversations.createdAt, start),
            lte(chatbotConversations.createdAt, end)
          )
        );

      const totalConversations = conversationsResult?.count || 0;

      // Converted conversations
      const [convertedResult] = await db
        .select({ count: count() })
        .from(chatbotConversations)
        .where(
          and(
            gte(chatbotConversations.createdAt, start),
            lte(chatbotConversations.createdAt, end),
            eq(chatbotConversations.converted, 1)
          )
        );

      const convertedConversations = convertedResult?.count || 0;

      // Total leads
      const [leadsResult] = await db
        .select({ count: count() })
        .from(chatbotLeads)
        .where(
          and(
            gte(chatbotLeads.createdAt, start),
            lte(chatbotLeads.createdAt, end)
          )
        );

      const totalLeads = leadsResult?.count || 0;

      // Hot leads
      const [hotLeadsResult] = await db
        .select({ count: count() })
        .from(chatbotLeads)
        .where(
          and(
            gte(chatbotLeads.createdAt, start),
            lte(chatbotLeads.createdAt, end),
            eq(chatbotLeads.leadQuality, "hot")
          )
        );

      const hotLeads = hotLeadsResult?.count || 0;

      // Total conversions and revenue
      const conversionsData = await db
        .select({
          count: count(),
          totalRevenue: sql<number>`SUM(${chatbotConversions.bookingValue})`,
          totalCommissions: sql<number>`SUM(${chatbotConversions.commissionAmount})`,
        })
        .from(chatbotConversions)
        .where(
          and(
            gte(chatbotConversions.createdAt, start),
            lte(chatbotConversions.createdAt, end)
          )
        );

      const totalConversions = conversionsData[0]?.count || 0;
      const totalRevenue = Number(conversionsData[0]?.totalRevenue) || 0;
      const totalCommissions = Number(conversionsData[0]?.totalCommissions) || 0;

      // Calculate conversion rate
      const conversionRate =
        totalConversations > 0
          ? ((convertedConversations / totalConversations) * 100).toFixed(2)
          : "0.00";

      // Calculate ROI (assuming some operational costs)
      const operationalCosts = 0; // TODO: Add actual costs tracking
      const roi =
        operationalCosts > 0
          ? (((totalCommissions - operationalCosts) / operationalCosts) * 100).toFixed(2)
          : totalCommissions > 0
          ? "∞"
          : "0.00";

      return {
        overview: {
          totalConversations,
          convertedConversations,
          conversionRate: `${conversionRate}%`,
          totalLeads,
          hotLeads,
          totalConversions,
          totalRevenue,
          totalCommissions,
          roi: `${roi}%`,
        },
      };
    }),

  // Get top destinations by conversions
  getTopDestinations: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);

      const topDestinations = await db
        .select({
          destination: chatbotConversations.destination,
          clicks: sql<number>`SUM(${chatbotConversations.clickedOffer})`,
          conversions: sql<number>`SUM(${chatbotConversations.converted})`,
          revenue: sql<number>`SUM(${chatbotConversations.conversionValue})`,
        })
        .from(chatbotConversations)
        .where(
          and(
            gte(chatbotConversations.createdAt, start),
            lte(chatbotConversations.createdAt, end),
            sql`${chatbotConversations.destination} IS NOT NULL`
          )
        )
        .groupBy(chatbotConversations.destination)
        .orderBy(desc(sql`SUM(${chatbotConversations.converted})`))
        .limit(input.limit);

      return {
        destinations: topDestinations.map((d) => ({
          destination: d.destination,
          clicks: Number(d.clicks) || 0,
          conversions: Number(d.conversions) || 0,
          revenue: Number(d.revenue) || 0,
          conversionRate:
            Number(d.clicks) > 0
              ? ((Number(d.conversions) / Number(d.clicks)) * 100).toFixed(2) + "%"
              : "0.00%",
        })),
      };
    }),

  // Get chatbot conversation statistics
  getChatbotStats: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);

      const stats = await db
        .select({
          totalConversations: count(),
          avgMessageCount: sql<number>`AVG(${chatbotConversations.messageCount})`,
          activeConversations: sql<number>`SUM(CASE WHEN ${chatbotConversations.status} = 'active' THEN 1 ELSE 0 END)`,
          convertedConversations: sql<number>`SUM(CASE WHEN ${chatbotConversations.status} = 'converted' THEN 1 ELSE 0 END)`,
          abandonedConversations: sql<number>`SUM(CASE WHEN ${chatbotConversations.status} = 'abandoned' THEN 1 ELSE 0 END)`,
          joinedCommunity: sql<number>`SUM(${chatbotConversations.joinedCommunity})`,
        })
        .from(chatbotConversations)
        .where(
          and(
            gte(chatbotConversations.createdAt, start),
            lte(chatbotConversations.createdAt, end)
          )
        );

      return {
        stats: {
          totalConversations: stats[0]?.totalConversations || 0,
          avgMessageCount: Number(stats[0]?.avgMessageCount || 0).toFixed(1),
          activeConversations: Number(stats[0]?.activeConversations) || 0,
          convertedConversations: Number(stats[0]?.convertedConversations) || 0,
          abandonedConversations: Number(stats[0]?.abandonedConversations) || 0,
          joinedCommunity: Number(stats[0]?.joinedCommunity) || 0,
        },
      };
    }),

  // Get lead quality breakdown
  getLeadQuality: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);

      const quality = await db
        .select({
          leadQuality: chatbotLeads.leadQuality,
          count: count(),
        })
        .from(chatbotLeads)
        .where(
          and(
            gte(chatbotLeads.createdAt, start),
            lte(chatbotLeads.createdAt, end)
          )
        )
        .groupBy(chatbotLeads.leadQuality);

      const qualityMap: Record<string, number> = {
        hot: 0,
        warm: 0,
        cold: 0,
      };

      quality.forEach((q: { leadQuality: string | null; count: number }) => {
        if (q.leadQuality) {
          qualityMap[q.leadQuality] = q.count;
        }
      });

      const total = qualityMap.hot + qualityMap.warm + qualityMap.cold;

      return {
        quality: {
          hot: qualityMap.hot,
          warm: qualityMap.warm,
          cold: qualityMap.cold,
          total,
          hotPercentage: total > 0 ? ((qualityMap.hot / total) * 100).toFixed(1) + "%" : "0%",
          warmPercentage: total > 0 ? ((qualityMap.warm / total) * 100).toFixed(1) + "%" : "0%",
          coldPercentage: total > 0 ? ((qualityMap.cold / total) * 100).toFixed(1) + "%" : "0%",
        },
      };
    }),

  // Get recent conversations for monitoring
  getRecentConversations: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const conversations = await db
        .select({
          id: chatbotConversations.id,
          sessionId: chatbotConversations.sessionId,
          status: chatbotConversations.status,
          leadQuality: chatbotConversations.leadQuality,
          destination: chatbotConversations.destination,
          budget: chatbotConversations.budget,
          email: chatbotConversations.email,
          phone: chatbotConversations.phone,
          name: chatbotConversations.name,
          messageCount: chatbotConversations.messageCount,
          clickedOffer: chatbotConversations.clickedOffer,
          joinedCommunity: chatbotConversations.joinedCommunity,
          converted: chatbotConversations.converted,
          conversionValue: chatbotConversations.conversionValue,
          createdAt: chatbotConversations.createdAt,
          lastMessageAt: chatbotConversations.lastMessageAt,
        })
        .from(chatbotConversations)
        .orderBy(desc(chatbotConversations.lastMessageAt))
        .limit(input.limit);

      return { conversations };
    }),

  // Get conversation timeline (daily stats)
  getConversationTimeline: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);

      const timeline = await db
        .select({
          date: sql<string>`DATE(${chatbotConversations.createdAt})`,
          conversations: count(),
          converted: sql<number>`SUM(${chatbotConversations.converted})`,
          revenue: sql<number>`SUM(${chatbotConversations.conversionValue})`,
        })
        .from(chatbotConversations)
        .where(
          and(
            gte(chatbotConversations.createdAt, start),
            lte(chatbotConversations.createdAt, end)
          )
        )
        .groupBy(sql`DATE(${chatbotConversations.createdAt})`)
        .orderBy(sql`DATE(${chatbotConversations.createdAt})`);

      return {
        timeline: timeline.map((t: { date: string; conversations: number; converted: number; revenue: number }) => ({
          date: t.date,
          conversations: t.conversations,
          converted: Number(t.converted) || 0,
          revenue: Number(t.revenue) || 0,
        })),
      };
    }),
});
