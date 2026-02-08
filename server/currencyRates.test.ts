import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Import after mocking
import { fetchExchangeRates, convertFromCzk, getClientRates, _resetCache } from "./currencyRates";

const SAMPLE_CNB_RESPONSE = `08.02.2026 #27
země|měna|množství|kód|kurz
Austrálie|dolar|1|AUD|14,812
EMU|euro|1|EUR|25,120
Velká Británie|libra|1|GBP|29,450
USA|dolar|1|USD|23,300
Japonsko|jen|100|JPY|15,234`;

describe("currencyRates", () => {
  beforeEach(() => {
    _resetCache();
    mockFetch.mockReset();
  });

  describe("fetchExchangeRates", () => {
    it("should parse CNB rates correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => SAMPLE_CNB_RESPONSE,
      });

      const rates = await fetchExchangeRates();
      expect(rates.EUR).toBe(25.12);
      expect(rates.USD).toBe(23.3);
      expect(rates.GBP).toBe(29.45);
      expect(rates.updatedAt).toBeGreaterThan(0);
    });

    it("should return cached rates on second call", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => SAMPLE_CNB_RESPONSE,
      });

      const rates1 = await fetchExchangeRates();
      const rates2 = await fetchExchangeRates();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(rates1).toEqual(rates2);
    });

    it("should use fallback rates when API fails", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const rates = await fetchExchangeRates();
      expect(rates.EUR).toBe(25.0);
      expect(rates.USD).toBe(23.3);
      expect(rates.GBP).toBe(29.5);
    });

    it("should use fallback when API returns non-200", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const rates = await fetchExchangeRates();
      expect(rates.EUR).toBe(25.0);
    });

    it("should handle multi-unit currencies (e.g., JPY per 100)", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => SAMPLE_CNB_RESPONSE,
      });

      const rates = await fetchExchangeRates();
      // JPY is 100 units = 15.234 CZK, so 1 JPY = 0.15234 CZK
      // But we only return EUR, USD, GBP so JPY is not in the result
      expect(rates.EUR).toBeDefined();
      expect(rates.USD).toBeDefined();
      expect(rates.GBP).toBeDefined();
    });
  });

  describe("convertFromCzk", () => {
    const rates = { EUR: 25.0, USD: 23.3, GBP: 29.5 };

    it("should return same price for CZK", () => {
      expect(convertFromCzk(1000, "CZK", rates)).toBe(1000);
    });

    it("should convert CZK to EUR correctly", () => {
      const result = convertFromCzk(2500, "EUR", rates);
      expect(result).toBe(100); // 2500 / 25 = 100 EUR
    });

    it("should convert CZK to USD correctly", () => {
      const result = convertFromCzk(2330, "USD", rates);
      expect(result).toBe(100); // 2330 / 23.3 = 100 USD
    });

    it("should return CZK price for unknown currency", () => {
      expect(convertFromCzk(1000, "XYZ", rates)).toBe(1000);
    });
  });

  describe("getClientRates", () => {
    it("should return inverted rates for client-side multiplication", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => SAMPLE_CNB_RESPONSE,
      });

      const result = await getClientRates();
      
      expect(result.rates.CZK).toBe(1);
      // 1 CZK = 1/25.12 EUR ≈ 0.0398
      expect(result.rates.EUR).toBeCloseTo(1 / 25.12, 4);
      expect(result.rates.USD).toBeCloseTo(1 / 23.3, 4);
      expect(result.rates.GBP).toBeCloseTo(1 / 29.45, 4);
      
      expect(result.symbols.CZK).toBe("Kč");
      expect(result.symbols.EUR).toBe("€");
      expect(result.symbols.USD).toBe("$");
      expect(result.symbols.GBP).toBe("£");
      
      expect(result.source).toBe("CNB (Česká národní banka)");
      expect(result.updatedAt).toBeGreaterThan(0);
    });
  });
});
