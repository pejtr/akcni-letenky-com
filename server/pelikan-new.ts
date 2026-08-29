import xml2js from "xml2js";
import { promisify } from "util";
import { redisCache } from "./redisCache";

const parseStringPromise = promisify(xml2js.parseString);

const PELIKAN_FEED_URL = "https://www.pelikan.cz/gf3/pelijee-cz/deals/discount/deals";
const AFFILIATE_ID = "levne-letenky";
const CACHE_DURATION = 600 * 60 * 1000; // 600 minutes (10 hours) in milliseconds
const REDIS_CACHE_KEY = "pelikan:deals";
const REDIS_TTL = 600 * 60; // 600 minutes (10 hours) in seconds
interface PeliканDeal {
  dealName: string;
  shortDescription?: string;
  city: string;
  country: string;
  length: number;
  price: number;
  priceBeforeDiscount: number;
  discount: number;
  rating?: number;
  dealUrl: string;
  images?: {
    images?: string[];
  };
  image_550x310?: string;
  image_228x140?: string;
  image_270x270?: string;
  image_600x280?: string;
  image_650x450?: string;
  region?: string;
  dealDiscountProducts?: {
    dealDiscountProducts?: Array<{ name: string }>;
  };
}

interface CachedData {
  data: any[];
  timestamp: number;
}

// Fallback in-memory cache (used if Redis fails)
let memoryCache: CachedData | null = null;

function normalizeUrl(url: string): string {
  url = url.replace("://www.pelikan.cz//", "://www.pelikan.cz/");
  url = url.replace(/\/+/g, "/");
  url = url.replace(/^https:\/([^/])/, "https://$1");
  return url;
}

function addAffiliateParams(url: string, aid: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}a_aid=${encodeURIComponent(aid)}&utm_source=meta&utm_medium=cpc&utm_campaign=lastminutedovolene.cz&utm_content=grid`;
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

  // Use high-quality fallback image from Unsplash instead of placeholder.com
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

  // Check for wellness
  let hasWellness = false;
  if (deal.dealDiscountProducts?.[0]?.dealDiscountProducts) {
    const products = deal.dealDiscountProducts[0].dealDiscountProducts;
    if (Array.isArray(products)) {
      hasWellness = products.some((p: any) => (p.name?.[0] || "").toUpperCase() === "WELLNESS");
    }
  }

  if (hasWellness) return "wellness";

  // Check for sea destinations
  const seaCountries = ["řecko", "španělsko", "italie", "malta", "chorvatsko", "turecko", "egypt", "portugalsko"];
  if (seaCountries.includes(country) || city.includes("beach")) {
    return "more";
  }

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
    "filipiny", "manila",
    "katar", "doha",
    "omán", "muskat"
  ];
  
  if (exoticCountries.some(exotic => country.includes(exotic) || city.includes(exotic))) {
    return "exotika";
  }

  return "city";
}

export async function fetchPelikanDeals(limit: number = 100): Promise<any[]> {
  // Check Redis cache first
  try {
    const cachedData = await redisCache.get<any[]>(REDIS_CACHE_KEY);
    if (cachedData && cachedData.length > 0) {
      console.log("[Pelikan] Returning Redis cached data");
      return cachedData.slice(0, limit);
    }
  } catch (error) {
    console.warn("[Pelikan] Redis cache read failed:", (error as Error).message);
  }

  // Fallback to memory cache
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
        "User-Agent": "lastminutedovolene.cz/1.0",
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
    
    // Found deals in XML feed

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


      deals.push({
        id: dealId,
        title: deal.dealName[0],
        shortDescription: deal.shortDescription?.[0] || "",
        city: deal.city?.[0] || "",
        country: deal.country?.[0] || "",
        length,
        price,
        priceBeforeDiscount,
        discount: discountNum,
        save,

        image: pickImage(deal),
        destination: deal.country?.[0] || deal.city?.[0] || "",
        type: detectType(deal),
        dealUrl: affUrl,
        region: deal.region?.[0] || "",
        tags: detectTags(deal),
        source: "pelikan",
      });

      if (deals.length >= limit) break;
    }

    // Update Redis cache
    try {
      await redisCache.set(REDIS_CACHE_KEY, deals, REDIS_TTL);
      console.log(`[Pelikan] Cached ${deals.length} deals in Redis`);
    } catch (error) {
      console.warn("[Pelikan] Redis cache write failed:", (error as Error).message);
    }

    // Update memory cache as fallback
    memoryCache = {
      data: deals,
      timestamp: Date.now(),
    };

    console.log(`[Pelikan] Fetched ${deals.length} deals`);
    return deals;
  } catch (error) {
    console.error("[Pelikan] Error fetching deals:", error);
    
    // Try Redis cache first
    try {
      const cachedData = await redisCache.get<any[]>(REDIS_CACHE_KEY);
      if (cachedData && cachedData.length > 0) {
        console.log("[Pelikan] Returning stale Redis cache due to error");
        return cachedData.slice(0, limit);
      }
    } catch (cacheError) {
      console.warn("[Pelikan] Redis cache read failed in error handler");
    }
    
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
