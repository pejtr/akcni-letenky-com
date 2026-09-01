/**
 * Hero Variant A - Čedok.cz inspired design
 *
 * Features: Tab search (Letenky / Dovolená / Tipy), hero background slideshow,
 * clean white search card, trust badges below
 */

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plane, Sun, Lightbulb, MapPin, Calendar, Users } from "lucide-react";
import { trackFormInteraction } from "@/lib/abTest";
import { useCtaAbTest } from "@/hooks/useCtaAbTest";
import { trackSearch } from "@/components/MetaPixel";
import HeroBackgroundSlideshow from "@/components/HeroBackgroundSlideshow";
import { pelikanDeepLink } from "@shared/affiliateLinks";
import DestinationAutocomplete from "@/components/DestinationAutocomplete";

interface HeroVariantAProps {
  onSearch: (destination: string, passengers: number, origin?: string) => void;
}

type SearchTab = "letenky" | "dovolena" | "tipy";

export default function HeroVariantA({ onSearch }: HeroVariantAProps) {
  const [activeTab, setActiveTab] = React.useState<SearchTab>("letenky");
  const [origin, setOrigin] = React.useState("PRG");
  const [destination, setDestination] = React.useState("");
  const [tripType, setTripType] = React.useState<"round" | "oneway">("round");
  const [passengers, setPassengers] = React.useState(1);
  const [departureDate, setDepartureDate] = React.useState("");

  const { ctaVariant: heroCta, trackClick: trackHeroClick } = useCtaAbTest("hero_cta");

  const handleSearch = () => {
    trackHeroClick();
    if (destination.trim()) {
      trackSearch(destination.trim());
    }
    onSearch(destination, passengers, origin);
  };

  const tabs: { id: SearchTab; label: string; icon: React.ReactNode }[] = [
    { id: "letenky", label: "Letenky", icon: <Plane className="w-4 h-4" /> },
    { id: "dovolena", label: "Dovolená", icon: <Sun className="w-4 h-4" /> },
    { id: "tipy", label: "Tipy na cesty", icon: <Lightbulb className="w-4 h-4" /> },
  ];

  const airportChips = [
    { id: "PRG", label: "🇨🇿 Praha (PRG)" },
    { id: "VIE", label: "🇦🇹 Vídeň (VIE)" },
    { id: "BTS", label: "🇸🇰 Bratislava (BTS)" },
    { id: "BRQ", label: "🇨🇿 Brno (BRQ)" },
    { id: "ALL", label: "🌐 Všechna letiště" },
  ];

  return (
    <section className="relative text-white overflow-hidden" style={{ paddingTop: "88px" }}>
      {/* Dynamic Background Slideshow & High-Octane Video */}
      <HeroBackgroundSlideshow />

      {/* Content */}
      <div className="container relative z-10 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Live Radar Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-600/30 backdrop-blur-md border border-rose-400/40 text-rose-100 text-xs sm:text-sm font-bold mb-4 shadow-xl shadow-rose-950/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400"></span>
            </span>
            <span>LIVE RADAR AKČNÍCH LETENEK</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] tracking-tight">
            Nejlevnější akční a last minute letenky
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] font-medium max-w-2xl mx-auto">
            Porovnejte letenky z Prahy, Vídně i Bratislavy, zájezdy a tipy na cesty — vše na jednom místě
          </p>

          {/* Search Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/40 overflow-hidden text-left">
            {/* Tabs & Trip Type */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-100/80 bg-slate-50/70 px-2 sm:px-4">
              <div className="flex w-full sm:w-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-sm font-semibold transition-colors justify-center ${
                      activeTab === tab.id
                        ? "text-[#1565C0] border-b-2 border-[#1565C0] bg-blue-50/50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {activeTab === "letenky" && (
                <div className="flex items-center gap-2 py-2 text-xs font-semibold text-gray-600">
                  <button
                    type="button"
                    onClick={() => setTripType("round")}
                    className={`px-3 py-1 rounded-full transition-colors ${
                      tripType === "round" ? "bg-[#1565C0] text-white" : "bg-gray-200/80 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Zpáteční
                  </button>
                  <button
                    type="button"
                    onClick={() => setTripType("oneway")}
                    className={`px-3 py-1 rounded-full transition-colors ${
                      tripType === "oneway" ? "bg-[#1565C0] text-white" : "bg-gray-200/80 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Jednosměrná
                  </button>
                </div>
              )}
            </div>

            {/* Quick Airport Chips for Czech & nearby departures */}
            {activeTab === "letenky" && (
              <div className="px-5 pt-3.5 pb-1 flex flex-wrap items-center gap-1.5 border-b border-gray-100 bg-blue-50/20">
                <span className="text-xs font-bold text-gray-500 mr-1">Odlet:</span>
                {airportChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setOrigin(chip.id)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                      origin === chip.id
                        ? "bg-[#1565C0] text-white shadow-sm font-bold"
                        : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Search Form */}
            <div className="p-5">
              {activeTab === "letenky" && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Origin selector */}
                    <div className="sm:w-44">
                      <select
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="w-full h-12 px-3 border border-gray-200 rounded-md text-gray-800 text-sm font-semibold bg-white focus:border-[#1565C0] focus:ring-[#1565C0]"
                      >
                        <option value="PRG">🇨🇿 Praha (PRG)</option>
                        <option value="VIE">🇦🇹 Vídeň (VIE)</option>
                        <option value="BTS">🇸🇰 Bratislava (BTS)</option>
                        <option value="BRQ">🇨🇿 Brno (BRQ)</option>
                        <option value="OSR">🇨🇿 Ostrava (OSR)</option>
                        <option value="ALL">🌐 Všechna letiště</option>
                      </select>
                    </div>

                    {/* Destination Autocomplete */}
                    <div className="flex-1">
                      <DestinationAutocomplete
                        value={destination}
                        onChange={setDestination}
                        onSelect={(dest) => {
                          setDestination(dest.name);
                          trackFormInteraction("hero_redesign", "destination");
                        }}
                        placeholder="Kam letíte? (např. Paříž, Řím, Mallorca...)"
                        inputClassName="border-gray-200 focus:border-[#1565C0] focus:ring-[#1565C0]"
                      />
                    </div>

                    {/* Date */}
                    <div className="relative sm:w-36">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Kdy? (např. říjen)"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className="pl-9 h-12 border-gray-200 text-gray-800"
                      />
                    </div>

                    {/* Passengers */}
                    <div className="relative sm:w-32">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={passengers}
                        onChange={(e) => {
                          setPassengers(Number(e.target.value));
                          trackFormInteraction("hero_redesign", "passengers");
                        }}
                        className="w-full h-12 pl-9 pr-2 border border-gray-200 rounded-md text-gray-800 text-sm bg-white"
                      >
                        <option value={1}>1 os.</option>
                        <option value={2}>2 os.</option>
                        <option value={3}>3 os.</option>
                        <option value={4}>4 os.</option>
                      </select>
                    </div>

                    {/* Submit button */}
                    <Button
                      onClick={handleSearch}
                      className="h-12 px-6 bg-[#1565C0] hover:bg-[#0d47a1] text-white font-semibold rounded-lg shadow-sm whitespace-nowrap"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Vyhledat lety
                    </Button>
                  </div>

                  {/* Transparent search disclaimer */}
                  <div className="text-[11px] text-gray-500 pt-1 flex items-center justify-between">
                    <span>💡 <strong>Tip:</strong> Letenky z Vídně a Bratislavy bývají často až o 40 % levnější.</span>
                    <span className="text-gray-400 hidden sm:inline">Rezervace probíhá u licencovaného partnera Pelikán.cz</span>
                  </div>
                </div>
              )}

              {activeTab === "dovolena" && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Kam se chystáte? (Řecko, Španělsko...)"
                      className="pl-9 h-12 border-gray-200 text-gray-800"
                    />
                  </div>
                  <div className="relative sm:w-36">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select className="w-full h-12 pl-9 pr-3 border border-gray-200 rounded-md text-gray-800 text-sm bg-white">
                      <option>2 dospělí</option>
                      <option>2 + 1 dítě</option>
                      <option>2 + 2 děti</option>
                      <option>1 dospělý</option>
                    </select>
                  </div>
                  <a
                    href={pelikanDeepLink("/cs/pobyty/s-pelikanem/", {
                      campaign: "hero-holiday",
                      channel: "hero-tab",
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-12 px-6 bg-[#E91E63] hover:bg-[#C2185B] text-white font-semibold rounded-lg shadow-sm whitespace-nowrap flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Hledat zájezdy
                  </a>
                </div>
              )}

              {activeTab === "tipy" && (
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="flex-1 relative">
                    <Lightbulb className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Hledat tipy (Itálie, levné letenky...)"
                      className="pl-9 h-12 border-gray-200 text-gray-800"
                    />
                  </div>
                  <a
                    href="/tipy-pro-cestovatele"
                    className="h-12 px-6 bg-[#FF9800] hover:bg-[#F57C00] text-white font-semibold rounded-lg shadow-sm whitespace-nowrap flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Procházet tipy
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-white/90 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">✓</span> Oficiální partner Pelikán.cz (IATA)
            </span>
            <span className="text-white/40">|</span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">✓</span> Reálné ceny bez skrytých poplatků
            </span>
            <span className="text-white/40">|</span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">✓</span> Výběr odletů: Praha, Vídeň, Bratislava
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
