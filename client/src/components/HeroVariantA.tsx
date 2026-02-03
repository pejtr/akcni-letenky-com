/**
 * Hero Variant A - Original Simple Design
 * 
 * This is the control variant for A/B testing.
 * Features: Simple search form, minimal styling, no trust badges
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { trackCTAClick, trackFormInteraction } from "@/lib/abTest";

interface HeroVariantAProps {
  onSearch: (destination: string, passengers: number) => void;
}

export default function HeroVariantA({ onSearch }: HeroVariantAProps) {
  const [destination, setDestination] = React.useState("");
  const [passengers, setPassengers] = React.useState(1);

  const handleSearch = () => {
    trackCTAClick("hero_redesign", "Vyhledat letenky");
    onSearch(destination, passengers);
  };

  return (
    <section 
      className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20 overflow-hidden"
      style={{
        backgroundImage: 'url("/hero-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Animated Background Layer */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'url("/hero-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'float 20s ease-in-out infinite',
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1.05);
          }
          50% {
            transform: translateY(-10px) scale(1.08);
          }
        }
      `}</style>

      {/* Content */}
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Nejlevnější letenky po celém světě
          </h1>
          <p className="text-xl mb-8 text-white/90">
            Najděte si tu nejlepší nabídku pro vaši dovolenou
          </p>

          {/* Simple Search Form */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kam se chystáte?
                </label>
                <Input
                  type="text"
                  placeholder="Zadejte destinaci"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    trackFormInteraction("hero_redesign", "destination");
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kolik osob?
                </label>
                <select
                  value={passengers}
                  onChange={(e) => {
                    setPassengers(Number(e.target.value));
                    trackFormInteraction("hero_redesign", "passengers");
                  }}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md"
                >
                  <option value={1}>1 dospělý</option>
                  <option value={2}>2 dospělí</option>
                  <option value={3}>3 dospělí</option>
                  <option value={4}>4 dospělí</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Vyhledat letenky
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import * as React from "react";
