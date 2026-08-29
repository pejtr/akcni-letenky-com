import React from "react";
import { appendOnyxSubId, trackAffiliateRedirect } from "@/lib/leadosTracking";
import { Compass, Palmtree, ArrowUpRight, ShieldCheck, Sun } from "lucide-react";

export type CrossPromoPlacement = "italy_context" | "package_holiday_alternative" | "generic_travel";

export interface CrossPromoContext {
  destination?: string;
  origin?: string;
  pageType?: string;
  country?: string;
}

export interface CrossPromoSlotProps {
  placement: CrossPromoPlacement;
  context?: CrossPromoContext;
  className?: string;
}

export default function CrossPromoSlot({
  placement,
  context,
  className = "",
}: CrossPromoSlotProps) {
  // Context-aware target resolution
  if (placement === "italy_context") {
    const rawUrl = "https://do-italie.cz/?utm_source=akcni-letenky&utm_medium=cross_promo&utm_campaign=italy_context";
    const targetUrl = appendOnyxSubId(rawUrl);

    return (
      <div className={`bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-700/40 relative overflow-hidden ${className}`}>
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold">
              <Sun className="w-3.5 h-3.5" />
              Do-Italie.cz • Průvodce & Pobyty
            </div>
            <h3 className="text-xl font-bold text-white">
              Chystáte se do Itálie? Kompletní průvodce po památkách a regionech
            </h3>
            <p className="text-sm text-emerald-200/80">
              Praktické tipy, transfery z letiště, vlakové trasy a ověřené ubytování pro vaši cestu do {context?.destination || "Itálie"}.
            </p>
          </div>
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackAffiliateRedirect(targetUrl, { placement: "italy_context", ...context })}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold px-5 py-3 rounded-xl transition-colors shrink-0 shadow-lg text-sm"
          >
            Objevit Do-Italie.cz
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  if (placement === "package_holiday_alternative") {
    const rawUrl = "https://lastminutedovolene.cz/?utm_source=akcni-letenky&utm_medium=cross_promo&utm_campaign=package_holiday_alternative";
    const targetUrl = appendOnyxSubId(rawUrl);

    return (
      <div className={`bg-gradient-to-r from-orange-950 via-amber-900 to-orange-900 text-white rounded-2xl p-6 shadow-xl border border-orange-700/40 relative overflow-hidden ${className}`}>
        <div className="absolute right-0 top-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-semibold">
              <Palmtree className="w-3.5 h-3.5" />
              LastMinuteDovolene.cz • Kompletní zájezdy
            </div>
            <h3 className="text-xl font-bold text-white">
              Hledáte raději kompletní dovolenou s hotelem a all-inclusive?
            </h3>
            <p className="text-sm text-orange-200/80">
              Porovnejte tisíce zájezdů od ověřených českých i německých cestovních kanceláří s odletem z ČR a Vídně.
            </p>
          </div>
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackAffiliateRedirect(targetUrl, { placement: "package_holiday_alternative", ...context })}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-gray-950 font-bold px-5 py-3 rounded-xl transition-colors shrink-0 shadow-lg text-sm"
          >
            Přejít na LastMinuteDovolene.cz
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return null;
}
