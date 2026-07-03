/**
 * FlightMapWidget - Aviasales Interactive Map Widget (Travelpayouts)
 *
 * Displays an interactive world map with flight prices from a given origin city.
 * Includes built-in toggles for:
 *   1. Direct / Stopover flights
 *   2. Round-trip / One-way flights
 * Both preferences are persisted to localStorage and tracked via Umami analytics.
 *
 * Docs: https://support.travelpayouts.com/hc/en-us/articles/203638518
 * Script: //www.travelpayouts.com/map_widget/iframe.js
 */
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Globe,
  Loader2,
  TrendingDown,
  Plane,
  ArrowLeftRight,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { pelikanDeepLink } from "@shared/affiliateLinks";

// ─── localStorage helpers ─────────────────────────────────────────────────────

const LS_DIRECT_KEY = "akcni-letenky:flight-map-filter";
const LS_ONEWAY_KEY = "akcni-letenky:flight-map-oneway";

function readLS(key: string, fallback: boolean): { value: boolean; wasRestored: boolean } {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return { value: fallback, wasRestored: false };
    return { value: stored === "true", wasRestored: true };
  } catch {
    return { value: fallback, wasRestored: false };
  }
}

function writeLS(key: string, value: boolean) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // ignore quota / private-mode errors
  }
}

// ─── Umami analytics helper ───────────────────────────────────────────────────

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, unknown>) => void };
  }
}

function trackEvent(event: string, data?: Record<string, unknown>) {
  try {
    window.umami?.track(event, data);
  } catch {
    // analytics is optional — never crash the UI
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface FlightMapWidgetProps {
  /** IATA code of origin city (default: PRG = Prague) */
  origin?: string;
  /** Locale/language (default: cs) */
  locale?: string;
  /** Currency code (default: CZK) */
  currency?: string;
  /** Initial filter: show only direct flights (default: false) */
  onlyDirect?: boolean;
  /** Initial filter: show one-way prices only (default: false = round trip) */
  oneWay?: boolean;
  /** Whether to show the direct/stopover toggle UI (default: true) */
  showFilterToggle?: boolean;
  /** Whether to show the round-trip/one-way toggle UI (default: true) */
  showTripTypeToggle?: boolean;
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
  onlyDirect: initialOnlyDirect = false,
  oneWay: initialOneWay = false,
  showFilterToggle = true,
  showTripTypeToggle = true,
  subId,
  height = 580,
  className = "",
}: FlightMapWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ── Direct filter — init from localStorage ──────────────────────────────────
  const [onlyDirect, setOnlyDirect] = useState<boolean>(() => {
    const { value } = readLS(LS_DIRECT_KEY, initialOnlyDirect);
    return value;
  });
  const [directWasRestored] = useState<boolean>(() => {
    const { wasRestored } = readLS(LS_DIRECT_KEY, initialOnlyDirect);
    return wasRestored;
  });

  // ── One-way filter — init from localStorage ─────────────────────────────────
  const [oneWay, setOneWay] = useState<boolean>(() => {
    const { value } = readLS(LS_ONEWAY_KEY, initialOneWay);
    return value;
  });
  const [onewayWasRestored] = useState<boolean>(() => {
    const { wasRestored } = readLS(LS_ONEWAY_KEY, initialOneWay);
    return wasRestored;
  });

  // Show "preference restored" badge when either filter was restored
  const [showRestoredBadge, setShowRestoredBadge] = useState<boolean>(
    directWasRestored || onewayWasRestored
  );
  useEffect(() => {
    if (!showRestoredBadge) return;
    const t = setTimeout(() => setShowRestoredBadge(false), 3000);
    return () => clearTimeout(t);
  }, [showRestoredBadge]);

  // ── Widget loader ────────────────────────────────────────────────────────────
  const loadWidget = useCallback(
    (directOnly: boolean, isOneWay: boolean) => {
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
        one_way: isOneWay ? "true" : "false",
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

      const fallbackTimer = setTimeout(() => {
        setIsLoading(false);
        setIsTransitioning(false);
      }, 7000);

      containerRef.current.appendChild(script);
      return () => clearTimeout(fallbackTimer);
    },
    [origin, locale, currency, subId]
  );

  // Initial load
  useEffect(() => {
    const cleanup = loadWidget(onlyDirect, oneWay);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, locale, currency, subId]);

  // ── Toggle handlers ──────────────────────────────────────────────────────────

  const handleDirectToggle = (newValue: boolean) => {
    if (newValue === onlyDirect || isTransitioning) return;
    setOnlyDirect(newValue);
    writeLS(LS_DIRECT_KEY, newValue);
    setShowRestoredBadge(false);
    setIsTransitioning(true);
    trackEvent("flight_filter_changed", {
      filter: "direct",
      value: newValue ? "direct_only" : "all_flights",
      origin,
    });
    loadWidget(newValue, oneWay);
  };

  const handleTripTypeToggle = (newValue: boolean) => {
    if (newValue === oneWay || isTransitioning) return;
    setOneWay(newValue);
    writeLS(LS_ONEWAY_KEY, newValue);
    setShowRestoredBadge(false);
    setIsTransitioning(true);
    trackEvent("flight_filter_changed", {
      filter: "trip_type",
      value: newValue ? "one_way" : "round_trip",
      origin,
    });
    loadWidget(onlyDirect, newValue);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
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

        {/* Right side: badges + toggles */}
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

          {/* ── Direct / Stopover toggle ── */}
          {showFilterToggle && (
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1 border border-gray-200 shadow-sm">
              <ArrowLeftRight className="w-3.5 h-3.5 text-gray-400 ml-1.5" />
              <button
                onClick={() => handleDirectToggle(false)}
                disabled={isTransitioning}
                className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  !onlyDirect
                    ? "bg-white text-blue-700 shadow-md border border-blue-100"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                } ${isTransitioning ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                aria-pressed={!onlyDirect}
                title="Zobrazit všechny lety včetně přestupů"
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
                onClick={() => handleDirectToggle(true)}
                disabled={isTransitioning}
                className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                  onlyDirect
                    ? "bg-white text-green-700 shadow-md border border-green-100"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                } ${isTransitioning ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                aria-pressed={onlyDirect}
                title="Zobrazit pouze přímé lety bez přestupu"
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

          {/* ── Round-trip / One-way toggle ── */}
          {showTripTypeToggle && (
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1 border border-gray-200 shadow-sm">
              <RefreshCw className="w-3.5 h-3.5 text-gray-400 ml-1.5" />
              <button
                onClick={() => handleTripTypeToggle(false)}
                disabled={isTransitioning}
                className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                  !oneWay
                    ? "bg-white text-purple-700 shadow-md border border-purple-100"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                } ${isTransitioning ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                aria-pressed={!oneWay}
                title="Zobrazit ceny zpátečních letenek"
              >
                {!oneWay && isTransitioning ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Načítám…
                  </span>
                ) : (
                  "🔄 Zpáteční"
                )}
              </button>
              <button
                onClick={() => handleTripTypeToggle(true)}
                disabled={isTransitioning}
                className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                  oneWay
                    ? "bg-white text-orange-700 shadow-md border border-orange-100"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                } ${isTransitioning ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                aria-pressed={oneWay}
                title="Zobrazit ceny jednosměrných letenek"
              >
                {oneWay && isTransitioning ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Načítám…
                  </span>
                ) : (
                  "➡️ Jednosměrné"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active filter badges row */}
      {(showFilterToggle || showTripTypeToggle) && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">Zobrazuji:</span>
          {showFilterToggle && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full transition-all duration-300 ${
                onlyDirect
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}
            >
              {onlyDirect ? "🟢 Pouze přímé lety" : "✈️ Všechny lety (i s přestupem)"}
            </span>
          )}
          {showTripTypeToggle && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full transition-all duration-300 ${
                oneWay
                  ? "bg-orange-100 text-orange-700 border border-orange-200"
                  : "bg-purple-100 text-purple-700 border border-purple-200"
              }`}
            >
              {oneWay ? "➡️ Jednosměrné" : "🔄 Zpáteční"}
            </span>
          )}
          {isTransitioning && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Aktualizuji mapu…
            </span>
          )}
          {showRestoredBadge && !isTransitioning && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full animate-pulse">
              <CheckCircle className="w-3 h-3" />
              Vaše preference obnovena
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
                : oneWay
                ? "Hledám nejlevnější jednosměrné letenky z Prahy"
                : "Hledám nejlevnější letenky z Prahy do celého světa"}
            </p>
            <div className="flex gap-2 mt-5 flex-wrap justify-center max-w-xs">
              {["Praha", "Londýn", "Bangkok", "New York", "Dubaj"].map((city, i) => (
                <span
                  key={city}
                  className="text-xs text-blue-400 font-medium animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {city}
                </span>
              ))}
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
              Zkuste obnovit stranku nebo vyhledejte letenky primo na Pelikan.cz
              — porovnáme ceny stovek aerolinek za vás.
            </p>
            <a
              href={pelikanDeepLink("/cs/akcni-letenky", {
                campaign: "map-error",
                channel: "flight-map",
                content: "anywhere",
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#00B2A9] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#009990] transition-colors shadow-md"
            >
              <Plane className="w-4 h-4" />
              Vyhledat letenky na Pelikan.cz
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
