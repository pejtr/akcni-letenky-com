/**
 * Meta (Facebook) Conversion API Client
 * 
 * Server-side tracking for Meta ads with event deduplication.
 * Complements browser-side Pixel tracking for maximum accuracy.
 * 
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api
 */

import crypto from "crypto";

interface MetaEvent {
  event_name: string;
  event_time: number;
  event_id?: string;
  event_source_url?: string;
  action_source: "website" | "email" | "app";
  user_data: {
    em?: string[]; // hashed email
    ph?: string[]; // hashed phone
    fn?: string[]; // hashed first name
    ln?: string[]; // hashed last name
    ge?: string[]; // hashed gender (m/f)
    db?: string[]; // hashed date of birth (YYYYMMDD)
    ct?: string[]; // hashed city
    st?: string[]; // hashed state/region
    zp?: string[]; // hashed zip/postal code
    country?: string[]; // hashed country code (ISO 3166-1 alpha-2)
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // Facebook click ID (_fbc cookie)
    fbp?: string; // Facebook browser ID (_fbp cookie)
    external_id?: string; // user ID from database
  };
  custom_data?: {
    currency?: string;
    value?: number;
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    content_type?: string;
    num_items?: number;
    search_string?: string;
    status?: string;
  };
}

interface MetaConversionApiResponse {
  events_received: number;
  messages: string[];
  fbtrace_id: string;
}

/**
 * Hash data for user_data fields (email, phone, name, etc.)
 * Meta requires SHA256 hashing for PII
 * 
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 */
function hashData(data: string): string {
  // Normalize: lowercase, trim whitespace, remove special characters for names
  const normalized = data.toLowerCase().trim();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Normalize and hash phone number
 * Remove spaces, dashes, parentheses, and leading zeros/plus signs
 */
function hashPhone(phone: string): string {
  const normalized = phone.replace(/[\s\-\(\)\+]/g, "").replace(/^0+/, "");
  return hashData(normalized);
}

/**
 * Extract Facebook cookies from request headers
 */
export function extractFacebookCookies(cookieHeader?: string): { fbp?: string; fbc?: string } {
  if (!cookieHeader) return {};
  
  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return {
    fbp: cookies._fbp,
    fbc: cookies._fbc,
  };
}

/**
 * Send event to Meta Conversion API
 */
export async function sendMetaEvent(event: Omit<MetaEvent, "event_time" | "action_source">): Promise<boolean> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSION_API_TOKEN;
  const testEventCode = process.env.META_TEST_EVENT_CODE;

  if (!pixelId || !accessToken) {
    console.warn("[Meta Conversion API] Pixel ID or Access Token not configured");
    return false;
  }

  const fullEvent: MetaEvent = {
    ...event,
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
  };

  const payload = {
    data: [fullEvent],
    test_event_code: testEventCode || undefined,
  };

  try {
    const url = `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Meta Conversion API] Error:", error);
      return false;
    }

    const result: MetaConversionApiResponse = await response.json();
    console.log(`[Meta Conversion API] Event sent: ${event.event_name}`, {
      events_received: result.events_received,
      fbtrace_id: result.fbtrace_id,
    });

    return true;
  } catch (error) {
    console.error("[Meta Conversion API] Failed to send event:", error);
    return false;
  }
}

/**
 * Common user data parameters for all events
 */
interface UserDataParams {
  userEmail?: string;
  userPhone?: string;
  userFirstName?: string;
  userLastName?: string;
  userGender?: "m" | "f";
  userDateOfBirth?: string; // YYYY-MM-DD
  userCity?: string;
  userState?: string;
  userZip?: string;
  userCountry?: string; // ISO 3166-1 alpha-2 (e.g., "CZ")
  userId?: string;
  clientIp?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
}

/**
 * Build user_data object from params
 */
function buildUserData(params: UserDataParams) {
  return {
    em: params.userEmail ? [hashData(params.userEmail)] : undefined,
    ph: params.userPhone ? [hashPhone(params.userPhone)] : undefined,
    fn: params.userFirstName ? [hashData(params.userFirstName)] : undefined,
    ln: params.userLastName ? [hashData(params.userLastName)] : undefined,
    ge: params.userGender ? [hashData(params.userGender)] : undefined,
    db: params.userDateOfBirth ? [hashData(params.userDateOfBirth.replace(/-/g, ""))] : undefined,
    ct: params.userCity ? [hashData(params.userCity)] : undefined,
    st: params.userState ? [hashData(params.userState)] : undefined,
    zp: params.userZip ? [hashData(params.userZip)] : undefined,
    country: params.userCountry ? [hashData(params.userCountry.toLowerCase())] : undefined,
    external_id: params.userId,
    client_ip_address: params.clientIp,
    client_user_agent: params.userAgent,
    fbp: params.fbp,
    fbc: params.fbc,
  };
}

/**
 * Track ViewContent event (flight/vacation detail view)
 */
export async function trackViewContent(params: {
  contentId: string;
  contentName: string;
  contentType: "flight" | "vacation";
  value: number;
  currency: string;
  eventId?: string;
  eventSourceUrl?: string;
} & UserDataParams) {
  return sendMetaEvent({
    event_name: "ViewContent",
    event_id: params.eventId,
    event_source_url: params.eventSourceUrl,
    user_data: buildUserData(params),
    custom_data: {
      content_ids: [params.contentId],
      content_name: params.contentName,
      content_type: params.contentType,
      value: params.value,
      currency: params.currency,
    },
  });
}

/**
 * Track Search event
 */
export async function trackSearch(params: {
  searchString: string;
  eventId?: string;
  eventSourceUrl?: string;
} & UserDataParams) {
  return sendMetaEvent({
    event_name: "Search",
    event_id: params.eventId,
    event_source_url: params.eventSourceUrl,
    user_data: buildUserData(params),
    custom_data: {
      search_string: params.searchString,
    },
  });
}

/**
 * Track AddToWishlist event
 */
export async function trackAddToWishlist(params: {
  contentId: string;
  contentName: string;
  contentType: "flight" | "vacation";
  value: number;
  currency: string;
  eventId?: string;
  eventSourceUrl?: string;
} & UserDataParams) {
  return sendMetaEvent({
    event_name: "AddToWishlist",
    event_id: params.eventId,
    event_source_url: params.eventSourceUrl,
    user_data: buildUserData(params),
    custom_data: {
      content_ids: [params.contentId],
      content_name: params.contentName,
      content_type: params.contentType,
      value: params.value,
      currency: params.currency,
    },
  });
}

/**
 * Track Lead event (newsletter subscription, price alert)
 */
export async function trackLead(params: {
  contentName: string;
  value?: number;
  currency?: string;
  eventId?: string;
  eventSourceUrl?: string;
} & UserDataParams) {
  return sendMetaEvent({
    event_name: "Lead",
    event_id: params.eventId,
    event_source_url: params.eventSourceUrl,
    user_data: buildUserData(params),
    custom_data: {
      content_name: params.contentName,
      value: params.value,
      currency: params.currency || "CZK",
    },
  });
}

/**
 * Track InitiateCheckout event (affiliate link click)
 */
export async function trackInitiateCheckout(params: {
  contentId: string;
  contentName: string;
  contentType: "flight" | "vacation";
  value: number;
  currency: string;
  eventId?: string;
  eventSourceUrl?: string;
} & UserDataParams) {
  return sendMetaEvent({
    event_name: "InitiateCheckout",
    event_id: params.eventId,
    event_source_url: params.eventSourceUrl,
    user_data: buildUserData(params),
    custom_data: {
      content_ids: [params.contentId],
      content_name: params.contentName,
      content_type: params.contentType,
      value: params.value,
      currency: params.currency,
      num_items: 1,
    },
  });
}

/**
 * Track Contact event (chatbot interaction)
 */
export async function trackContact(params: {
  eventId?: string;
  eventSourceUrl?: string;
} & UserDataParams) {
  return sendMetaEvent({
    event_name: "Contact",
    event_id: params.eventId,
    event_source_url: params.eventSourceUrl,
    user_data: buildUserData(params),
  });
}

/**
 * Track CompleteRegistration event (user signup)
 */
export async function trackCompleteRegistration(params: {
  eventId?: string;
  eventSourceUrl?: string;
} & UserDataParams) {
  return sendMetaEvent({
    event_name: "CompleteRegistration",
    event_id: params.eventId,
    event_source_url: params.eventSourceUrl,
    user_data: buildUserData(params),
    custom_data: {
      status: "completed",
    },
  });
}
