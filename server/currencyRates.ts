/**
 * Currency Exchange Rate Service
 * 
 * Fetches real-time CZK exchange rates from the Czech National Bank (CNB) API.
 * Rates are cached for 1 hour to minimize API calls.
 * Falls back to static rates if the API is unavailable.
 */

// Cached rates
let cachedRates: { EUR: number; USD: number; GBP: number; updatedAt: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Fallback static rates (CZK per 1 unit of foreign currency)
const FALLBACK_RATES = {
  EUR: 25.0,
  USD: 23.3,
  GBP: 29.5,
};

/**
 * Parse CNB daily exchange rate text format
 * Format: "country|currency|amount|code|rate"
 * Example: "EMU|euro|1|EUR|25,120"
 */
function parseCnbRates(text: string): Record<string, number> {
  const rates: Record<string, number> = {};
  const lines = text.split("\n");
  
  for (const line of lines) {
    const parts = line.split("|");
    if (parts.length >= 5) {
      const amount = parseInt(parts[2], 10);
      const code = parts[3].trim();
      const rate = parseFloat(parts[4].replace(",", "."));
      
      if (!isNaN(amount) && !isNaN(rate) && amount > 0) {
        // Rate is CZK per `amount` units, normalize to CZK per 1 unit
        rates[code] = rate / amount;
      }
    }
  }
  
  return rates;
}

/**
 * Fetch latest exchange rates from Czech National Bank
 * CNB publishes daily rates in a simple text format
 */
export async function fetchExchangeRates(): Promise<{ EUR: number; USD: number; GBP: number; updatedAt: number }> {
  // Return cached if still valid
  if (cachedRates && (Date.now() - cachedRates.updatedAt) < CACHE_TTL) {
    return cachedRates;
  }

  try {
    const response = await fetch(
      "https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt",
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) {
      throw new Error(`CNB API returned ${response.status}`);
    }

    const text = await response.text();
    const allRates = parseCnbRates(text);

    const rates = {
      EUR: allRates["EUR"] || FALLBACK_RATES.EUR,
      USD: allRates["USD"] || FALLBACK_RATES.USD,
      GBP: allRates["GBP"] || FALLBACK_RATES.GBP,
      updatedAt: Date.now(),
    };

    cachedRates = rates;
    console.log(`[CurrencyRates] Updated: EUR=${rates.EUR}, USD=${rates.USD}, GBP=${rates.GBP}`);
    return rates;
  } catch (error) {
    console.warn("[CurrencyRates] Failed to fetch from CNB, using fallback:", error);
    
    // Return cached even if expired, or fallback
    if (cachedRates) {
      return cachedRates;
    }

    const fallback = {
      ...FALLBACK_RATES,
      updatedAt: Date.now(),
    };
    cachedRates = fallback;
    return fallback;
  }
}

/**
 * Convert CZK price to target currency
 */
export function convertFromCzk(priceCzk: number, targetCurrency: string, rates: { EUR: number; USD: number; GBP: number }): number {
  if (targetCurrency === "CZK") return priceCzk;
  
  const ratePerUnit = (rates as any)[targetCurrency];
  if (!ratePerUnit) return priceCzk;
  
  // rates contain CZK per 1 unit of foreign currency
  // So to convert CZK to foreign: priceCzk / ratePerUnit
  return priceCzk / ratePerUnit;
}

/**
 * Get rates for the client - returns CZK per 1 unit of foreign currency
 * and the inverse (foreign per 1 CZK) for client-side conversion
 */
export async function getClientRates(): Promise<{
  rates: { CZK: number; EUR: number; USD: number; GBP: number };
  symbols: { CZK: string; EUR: string; USD: string; GBP: string };
  updatedAt: number;
  source: string;
}> {
  const rawRates = await fetchExchangeRates();
  
  return {
    // These are "1 CZK = X foreign" rates for client-side multiplication
    rates: {
      CZK: 1,
      EUR: 1 / rawRates.EUR,    // e.g., 1/25 = 0.04
      USD: 1 / rawRates.USD,    // e.g., 1/23.3 = 0.043
      GBP: 1 / rawRates.GBP,   // e.g., 1/29.5 = 0.034
    },
    symbols: {
      CZK: "Kč",
      EUR: "€",
      USD: "$",
      GBP: "£",
    },
    updatedAt: rawRates.updatedAt,
    source: "CNB (Česká národní banka)",
  };
}

// For testing - reset cache
export function _resetCache() {
  cachedRates = null;
}
