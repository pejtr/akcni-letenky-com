import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getFeaturedFlights,
  getAllFlights,
  getFlightById,
  searchFlights,
  getUserWishlists,
  addToWishlist,
  removeFromWishlist,
  getOfferViews,
  incrementOfferViews,
  getAllArticles,
  getArticleBySlug,
  getRecentArticles,
  getAllDestinations,
  getDestinationBySlug,
  getFeaturedDestinations,
  recordAffiliateClick,
  getAffiliateClickStats,
  getTopDestinationsByClicks,
  getClicksBySource,
  getClickTrend,
  getRecentClicks,
} from "./db";
import {
  processChatbotMessage,
  trackChatbotConversion,
  trackCommunityJoin,
} from "./chatbot";
import {
  getABTestStatus,
  calculateABTestResults,
  autoOptimizeTrafficWeights,
  trackPersonaConversion,
  initializePersonas,
} from "./chatbotABTest";
import {
  recordAssignment,
  recordEvent,
  getTestResults,
  getEventBreakdown,
} from "./abTest";
import {
  createPriceAlert,
  getPriceAlertsByUserId,
  deactivatePriceAlert,
  deletePriceAlert,
  getPriceHistoryForDestination,
  recordPrice,
  getPriceAlertStats,
  checkPriceDropsAndNotify,
} from "./priceAlerts";
import { runPriceCheck, getLastCheckResult } from "./priceCheckCron";
import {
  createSocialShare,
  trackShareClick,
  trackShareConversion,
  validateDiscountCode,
  getSocialShareStats,
} from "./socialSharing";
import {
  trackPageView,
  getPersonalizedRecommendations,
  getPopularDestinations,
} from "./browsingHistory";
import { generateDailyArticles } from "./articleGenerator";
import { adminAnalyticsRouter } from "./adminAnalytics";
import {
  type FlightOffer,
  type VacationOffer,
  getCacheStatus,
} from "./pelikanFeed";
import { pelikanCache } from "./pelikanCache";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  flights: router({
    // Get featured flights for homepage
    featured: publicProcedure.query(async () => {
      const flights = await getFeaturedFlights();
      return flights;
    }),

    // Get all flights
    list: publicProcedure.query(async () => {
      const flights = await getAllFlights();
      return flights;
    }),

    // Get single flight by ID
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const flight = await getFlightById(input.id);
        if (!flight) {
          throw new Error("Flight not found");
        }
        return flight;
      }),

    // Search flights
    search: publicProcedure
      .input(
        z.object({
          fromCity: z.string().optional(),
          toCity: z.string().optional(),
          departureDate: z.date().optional(),
          maxPrice: z.number().optional(),
          airline: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        const flights = await searchFlights(input);
        return flights;
      }),

    // Get offer views (urgency indicator)
    views: publicProcedure
      .input(z.object({ flightId: z.number() }))
      .query(async ({ input }) => {
        const views = await getOfferViews(input.flightId);
        return views;
      }),

    // Increment offer views
    incrementViews: publicProcedure
      .input(z.object({ flightId: z.number() }))
      .mutation(async ({ input }) => {
        await incrementOfferViews(input.flightId);
        return { success: true };
      }),
  }),

  wishlist: router({
    // Get user's wishlist
    list: protectedProcedure.query(async ({ ctx }) => {
      const wishlists = await getUserWishlists(ctx.user.id);
      return wishlists;
    }),

    // Add to wishlist
    add: protectedProcedure
      .input(z.object({ flightId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await addToWishlist(ctx.user.id, input.flightId);
        return { success: true };
      }),

    // Remove from wishlist
    remove: protectedProcedure
      .input(z.object({ flightId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await removeFromWishlist(ctx.user.id, input.flightId);
        return { success: true };
      }),
  }),

  articles: router({
    // Get all published articles
    list: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const articles = await getAllArticles(input?.limit);
        return articles;
      }),

    // Get article by slug
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const article = await getArticleBySlug(input.slug);
        if (!article) {
          throw new Error("Article not found");
        }
        return article;
      }),

    // Get recent articles
    recent: publicProcedure
      .input(z.object({ limit: z.number().default(5) }))
      .query(async ({ input }) => {
        const articles = await getRecentArticles(input.limit);
        return articles;
      }),

    // Generate daily articles (admin only)
    generateDaily: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      await generateDailyArticles();
      return { success: true };
    }),
  }),

  destinations: router({
    // Get all destinations
    list: publicProcedure.query(async () => {
      const destinations = await getAllDestinations();
      return destinations;
    }),

    // Get destination by slug
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const destination = await getDestinationBySlug(input.slug);
        if (!destination) {
          throw new Error("Destination not found");
        }
        return destination;
      }),

    // Get featured destinations
    featured: publicProcedure
      .input(z.object({ limit: z.number().default(8) }))
      .query(async ({ input }) => {
        const destinations = await getFeaturedDestinations(input.limit);
        return destinations;
      }),
  }),

  // Affiliate click tracking
  affiliate: router({
    // Record a click on an affiliate link
    trackClick: publicProcedure
      .input(
        z.object({
          destination: z.string(),
          destinationSlug: z.string(),
          source: z.string(), // 'featured', 'grid', 'search', 'banner'
          affiliatePartner: z.string().default("kiwi"),
          affiliateUrl: z.string(),
          sessionId: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const userAgent = ctx.req.headers["user-agent"] || undefined;
        const referrer = ctx.req.headers["referer"] || undefined;
        const userId = ctx.user?.id;

        await recordAffiliateClick({
          ...input,
          userAgent,
          referrer,
          userId,
        });

        return { success: true };
      }),

    // Get click statistics (admin only)
    getStats: protectedProcedure.query(async ({ ctx }) => {
      // Only allow admin users
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      return await getAffiliateClickStats();
    }),

    // Get top destinations this week (public - for homepage)
    getTopThisWeek: publicProcedure
      .input(z.object({ limit: z.number().default(6) }))
      .query(async ({ input }) => {
        return await getTopDestinationsByClicks(input.limit);
      }),

    // Get top destinations by clicks (admin only)
    getTopDestinations: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return await getTopDestinationsByClicks(input.limit);
      }),

    // Get clicks by source (admin only)
    getClicksBySource: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      return await getClicksBySource();
    }),

    // Get click trend (admin only)
    getClickTrend: protectedProcedure
      .input(z.object({ days: z.number().default(30) }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return await getClickTrend(input.days);
      }),

    // Get recent clicks (admin only)
    getRecentClicks: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return await getRecentClicks(input.limit);
      }),
  }),

  chatbot: router({
    // Send message to chatbot
    sendMessage: publicProcedure
      .input(
        z.object({
          sessionId: z.string(),
          message: z.string(),
          projectId: z.string().default("akcni-letenky"),
        })
      )
      .mutation(async ({ input }) => {
        const result = await processChatbotMessage(
          input.sessionId,
          input.message,
          input.projectId
        );
        return result;
      }),

    // Track conversion (booking completed)
    trackConversion: publicProcedure
      .input(
        z.object({
          conversationId: z.number(),
          flightId: z.number(),
          bookingValue: z.number(),
          commissionRate: z.number().default(5),
        })
      )
      .mutation(async ({ input }) => {
        const result = await trackChatbotConversion(
          input.conversationId,
          input.flightId,
          input.bookingValue,
          input.commissionRate
        );
        return result;
      }),

    // Track community join (FB/WhatsApp)
    trackCommunityJoin: publicProcedure
      .input(
        z.object({
          conversationId: z.number(),
          communityType: z.enum(["facebook", "whatsapp"]),
        })
      )
      .mutation(async ({ input }) => {
        const result = await trackCommunityJoin(
          input.conversationId,
          input.communityType
        );
        return result;
      }),

    // Capture email from chatbot
    captureEmail: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          sessionId: z.string(),
          personaId: z.number().optional(),
          personaName: z.string().optional(),
          messageCount: z.number().default(0),
          lastDestinationMentioned: z.string().optional(),
          lastBudgetMentioned: z.number().optional(),
          gdprConsent: z.boolean().default(false),
          consentText: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { captureEmail } = await import("./emailCapture");
        const result = await captureEmail(input);
        return result;
      }),
  }),

  // Admin analytics dashboard
  admin: adminAnalyticsRouter,

  // Email management (admin only)
  emails: router({ // Get all captured emails
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      const { getAllEmailCaptures } = await import("./emailCapture");
      return await getAllEmailCaptures();
    }),

    // Get email capture statistics
    getStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      const { getEmailCaptureStats } = await import("./emailCapture");
      return await getEmailCaptureStats();
    }),

    // Export emails to CSV
    exportCSV: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      const { getAllEmailCaptures, exportEmailsToCSV } = await import(
        "./emailCapture"
      );
      const captures = await getAllEmailCaptures();
      return exportEmailsToCSV(captures);
    }),

    // Export emails in Mailchimp format
    exportMailchimp: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      const { getAllEmailCaptures, exportEmailsToMailchimp } = await import(
        "./emailCapture"
      );
      const captures = await getAllEmailCaptures();
      return exportEmailsToMailchimp(captures);
    }),

    // Get lead scoring statistics
    getLeadScoreStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      const { getLeadScoreStats } = await import("./leadScoring");
      return await getLeadScoreStats();
    }),

    // Recalculate all lead scores
    recalculateLeadScores: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      const { recalculateAllLeadScores } = await import("./leadScoring");
      return await recalculateAllLeadScores();
    }),

    // Get email marketing statistics
    getMarketingStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      const { getEmailMarketingStats } = await import("./emailMarketing");
      return await getEmailMarketingStats();
    }),

    // Process email queue (manual trigger)
    processQueue: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      const { processEmailQueue } = await import("./emailMarketing");
      return await processEmailQueue();
    }),

    // Get remarketing statistics
    getRemarketingStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      const { getRemarketingStats } = await import("./remarketingTriggers");
      return await getRemarketingStats();
    }),

    // Process remarketing triggers (manual trigger)
    processRemarketingTriggers: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      const { processRemarketingTriggers } = await import("./remarketingTriggers");
      return await processRemarketingTriggers();
    }),

    // Create manual remarketing trigger for testing
    createManualTrigger: protectedProcedure
      .input(z.object({ emailCaptureId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        const { createManualTrigger } = await import("./remarketingTriggers");
        return await createManualTrigger(input.emailCaptureId);
      }),

    // Mark user as converted
    markConverted: protectedProcedure
      .input(z.object({ emailCaptureId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        const { markUserConverted } = await import("./remarketingTriggers");
        return await markUserConverted(input.emailCaptureId);
      }),
  }),

  // Pelikán feed endpoints
  pelikan: router({
    // Get all flights from Pelikán feed
    getFlights: publicProcedure
      .input(
        z.object({
          country: z.string().optional(),
          departure: z.string().optional(),
          sortBy: z.enum(["price_asc", "price_desc", "default"]).default("default"),
          limit: z.number().default(100),
        }).optional()
      )
      .query(async ({ input }) => {
        let flights = await pelikanCache.getFlights();
        
        // Filter by country
        if (input?.country) {
          flights = flights.filter(f => 
            f.country.toLowerCase().includes(input.country!.toLowerCase())
          );
        }
        
        // Filter by departure (only flights have departure field)
        if (input?.departure) {
          flights = flights.filter(f => 
            'departure' in f && f.departure.toLowerCase().includes(input.departure!.toLowerCase())
          );
        }
        
        // Sort
        if (input?.sortBy === "price_asc") {
          flights = [...flights].sort((a, b) => a.salePrice - b.salePrice);
        } else if (input?.sortBy === "price_desc") {
          flights = [...flights].sort((a, b) => b.salePrice - a.salePrice);
        }
        
        // Limit
        return flights.slice(0, input?.limit || 100);
      }),

    // Get all vacations from Pelikán feed
    getVacations: publicProcedure
      .input(
        z.object({
          country: z.string().optional(),
          sortBy: z.enum(["price_asc", "price_desc", "default"]).default("default"),
          limit: z.number().default(100),
        }).optional()
      )
      .query(async ({ input }) => {
        let vacations = await pelikanCache.getVacations();
        
        // Filter by country
        if (input?.country) {
          vacations = vacations.filter(v => 
            v.country.toLowerCase().includes(input.country!.toLowerCase())
          );
        }
        
        // Sort
        if (input?.sortBy === "price_asc") {
          vacations = [...vacations].sort((a, b) => a.salePrice - b.salePrice);
        } else if (input?.sortBy === "price_desc") {
          vacations = [...vacations].sort((a, b) => b.salePrice - a.salePrice);
        }
        
        // Limit
        return vacations.slice(0, input?.limit || 100);
      }),

    // Get cache status (admin only)
    getCacheStatus: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      return getCacheStatus();
    }),

    // Force refresh feeds (admin only)
    refreshFeeds: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      await pelikanCache.refreshCache();
      return { success: true, status: getCacheStatus() };
    }),

    // Get interleaved offers (flights + vacations mixed)
    getInterleavedOffers: publicProcedure
      .input(
        z.object({
          limit: z.number().default(20),
          sortBy: z.enum(["price_asc", "price_desc", "default"]).default("default"),
        }).optional()
      )
      .query(async ({ input }) => {
        const [flights, vacations] = await Promise.all([
          pelikanCache.getFlights(),
          pelikanCache.getVacations(),
        ]);

        // Sort both by price if requested
        let sortedFlights = [...flights];
        let sortedVacations = [...vacations];
        
        if (input?.sortBy === "price_asc") {
          sortedFlights.sort((a, b) => a.salePrice - b.salePrice);
          sortedVacations.sort((a, b) => a.salePrice - b.salePrice);
        } else if (input?.sortBy === "price_desc") {
          sortedFlights.sort((a, b) => b.salePrice - a.salePrice);
          sortedVacations.sort((a, b) => b.salePrice - a.salePrice);
        }

        // Interleave offers (alternating between flights and vacations)
        const interleaved: (FlightOffer | VacationOffer)[] = [];
        const maxLength = Math.max(sortedFlights.length, sortedVacations.length);
        
        for (let i = 0; i < maxLength; i++) {
          if (i < sortedFlights.length) {
            interleaved.push(sortedFlights[i]);
          }
          if (i < sortedVacations.length) {
            interleaved.push(sortedVacations[i]);
          }
        }

        // Limit results
        return interleaved.slice(0, input?.limit || 20);
      }),
  }),

  // Newsletter subscription
  newsletter: router({
    // Subscribe to newsletter
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const { captureEmail } = await import("./emailCapture");
        await captureEmail({
          email: input.email,
          sessionId: `newsletter_${Date.now()}`,
          gdprConsent: true,
          consentText: "Newsletter subscription via sticky bar",
        });
        return { success: true };
      }),

    // Get newsletter preview (admin only)
    preview: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }
      const { getWeeklyNewsletterContent, generateNewsletterHTML } = await import("./emailAutomation");
      const content = await getWeeklyNewsletterContent();
      const html = generateNewsletterHTML(content);
      return { content, html };
    }),

    // Send newsletter manually (admin only)
    send: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }
      const { sendWeeklyNewsletter } = await import("./emailAutomation");
      const result = await sendWeeklyNewsletter();
      return result;
    }),

    // Get subscriber count
    subscriberCount: publicProcedure.query(async () => {
      const { getNewsletterSubscribers } = await import("./emailAutomation");
      const subscribers = await getNewsletterSubscribers();
      return { count: subscribers.length };
    }),

    // Get A/B test stats for newsletter variants
    getABTestStats: protectedProcedure
      .input(z.object({ dateRange: z.enum(["7d", "30d", "90d", "all"]) }))
      .query(async ({ input }) => {
        // Calculate date cutoff
        const now = new Date();
        let cutoffDate: Date | null = null;
        
        switch (input.dateRange) {
          case "7d":
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "30d":
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case "90d":
            cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case "all":
            cutoffDate = null;
            break;
        }

        // Mock data for now - in production, fetch from database
        // TODO: Implement actual database queries for newsletter A/B test tracking
        const variants = ["a", "b", "c"];
        const stats = variants.map(variant => {
          // Generate realistic mock data
          const baseImpressions = Math.floor(Math.random() * 5000) + 1000;
          const mobileRatio = 0.6 + Math.random() * 0.2; // 60-80% mobile
          const conversionRate = 0.02 + Math.random() * 0.03; // 2-5% conversion
          
          const mobileImpressions = Math.floor(baseImpressions * mobileRatio);
          const desktopImpressions = baseImpressions - mobileImpressions;
          
          const mobileConversions = Math.floor(mobileImpressions * (conversionRate + Math.random() * 0.01));
          const desktopConversions = Math.floor(desktopImpressions * (conversionRate + Math.random() * 0.01));
          
          return {
            variant,
            impressions: baseImpressions,
            conversions: mobileConversions + desktopConversions,
            conversionRate: ((mobileConversions + desktopConversions) / baseImpressions) * 100,
            mobileImpressions,
            mobileConversions,
            mobileConversionRate: (mobileConversions / mobileImpressions) * 100,
            desktopImpressions,
            desktopConversions,
            desktopConversionRate: (desktopConversions / desktopImpressions) * 100,
          };
        });

        return stats;
      }),
  }),

  // A/B Test endpoints for chatbot personas
  abTest: router({
    // Get current A/B test status
    getStatus: protectedProcedure.query(async () => {
      return await getABTestStatus();
    }),

    // Get detailed A/B test results
    getResults: protectedProcedure.query(async () => {
      return await calculateABTestResults();
    }),

    // Manually trigger traffic optimization
    optimize: protectedProcedure.mutation(async () => {
      return await autoOptimizeTrafficWeights();
    }),

    // Initialize personas (admin only)
    initializePersonas: protectedProcedure.mutation(async () => {
      await initializePersonas();
      return { success: true, message: "Personas initialized" };
    }),

    // Track conversion for A/B test
    trackConversion: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        conversionValue: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        await trackPersonaConversion(input.sessionId, input.conversionValue);
        return { success: true };
      }),

    // Hero A/B Test - Track assignment
    trackAssignment: publicProcedure
      .input(z.object({
        testName: z.string(),
        variant: z.enum(['A', 'B']),
        sessionId: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        await recordAssignment(
          input.testName,
          input.variant,
          input.sessionId,
          ctx.user?.id
        );
        return { success: true };
      }),

    // Hero A/B Test - Track event
    trackEvent: publicProcedure
      .input(z.object({
        testName: z.string(),
        variant: z.enum(['A', 'B']),
        sessionId: z.string(),
        eventType: z.string(),
        eventData: z.string().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        await recordEvent(
          input.testName,
          input.variant,
          input.sessionId,
          input.eventType,
          input.eventData || null
        );
        return { success: true };
      }),

    // Hero A/B Test - Get results
    getTestResults: protectedProcedure
      .input(z.object({
        testName: z.string(),
      }))
      .query(async ({ input }) => {
        return await getTestResults(input.testName);
      }),

    // Hero A/B Test - Get event breakdown
    getEventBreakdown: protectedProcedure
      .input(z.object({
        testName: z.string(),
      }))
      .query(async ({ input }) => {
        return await getEventBreakdown(input.testName);
      }),
  }),

  // ============ Price Alerts ============
  priceAlerts: router({
    create: publicProcedure
      .input(z.object({
        destination: z.string(),
        destinationSlug: z.string(),
        currentPrice: z.number(),
        targetPrice: z.number().optional(),
        priceDropPercent: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createPriceAlert(input);
      }),

    getMyAlerts: protectedProcedure
      .query(async ({ ctx }) => {
        return await getPriceAlertsByUserId(ctx.user.id);
      }),

    deactivate: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deactivatePriceAlert(input.id);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deletePriceAlert(input.id);
      }),

    getPriceHistory: publicProcedure
      .input(z.object({ destinationSlug: z.string(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await getPriceHistoryForDestination(input.destinationSlug, input.limit);
      }),

    recordPrice: publicProcedure
      .input(z.object({
        destination: z.string(),
        destinationSlug: z.string(),
        price: z.number(),
        source: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await recordPrice(input);
        return { success: true };
      }),

    getStats: protectedProcedure.query(async () => {
      return await getPriceAlertStats();
    }),

    checkAndNotify: protectedProcedure.mutation(async () => {
      return await checkPriceDropsAndNotify();
    }),

    runManualCheck: protectedProcedure.mutation(async () => {
      return await runPriceCheck();
    }),

    getCronStatus: protectedProcedure.query(async () => {
      return getLastCheckResult();
    }),
  }),

  // ============ Social Sharing ============
  socialSharing: router({
    createShare: publicProcedure
      .input(z.object({
        platform: z.string(),
        destination: z.string().optional(),
        destinationSlug: z.string().optional(),
        pageUrl: z.string().optional(),
        referrerEmail: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createSocialShare(input);
      }),

    trackClick: publicProcedure
      .input(z.object({ shareCode: z.string() }))
      .mutation(async ({ input }) => {
        const share = await trackShareClick(input.shareCode);
        return { success: !!share };
      }),

    trackConversion: publicProcedure
      .input(z.object({ shareCode: z.string() }))
      .mutation(async ({ input }) => {
        const share = await trackShareConversion(input.shareCode);
        return { success: !!share };
      }),

    validateDiscount: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        return await validateDiscountCode(input.code);
      }),

    getStats: protectedProcedure.query(async () => {
      return await getSocialShareStats();
    }),
  }),

  // ============ Personalization ============
  personalization: router({
    trackView: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        destination: z.string(),
        destinationSlug: z.string(),
        price: z.number().optional(),
        source: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await trackPageView(input);
        return { success: true };
      }),

    getRecommendations: publicProcedure
      .input(z.object({ sessionId: z.string(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await getPersonalizedRecommendations(input.sessionId, input.limit);
      }),

    getPopularDestinations: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await getPopularDestinations(input.limit);
      }),
  }),

  // ============ A/B Test: Share Button Placement ============
  abTestSharing: router({
    recordAssignment: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        variant: z.enum(['card', 'detail']),
      }))
      .mutation(async ({ input }) => {
        const { recordAssignment } = await import("./abTest");
        await recordAssignment('share_placement', input.variant as 'A' | 'B', input.sessionId);
        return { success: true };
      }),

    recordEvent: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        variant: z.enum(['card', 'detail']),
        eventType: z.string(),
        eventData: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { recordEvent } = await import("./abTest");
        await recordEvent('share_placement', input.variant as 'A' | 'B', input.sessionId, input.eventType, input.eventData);
        return { success: true };
      }),

    getResults: protectedProcedure.query(async () => {
      const { getTestResults, getEventBreakdown, calculateSignificance } = await import("./abTest");
      const results = await getTestResults('share_placement');
      const events = await getEventBreakdown('share_placement');
      
      let significance = null;
      if (results.variantA.assignments >= 30 && results.variantB.assignments >= 30) {
        significance = calculateSignificance(
          results.variantA.conversions,
          results.variantA.assignments,
          results.variantB.conversions,
          results.variantB.assignments
        );
      }

      return {
        variantA: { ...results.variantA, label: 'Na kartě destinace' },
        variantB: { ...results.variantB, label: 'V detailu destinace' },
        events,
        significance,
        totalSessions: results.variantA.assignments + results.variantB.assignments,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
