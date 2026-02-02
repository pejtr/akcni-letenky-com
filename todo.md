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

## A/B Testing - 3 Chatbot Personas (Implementation)
- [ ] Create chatbotPersonaAssignment table in database schema
- [ ] Implement automatic persona assignment (33% each: Lucka, Martin, Anička)
- [ ] Create Persona A: "Lucka" - Energická cestovatelka (emoji, informal, enthusiastic)
- [ ] Create Persona B: "Martin" - Profesionální poradce (formal, data-driven, structured)
- [ ] Create Persona C: "Anička" - Přátelská průvodkyně (warm, empathetic, personal stories)
- [ ] Update ChatbotWidget to show persona name and avatar
- [ ] Track conversion metrics per persona
- [ ] Write vitest tests for persona system

## Dovolena.cz XML Feed Integration
- [ ] Research Dovolena.cz XML feed URL and structure
- [ ] Create parser for Dovolena.cz feed format
- [ ] Interleave Dovolena.cz offers with Pelikán offers (balanced ratio)
- [ ] Add source indicator to offer cards
- [ ] Update /levne-letenky and /dovolene pages with combined feeds
- [ ] Write vitest tests for combined feed

## 24-Hour Caching with Midnight Refresh
- [ ] Change cache duration from 30min to 24h
- [ ] Implement midnight refresh scheduler (cron job at 00:00)
- [ ] Add cache status endpoint for monitoring
- [ ] Test cache refresh functionality

## Destination Cards Design Update
- [x] Increase card size and thumbnail size (larger images)
- [x] Add white background with subtle shadow to cards
- [x] Implement hover effect with airplane icon overlay
- [x] Update text styling (gray price and country text)
- [ ] Test hover effect on desktop

## Airline Pages with Flight Offers (Current Task)
- [ ] Enlarge airline logos 2x in homepage section
- [ ] Create individual airline pages (/letecka-spolecnost/:slug)
- [ ] Show flight offers from Pelikán feed filtered by airline on each page
- [ ] Add company description section to airline pages
- [ ] Link airline logos to internal pages instead of external URLs
- [ ] Add Schema.org structured data for airline pages
- [ ] Test all 12 airline pages

## UI Improvements - Hover Effects and Thumbnails (Current Task)
- [x] Add hover effect with airplane icon to top offers (Praha ⇄ Londýn, Paříž, Řím, Barcelona)
- [x] Enlarge thumbnails in "Zpáteční levné letenky" section by 50% (from 96px to 144px)
- [x] Enlarge category links section (Dovolená se slevou až 80%, Eurovíkendy, Hotely, Nejlevnější letenky)
- [x] Change category links background to light gray (#f5f5f5)
- [x] Enlarge airplane hover icon in destination grid (from 40px to 56px)
- [x] Add third expansion stage to chatbot widget
- [x] Enlarge chatbot avatar thumbnail (from 80px to 96px)

## Color Palette Simplification - Variant #1 (Current Task)
- [x] Change featured cities border from orange (#FF8C00) to blue (#2563EB)
- [x] Change chatbot online status from green to orange (#FF6B35)
- [x] Verify color consistency across all sections
- [x] Document final color palette (Primary: Orange, Secondary: Blue, Accent: Yellow)

## Replace Magenta with Orange (Current Task)
- [ ] Find all magenta colors in chatbot component
- [ ] Find all magenta colors in notification components
- [ ] Replace magenta with orange (#FF6B35)
- [ ] Verify no magenta colors remain in the UI

## Change Arrow Color to Orange (Current Task)
- [x] Change bidirectional arrows (⇄) in featured cities from blue to orange (#FF6B35)
- [ ] Change featured cities button borders from blue to orange (#FF6B35)

## URGENT: Mobile Chatbot Fixes (Current Task)
- [ ] Reduce chatbot icon size by 50% on mobile (96px → 48px)
- [ ] Fix chatbot overflow - make it full-screen on mobile (inset-0, w-screen, h-screen)
- [ ] Change magenta header to orange (#FF6B35)
- [ ] Change magenta send button to orange (#FF6B35)
- [ ] Position chatbot icon above yellow CTA panel (bottom: 5rem)
- [ ] Set z-index to z-50 (highest)
- [x] Change airline company layout - put name BELOW logo instead of beside it (flex-col)
- [x] Fix orange CTA button overflow on mobile (max-w-full + whitespace-normal)
- [x] Make yellow bottom CTA panel thinner (reduce padding and font size)
- [x] Move notifications higher on mobile to avoid overlapping yellow panel (bottom: 16 on mobile)
- [x] Increase notification display time (5s → 8s) and interval (15s → 25s)
- [ ] Remove chatbot expansion button on mobile (< 768px) - keep only on desktop/tablet
- [x] Make yellow CTA panel appear only after scrolling 50% of page and stay fixed (changed from 60% to 50%)
- [x] Make notifications thinner (p-4→p-3, thumbnail 16px→12px, text-sm→text-xs)
- [x] Move CTA button "TAM CHCI >" below content (full-width button at bottom)
- [x] Move chatbot icon more to the right (right-4→right-2 on mobile, right-6→right-4 on desktop)
- [x] Yellow bottom CTA banner stays visible permanently after first appearance (after 50% scroll)
- [x] Remove maximize button (↗️) from mobile chatbot header completely
- [x] Fix notification close button tooltip from "Travel Expert" to "Zavřít notifikaci"
- [x] Add navigation link to airline pages (back to top/home)
- [x] Ensure all offer links have affiliate parameter ?a_aid=levne-letenky
- [x] Move "Aktuální nabídky" section AFTER article content on airline pages
- [x] Fix mobile display of offer cards (proper alignment, text wrapping, button sizing)
- [x] Increase z-index of notification to be above chatbot (prevent tooltip overlap)
- [x] Update SEO title to "Levné Letenky z Prahy od 590 Kč | Sleva až -80% | Akční Letenky 2026"
- [x] Add "Zpáteční letenka je již zahrnuta v ceně" in small text below "Ušetřete do 50% na letu"
- [x] Create tRPC endpoint for top destinations by affiliate clicks this week
- [x] Build "Nejprodávanější letenky tento týden" UI section
- [x] Display click count as "X lidí si prohlédlo"
- [x] Add 🔥 icon for hot deals
- [x] Add section to homepage after featured cities
- [x] Ensure responsive design for mobile and desktop
- [x] Add complete navigation links matching original www.akcni-letenky.com website
- [x] Fix missing destination name in first card of top flights section
- [x] Add prices to "Nejprodávanější letenky tento týden" cards by joining with flights/Pelikan data
- [x] Import Pelikan feed data (flights + holidays) into database
- [x] Add Kiwi widget to homepage with affiliate ID akcnletenkyakcniletenky
- [x] Fix "Nejprodávanější letenky tento týden" section - add destination images
- [x] Fix first card in top flights section (broken display)
- [x] Make "Zpáteční levné letenky" heading more prominent and larger
- [x] Fix script error on homepage (likely Kiwi widget) - resolved after restart
- [x] Implement server-side cache for Pelikan offers (flights + vacations)
- [x] Add 24-hour refresh cycle at midnight for Pelikan cache
- [x] Add fallback to live API if cache fails
- [x] Create database schema for chatbot A/B test tracking (persona assignments, conversations, conversions)
- [ ] Implement 3 chatbot personas (Phoebe-energetic, Piper-royal, Prue-deliberate style)
- [ ] Add random persona assignment for new users
- [ ] Track affiliate conversions by persona
- [ ] Auto-analyze after 100+ conversations and increase traffic for best persona
- [ ] Add admin dashboard for A/B test results
- [ ] Generate avatars for Phoebe, Piper, and Prue personas
- [x] Create admin dashboard for A/B test results in real-time
- [ ] Add email capture functionality after 3 messages with personalized text
- [x] Optimize and enlarge images in Zpáteční levné letenky section (lazy loading, larger size)
- [x] Add quick reply suggestions (přednabízené odpovědi) to chatbot

## Email Capture Database Integration (Current Task)

- [x] Create emailCaptures database table with fields: id, email, persona, source, timestamp, gdprConsent, chatSessionId
- [x] Add tRPC endpoint for saving captured emails from chatbot
- [x] Create admin panel at /admin/emails for email management and export
- [x] Add CSV export functionality for remarketing campaigns
- [x] Add Mailchimp-compatible format export
- [x] Update chatbot EmailCapturePopup to save to database via tRPC
- [x] Add GDPR consent checkbox to email capture form
- [x] Implement automatic tagging by persona for segmentation
- [x] Add email list filtering by persona, date range, source
- [x] Display total email count and growth statistics
- [x] Write unit tests for email capture endpoints (18 tests passing)
- [x] Test email capture flow end-to-end

## Email Marketing Automation System (Completed)

### Lead Scoring System
- [x] Add leadScore field to emailCaptures table
- [x] Create scoring algorithm based on: message count, budget, destination interest, engagement time
- [x] Implement automatic score calculation on email capture
- [x] Add score recalculation on user activity updates
- [x] Create lead quality tiers: Hot (80+), Warm (50-79), Cold (<50)

### Welcome Email Series
- [x] Create emailCampaigns table for campaign management
- [x] Create emailQueue table for scheduled emails
- [x] Implement welcome email #1: Immediate - discount code + top destinations
- [x] Implement welcome email #2: Day 2 - personalized recommendations based on persona
- [x] Implement welcome email #3: Day 5 - social proof + urgency (limited offers)
- [x] Add email sending via notification API or external service
- [x] Track email open/click rates

### Remarketing Triggers
- [x] Create remarketingTriggers table for tracking trigger events
- [x] Implement 7-day non-conversion check
- [x] Create remarketing email with urgency elements (time-limited discount: VRACIMSE10 10% off, 48h validity)
- [x] Add conversion tracking to disable triggers after purchase
- [x] Implement trigger scheduling system

### Admin UI
- [x] Add lead scoring dashboard to admin panel (4 tabs: Overview, Lead Scoring, Campaigns, Remarketing)
- [x] Create email campaign management interface
- [x] Add remarketing trigger status view
- [x] Display email delivery statistics
- [x] Add manual trigger controls for testing
- [x] Write unit tests (154 tests passing)

## Bug Fixes and Reactivation Campaign (Current Task)

### Bug Fixes
- [x] Fix "Neznámá destinace" - changed fallback to Barcelona
- [ ] Fix script error on homepage

### Reactivation Campaign for Inactive Users
- [ ] Create reactivation trigger for users inactive 30+ days
- [ ] Design reactivation email with special offer
- [ ] Add admin UI for reactivation campaign management
- [ ] Implement automatic scheduling for reactivation emails

### Destination Name Fixes
- [x] Change "Maroko" to "Marakéš" in destination grid
- [x] Change "Srí Lanka" to "Colombo" in destination grid

## Chatbot Improvements (Current Task)

- [ ] Update welcome message to match new travel expert persona
- [ ] Add quick replies for most common user questions (prices, booking, destinations)
- [ ] Change chatbot colors to match website design (yellow/orange theme)
- [ ] Update chatbot header style
- [ ] Test chatbot functionality

## Pelikán Affiliate Link Fix (Critical Bug)

- [ ] Change "Zobrazit na Pelikán.cz" buttons to link directly to search results, not offer detail pages
- [ ] Update Dovolená page links to use Pelikán search URL with destination parameter
- [ ] Ensure links work reliably without "Nabídka není dostupná" errors

- [x] Split Dovolene page into two columns: foreign (left) vs domestic (right: Česko, Slovensko, Rakousko, Maďarsko, Polsko)

## Pelikán-style Category Tiles Integration (Current Task)

- [ ] Fix script error on homepage
- [ ] Create "Tipy na dovolenou" section with category tiles
- [ ] Add categories: First Minute, Levná exotika, Ischia, Dubaj, Thajsko, Mauricius, Malta, Krátké výlety
- [ ] Design attractive tiles with images and prices
- [ ] Add affiliate links to Pelikán.cz search pages
- [ ] Ensure mobile responsive design


## Chatbot Persona & Color Updates

### Persona Name Changes (Phoebe/Piper/Prue → Petra/Monika/Alice)
- [x] Update persona definitions in chatbotABTest.ts (Petra/Monika/Alice)
- [x] Update persona names in ChatbotWidget.tsx
- [x] Update persona references in email marketing templates
- [x] Update persona references in remarketing triggers
- [x] Update unit tests with new persona names
- [x] Ensure 24h localStorage persistence for persona assignment

### Color Updates (Magenta → Orange-Red Gradient)
- [x] Update ChatbotWidget header/button colors to orange-red gradient
- [x] Update notification widget colors to orange-red gradient
- [x] Fix chatbot greeting - should only show once at start, not repeat

### Greeting Fix
- [x] Fix chatbot so it doesn't repeat greeting after each message
- [x] Greeting should only appear once when chat opens


## Chatbot localStorage Persistence

### Conversation History Persistence
- [x] Implement localStorage save for all messages
- [x] Implement localStorage load on component mount
- [x] Save persona information to localStorage
- [x] Save session ID to localStorage
- [x] Restore conversation state on page reload
- [x] Add "Clear conversation" button
- [x] Handle localStorage quota exceeded errors
- [x] Test persistence across page reloads and browser restarts
## Copy Personas from Shared Project

- [x] Access shared project at https://manus.im/share/c4EsDWGrjsskP2UORfE57w
- [x] Extract persona definitions (names, personalities, greeting messages)
- [x] Update chatbotABTest.ts with new persona definitions
- [x] Update avatar images if needed
- [x] Test persona changesifferent
- [ ] Update any references in email marketing templates
- [ ] Test chatbot with new personas


## Change Persona Names to Czech

### Alice → Tereza
- [x] Update chatbotABTest.ts - change alice to tereza
- [x] Update email marketing templates (alice → tereza)
- [x] Update remarketing triggers (alice → tereza)
- [x] Update tests (alice → tereza)
- [x] Keep Petra and Monika as they are (already Czech)

## Update Homepage Destinations (Pelikan.cz Style)

### Zpáteční levné letenky
- [x] Update 16 destinations (Londýn, New York, Afrika, Marakéš, Paříž, Hanoj, Bali, Colombo, Dubaj, Bangkok, Santorini, Jordánsko, Řím, Island, Miami, Barcelona)
- [x] Ensure correct prices and countries
- [x] Fix affiliate links to match Pelikan structure

### Add New Sections
- [x] Státy (Countries) - 16 destinations
- [x] Města (Cities) - Top 20 cities
- [x] Letecké společnosti (Airlines) - already exists, integrate into tabs
- [x] Top destinace (Top destinations) - 12 themed categories

### Implementation
- [x] Create tabbed navigation (Státy, Města, Letecké společnosti, Top destinace)
- [x] Use card-based layout with images
- [x] Add proper descriptions for each destination
- [x] Ensure all affiliate links work correctly
- [ ] Add real images for new destinations (currently using placeholders)


## Update Homepage Destinations (Pelikan Style)

### Zpáteční levné letenky Section
- [ ] Update to 16 destinations matching Pelikan layout
- [ ] Add correct cities: Londýn, New York, Afrika, Marakéš, Paříž, Hanoj, Bali, Colombo, Dubaj, Bangkok, Santorini, Jordánsko, Řím, Island, Miami, Barcelona
- [ ] Ensure proper affiliate links to Pelikan

### Add New Sections
- [ ] Create "Státy" tab section with countries (USA, Řecko, Itálie, Španělsko, SAE, Island, Kypr, Malta, Chorvatsko, Thajsko, Mexiko, etc.)
- [ ] Create "Města" tab section with top 20 cities (New York, Londýn, Miami, Paříž, Řím, Barcelona, Bangkok, Dubaj, Hanoj, Lisabon, Havana, Amsterdam, Malaga, Male, Miláno, Abu Dhabi, Neapol, Zadar, Cancún, Palma de Mallorca)
- [ ] Create "Letecké společnosti" tab section (already exists, verify)
- [ ] Create "Top destinace" tab section with themed categories (Last minute, Výlety po Evropě, Levná exotika, Exotická dovolená, Mauricius, Poznávací zájezdy, Malta, Madeira, Dubaj, Řím, Benátky, Kanárské ostrovy)

### Affiliate Links
- [ ] Update all destination links to use proper Pelikan affiliate structure
- [ ] Test all links redirect correctly


## Hero Section Redesign for Maximum ROI

### Header Redesign
- [x] Change header background to yellow (#FFD700)
- [x] Update logo styling for yellow background
- [x] Redesign navigation menu for better visibility on yellow
- [x] Add search icon to header
- [x] Ensure phone number is prominent

### Enhanced Search Form
- [x] Change "Kam se chystáte?" to dropdown "Odkud?" with Prague as default
- [x] Keep "Kam?" field as text input
- [x] Add "Délka pobytu" dropdown (1 týden, 2 týdny, etc.)
- [x] Keep "Kolik osob?" dropdown
- [x] Change CTA button text to "VYHLEDAT LETENKY"
- [x] Style button with orange gradient

### Trust Badges
- [x] Add "Sle až 60%" badge with icon
- [x] Add "Nejlepší ceny" badge with star icon
- [x] Add "Certifikováno" badge with checkmark icon
- [x] Position badges below search form
- [x] Style badges with white background and rounded corners

### Blue Info Banner
- [x] Add blue banner below hero section
- [x] Add text "Úšetřete pod 1000 Kč | Eurovíkendy | Nejlevnější letenky od 500 Kč"
- [x] Make banner clickable with proper links

### Featured City Cards Redesign
- [x] Enlarge featured city cards
- [x] Add dual pricing display (original price + discounted price)
- [x] Add orange gradient CTA buttons with "od X Kč | od Y Kč" format
- [x] Ensure cards show airline/company name below city
- [x] Add hover effects for better interactivity

### Testing
- [x] Test all changes on desktop
- [x] Test responsive design on mobile
- [x] Verify all CTAs are clickable
- [x] Check color contrast for accessibility
- [ ] Run performance tests


## A/B Testing for Hero Section

### Database Schema
- [ ] Create abTestAssignments table (userId, sessionId, variant, assignedAt)
- [ ] Create abTestEvents table (sessionId, variant, eventType, eventData, timestamp)
- [ ] Add indexes for efficient querying

### A/B Test Logic
- [ ] Implement random 50/50 variant assignment (A: original, B: new design)
- [ ] Store assignment in localStorage for consistency
- [ ] Create server-side assignment tracking
- [ ] Implement cookie-based fallback for localStorage

### Hero Section Variants
- [ ] Preserve original hero design as Variant A
- [ ] Keep new high-converting design as Variant B
- [ ] Create variant switcher component
- [ ] Ensure both variants have identical functionality

### Tracking Metrics
- [ ] Track CTA button clicks (VYHLEDAT LETENKY)
- [ ] Track scroll depth (25%, 50%, 75%, 100%)
- [ ] Track time on page
- [ ] Track bounce rate
- [ ] Track form field interactions
- [ ] Track trust badge visibility

### Analytics Dashboard
- [ ] Create admin dashboard page for A/B test results
- [ ] Display variant performance comparison
- [ ] Show conversion rate for each variant
- [ ] Display statistical significance
- [ ] Add date range filter
- [ ] Export results to CSV

### Testing
- [ ] Test variant assignment works correctly
- [ ] Test localStorage persistence
- [ ] Test event tracking fires correctly
- [ ] Verify dashboard displays accurate data
- [ ] Test on multiple devices and browsers


## Add Airline Logos to Flight Offers

### Airline Detail Page
- [x] Find airline detail page component
- [x] Add airline logo display to each flight offer card
- [x] Position logo next to airline name or in header
- [x] Ensure logos are properly sized and responsive
- [x] Add fallback for missing logos

### Airline Logo Data
- [x] Add logoUrl field to airline/flight data
- [x] Collect logo URLs for major airlines (Emirates, Ryanair, Wizz Air, etc.)
- [x] Store logos in public folder or use CDN
- [x] Update database schema if needed


## Complete A/B Testing System

### tRPC Procedures
- [x] Add abTest.trackAssignment procedure
- [x] Add abTest.trackEvent procedure
- [x] Add abTest.getResults procedure
- [x] Add abTest.getEventBreakdown procedure
- [ ] Test all procedures with Postman/client

### Hero Section Variants
- [x] Create HeroVariantA component (original design)
- [x] Create HeroVariantB component (new high-converting design)
- [x] Implement variant switcher in Home.tsx using useABTest hook
- [x] Add tracking for CTA clicks in both variants
- [x] Add tracking for form interactions

### Analytics Dashboard
- [ ] Create /admin/hero-ab-test page (separate from chatbot A/B test)
- [ ] Display conversion rates for variants A and B
- [ ] Show statistical significance (p-value, z-score)
- [ ] Display event breakdown (CTA clicks, scroll depth, etc.)
- [ ] Add real-time updates
- [ ] Add date range filter

## Urgency Timers for Featured City Cards

### Timer Implementation
- [x] Add countdown timer component
- [x] Calculate random expiry time (6-24 hours from now)
- [x] Store expiry time in localStorage per offer
- [x] Display "Nabídka platí ještě X hodin Y minut"
- [x] Add red/orange styling for urgency
- [x] Reset timer when it expires

### Visual Design
- [x] Add clock icon next to timer
- [x] Use urgent colors (red/orange) when < 3 hours left
- [x] Add pulsing animation for extra urgency
- [x] Ensure mobile responsiveness

## Exit-Intent Popup

### Popup Trigger
- [x] Detect mouse leaving viewport (desktop)
- [x] Detect back button press (mobile)
- [x] Show popup only once per session
- [x] Add delay (minimum 10 seconds on page)

### Popup Content
- [x] Headline: "Počkejte! Máme pro vás speciální nabídku"
- [x] Show 3-5 best deals with discounts
- [x] Add WhatsApp community CTA (https://chat.whatsapp.com/KG1IqrQclfY6NOgkmgs6ml)
- [x] Add email capture form
- [x] Display discount code for first booking

### Personalization
- [ ] Personalize based on viewed destinations
- [ ] Show relevant offers based on browsing history
- [ ] Track popup conversion rate

### Design
- [x] Overlay with semi-transparent background
- [x] Prominent close button (X)
- [x] Mobile-responsive layout
- [x] Add urgency elements (timer, limited spots)


## Fix Hero and Destination Images

### Hero Section Variant B
- [ ] Add background image to HeroVariantB (currently just yellow)
- [ ] Ensure background image is visible and properly styled

### Duplicate Blue Banner
- [ ] Remove duplicate blue info banner (appears twice)
- [ ] Keep only one blue banner below hero

### Broken Destination Thumbnails
- [ ] Fix broken image thumbnails in Státy section
- [ ] Fix broken image thumbnails in Top destinace section
- [ ] Ensure all destination images load properly
- [ ] Add fallback images if URLs are broken


## Remove Yellow Banner from Hero + Implement All Recommendations

### Remove Yellow Banner
- [ ] Remove "NEJLEVNĚJŠÍ AKČNÍ LETENKY" yellow banner from HeroVariantB
- [ ] Keep only background image with search form
- [ ] Ensure hero looks clean without yellow overlay

### Hero A/B Test Analytics Dashboard
- [ ] Create /admin/hero-ab-test page
- [ ] Display conversion rates for variants A and B
- [ ] Show statistical significance (p-value, z-score, confidence interval)
- [ ] Add real-time charts for conversion trends
- [ ] Display event breakdown (CTA clicks, form submissions, scroll depth)
- [ ] Add date range filter
- [ ] Show sample size and test duration
- [ ] Add "Winner" badge when statistical significance reached

### Personalized Exit-Intent Popup
- [ ] Track viewed destinations in localStorage
- [ ] Filter exit-intent offers based on viewed destinations
- [ ] Show relevant offers (same country/region as viewed)
- [ ] Add "Based on your browsing" text
- [ ] Track popup conversion rate by destination
- [ ] Test personalization logic

### Social Proof Notifications Widget
- [ ] Create "právě rezervováno" notification component
- [ ] Add circular thumbnail of destination
- [ ] Display format: "Petr z Prahy právě rezervoval letenku do Barcelony za 746 Kč"
- [ ] Add pulsating animation
- [ ] Position bottom-left (opposite of chatbot)
- [ ] Show random realistic bookings every 15-30 seconds
- [ ] Add "TAM CHCI TAKY >" CTA button
- [ ] Make notification clickable to destination page
- [ ] Track clicks on social proof notifications
- [ ] Test notification timing and frequency

## Conversion Optimization Features (Phase 3)
- [x] Remove yellow banner from HeroVariantB (keep clean design with background image)
- [x] Create hero A/B test analytics dashboard at /admin/hero-ab-test
- [x] Implement real-time conversion rate tracking for variants A vs B
- [x] Add statistical significance calculation (Z-test) to dashboard
- [x] Display event breakdown (assignments, views, clicks, conversions)
- [x] Add personalization to exit-intent popup based on viewed destinations
- [x] Create useViewedDestinations hook for tracking browsing history
- [x] Implement localStorage persistence for viewed destinations (7-day expiry)
- [x] Add personalized offers in exit-intent popup based on browsing history
- [x] Add personalized messaging based on user's viewed destinations
- [x] Track destination views on DestinationPage component
- [x] Implement social proof notification widget
- [x] Add real-time "právě rezervováno" messages with Czech names and cities
- [x] Display notifications with 15-25 second intervals
- [x] Add progress bar animation to notifications (8-second duration)
- [x] Position notifications bottom-left with z-index 60
- [x] Add manual close button to notifications
- [x] Integrate SocialProofNotification into Home page

## Omio (Travelpayouts) Affiliate Integration
- [x] Create Omio affiliate link helper function with marker=155221&trs=89558&p=2078
- [x] Add Omio tracking to affiliate clicks database (localStorage)
- [x] Create "Vlaky & Autobusy" section on homepage
- [x] Add Omio search widget for trains, buses, ferries
- [x] Integrate Omio offers into destination pages
- [x] Add Omio options to exit-intent popup (multimodal travel)
- [x] Create Omio CTA buttons with 6% commission highlight
- [x] Popular routes grid (Praha-Vídeň, Praha-Mnichov, Praha-Berlín, etc.)
- [x] Benefits section (ekologické, bez čekání, centrum do centra)
- [x] Destination page sidebar with Omio alternative transport card
- [x] Exit-intent popup with Omio train/bus option
- [x] Test all Omio affiliate links
- [ ] Add Omio to navigation menu (future enhancement)
- [ ] Track Omio conversions in admin analytics (future enhancement)
- [ ] Write vitest tests for Omio tracking (future enhancement)

## Mobile Navigation & Bug Fixes
- [x] Create responsive hamburger menu component for mobile
- [x] Add mobile navigation with all menu items (Nejlevnější Lety, Levné Letenky, Dovolená, Aerolinky, Rychlá Rezervace)
- [x] Implement slide-in animation for mobile menu
- [x] Add close button (X) to mobile menu
- [x] Integrate hamburger menu into navigation header (show on mobile, hide on desktop)
- [x] Fix HeroVariantB.tsx React import order
- [x] Restart dev server to clear cached errors
- [ ] Add persistent bottom navigation bar for mobile (per user preference)
- [ ] Make navigation sticky on scroll (already implemented, verify)
- [ ] Optimize image loading speed for mobile (lazy loading)
- [ ] Test hamburger menu on mobile devices

## Nested Anchor Tag Fixes
- [x] Find all nested <a> tags inside Link components
- [x] Remove duplicate <a> tags - Link already renders <a> internally
- [x] Fix blog article links in DestinationPage.tsx (2 instances)
- [x] Fix "Všechny články" button link in DestinationPage.tsx
- [x] Verify all Link components use correct structure (no nested <a>)
- [x] Airline logo cards and destination cards already correct (no nested anchors)
- [x] Test all fixed links work correctly

## Remaining Nested Anchor Fix & Clickable Notifications
- [x] Find remaining nested <a> tag in MobileMenu.tsx causing React error
- [x] Fix nested anchor in MobileMenu navigation items
- [x] Make social proof notifications clickable
- [x] Link notifications to specific flight offers (Kiwi.com affiliate links)
- [x] Add hover effect to notification cards (border-orange-600, shadow-3xl)
- [x] Add destination slugs to notification data structure
- [x] Test notification clicks open Kiwi.com with affiliate parameters

## Price Display Improvements
- [x] Increase price font size in featured cities cards (Londýn, Paříž, Řím, Barcelona)
- [x] Changed from default to text-2xl for main price
- [x] Increased padding (px-5 py-3) for better visual prominence
- [x] Increased strikethrough price from text-sm to text-base
- [x] Prices now more readable on mobile devices

## Social Proof Tracking & Optimization Features

### 1. tRPC Endpoint for Social Proof Click Tracking
- [x] Create tRPC procedure for tracking social proof notification clicks
- [x] Store clicks in affiliate_clicks table with source="social-proof"
- [x] Track destination, timestamp, and user session info via existing trackClick mutation
- [x] Added handleNotificationClick to SocialProofNotification component

### 2. A/B Test for Notification Position and Frequency
- [x] Create notification A/B test variants (4 variants: A, B, C, D)
- [x] Variant A: Left position, standard frequency (15-25s)
- [x] Variant B: Right position, standard frequency (15-25s)
- [x] Variant C: Left position, higher frequency (10-20s)
- [x] Variant D: Right position, higher frequency (10-20s)
- [x] Store variant assignment in localStorage
- [x] Track impressions and clicks per variant
- [x] Created socialProofABTest.ts with getAssignedVariant, trackImpression, trackClick, getVariantStats
- [ ] Create admin dashboard for A/B test results (future enhancement)

### 3. Live Viewer Counter on Destination Cards
- [x] Add simulated "X lidí právě prohlíží" counter to destination cards
- [x] Generate realistic numbers (15-45 viewers) with seeded random for consistency
- [x] Add pulsing red dot indicator for live status (animate-ping)
- [x] Implement subtle number changes every 30-60 seconds
- [x] Created LiveViewerCounter component with Eye icon
- [x] Integrated into featured cities cards on homepage
