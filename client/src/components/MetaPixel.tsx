import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { hasMarketingConsent, readConsent, subscribeConsent } from "@/lib/consent";

function generateEventId() { return `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`; }
function getDeviceType(): "mobile" | "tablet" | "desktop" {
  const width = window.innerWidth;
  return width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop";
}
function initMetaPixel(pixelId: string) {
  if (typeof window === "undefined" || !pixelId || !hasMarketingConsent()) return;
  const win = window as any;
  if (!win.fbq) {
    const fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); } as any;
    win.fbq = fbq; if (!win._fbq) win._fbq = fbq; fbq.push = fbq; fbq.loaded = true; fbq.version = "2.0"; fbq.queue = [];
    const script = document.createElement("script"); script.async = true; script.src = "https://connect.facebook.net/en_US/fbevents.js"; document.head.appendChild(script);
  }
  win.fbq("consent", "grant");
  if (!win.__AKCNI_META_PIXEL_INITIALIZED__) { win.fbq("init", pixelId); win.__AKCNI_META_PIXEL_INITIALIZED__ = true; }
}
export function trackMetaEvent(eventName: string, parameters?: Record<string, unknown>, eventId?: string) {
  if (typeof window === "undefined" || !hasMarketingConsent() || !(window as any).fbq) return eventId;
  const id = eventId || generateEventId();
  (window as any).fbq("track", eventName, { ...parameters, device_type: getDeviceType(), viewport_width: window.innerWidth }, { eventID: id });
  return id;
}
export function trackMetaCustomEvent(eventName: string, parameters?: Record<string, unknown>, eventId?: string) {
  if (typeof window === "undefined" || !hasMarketingConsent() || !(window as any).fbq) return eventId;
  const id = eventId || generateEventId();
  (window as any).fbq("trackCustom", eventName, { ...parameters, device_type: getDeviceType(), viewport_width: window.innerWidth }, { eventID: id });
  return id;
}
export function trackAffiliateClick(destination: string, partner: string, price?: number, eventId?: string) { return trackMetaCustomEvent("AffiliateClick", { destination, partner, price, currency: "CZK" }, eventId); }
export function trackNewsletterSignup(variant?: string, eventId?: string) { return trackMetaEvent("Lead", { content_name: "Newsletter Signup", variant }, eventId); }
export function trackWishlistAdd(destination: string, price?: number, eventId?: string) { return trackMetaEvent("AddToWishlist", { content_name: destination, value: price, currency: "CZK" }, eventId); }
export function trackSearch(query: string, results?: number, eventId?: string) { return trackMetaEvent("Search", { search_string: query, num_results: results }, eventId); }
export function trackViewContent(destination: string, price?: number, category?: string, eventId?: string) { return trackMetaEvent("ViewContent", { content_name: destination, content_category: category, value: price, currency: "CZK" }, eventId); }
export function trackInitiateCheckout(destination: string, price: number, partner: string, eventId?: string) { return trackMetaEvent("InitiateCheckout", { content_name: destination, value: price, currency: "CZK", partner }, eventId); }

export default function MetaPixel() {
  const [location] = useLocation();
  const [allowed, setAllowed] = useState(readConsent()?.marketing === true);
  const { data: setting } = trpc.siteSettings.get.useQuery({ key: "fb_pixel_id" });
  const pixelId = setting?.value?.trim() || import.meta.env.VITE_META_PIXEL_ID?.trim() || "";

  useEffect(() => subscribeConsent((prefs) => {
    setAllowed(prefs?.marketing === true);
    if (prefs?.marketing !== true && (window as any).fbq) (window as any).fbq("consent", "revoke");
  }), []);

  useEffect(() => { if (allowed && pixelId) initMetaPixel(pixelId); }, [allowed, pixelId]);

  useEffect(() => {
    if (!allowed || !pixelId) return;
    initMetaPixel(pixelId);
    (window as any).fbq?.("track", "PageView", { device_type: getDeviceType(), viewport_width: window.innerWidth, page: location });
  }, [location, allowed, pixelId]);

  return null;
}
