/**
 * Hero Variant B - High-Converting Design
 * 
 * This is the test variant for A/B testing.
 * Features: Yellow gradient header, enhanced search form with dropdowns,
 * trust badges, blue info banner
 */

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Flame, Zap, CheckCircle } from "lucide-react";
import { trackFormInteraction } from "@/lib/abTest";
import { useCtaAbTest } from "@/hooks/useCtaAbTest";
import { trackSearch } from "@/components/MetaPixel";
import HeroBackgroundSlideshow from "@/components/HeroBackgroundSlideshow";
import DestinationAutocomplete from "@/components/DestinationAutocomplete";

interface HeroVariantBProps {
  onSearch: (from: string, destination: string, duration: string, passengers: number) => void;
}

export default function HeroVariantB({ onSearch }: HeroVariantBProps) {
  const [from, setFrom] = React.useState("Praha");
  const [destination, setDestination] = React.useState("");
  const [duration, setDuration] = React.useState("1 týden");
  const [passengers, setPassengers] = React.useState(1);

  const { ctaVariant: heroCta, trackClick: trackHeroClick } = useCtaAbTest("hero_cta");

  const handleSearch = () => {
    trackHeroClick();
    // Track search event in Meta Pixel
    if (destination.trim()) {
      trackSearch(destination.trim());
    }
    onSearch(from, destination, duration, passengers);
  };

  return (
    <>
      {/* Hero Section - Dynamic High-Octane Video & Slideshow */}
      <section 
        className="relative pt-36 pb-32 overflow-hidden"
      >
        {/* Dynamic Background Media */}
        <HeroBackgroundSlideshow />

        {/* Content */}
        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Headline with Live Radar Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-600/30 backdrop-blur-md border border-rose-400/40 text-rose-100 text-xs sm:text-sm font-bold mb-4 shadow-xl shadow-rose-950/40">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400"></span>
                </span>
                <span>LIVE RADAR AKČNÍCH LETENEK</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] mb-4 tracking-tight">
                Nejlevnější akční a last minute letenky
              </h1>
              <p className="text-xl md:text-2xl text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] font-medium max-w-3xl mx-auto">
                Porovnejte letenky z Prahy i okolí, zájezdy a tipy na cesty — vše bleskově na jednom místě
              </p>
            </div>

            {/* Enhanced Search Form */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/40 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Odkud? */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Odletové letiště
                  </label>
                  <select
                    value={from}
                    onChange={(e) => {
                      setFrom(e.target.value);
                      trackFormInteraction("hero_redesign", "from");
                    }}
                    className="w-full h-12 px-3 border border-gray-300 rounded-lg font-semibold text-gray-800 text-sm bg-white focus:border-[#1565C0] focus:ring-[#1565C0]"
                  >
                    <option value="Praha">🇨🇿 Praha (PRG)</option>
                    <option value="Vídeň">🇦🇹 Vídeň (VIE)</option>
                    <option value="Bratislava">🇸🇰 Bratislava (BTS)</option>
                    <option value="Brno">🇨🇿 Brno (BRQ)</option>
                    <option value="Ostrava">🇨🇿 Ostrava (OSR)</option>
                    <option value="Vše">🌐 Všechna letiště</option>
                  </select>
                </div>

                {/* Kam? */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cílová destinace
                  </label>
                  <DestinationAutocomplete
                    value={destination}
                    onChange={setDestination}
                    onSelect={(dest) => {
                      setDestination(dest.name);
                      trackFormInteraction("hero_redesign", "destination");
                    }}
                    placeholder="Kam letíte? (např. Řím, Paříž)"
                    className="flex-1"
                    inputClassName="h-12 border border-gray-300 font-medium focus:border-[#1565C0] focus:ring-[#1565C0]"
                  />
                </div>

                {/* Délka pobytu */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Termín / Délka
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => {
                      setDuration(e.target.value);
                      trackFormInteraction("hero_redesign", "duration");
                    }}
                    className="w-full h-12 px-3 border border-gray-300 rounded-lg font-medium text-gray-800 text-sm bg-white"
                  >
                    <option value="Prodloužený víkend">Prodloužený víkend</option>
                    <option value="1 týden">1 týden</option>
                    <option value="2 týdny">2 týdny</option>
                    <option value="Flexibilní">Flexibilní termín</option>
                  </select>
                </div>

                {/* Počet osob */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Počet cestujících
                  </label>
                  <select
                    value={passengers}
                    onChange={(e) => {
                      setPassengers(Number(e.target.value));
                      trackFormInteraction("hero_redesign", "passengers");
                    }}
                    className="w-full h-12 px-3 border border-gray-300 rounded-lg font-medium text-gray-800 text-sm bg-white"
                  >
                    <option value={1}>1 dospělý</option>
                    <option value={2}>2 dospělí</option>
                    <option value={3}>3 dospělí</option>
                    <option value={4}>4 dospělí</option>
                  </select>
                </div>

                {/* CTA Button */}
                <div className="flex flex-col items-end justify-end">
                  <Button
                    onClick={handleSearch}
                    className={`w-full h-12 text-white font-bold text-base shadow-lg ${heroCta.color || 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'}`}
                  >
                    {heroCta.emoji && <span className="mr-1">{heroCta.emoji}</span>}
                    {heroCta.text.toUpperCase()}
                  </Button>
                  {heroCta.subtext && (
                    <p className="text-xs text-center text-green-600 font-semibold mt-1 w-full">{heroCta.subtext}</p>
                  )}
                </div>
              </div>

              {/* Transparent note */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-500">
                <span>🇨🇿 <strong>České letenky:</strong> Porovnáváme odlety z Prahy, Vídně a Bratislavy</span>
                <span className="text-gray-400">Rezervace a platba probíhá u licencovaného partnera Pelikán.cz</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/90 backdrop-blur-md rounded-full px-5 py-2.5 shadow-md flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-xs text-gray-900">Oficiální partner Pelikán.cz (IATA)</span>
              </div>
              <div className="bg-white/90 backdrop-blur-md rounded-full px-5 py-2.5 shadow-md flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-xs text-gray-900">0 Kč provize pro uživatele</span>
              </div>
              <div className="bg-white/90 backdrop-blur-md rounded-full px-5 py-2.5 shadow-md flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                <span className="font-bold text-xs text-gray-900">Ručně i strojově ověřované tarify</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
