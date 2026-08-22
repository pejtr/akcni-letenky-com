/**
 * Pelikan Feed Parser Service
 * Fetches and parses XML feeds from Pelikan.cz.
 */

import xml2js from "xml2js";
import { promisify } from "util";

const parseStringPromise = promisify(xml2js.parseString);

export const PELIKAN_VACATION_FEED_URL =
  "https://www.pelikan.cz/gf3/pelijee-cz/deals/discount/deals";
export const PELIKAN_FLIGHT_FEED_URL =
  "https://www.pelikan.cz/gf3/pelijee-cz/calendars/xmlpromo";

const AFFILIATE_ID = "levne-letenky";
const CACHE_DURATION = 600 * 60 * 1000; // 10 hours

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
  type: "flight";
  rating?: number;
  length?: number;
  tags?: string[];
  region?: string;
  source?: "pelikan";
  destinationIata?: string;
  departureIata?: string;
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
  type: "vacation";
  rating?: number;
  length?: number;
  tags?: string[];
  region?: string;
  source?: "pelikan";
}

interface CachedData<T> {
  data: T[];
  timestamp: number;
}

let flightCache: CachedData<FlightOffer> | null = null;
let vacationCache: CachedData<VacationOffer> | null = null;

function valueText(value: any): string {
  if (value === null || value === undefined) return "";
  const item = Array.isArray(value) ? value[0] : value;
  if (item === null || item === undefined) return "";
  if (typeof item === "string") return item.trim();
  if (typeof item === "number" || typeof item === "boolean") return String(item).trim();
  if (typeof item._ === "string") return item._.trim();
  return "";
}

function parseAmount(value: any): number {
  const raw = valueText(value).replace(/\s/g, "").replace(",", ".");
  const match = raw.match(/\d+(?:\.\d+)?/);
  return match ? Math.round(Number.parseFloat(match[0])) : 0;
}

function normalizeUrl(rawUrl: string, fallback = "https://www.pelikan.cz"): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return fallback;

  try {
    const url = new URL(trimmed, fallback);
    if (url.hostname === "www.pelikan.cz" || url.hostname === "pelikan.cz") {
      url.protocol = "https:";
      url.hostname = "www.pelikan.cz";
      url.pathname = url.pathname.replace(/\/{2,}/g, "/");
    }
    return url.toString();
  } catch {
    return fallback;
  }
}

function addAffiliateParams(rawUrl: string, campaign: string): string {
  const url = new URL(normalizeUrl(rawUrl));
  if (!url.searchParams.has("a_aid")) {
    url.searchParams.set("a_aid", AFFILIATE_ID);
  }
  if (!url.searchParams.has("utm_source")) {
    url.searchParams.set("utm_source", "akcni-letenky");
  }
  if (!url.searchParams.has("utm_medium")) {
    url.searchParams.set("utm_medium", "affiliate");
  }
  if (!url.searchParams.has("utm_campaign")) {
    url.searchParams.set("utm_campaign", campaign);
  }
  return url.toString();
}

function firstValidUrl(values: string[]): string {
  return (
    values.find((url) => url.startsWith("http://") || url.startsWith("https://")) ||
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&q=80"
  );
}

function pickVacationImage(deal: any): string {
  const candidates: string[] = [];

  if (Array.isArray(deal.images)) {
    deal.images.forEach((container: any) => {
      const nested = container?.images;
      if (Array.isArray(nested)) {
        nested.forEach((image) => candidates.push(valueText(image)));
      } else {
        candidates.push(valueText(nested));
      }
    });
  }

  [
    "image_550x310",
    "image_228x140",
    "image_270x270",
    "image_600x280",
    "image_650x450",
  ].forEach((field) => candidates.push(valueText(deal[field])));

  return firstValidUrl(candidates.filter(Boolean));
}

function pickFlightImage(item: any): string {
  const candidates = [
    valueText(item.IMAGE_580x400),
    valueText(item.IMAGE_750x300),
    valueText(item.IMAGE_480x280),
    valueText(item.IMAGE_300x300),
    valueText(item.IMAGE_ORIGINAL),
    valueText(item.DESTINATION_IMAGE),
    valueText(item.IMAGE),
  ];

  return firstValidUrl(candidates.filter(Boolean));
}

function detectTags(deal: any): string[] {
  const tags: string[] = [];
  const country = valueText(deal.country).toLowerCase();
  const city = valueText(deal.city).toLowerCase();
  const dealName = valueText(deal.dealName).toLowerCase();
  const description = valueText(deal.shortDescription).toLowerCase();
  const fullText = `${dealName} ${description} ${country} ${city}`;

  if (fullText.includes("all inclusive") || fullText.includes("all-inclusive")) {
    tags.push("all-inclusive");
  }

  const products = deal.dealDiscountProducts?.[0]?.dealDiscountProducts;
  if (Array.isArray(products)) {
    const hasWellness = products.some((product: any) => valueText(product.name).toUpperCase() === "WELLNESS");
    if (hasWellness) tags.push("wellness");
  }

  if (fullText.includes("wellness") || fullText.includes("spa")) {
    if (!tags.includes("wellness")) tags.push("wellness");
  }

  const seaCountries = [
    "recko",
    "spanelsko",
    "italie",
    "malta",
    "chorvatsko",
    "turecko",
    "egypt",
    "portugalsko",
    "bulharsko",
  ];
  if (
    seaCountries.some((name) => country.normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(name)) ||
    fullText.includes("plaz") ||
    fullText.includes("beach") ||
    fullText.includes("more")
  ) {
    tags.push("beach");
  }

  if (
    fullText.includes("rodina") ||
    fullText.includes("deti") ||
    fullText.includes("family") ||
    fullText.includes("kids") ||
    fullText.includes("aquapark")
  ) {
    tags.push("family");
  }

  if (fullText.includes("luxus") || fullText.includes("luxury") || fullText.includes("5*")) {
    tags.push("luxury");
  }

  if (fullText.includes("bazen") || fullText.includes("pool")) {
    tags.push("pool");
  }

  return Array.from(new Set(tags));
}

function calculateOriginalPrice(currentPrice: number, originalPrice: number): number {
  return originalPrice > currentPrice ? originalPrice : Math.round(currentPrice * 1.1);
}

function calculateDiscount(currentPrice: number, originalPrice: number, rawDiscount?: any): number {
  const parsedDiscount = parseAmount(rawDiscount);
  if (parsedDiscount > 0) return Math.min(parsedDiscount, 100);
  return originalPrice > 0 ? Math.max(0, Math.round(100 * (1 - currentPrice / originalPrice))) : 0;
}

async function fetchXml(url: string): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "akcni-letenky.com/1.0",
        Accept: "application/xml, text/xml",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return parseStringPromise(await response.text());
  } finally {
    clearTimeout(timeoutId);
  }
}

function isCacheFresh<T>(cache: CachedData<T> | null): cache is CachedData<T> {
  return !!cache && Date.now() - cache.timestamp < CACHE_DURATION;
}

function parseFlightOffer(item: any, index: number): FlightOffer | null {
  const currentPrice = parseAmount(item.PRICE);
  const link = normalizeUrl(valueText(item.URL));
  const destination = valueText(item.TO);
  const departure = valueText(item.FROM);

  if (currentPrice <= 0 || !destination || !link) return null;

  const originalPrice = calculateOriginalPrice(currentPrice, 0);
  const id = valueText(item.CALENDAR_ID) || `flight-${index}`;

  return {
    id: id.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""),
    title: `${departure || "Praha"} - ${destination}`,
    description: `Akcni letenka ${departure || "Praha"} - ${destination} od Pelikan.cz`,
    link: addAffiliateParams(link, "flight-feed"),
    imageUrl: pickFlightImage(item),
    price: originalPrice,
    salePrice: currentPrice,
    country: destination,
    destination,
    departure,
    discount: calculateDiscount(currentPrice, originalPrice),
    airline: valueText(item.AIRLINE),
    type: "flight",
    rating: 4.6,
    source: "pelikan",
    destinationIata: valueText(item.DESTINATION_IATA),
    departureIata: valueText(item.DEPARTURE_IATA),
  };
}

function parseVacationOffer(deal: any, index: number): VacationOffer | null {
  const title = valueText(deal.dealName);
  const currentPrice = parseAmount(deal.price);
  const link = normalizeUrl(valueText(deal.dealUrl));

  if (!title || currentPrice <= 0 || !link) return null;

  const originalPrice = calculateOriginalPrice(currentPrice, parseAmount(deal.priceBeforeDiscount));
  const city = valueText(deal.city);
  const country = valueText(deal.country);
  const length = parseAmount(deal.length);
  const urlId = link.match(/\/([^/?#]+)\/?$/)?.[1];
  const id = (urlId || `vacation-${index}`)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    id,
    title,
    description: valueText(deal.shortDescription),
    link: addAffiliateParams(link, "vacation-feed"),
    imageUrl: pickVacationImage(deal),
    price: originalPrice,
    salePrice: currentPrice,
    country,
    destination: city || country,
    location: city,
    discount: calculateDiscount(currentPrice, originalPrice, deal.discount),
    duration: length > 0 ? `${length} dni` : "",
    type: "vacation",
    rating: 4.7,
    length,
    tags: detectTags(deal),
    region: valueText(deal.region),
    source: "pelikan",
  };
}

export async function fetchFlights(limit: number = 50): Promise<FlightOffer[]> {
  if (isCacheFresh(flightCache)) {
    return flightCache.data.slice(0, limit);
  }

  try {
    const parsed = await fetchXml(PELIKAN_FLIGHT_FEED_URL);
    const nodes = parsed?.SERVER?.Calendar?.[0]?.Calendar || [];
    const flights = nodes
      .map((node: any, index: number) => parseFlightOffer(node, index))
      .filter(Boolean) as FlightOffer[];

    flightCache = { data: flights, timestamp: Date.now() };
    console.log(`[Pelikan] Fetched ${flights.length} flights from xmlpromo feed`);
    return flights.slice(0, limit);
  } catch (error) {
    console.error("[Pelikan] Error fetching flight feed:", error);
    return flightCache?.data.slice(0, limit) || [];
  }
}

export async function fetchVacations(limit: number = 50): Promise<VacationOffer[]> {
  if (isCacheFresh(vacationCache)) {
    return vacationCache.data.slice(0, limit);
  }

  try {
    const parsed = await fetchXml(PELIKAN_VACATION_FEED_URL);
    const nodes = parsed?.dealDiscountList?.dealDiscounts?.[0]?.dealDiscounts || [];
    const vacations = nodes
      .map((node: any, index: number) => parseVacationOffer(node, index))
      .filter(Boolean) as VacationOffer[];

    vacationCache = { data: vacations, timestamp: Date.now() };
    console.log(`[Pelikan] Fetched ${vacations.length} vacations from deals feed`);
    return vacations.slice(0, limit);
  } catch (error) {
    console.error("[Pelikan] Error fetching vacation feed:", error);
    return vacationCache?.data.slice(0, limit) || [];
  }
}

export async function fetchPelikanDeals(limit: number = 100): Promise<VacationOffer[]> {
  return fetchVacations(limit);
}

export function getCacheStatus() {
  return {
    flights: {
      count: flightCache?.data.length || 0,
      cached: !!flightCache,
      lastUpdated: flightCache ? new Date(flightCache.timestamp) : null,
      nextRefresh: flightCache ? new Date(flightCache.timestamp + CACHE_DURATION) : null,
      feedUrl: PELIKAN_FLIGHT_FEED_URL,
    },
    vacations: {
      count: vacationCache?.data.length || 0,
      cached: !!vacationCache,
      lastUpdated: vacationCache ? new Date(vacationCache.timestamp) : null,
      nextRefresh: vacationCache ? new Date(vacationCache.timestamp + CACHE_DURATION) : null,
      feedUrl: PELIKAN_VACATION_FEED_URL,
    },
  };
}

export function __resetPelikanFeedCacheForTests() {
  flightCache = null;
  vacationCache = null;
}
