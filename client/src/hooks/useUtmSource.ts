/**
 * UTM Source Detection Hook
 * 
 * Detects UTM parameters from URL and stores them in sessionStorage
 * for persistent personalization throughout the visit.
 * Primarily used for Facebook campaign visitors.
 */

import { useState, useEffect } from "react";

export interface UtmData {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
}

const UTM_STORAGE_KEY = "utm_data";

/**
 * Parse UTM parameters from current URL
 */
function parseUtmFromUrl(): UtmData {
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      source: params.get("utm_source"),
      medium: params.get("utm_medium"),
      campaign: params.get("utm_campaign"),
      content: params.get("utm_content"),
      term: params.get("utm_term"),
    };
  } catch {
    return { source: null, medium: null, campaign: null, content: null, term: null };
  }
}

/**
 * Store UTM data in sessionStorage for persistence
 */
function storeUtmData(data: UtmData): void {
  try {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

/**
 * Retrieve stored UTM data from sessionStorage
 */
function getStoredUtmData(): UtmData | null {
  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return null;
}

/**
 * Hook to detect and persist UTM source data
 * Returns UTM data and helper booleans for common sources
 */
export function useUtmSource() {
  const [utmData, setUtmData] = useState<UtmData>({
    source: null,
    medium: null,
    campaign: null,
    content: null,
    term: null,
  });

  useEffect(() => {
    // First check URL for fresh UTM params
    const urlUtm = parseUtmFromUrl();
    
    if (urlUtm.source) {
      // Fresh UTM params in URL - store and use them
      storeUtmData(urlUtm);
      setUtmData(urlUtm);
    } else {
      // No UTM in URL - check sessionStorage for previous visit data
      const stored = getStoredUtmData();
      if (stored) {
        setUtmData(stored);
      }
    }
  }, []);

  const isFromFacebook = utmData.source === "facebook" || utmData.source === "fb" || utmData.source === "ig" || utmData.source === "instagram";
  const isFromGoogle = utmData.source === "google" || utmData.source === "google_ads";
  const isFromEmail = utmData.medium === "email";
  const hasCampaign = !!utmData.campaign;

  return {
    utmData,
    isFromFacebook,
    isFromGoogle,
    isFromEmail,
    hasCampaign,
    campaignName: utmData.campaign,
  };
}

/**
 * Get a personalized campaign message based on UTM data
 */
export function getCampaignMessage(utmData: UtmData): string {
  const campaign = utmData.campaign?.toLowerCase() || "";
  
  // Map campaign names to Czech messages
  if (campaign.includes("leto") || campaign.includes("summer")) {
    return "🌴 Exkluzivní letní nabídka z Facebooku: Letenky se slevou až 40 %!";
  }
  if (campaign.includes("zima") || campaign.includes("winter")) {
    return "❄️ Speciální zimní akce z Facebooku: Letenky od 990 Kč!";
  }
  if (campaign.includes("valentyn") || campaign.includes("valentine")) {
    return "💕 Valentýnská nabídka z Facebooku: Romantické destinace se slevou!";
  }
  if (campaign.includes("vikend") || campaign.includes("weekend")) {
    return "✈️ Víkendová akce z Facebooku: Eurovíkendy od 1 290 Kč!";
  }
  if (campaign.includes("last") || campaign.includes("minute")) {
    return "🔥 Last Minute z Facebooku: Zbývá jen pár míst za tuto cenu!";
  }
  if (campaign.includes("more") || campaign.includes("beach") || campaign.includes("plaz")) {
    return "🏖️ Plážová nabídka z Facebooku: Letenky k moři od 1 490 Kč!";
  }
  
  // Default Facebook message
  return "🎯 Speciální nabídka pro návštěvníky z Facebooku: Letenky se slevou!";
}
