import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Flight offers table - stores individual flight deals from various sources
 */
export const flights = mysqlTable("flights", {
  id: int("id").autoincrement().primaryKey(),
  source: varchar("source", { length: 64 }).notNull(), // 'pelikan', 'kiwi', etc.
  sourceId: varchar("sourceId", { length: 255 }).notNull(), // External ID from source
  fromCity: varchar("fromCity", { length: 100 }).notNull(),
  toCity: varchar("toCity", { length: 100 }).notNull(),
  departureDate: timestamp("departureDate").notNull(),
  returnDate: timestamp("returnDate"),
  price: int("price").notNull(), // Price in CZK
  originalPrice: int("originalPrice"), // Original price before discount
  discountPercent: int("discountPercent").default(0), // Simulated discount %
  airline: varchar("airline", { length: 100 }),
  stops: int("stops").default(0),
  duration: varchar("duration", { length: 50 }), // e.g., "2h 30m"
  rating: int("rating").default(45), // Rating out of 50 (4.5 stars = 45)
  imageUrl: text("imageUrl"),
  affiliateUrl: text("affiliateUrl").notNull(),
  isFeatured: int("isFeatured").default(0), // 1 for featured offers
  remainingSeats: int("remainingSeats").default(10), // Simulated scarcity
  seatsUpdatedAt: timestamp("seatsUpdatedAt").defaultNow(),
  discountUpdatedAt: timestamp("discountUpdatedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Flight = typeof flights.$inferSelect;
export type InsertFlight = typeof flights.$inferInsert;

/**
 * Offer views tracking - for "X people viewing" urgency indicator
 */
export const offerViews = mysqlTable("offer_views", {
  id: int("id").autoincrement().primaryKey(),
  flightId: int("flightId").notNull(),
  viewCount: int("viewCount").default(0), // Simulated view count
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow(),
});

export type OfferView = typeof offerViews.$inferSelect;
export type InsertOfferView = typeof offerViews.$inferInsert;

/**
 * User wishlists - saved favorite flights
 */
export const wishlists = mysqlTable("wishlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  flightId: int("flightId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = typeof wishlists.$inferInsert;
/**
 * Articles table - stores blog posts and SEO content
 */
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"), // Short summary for listings
  metaDescription: varchar("metaDescription", { length: 160 }),
  keywords: text("keywords"), // Comma-separated SEO keywords
  featuredImage: text("featuredImage"),
  author: varchar("author", { length: 100 }).default("Akční Letenky"),
  category: varchar("category", { length: 50 }).default("general"), // 'deals', 'guides', 'airlines', 'destinations'
  status: mysqlEnum("status", ["draft", "published"]).default("draft"),
  publishedAt: timestamp("publishedAt"),
  viewCount: int("viewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

/**
 * Destinations table - stores information about travel destinations
 */
export const destinations = mysqlTable("destinations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  country: varchar("country", { length: 100 }).notNull(),
  region: varchar("region", { length: 100 }), // e.g., "Europe", "Asia"
  description: text("description"),
  featuredImage: text("featuredImage"),
  metaDescription: varchar("metaDescription", { length: 160 }),
  keywords: text("keywords"),
  averagePrice: int("averagePrice"), // Average flight price in CZK
  popularityScore: int("popularityScore").default(0), // For sorting
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Destination = typeof destinations.$inferSelect;
export type InsertDestination = typeof destinations.$inferInsert;

/**
 * Article-Destination relationship table
 */
export const articleDestinations = mysqlTable("article_destinations", {
  id: int("id").autoincrement().primaryKey(),
  articleId: int("articleId").notNull(),
  destinationId: int("destinationId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ArticleDestination = typeof articleDestinations.$inferSelect;
export type InsertArticleDestination = typeof articleDestinations.$inferInsert;
