import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Heart, Plane, MapPin, Clock, ArrowRight, Filter, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function LevneLetenky() {
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "popularity" | "departure">("default");
  const [country, setCountry] = useState<string>("");
  const [departure, setDeparture] = useState<string>("");

  const { data: flights, isLoading } = trpc.pelikan.getFlights.useQuery({
    sortBy,
    country: country || undefined,
    departure: departure || undefined,
    limit: 200,
  });

  // Track affiliate click
  const trackClick = trpc.affiliate.trackClick.useMutation();

  const handleOfferClick = (flight: any) => {
    trackClick.mutate({
      destination: flight.destination,
      destinationSlug: flight.id,
      source: "flights-page",
      affiliatePartner: "pelikan",
      affiliateUrl: flight.link,
    });
  };

  // Get unique countries for filter
  const countries = flights
    ? Array.from(new Set(flights.map((f) => f.country))).filter(Boolean).sort()
    : [];

  // Get unique departures for filter (only flights have departure)
  const departures = flights
    ? Array.from(new Set(flights.map((f) => 'departure' in f ? f.departure : null).filter((d): d is string => d !== null))).sort()
    : [];

  // Generate simulated rating between 4.2 and 5.0
  const getSimulatedRating = (id: string) => {
    const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (4.2 + (hash % 9) * 0.1).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <img src="/logo.png" alt="Akční Letenky" className="h-12 cursor-pointer" />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/levne-letenky" className="text-[#1a5276] font-semibold border-b-2 border-[#E91E63]">
                ✈️ LEVNÉ LETENKY
              </Link>
              <Link href="/dovolene" className="text-gray-600 hover:text-[#1a5276]">
                ⭐ DOVOLENÉ
              </Link>
              <Link href="/" className="text-gray-600 hover:text-[#1a5276]">
                🏠 Domů
              </Link>
            </nav>
            <a
              href="tel:+420223340510"
              className="text-[#E91E63] font-bold text-lg flex items-center gap-2"
            >
              📞 223 340 510
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#1a5276] to-[#2980b9] text-white py-12">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            ✈️ Levné Zpáteční Letenky
          </h1>
          <p className="text-xl opacity-90 mb-2">
            {flights?.length || 0} aktuálních nabídek letů
          </p>
          <p className="text-lg opacity-75">
            Nejlevnější zpáteční letenky s až 50% slevou. Objevte tisíce destinací po celém světě.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b py-4 sticky top-[60px] z-40">
        <div className="container">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Filtry:</span>
            </div>

            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Všechny země" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny země</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={departure} onValueChange={setDeparture}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Všechna odletová místa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechna odletová místa</SelectItem>
                {departures.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Řazení" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Výchozí</SelectItem>
                <SelectItem value="price_asc">Cena: nejnižší</SelectItem>
                <SelectItem value="price_desc">Cena: nejvyšší</SelectItem>
                <SelectItem value="popularity">Nejpopulárnější</SelectItem>
                <SelectItem value="departure">Datum odletu</SelectItem>
              </SelectContent>
            </Select>

            {(country || departure) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCountry("");
                  setDeparture("");
                }}
              >
                Zrušit filtry
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Offers Grid */}
      <section className="py-8">
        <div className="container">
          {isLoading ? (
            <div className="grid gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : flights && flights.length > 0 ? (
            <div className="grid gap-4">
              {flights.map((flight) => {
                const rating = getSimulatedRating(flight.id);
                return (
                  <div
                    key={flight.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="relative md:w-72 h-48 md:h-auto flex-shrink-0">
                        <img
                          src={flight.imageUrl}
                          alt={flight.destination}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://cdn.pelikan.sk/files/marketing/ga-feed-img/universal.jpg";
                          }}
                        />
                        {flight.discount && (
                          <span className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                            {flight.discount}
                          </span>
                        )}
                        <button className="absolute top-3 left-3 bg-white/90 p-2 rounded-full hover:bg-white transition-colors">
                          <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                        </button>
                        <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                          <Plane className="w-4 h-4" />
                          {flight.destination}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4 text-green-500" />
                            <span>{flight.country}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="font-medium">{rating}</span>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {flight.title}
                        </h3>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {flight.description}
                        </p>

                        <div className="flex flex-wrap gap-3 mb-4">
                          {'departure' in flight && flight.departure && (
                            <span className="inline-flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                              <Plane className="w-4 h-4" />
                              Odlet: {flight.departure}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            <MapPin className="w-4 h-4" />
                            {flight.destination}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <span className="text-3xl font-bold text-[#1a5276] whitespace-nowrap">
                              {flight.salePrice.toLocaleString("cs-CZ")} Kč
                            </span>
                            <span className="text-gray-500 text-sm ml-2">za osobu · zpáteční</span>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={flight.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleOfferClick(flight)}
                              className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E65C00] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                            >
                              Zobrazit na Pelikán.cz
                              <ArrowRight className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Žádné letenky nenalezeny
              </h3>
              <p className="text-gray-500">
                Zkuste změnit filtry nebo se vraťte později.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a5276] text-white py-8">
        <div className="container text-center">
          <p className="opacity-75">
            © 2024 Akční Letenky. Všechna práva vyhrazena.
          </p>
          <p className="text-sm opacity-50 mt-2">
            Nabídky jsou poskytovány partnerem Pelikán.cz
          </p>
        </div>
      </footer>
    </div>
  );
}
