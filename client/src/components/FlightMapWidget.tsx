import { useState } from "react";
import { Link } from "wouter";
import { Globe, Plane, TrendingDown, ChevronRight, ShieldCheck, Filter, MapPin, Sparkles } from "lucide-react";
import { pelikanDeepLink } from "@shared/affiliateLinks";

interface FlightMapWidgetProps {
  origin?: string;
  height?: number;
  showFilterToggle?: boolean;
  showTripTypeToggle?: boolean;
  className?: string;
}

// Interactive map destination data from Prague (PRG)
const mapDestinations = [
  {
    id: "barcelona",
    city: "Barcelona",
    country: "Španělsko",
    code: "BCN",
    price: 746,
    originalPrice: 1290,
    discount: 42,
    direct: true,
    flightTime: "2h 20m",
    lat: "41.38",
    lng: "2.17",
    x: 42, // percent on world map SVG
    y: 46,
    imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80",
    linkPath: "/cs/akcni-letenky/praha/barcelona",
    internalRoute: "/barcelona",
  },
  {
    id: "london",
    city: "Londýn",
    country: "Velká Británie",
    code: "LON",
    price: 733,
    originalPrice: 1390,
    discount: 47,
    direct: true,
    flightTime: "2h 00m",
    lat: "51.50",
    lng: "-0.12",
    x: 39,
    y: 32,
    imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80",
    linkPath: "/cs/akcni-letenky/praha/londyn",
    internalRoute: "/londyn",
  },
  {
    id: "rome",
    city: "Řím",
    country: "Itálie",
    code: "ROM",
    price: 712,
    originalPrice: 1490,
    discount: 52,
    direct: true,
    flightTime: "1h 50m",
    lat: "41.90",
    lng: "12.49",
    x: 52,
    y: 48,
    imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80",
    linkPath: "/cs/akcni-letenky/praha/rim",
    internalRoute: "/rim",
  },
  {
    id: "paris",
    city: "Paříž",
    country: "Francie",
    code: "PAR",
    price: 1027,
    originalPrice: 1990,
    discount: 48,
    direct: true,
    flightTime: "1h 45m",
    lat: "48.85",
    lng: "2.35",
    x: 44,
    y: 38,
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
    linkPath: "/cs/akcni-letenky/praha/pariz",
    internalRoute: "/pariz",
  },
  {
    id: "dubai",
    city: "Dubaj",
    country: "SAE",
    code: "DXB",
    price: 4990,
    originalPrice: 8990,
    discount: 44,
    direct: true,
    flightTime: "5h 50m",
    lat: "25.20",
    lng: "55.27",
    x: 72,
    y: 60,
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
    linkPath: "/cs/akcni-letenky/praha/dubaj",
    internalRoute: "/dubaj",
  },
  {
    id: "bangkok",
    city: "Bangkok",
    country: "Thajsko",
    code: "BKK",
    price: 11990,
    originalPrice: 18990,
    discount: 37,
    direct: false,
    flightTime: "11h 30m",
    lat: "13.75",
    lng: "100.50",
    x: 85,
    y: 68,
    imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80",
    linkPath: "/cs/akcni-letenky/praha/bangkok",
    internalRoute: "/letenky-do-bangkok",
  },
  {
    id: "malaga",
    city: "Malaga",
    country: "Španělsko",
    code: "AGP",
    price: 1490,
    originalPrice: 2890,
    discount: 48,
    direct: true,
    flightTime: "3h 25m",
    lat: "36.72",
    lng: "-4.42",
    x: 36,
    y: 54,
    imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80",
    linkPath: "/cs/akcni-letenky/praha/malaga",
    internalRoute: "/malaga",
  },
  {
    id: "new-york",
    city: "New York",
    country: "USA",
    code: "NYC",
    price: 7490,
    originalPrice: 13990,
    discount: 46,
    direct: true,
    flightTime: "8h 45m",
    lat: "40.71",
    lng: "-74.00",
    x: 18,
    y: 42,
    imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80",
    linkPath: "/cs/akcni-letenky/praha/new-york",
    internalRoute: "/new-york",
  }
];

export default function FlightMapWidget({
  origin = "Praha",
  height = 550,
  showFilterToggle = true,
  showTripTypeToggle = true,
  className = "",
}: FlightMapWidgetProps) {
  const [onlyDirect, setOnlyDirect] = useState(false);
  const [selectedDest, setSelectedDest] = useState(mapDestinations[0]);

  const filteredDestinations = onlyDirect
    ? mapDestinations.filter((d) => d.direct)
    : mapDestinations;

  return (
    <div className={`w-full ${className}`}>
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg text-white font-bold">
            🗺️
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#003087]">
              Mapa cen letů z Prahy
            </h2>
            <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
              Klikněte na destinaci pro zobrazení nejvýhodnější ceny letenky
            </p>
          </div>
        </div>

        {/* Toggle buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setOnlyDirect(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !onlyDirect
                ? "bg-[#003087] text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            ✈️ Všechny lety
          </button>
          <button
            onClick={() => setOnlyDirect(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              onlyDirect
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            🟢 Pouze přímé lety
          </button>
        </div>
      </div>

      {/* Main Interactive Map & Deal Card View */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-4 md:p-6 overflow-hidden text-white relative">
        {/* World Map SVG Background Container */}
        <div className="relative w-full h-[320px] md:h-[380px] bg-slate-950/80 rounded-xl overflow-hidden border border-slate-800 mb-6 p-4 flex items-center justify-center">
          {/* Subtle World Map SVG Paths */}
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path fill="currentColor" className="text-blue-400" d="M15,25 Q30,10 45,25 T75,25 T95,35 L95,85 L15,85 Z" />
            {/* Prague Central Hub Pin dot */}
            <circle cx="48" cy="36" r="2" className="fill-orange-400 animate-ping" />
            <circle cx="48" cy="36" r="1.5" className="fill-orange-500" />
          </svg>

          {/* Interactive Destination Pins on Map */}
          {filteredDestinations.map((dest) => {
            const isSelected = selectedDest.id === dest.id;
            return (
              <button
                key={dest.id}
                onClick={() => setSelectedDest(dest)}
                style={{ top: `${dest.y}%`, left: `${dest.x}%` }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 z-10 ${
                  isSelected ? "scale-125 z-20" : "hover:scale-110"
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-xl border backdrop-blur-md transition-all ${
                    isSelected
                      ? "bg-orange-500 text-white border-orange-300 shadow-orange-500/50"
                      : "bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800 hover:border-orange-400"
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isSelected ? "text-white" : "text-orange-400"}`} />
                  <span>{dest.city}</span>
                  <span className="bg-slate-950/80 text-emerald-400 px-1.5 py-0.5 rounded text-[10px]">
                    {dest.price} Kč
                  </span>
                </div>
              </button>
            );
          })}

          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] border border-slate-800 text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span>Výchozí odlet: <strong>Praha (PRG)</strong></span>
          </div>
        </div>

        {/* Selected Destination Feature Card */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <img
              src={selectedDest.imageUrl}
              alt={selectedDest.city}
              className="w-24 h-24 rounded-xl object-cover border border-slate-700 shadow-lg flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {selectedDest.country} ({selectedDest.code})
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
                  {selectedDest.direct ? "🟢 Přímý let" : "✈️ S přestupem"}
                </span>
              </div>
              <h3 className="text-2xl font-black text-white">
                Praha → {selectedDest.city}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Doba letu cca {selectedDest.flightTime} · Zpáteční letenka
              </p>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-700/80 pt-3 md:pt-0">
            <div className="text-left md:text-right">
              <span className="text-xs text-slate-400 block">Akční cena od</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-slate-500 line-through">
                  {selectedDest.originalPrice.toLocaleString("cs-CZ")} Kč
                </span>
                <span className="text-3xl font-black text-orange-400">
                  {selectedDest.price.toLocaleString("cs-CZ")} Kč
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold">
                Ušetříte {selectedDest.discount}% oproti běžné ceně
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link href={selectedDest.internalRoute} className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs px-3.5 py-3 rounded-xl transition-colors">
                Detail
              </Link>

              <a
                href={pelikanDeepLink(selectedDest.linkPath, {
                  campaign: "map-widget",
                  channel: "interactive-map",
                  content: selectedDest.id,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm px-5 py-3 rounded-xl transition-colors shadow-lg shadow-orange-500/30 flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Rezervovat na Pelikán.cz</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Quick Grid Thumbnails Below Map */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {mapDestinations.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDest(d)}
              className={`p-2 rounded-xl text-left border transition-all ${
                selectedDest.id === d.id
                  ? "bg-orange-500/20 border-orange-500 text-white"
                  : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <p className="text-xs font-bold truncate">{d.city}</p>
              <p className="text-[11px] text-orange-400 font-extrabold">{d.price} Kč</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
