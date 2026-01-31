import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Heart, Palmtree, MapPin, Clock, ArrowRight, Filter, Plane, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// Domestic countries list
const DOMESTIC_COUNTRIES = ["Česká republika", "Slovensko", "Rakousko", "Maďarsko", "Polsko"];

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

  // Split vacations into foreign and domestic
  const { foreignVacations, domesticVacations } = useMemo(() => {
    if (!vacations) return { foreignVacations: [], domesticVacations: [] };
    
    const foreign = vacations.filter(v => !DOMESTIC_COUNTRIES.includes(v.country));
    const domestic = vacations.filter(v => DOMESTIC_COUNTRIES.includes(v.country));
    
    return { foreignVacations: foreign, domesticVacations: domestic };
  }, [vacations]);

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

  // Vacation card component
  const VacationCard = ({ vacation, compact = false }: { vacation: any; compact?: boolean }) => {
    const rating = getSimulatedRating(vacation.id);
    
    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
        {compact ? (
          // Compact card for two-column layout
          <div className="flex flex-col">
            <div className="relative h-40">
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
                <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                  {vacation.discount}
                </span>
              )}
              <button className="absolute top-2 left-2 bg-white/90 p-1.5 rounded-full hover:bg-white transition-colors">
                <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {vacation.country}
                </span>
                {renderStars(rating)}
              </div>
              <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                {vacation.title}
              </h3>
              <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                {vacation.description}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-[#FF6B00]">
                    {vacation.salePrice.toLocaleString("cs-CZ")} Kč
                  </span>
                  <span className="text-gray-500 text-xs ml-1">/ os.</span>
                </div>
                <a
                  href={vacation.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleOfferClick(vacation)}
                  className="inline-flex items-center gap-1 bg-[#FF6B00] hover:bg-[#E65C00] text-white font-semibold px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  Zobrazit
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ) : (
          // Full card for single column
          <div className="flex flex-col md:flex-row">
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
        )}
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

      {/* Two-Column Layout */}
      <section className="py-8">
        <div className="container">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Foreign Destinations */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-[#FF6B00]">
                  <div className="bg-[#FF6B00] p-2 rounded-lg">
                    <Plane className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Zahraniční dovolené</h2>
                    <p className="text-gray-500 text-sm">Exotika, moře, slunce</p>
                  </div>
                  <span className="ml-auto bg-[#FF6B00] text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {foreignVacations.length} nabídek
                  </span>
                </div>
                
                {foreignVacations.length > 0 ? (
                  <div className="space-y-4">
                    {foreignVacations.slice(0, 30).map((vacation) => (
                      <VacationCard key={vacation.id} vacation={vacation} compact />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Plane className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Žádné zahraniční dovolené</p>
                  </div>
                )}
              </div>

              {/* Right Column - Domestic Destinations */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-[#4CAF50]">
                  <div className="bg-[#4CAF50] p-2 rounded-lg">
                    <Mountain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Domácí dovolené</h2>
                    <p className="text-gray-500 text-sm">Česko, Slovensko, Rakousko, Maďarsko</p>
                  </div>
                  <span className="ml-auto bg-[#4CAF50] text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {domesticVacations.length} nabídek
                  </span>
                </div>
                
                {domesticVacations.length > 0 ? (
                  <div className="space-y-4">
                    {domesticVacations.slice(0, 30).map((vacation) => (
                      <VacationCard key={vacation.id} vacation={vacation} compact />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Mountain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Žádné domácí dovolené</p>
                  </div>
                )}
              </div>
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
