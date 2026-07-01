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

interface HeroVariantAProps {
  onSearch: (destination: string, passengers: number) => void;
}

type SearchTab = "letenky" | "dovolena" | "tipy";

export default function HeroVariantA({ onSearch }: HeroVariantAProps) {
  const [activeTab, setActiveTab] = React.useState<SearchTab>("letenky");
  const [destination, setDestination] = React.useState("");
  const [passengers, setPassengers] = React.useState(1);
  const [departureDate, setDepartureDate] = React.useState("");

  const { ctaVariant: heroCta, trackClick: trackHeroClick } = useCtaAbTest("hero_cta");

  const handleSearch = () => {
    trackHeroClick();
    if (destination.trim()) {
      trackSearch(destination.trim());
    }
    onSearch(destination, passengers);
  };

  const tabs: { id: SearchTab; label: string; icon: React.ReactNode }[] = [
    { id: "letenky", label: "Letenky", icon: <Plane className="w-4 h-4" /> },
    { id: "dovolena", label: "Dovolená", icon: <Sun className="w-4 h-4" /> },
    { id: "tipy", label: "Tipy na cesty", icon: <Lightbulb className="w-4 h-4" /> },
  ];

  return (
    <section className="relative text-white overflow-hidden" style={{ paddingTop: "88px" }}>
      {/* Dynamic Background Slideshow */}
      <HeroBackgroundSlideshow />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 z-[1]" />

      {/* Content */}
      <div className="container relative z-10 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          {/* Heading */}
          <h1 className="text-3xl md:text-5xl font-bold mb-3 text-center drop-shadow-md">
            Kam chcete na dovolenou?
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white/90 text-center drop-shadow">
            Porovnejte letenky, zájezdy a tipy na cesty — vše na jednom místě
          </p>

          {/* Search Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors flex-1 justify-center ${
                    activeTab === tab.id
                      ? "text-[#1565C0] border-b-2 border-[#1565C0] bg-blue-50/50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Search Form */}
            <div className="p-5">
              {activeTab === "letenky" && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Kam letíte? (Praha → ...)"
                      value={destination}
                      onChange={(e) => {
                        setDestination(e.target.value);
                        trackFormInteraction("hero_redesign", "destination");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-9 h-12 border-gray-200 text-gray-800"
                    />
                  </div>
                  <div className="relative sm:w-36">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Kdy? (dd.mm.)"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="pl-9 h-12 border-gray-200 text-gray-800"
                    />
                  </div>
                  <div className="relative sm:w-36">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={passengers}
                      onChange={(e) => {
                        setPassengers(Number(e.target.value));
                        trackFormInteraction("hero_redesign", "passengers");
                      }}
                      className="w-full h-12 pl-9 pr-3 border border-gray-200 rounded-md text-gray-800 text-sm bg-white"
                    >
                      <option value={1}>1 osoba</option>
                      <option value={2}>2 osoby</option>
                      <option value={3}>3 osoby</option>
                      <option value={4}>4 osoby</option>
                    </select>
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="h-12 px-6 bg-[#1565C0] hover:bg-[#0d47a1] text-white font-semibold rounded-lg shadow-sm whitespace-nowrap"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Vyhledat
                  </Button>
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
              <span className="text-green-400 font-bold">✓</span> 500+ aerolinií
            </span>
            <span className="text-white/40">|</span>
            <span className="flex items-center gap-1.5">
              <span className="text-green-400 font-bold">✓</span> Nejnižší ceny garantovány
            </span>
            <span className="text-white/40">|</span>
            <span className="flex items-center gap-1.5">
              <span className="text-green-400 font-bold">✓</span> 33 500+ spokojených cestovatelů
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
