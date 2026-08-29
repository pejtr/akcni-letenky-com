// Polyfill client environment for node
const storageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
};

let cookies: Record<string, string> = {};
const documentMock = {
  get cookie() {
    return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ");
  },
  set cookie(cookieStr: string) {
    const [pair] = cookieStr.split(";");
    const [key, value] = pair.split("=");
    if (key) {
      if (!value || cookieStr.includes("expires=Thu, 01 Jan 1970")) {
        delete cookies[key.trim()];
      } else {
        cookies[key.trim()] = value ? value.trim() : "";
      }
    }
  },
};

(globalThis as any).window = globalThis;
(globalThis as any).document = documentMock;
(globalThis as any).sessionStorage = storageMock();
(globalThis as any).localStorage = storageMock();
(globalThis as any).location = { origin: "https://www.akcni-letenky.com", pathname: "/" };

import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  pelikanAffiliateUrl,
  pelikanLink,
  pelikanDeepLink,
  kiwiAffiliateUrl,
  bookingSearchLink,
  bookingHotelLink,
  PELIKAN_AID,
  TRAVELPAYOUTS_MARKER,
} from "../shared/affiliateLinks";

import {
  getVisitorId,
  getSessionId,
  getJourneyToken,
  setJourneyToken,
  appendOnyxSubId,
  isAffiliateUrl,
  trackAffiliateRedirect,
} from "../client/src/lib/leadosTracking";

describe("QA Testy Funkčnosti Prokliků Poskytovatelů (Affiliate & LeadOS Tracking)", () => {
  beforeEach(() => {
    cookies = {};
    (globalThis as any).sessionStorage.clear();
    (globalThis as any).localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("1. Pelikán.cz Affiliate Links QA", () => {
    it("správně generuje Pelikán URL s a_aid=levne-letenky a UTM parametry", () => {
      const urlStr = pelikanAffiliateUrl("/cs/akcni-letenky/praha/londyn", {
        campaign: "homepage-hero",
        channel: "search-button",
        content: "banner-1",
      });

      const url = new URL(urlStr);
      expect(url.hostname).toBe("www.pelikan.cz");
      expect(url.pathname).toBe("/cs/akcni-letenky/praha/londyn");
      expect(url.searchParams.get("a_aid")).toBe("levne-letenky");
      expect(url.searchParams.get("utm_source")).toBe("akcni-letenky");
      expect(url.searchParams.get("utm_medium")).toBe("affiliate");
      expect(url.searchParams.get("utm_campaign")).toBe("homepage-hero");
      expect(url.searchParams.get("utm_channel")).toBe("search-button");
      expect(url.searchParams.get("utm_content")).toBe("banner-1");
    });

    it("normalizuje neúplné nebo poškozené Pelikán URL (protokol, dvojitá lomítka)", () => {
      const dirtyUrl = "http://pelikan.cz//cs//pobyty//kategorie/104";
      const cleanUrlStr = pelikanAffiliateUrl(dirtyUrl);
      const url = new URL(cleanUrlStr);

      expect(url.protocol).toBe("https:");
      expect(url.hostname).toBe("www.pelikan.cz");
      expect(url.pathname).toBe("/cs/pobyty/kategorie/104");
      expect(url.searchParams.get("a_aid")).toBe("levne-letenky");
    });

    it("pelikanLink a pelikanDeepLink vracejí plně validní affiliate odkaz", () => {
      const link1 = pelikanLink("/cs/akcni-letenky", "test-campaign");
      const link2 = pelikanDeepLink("/cs/pobyty", { campaign: "pobyty-campaign" });

      expect(link1).toContain("a_aid=levne-letenky");
      expect(link1).toContain("utm_campaign=test-campaign");
      expect(link2).toContain("a_aid=levne-letenky");
      expect(link2).toContain("utm_campaign=pobyty-campaign");
    });
  });

  describe("2. Kiwi.com & Booking.com Affiliate Links QA", () => {
    it("správně generuje Kiwi affiliate URL pro vyhledávání z Prahy do destinace", () => {
      const kiwiUrl = kiwiAffiliateUrl("https://www.kiwi.com/cs/search/results/prague-czech-republic/barcelona-spain");
      expect(decodeURIComponent(kiwiUrl)).toContain("kiwi.com");
      expect(decodeURIComponent(kiwiUrl)).toContain("/prague-czech-republic/barcelona-spain");
    });

    it("správně generuje Booking.com vyhledávací a hotelové odkazy", () => {
      const bookingSearch = bookingSearchLink("Barcelona");
      expect(bookingSearch).toContain("booking.com/searchresults.html");
      expect(bookingSearch).toContain("ss=Barcelona");
      expect(bookingSearch).toContain("lang=cs");

      const bookingHotel = bookingHotelLink("hotel-arts-barcelona");
      expect(bookingHotel).toContain("booking.com/hotel/es/hotel-arts-barcelona");
    });
  });

  describe("3. LeadOS Journey Token SubID Decoration QA (appendOnyxSubId)", () => {
    it("automaticky přidává subid1=<TOKEN> do Pelikán odkazů, pokud je token aktivní", () => {
      setJourneyToken("onyx_journey_test_abc123");

      const rawPelikanUrl = pelikanAffiliateUrl("/cs/akcni-letenky/praha/dubaj");
      expect(rawPelikanUrl).toContain("subid1=onyx_journey_test_abc123");
    });

    it("dekóduje a dekoruje vnitřní i vnější URL v /redirect linkách", () => {
      setJourneyToken("onyx_journey_test_abc123");

      const rawInnerUrl = "https://www.pelikan.cz/cs/akcni-letenky?a_aid=levne-letenky";
      const redirectLink = `/redirect?url=${encodeURIComponent(rawInnerUrl)}&dest=pelikan`;

      const decorated = appendOnyxSubId(redirectLink);
      expect(decodeURIComponent(decorated)).toContain("subid1=onyx_journey_test_abc123");
    });

    it("nedekoruje URL, pokud není přítomen žádný journey token", () => {
      const rawUrl = "https://www.pelikan.cz/cs/akcni-letenky?a_aid=levne-letenky";
      const decorated = appendOnyxSubId(rawUrl);
      expect(decorated).toBe(rawUrl);
      expect(decorated).not.toContain("subid1=");
    });
  });

  describe("4. Detekce Affiliate URL (isAffiliateUrl)", () => {
    it("správně identifikuje všechny podporované domény poskytovatelů", () => {
      expect(isAffiliateUrl("https://www.pelikan.cz/cs/akcni-letenky")).toBe(true);
      expect(isAffiliateUrl("https://www.kiwi.com/cs/search")).toBe(true);
      expect(isAffiliateUrl("https://www.booking.com/searchresults")).toBe(true);
      expect(isAffiliateUrl("https://tp.media/r?marker=267609")).toBe(true);
      expect(isAffiliateUrl("https://www.tradedoubler.com/click")).toBe(true);
      expect(isAffiliateUrl("https://www.omio.com/travel")).toBe(true);
      expect(isAffiliateUrl("https://www.aviasales.com")).toBe(true);
      expect(isAffiliateUrl("/redirect?url=https%3A%2F%2Fpelikan.cz")).toBe(true);
    });

    it("neoznačuje interní stránky jako affiliate", () => {
      expect(isAffiliateUrl("https://www.akcni-letenky.com/levne-letenky")).toBe(false);
      expect(isAffiliateUrl("https://www.akcni-letenky.com/blog")).toBe(false);
      expect(isAffiliateUrl("https://www.akcni-letenky.com/wishlist")).toBe(false);
    });
  });

  describe("5. LeadOS Event Telemetry (trackAffiliateRedirect)", () => {
    it("odesílá affiliate_redirect událost s požadovanými parametry", () => {
      setJourneyToken("onyx_journey_live_999");

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({ status: "ok" }),
      } as Response);

      const targetAffiliateUrl = "https://www.pelikan.cz/cs/akcni-letenky?a_aid=levne-letenky&subid1=onyx_journey_live_999";
      trackAffiliateRedirect(targetAffiliateUrl);

      expect(fetchSpy).toHaveBeenCalledWith(
        "https://leados.cz/api/travel/events",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "x-project-key": expect.any(String),
          }),
        })
      );

      const body = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string);
      expect(body.events[0]).toMatchObject({
        event_name: "affiliate_redirect",
        journey_token: "onyx_journey_live_999",
        target_url: targetAffiliateUrl,
      });
      expect(body.events[0].visitor_id).toBeTruthy();
      expect(body.events[0].session_id).toBeTruthy();
    });
  });
});
