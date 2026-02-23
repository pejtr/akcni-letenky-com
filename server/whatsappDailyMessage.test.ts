import { describe, it, expect } from "vitest";
import { generateWhatsAppMessage, getWhatsAppDailyStatus } from "./whatsappDailyMessage";
import type { FlightOffer, VacationOffer } from "./pelikanFeed";

// ============ Mock Data ============

const mockFlights: FlightOffer[] = [
  {
    id: "f1",
    title: "Praha → Barcelona",
    description: "Zpáteční letenka do Barcelony",
    link: "https://pelikan.cz/flight1",
    imageUrl: "https://example.com/barcelona.jpg",
    price: 1890,
    salePrice: 946,
    country: "Španělsko",
    destination: "Barcelona",
    discount: 50,
    type: "flight",
  },
  {
    id: "f2",
    title: "Praha → Londýn",
    description: "Zpáteční letenka do Londýna",
    link: "https://pelikan.cz/flight2",
    imageUrl: "https://example.com/london.jpg",
    price: 916,
    salePrice: 733,
    country: "Velká Británie",
    destination: "Londýn",
    discount: 20,
    type: "flight",
  },
  {
    id: "f3",
    title: "Praha → Paříž",
    description: "Zpáteční letenka do Paříže",
    link: "https://pelikan.cz/flight3",
    imageUrl: "https://example.com/paris.jpg",
    price: 2190,
    salePrice: 1027,
    country: "Francie",
    destination: "Paříž",
    discount: 53,
    type: "flight",
  },
  {
    id: "f4",
    title: "Praha → New York",
    description: "Zpáteční letenka do New Yorku",
    link: "https://pelikan.cz/flight4",
    imageUrl: "https://example.com/newyork.jpg",
    price: 15990,
    salePrice: 9490,
    country: "USA",
    destination: "New York",
    discount: 41,
    type: "flight",
  },
];

const mockVacations: VacationOffer[] = [
  {
    id: "v1",
    title: "Řecko - Kréta",
    description: "7 nocí all inclusive",
    link: "https://pelikan.cz/vacation1",
    imageUrl: "https://example.com/crete.jpg",
    price: 16867,
    salePrice: 12990,
    country: "Řecko",
    destination: "Kréta",
    location: "Kréta, Řecko",
    discount: 20,
    duration: "7 nocí",
    type: "vacation",
  },
  {
    id: "v2",
    title: "Turecko - Antalya",
    description: "7 nocí all inclusive",
    link: "https://pelikan.cz/vacation2",
    imageUrl: "https://example.com/antalya.jpg",
    price: 10125,
    salePrice: 7090,
    country: "Turecko",
    destination: "Antalya",
    location: "Antalya, Turecko",
    discount: 20,
    duration: "7 nocí",
    type: "vacation",
  },
  {
    id: "v3",
    title: "Egypt - Hurghada",
    description: "7 nocí all inclusive",
    link: "https://pelikan.cz/vacation3",
    imageUrl: "https://example.com/hurghada.jpg",
    price: 18627,
    salePrice: 14990,
    country: "Egypt",
    destination: "Hurghada",
    location: "Hurghada, Egypt",
    discount: 20,
    duration: "7 nocí",
    type: "vacation",
  },
];

// ============ Tests ============

describe("WhatsApp Daily Message Generator", () => {
  describe("generateWhatsAppMessage", () => {
    it("should generate a non-empty message", () => {
      const message = generateWhatsAppMessage(mockFlights, mockVacations);
      expect(message).toBeTruthy();
      expect(message.length).toBeGreaterThan(100);
    });

    it("should include header with date", () => {
      const message = generateWhatsAppMessage(mockFlights, mockVacations);
      expect(message).toContain("AKČNÍ NABÍDKY");
      expect(message).toContain("✈️");
    });

    it("should include flights section with max 3 flights (60%)", () => {
      const message = generateWhatsAppMessage(mockFlights, mockVacations);
      expect(message).toContain("LETENKY");

      // Should have 3 cheapest flights sorted by price
      expect(message).toContain("Londýn"); // 733 Kč - cheapest
      expect(message).toContain("Barcelona"); // 946 Kč
      expect(message).toContain("Paříž"); // 1027 Kč
    });

    it("should include vacations section with max 2 vacations (40%)", () => {
      const message = generateWhatsAppMessage(mockFlights, mockVacations);
      expect(message).toContain("DOVOLENÉ");

      // Should have 2 cheapest vacations sorted by price
      expect(message).toContain("Antalya"); // 7090 Kč - cheapest
      expect(message).toContain("Kréta"); // 12990 Kč
    });

    it("should sort flights by price (cheapest first)", () => {
      const message = generateWhatsAppMessage(mockFlights, mockVacations);

      const londonPos = message.indexOf("Londýn");
      const barcelonaPos = message.indexOf("Barcelona");
      const parisPos = message.indexOf("Paříž");

      expect(londonPos).toBeLessThan(barcelonaPos);
      expect(barcelonaPos).toBeLessThan(parisPos);
    });

    it("should include prices in Czech format", () => {
      const message = generateWhatsAppMessage(mockFlights, mockVacations);
      // Prices should be formatted with Czech locale
      expect(message).toMatch(/\d+/); // Contains numbers
      expect(message).toContain("Kč");
    });

    it("should include discount percentages", () => {
      const message = generateWhatsAppMessage(mockFlights, mockVacations);
      expect(message).toMatch(/-\d+%/); // Contains discount like -50%
    });

    it("should include website links for each offer", () => {
      const message = generateWhatsAppMessage(mockFlights, mockVacations);
      expect(message).toContain("https://akcni-letenky.com/");
    });

    it("should include call-to-action footer", () => {
      const message = generateWhatsAppMessage(mockFlights, mockVacations);
      expect(message).toContain("Rezervujte rychle");
      expect(message).toContain("https://akcni-letenky.com");
    });

    it("should include country info", () => {
      const message = generateWhatsAppMessage(mockFlights, mockVacations);
      expect(message).toContain("Španělsko");
      expect(message).toContain("Turecko");
    });

    it("should include vacation duration", () => {
      const message = generateWhatsAppMessage(mockFlights, mockVacations);
      expect(message).toContain("7 nocí");
    });

    it("should handle empty flights array", () => {
      const message = generateWhatsAppMessage([], mockVacations);
      expect(message).toBeTruthy();
      expect(message).not.toContain("LETENKY");
      expect(message).toContain("DOVOLENÉ");
    });

    it("should handle empty vacations array", () => {
      const message = generateWhatsAppMessage(mockFlights, []);
      expect(message).toBeTruthy();
      expect(message).toContain("LETENKY");
      expect(message).not.toContain("DOVOLENÉ");
    });

    it("should handle both empty arrays", () => {
      const message = generateWhatsAppMessage([], []);
      expect(message).toBeTruthy();
      // Should still have header and footer
      expect(message).toContain("AKČNÍ NABÍDKY");
      expect(message).toContain("Rezervujte rychle");
    });

    it("should not exceed 3 flights even with more available", () => {
      const message = generateWhatsAppMessage(mockFlights, mockVacations);
      // New York (9490 Kč) should NOT be included (4th cheapest)
      expect(message).not.toContain("New York");
    });

    it("should not exceed 2 vacations even with more available", () => {
      const message = generateWhatsAppMessage(mockFlights, mockVacations);
      // Hurghada (14990 Kč) should NOT be included (3rd cheapest)
      expect(message).not.toContain("Hurghada");
    });
  });

  describe("getWhatsAppDailyStatus", () => {
    it("should return status object with required fields", () => {
      const status = getWhatsAppDailyStatus();
      expect(status).toHaveProperty("lastGeneratedAt");
      expect(status).toHaveProperty("lastMessageLength");
      expect(status).toHaveProperty("hasMessage");
      expect(status).toHaveProperty("nextRunAt");
    });

    it("should have nextRunAt in the future", () => {
      const status = getWhatsAppDailyStatus();
      expect(status.nextRunAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("should have nextRunAt within 24 hours", () => {
      const status = getWhatsAppDailyStatus();
      const msIn24Hours = 24 * 60 * 60 * 1000;
      expect(status.nextRunAt.getTime() - Date.now()).toBeLessThanOrEqual(msIn24Hours);
    });
  });
});
