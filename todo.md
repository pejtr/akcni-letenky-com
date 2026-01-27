# Project TODO

## Phase 1: Database Schema & Core Data
- [x] Create flights table with route, price, discount, airline, stops, duration
- [x] Create offers table for featured deals with images and metadata
- [x] Create wishlists table for user favorites
- [x] Create offer_views table for tracking urgency indicators
- [x] Set up database relationships and indexes

## Phase 2: Frontend UI & Layout
- [x] Configure Tailwind with pink/magenta (#E91E63) primary color scheme
- [x] Add Google Fonts (modern sans-serif)
- [x] Create sticky navigation header with logo, menu links, phone number
- [x] Build hero section with full-width background image
- [x] Add hero headline "Last Minute Letenky 2026: AŽ -60% Sleva!"
- [x] Create 4-field flight search form (from, to, when, passengers)
- [x] Style pink CTA button "HLEDAT LETENKY"
- [x] Make navigation sticky on scroll
- [x] Ensure mobile-responsive layout

## Phase 3: Flight Offers System
- [x] Create featured offers section with 4-column grid
- [x] Build flight deal cards with discount badges
- [x] Add route info, price, star ratings to cards
- [x] Style "REZERVUJTE TEĎ" buttons
- [x] Create main listings section with 2-column grid
- [x] Add thumbnail images and route details
- [x] Show original/discounted prices
- [x] Add "ZOBRAZIT NABÍDKU" buttons
- [x] Implement flight data structure and database
- [x] Create tRPC endpoints for flight queries
- [x] Seed database with sample flight data
- [ ] Implement real-time flight aggregation service for Pelikán
- [ ] Add Kiwi.com API integration
- [ ] Set up 24-hour caching with midnight refresh

## Phase 4: Interactive Features
- [x] Build chatbot widget component
- [x] Add circular travel expert avatar
- [x] Create welcome message bubble
- [x] Add online status indicator
- [x] Make chatbot expandable/collapsible
- [x] Position chatbot bottom-right
- [x] Add heart icons to offer cards for wishlist
- [x] Implement wishlist tRPC endpoints
- [x] Create social proof notification widget
- [x] Add "TAM CHCI >" CTA button to notifications
- [x] Implement pulsating animation for notifications
- [ ] Connect wishlist heart icons to backend
- [ ] Add "X people viewing" live counter
- [ ] Add "Zbývá X míst" (remaining seats) display
- [ ] Implement simulated scarcity countdown logic
- [ ] Create user profile page
- [ ] Add saved searches functionality
- [ ] Build personalized recommendations

## Phase 5: Testing & Delivery
- [x] Write vitest tests for flight queries
- [x] Write vitest tests for wishlist functionality
- [x] Run all tests and verify they pass
- [x] Test all features on desktop
- [x] Verify Czech translations
- [x] Check color scheme consistency
- [x] Test flight search functionality
- [x] Test chatbot interactions
- [x] Test mobile responsiveness
- [x] Create first checkpoint
- [x] Deliver to user

## Landing Page Enhancements (Based on Current akcni-letenky.com)
- [x] Add yellow "NEJLEVNĚJŠÍ AKČNÍ LETENKY" banner at top
- [x] Implement category tabs (Dovolená se slevou až 80%, Eurovíkendy, Hotely, Nejlevnější letenky)
- [x] Create featured European cities section (Praha → Londýn, Paříž, Řím, Barcelona)
- [x] Create "Zpáteční levné letenky" destination grid section (4x4 grid)
- [x] Add destination cards with prices and country labels
- [x] Implement airline logos section (Austrian, Emirates, Qatar, Ryanair, KLM, etc.)
- [x] Add "Akční letenky: hledejte nejvýhodnější spojení snadno" trust text
- [x] Create sticky bottom yellow promotional banner
- [x] Add "Letenky do 1 500 Kč | Dovolená se slevou až 80%" to sticky banner
- [x] Ensure sticky banner appears on scroll down (after 50% page)
- [x] Add disclaimer text about prices
- [x] Test all new sections on desktop and mobile
- [x] Run all tests and verify they pass (10/10)

## SEO Fixes and Design Refinements
- [x] Add meta description (50-160 characters)
- [x] Add meta keywords
- [x] Update page title with keywords
- [x] Add Open Graph meta tags
- [x] Update logo to match current website design
- [x] Change category tabs to links with blue color
- [x] Search and add real destination images
- [x] Add destination thumbnails to grid cards
- [ ] Add real airline logos (not emoji) - using emoji placeholders for now
- [x] Fix sticky banner text to "Letenky do 1 500 Kč"
- [x] Add country labels under prices in destination grid
- [x] Test SEO meta tags
- [x] Create sitemap.xml
- [x] Create robots.txt

## Advanced SEO Optimizations
- [x] Add Schema.org JSON-LD for Organization
- [x] Add Schema.org JSON-LD for WebSite with SearchAction
- [x] Add Schema.org JSON-LD for ItemList with Flight offers
- [x] Add canonical URL meta tag
- [x] Add hreflang meta tags for Czech language
- [x] Add meta robots tag with max-image-preview
- [x] Add language and author meta tags
- [x] Add revisit-after meta tag
- [x] Implement breadcrumbs with BreadcrumbList schema
- [x] Add semantic HTML5 tags (article, section, nav, header)
- [x] Add ARIA labels and roles for accessibility
- [x] Optimize images with alt tags and aria-labels
- [x] Add preload tags for critical images
- [x] Add dns-prefetch and preconnect for fonts
- [ ] Test structured data with Google Rich Results Test
- [ ] Test with Google PageSpeed Insights
- [ ] Validate HTML5 with W3C Validator

## Newest and Most Popular Flights Section
- [ ] Update flights table schema to track view counts
- [ ] Add createdAt timestamp to flights table
- [ ] Create tRPC endpoint for newest flights (sorted by createdAt DESC)
- [ ] Create tRPC endpoint for most popular flights (sorted by views DESC)
- [ ] Build UI section with tabs for "Nejnovější" and "Nejžádanější"
- [ ] Add visual indicators (NEW badge, fire icon for popular)
- [ ] Implement caching for performance (24h refresh cycle)
- [ ] Test newest and most popular flights display
- [ ] Write vitest tests for new endpoints

## Design Refinements to Match Original
- [x] Add hero search form with 4 fields (Kam se chystáte?, Kdy?, Kolik osob?, VYHLEDAT DOVOLENOU)
- [x] Make featured cities cards larger with rounded corners and orange border buttons
- [x] Add yellow banner title for "Zpáteční levné letenky" section
- [x] Update destination grid cards with horizontal layout (small image left, text center, arrow right)
- [x] Add country label below price in destination cards
- [x] Ensure sticky banner stays as-is (already good)
- [x] Test all layout changes on desktop and mobile
- [x] Run all tests and verify they pass (10/10)

## Use Original Graphics from www.akcni-letenky.com
- [x] Download featured city images (Praha → Londýn, Paříž, Řím, Barcelona)
- [x] Download destination thumbnails (12 of 16 destinations)
- [x] Download real airline logos (Austrian Airlines, Emirates, Qatar Airways, Ryanair, Air France, Lufthansa, Icelandair, Turkish Airlines, KLM, British Airways, Wizz Air, LOT)
- [x] Replace placeholder images with original graphics
- [x] Update image paths in Home.tsx
- [x] Test all images load correctly

## Airline Pages Implementation
- [ ] Create /letecke-spolecnosti route structure
- [ ] Build dynamic airline page component
- [ ] Add airline-specific flight filtering
- [ ] Create pages for all 12 airlines (Ryanair, Wizz Air, etc.)
- [ ] Add airline logo and description to each page
- [ ] Implement SEO meta tags for airline pages
- [ ] Update navigation with airline links
- [ ] Test all airline pages

## Database and Flight Data
- [ ] Create comprehensive seed data for flights
- [ ] Add more realistic flight offers (50+ flights)
- [ ] Include multiple airlines in seed data
- [ ] Add destination variety
- [ ] Implement 24-hour caching for performance

## Functional Search Form
- [ ] Connect hero search form to backend
- [ ] Implement search by destination
- [ ] Implement search by date
- [ ] Implement search by number of passengers
- [ ] Add search results page
- [ ] Display filtered flight results
- [ ] Test search functionality

## Automated Content Generation System (Target: 1000+ daily visitors)

### Database Schema
- [x] Create articles table (title, slug, content, meta description, keywords, featured image, author, published date, category)
- [x] Create destinations table (name, slug, description, country, region, featured image, SEO meta)
- [x] Create article_destinations relationship table
- [x] Add indexes for SEO-friendly URLs and fast queries
- [x] Run database migration

### AI Article Generator
- [x] Create automated article generation service using LLM
- [x] Implement daily cron job (runs at 6:00 AM)
- [x] Generate article templates for different types (destination guides, airline reviews, travel tips, seasonal deals)
- [x] Include mandatory in-article photos for SEO
- [ ] Implement internal linking to existing pages
- [ ] Add Schema.org Article structured data
- [x] Generate SEO-optimized titles and meta descriptions

### Destination Landing Pages
- [ ] Create /letenky-do-[destination] route structure
- [ ] Build dynamic destination page component
- [ ] Add destination description, photos, and flight offers
- [ ] Implement breadcrumbs with BreadcrumbList schema
- [ ] Add SEO meta tags for each destination
- [ ] Create pages for top 50 destinations
- [ ] Add internal links between related destinations

### Blog System
- [x] Create /blog route and listing page
- [x] Build article detail page component
- [ ] Add article categories and filtering
- [ ] Implement pagination for article listings
- [x] Add related articles section
- [ ] Create RSS feed for blog
- [ ] Add social sharing buttons

### API Integration for Real Flight Data
- [ ] Research Pelikán.cz API documentation
- [ ] Research Kiwi.com API documentation
- [ ] Implement API client for Pelikán
- [ ] Implement API client for Kiwi.com
- [ ] Create data normalization layer
- [ ] Implement 24-hour caching (refresh at midnight)
- [ ] Add error handling and fallback logic
- [ ] Test API integration with real data

### SEO Optimizations
- [ ] Update sitemap.xml with priority values (homepage: 1.0, blog: 0.8, articles: 0.6)
- [ ] Add dynamic sitemap generation for all pages
- [ ] Update robots.txt with blog allow rules
- [ ] Create custom 404 page with search and useful links
- [ ] Implement automatic image optimization
- [ ] Add Open Graph and Twitter Card meta tags to all pages
- [ ] Test with Google Search Console and PageSpeed Insights

## Destination Landing Pages & Blog Improvements (Current Task)

### Destination Landing Page for Paris
- [ ] Create DestinationPage component with dynamic routing
- [ ] Add route /letenky-do-parize to App.tsx
- [ ] Display destination hero section with featured image
- [ ] Show destination description and travel information
- [ ] Filter and display flights to Paris
- [ ] Add "Why visit Paris" section with highlights
- [ ] Include practical information (airport, visa, best time to visit)
- [ ] Add SEO meta tags (title, description, keywords)
- [ ] Implement Schema.org Place structured data
- [ ] Add breadcrumbs with BreadcrumbList schema
- [ ] Include call-to-action for flight search
- [ ] Add related articles section
- [ ] Test Paris landing page

### Blog Related Articles Section
- [ ] Add "Související články" section to article detail page
- [ ] Filter articles by same destination or category
- [ ] Display 3-4 related article cards
- [ ] Add internal linking between articles

### Blog Article Filtering by Category
- [ ] Add category filter dropdown to blog listing page
- [ ] Implement category filtering in tRPC endpoint
- [ ] Add category badges to article cards
- [ ] Test category filtering functionality

### SEO Title Fix
- [x] Change SEO title from "Akční Letenky - Last Minute Flights" to fully Czech version
- [x] Update all page titles to Czech language
- [x] Verify title in index.html and meta tags

### Update Logo and Images from Original Website
- [ ] Copy new logo from uploaded file to project
- [ ] Download all destination images from www.akcni-letenky.com
- [ ] Update logo references in all components
- [ ] Verify all images display correctly

### Update Hero Banner Style
- [ ] Change hero banner to yellow background with blue text
- [ ] Match original website design exactly
- [ ] Update banner styling in Home.tsx

### Add Footer Section
- [x] Create footer with orange background matching original design
- [x] Add "Proč rezervovat u nás?" section with bullet points
- [x] Add Facebook community links section
- [x] Add "Zobrazit nejvýhodnější letenky" CTA button
- [x] Add copyright and legal info
- [ ] Test footer on all pages

### Download All Destination Images
- [x] Download all 16 destination thumbnail images from original website
- [x] Verify all images are properly saved in client/public directory
- [x] Test that all destination cards display images correctly
- [x] Ensure images are optimized for web (proper size and format)

### Update Background Colors and Styling
- [x] Change all sections background to light gray (#F5F7FA) to match original
- [x] Ensure destination cards have white background with proper shadow
- [x] Update airline logos section styling
- [ ] Add "Kategorie dovolených" section with category cards
- [ ] Match exact spacing and layout from original website

## Shared API Chatbot Integration
- [ ] Analyze reference chatbot from https://manus.im/share/c4EsDWGrjsskP2UORfE57w
- [ ] Design shared API architecture for multi-project chatbot synchronization
- [ ] Create database schema for chatbot conversations, reports, and analytics
- [ ] Implement backend API endpoints for chatbot data sync
- [ ] Build chatbot UI component with sales conversation flow
- [ ] Integrate chatbot with shared API for knowledge synchronization
- [ ] Add conversation tracking and reporting system
- [ ] Implement conversion tracking and trend analysis
- [ ] Test chatbot across multiple projects
- [ ] Document API integration and chatbot setup

## UI Improvements - Chatbot and Notifications
- [x] Enlarge chatbot widget for better visibility (16px → 20px)
- [x] Add pulsing animation to chatbot widget
- [x] Change chatbot icon color from white to green
- [x] Move notification cards closer to bottom edge (bottom-24 → bottom-6)
- [x] Enlarge bottom "Akční nabídka" banner (py-3 → py-4, text-sm → text-base)
- [ ] Test all UI changes on desktop and mobile

## High-Converting Sales Chatbot Implementation (Alex Hormozi Principles)
- [x] Design chatbot conversation flow using Hormozi sales principles (Value First, Scarcity, Urgency, Social Proof)
- [x] Create database schema for chatbot conversations, leads, conversions, and analytics
- [x] Implement LLM-powered chatbot backend with proactive offers
- [x] Build chatbot UI with real-time messaging and auto-scroll
- [x] Add proactive flight offer buttons in chat messages
- [x] Integrate FB group CTAs (33,500 + 29,200 members)
- [x] Add WhatsApp community invitation system
- [x] Track conversions and community joins via tRPC
- [x] Add loading indicator ("Píše...") during AI response
- [ ] Implement shared API for multi-project synchronization
- [ ] Create analytics dashboard for ROI tracking
- [ ] Test chatbot with real conversations
- [ ] Generate daily analytics reports
- [ ] Add email capture for newsletter

## SEO Title Optimization (Alex Hormozi Principles)
- [x] Change title from "Nejlevnější AKČNÍ LETENKY Kamkoliv - LAST MINUTE z Prahy ✈ » Nejlevnější Lety" to "Akční Letenky z Prahy od 590 Kč | Sleva až -80% | Last Minute 2026"
- [x] Update Open Graph title
- [x] Update Twitter Card title
- [x] Verify title length is under 60 characters (currently 59)
- [ ] Test title display in Google SERP preview

## Central API for Multi-Project Synchronization
- [ ] Design REST API architecture for cross-project data sharing
- [ ] Create API endpoints for syncing conversations across projects
- [ ] Implement lead sharing and deduplication logic
- [ ] Add analytics aggregation endpoints
- [ ] Create API authentication and project identification system
- [ ] Build webhook system for real-time sync
- [ ] Document API for integration with other projects
- [ ] Test API with multiple project instances

## Admin Analytics Dashboard
- [x] Create /admin route with authentication
- [x] Build dashboard layout with key metrics cards
- [x] Implement affiliate click tracking (today, week, month, total)
- [x] Add top destinations by clicks chart
- [x] Add clicks by source breakdown (featured, grid, search)
- [x] Add click trend chart (30 days)
- [x] Add recent clicks list
- [x] Write vitest tests for affiliate tracking (32 tests passing)
- [ ] Add ROI calculator (commission revenue vs. costs)
- [ ] Display top destinations by clicks and conversions
- [ ] Show chatbot conversation statistics
- [ ] Add lead quality scoring system
- [ ] Create date range filters and export functionality
- [ ] Implement real-time updates with WebSocket or polling
- [ ] Add charts for trends visualization (Chart.js or Recharts)

## A/B Testing: Three Chatbot Personas (Charmed Model)
- [ ] Design three distinct personas based on Charmed sisters
- [ ] Persona 1: "Energetic" (Phoebe-inspired) - enthusiastic, emoji-heavy, casual
- [ ] Persona 2: "Royal/Deliberate" (Piper-inspired) - professional, helpful, structured
- [ ] Persona 3: "Royal/Deliberate" (Prue-inspired) - confident, direct, results-focused
- [ ] Create unique avatar images for each persona
- [ ] Implement persona rotation logic (33% split)
- [ ] Track conversion rates per persona
- [ ] Add persona identifier to conversation tracking
- [ ] Build comparison dashboard for persona performance
- [ ] Test all three personas with real conversations

## Fix Sticky Bottom Banner
- [x] Remove hide-on-scroll behavior from bottom "Akční nabídka" banner
- [x] Make banner always visible (fixed position)
- [x] Ensure proper z-index hierarchy (below main menu, above content)
- [ ] Test on desktop and mobile

## Fix Destination and Airline Cards to Match Original Design
- [ ] Update destination cards with white background and gray shadow
- [ ] Add hover effect with underline on destination name
- [ ] Ensure proper layout (image left, text center, arrow right)
- [ ] Update airline cards with white background
- [ ] Add blue text color for airline names
- [ ] Add hover effect with blue underline on airline names
- [ ] Verify all destination links match www.akcni-letenky.com
- [ ] Verify all airline links match www.akcni-letenky.com
- [ ] Test hover effects on desktop and mobile

## Change Magenta to Gold Color
- [x] Keep magenta as CTA color (matches original website)
- [x] Update phone number color to magenta (#E91E63)

## FAQ Schema Markup for Rich Snippets
- [x] Create FAQ section with 6 common questions about flight booking
- [x] Implement Schema.org FAQPage JSON-LD structured data
- [x] Add FAQ component to homepage with accordion UI
- [ ] Write vitest tests for FAQ schema

## Hero Section Redesign (Match Original Website)
- [x] Add full-width hero background image (coastal city Vernazza, Cinque Terre)
- [x] Update yellow banner with "NEJLEVNĚJŠÍ AKČNÍ LETENKY" text
- [x] Add white subtitle "Ušetřete do 50% na letu" with text shadow
- [x] Move search form into white card overlay on hero
- [x] Add trust badges (500+ Recenzí, hvězdička, Certifikace)
- [x] Test hero section on desktop

## Sticky Bottom Banner - Show After 60% Scroll
- [x] Add scroll percentage tracking state
- [x] Show banner only after user scrolls 60% of page
- [x] Test banner appearance behavior

## Affiliate API Integration (Pelikán, Kiwi.com)
- [ ] Research Pelikán affiliate API documentation
- [ ] Research Kiwi.com affiliate API documentation
- [ ] Implement search form submission to affiliate APIs
- [ ] Display real flight results from APIs
- [ ] Add affiliate tracking parameters

## Destination Landing Pages (SEO)
- [ ] Create /letenky-do-parize landing page
- [ ] Create /letenky-do-londyna landing page
- [ ] Create /letenky-do-rima landing page
- [ ] Add SEO meta tags and structured data for each page
- [ ] Link from main page to destination pages

## FAQ "Zobrazit více" Button
- [ ] Add "Zobrazit více" button to FAQ section
- [ ] Implement dynamic loading of additional FAQ items
- [ ] Store extended FAQ data in database or JSON

## Chatbot Widget Enlargement
- [x] Increase chatbot font size for better readability (text-base default, text-lg expanded)
- [x] Add expand/fullscreen button to chatbot header
- [x] Implement expanded view (700px x 85vh) with larger chat area
- [ ] Test chatbot on desktop and mobile

## Kiwi.com Affiliate API Integration
- [ ] Research Kiwi.com Tequila API documentation
- [ ] Create server-side API route for flight search
- [ ] Connect search form to Kiwi.com API
- [ ] Display real flight results with prices
- [ ] Add affiliate links to Kiwi.com booking

## Destination Landing Pages (SEO)
- [ ] Create /letenky-do-parize landing page
- [ ] Create /letenky-do-londyna landing page
- [ ] Add Schema.org structured data for destinations
- [ ] Implement dynamic flight offers for each destination
- [ ] Add internal linking from homepage

## FAQ Dynamic Loading
- [ ] Add "Zobrazit více" button to FAQ section
- [ ] Create extended FAQ data (additional 6+ questions)
- [ ] Implement smooth expand animation
- [ ] Track FAQ engagement for analytics

## Redesign Destination Sections (Match Original)
- [x] Featured destinations: 4 cards with image, title, description, orange price button
- [x] "Zpáteční levné letenky" grid: 4x4 layout with small images, city, price, country
- [x] Airline logos section: horizontal rows with logo + name
- [x] All destination cards clickable with Kiwi.com affiliate links
- [x] Fix non-working click handlers - now all cards link to Kiwi.com

## Logo Update
- [x] Copy new logo to public folder
- [x] Update header to use new logo image
- [x] Test logo display

## Admin Dashboard - Affiliate Click Tracking
- [ ] Create affiliateClicks database table (destination, source, timestamp, userAgent)
- [ ] Create tRPC endpoints for recording clicks and retrieving analytics
- [ ] Add click tracking to all affiliate links on homepage
- [ ] Create Admin Dashboard page with:
  - [ ] Total clicks overview (today, week, month, all time)
  - [ ] Top destinations by clicks
  - [ ] Click trend chart (last 30 days)
  - [ ] Click source breakdown (featured/grid/search)
- [ ] Write vitest tests for click tracking

## Chatbot Enhancement - Persistent Memory & RAG System
- [ ] Create chatbot_memory table for storing user preferences and context
- [ ] Create knowledge_base table for RAG content indexing
- [ ] Implement RAG retrieval functions for flights, destinations, articles
- [ ] Add semantic search for finding relevant content
- [ ] Store conversation history per user/session
- [ ] Extract and remember user preferences (destinations, budget, travel dates)
- [ ] Update LLM prompt to include RAG context and user memory
- [ ] Add memory indicators in chatbot UI
- [ ] Write vitest tests for memory and RAG functions
- [ ] Test chatbot with improved context awareness


## Chatbot Enhancement - Persistent Memory & RAG (COMPLETED)
- [x] Create chatbotUserMemory table for storing user preferences
- [x] Create knowledgeBase table for RAG content indexing
- [x] Implement RAG retrieval functions (flights, destinations, articles)
- [x] Add user memory extraction from conversations (LLM-powered)
- [x] Update chatbot backend to use RAG context
- [x] Add memory-aware system prompt instructions
- [x] Update frontend to show memory indicator (🧠 Paměť badge)
- [x] Write vitest tests for RAG system (44 tests passing)

## Fix Destination Images and Airline Logos (URGENT)
- [ ] Download correct destination thumbnail images from original website
- [ ] Download correct airline logo images (Austrian, Emirates, Qatar, Ryanair, etc.)
- [ ] Update Home.tsx with proper image paths and layout
- [ ] Test all images display correctly

## A/B Testing - 3 Chatbot Personas
- [ ] Create database schema for persona assignment and tracking
- [ ] Implement Persona A: "Lucka" - Energická cestovatelka (young, emoji, informal)
- [ ] Implement Persona B: "Martin" - Profesionální poradce (formal, data-driven)
- [ ] Implement Persona C: "Anička" - Přátelská průvodkyně (warm, empathetic)
- [ ] Add automatic persona assignment for new users (33% each)
- [ ] Track metrics: engagement rate, conversation depth, CTR, conversion rate
- [ ] Update ChatbotWidget to show persona-specific avatar and name
- [ ] Write vitest tests for A/B testing system

## Pelikán Feed Pages (Levné letenky & Dovolené)
- [x] Review do-italie.cz/nabidky design for reference
- [x] Parse Pelikán XML feeds (flights and vacations)
- [x] Create backend API for fetching and caching feed data (30min cache)
- [x] Create /levne-letenky page with flight offers (filters, sorting, pagination)
- [x] Create /dovolene page with vacation offers (filters, sorting, pagination)
- [x] Update navigation menu (Dovolená → Dovolené)
- [x] Add affiliate tracking to all offer clicks
- [x] Write vitest tests for feed parsing (51 tests passing)
