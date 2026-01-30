import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Heart, Palmtree, MapPin, Clock, ArrowRight, Filter, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dovolene() {
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc">("default");
  const [country, setCountry] = useState<string>("");

  const { data: vacations, isLoading } = trpc.pelikan.getVacations.useQuery({
    sortBy,
    country: country || undefined,
    limit: 200,
  });

  // Track affiliate click
  const trackClick = trpc.affiliate.trackClick.useMutation();

  const handleOfferClick = (vacation: any) => {
    trackClick.mutate({
      destination: vacation.destination,
      destinationSlug: vacation.id,
      source: "vacations-page",
      affiliatePartner: "pelikan",
      affiliateUrl: vacation.link,
    });
  };

  // Get unique countries for filter
  const countries = vacations
    ? Array.from(new Set(vacations.map((v) => v.country))).filter(Boolean).sort()
    : [];

  // Generate simulated rating between 4.2 and 5.0
  const getSimulatedRating = (id: string) => {
    const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (4.2 + (hash % 9) * 0.1).toFixed(1);
  };

  // Generate star rating display
  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={i} className="text-yellow-500">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-500">★</span>}
        <span className="font-medium ml-1">{rating}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <img src="/logo.png" alt="Akční Letenky" className="h-12 cursor-pointer" />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/levne-letenky" className="text-gray-600 hover:text-[#1a5276]">
                ✈️ LEVNÉ LETENKY
              </Link>
              <Link href="/dovolene" className="text-[#1a5276] font-semibold border-b-2 border-[#E91E63]">
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
      <section className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] text-white py-12">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🏖️ Dovolené a Zájezdy
          </h1>
          <p className="text-xl opacity-90 mb-2">
            {vacations?.length || 0} aktuálních nabídek dovolených
          </p>
          <p className="text-lg opacity-75">
            Objevte skvělé zájezdy s ubytováním a stravou za výhodné ceny.
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

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Řazení" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Výchozí</SelectItem>
                <SelectItem value="price_asc">Cena: nejnižší</SelectItem>
                <SelectItem value="price_desc">Cena: nejvyšší</SelectItem>
              </SelectContent>
            </Select>

            {country && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCountry("")}
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
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : vacations && vacations.length > 0 ? (
            <div className="grid gap-4">
              {vacations.map((vacation) => {
                const rating = getSimulatedRating(vacation.id);
                return (
                  <div
                    key={vacation.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="relative md:w-72 h-48 md:h-auto flex-shrink-0">
                        <img
                          src={vacation.imageUrl}
                          alt={vacation.destination}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://cdn.pelikan.sk/files/marketing/ga-feed-img/universal.jpg";
                          }}
                        />
                        {vacation.discount && (
                          <span className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                            {vacation.discount}
                          </span>
                        )}
                        <button className="absolute top-3 left-3 bg-white/90 p-2 rounded-full hover:bg-white transition-colors">
                          <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                        </button>
                        <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                          <Palmtree className="w-4 h-4" />
                          Dovolená
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4 text-green-500" />
                            <span>{vacation.country}{'location' in vacation && vacation.location ? ` • ${vacation.location}` : ''}</span>
                          </div>
                          {renderStars(rating)}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {vacation.title}
                        </h3>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {vacation.description}
                        </p>

                        <div className="flex flex-wrap gap-3 mb-4">
                          {'duration' in vacation && vacation.duration && (
                            <span className="inline-flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                              <Clock className="w-4 h-4" />
                              {vacation.duration}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            <MapPin className="w-4 h-4" />
                            {vacation.destination}
                          </span>
                          <span className="inline-flex items-center gap-1 text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                            ✓ Ubytování v ceně
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <span className="text-3xl font-bold text-[#FF6B00]">
                              {vacation.salePrice.toLocaleString("cs-CZ")} Kč
                            </span>
                            <span className="text-gray-500 text-sm ml-2">za osobu</span>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={vacation.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleOfferClick(vacation)}
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
              <Palmtree className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Žádné dovolené nenalezeny
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
