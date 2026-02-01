/**
 * Hero Variant B - High-Converting Design
 * 
 * This is the test variant for A/B testing.
 * Features: Yellow gradient header, enhanced search form with dropdowns,
 * trust badges, blue info banner
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Flame, Zap, CheckCircle } from "lucide-react";
import { trackCTAClick, trackFormInteraction } from "@/lib/abTest";

interface HeroVariantBProps {
  onSearch: (from: string, destination: string, duration: string, passengers: number) => void;
}

export default function HeroVariantB({ onSearch }: HeroVariantBProps) {
  const [from, setFrom] = React.useState("Praha");
  const [destination, setDestination] = React.useState("");
  const [duration, setDuration] = React.useState("1 týden");
  const [passengers, setPassengers] = React.useState(1);

  const handleSearch = () => {
    trackCTAClick("hero_redesign", "VYHLEDAT LETENKY");
    onSearch(from, destination, duration, passengers);
  };

  return (
    <>
      {/* Hero Section with Yellow Gradient */}
      <section 
        className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 py-20"
        style={{
          backgroundImage: 'url("/hero-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/90 via-yellow-500/90 to-orange-500/90"></div>

        {/* Content */}
        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Headline with Yellow Badge */}
            <div className="text-center mb-8">
              <div className="inline-block bg-yellow-300 text-gray-900 px-8 py-4 rounded-2xl shadow-2xl mb-6">
                <h1 className="text-3xl md:text-4xl font-black">
                  NEJLEVNĚJŠÍ AKČNÍ LETENKY
                </h1>
              </div>
              <p className="text-2xl font-bold text-white drop-shadow-lg">
                Ušetřete až 60% na letkách po celém světě!
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
                <div className="flex items-end">
                  <Button
                    onClick={handleSearch}
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-base shadow-lg"
                  >
                    VYHLEDAT LETENKY
                  </Button>
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

      {/* Blue Info Banner */}
      <div className="bg-blue-600 text-white py-4">
        <div className="container">
          <div className="flex flex-wrap justify-center items-center gap-6 text-center">
            <a href="#" className="hover:underline font-medium">
              Ušetřete pod 1000 Kč
            </a>
            <span className="hidden md:inline">|</span>
            <a href="#" className="hover:underline font-medium">
              Eurovíkendy
            </a>
            <span className="hidden md:inline">|</span>
            <a href="#" className="hover:underline font-medium">
              Nejlevnější letenky od 500 Kč
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

import * as React from "react";
