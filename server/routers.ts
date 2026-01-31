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
  }),

  // Admin analytics dashboard
  admin: adminAnalyticsRouter,

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
  }),
});

export type AppRouter = typeof appRouter;
