import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Plane, ExternalLink } from "lucide-react";
import { appendOnyxSubId, trackAffiliateRedirect } from "@/lib/leadosTracking";

export default function Redirect() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(3);
  const trackedRef = useRef(false);

  useEffect(() => {
    // Get target URL from query params
    const params = new URLSearchParams(window.location.search);
    const rawTargetUrl = params.get("url");
    const destination = params.get("dest") || "prodejce";

    if (!rawTargetUrl) {
      // If no URL provided, redirect to homepage
      setLocation("/");
      return;
    }

    const decoded = decodeURIComponent(rawTargetUrl);
    const finalTargetUrl = appendOnyxSubId(decoded);

    // Track LeadOS affiliate redirect event once
    if (!trackedRef.current) {
      trackedRef.current = true;
      trackAffiliateRedirect(finalTargetUrl);
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to target URL
          window.location.href = finalTargetUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003087] via-[#0047AB] to-[#001f5c] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Animated Plane Icon */}
        <div className="mb-6 relative">
          <div className="inline-block animate-bounce">
            <Plane className="w-16 h-16 text-[#E91E63] mx-auto" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-[#E91E63]/20 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Přesměrováváme vás...
        </h1>
        
        {/* Description */}
        <p className="text-gray-600 mb-6">
          Za chvíli budete přesměrováni na web našeho partnera, kde dokončíte rezervaci.
        </p>

        {/* Countdown */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FFD700] to-[#FFC107] rounded-full text-[#003087] text-3xl font-bold shadow-lg">
            {countdown}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-left text-sm text-gray-700">
              <p className="font-semibold text-blue-900 mb-1">
                Opouštíte AKČNÍ-LETENKY.com
              </p>
              <p>
                Budete přesměrováni na web Pelikán.cz, kde najdete aktuální nabídku letů a dokončíte rezervaci.
              </p>
            </div>
          </div>
        </div>

        {/* Loading Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#E91E63] to-[#C2185B] transition-all duration-1000 ease-linear"
            style={{ width: `${((3 - countdown) / 3) * 100}%` }}
          ></div>
        </div>

        {/* Fine Print */}
        <p className="text-xs text-gray-500 mt-4">
          Pokud nejste přesměrováni automaticky, klikněte na tlačítko níže.
        </p>
      </div>
    </div>
  );
}
