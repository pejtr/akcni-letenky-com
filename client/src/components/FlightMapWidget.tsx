/**
 * FlightMapWidget - Aviasales Interactive Map Widget (Travelpayouts)
 *
 * Displays an interactive world map with flight prices from a given origin city.
 * Includes a built-in toggle for filtering between direct flights and flights with stopovers.
 * Uses Travelpayouts Aviasales Map Widget (marker=155221).
 *
 * Docs: https://support.travelpayouts.com/hc/en-us/articles/203638518
 * Script: //www.travelpayouts.com/map_widget/iframe.js
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { Globe, Loader2, TrendingDown, Plane, ArrowLeftRight } from "lucide-react";

interface FlightMapWidgetProps {
  /** IATA code of origin city (default: PRG = Prague) */
  origin?: string;
  /** Locale/language (default: cs) */
  locale?: string;
  /** Currency code (default: CZK) */
  currency?: string;
  /** Show one-way prices only (default: false = round trip) */
  oneWay?: boolean;
  /** Initial filter: show only direct flights (default: false) */
  onlyDirect?: boolean;
  /** Whether to show the direct/stopover toggle UI (default: true) */
  showFilterToggle?: boolean;
  /** Optional sub-ID for tracking */
  subId?: string;
  /** Height of the map in px (default: 580) */
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
  onlyDirect: initialOnlyDirect = false,
  showFilterToggle = true,
  subId,
  height = 580,
  className = "",
}: FlightMapWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  // Internal state for the toggle — starts from prop, then user can change it
  const [onlyDirect, setOnlyDirect] = useState(initialOnlyDirect);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const loadWidget = useCallback(
    (directOnly: boolean) => {
      if (!containerRef.current) return;

      // Clear previous widget
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
        only_direct: directOnly ? "true" : "false",
        powered_by: "true",
      });

      const script = document.createElement("script");
      script.src = `//www.travelpayouts.com/map_widget/iframe.js?${params.toString()}`;
      script.charset = "utf-8";
      script.async = true;

      script.onload = () => {
        setIsLoading(false);
        setIsTransitioning(false);
      };
      script.onerror = () => {
        setIsLoading(false);
        setIsTransitioning(false);
        setHasError(true);
      };

      // Fallback: hide loading after 7s
      const fallbackTimer = setTimeout(() => {
        setIsLoading(false);
        setIsTransitioning(false);
      }, 7000);

      containerRef.current.appendChild(script);

      return () => clearTimeout(fallbackTimer);
    },
    [origin, locale, currency, oneWay, subId]
  );

  // Initial load
  useEffect(() => {
    const cleanup = loadWidget(onlyDirect);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, locale, currency, oneWay, subId]);

  // Handle toggle change
  const handleToggle = (newValue: boolean) => {
    if (newValue === onlyDirect || isTransitioning) return;
    setOnlyDirect(newValue);
    setIsTransitioning(true);
    loadWidget(newValue);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
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

        {/* Right side: badges + toggle */}
        <div className="flex flex-col items-start sm:items-end gap-2">
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

          {/* Direct / Stopover toggle */}
          {showFilterToggle && (
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1 border border-gray-200 shadow-sm">
              <ArrowLeftRight className="w-3.5 h-3.5 text-gray-400 ml-1.5" />
              <button
                onClick={() => handleToggle(false)}
                disabled={isTransitioning}
                className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  !onlyDirect
                    ? "bg-white text-blue-700 shadow-md border border-blue-100"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                } ${isTransitioning ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                aria-pressed={!onlyDirect}
              >
                {!onlyDirect && isTransitioning ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Načítám…
                  </span>
                ) : (
                  "✈️ S přestupem"
                )}
              </button>
              <button
                onClick={() => handleToggle(true)}
                disabled={isTransitioning}
                className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                  onlyDirect
                    ? "bg-white text-green-700 shadow-md border border-green-100"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                } ${isTransitioning ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                aria-pressed={onlyDirect}
              >
                {onlyDirect && isTransitioning ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Načítám…
                  </span>
                ) : (
                  "🟢 Přímé lety"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active filter badge */}
      {showFilterToggle && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs text-gray-500">Zobrazuji:</span>
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full transition-all duration-300 ${
              onlyDirect
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-blue-100 text-blue-700 border border-blue-200"
            }`}
          >
            {onlyDirect ? "🟢 Pouze přímé lety" : "✈️ Všechny lety (i s přestupem)"}
          </span>
          {isTransitioning && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Aktualizuji mapu…
            </span>
          )}
        </div>
      )}

      {/* Map container */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-white transition-opacity duration-300 ${
          isTransitioning ? "opacity-50" : "opacity-100"
        }`}
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
              {onlyDirect ? "Hledám přímé lety z Prahy…" : "Načítám mapu letů…"}
            </p>
            <p className="text-sm text-gray-500 text-center max-w-xs">
              {onlyDirect
                ? "Zobrazuji pouze přímé lety bez přestupu"
                : "Hledám nejlevnější letenky z Prahy do celého světa"}
            </p>
            {/* Animated city names */}
            <div className="flex gap-2 mt-5 flex-wrap justify-center max-w-xs">
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
        {hasError && !isLoading && (
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
        <div
          ref={containerRef}
          className="w-full"
          style={{ minHeight: `${height}px` }}
        />
      </div>

      {/* Footer note */}
      <p className="text-xs text-gray-400 mt-3 text-center">
        🔒 Ceny jsou aktualizovány v reálném čase · Powered by Aviasales ×
        Travelpayouts · marker=155221
      </p>
    </div>
  );
}
