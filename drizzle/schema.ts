import { int, bigint, float, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  destinationId: varchar("destinationId", { length: 255 }), // slug-based destination ID from frontend
  isFavorite: int("isFavorite").default(0), // 1 = marked as favorite
  addedAt: bigint("addedAt", { mode: "number" }), // Unix timestamp ms from client
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
 * A/B Test Assignments - tracks which variant each user/session sees
 */
export const abTestAssignments = mysqlTable("ab_test_assignments", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(), // Unique session identifier
  userId: int("userId"), // Optional - if user is logged in
  testName: varchar("testName", { length: 100 }).notNull(), // e.g., 'hero_redesign'
  variant: varchar("variant", { length: 50 }).notNull(), // 'A' or 'B'
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
});

export type AbTestAssignment = typeof abTestAssignments.$inferSelect;
export type InsertAbTestAssignment = typeof abTestAssignments.$inferInsert;

/**
 * A/B Test Events - tracks user interactions for conversion analysis
 */
export const abTestEvents = mysqlTable("ab_test_events", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  testName: varchar("testName", { length: 100 }).notNull(),
  variant: varchar("variant", { length: 50 }).notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(), // 'cta_click', 'scroll_25', 'scroll_50', 'scroll_75', 'scroll_100', 'form_interaction', 'badge_view', 'bounce'
  eventData: text("eventData"), // JSON string with additional event data
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type AbTestEvent = typeof abTestEvents.$inferSelect;
export type InsertAbTestEvent = typeof abTestEvents.$inferInsert;

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


/**
 * Affiliate clicks table - tracks all clicks on affiliate links
 */
export const affiliateClicks = mysqlTable("affiliate_clicks", {
  id: int("id").autoincrement().primaryKey(),
  destination: varchar("destination", { length: 100 }).notNull(), // City name
  destinationSlug: varchar("destinationSlug", { length: 100 }).notNull(), // URL slug
  source: varchar("source", { length: 50 }).notNull(), // 'featured', 'grid', 'search', 'banner'
  affiliatePartner: varchar("affiliatePartner", { length: 50 }).default("kiwi"), // 'kiwi', 'pelikan', etc.
  affiliateUrl: text("affiliateUrl").notNull(), // Full URL that was clicked
  // User info (anonymous)
  userAgent: text("userAgent"),
  referrer: text("referrer"),
  ipCountry: varchar("ipCountry", { length: 2 }), // Country code
  // Session tracking
  sessionId: varchar("sessionId", { length: 64 }), // To group clicks by session
  userId: int("userId"), // If logged in
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AffiliateClick = typeof affiliateClicks.$inferSelect;
export type InsertAffiliateClick = typeof affiliateClicks.$inferInsert;


/**
 * Chatbot user memory - stores persistent user preferences and context
 */
export const chatbotUserMemory = mysqlTable("chatbot_user_memory", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(), // Session identifier
  userId: int("userId"), // Optional - if user is logged in
  // User preferences extracted from conversations
  preferredDestinations: text("preferredDestinations"), // JSON array of destinations
  preferredBudget: int("preferredBudget"), // Typical budget in CZK
  preferredTravelStyle: varchar("preferredTravelStyle", { length: 50 }), // 'budget', 'comfort', 'luxury'
  preferredAirlines: text("preferredAirlines"), // JSON array of airlines
  travelFrequency: varchar("travelFrequency", { length: 50 }), // 'frequent', 'occasional', 'rare'
  // Context from last conversation
  lastDestinationAsked: varchar("lastDestinationAsked", { length: 100 }),
  lastBudgetMentioned: int("lastBudgetMentioned"),
  lastTravelDate: timestamp("lastTravelDate"),
  lastPassengerCount: int("lastPassengerCount"),
  // Engagement metrics
  totalConversations: int("totalConversations").default(0),
  totalMessages: int("totalMessages").default(0),
  lastInteractionAt: timestamp("lastInteractionAt").defaultNow(),
  // Summary of past interactions
  conversationSummary: text("conversationSummary"), // AI-generated summary of past conversations
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatbotUserMemory = typeof chatbotUserMemory.$inferSelect;
export type InsertChatbotUserMemory = typeof chatbotUserMemory.$inferInsert;

/**
 * Knowledge base for RAG - stores indexed content for retrieval
 */
export const knowledgeBase = mysqlTable("knowledge_base", {
  id: int("id").autoincrement().primaryKey(),
  contentType: mysqlEnum("contentType", ["flight", "destination", "article", "faq", "airline"]).notNull(),
  contentId: int("contentId"), // Reference to original content (flightId, destinationId, etc.)
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(), // Full text content for search
  keywords: text("keywords"), // Extracted keywords for matching
  metadata: text("metadata"), // JSON with additional data (price, dates, etc.)
  // Search optimization
  searchVector: text("searchVector"), // Preprocessed text for search
  relevanceScore: int("relevanceScore").default(0), // Base relevance score
  // Timestamps
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBase = typeof knowledgeBase.$inferInsert;


/**
 * Chatbot personas for A/B testing - defines different chatbot personalities
 */
export const chatbotPersonas = mysqlTable("chatbot_personas", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(), // 'lucka', 'martin', 'anicka'
  displayName: varchar("displayName", { length: 100 }).notNull(), // 'Lucka', 'Martin', 'Anička'
  avatar: varchar("avatar", { length: 255 }), // Path to avatar image
  // Personality configuration
  tone: mysqlEnum("tone", ["energetic", "professional", "friendly"]).notNull(),
  useEmoji: int("useEmoji").default(1), // 1 = yes, 0 = no
  formalityLevel: mysqlEnum("formalityLevel", ["informal", "neutral", "formal"]).default("neutral"),
  // System prompt additions
  systemPromptAddition: text("systemPromptAddition"), // Additional instructions for this persona
  greetingMessage: text("greetingMessage").notNull(), // First message when chat opens
  // CTA style
  ctaStyle: varchar("ctaStyle", { length: 100 }), // e.g., "Jedu do toho! 🔥" vs "Zobrazit nabídky"
  // Target audience
  targetAgeMin: int("targetAgeMin"),
  targetAgeMax: int("targetAgeMax"),
  targetAudience: varchar("targetAudience", { length: 255 }), // Description of target audience
  // A/B test configuration
  isActive: int("isActive").default(1), // 1 = active in rotation
  weight: int("weight").default(33), // Weight in percentage for distribution (33 = 33%)
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatbotPersona = typeof chatbotPersonas.$inferSelect;
export type InsertChatbotPersona = typeof chatbotPersonas.$inferInsert;

/**
 * Persona assignments - tracks which persona is assigned to each session
 */
export const personaAssignments = mysqlTable("persona_assignments", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(), // Unique session identifier
  personaId: int("personaId").notNull(), // Reference to chatbotPersonas
  userId: int("userId"), // Optional - if user is logged in
  // Assignment metadata
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  assignmentMethod: mysqlEnum("assignmentMethod", ["random", "targeted", "manual"]).default("random"),
  // Engagement metrics for this assignment
  messagesExchanged: int("messagesExchanged").default(0),
  conversationDepth: int("conversationDepth").default(0), // Number of back-and-forth exchanges
  linksClicked: int("linksClicked").default(0),
  offersViewed: int("offersViewed").default(0),
  converted: int("converted").default(0), // 1 if user converted (clicked affiliate link)
  fbGroupJoined: int("fbGroupJoined").default(0),
  // Session duration
  sessionStartedAt: timestamp("sessionStartedAt").defaultNow(),
  sessionEndedAt: timestamp("sessionEndedAt"),
  sessionDurationSeconds: int("sessionDurationSeconds"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PersonaAssignment = typeof personaAssignments.$inferSelect;
export type InsertPersonaAssignment = typeof personaAssignments.$inferInsert;

/**
 * Persona metrics - aggregated daily metrics per persona for A/B comparison
 */
export const personaMetrics = mysqlTable("persona_metrics", {
  id: int("id").autoincrement().primaryKey(),
  personaId: int("personaId").notNull(),
  date: timestamp("date").notNull(),
  // Engagement metrics
  totalSessions: int("totalSessions").default(0),
  totalMessages: int("totalMessages").default(0),
  avgMessagesPerSession: int("avgMessagesPerSession").default(0), // * 100 for precision
  avgSessionDuration: int("avgSessionDuration").default(0), // In seconds
  // Conversion metrics
  engagementRate: int("engagementRate").default(0), // % who replied to first message * 100
  clickThroughRate: int("clickThroughRate").default(0), // % who clicked affiliate links * 100
  conversionRate: int("conversionRate").default(0), // % who converted * 100
  fbJoinRate: int("fbJoinRate").default(0), // % who joined FB group * 100
  // Revenue metrics
  totalClicks: int("totalClicks").default(0),
  totalConversions: int("totalConversions").default(0),
  estimatedRevenue: int("estimatedRevenue").default(0), // In CZK
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PersonaMetrics = typeof personaMetrics.$inferSelect;
export type InsertPersonaMetrics = typeof personaMetrics.$inferInsert;

/**
 * Email captures - stores emails collected from chatbot for remarketing
 */
export const emailCaptures = mysqlTable("email_captures", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  // Chatbot context
  sessionId: varchar("sessionId", { length: 64 }).notNull(), // Which chat session
  personaId: int("personaId"), // Which persona was assigned
  personaName: varchar("personaName", { length: 50 }), // Persona name for quick filtering
  // Source tracking
  source: varchar("source", { length: 50 }).default("chatbot"), // 'chatbot', 'popup', 'form'
  captureMethod: varchar("captureMethod", { length: 50 }).default("email_popup"), // 'email_popup', 'inline_form', etc.
  // User context at time of capture
  messageCount: int("messageCount").default(0), // How many messages before capture
  lastDestinationMentioned: varchar("lastDestinationMentioned", { length: 100 }),
  lastBudgetMentioned: int("lastBudgetMentioned"),
  // GDPR compliance
  gdprConsent: int("gdprConsent").default(0).notNull(), // 1 = consented to marketing
  consentText: text("consentText"), // The exact consent text shown
  // Marketing metadata
  tags: text("tags"), // JSON array of tags for segmentation
  segment: varchar("segment", { length: 50 }), // 'budget_traveler', 'luxury', 'family', etc.
  // Lead scoring
  leadScore: int("leadScore").default(0), // 0-100 score based on engagement
  leadTier: varchar("leadTier", { length: 20 }).default("cold"), // 'hot', 'warm', 'cold'
  // Engagement tracking
  emailSent: int("emailSent").default(0), // 1 if welcome email sent
  emailOpened: int("emailOpened").default(0), // 1 if opened any email
  emailClicked: int("emailClicked").default(0), // 1 if clicked link in email
  unsubscribed: int("unsubscribed").default(0), // 1 if unsubscribed
  // Conversion tracking
  converted: int("converted").default(0), // 1 if made a purchase
  convertedAt: timestamp("convertedAt"), // When they converted
  // Timestamps
  capturedAt: timestamp("capturedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailCapture = typeof emailCaptures.$inferSelect;
export type InsertEmailCapture = typeof emailCaptures.$inferInsert;

/**
 * Email campaigns - defines email sequences and templates
 */
export const emailCampaigns = mysqlTable("email_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'welcome_series', 'remarketing', 'promotional'
  // Email content
  subject: varchar("subject", { length: 200 }).notNull(),
  preheader: varchar("preheader", { length: 200 }), // Preview text
  htmlContent: text("htmlContent").notNull(),
  textContent: text("textContent"), // Plain text fallback
  // Personalization
  personaVariant: varchar("personaVariant", { length: 50 }), // null = all, or specific persona
  segmentTarget: varchar("segmentTarget", { length: 50 }), // null = all, or specific segment
  // Sequence settings
  sequenceOrder: int("sequenceOrder").default(1), // Order in welcome series
  delayDays: int("delayDays").default(0), // Days after trigger to send
  // Status
  isActive: int("isActive").default(1),
  // Stats
  totalSent: int("totalSent").default(0),
  totalOpened: int("totalOpened").default(0),
  totalClicked: int("totalClicked").default(0),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = typeof emailCampaigns.$inferInsert;

/**
 * Email queue - scheduled emails waiting to be sent
 */
export const emailQueue = mysqlTable("email_queue", {
  id: int("id").autoincrement().primaryKey(),
  emailCaptureId: int("emailCaptureId").notNull(), // Reference to email capture
  campaignId: int("campaignId").notNull(), // Which campaign/template
  // Scheduling
  scheduledFor: timestamp("scheduledFor").notNull(), // When to send
  // Status
  status: varchar("status", { length: 20 }).default("pending"), // 'pending', 'sent', 'failed', 'cancelled'
  sentAt: timestamp("sentAt"),
  errorMessage: text("errorMessage"),
  // Tracking
  opened: int("opened").default(0),
  openedAt: timestamp("openedAt"),
  clicked: int("clicked").default(0),
  clickedAt: timestamp("clickedAt"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailQueueItem = typeof emailQueue.$inferSelect;
export type InsertEmailQueueItem = typeof emailQueue.$inferInsert;

/**
 * Remarketing triggers - tracks when to send remarketing emails
 */
export const remarketingTriggers = mysqlTable("remarketing_triggers", {
  id: int("id").autoincrement().primaryKey(),
  emailCaptureId: int("emailCaptureId").notNull(),
  // Trigger type
  triggerType: varchar("triggerType", { length: 50 }).notNull(), // '7_day_no_conversion', 'abandoned_search', etc.
  // Scheduling
  triggerDate: timestamp("triggerDate").notNull(), // When to trigger
  // Status
  status: varchar("status", { length: 20 }).default("pending"), // 'pending', 'triggered', 'cancelled', 'converted'
  triggeredAt: timestamp("triggeredAt"),
  // Context at trigger time
  contextData: text("contextData"), // JSON with relevant data
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RemarketingTrigger = typeof remarketingTriggers.$inferSelect;
export type InsertRemarketingTrigger = typeof remarketingTriggers.$inferInsert;

/**
 * Lead score history - tracks changes in lead scores over time
 */
export const leadScoreHistory = mysqlTable("lead_score_history", {
  id: int("id").autoincrement().primaryKey(),
  emailCaptureId: int("emailCaptureId").notNull(),
  previousScore: int("previousScore").default(0),
  newScore: int("newScore").notNull(),
  reason: varchar("reason", { length: 200 }), // What caused the change
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LeadScoreHistoryItem = typeof leadScoreHistory.$inferSelect;
export type InsertLeadScoreHistoryItem = typeof leadScoreHistory.$inferInsert;


/**
 * Price alerts - users subscribe to get notified when prices drop for specific destinations
 */
export const priceAlerts = mysqlTable("price_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  destinationSlug: varchar("destinationSlug", { length: 100 }).notNull(),
  destinationName: varchar("destinationName", { length: 100 }).notNull(),
  targetPrice: int("targetPrice"), // Optional target price threshold
  currentPrice: int("currentPrice").notNull(), // Price at time of alert creation (CZK)
  priceDropPercent: int("priceDropPercent").default(10), // Minimum % drop to trigger alert
  isActive: int("isActive").default(1), // 1 = active, 0 = paused
  lastCheckedAt: timestamp("lastCheckedAt"),
  lastAlertSentAt: timestamp("lastAlertSentAt"),
  alertCount: int("alertCount").default(0),
  notifyEmail: varchar("notifyEmail", { length: 255 }),
  emailEnabled: int("emailEnabled").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PriceAlert = typeof priceAlerts.$inferSelect;
export type InsertPriceAlert = typeof priceAlerts.$inferInsert;

/**
 * Notification log - tracks all sent notifications (email, push, owner)
 */
export const notificationLog = mysqlTable("notification_log", {
  id: int("id").autoincrement().primaryKey(),
  alertId: int("alertId").notNull(),
  userId: int("userId"),
  notifyEmail: varchar("notifyEmail", { length: 255 }),
  destinationName: varchar("destinationName", { length: 100 }).notNull(),
  destinationSlug: varchar("destinationSlug", { length: 100 }).notNull(),
  oldPrice: int("oldPrice").notNull(),
  newPrice: int("newPrice").notNull(),
  dropPercent: int("dropPercent").notNull(),
  channel: varchar("channel", { length: 30 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  errorMessage: text("errorMessage"),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
});

export type NotificationLogEntry = typeof notificationLog.$inferSelect;
export type InsertNotificationLogEntry = typeof notificationLog.$inferInsert;

/**
 * Price history - tracks price changes over time for destinations
 */
export const priceHistory = mysqlTable("price_history", {
  id: int("id").autoincrement().primaryKey(),
  destination: varchar("destination", { length: 100 }).notNull(),
  destinationSlug: varchar("destinationSlug", { length: 100 }).notNull(),
  price: int("price").notNull(), // Price in CZK
  source: varchar("source", { length: 50 }).default("pelikan"), // 'pelikan', 'kiwi'
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

export type PriceHistoryItem = typeof priceHistory.$inferSelect;
export type InsertPriceHistoryItem = typeof priceHistory.$inferInsert;

/**
 * Social shares - tracks when users share deals on social media
 */
export const socialShares = mysqlTable("social_shares", {
  id: int("id").autoincrement().primaryKey(),
  shareCode: varchar("shareCode", { length: 20 }).notNull().unique(), // Unique share tracking code
  platform: varchar("platform", { length: 30 }).notNull(), // 'facebook', 'twitter', 'whatsapp', 'copy_link'
  destination: varchar("destination", { length: 100 }),
  destinationSlug: varchar("destinationSlug", { length: 100 }),
  pageUrl: text("pageUrl"), // Which page was shared
  // Referral tracking
  referrerEmail: varchar("referrerEmail", { length: 320 }), // Who shared
  referralClicks: int("referralClicks").default(0), // How many people clicked the shared link
  referralConversions: int("referralConversions").default(0), // How many converted
  // Discount code
  discountCode: varchar("discountCode", { length: 20 }), // Generated discount code for sharer
  discountUsed: int("discountUsed").default(0), // 1 if discount was used
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SocialShare = typeof socialShares.$inferSelect;
export type InsertSocialShare = typeof socialShares.$inferInsert;

/**
 * Browsing history - tracks user browsing for personalization (server-side)
 * Matches existing DB table with columns: userId, sessionId, destinationSlug, destinationName,
 * pageType, contentId, timeSpent, scrollDepth, clickedCTA, addedToWishlist, deviceType, viewedAt, createdAt
 */
export const browsingHistory = mysqlTable("browsing_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  destinationSlug: varchar("destinationSlug", { length: 100 }).notNull(),
  destinationName: varchar("destinationName", { length: 100 }).notNull(),
  pageType: varchar("pageType", { length: 50 }),
  contentId: varchar("contentId", { length: 100 }),
  timeSpent: int("timeSpent"),
  scrollDepth: int("scrollDepth"),
  clickedCTA: int("clickedCTA").default(0),
  addedToWishlist: int("addedToWishlist").default(0),
  deviceType: varchar("deviceType", { length: 20 }),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BrowsingHistoryItem = typeof browsingHistory.$inferSelect;
export type InsertBrowsingHistoryItem = typeof browsingHistory.$inferInsert;

/**
 * Push subscriptions - stores Web Push API subscriptions for browser notifications
 */
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  endpoint: text("endpoint").notNull(), // Push service endpoint URL
  p256dhKey: text("p256dhKey").notNull(), // Public key for encryption
  authKey: text("authKey").notNull(), // Auth secret for encryption
  userId: int("userId"), // Optional - if user is logged in
  sessionId: varchar("sessionId", { length: 64 }), // Session identifier
  isActive: int("isActive").default(1), // 1 = active, 0 = unsubscribed/expired
  // Category preferences: JSON array of enabled categories
  // Default: all categories enabled ["price_drop","news","deal","custom"]
  notificationPreferences: text("notificationPreferences").default('["price_drop","news","deal","custom"]'),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

/**
 * Daily report log - tracks sent daily reports
 */
export const dailyReportLog = mysqlTable("daily_report_log", {
  id: int("id").autoincrement().primaryKey(),
  reportDate: varchar("reportDate", { length: 10 }).notNull(), // YYYY-MM-DD
  emailSent: int("emailSent").default(0),
  ownerNotified: int("ownerNotified").default(0),
  metricsJson: text("metricsJson"), // JSON snapshot of metrics
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyReportLogEntry = typeof dailyReportLog.$inferSelect;
export type InsertDailyReportLogEntry = typeof dailyReportLog.$inferInsert;

/**
 * Push A/B Tests - tracks A/B test variants for push notifications
 */
export const pushAbTests = mysqlTable("push_ab_tests", {
  id: int("id").autoincrement().primaryKey(),
  testName: varchar("testName", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).default("active"), // active, completed, cancelled
  variantATitle: text("variantA_title").notNull(),
  variantABody: text("variantA_body").notNull(),
  variantBTitle: text("variantB_title").notNull(),
  variantBBody: text("variantB_body").notNull(),
  category: varchar("category", { length: 20 }).default("custom"),
  url: text("url"),
  variantASent: int("variantA_sent").default(0),
  variantAOpened: int("variantA_opened").default(0),
  variantBSent: int("variantB_sent").default(0),
  variantBOpened: int("variantB_opened").default(0),
  winner: varchar("winner", { length: 1 }), // 'A' or 'B' or null
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type PushAbTest = typeof pushAbTests.$inferSelect;
export type InsertPushAbTest = typeof pushAbTests.$inferInsert;

/**
 * Click events for heatmap tracking
 */
export const clickEvents = mysqlTable("click_events", {
  id: int("id").autoincrement().primaryKey(),
  page: varchar("page", { length: 255 }).notNull().default("/"),
  x: float("x").notNull(),
  y: float("y").notNull(),
  viewportWidth: int("viewportWidth").notNull(),
  viewportHeight: int("viewportHeight").notNull(),
  elementTag: varchar("elementTag", { length: 50 }),
  elementText: varchar("elementText", { length: 255 }),
  elementId: varchar("elementId", { length: 100 }),
  elementClass: varchar("elementClass", { length: 255 }),
  sessionId: varchar("sessionId", { length: 64 }),
  userId: int("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Conversion events for funnel tracking
 */
export const conversionEvents = mysqlTable("conversion_events", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  userId: int("userId"),
  eventType: varchar("eventType", { length: 50 }).notNull(),
  page: varchar("page", { length: 255 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Email follow-ups for automated post-exit-intent emails
 */
export const emailFollowups = mysqlTable("email_followups", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  destinationName: varchar("destinationName", { length: 255 }),
  destinationSlug: varchar("destinationSlug", { length: 255 }),
  triggerSource: varchar("triggerSource", { length: 50 }).notNull().default("exit_intent"),
  scheduledAt: timestamp("scheduledAt").notNull(),
  sentAt: timestamp("sentAt"),
  openedAt: timestamp("openedAt"),
  clickedAt: timestamp("clickedAt"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Site settings table - stores admin-configurable settings (FB Pixel ID, Google Ads ID, etc.)
 */
export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

/**
 * Email A/B Test table - tracks different email template variants and their performance
 */
export const emailAbTests = mysqlTable("email_ab_tests", {
  id: int("id").autoincrement().primaryKey(),
  testName: varchar("testName", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "completed", "paused"]).default("active").notNull(),
  variantASubject: text("variantASubject").notNull(),
  variantACtaText: varchar("variantACtaText", { length: 100 }).notNull(),
  variantBSubject: text("variantBSubject").notNull(),
  variantBCtaText: varchar("variantBCtaText", { length: 100 }).notNull(),
  variantASent: int("variantASent").default(0).notNull(),
  variantBSent: int("variantBSent").default(0).notNull(),
  variantAOpened: int("variantAOpened").default(0).notNull(),
  variantBOpened: int("variantBOpened").default(0).notNull(),
  variantAClicked: int("variantAClicked").default(0).notNull(),
  variantBClicked: int("variantBClicked").default(0).notNull(),
  winner: mysqlEnum("winner", ["none", "A", "B"]).default("none").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailAbTest = typeof emailAbTests.$inferSelect;
export type InsertEmailAbTest = typeof emailAbTests.$inferInsert;

/**
 * Remarketing email send log - tracks all sent remarketing emails for dashboard analytics
 */
export const remarketingEmailLog = mysqlTable("remarketing_email_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  userEmail: varchar("userEmail", { length: 320 }).notNull(),
  userName: varchar("userName", { length: 255 }),
  variant: mysqlEnum("variant", ["A", "B", "default"]).default("default").notNull(),
  abTestId: int("abTestId"),
  subject: text("subject").notNull(),
  itemCount: int("itemCount").notNull().default(1),
  status: mysqlEnum("status", ["sent", "opened", "clicked", "bounced", "failed"]).default("sent").notNull(),
  openedAt: timestamp("openedAt"),
  clickedAt: timestamp("clickedAt"),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RemarketingEmailLog = typeof remarketingEmailLog.$inferSelect;
export type InsertRemarketingEmailLog = typeof remarketingEmailLog.$inferInsert;


/**
 * Revolut A/B Test Results - stores completion status and winner
 */
export const revolutABTestResults = mysqlTable("revolut_ab_test_results", {
  id: int("id").autoincrement().primaryKey(),
  testName: varchar("testName", { length: 100 }).notNull(), // e.g., "revolut_popup_v1"
  isCompleted: int("isCompleted").default(0).notNull(), // 0 = running, 1 = completed
  winnerVariant: mysqlEnum("winnerVariant", ["banner", "text", "minimal"]),
  completionReason: varchar("completionReason", { length: 255 }), // e.g., "Bayesian P(best) >= 95%"
  
  // Final metrics at completion
  bannerImpressions: int("bannerImpressions").default(0),
  bannerClicks: int("bannerClicks").default(0),
  bannerConversions: int("bannerConversions").default(0),
  
  textImpressions: int("textImpressions").default(0),
  textClicks: int("textClicks").default(0),
  textConversions: int("textConversions").default(0),
  
  minimalImpressions: int("minimalImpressions").default(0),
  minimalClicks: int("minimalClicks").default(0),
  minimalConversions: int("minimalConversions").default(0),
  
  // Bayesian statistics at completion
  winnerProbability: int("winnerProbability").default(0), // Stored as percentage (95 = 95%)
  winnerExpectedLoss: int("winnerExpectedLoss").default(0), // Stored as basis points (50 = 0.50%)
  
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RevolutABTestResult = typeof revolutABTestResults.$inferSelect;
export type InsertRevolutABTestResult = typeof revolutABTestResults.$inferInsert;

// ============ Social Media Scheduler ============
export const socialPosts = mysqlTable("social_posts", {
  id: int("id").autoincrement().primaryKey(),
  platform: mysqlEnum("platform", ["facebook", "instagram", "both", "linkedin", "all"]).notNull().default("both"),
  postType: mysqlEnum("postType", ["post", "story", "reel", "flight_deal", "blog_article", "custom"]).notNull().default("flight_deal"),
  contentType: mysqlEnum("contentType", ["deal", "tip", "destination", "custom"]).notNull().default("deal"),
  caption: text("caption").notNull(),
  title: varchar("title", { length: 255 }),
  imageUrl: varchar("imageUrl", { length: 1000 }),
  linkUrl: varchar("linkUrl", { length: 1000 }),
  imagePrompt: text("imagePrompt"),
  hashtags: text("hashtags"),
  status: mysqlEnum("status", ["draft", "scheduled", "published", "failed", "cancelled"]).notNull().default("draft"),
  scheduledAt: timestamp("scheduledAt"),
  publishedAt: timestamp("publishedAt"),
  fbPostId: varchar("fbPostId", { length: 150 }),
  igMediaId: varchar("igMediaId", { length: 100 }),
  liPostId: varchar("liPostId", { length: 200 }),
  fbError: text("fbError"),
  igError: text("igError"),
  liError: text("liError"),
  scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
  sourceDestination: varchar("sourceDestination", { length: 100 }),
  sourcePrice: int("sourcePrice"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = typeof socialPosts.$inferInsert;

export const socialSettings = mysqlTable("social_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SocialSetting = typeof socialSettings.$inferSelect;

// ============ Google Indexing API Logs ============
export const indexingLogs = mysqlTable("indexing_logs", {
  id: int("id").autoincrement().primaryKey(),
  url: varchar("url", { length: 1000 }).notNull(),
  type: mysqlEnum("type", ["URL_UPDATED", "URL_DELETED"]).notNull().default("URL_UPDATED"),
  status: mysqlEnum("status", ["success", "failed", "simulated"]).notNull().default("success"),
  apiResponse: text("apiResponse"),
  errorMessage: text("errorMessage"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});
export type IndexingLog = typeof indexingLogs.$inferSelect;
export type InsertIndexingLog = typeof indexingLogs.$inferInsert;

// ============ Web Push Campaigns ============
export const pushCampaigns = mysqlTable("push_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  icon: varchar("icon", { length: 1000 }),
  url: varchar("url", { length: 1000 }),
  sentCount: int("sentCount").default(0),
  failedCount: int("failedCount").default(0),
  status: mysqlEnum("status", ["sent", "failed", "simulated"]).notNull().default("sent"),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
});
export type PushCampaign = typeof pushCampaigns.$inferSelect;
export type InsertPushCampaign = typeof pushCampaigns.$inferInsert;

// ============ Price Trackers (Hlídač Cen Letenek & Dovolených) ============
export const priceTrackers = mysqlTable("price_trackers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  type: mysqlEnum("type", ["flight", "holiday", "both"]).notNull().default("both"),
  destination: varchar("destination", { length: 255 }).notNull().default("Všechny destinace"),
  maxPrice: int("maxPrice").notNull(),
  currentPrice: int("currentPrice"),
  lowestPriceSeen: int("lowestPriceSeen"),
  status: mysqlEnum("status", ["active", "triggered", "paused"]).notNull().default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastNotifiedAt: timestamp("lastNotifiedAt"),
});
export type PriceTracker = typeof priceTrackers.$inferSelect;
export type InsertPriceTracker = typeof priceTrackers.$inferInsert;
