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
} from "./db";

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
});

export type AppRouter = typeof appRouter;
