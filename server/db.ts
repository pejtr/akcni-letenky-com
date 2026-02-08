import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../drizzle/schema";
import { InsertUser, users, flights, Flight, InsertFlight, wishlists, Wishlist, InsertWishlist, offerViews, OfferView, InsertOfferView } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL, { schema, mode: 'default' });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Flight Offers Queries

export async function getFeaturedFlights(): Promise<Flight[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(flights)
    .where(eq(flights.isFeatured, 1))
    .orderBy(desc(flights.createdAt))
    .limit(4);

  return result;
}

export async function getAllFlights(): Promise<Flight[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(flights)
    .orderBy(desc(flights.createdAt));

  return result;
}

export async function getFlightById(id: number): Promise<Flight | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(flights)
    .where(eq(flights.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function searchFlights(params: {
  fromCity?: string;
  toCity?: string;
  departureDate?: Date;
  maxPrice?: number;
}): Promise<Flight[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (params.fromCity) {
    conditions.push(eq(flights.fromCity, params.fromCity));
  }
  if (params.toCity) {
    conditions.push(eq(flights.toCity, params.toCity));
  }
  if (params.departureDate) {
    conditions.push(gte(flights.departureDate, params.departureDate));
  }
  if (params.maxPrice) {
    conditions.push(lte(flights.price, params.maxPrice));
  }

  const result = await db
    .select()
    .from(flights)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(flights.createdAt));

  return result;
}

export async function insertFlight(flight: InsertFlight): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(flights).values(flight);
}

// Wishlist Queries

export async function getUserWishlists(userId: number): Promise<Wishlist[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(wishlists)
    .where(eq(wishlists.userId, userId));

  return result;
}

export async function addToWishlist(userId: number, flightId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(wishlists).values({ userId, flightId });
}

export async function removeFromWishlist(userId: number, flightId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .delete(wishlists)
    .where(and(eq(wishlists.userId, userId), eq(wishlists.flightId, flightId)));
}

// Destination-based Wishlist Queries (for localStorage sync)

export interface WishlistSyncItem {
  id: string; // destinationId slug
  addedAt: number; // Unix timestamp ms
  isFavorite: boolean;
}

export async function getUserDestinationWishlist(userId: number): Promise<WishlistSyncItem[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      destinationId: wishlists.destinationId,
      addedAt: wishlists.addedAt,
      isFavorite: wishlists.isFavorite,
    })
    .from(wishlists)
    .where(and(
      eq(wishlists.userId, userId),
      sql`${wishlists.destinationId} IS NOT NULL`
    ));

  return result.map(r => ({
    id: r.destinationId!,
    addedAt: r.addedAt || Date.now(),
    isFavorite: r.isFavorite === 1,
  }));
}

export async function addDestinationToWishlist(
  userId: number,
  destinationId: string,
  addedAt: number,
  isFavorite: boolean
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Check if already exists
  const existing = await db
    .select({ id: wishlists.id })
    .from(wishlists)
    .where(and(
      eq(wishlists.userId, userId),
      eq(wishlists.destinationId, destinationId)
    ))
    .limit(1);

  if (existing.length > 0) {
    // Update existing
    await db.update(wishlists)
      .set({ isFavorite: isFavorite ? 1 : 0, addedAt })
      .where(eq(wishlists.id, existing[0].id));
  } else {
    // Insert new
    await db.insert(wishlists).values({
      userId,
      flightId: 0, // legacy field, not used for destination-based wishlist
      destinationId,
      addedAt,
      isFavorite: isFavorite ? 1 : 0,
    });
  }
}

export async function removeDestinationFromWishlist(
  userId: number,
  destinationId: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .delete(wishlists)
    .where(and(
      eq(wishlists.userId, userId),
      eq(wishlists.destinationId, destinationId)
    ));
}

export async function syncWishlistFromClient(
  userId: number,
  clientItems: WishlistSyncItem[]
): Promise<WishlistSyncItem[]> {
  const db = await getDb();
  if (!db) return clientItems;

  // Get server items
  const serverItems = await getUserDestinationWishlist(userId);

  // Merge: union of both sets, preferring most recent addedAt
  const merged = new Map<string, WishlistSyncItem>();

  // Add server items first
  for (const item of serverItems) {
    merged.set(item.id, item);
  }

  // Merge client items (keep newer addedAt, prefer isFavorite=true)
  for (const item of clientItems) {
    const existing = merged.get(item.id);
    if (!existing) {
      merged.set(item.id, item);
    } else {
      // Keep the one with more recent addedAt, prefer isFavorite=true
      merged.set(item.id, {
        id: item.id,
        addedAt: Math.max(existing.addedAt, item.addedAt),
        isFavorite: existing.isFavorite || item.isFavorite,
      });
    }
  }

  const mergedItems = Array.from(merged.values());

  // Write merged items back to DB
  for (const item of mergedItems) {
    await addDestinationToWishlist(userId, item.id, item.addedAt, item.isFavorite);
  }

  // Remove items from DB that are not in merged set (items removed on client)
  for (const serverItem of serverItems) {
    if (!merged.has(serverItem.id)) {
      await removeDestinationFromWishlist(userId, serverItem.id);
    }
  }

  return mergedItems;
}

export async function updateDestinationFavorite(
  userId: number,
  destinationId: string,
  isFavorite: boolean
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(wishlists)
    .set({ isFavorite: isFavorite ? 1 : 0 })
    .where(and(
      eq(wishlists.userId, userId),
      eq(wishlists.destinationId, destinationId)
    ));
}

// Offer Views Queries

export async function getOfferViews(flightId: number): Promise<OfferView | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(offerViews)
    .where(eq(offerViews.flightId, flightId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function incrementOfferViews(flightId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const existing = await getOfferViews(flightId);

  if (existing) {
    await db
      .update(offerViews)
      .set({ viewCount: (existing.viewCount || 0) + 1, lastUpdated: new Date() })
      .where(eq(offerViews.flightId, flightId));
  } else {
    await db.insert(offerViews).values({ flightId, viewCount: 1 });
  }
}

// Article Queries

export async function getAllArticles(limit?: number) {
  const db = await getDb();
  if (!db) return [];

  const { articles } = await import("../drizzle/schema");
  
  let query = db
    .select()
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt));

  if (limit) {
    query = query.limit(limit) as any;
  }

  return await query;
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const { articles } = await import("../drizzle/schema");

  const result = await db
    .select()
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getRecentArticles(limit: number = 5) {
  const db = await getDb();
  if (!db) return [];

  const { articles } = await import("../drizzle/schema");

  const result = await db
    .select()
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);

  return result;
}

// Destination Queries

export async function getAllDestinations() {
  const db = await getDb();
  if (!db) return [];

  const { destinations } = await import("../drizzle/schema");

  const result = await db
    .select()
    .from(destinations)
    .orderBy(desc(destinations.createdAt));

  return result;
}

export async function getDestinationBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const { destinations } = await import("../drizzle/schema");

  const result = await db
    .select()
    .from(destinations)
    .where(eq(destinations.slug, slug))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getFeaturedDestinations(limit: number = 8) {
  const db = await getDb();
  if (!db) return [];

  const { destinations } = await import("../drizzle/schema");

  const result = await db
    .select()
    .from(destinations)
    .orderBy(desc(destinations.popularityScore))
    .limit(limit);

  return result;
}


// Affiliate Click Tracking

export async function recordAffiliateClick(data: {
  destination: string;
  destinationSlug: string;
  source: string;
  affiliatePartner?: string;
  affiliateUrl: string;
  userAgent?: string;
  referrer?: string;
  sessionId?: string;
  userId?: number;
}) {
  const db = await getDb();
  if (!db) return null;

  const { affiliateClicks } = await import("../drizzle/schema");

  const result = await db.insert(affiliateClicks).values({
    destination: data.destination,
    destinationSlug: data.destinationSlug,
    source: data.source,
    affiliatePartner: data.affiliatePartner || "kiwi",
    affiliateUrl: data.affiliateUrl,
    userAgent: data.userAgent || null,
    referrer: data.referrer || null,
    sessionId: data.sessionId || null,
    userId: data.userId || null,
  });

  return result;
}

export async function getAffiliateClickStats() {
  const db = await getDb();
  if (!db) return null;

  const { affiliateClicks } = await import("../drizzle/schema");

  // Get total clicks
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(affiliateClicks);
  const totalClicks = totalResult[0]?.count || 0;

  // Get today's clicks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(affiliateClicks)
    .where(gte(affiliateClicks.createdAt, today));
  const todayClicks = todayResult[0]?.count || 0;

  // Get this week's clicks
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(affiliateClicks)
    .where(gte(affiliateClicks.createdAt, weekAgo));
  const weekClicks = weekResult[0]?.count || 0;

  // Get this month's clicks
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const monthResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(affiliateClicks)
    .where(gte(affiliateClicks.createdAt, monthAgo));
  const monthClicks = monthResult[0]?.count || 0;

  return {
    total: totalClicks,
    today: todayClicks,
    thisWeek: weekClicks,
    thisMonth: monthClicks,
  };
}

export async function getTopDestinationsByClicks(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const { affiliateClicks, flights } = await import("../drizzle/schema");

  // Get top destinations by clicks
  const topDestinations = await db
    .select({
      destination: affiliateClicks.destination,
      destinationSlug: affiliateClicks.destinationSlug,
      clicks: sql<number>`count(*)`,
    })
    .from(affiliateClicks)
    .groupBy(affiliateClicks.destination, affiliateClicks.destinationSlug)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  // For each destination, find the cheapest flight
  const result = await Promise.all(
    topDestinations.map(async (dest) => {
      const cheapestFlight = await db
        .select({
          price: flights.price,
          originalPrice: flights.originalPrice,
          discountPercent: flights.discountPercent,
        })
        .from(flights)
        .where(sql`LOWER(${flights.toCity}) = LOWER(${dest.destination})`)
        .orderBy(flights.price)
        .limit(1);

      return {
        ...dest,
        price: cheapestFlight[0]?.price || null,
        originalPrice: cheapestFlight[0]?.originalPrice || null,
        discountPercent: cheapestFlight[0]?.discountPercent || 0,
      };
    })
  );

  return result;
}

export async function getClicksBySource() {
  const db = await getDb();
  if (!db) return [];

  const { affiliateClicks } = await import("../drizzle/schema");

  const result = await db
    .select({
      source: affiliateClicks.source,
      clicks: sql<number>`count(*)`,
    })
    .from(affiliateClicks)
    .groupBy(affiliateClicks.source)
    .orderBy(desc(sql`count(*)`));

  return result;
}

export async function getClickTrend(days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const { affiliateClicks } = await import("../drizzle/schema");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db
    .select({
      date: sql<string>`DATE(createdAt)`,
      clicks: sql<number>`count(*)`,
    })
    .from(affiliateClicks)
    .where(gte(affiliateClicks.createdAt, startDate))
    .groupBy(sql`DATE(createdAt)`)
    .orderBy(sql`DATE(createdAt)`);

  return result;
}

export async function getRecentClicks(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const { affiliateClicks } = await import("../drizzle/schema");

  const result = await db
    .select()
    .from(affiliateClicks)
    .orderBy(desc(affiliateClicks.createdAt))
    .limit(limit);

  return result;
}
