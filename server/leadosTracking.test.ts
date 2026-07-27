// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getVisitorId,
  getSessionId,
  getJourneyToken,
  setJourneyToken,
  appendOnyxSubId,
  isAffiliateUrl,
  initOnyxJourney,
  trackAffiliateRedirect,
} from "../client/src/lib/leadosTracking";

describe("LeadOS Travel Revenue Network Integration", () => {
  beforeEach(() => {
    // Clear storage and cookies before each test
    sessionStorage.clear();
    localStorage.clear();
    document.cookie = "onyx_journey_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "onyx_visitor_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "onyx_session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    vi.restoreAllMocks();
  });

  describe("Visitor and Session ID Generation", () => {
    it("should generate and persist visitor ID across calls", () => {
      const vid1 = getVisitorId();
      expect(vid1).toBeTruthy();
      expect(typeof vid1).toBe("string");

      const vid2 = getVisitorId();
      expect(vid2).toBe(vid1);
    });

    it("should generate and persist session ID across calls", () => {
      const sid1 = getSessionId();
      expect(sid1).toBeTruthy();
      expect(typeof sid1).toBe("string");

      const sid2 = getSessionId();
      expect(sid2).toBe(sid1);
    });
  });

  describe("Journey Token Persistence", () => {
    it("should return null when no token is present", () => {
      expect(getJourneyToken()).toBeNull();
    });

    it("should store and retrieve journey token from sessionStorage and cookie", () => {
      const token = "onyx_token_abc_123";
      setJourneyToken(token);

      expect(getJourneyToken()).toBe(token);
      expect(sessionStorage.getItem("onyx_journey_token")).toBe(token);
    });
  });

  describe("URL Parameter Capture (initOnyxJourney)", () => {
    it("should capture onyx_journey URL param and send cross_domain_arrival event", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({ status: "ok" }),
      } as Response);

      // Simulate URL with onyx_journey parameter
      delete (window as any).location;
      window.location = new URL("https://akcni-letenky.com/?onyx_journey=test_journey_999") as any;

      initOnyxJourney();

      expect(getJourneyToken()).toBe("test_journey_999");
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://leados.cz/api/travel/events",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "x-project-key": expect.any(String),
          }),
          body: expect.stringContaining("cross_domain_arrival"),
        })
      );

      const requestBody = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string);
      expect(requestBody.events[0]).toMatchObject({
        event_name: "cross_domain_arrival",
        journey_token: "test_journey_999",
      });
      expect(requestBody.events[0].visitor_id).toBeTruthy();
      expect(requestBody.events[0].session_id).toBeTruthy();
    });
  });

  describe("Affiliate URL Decoration (appendOnyxSubId)", () => {
    it("should append subid1 parameter when journey token is set", () => {
      setJourneyToken("journey_xyz_777");

      const targetUrl = "https://www.pelikan.cz/cs/akcni-letenky?a_aid=levne-letenky";
      const decorated = appendOnyxSubId(targetUrl);

      expect(decorated).toContain("subid1=journey_xyz_777");
    });

    it("should not modify target URL if no journey token is present", () => {
      const targetUrl = "https://www.pelikan.cz/cs/akcni-letenky?a_aid=levne-letenky";
      const decorated = appendOnyxSubId(targetUrl);

      expect(decorated).toBe(targetUrl);
    });

    it("should handle internal /redirect links and decorate inner url parameter", () => {
      setJourneyToken("journey_xyz_777");

      const targetUrl = "/redirect?url=" + encodeURIComponent("https://www.pelikan.cz/cs/akcni-letenky");
      const decorated = appendOnyxSubId(targetUrl);

      expect(decorated).toContain("subid1=journey_xyz_777");
    });
  });

  describe("Affiliate Redirect Tracking (trackAffiliateRedirect)", () => {
    it("should send affiliate_redirect event to LeadOS API", async () => {
      setJourneyToken("journey_xyz_888");

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({ status: "ok" }),
      } as Response);

      const targetUrl = "https://www.pelikan.cz/cs/akcni-letenky?a_aid=levne-letenky&subid1=journey_xyz_888";
      trackAffiliateRedirect(targetUrl);

      expect(fetchSpy).toHaveBeenCalledWith(
        "https://leados.cz/api/travel/events",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "x-project-key": expect.any(String),
          }),
          body: expect.stringContaining("affiliate_redirect"),
        })
      );

      const requestBody = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string);
      expect(requestBody.events[0]).toMatchObject({
        event_name: "affiliate_redirect",
        journey_token: "journey_xyz_888",
        target_url: targetUrl,
      });
    });
  });

  describe("Affiliate URL Identification (isAffiliateUrl)", () => {
    it("should recognize affiliate partner URLs", () => {
      expect(isAffiliateUrl("https://www.pelikan.cz/cs/akce")).toBe(true);
      expect(isAffiliateUrl("https://www.kiwi.com/cs/search")).toBe(true);
      expect(isAffiliateUrl("https://www.booking.com/searchresults")).toBe(true);
      expect(isAffiliateUrl("/redirect?url=xyz")).toBe(true);
      expect(isAffiliateUrl("https://akcni-letenky.com/dovolene")).toBe(false);
    });
  });
});
