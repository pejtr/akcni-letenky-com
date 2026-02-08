import { useState, useEffect, useCallback } from "react";
import { X, Shield, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "gdpr_consent";
const CONSENT_ANALYTICS_KEY = "gdpr_analytics";
const CONSENT_MARKETING_KEY = "gdpr_marketing";

interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

/**
 * Loads Facebook Pixel script dynamically after user consent.
 * Replace FB_PIXEL_ID with your actual Pixel ID.
 */
function loadFacebookPixel() {
  const pixelId = (window as any).__FB_PIXEL_ID;
  if (!pixelId || (window as any).fbq) return;

  // Facebook Pixel base code
  const f = window as any;
  const b = document;
  const e = "script";
  
  f.fbq = function () {
    f.fbq.callMethod ? f.fbq.callMethod.apply(f.fbq, arguments) : f.fbq.queue.push(arguments);
  };
  if (!f._fbq) f._fbq = f.fbq;
  f.fbq.push = f.fbq;
  f.fbq.loaded = true;
  f.fbq.version = "2.0";
  f.fbq.queue = [];
  
  const n = b.createElement(e) as HTMLScriptElement;
  n.async = true;
  n.src = "https://connect.facebook.net/en_US/fbevents.js";
  const s = b.getElementsByTagName(e)[0];
  s?.parentNode?.insertBefore(n, s);
  
  f.fbq("init", pixelId);
  f.fbq("track", "PageView");
}

/**
 * Loads Google Analytics script dynamically after user consent.
 */
function loadGoogleAnalytics() {
  const gaId = (window as any).__GA_ID;
  if (!gaId || (window as any).gtag) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).gtag = function () {
    (window as any).dataLayer.push(arguments);
  };
  (window as any).gtag("js", new Date());
  (window as any).gtag("config", gaId);
}

function getStoredConsent(): ConsentState | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function storeConsent(consent: ConsentState) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  localStorage.setItem(CONSENT_ANALYTICS_KEY, consent.analytics ? "true" : "false");
  localStorage.setItem(CONSENT_MARKETING_KEY, consent.marketing ? "true" : "false");
}

export default function GdprConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      // Already consented — load scripts based on stored preferences
      if (stored.analytics) loadGoogleAnalytics();
      if (stored.marketing) loadFacebookPixel();
      return;
    }
    // Show banner after a short delay for better UX
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAcceptAll = useCallback(() => {
    const consent: ConsentState = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    };
    storeConsent(consent);
    loadGoogleAnalytics();
    loadFacebookPixel();
    setVisible(false);
  }, []);

  const handleAcceptSelected = useCallback(() => {
    const consent: ConsentState = {
      necessary: true,
      analytics,
      marketing,
      timestamp: Date.now(),
    };
    storeConsent(consent);
    if (analytics) loadGoogleAnalytics();
    if (marketing) loadFacebookPixel();
    setVisible(false);
  }, [analytics, marketing]);

  const handleRejectAll = useCallback(() => {
    const consent: ConsentState = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    };
    storeConsent(consent);
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Main banner */}
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Cookie className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg mb-1">
                Používáme cookies 🍪
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Používáme cookies pro zlepšení vašeho zážitku, analýzu návštěvnosti a personalizaci reklam. 
                Kliknutím na "Přijmout vše" souhlasíte s použitím všech cookies. Můžete si také vybrat, 
                které kategorie cookies chcete povolit.
              </p>
            </div>
            <button
              onClick={handleRejectAll}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Zavřít"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Details toggle */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t space-y-3">
              <label className="flex items-center gap-3 cursor-not-allowed opacity-70">
                <input type="checkbox" checked disabled className="w-4 h-4 rounded" />
                <div>
                  <span className="font-medium text-sm text-gray-900">Nezbytné cookies</span>
                  <p className="text-xs text-gray-500">Nutné pro fungování webu. Nelze vypnout.</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <div>
                  <span className="font-medium text-sm text-gray-900">Analytické cookies</span>
                  <p className="text-xs text-gray-500">Pomáhají nám porozumět, jak web používáte (Google Analytics).</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <div>
                  <span className="font-medium text-sm text-gray-900">Marketingové cookies</span>
                  <p className="text-xs text-gray-500">Umožňují personalizované reklamy (Facebook Pixel, Google Ads).</p>
                </div>
              </label>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Button
              onClick={handleAcceptAll}
              className="bg-[#E91E63] hover:bg-[#C2185B] text-white font-semibold px-6"
            >
              Přijmout vše
            </Button>
            {showDetails ? (
              <Button
                onClick={handleAcceptSelected}
                variant="outline"
                className="font-semibold"
              >
                Uložit výběr
              </Button>
            ) : (
              <Button
                onClick={() => setShowDetails(true)}
                variant="outline"
                className="font-semibold"
              >
                Nastavení cookies
              </Button>
            )}
            <button
              onClick={handleRejectAll}
              className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
            >
              Odmítnout vše
            </button>
            <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
              <Shield className="w-3 h-3" />
              GDPR
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
