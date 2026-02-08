/**
 * Facebook Campaign Banner
 * 
 * Personalized banner shown to visitors arriving from Facebook campaigns.
 * Detects UTM parameters and displays campaign-specific messaging
 * to increase relevance and conversion rates.
 */

import { useState } from "react";
import { X } from "lucide-react";
import { useUtmSource, getCampaignMessage } from "@/hooks/useUtmSource";
import { trackEvent } from "@/lib/abTest";

export default function FacebookCampaignBanner() {
  const { isFromFacebook, utmData, campaignName } = useUtmSource();
  const [dismissed, setDismissed] = useState(false);

  // Only show for Facebook visitors
  if (!isFromFacebook || dismissed) {
    return null;
  }

  const message = getCampaignMessage(utmData);

  const handleClick = () => {
    trackEvent("fb_campaign_banner", "banner_click", {
      campaign: campaignName,
      source: utmData.source,
    }).catch(() => {});
  };

  const handleDismiss = () => {
    setDismissed(true);
    trackEvent("fb_campaign_banner", "banner_dismiss", {
      campaign: campaignName,
      source: utmData.source,
    }).catch(() => {});
  };

  return (
    <div className="bg-gradient-to-r from-[#1877F2] to-[#0d65d9] text-white py-2.5 px-4 relative z-[60]">
      <div className="container flex items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          {/* Facebook icon */}
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <a 
            href="/levne-letenky" 
            className="text-sm md:text-base font-semibold hover:underline cursor-pointer"
            onClick={handleClick}
          >
            {message}
          </a>
        </div>
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1"
          aria-label="Zavřít banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
