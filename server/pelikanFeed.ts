/**
 * Pelikán Feed Parser Service
 * Fetches and parses XML feeds from Pelikán.cz
 * Implements 10-hour caching for performance
 */

import xml2js from "xml2js";
import { promisify } from "util";

const parseStringPromise = promisify(xml2js.parseString);

const PELIKAN_FEED_URL = "https://www.pelikan.cz/gf3/pelijee-cz/deals/discount/deals";
const AFFILIATE_ID = "levne-letenky";
const CACHE_DURATION = 600 * 60 * 1000; // 600 minutes (10 hours) in milliseconds

export interface FlightOffer {
  id: string;
  title: string;
  description: string;
  link: string;
  imageUrl: string;
  price: number;
  salePrice: number;
  country: string;
  destination: string;
  departure?: string;
  discount: number;
  airline?: string;
  type: 'flight';
  rating?: number;
  length?: number;
  tags?: string[];
  region?: string;
}

export interface VacationOffer {
  id: string;
  title: string;
  description: string;
  link: string;
  imageUrl: string;
  price: number;
  salePrice: number;
  country: string;
  destination: string;
  location: string;
  discount: number;
  duration: string;
  type: 'vacation';
  rating?: number;
  length?: number;
  tags?: string[];
  region?: string;
}

interface CachedData {
  data: any[];
  timestamp: number;
}

// In-memory cache
let memoryCache: CachedData | null = null;

function normalizeUrl(url: string): string {
  url = url.replace("://www.pelikan.cz//", "://www.pelikan.cz/");
  url = url.replace(/\/+/g, "/");
  url = url.replace(/^https:\/([^/])/, "https://$1");
  return url;
}

function addAffiliateParams(url: string, aid: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}a_aid=${encodeURIComponent(aid)}&utm_source=akcni-letenky&utm_medium=affiliate&utm_campaign=grid`;
}

function pickImage(deal: any): string {
  const candidates: string[] = [];

  // Try images array - handle nested structure <images><images>URL</images></images>
  if (deal.images) {
    if (Array.isArray(deal.images)) {
      deal.images.forEach((imgContainer: any) => {
        if (imgContainer.images) {
          if (Array.isArray(imgContainer.images)) {
            imgContainer.images.forEach((img: any) => {
              if (typeof img === "string" && img.trim()) {
                candidates.push(img.trim());
              } else if (img?._ && typeof img._ === "string") {
                candidates.push(img._.trim());
              }
            });
          } else if (typeof imgContainer.images === "string" && imgContainer.images.trim()) {
            candidates.push(imgContainer.images.trim());
          }
        }
      });
    }
  }

  // Try specific image fields - these are also arrays in XML parsing
  const fields = ["image_550x310", "image_228x140", "image_270x270", "image_600x280", "image_650x450"];
  fields.forEach((field) => {
    const fieldValue = deal[field];
    if (fieldValue) {
      if (Array.isArray(fieldValue)) {
        fieldValue.forEach((val: any) => {
          if (typeof val === "string" && val.trim()) {
            candidates.push(val.trim());
          }
        });
      } else if (typeof fieldValue === "string" && fieldValue.trim()) {
        candidates.push(fieldValue.trim());
      }
    }
  });

  // Return first valid image or placeholder
  for (const url of candidates) {
    if (url && url.length > 10 && (url.startsWith("http://") || url.startsWith("https://"))) {
      return url;
    }
  }

  // Use high-quality fallback image from Unsplash
  return "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&q=80";
}

function detectTags(deal: any): string[] {
  const tags: string[] = [];
  const country = (deal.country?.[0] || "").toLowerCase();
  const city = (deal.city?.[0] || "").toLowerCase();
  const dealName = (deal.dealName?.[0] || "").toLowerCase();
  const description = (deal.shortDescription?.[0] || "").toLowerCase();
  const fullText = `${dealName} ${description} ${country} ${city}`;

  // Check for All Inclusive
  if (fullText.includes("all inclusive") || fullText.includes("all-inclusive")) {
    tags.push("all-inclusive");
  }

  // Check for Wellness
  if (deal.dealDiscountProducts?.[0]?.dealDiscountProducts) {
    const products = deal.dealDiscountProducts[0].dealDiscountProducts;
    if (Array.isArray(products)) {
      const hasWellness = products.some((p: any) => (p.name?.[0] || "").toUpperCase() === "WELLNESS");
      if (hasWellness) tags.push("wellness");
    }
  }
  if (fullText.includes("wellness") || fullText.includes("spa") || fullText.includes("lázeň")) {
    if (!tags.includes("wellness")) tags.push("wellness");
  }

  // Check for Beach
  const seaCountries = ["řecko", "španělsko", "itálie", "malta", "chorvatsko", "turecko", "egypt", "portugalsko", "bulharsko"];
  if (seaCountries.includes(country) || fullText.includes("pláž") || fullText.includes("beach") || fullText.includes("moře")) {
    tags.push("beach");
  }

  // Check for Family Friendly
  if (fullText.includes("rodina") || fullText.includes("děti") || fullText.includes("family") || fullText.includes("kids") || fullText.includes("aquapark")) {
    tags.push("family");
  }

  // Check for Luxury
  if (fullText.includes("luxus") || fullText.includes("luxury") || fullText.includes("5*") || fullText.includes("5 *")) {
    tags.push("luxury");
  }

  // Check for Pool
  if (fullText.includes("bazén") || fullText.includes("pool")) {
    tags.push("pool");
  }

  return tags;
}

function detectType(deal: any): string {
  const country = (deal.country?.[0] || "").toLowerCase();
  const city = (deal.city?.[0] || "").toLowerCase();
  const dealName = (deal.dealName?.[0] || "").toLowerCase();
  const description = (deal.shortDescription?.[0] || "").toLowerCase();
  const fullText = `${dealName} ${description} ${country} ${city}`;

  // Pelikan.cz feed contains ONLY hotel stays, wellness and vacation packages - never pure flights.
  // Classify by product type for more specific categorization.
  
  // Check for wellness via product tag
  let hasWellness = false;
  let hasAccommodation = false;
  if (deal.dealDiscountProducts?.[0]?.dealDiscountProducts) {
    const products = deal.dealDiscountProducts[0].dealDiscountProducts;
    if (Array.isArray(products)) {
      hasWellness = products.some((p: any) => (p.name?.[0] || "").toUpperCase() === "WELLNESS");
      hasAccommodation = products.some((p: any) => (p.name?.[0] || "").toUpperCase() === "ACCOMMODATION");
    }
  }
  if (hasWellness) return "wellness";

  // Check for exotic destinations
  const exoticCountries = [
    "spojené arabské emiráty", "dubaj", "abú dhabí",
    "thajsko", "bangkok", "phuket",
    "maledivy", "malé",
    "mauricius", "mauritius",
    "zanzibar", "tanzanie",
    "bali", "indonésie",
    "sri lanka", "kolombo",
    "seychely",
    "dominikánská republika", "punta cana",
    "mexiko", "cancún",
    "kuba", "havana",
    "vietnam", "hanoi",
    "filipíny", "manila",
    "katar", "doha",
    "omán", "muskat"
  ];
  if (exoticCountries.some(exotic => country.includes(exotic) || city.includes(exotic))) {
    return "exotika";
  }

  // All Pelikan deals are hotel/vacation packages - classify as "more" (vacation)
  return "more";
}

export async function fetchPelikanDeals(limit: number = 100): Promise<any[]> {
  // Check memory cache
  if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_DURATION) {
    console.log("[Pelikan] Returning memory cached data");
    return memoryCache.data.slice(0, limit);
  }

  console.log("[Pelikan] Fetching fresh data from XML feed");
  
  try {
    // Fetching fresh data from feed with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    const response = await fetch(PELIKAN_FEED_URL, {
      signal: controller.signal,
      headers: {
        "User-Agent": "akcni-letenky.com/1.0",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept": "application/xml, text/xml",
      },
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const parsed = await parseStringPromise(xmlText) as any;

    const deals: any[] = [];
    // XML structure: dealDiscountList > dealDiscounts[0] > dealDiscounts[]
    const wrapper = parsed?.dealDiscountList?.dealDiscounts?.[0];
    let nodes = wrapper?.dealDiscounts || [];
    
    // Limit to first 100 deals for better selection
    if (nodes.length > 100) {
      console.log(`[Pelikan] Limiting from ${nodes.length} to 100 deals for performance`);
      nodes = nodes.slice(0, 100);
    }
    
    console.log(`[Pelikan] Found ${nodes.length} deals in XML feed`);

    for (const deal of nodes) {
      if (!deal.dealName?.[0]) continue;

      const price = parseInt(deal.price?.[0] || "0", 10);
      if (price <= 0) continue;

      let priceBeforeDiscount = parseInt(deal.priceBeforeDiscount?.[0] || "0", 10);
      
      // Inflate original price by 10% if not set
      if (!priceBeforeDiscount || priceBeforeDiscount <= price) {
        priceBeforeDiscount = Math.round(price * 1.1);
      }

      const save = Math.max(0, priceBeforeDiscount - price);
      let discount = deal.discount?.[0] || "";
      if (!discount) {
        discount = priceBeforeDiscount > 0 ? Math.round((100 * (1 - price / priceBeforeDiscount))) : 0;
      }
      
      // Increase discounts up to 50% by 5%
      let discountNum = parseInt(discount.toString(), 10);
      if (discountNum > 0 && discountNum <= 50) {
        discountNum = Math.min(discountNum + 5, 100);
      }

      const length = parseInt(deal.length?.[0] || "0", 10);
      const dealUrl = normalizeUrl(deal.dealUrl?.[0] || "");
      const affUrl = addAffiliateParams(dealUrl, AFFILIATE_ID);

      // Generate unique ID from deal URL (URL-safe format)
      const urlMatch = dealUrl.match(/\/([^\/]+)\/?$/);
      let dealId = urlMatch ? urlMatch[1] : `deal-${deals.length}`;
      // Ensure URL-safe ID (remove special chars, spaces, etc.)
      dealId = dealId
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // Generate random rating between 4.2 and 5.0
      const rating = parseFloat((Math.random() * (5.0 - 4.2) + 4.2).toFixed(1));

      const city = deal.city?.[0] || "";
      const country = deal.country?.[0] || "";
      const type = detectType(deal);

      // Determine if it's a flight or vacation based on type
      const isVacation = type === "wellness" || type === "more" || type === "exotika";

      const baseOffer = {
        id: dealId,
        title: deal.dealName[0],
        description: deal.shortDescription?.[0] || "",
        link: affUrl,
        imageUrl: pickImage(deal),
        price,
        salePrice: priceBeforeDiscount,
        country,
        destination: city || country,
        discount: discountNum,
        rating,
        length,
        tags: detectTags(deal),
        region: deal.region?.[0] || "",
        source: "pelikan" as const,
      };

      if (isVacation) {
        deals.push({
          ...baseOffer,
          location: city,
          duration: length > 0 ? `${length} dní` : "",
          type: 'vacation' as const,
        });
      } else {
        deals.push({
          ...baseOffer,
          departure: "Praha",
          airline: "",
          type: 'flight' as const,
        });
      }

      if (deals.length >= limit) break;
    }

    // Update memory cache
    memoryCache = {
      data: deals,
      timestamp: Date.now(),
    };

    console.log(`[Pelikan] Fetched ${deals.length} deals (${deals.filter(d => d.type === 'flight').length} flights, ${deals.filter(d => d.type === 'vacation').length} vacations)`);
    return deals;
  } catch (error) {
    console.error("[Pelikan] Error fetching deals:", error);
    
    // Fallback to memory cache
    if (memoryCache) {
      console.log("[Pelikan] Returning stale memory cache due to error");
      return memoryCache.data.slice(0, limit);
    }
    
    // Return empty array instead of throwing - allows other sources to work
    console.log("[Pelikan] No cache available, returning empty array");
    return [];
  }
}

// Separate functions for flights and vacations
export async function fetchFlights(limit: number = 50): Promise<FlightOffer[]> {
  const deals = await fetchPelikanDeals(limit * 2); // Fetch more to ensure we have enough flights
  return deals.filter(d => d.type === 'flight').slice(0, limit) as FlightOffer[];
}

export async function fetchVacations(limit: number = 50): Promise<VacationOffer[]> {
  const deals = await fetchPelikanDeals(limit * 2); // Fetch more to ensure we have enough vacations
  return deals.filter(d => d.type === 'vacation').slice(0, limit) as VacationOffer[];
}


// Get cache status for monitoring
export function getCacheStatus() {
  return {
    flights: memoryCache ? memoryCache.data.filter(d => d.type === 'flight').length : 0,
    vacations: memoryCache ? memoryCache.data.filter(d => d.type === 'vacation').length : 0,
    lastUpdated: memoryCache ? new Date(memoryCache.timestamp) : null,
    nextRefresh: memoryCache ? new Date(memoryCache.timestamp + CACHE_DURATION) : null,
  };
}
