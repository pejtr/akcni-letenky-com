/**
 * PriceCalendarWidget - Travelpayouts Aviasales Price Calendar Widget
 *
 * Displays a flight price calendar showing cheapest dates for a given route.
 * Uses Travelpayouts Aviasales Calendar Widget (marker=155221).
 *
 * Docs: https://support.travelpayouts.com/hc/en-us/articles/203912008
 */
import { useEffect, useRef, useState } from "react";
import { Calendar, TrendingDown, Loader2 } from "lucide-react";

interface PriceCalendarWidgetProps {
  /** IATA code of origin airport/city (default: PRG = Prague) */
  origin?: string;
  /** IATA code of destination airport/city (e.g. "CDG", "LHR", "BCN") */
  destination?: string;
  /** Currency code (default: CZK) */
  currency?: string;
  /** Locale/language (default: cs) */
  locale?: string;
  /** Widget width in px or "100%" (default: 100%) */
  width?: string | number;
  /** Show one-way prices only (default: false = round trip) */
  oneWay?: boolean;
  /** Show only direct flights (default: false) */
  onlyDirect?: boolean;
  /** Calendar period: "year" or "month" (default: "year") */
  period?: "year" | "month";
  /** Trip duration range in days, e.g. "7,14" (default: "7,14") */
  range?: string;
  /** Optional sub-ID for tracking (appended to marker) */
  subId?: string;
  /** Optional CSS class for the wrapper */
  className?: string;
  /** Destination display name for the heading */
  destinationName?: string;
}

const TRAVELPAYOUTS_MARKER = "155221";

export default function PriceCalendarWidget({
  origin = "PRG",
  destination = "",
  currency = "CZK",
  locale = "cs",
  width = "100%",
  oneWay = false,
  onlyDirect = false,
  period = "year",
  range = "7,14",
  subId,
  className = "",
  destinationName,
}: PriceCalendarWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any previously injected script
    containerRef.current.innerHTML = "";
    setIsLoading(true);
    setHasError(false);

    const marker = subId ? `${TRAVELPAYOUTS_MARKER}.${subId}` : TRAVELPAYOUTS_MARKER;

    const params = new URLSearchParams({
      marker,
      origin: origin.toUpperCase(),
      currency,
      locale,
      one_way: oneWay ? "true" : "false",
      only_direct: onlyDirect ? "true" : "false",
      period,
      range: encodeURIComponent(range),
      powered_by: "true",
      width: String(width),
    });

    if (destination) {
      params.set("destination", destination.toUpperCase());
    }

    const script = document.createElement("script");
    script.src = `//www.travelpayouts.com/calendar_widget/iframe.js?${params.toString()}`;
    script.charset = "utf-8";
    script.async = true;

    script.onload = () => {
      setIsLoading(false);
    };

    script.onerror = () => {
      setIsLoading(false);
      setHasError(true);
    };

    // Fallback: hide loading after 5s even if onload doesn't fire
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    containerRef.current.appendChild(script);

    return () => {
      clearTimeout(fallbackTimer);
    };
  }, [origin, destination, currency, locale, oneWay, onlyDirect, period, range, subId, width]);

  return (
    <div className={`w-full ${className}`}>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900">
            📅 Cenový kalendář{destinationName ? ` — ${destinationName}` : ""}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-green-500" />
            Nejlevnější dny pro odlet — klikněte na datum pro rezervaci
          </p>
        </div>
      </div>

      {/* Widget container */}
      <div className="relative w-full rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10 min-h-[200px]">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-sm text-gray-500 font-medium">Načítám cenový kalendář…</p>
            <p className="text-xs text-gray-400 mt-1">Hledám nejlevnější termíny pro vás</p>
          </div>
        )}

        {/* Error fallback */}
        {hasError && (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="text-4xl mb-3">📅</div>
            <p className="font-semibold text-gray-700 mb-1">Kalendář se nepodařilo načíst</p>
            <p className="text-sm text-gray-500 mb-4">
              Zkuste obnovit stránku nebo vyhledejte letenky přímo na Kiwi.com
            </p>
            <a
              href={`https://tp.media/r?marker=${TRAVELPAYOUTS_MARKER}.calendar-error&trs=267609&p=3791&u=${encodeURIComponent(`https://www.kiwi.com/cs/search/results/prague-czechia/${destination || "anywhere"}/anytime/anytime`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#00B2A9] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#009990] transition-colors"
            >
              Vyhledat na Kiwi.com →
            </a>
          </div>
        )}

        {/* Travelpayouts script injection point */}
        <div ref={containerRef} className="w-full" />
      </div>

      {/* Info badge */}
      <p className="text-xs text-gray-400 mt-2 text-center">
        🔒 Ceny jsou aktualizovány v reálném čase · Powered by Travelpayouts
      </p>
    </div>
  );
}
