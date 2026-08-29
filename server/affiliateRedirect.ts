import { Express, Request, Response } from "express";
import { getDb } from "./db";
import { flightProviderOffers } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const ALLOWED_DESTINATION_HOSTNAMES = new Set([
  "www.pelikan.cz",
  "pelikan.cz",
]);

function isAllowedHostname(targetUrl: string): boolean {
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_DESTINATION_HOSTNAMES.has(hostname);
  } catch {
    return false;
  }
}

export function registerAffiliateRedirects(app: Express) {
  app.get("/r/flights/:offerId", async (req: Request, res: Response) => {
    try {
      const offerId = req.params.offerId;
      const clickId = randomUUID();
      const occurredAt = new Date().toISOString();
      const sourcePage = (req.query.sourcePage as string) || (req.get("referer") || "direct");
      const placement = (req.query.placement as string) || "deals_grid";
      const journeyId = (req.query.journeyId as string) || (req.cookies?.onyx_journey_token || null);

      console.log(`[AffiliateRedirect] Click recorded: clickId=${clickId}, offerId=${offerId}, placement=${placement}, sourcePage=${sourcePage}, journeyId=${journeyId}, time=${occurredAt}`);

      const db = await getDb();
      if (!db) {
        return res.redirect(302, "/levne-letenky?error=db_unavailable");
      }

      const rows = await db
        .select()
        .from(flightProviderOffers)
        .where(eq(flightProviderOffers.id, offerId))
        .limit(1);
      const offer = rows[0];

      if (!offer || !offer.deeplink) {
        console.warn(`[AffiliateRedirect] Offer not found: ${offerId}`);
        return res.redirect(302, "/levne-letenky?error=offer_not_found");
      }

      if (!isAllowedHostname(offer.deeplink)) {
        console.error(`[AffiliateRedirect] Blocked unsafe redirect to non-allowlisted host: ${offer.deeplink}`);
        return res.status(400).send("Invalid or untrusted redirect destination.");
      }

      // Build decorated affiliate URL with confirmed Pelikán affiliate parameters
      const pelikanAid = process.env.PELIKAN_AFFILIATE_ID || "levne-letenky";
      let targetUrl = offer.deeplink;
      try {
        const urlObj = new URL(targetUrl);
        // Preserve all original path/query params and attach approved tracking:
        urlObj.searchParams.set("a_aid", pelikanAid);
        urlObj.searchParams.set("utm_source", "akcni-letenky");
        urlObj.searchParams.set("utm_medium", "affiliate");
        urlObj.searchParams.set("utm_campaign", "flight-deals");
        urlObj.searchParams.set("utm_content", offerId);
        urlObj.searchParams.set("click_id", clickId);
        if (journeyId) {
          urlObj.searchParams.set("subid1", journeyId);
        }
        targetUrl = urlObj.toString();
      } catch {
        // use raw deeplink if URL constructor fails
      }

      // Send Authoritative Server-side LeadOS affiliate_redirect Event
      const leadosEndpoint = process.env.LEADOS_API_ENDPOINT || "https://leados.cz/api/travel/events";
      const leadosProjectKey = process.env.LEADOS_PROJECT_KEY || process.env.VITE_LEADOS_PROJECT_KEY || "akcni-letenky-com";
      
      try {
        fetch(leadosEndpoint, {
          method: "POST",
          headers: {
            "x-project-key": leadosProjectKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            events: [
              {
                timestamp: occurredAt,
                event_name: "affiliate_redirect",
                click_id: clickId,
                offer_id: offerId,
                provider: offer.provider,
                origin: offer.origin,
                destination: offer.destination,
                price: offer.price,
                currency: offer.currency,
                target_url: targetUrl,
                source_page: sourcePage,
                placement: placement,
                journey_token: journeyId || "",
              }
            ]
          }),
        }).catch((err) => {
          console.warn("[AffiliateRedirect] LeadOS Server Event dispatch error:", err);
        });
      } catch (err) {
        console.warn("[AffiliateRedirect] Failed to dispatch LeadOS event:", err);
      }

      return res.redirect(302, targetUrl);
    } catch (error) {
      console.error("[AffiliateRedirect] Unexpected error:", error);
      return res.redirect(302, "/levne-letenky");
    }
  });
}
