/**
 * Pelikán Feed Parser Service
 * Fetches and parses XML feeds from lastminutedovolene.cz
 * Implements 24-hour caching with midnight refresh
 */

import { XMLParser } from 'fast-xml-parser';

// Feed URLs
const FLIGHTS_FEED_URL = 'https://lastminutedovolene.cz/api/meta-feed-flights.xml';
const VACATIONS_FEED_URL = 'https://lastminutedovolene.cz/api/meta-feed-vacations.xml';

// Cache storage
interface CacheEntry<T> {
  data: T[];
  fetchedAt: number;
  expiresAt: number;
}

let flightsCache: CacheEntry<FlightOffer> | null = null;
let vacationsCache: CacheEntry<VacationOffer> | null = null;

// Types
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
  departure: string;
  discount: string;
  airline?: string;
  type: 'flight';
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
  discount: string;
  duration: string;
  type: 'vacation';
}

// Calculate cache expiry (next midnight)
function getNextMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

// Check if cache is valid
function isCacheValid<T>(cache: CacheEntry<T> | null): boolean {
  if (!cache) return false;
  return Date.now() < cache.expiresAt;
}

// Parse price string to number (e.g., "1138 CZK" -> 1138)
function parsePrice(priceStr: string): number {
  const match = priceStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// Parse discount string (e.g., "Sleva 30%" -> "-30%")
function parseDiscount(discountStr: string): string {
  const match = discountStr.match(/(\d+)/);
  return match ? `-${match[1]}%` : '';
}

// Fetch and parse flights feed
export async function fetchFlights(forceRefresh = false): Promise<FlightOffer[]> {
  // Return cached data if valid
  if (!forceRefresh && isCacheValid(flightsCache)) {
    return flightsCache!.data;
  }

  try {
    const response = await fetch(FLIGHTS_FEED_URL);
    const xmlText = await response.text();
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    
    const result = parser.parse(xmlText);
    const items = result?.rss?.channel?.item || [];
    
    const flights: FlightOffer[] = (Array.isArray(items) ? items : [items]).map((item: any) => ({
      id: item['g:id'] || '',
      title: item['g:title'] || '',
      description: item['g:description'] || '',
      link: item['g:link'] || '',
      imageUrl: item['g:image_link'] || '',
      price: parsePrice(item['g:price'] || '0'),
      salePrice: parsePrice(item['g:sale_price'] || '0'),
      country: item['g:custom_label_0'] || '',
      destination: item['g:custom_label_1'] || '',
      departure: item['g:custom_label_2'] || '',
      discount: parseDiscount(item['g:custom_label_3'] || ''),
      type: 'flight' as const,
    }));

    // Update cache
    flightsCache = {
      data: flights,
      fetchedAt: Date.now(),
      expiresAt: getNextMidnight(),
    };

    return flights;
  } catch (error) {
    console.error('Error fetching flights feed:', error);
    // Return cached data even if expired, or empty array
    return flightsCache?.data || [];
  }
}

// Fetch and parse vacations feed
export async function fetchVacations(forceRefresh = false): Promise<VacationOffer[]> {
  // Return cached data if valid
  if (!forceRefresh && isCacheValid(vacationsCache)) {
    return vacationsCache!.data;
  }

  try {
    const response = await fetch(VACATIONS_FEED_URL);
    const xmlText = await response.text();
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    
    const result = parser.parse(xmlText);
    const items = result?.rss?.channel?.item || [];
    
    const vacations: VacationOffer[] = (Array.isArray(items) ? items : [items]).map((item: any) => ({
      id: item['g:id'] || '',
      title: item['g:title'] || '',
      description: item['g:description'] || '',
      link: item['g:link'] || '',
      imageUrl: item['g:image_link'] || '',
      price: parsePrice(item['g:price'] || '0'),
      salePrice: parsePrice(item['g:sale_price'] || '0'),
      country: item['g:custom_label_0'] || '',
      destination: item['g:custom_label_1'] || '',
      location: item['g:custom_label_2'] || '',
      discount: parseDiscount(item['g:custom_label_3'] || ''),
      duration: item['g:custom_label_4'] || '',
      type: 'vacation' as const,
    }));

    // Update cache
    vacationsCache = {
      data: vacations,
      fetchedAt: Date.now(),
      expiresAt: getNextMidnight(),
    };

    return vacations;
  } catch (error) {
    console.error('Error fetching vacations feed:', error);
    // Return cached data even if expired, or empty array
    return vacationsCache?.data || [];
  }
}

// Get cache status
export function getCacheStatus() {
  return {
    flights: {
      cached: !!flightsCache,
      count: flightsCache?.data.length || 0,
      fetchedAt: flightsCache?.fetchedAt ? new Date(flightsCache.fetchedAt).toISOString() : null,
      expiresAt: flightsCache?.expiresAt ? new Date(flightsCache.expiresAt).toISOString() : null,
    },
    vacations: {
      cached: !!vacationsCache,
      count: vacationsCache?.data.length || 0,
      fetchedAt: vacationsCache?.fetchedAt ? new Date(vacationsCache.fetchedAt).toISOString() : null,
      expiresAt: vacationsCache?.expiresAt ? new Date(vacationsCache.expiresAt).toISOString() : null,
    },
  };
}

// Filter flights by country
export async function getFlightsByCountry(country: string): Promise<FlightOffer[]> {
  const flights = await fetchFlights();
  return flights.filter(f => f.country.toLowerCase().includes(country.toLowerCase()));
}

// Filter flights by departure city
export async function getFlightsByDeparture(departure: string): Promise<FlightOffer[]> {
  const flights = await fetchFlights();
  return flights.filter(f => f.departure.toLowerCase().includes(departure.toLowerCase()));
}

// Filter vacations by country
export async function getVacationsByCountry(country: string): Promise<VacationOffer[]> {
  const vacations = await fetchVacations();
  return vacations.filter(v => v.country.toLowerCase().includes(country.toLowerCase()));
}

// Get flights sorted by price
export async function getFlightsSortedByPrice(ascending = true): Promise<FlightOffer[]> {
  const flights = await fetchFlights();
  return [...flights].sort((a, b) => ascending ? a.salePrice - b.salePrice : b.salePrice - a.salePrice);
}

// Get vacations sorted by price
export async function getVacationsSortedByPrice(ascending = true): Promise<VacationOffer[]> {
  const vacations = await fetchVacations();
  return [...vacations].sort((a, b) => ascending ? a.salePrice - b.salePrice : b.salePrice - a.salePrice);
}
