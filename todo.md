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

## Database Migration and Airline Pages
- [ ] Connect to original MySQL database (a054um.forpsi.com)
- [ ] Explore database schema and tables
- [ ] Extract flight offers data
- [ ] Extract airline data
- [ ] Extract destination data
- [ ] Migrate useful data to new database
- [ ] Create airline-specific pages (e.g., /letecke-spolecnosti/ryanair-letenky/)
- [ ] Add flight listings filtered by airline
- [ ] Update navigation with airline links
- [ ] Test all airline pages
