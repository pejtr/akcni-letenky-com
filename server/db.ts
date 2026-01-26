import { eq, desc, and, gte, lte } from "drizzle-orm";
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
