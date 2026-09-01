import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Plane, TrendingUp, Luggage, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { formatDestinationGenitive } from "@shared/czechGrammar";

function getInternalDestinationUrl(destName: string): string {
  if (!destName) return "/levne-letenky";
  const cleanName = destName.toLowerCase().replace(/^letenky\s+do\s+/i, "").trim();
  
  const map: Record<string, string> = {
    malta: "/malta",
    "řecko": "/recko",
    recko: "/recko",
    barcelona: "/barcelona",
    kypr: "/kypr",
    "londýn": "/londyn",
    london: "/londyn",
    "paříž": "/pariz",
    paris: "/pariz",
    "řím": "/rim",
    rome: "/rim",
    "new york": "/new-york",
    dubaj: "/dubaj",
    dubai: "/dubaj",
    bali: "/bali",
    afrika: "/dovolene",
    "levná exotika": "/dovolene",
    exotika: "/dovolene",
    istanbul: "/letenky-do-istanbul",
    amsterdam: "/amsterdam",
    "vídeň": "/viden",
    "berlín": "/berlin",
    egypt: "/letenky-do-egypt",
  };
  
  if (map[cleanName]) return map[cleanName];
  
  const slug = cleanName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
    
  return `/${slug}`;
}

function getAirportBadge(departure?: string) {
  const dep = (departure || "Praha").toLowerCase();
  if (dep.includes("víd") || dep.includes("vie") || dep.includes("wien")) {
    return { label: "🇦🇹 Odlet: Vídeň (VIE)", bg: "bg-amber-500 text-slate-950 font-bold" };
  }
  if (dep.includes("brat") || dep.includes("bts")) {
    return { label: "🇸🇰 Odlet: Bratislava (BTS)", bg: "bg-emerald-500 text-slate-950 font-bold" };
  }
  if (dep.includes("brn") || dep.includes("brq") || dep.includes("ostr") || dep.includes("osr")) {
    return { label: "🇨🇿 Odlet: Morava (BRQ/OSR)", bg: "bg-indigo-500 text-white font-bold" };
  }
  return { label: "🇨🇿 Odlet: Praha (PRG)", bg: "bg-[#1565C0] text-white font-bold" };
}

export default function TopFlightsThisWeek() {
  const [selectedAirport, setSelectedAirport] = useState<"ALL" | "PRG" | "VIE" | "BTS" | "MORAVA">("ALL");

  const { data: flights, isLoading } = trpc.pelikan.getFlights.useQuery({
    limit: 24,
    sortBy: "price_asc",
  });
  const trackClickMutation = trpc.affiliate.trackClick.useMutation();

  const trackAffiliateClick = (flight: any) => {
    trackClickMutation.mutate({
      destination: flight.destination,
      destinationSlug: flight.id,
      source: "top-this-week",
      affiliatePartner: "pelikan",
      affiliateUrl: flight.link,
    });
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("cs-CZ").format(price);
  };

  const filteredFlights = useMemo(() => {
    if (!flights) return [];
    if (selectedAirport === "ALL") return flights.slice(0, 6);

    return flights.filter((flight) => {
      const dep = (flight.departure || "").toLowerCase();
      if (selectedAirport === "PRG") return dep.includes("praha") || dep.includes("prg") || !dep;
      if (selectedAirport === "VIE") return dep.includes("víd") || dep.includes("vie") || dep.includes("wien");
      if (selectedAirport === "BTS") return dep.includes("brat") || dep.includes("bts");
      if (selectedAirport === "MORAVA") return dep.includes("brn") || dep.includes("ostr") || dep.includes("brq") || dep.includes("osr");
      return true;
    }).slice(0, 6);
  }, [flights, selectedAirport]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Načítání nejlepších nabídek" aria-busy="true">
          {[...Array(6)].map((_, i) => (
            <div key={`top-flight-skeleton-${i}`} className="relative min-h-[280px] overflow-hidden rounded-2xl bg-slate-200 shadow-md">
              <div className="skeleton-shimmer absolute inset-0" />
              <div className="relative z-10 flex h-full flex-col justify-end p-6">
                <div className="mb-3 h-6 w-28 rounded-full bg-white/70" />
                <div className="mb-3 h-7 w-40 rounded bg-white/70" />
                <div className="mb-2 h-8 w-32 rounded bg-white/70" />
                <div className="mb-4 h-4 w-44 rounded bg-white/70" />
                <div className="flex items-center justify-between border-t border-white/60 pt-3">
                  <div className="h-4 w-36 rounded bg-white/70" />
                  <div className="h-4 w-20 rounded bg-white/70" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!flights || flights.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aktuální letenky z Pelikán feedu teď nejsou k dispozici.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1-Click Origin Airport Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-[#1565C0]" />
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Filtrovat odlet:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedAirport("ALL")}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
              selectedAirport === "ALL"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            🌐 Všechny odlety ({flights.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedAirport("PRG")}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
              selectedAirport === "PRG"
                ? "bg-[#1565C0] text-white shadow-sm"
                : "bg-blue-50 text-blue-900 hover:bg-blue-100"
            }`}
          >
            🇨🇿 Pouze Praha (PRG)
          </button>
          <button
            type="button"
            onClick={() => setSelectedAirport("VIE")}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
              selectedAirport === "VIE"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-amber-50 text-amber-900 hover:bg-amber-100"
            }`}
          >
            🇦🇹 Pouze Vídeň (VIE)
          </button>
          <button
            type="button"
            onClick={() => setSelectedAirport("BTS")}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
              selectedAirport === "BTS"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
            }`}
          >
            🇸🇰 Pouze Bratislava (BTS)
          </button>
        </div>
      </div>

      {/* Grid of honest deal cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFlights.map((flight, index) => {
          const departure = "departure" in flight ? flight.departure : "Praha";
          const airline = "airline" in flight ? flight.airline : undefined;
          const internalUrl = getInternalDestinationUrl(flight.destination || flight.title);
          const badge = getAirportBadge(departure);

          return (
            <Link
              key={flight.id}
              href={internalUrl}
              onClick={() => trackAffiliateClick(flight)}
              className="group relative rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#E91E63] overflow-hidden min-h-[300px] flex flex-col justify-between block cursor-pointer bg-slate-900"
            >
              {/* Card Background Media */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('${flight.imageUrl || "/hero-coastal.jpg"}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/60 to-slate-950/30"></div>
              </div>

              {/* Card Header Tags */}
              <div className="relative z-10 p-5 flex items-start justify-between gap-2">
                <span className={`text-[11px] px-3 py-1 rounded-full shadow-md flex items-center gap-1 ${badge.bg}`}>
                  {badge.label}
                </span>

                <div className="bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                  #{index + 1} v radaru
                </div>
              </div>

              {/* Card Content & Transparency Info */}
              <div className="relative z-10 p-5 mt-auto">
                <div className="flex items-center gap-2 mb-1">
                  <Plane className="w-4 h-4 text-white group-hover:rotate-45 transition-transform duration-300" />
                  <h3 className="text-xl font-black text-white group-hover:text-[#FFD700] transition-colors tracking-tight">
                    {flight.destination || flight.title}
                  </h3>
                </div>

                {/* Price & Conditions */}
                <div className="mb-3">
                  <div className="text-[11px] text-slate-300 font-medium mb-0.5">
                    Orientační cena z partnerského zdroje:
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#FFD700]">
                      od {flight.salePrice ? formatPrice(flight.salePrice) : formatPrice(flight.price || 990)} Kč
                    </span>
                  </div>

                  {airline && (
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-300">
                      <span className="bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded text-white/90">
                        ✈️ {airline}
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA Action */}
                <div className="flex items-center justify-between pt-3 border-t border-white/20 text-xs">
                  <span className="text-slate-300">Dostupnost & podmínky</span>
                  <span className="font-bold text-[#FFD700] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Ověřit aktuální cenu na Pelikán.cz <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <Link href="/levne-letenky" className="inline-flex items-center gap-2 bg-[#E91E63] hover:bg-[#c2185b] text-white font-black text-base px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
          Zobrazit všechny akční letenky ({flights.length} tarifů) <Plane className="w-5 h-5 ml-1" />
        </Link>
      </div>
    </div>
  );
}
