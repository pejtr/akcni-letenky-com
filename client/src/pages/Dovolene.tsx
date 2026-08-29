import { useState, useMemo, useEffect } from "react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { Heart, Palmtree, MapPin, Clock, ArrowRight, Filter, Plane, Mountain, Hotel, X, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/Navigation";
import CrossPromoSlot from "@/components/CrossPromoSlot";
import { useSearch, Link } from "wouter";
import { bookingSearchLink } from "@shared/affiliateLinks";

// Domestic countries list
const DOMESTIC_COUNTRIES = ["Česká republika", "Slovensko", "Rakousko", "Maďarsko", "Polsko"];

export default function Dovolene() {
  const searchString = useSearch();
  const searchParams = useMemo(() => new URLSearchParams(searchString), [searchString]);
  const initialDestination = searchParams.get("destination") || searchParams.get("q") || "";
  const initialCountry = searchParams.get("country") || "";

  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc">("default");
  const [country, setCountry] = useState<string>(initialCountry);
  const [destinationFilter, setDestinationFilter] = useState<string>(initialDestination);

  // Sync state if URL query changes
  useEffect(() => {
    const dest = searchParams.get("destination") || searchParams.get("q") || "";
    const cntry = searchParams.get("country") || "";
    setDestinationFilter(dest);
    if (cntry) setCountry(cntry);
  }, [searchParams]);

  // Primary query (filtered by destination if specified)
  const { data: vacations, isLoading } = trpc.pelikan.getVacations.useQuery({
    sortBy,
    country: country && country !== "all" ? country : undefined,
    destination: destinationFilter || undefined,
    limit: 200,
  });

  // Secondary query for fallback (all vacations) if destination filter yields 0 packages
  const { data: allVacations } = trpc.pelikan.getVacations.useQuery(
    { sortBy, limit: 100 },
    { enabled: Boolean(destinationFilter && vacations && vacations.length === 0) }
  );

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

  // The active list to display in columns
  const activeVacations = useMemo(() => {
    if (vacations && vacations.length > 0) return vacations;
    if (destinationFilter && allVacations) return allVacations;
    return vacations || [];
  }, [vacations, allVacations, destinationFilter]);

  // Split vacations into foreign and domestic
  const { foreignVacations, domesticVacations } = useMemo(() => {
    if (!activeVacations) return { foreignVacations: [], domesticVacations: [] };
    
    const foreign = activeVacations.filter(v => !DOMESTIC_COUNTRIES.includes(v.country));
    const domestic = activeVacations.filter(v => DOMESTIC_COUNTRIES.includes(v.country));
    
    return { foreignVacations: foreign, domesticVacations: domestic };
  }, [activeVacations]);

  // Get unique countries for filter
  const countries = vacations
    ? Array.from(new Set(vacations.map((v) => v.country))).filter(Boolean).sort()
    : [];

  // Vacation card component
  const VacationCard = ({ vacation, compact = false }: { vacation: any; compact?: boolean }) => {
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
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Zájezd</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                {vacation.title}
              </h3>
              <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                {vacation.description}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-[#FF6B00] whitespace-nowrap">
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
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">Ověřený balíček</span>
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
                  <span className="text-3xl font-bold text-[#FF6B00] whitespace-nowrap">
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
      <SEO
        title={destinationFilter ? `Dovolená ${destinationFilter} | Akční Letenky` : "Dovolená | Akční Letenky"}
        description={destinationFilter ? `Levné zájezdy a dovolená v destinaci ${destinationFilter}. Porovnejte akční nabídky.` : "Levné zájezdy a dovolená. Vyberte si z nabídky nejlepších cestovních kanceláří za skvělé ceny."}
        canonical="https://www.akcni-letenky.com/dovolene"
      />
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] text-white py-12 pt-24">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🏖️ {destinationFilter ? `Dovolené a Zájezdy: ${destinationFilter}` : "Dovolené a Zájezdy"}
          </h1>
          <p className="text-xl opacity-90 mb-2">
            {activeVacations?.length || 0} aktuálních nabídek dovolených
          </p>
          <p className="text-lg opacity-75">
            {destinationFilter
              ? `Výsledky pro vyhledanou destinaci "${destinationFilter}".`
              : "Objevte skvělé zájezdy s ubytováním a stravou za výhodné ceny."}
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

            {destinationFilter && (
              <div className="flex items-center gap-1.5 bg-orange-100 text-orange-900 border border-orange-300 px-3 py-1.5 rounded-lg text-sm font-semibold">
                <Search className="w-3.5 h-3.5 text-orange-600" />
                <span>Destinace: {destinationFilter}</span>
                <button
                  onClick={() => setDestinationFilter("")}
                  className="ml-1 hover:text-red-600 transition-colors"
                  title="Zrušit filtr destinace"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

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

            {(country || destinationFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCountry("");
                  setDestinationFilter("");
                }}
              >
                Zrušit všechny filtry
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-8">
        <div className="container">
          {/* Destination Solution Card if 0 packages for searched destination */}
          {destinationFilter && vacations && vacations.length === 0 && (
            <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white border-2 border-orange-200 rounded-3xl p-6 md:p-10 mb-10 shadow-lg">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold mb-3">
                    <Sparkles className="w-3.5 h-3.5" /> Doporučené řešení pro vás
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                    Hledáte dovolenou v destinaci {destinationFilter}?
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    Kompletní zájezdový balíček od cestovních kanceláří pro {destinationFilter} je momentálně vyprodán. Můžete si však snadno rezervovat akční letenku a vybrat ověřený hotel samostatně — ušetříte často až 40 %!
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                  <Link href={`/letenky-${destinationFilter.toLowerCase().trim().replace(/\s+/g, "-")}`}>
                    <Button className="bg-[#E91E63] hover:bg-[#D81B60] text-white font-bold px-6 py-6 rounded-xl w-full sm:w-auto flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20">
                      <Plane className="w-5 h-5" />
                      Akční letenky: {destinationFilter}
                    </Button>
                  </Link>
                  <a
                    href={bookingSearchLink(destinationFilter)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="border-orange-300 hover:bg-orange-100 text-orange-950 font-bold px-6 py-6 rounded-xl w-full sm:w-auto flex items-center justify-center gap-2">
                      <Hotel className="w-5 h-5 text-orange-600" />
                      Hotely na Booking.com
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}

          {destinationFilter && vacations && vacations.length === 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Nebo si vyberte z dalších aktuálně dostupných zájezdů a pobytů:
              </h3>
            </div>
          )}

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
                    <p className="text-gray-500">Žádné zahraniční dovolené pro vybraný filtr</p>
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
                    <p className="text-gray-500">Žádné domácí dovolené pro vybraný filtr</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Travel Revenue Network Cross Promo */}
          <div className="mt-12">
            <CrossPromoSlot placement="package_holiday_alternative" context={{ pageType: "dovolene" }} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
