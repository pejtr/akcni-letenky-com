/**
 * Exit-Intent Popup Component (Enhanced)
 * 
 * Personalized exit-intent popup that:
 * 1. Shows exclusive discounts based on browsed destinations
 * 2. Adapts messaging based on CTA A/B test variant user saw
 * 3. Includes urgency timer, email capture, and WhatsApp CTA
 * 4. Tracks popup interactions for analytics
 */

import * as React from "react";
import { X, MessageCircle, Plane, Clock, Gift, Sparkles, Tag, ArrowRight } from "lucide-react";
import { pelikanDeepLink } from "@shared/affiliateLinks";
import { Button } from "@/components/ui/button";
import { useViewedDestinations } from "@/hooks/useViewedDestinations";
import { generateOmioReferralLink, trackOmioClick } from "@/lib/omioAffiliate";
import { Train } from "lucide-react";
import { getLastCtaInteraction } from "@/hooks/useCtaAbTest";
import { trackEvent } from "@/lib/abTest";
import { trpc } from "@/lib/trpc";
import SpinWheel from "./SpinWheel";

interface ExitIntentPopupProps {
  whatsappLink?: string;
}

// Personalized headlines based on CTA interaction and browsing
function getPersonalizedHeadline(
  lastCta: ReturnType<typeof getLastCtaInteraction>,
  hasDestinations: boolean,
  topDestination?: string
): { title: string; subtitle: string; emoji: string } {
  // If user interacted with a CTA, personalize based on that
  if (lastCta) {
    switch (lastCta.position) {
      case "hero":
        return {
          title: "Počkejte! Vaše vyhledávání není ztraceno",
          subtitle: hasDestinations
            ? `Máme exkluzivní slevu na ${topDestination} jen pro vás!`
            : "Získejte 15% slevu na první vyhledávání!",
          emoji: "🔍",
        };
      case "featured":
        return {
          title: "Ta nabídka na vás stále čeká!",
          subtitle: hasDestinations
            ? `${topDestination} za ještě lepší cenu – jen dalších 10 minut!`
            : "Exkluzivní sleva na vybranou destinaci",
          emoji: "🔥",
        };
      case "sticky_banner":
        return {
          title: "Akční ceny jsou téměř vyprodané!",
          subtitle: hasDestinations
            ? `Zbývají poslední 3 místa na ${topDestination}`
            : "Letenky do 1 500 Kč – zbývá jen pár míst",
          emoji: "⚡",
        };
      default:
        break;
    }
  }

  // Default personalization based on browsing
  if (hasDestinations && topDestination) {
    return {
      title: `Nechcete ${topDestination} za skvělou cenu?`,
      subtitle: "Máme pro vás exkluzivní slevu, která platí jen 15 minut!",
      emoji: "✈️",
    };
  }

  return {
    title: "Počkejte! Máme pro vás speciální nabídku",
    subtitle: "Získejte exkluzivní slevu až 60% na vybrané destinace",
    emoji: "🎁",
  };
}

// Countdown timer component
function CountdownTimer() {
  const [seconds, setSeconds] = React.useState(15 * 60); // 15 minutes

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="flex items-center justify-center gap-3 font-mono">
      <div className="bg-red-600 text-white rounded-lg px-3 py-2 min-w-[60px] text-center">
        <span className="text-2xl font-bold">{String(mins).padStart(2, "0")}</span>
        <p className="text-[10px] uppercase tracking-wider">min</p>
      </div>
      <span className="text-red-600 text-2xl font-bold animate-pulse">:</span>
      <div className="bg-red-600 text-white rounded-lg px-3 py-2 min-w-[60px] text-center">
        <span className="text-2xl font-bold">{String(secs).padStart(2, "0")}</span>
        <p className="text-[10px] uppercase tracking-wider">sek</p>
      </div>
    </div>
  );
}

export default function ExitIntentPopup({
  whatsappLink = "https://chat.whatsapp.com/KG1IqrQclfY6NOgkmgs6ml"
}: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasShown, setHasShown] = React.useState(false);

  // Get personalized offers based on browsing history
  const { viewedDestinations, getPersonalizedOffers, getPersonalizedMessage } = useViewedDestinations();
  const personalizedOffers = getPersonalizedOffers();

  // Get CTA interaction context
  const lastCta = React.useMemo(() => getLastCtaInteraction(), []);

  // Personalized headline
  const topDestination = viewedDestinations.length > 0 ? viewedDestinations[0].name : undefined;
  const headline = React.useMemo(
    () => getPersonalizedHeadline(lastCta, viewedDestinations.length > 0, topDestination),
    [lastCta, viewedDestinations.length, topDestination]
  );

  React.useEffect(() => {
    // Check if already shown in this session
    const shown = sessionStorage.getItem("exit_popup_shown");
    if (shown) {
      setHasShown(true);
      return;
    }

    let timeOnPage = 0;
    const MIN_TIME_ON_PAGE = 10000; // 10 seconds

    // Track time on page
    const timeInterval = setInterval(() => {
      timeOnPage += 1000;
    }, 1000);

    // Desktop: Mouse leaving viewport
    const handleMouseLeave = (e: MouseEvent) => {
      if (
        e.clientY <= 0 &&
        timeOnPage >= MIN_TIME_ON_PAGE &&
        !hasShown
      ) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem("exit_popup_shown", "true");
        trackEvent("exit_intent", "popup_shown", {
          hasDestinations: viewedDestinations.length > 0,
          lastCta: lastCta?.position || "none",
          topDestination: topDestination || "none",
        }).catch(() => { });
      }
    };

    // Mobile: Back button detection (beforeunload)
    const handleBeforeUnload = () => {
      if (timeOnPage >= MIN_TIME_ON_PAGE && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem("exit_popup_shown", "true");
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(timeInterval);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasShown, viewedDestinations.length, lastCta, topDestination]);

  const handleClose = () => {
    setIsVisible(false);
    trackEvent("exit_intent", "popup_closed", {}).catch(() => { });
  };

  const handleOfferClick = (destination: string) => {
    trackEvent("exit_intent", "offer_clicked", {
      destination,
      lastCta: lastCta?.position || "none",
    }).catch(() => { });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-50 animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-in zoom-in-95 duration-300 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Header - Personalized */}
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white p-8 text-center rounded-t-2xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-2 left-4 text-6xl">✈️</div>
              <div className="absolute bottom-2 right-4 text-6xl">🌍</div>
              <div className="absolute top-1/2 left-1/4 text-4xl">☀️</div>
            </div>

            <div className="relative z-10">
              <span className="text-5xl mb-4 block">{headline.emoji}</span>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {headline.title}
              </h2>
              <p className="text-lg text-white/90">
                {headline.subtitle}
              </p>
            </div>
          </div>

          {/* Urgency Timer */}
          <div className="bg-red-50 border-b-2 border-red-200 p-4">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>Nabídka vyprší za:</span>
              </div>
              <CountdownTimer />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Exclusive Discount Badge */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg flex items-center gap-2">
                <Gift className="w-5 h-5" />
                EXKLUZIVNÍ SLEVA 15%
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            {/* Personalized Deals */}
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Tag className="w-5 h-5 text-orange-500" />
              {viewedDestinations.length > 0
                ? "Nabídky na základě vašeho prohlížení:"
                : "Nejlepší nabídky pro vás:"}
            </h3>
            <div className="space-y-3 mb-6">
              {personalizedOffers.map((deal, index) => (
                <a
                  key={index}
                  href={pelikanDeepLink("/cs/akcni-letenky", {
                    campaign: "exit-popup",
                    channel: "exit-intent",
                    content: deal.slug || deal.destination,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-3 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:shadow-lg transition-all group relative overflow-hidden"
                  onClick={() => handleOfferClick(deal.destination)}
                >
                  {/* Discount ribbon */}
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    {deal.discount}
                  </div>

                  <img
                    src={deal.image}
                    alt={deal.destination}
                    className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base group-hover:text-orange-500 transition-colors">
                      {deal.destination}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through text-sm">
                        {deal.originalPrice} Kč
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">od</p>
                    <p className="text-xl md:text-2xl font-bold text-orange-500">
                      {deal.price} Kč
                    </p>
                    <ArrowRight className="w-4 h-4 text-orange-400 ml-auto mt-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              ))}
            </div>

            {/* Omio Alternative - Trains & Buses */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-3 mb-3">
                <Train className="w-7 h-7 text-blue-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Raději vlakem nebo autobusem?</h4>
                  <p className="text-xs text-gray-600">
                    Pohodlné cestování po Evropě s Omio
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  trackOmioClick("exit-intent", "all", "exit_popup");
                  window.open(generateOmioReferralLink(), "_blank", "noopener,noreferrer");
                }}
                className="w-full"
              >
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5">
                  <Train className="w-4 h-4 mr-2" />
                  Vyhledat vlaky & autobusy
                </Button>
              </button>
            </div>



            {/* Gamified Email Capture */}
            <div className="border-t pt-5">
              <SpinWheel
                whatsappLink={whatsappLink}
                onWin={(code) => {
                  trackEvent("exit_intent", "spin_wheel_won", { code }).catch(() => { });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
