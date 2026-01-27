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
} from "./db";
import {
  processChatbotMessage,
  trackChatbotConversion,
  trackCommunityJoin,
} from "./chatbot";
import { generateDailyArticles } from "./articleGenerator";
import { adminAnalyticsRouter } from "./adminAnalytics";

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
});

export type AppRouter = typeof appRouter;
