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

/**
 * Chatbot conversations table - stores all chatbot interactions
 */
export const chatbotConversations = mysqlTable("chatbot_conversations", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(), // Unique session identifier
  userId: int("userId"), // Optional - if user is logged in
  projectId: varchar("projectId", { length: 64 }).notNull(), // Which project this conversation belongs to
  status: mysqlEnum("status", ["active", "converted", "abandoned"]).default("active"),
  leadQuality: mysqlEnum("leadQuality", ["hot", "warm", "cold"]).default("cold"),
  // Lead qualification data
  destination: varchar("destination", { length: 100 }),
  budget: int("budget"), // In CZK
  travelDate: timestamp("travelDate"),
  passengers: int("passengers").default(1),
  // Contact information
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  name: varchar("name", { length: 100 }),
  // Conversion tracking
  clickedOffer: int("clickedOffer").default(0), // 1 if clicked any offer
  joinedCommunity: int("joinedCommunity").default(0), // 1 if joined FB/WhatsApp
  converted: int("converted").default(0), // 1 if booking confirmed
  conversionValue: int("conversionValue"), // Commission earned in CZK
  // Analytics
  messageCount: int("messageCount").default(0),
  lastMessageAt: timestamp("lastMessageAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatbotConversation = typeof chatbotConversations.$inferSelect;
export type InsertChatbotConversation = typeof chatbotConversations.$inferInsert;

/**
 * Chatbot messages table - stores individual messages in conversations
 */
export const chatbotMessages = mysqlTable("chatbot_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  // Metadata for analytics
  containsOffer: int("containsOffer").default(0), // 1 if message contains flight offer
  containsCommunityInvite: int("containsCommunityInvite").default(0), // 1 if invites to FB/WhatsApp
  userClicked: int("userClicked").default(0), // 1 if user clicked any link in this message
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatbotMessage = typeof chatbotMessages.$inferSelect;
export type InsertChatbotMessage = typeof chatbotMessages.$inferInsert;

/**
 * Chatbot leads table - stores qualified leads for follow-up
 */
export const chatbotLeads = mysqlTable("chatbot_leads", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  name: varchar("name", { length: 100 }),
  destination: varchar("destination", { length: 100 }),
  budget: int("budget"),
  travelDate: timestamp("travelDate"),
  passengers: int("passengers"),
  leadSource: varchar("leadSource", { length: 50 }).default("chatbot"), // 'chatbot', 'form', etc.
  leadQuality: mysqlEnum("leadQuality", ["hot", "warm", "cold"]).default("warm"),
  status: mysqlEnum("status", ["new", "contacted", "converted", "lost"]).default("new"),
  notes: text("notes"), // Internal notes about the lead
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatbotLead = typeof chatbotLeads.$inferSelect;
export type InsertChatbotLead = typeof chatbotLeads.$inferInsert;

/**
 * Chatbot conversions table - tracks successful bookings and commissions
 */
export const chatbotConversions = mysqlTable("chatbot_conversions", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  leadId: int("leadId"),
  flightId: int("flightId"), // Which flight was booked
  bookingValue: int("bookingValue").notNull(), // Total booking value in CZK
  commissionRate: int("commissionRate").default(5), // Commission % (e.g., 5 for 5%)
  commissionAmount: int("commissionAmount").notNull(), // Calculated commission in CZK
  affiliateSource: varchar("affiliateSource", { length: 100 }), // 'pelikan', 'kiwi', etc.
  affiliateClickId: varchar("affiliateClickId", { length: 255 }), // Tracking ID from affiliate
  conversionType: mysqlEnum("conversionType", ["flight", "hotel", "package"]).default("flight"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatbotConversion = typeof chatbotConversions.$inferSelect;
export type InsertChatbotConversion = typeof chatbotConversions.$inferInsert;

/**
 * Chatbot analytics table - daily aggregated metrics
 */
export const chatbotAnalytics = mysqlTable("chatbot_analytics", {
  id: int("id").autoincrement().primaryKey(),
  projectId: varchar("projectId", { length: 64 }).notNull(),
  date: timestamp("date").notNull(),
  // Conversation metrics
  totalConversations: int("totalConversations").default(0),
  activeConversations: int("activeConversations").default(0),
  convertedConversations: int("convertedConversations").default(0),
  abandonedConversations: int("abandonedConversations").default(0),
  // Lead metrics
  totalLeads: int("totalLeads").default(0),
  hotLeads: int("hotLeads").default(0),
  warmLeads: int("warmLeads").default(0),
  coldLeads: int("coldLeads").default(0),
  // Conversion metrics
  totalConversions: int("totalConversions").default(0),
  totalRevenue: int("totalRevenue").default(0), // Total booking value
  totalCommissions: int("totalCommissions").default(0), // Total earned commissions
  // Community metrics
  fbGroupJoins: int("fbGroupJoins").default(0),
  whatsappGroupJoins: int("whatsappGroupJoins").default(0),
  // ROI metrics
  conversionRate: int("conversionRate").default(0), // Percentage * 100 (e.g., 525 = 5.25%)
  avgCommissionPerConversation: int("avgCommissionPerConversation").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatbotAnalytics = typeof chatbotAnalytics.$inferSelect;
export type InsertChatbotAnalytics = typeof chatbotAnalytics.$inferInsert;
