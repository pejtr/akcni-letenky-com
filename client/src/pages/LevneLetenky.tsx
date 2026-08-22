import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Heart, Plane, MapPin, Clock, ArrowRight, Filter, Sparkles, ShieldCheck, Globe, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { pelikanDeepLink } from "@shared/affiliateLinks";

// European destinations list for categorizing flights
const EUROPEAN_DESTINATIONS = [
  "Londýn", "Paříž", "Řím", "Barcelona", "Florencie", "Benátky", "Málaga", "Milán",
  "Lisabon", "Madrid", "Vídeň", "Amsterdam", "Berlín", "Atény", "Brusel", "Kodaň"
];

// Rich fallback deals dataset for high availability
const defaultFlightDeals = [
  {
    id: "fl-1",
    title: "Paříž (CDG) z Prahy",
    destination: "Paříž",
    country: "Francie",
    departureCity: "Praha (PRG)",
    flightType: "Přímý let",
    duration: "1h 45m",
    originalPrice: 2490,
    salePrice: 1150,
    discountPercent: 54,
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    pelikanPath: "/cs/akcni-letenky/praha/pariz?data[from]=PRG&data[to]=PAR",
    isEuropean: true,
  },
  {
    id: "fl-2",
    title: "Londýn (STN) z Prahy",
    destination: "Londýn",
    country: "Velká Británie",
    departureCity: "Praha (PRG)",
    flightType: "Přímý let",
    duration: "2h 00m",
    originalPrice: 1890,
    salePrice: 790,
    discountPercent: 58,
    imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    pelikanPath: "/cs/akcni-letenky/praha/londyn?data[from]=PRG&data[to]=LON",
    isEuropean: true,
  },
  {
    id: "fl-3",
    title: "Dubaj (DXB) z Prahy",
    destination: "Dubaj",
    country: "Spojené arabské emiráty",
    departureCity: "Praha (PRG)",
    flightType: "Přímý let",
    duration: "6h 10m",
    originalPrice: 12890,
    salePrice: 6990,
    discountPercent: 46,
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    pelikanPath: "/cs/akcni-letenky/praha/dubaj?data[from]=PRG&data[to]=DXB",
    isEuropean: false,
  },
  {
    id: "fl-4",
    title: "Řím (FCO) z Prahy",
    destination: "Řím",
    country: "Itálie",
    departureCity: "Praha (PRG)",
    flightType: "Přímý let",
    duration: "1h 50m",
    originalPrice: 2190,
    salePrice: 890,
    discountPercent: 59,
    imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    pelikanPath: "/cs/akcni-letenky/praha/rim?data[from]=PRG&data[to]=ROM",
    isEuropean: true,
  },
  {
    id: "fl-5",
    title: "Barcelona (BCN) z Prahy",
    destination: "Barcelona",
    country: "Španělsko",
    departureCity: "Praha (PRG)",
    flightType: "Přímý let",
    duration: "2h 25m",
    originalPrice: 2890,
    salePrice: 1290,
    discountPercent: 55,
    imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
    pelikanPath: "/cs/akcni-letenky/praha/barcelona?data[from]=PRG&data[to]=BCN",
    isEuropean: true,
  },
  {
    id: "fl-6",
    title: "Bali (DPS) z Prahy",
    destination: "Bali",
    country: "Indonésie",
    departureCity: "Praha (PRG)",
    flightType: "1 přestup",
    duration: "15h 30m",
    originalPrice: 24890,
    salePrice: 14990,
    discountPercent: 40,
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    pelikanPath: "/cs/akcni-letenky/praha/bali?data[from]=PRG&data[to]=DPS",
    isEuropean: false,
  },
  {
    id: "fl-7",
    title: "New York (JFK) z Prahy",
    destination: "New York",
    country: "USA",
    departureCity: "Praha (PRG)",
    flightType: "1 přestup",
    duration: "10h 15m",
    originalPrice: 16890,
    salePrice: 8990,
    discountPercent: 47,
    imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    pelikanPath: "/cs/akcni-letenky/praha/new-york?data[from]=PRG&data[to]=NYC",
    isEuropean: false,
  },
  {
    id: "fl-8",
    title: "Málaga (AGP) z Prahy",
    destination: "Málaga",
    country: "Španělsko",
    departureCity: "Praha (PRG)",
    flightType: "Přímý let",
    duration: "3h 15m",
    originalPrice: 3290,
    salePrice: 1490,
    discountPercent: 55,
    imageUrl: "https://images.unsplash.com/photo-1561632669-6e0e99df0736?w=800&q=80",
    pelikanPath: "/cs/akcni-letenky/praha/malaga?data[from]=PRG&data[to]=AGP",
    isEuropean: true,
  },
  {
    id: "fl-9",
    title: "Réunion (RUN) z Prahy",
    destination: "Réunion",
    country: "Francie (Indický oceán)",
    departureCity: "Praha (PRG)",
    flightType: "1 přestup",
    duration: "14h 00m",
    originalPrice: 28990,
    salePrice: 17490,
    discountPercent: 40,
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    pelikanPath: "/cs/akcni-letenky/praha/reunion?data[from]=PRG&data[to]=RUN",
    isEuropean: false,
  }
];

export default function LevneLetenky() {
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc">("default");
  const [countryFilter, setCountryFilter] = useState<string>("");

  const trackClick = trpc.affiliate.trackClick.useMutation();

  const handleOfferClick = (flight: any) => {
    trackClick.mutate({
      destination: flight.destination,
      destinationSlug: flight.id,
      source: "flights-page",
      affiliatePartner: "pelikan",
      affiliateUrl: flight.pelikanUrl || pelikanDeepLink(flight.pelikanPath, { campaign: "flights-page-card" }),
    });
  };

  // Filter and sort flight deals
  const filteredFlights = useMemo(() => {
    let result = [...defaultFlightDeals];

    if (countryFilter && countryFilter !== "all") {
      result = result.filter(f => f.country === countryFilter || f.destination === countryFilter);
    }

    if (sortBy === "price_asc") {
      result.sort((a, b) => a.salePrice - b.salePrice);
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => b.salePrice - a.salePrice);
    }

    return result;
  }, [countryFilter, sortBy]);

  // Split into European and Overseas / Exotic
  const { europeanFlights, exoticFlights } = useMemo(() => {
    const euro = filteredFlights.filter(f => f.isEuropean || EUROPEAN_DESTINATIONS.includes(f.destination));
    const exotic = filteredFlights.filter(f => !f.isEuropean && !EUROPEAN_DESTINATIONS.includes(f.destination));
    return { europeanFlights: euro, exoticFlights: exotic };
  }, [filteredFlights]);

  const uniqueCountries = useMemo(() => {
    return Array.from(new Set(defaultFlightDeals.map(f => f.country))).sort();
  }, []);

  const FlightCard = ({ flight, compact = false }: { flight: any; compact?: boolean }) => {
    const affiliateUrl = pelikanDeepLink(flight.pelikanPath, {
      campaign: "flights-grid-card",
      channel: "deals-listing",
      content: flight.id,
    });

    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col justify-between group">
        <div className="relative h-48 overflow-hidden">
          <img
            src={flight.imageUrl}
            alt={flight.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          {/* Discount Badge */}
          {flight.discountPercent && (
            <span className="absolute top-3 right-3 bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-black shadow-md">
              -{flight.discountPercent}% SLEVA
            </span>
          )}

          <button className="absolute top-3 left-3 bg-white/90 p-1.5 rounded-full hover:bg-white transition-colors shadow">
            <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </button>

          <div className="absolute bottom-3 left-3 text-white">
            <div className="flex items-center gap-1 text-xs font-medium opacity-90">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span>{flight.country}</span>
            </div>
            <h3 className="font-black text-lg text-white leading-tight">{flight.title}</h3>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
              <span className="flex items-center gap-1 font-semibold text-gray-700">
                <Plane className="w-3.5 h-3.5 text-blue-600" />
                {flight.flightType}
              </span>
              <span className="flex items-center gap-1 text-gray-600">
                <Clock className="w-3.5 h-3.5" />
                {flight.duration}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-yellow-500 mb-4">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              <span className="text-gray-500 font-semibold ml-1">4.8 (Ověřeno Pelikán)</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div>
              {flight.originalPrice && (
                <span className="text-xs text-gray-400 line-through block">
                  {flight.originalPrice.toLocaleString("cs-CZ")} Kč
                </span>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#FF6B00]">
                  {flight.salePrice.toLocaleString("cs-CZ")} Kč
                </span>
                <span className="text-xs text-gray-500">/ os.</span>
              </div>
            </div>

            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleOfferClick(flight)}
              className="inline-flex items-center gap-1.5 bg-[#FF6B00] hover:bg-[#E65C00] text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-md text-xs sm:text-sm hover:scale-105"
            >
              <span>Zobrazit</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50 flex flex-col justify-between">
      <SEO 
        title="Levné letenky z Prahy i Kamkoliv od 790 Kč"
        description="Aktuální nabídka levných letenek z Prahy do celého světa. Denně aktualizované ceny od 790 Kč. Porovnejte a ušetřete na svých cestách!"
        canonical="https://www.akcni-letenky.com/levne-letenky"
      />
      <div>
        <Navigation />

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] text-white py-12 pt-24 shadow-md">
          <div className="container text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold mb-4 border border-white/30">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Ověřené Pelikán.cz nabídky s garancí najlepších cen</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight">
              ✈️ Akční & Levné Letenky z Prahy
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-2">
              {filteredFlights.length} aktuálních akčních letenek za výhodné ceny
            </p>
            <p className="text-sm md:text-base opacity-80 max-w-2xl mx-auto">
              Sledujeme denně akční ceny letenek do celého světa. Rezervujte si letenku přímo na Pelikán.cz bez skrytých poplatků!
            </p>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="bg-white border-b py-4 sticky top-[60px] z-40 shadow-sm">
          <div className="container">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                  <Filter className="w-4 h-4 text-[#FF6B00]" />
                  <span>Filtrovat letenky:</span>
                </div>

                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Všechny země" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Všechny země</SelectItem>
                    {uniqueCountries.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Řazení nabídek" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Výchozí</SelectItem>
                    <SelectItem value="price_asc">Cena: od nejnižší</SelectItem>
                    <SelectItem value="price_desc">Cena: od nejvyšší</SelectItem>
                  </SelectContent>
                </Select>

                {countryFilter && (
                  <Button variant="ghost" size="sm" onClick={() => setCountryFilter("")} className="text-xs text-red-500">
                    Zrušit filtry
                  </Button>
                )}
              </div>

              <div className="text-xs text-gray-500 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Oficiální partnerské odkazování Pelikán.cz</span>
              </div>
            </div>
          </div>
        </section>

        {/* Split Grid Section - Foreign / Exotic vs European */}
        <section className="py-10">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Column 1: Evropské & Víkendové letenky */}
              <div>
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                      <Plane className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-gray-900">Evropské & Eurovíkendy</h2>
                      <p className="text-xs text-gray-500">Rychlé přímé lety z Prahy po Evropě</p>
                    </div>
                  </div>
                  <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">
                    {europeanFlights.length} nabídek
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {europeanFlights.map((flight) => (
                    <FlightCard key={flight.id} flight={flight} />
                  ))}
                </div>
              </div>

              {/* Column 2: Exotické & Dálkové letenky */}
              <div>
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-orange-100 text-orange-700 rounded-xl">
                      <Globe className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-gray-900">Exotika & Dálkové Lety</h2>
                      <p className="text-xs text-gray-500">Tropické ráje, Asie, Emiráty & Amerika</p>
                    </div>
                  </div>
                  <span className="bg-orange-50 text-orange-700 font-bold px-3 py-1 rounded-full text-xs">
                    {exoticFlights.length} nabídek
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {exoticFlights.map((flight) => (
                    <FlightCard key={flight.id} flight={flight} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
