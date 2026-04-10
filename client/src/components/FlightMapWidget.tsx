/**
 * FlightMapWidget - Aviasales Interactive Map Widget (Travelpayouts)
 *
 * Displays an interactive world map with flight prices from a given origin city.
 * Uses Travelpayouts Aviasales Map Widget (marker=155221).
 *
 * Docs: https://support.travelpayouts.com/hc/en-us/articles/203638518
 * Script: //www.travelpayouts.com/map_widget/iframe.js
 */
import { useEffect, useRef, useState } from "react";
import { Globe, Loader2, TrendingDown, Plane } from "lucide-react";

interface FlightMapWidgetProps {
  /** IATA code of origin city (default: PRG = Prague) */
  origin?: string;
  /** Locale/language (default: cs) */
  locale?: string;
  /** Currency code (default: CZK) */
  currency?: string;
  /** Show one-way prices only (default: false = round trip) */
  oneWay?: boolean;
  /** Show only direct flights (default: false) */
  onlyDirect?: boolean;
  /** Optional sub-ID for tracking */
  subId?: string;
  /** Height of the map in px (default: 600) */
  height?: number;
  /** Optional CSS class for the wrapper */
  className?: string;
}

const TRAVELPAYOUTS_MARKER = "155221";

export default function FlightMapWidget({
  origin = "PRG",
  locale = "cs",
  currency = "CZK",
  oneWay = false,
  onlyDirect = false,
  subId,
  height = 600,
  className = "",
}: FlightMapWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";
    setIsLoading(true);
    setHasError(false);

    const marker = subId
      ? `${TRAVELPAYOUTS_MARKER}.${subId}`
      : TRAVELPAYOUTS_MARKER;

    const params = new URLSearchParams({
      marker,
      origin: origin.toUpperCase(),
      locale,
      currency,
      one_way: oneWay ? "true" : "false",
      only_direct: onlyDirect ? "true" : "false",
      powered_by: "true",
    });

    const script = document.createElement("script");
    script.src = `//www.travelpayouts.com/map_widget/iframe.js?${params.toString()}`;
    script.charset = "utf-8";
    script.async = true;

    script.onload = () => setIsLoading(false);
    script.onerror = () => {
      setIsLoading(false);
      setHasError(true);
    };

    // Fallback: hide loading after 6s
    const fallbackTimer = setTimeout(() => setIsLoading(false), 6000);

    containerRef.current.appendChild(script);

    return () => clearTimeout(fallbackTimer);
  }, [origin, locale, currency, oneWay, onlyDirect, subId]);

  return (
    <div className={`w-full ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              🗺️ Mapa cen letů z Prahy
            </h2>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
              <TrendingDown className="w-3.5 h-3.5 text-green-500" />
              Klikněte na destinaci pro zobrazení nejlepší ceny
            </p>
          </div>
        </div>

        {/* Quick stats badges */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100">
            <Plane className="w-3 h-3" />
            Reálné ceny v CZK
          </span>
          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-100">
            🔄 Aktualizováno denně
          </span>
        </div>
      </div>

      {/* Map container */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-white"
        style={{ minHeight: `${height}px` }}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 z-10"
            style={{ minHeight: `${height}px` }}
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <Globe className="w-10 h-10 text-blue-500" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-800 mb-1">
              Načítám mapu letů…
            </p>
            <p className="text-sm text-gray-500 text-center max-w-xs">
              Hledám nejlevnější letenky z Prahy do celého světa
            </p>
            {/* Animated dots */}
            <div className="flex gap-2 mt-5">
              {["Praha", "Londýn", "Bangkok", "New York", "Dubaj"].map(
                (city, i) => (
                  <span
                    key={city}
                    className="text-xs text-blue-400 font-medium animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  >
                    {city}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {/* Error fallback */}
        {hasError && (
          <div
            className="flex flex-col items-center justify-center text-center px-6 bg-gray-50"
            style={{ minHeight: `${height}px` }}
          >
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Mapu se nepodařilo načíst
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              Zkuste obnovit stránku nebo vyhledejte letenky přímo na Kiwi.com
              — porovnáme ceny stovek aerolinek za vás.
            </p>
            <a
              href={`https://tp.media/r?marker=${TRAVELPAYOUTS_MARKER}.map-error&trs=267609&p=3791&u=${encodeURIComponent(
                "https://www.kiwi.com/cs/search/results/prague-czechia/anywhere/anytime/anytime"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#00B2A9] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#009990] transition-colors shadow-md"
            >
              <Plane className="w-4 h-4" />
              Vyhledat letenky na Kiwi.com
            </a>
          </div>
        )}

        {/* Script injection point */}
        <div ref={containerRef} className="w-full" style={{ minHeight: `${height}px` }} />
      </div>

      {/* Footer note */}
      <p className="text-xs text-gray-400 mt-3 text-center">
        🔒 Ceny jsou aktualizovány v reálném čase · Powered by Aviasales ×
        Travelpayouts · marker=155221
      </p>
    </div>
  );
}
