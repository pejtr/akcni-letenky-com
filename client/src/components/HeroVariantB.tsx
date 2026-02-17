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
      {/* Hero Section - Dynamic Slideshow */}
      <section 
        className="relative pt-36 pb-32 overflow-hidden"
      >
        {/* Dynamic Background Slideshow */}
        <HeroBackgroundSlideshow />
        
        {/* Subtle Overlay for readability */}
        <div className="absolute inset-0 bg-black/35 z-[1]"></div>

        {/* Content */}
        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Headline - Simple and Clean */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl mb-4">
                Nejlevnější letenky po celém světě
              </h1>
              <p className="text-xl md:text-2xl text-white/90 drop-shadow-lg">
                Najděte si tu nejlepší nabídku pro vaši dovolenou
              </p>
            </div>

            {/* Enhanced Search Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
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
                  <Input
                    type="text"
                    placeholder="Kam?"
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      trackFormInteraction("hero_redesign", "destination");
                    }}
                    className="h-12 border-2 border-gray-300 font-medium"
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
                <span className="font-bold text-gray-900">Sle až 60 %</span>
              </div>
              <div className="bg-white rounded-full px-6 py-3 shadow-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-gray-900">Nejlepší ceny</span>
              </div>
              <div className="bg-white rounded-full px-6 py-3 shadow-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-bold text-gray-900">Certifikováno</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
