/**
 * PriceCalendarWidget - Travelpayouts Aviasales Price Calendar Widget
 *
 * Displays a flight price calendar showing cheapest dates for a given route.
 * - Persists last-used period ("year" | "month") and destination to localStorage
 * - Tracks period changes via Umami analytics custom events
 * - Shows "Vaše preference obnovena" badge when restoring saved state
 *
 * Docs: https://support.travelpayouts.com/hc/en-us/articles/203912008
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { Calendar, TrendingDown, Loader2, CheckCircle } from "lucide-react";
import { pelikanDeepLink } from "@shared/affiliateLinks";

// ─── localStorage helpers ─────────────────────────────────────────────────────

const LS_PERIOD_KEY = "akcni-letenky:price-calendar-period";
const LS_DEST_KEY = "akcni-letenky:price-calendar-dest";

function readLSString(key: string, fallback: string): { value: string; wasRestored: boolean } {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return { value: fallback, wasRestored: false };
    return { value: stored, wasRestored: true };
  } catch {
    return { value: fallback, wasRestored: false };
  }
}

function writeLSString(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
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
  /** Whether to show the year/month period toggle (default: true) */
  showPeriodToggle?: boolean;
}

const TRAVELPAYOUTS_MARKER = "155221";

export default function PriceCalendarWidget({
  origin = "PRG",
  destination: propDestination = "",
  currency = "CZK",
  locale = "cs",
  width = "100%",
  oneWay = false,
  onlyDirect = false,
  period: initialPeriod = "year",
  range = "7,14",
  subId,
  className = "",
  destinationName,
  showPeriodToggle = true,
}: PriceCalendarWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ── Period — restore from localStorage (only when no prop override) ──────────
  const [period, setPeriod] = useState<"year" | "month">(() => {
    // If a specific destination is given (destination page), don't restore period
    // to avoid confusing context. Only restore on the generic calendar (no dest).
    if (propDestination) return initialPeriod;
    const { value } = readLSString(LS_PERIOD_KEY, initialPeriod);
    return value as "year" | "month";
  });

  // ── Destination — restore from localStorage (only when no prop override) ─────
  const [destination, setDestination] = useState<string>(() => {
    if (propDestination) return propDestination;
    const { value } = readLSString(LS_DEST_KEY, propDestination);
    return value;
  });

  // Show "preference restored" badge when period was restored from localStorage
  const [showRestoredBadge, setShowRestoredBadge] = useState<boolean>(() => {
    if (propDestination) return false;
    const { wasRestored: periodRestored } = readLSString(LS_PERIOD_KEY, initialPeriod);
    const { wasRestored: destRestored } = readLSString(LS_DEST_KEY, propDestination);
    return periodRestored || destRestored;
  });
  useEffect(() => {
    if (!showRestoredBadge) return;
    const t = setTimeout(() => setShowRestoredBadge(false), 3000);
    return () => clearTimeout(t);
  }, [showRestoredBadge]);

  // ── Widget loader ────────────────────────────────────────────────────────────
  const loadWidget = useCallback(
    (activePeriod: "year" | "month", activeDest: string) => {
      if (!containerRef.current) return;

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
        period: activePeriod,
        range: encodeURIComponent(range),
        powered_by: "true",
        width: String(width),
      });

      if (activeDest) {
        params.set("destination", activeDest.toUpperCase());
      }

      const script = document.createElement("script");
      script.src = `//www.travelpayouts.com/calendar_widget/iframe.js?${params.toString()}`;
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
      }, 5000);

      containerRef.current.appendChild(script);
      return () => clearTimeout(fallbackTimer);
    },
    [origin, currency, locale, oneWay, onlyDirect, range, subId, width]
  );

  // Initial load
  useEffect(() => {
    const cleanup = loadWidget(period, destination);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, currency, locale, oneWay, onlyDirect, range, subId, width]);

  // ── Period toggle handler ────────────────────────────────────────────────────
  const handlePeriodToggle = (newPeriod: "year" | "month") => {
    if (newPeriod === period || isTransitioning) return;
    setPeriod(newPeriod);
    if (!propDestination) writeLSString(LS_PERIOD_KEY, newPeriod);
    setShowRestoredBadge(false);
    setIsTransitioning(true);
    trackEvent("calendar_period_changed", {
      period: newPeriod,
      origin,
      destination: destination || "any",
    });
    loadWidget(newPeriod, destination);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className={`w-full ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
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

        {/* Period toggle: Rok / Měsíc */}
        {showPeriodToggle && (
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1 border border-gray-200 shadow-sm self-start sm:self-auto">
            <button
              onClick={() => handlePeriodToggle("year")}
              disabled={isTransitioning}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                period === "year"
                  ? "bg-white text-green-700 shadow-md border border-green-100"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              } ${isTransitioning ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              aria-pressed={period === "year"}
              title="Zobrazit nejlevnější dny v celém roce"
            >
              {period === "year" && isTransitioning ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Načítám…
                </span>
              ) : (
                "📆 Celý rok"
              )}
            </button>
            <button
              onClick={() => handlePeriodToggle("month")}
              disabled={isTransitioning}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                period === "month"
                  ? "bg-white text-blue-700 shadow-md border border-blue-100"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              } ${isTransitioning ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              aria-pressed={period === "month"}
              title="Zobrazit nejlevnější dny v aktuálním měsíci"
            >
              {period === "month" && isTransitioning ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Načítám…
                </span>
              ) : (
                "🗓️ Tento měsíc"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Active state badges */}
      {showPeriodToggle && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">Zobrazuji:</span>
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full transition-all duration-300 ${
              period === "year"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-blue-100 text-blue-700 border border-blue-200"
            }`}
          >
            {period === "year" ? "📆 Celý rok" : "🗓️ Tento měsíc"}
          </span>
          {isTransitioning && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Aktualizuji kalendář…
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

      {/* Widget container */}
      <div
        className={`relative w-full rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white transition-opacity duration-300 ${
          isTransitioning ? "opacity-50" : "opacity-100"
        }`}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10 min-h-[200px]">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-sm text-gray-500 font-medium">Načítám cenový kalendář…</p>
            <p className="text-xs text-gray-400 mt-1">
              {period === "year"
                ? "Hledám nejlevnější termíny v celém roce"
                : "Hledám nejlevnější termíny v tomto měsíci"}
            </p>
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
              href={pelikanDeepLink("/cs/akcni-letenky", {
                campaign: "calendar-error",
                channel: "price-calendar",
                content: destination || "anywhere",
              })}
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
