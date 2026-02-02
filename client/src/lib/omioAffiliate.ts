/**
 * Omio (Travelpayouts) Affiliate Link Helper
 * 
 * Generates affiliate tracking links for Omio train, bus, and ferry bookings
 * Commission: 6% of booking amount
 * Cookie lifetime: 30 days
 * 
 * Referral Program: New users get 10€ bonus when signing up via referral link
 * Referral link: https://go-refer.omio.com/TlcvMj
 * Referral code: petrm3l4d5h0x
 */

// Omio referral link for new users (10€ bonus)
const OMIO_REFERRAL_URL = "https://go-refer.omio.com/TlcvMj";
const OMIO_REFERRAL_CODE = "petrm3l4d5h0x";

// Omio affiliate parameters from Travelpayouts
const OMIO_BASE_URL = "https://tp.media/r";
const OMIO_MARKER = "155221";
const OMIO_TRS = "89558";
const OMIO_P = "2078";
const OMIO_CAMPAIGN_ID = "91";

export interface OmioSearchParams {
  from?: string;
  to?: string;
  departureDate?: string;
  passengers?: number;
  transportType?: "train" | "bus" | "ferry" | "all";
}

/**
 * Generate Omio referral link for new users (10€ bonus)
 * Use this for first-time user acquisition campaigns
 */
export function generateOmioReferralLink(): string {
  return OMIO_REFERRAL_URL;
}

/**
 * Get Omio referral code for manual entry
 */
export function getOmioReferralCode(): string {
  return OMIO_REFERRAL_CODE;
}

/**
 * Generate Omio affiliate link with tracking parameters
 * For existing users or direct search links
 */
export function generateOmioLink(params?: OmioSearchParams): string {
  // Base Omio URL with affiliate parameters
  let omioUrl = "https://omio.com";
  
  // Add search parameters if provided
  if (params) {
    const searchParams = new URLSearchParams();
    
    if (params.from) {
      searchParams.append("from", params.from);
    }
    if (params.to) {
      searchParams.append("to", params.to);
    }
    if (params.departureDate) {
      searchParams.append("departureDate", params.departureDate);
    }
    if (params.passengers) {
      searchParams.append("passengers", params.passengers.toString());
    }
    if (params.transportType && params.transportType !== "all") {
      searchParams.append("transportType", params.transportType);
    }
    
    const queryString = searchParams.toString();
    if (queryString) {
      omioUrl += `?${queryString}`;
    }
  }
  
  // Encode the Omio URL for the affiliate redirect
  const encodedUrl = encodeURIComponent(omioUrl);
  
  // Build final affiliate tracking URL
  const affiliateUrl = `${OMIO_BASE_URL}?marker=${OMIO_MARKER}&trs=${OMIO_TRS}&p=${OMIO_P}&u=${encodedUrl}&campaign_id=${OMIO_CAMPAIGN_ID}`;
  
  return affiliateUrl;
}

/**
 * Generate Omio link for specific route
 */
export function generateOmioRouteLink(from: string, to: string, date?: string): string {
  return generateOmioLink({
    from,
    to,
    departureDate: date,
    passengers: 1,
  });
}

/**
 * Generate Omio link for specific transport type
 */
export function generateOmioTransportLink(transportType: "train" | "bus" | "ferry"): string {
  return generateOmioLink({
    transportType,
  });
}

/**
 * Track Omio affiliate click (to be called before redirect)
 */
export async function trackOmioClick(
  destination: string,
  transportType: string = "all",
  source: string = "homepage"
): Promise<void> {
  try {
    // This will be connected to tRPC endpoint later
    console.log("[Omio] Tracking click:", { destination, transportType, source });
    
    // Store in localStorage for analytics
    const clicks = JSON.parse(localStorage.getItem("omio_clicks") || "[]");
    clicks.push({
      destination,
      transportType,
      source,
      timestamp: Date.now(),
    });
    
    // Keep only last 100 clicks
    if (clicks.length > 100) {
      clicks.shift();
    }
    
    localStorage.setItem("omio_clicks", JSON.stringify(clicks));
  } catch (error) {
    console.error("[Omio] Failed to track click:", error);
  }
}

/**
 * Get popular Omio routes for Czech travelers
 */
export const POPULAR_OMIO_ROUTES = [
  {
    from: "Prague",
    to: "Vienna",
    fromCs: "Praha",
    toCs: "Vídeň",
    duration: "4h",
    price: "od 399 Kč",
    transportType: "train" as const,
  },
  {
    from: "Prague",
    to: "Munich",
    fromCs: "Praha",
    toCs: "Mnichov",
    duration: "5h 30m",
    price: "od 599 Kč",
    transportType: "bus" as const,
  },
  {
    from: "Prague",
    to: "Berlin",
    fromCs: "Praha",
    toCs: "Berlín",
    duration: "4h 30m",
    price: "od 499 Kč",
    transportType: "bus" as const,
  },
  {
    from: "Prague",
    to: "Budapest",
    fromCs: "Praha",
    toCs: "Budapešť",
    duration: "6h 45m",
    price: "od 699 Kč",
    transportType: "train" as const,
  },
  {
    from: "Brno",
    to: "Vienna",
    fromCs: "Brno",
    toCs: "Vídeň",
    duration: "2h",
    price: "od 299 Kč",
    transportType: "train" as const,
  },
  {
    from: "Prague",
    to: "Krakow",
    fromCs: "Praha",
    toCs: "Krakov",
    duration: "7h",
    price: "od 799 Kč",
    transportType: "bus" as const,
  },
];
