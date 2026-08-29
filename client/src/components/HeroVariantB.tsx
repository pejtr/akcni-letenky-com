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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kam se chystáte?
                  </label>
                  <select
                    value={from}
                    onChange={(e) => {
                      setFrom(e.target.value);
                      trackFormInteraction("hero_redesign", "from");
                    }}
                    className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg font-medium"
                  >
                    <option value="Praha">Odkud?</option>
                    <option value="Praha">Praha</option>
                    <option value="Brno">Brno</option>
                    <option value="Ostrava">Ostrava</option>
                  </select>
                </div>

                {/* Kam? */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destinace
                  </label>
                  <DestinationAutocomplete
                    value={destination}
                    onChange={setDestination}
                    onSelect={(dest) => {
                      setDestination(dest.name);
                      trackFormInteraction("hero_redesign", "destination");
                    }}
                    placeholder="Kam?"
                    className="flex-1"
                    inputClassName="h-12 border-2 border-gray-300 font-medium focus:border-[#1565C0] focus:ring-[#1565C0]"
                  />
                </div>

                {/* Délka pobytu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Délka pobytu
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => {
                      setDuration(e.target.value);
                      trackFormInteraction("hero_redesign", "duration");
                    }}
                    className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg font-medium"
                  >
                    <option value="1 týden">1 týden</option>
                    <option value="2 týdny">2 týdny</option>
                    <option value="3 týdny">3 týdny</option>
                    <option value="1 měsíc">1 měsíc</option>
                  </select>
                </div>

                {/* Počet osob */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Počet osob
                  </label>
                  <select
                    value={passengers}
                    onChange={(e) => {
                      setPassengers(Number(e.target.value));
                      trackFormInteraction("hero_redesign", "passengers");
                    }}
                    className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg font-medium"
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
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white rounded-full px-6 py-3 shadow-lg flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-gray-900">Aktuální akce denně</span>
              </div>
              <div className="bg-white rounded-full px-6 py-3 shadow-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-gray-900">Ceny z promo feedu</span>
              </div>
              <div className="bg-white rounded-full px-6 py-3 shadow-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-bold text-gray-900">Zdroj nabídek: Pelikán</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
