import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Heart, Plane, MapPin, Clock, ArrowRight, Filter, SortAsc, SortDesc, Calendar, Share2, Globe } from "lucide-react";
import { trackViewContent, trackInitiateCheckout, trackAddToWishlist } from "@/lib/fbPixel";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/Navigation";
import { useABTest, trackABTestConversion } from "@/hooks/useABTest";
import SourceBadge from "@/components/SourceBadge";

export default function LevneLetenky() {
  // A/B Testing for CTA button text
  const { variant: ctaVariant, ctaText } = useABTest({
    name: "cta_button_flights",
    variants: ["zobrazit", "koupit", "zjistit"],
  });

  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "popularity" | "departure">("default");
  const [country, setCountry] = useState<string>("");
  const [departure, setDeparture] = useState<string>("");
  const [departureDate, setDepartureDate] = useState<string>("");
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(50000);
  const [currency, setCurrency] = useState<"CZK" | "EUR" | "USD" | "GBP">("CZK");
  const [directFlightsOnly, setDirectFlightsOnly] = useState<boolean>(false);

  // Real-time exchange rates from Czech National Bank (CNB)
  const { data: currencyData } = trpc.currency.getRates.useQuery(undefined, {
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });

  // Fallback static rates if API hasn't loaded yet
  const exchangeRates: Record<string, number> = currencyData?.rates ?? {
    CZK: 1,
    EUR: 0.040,
    USD: 0.043,
    GBP: 0.034,
  };
  const currencySymbols: Record<string, string> = currencyData?.symbols ?? { CZK: "Kč", EUR: "€", USD: "$", GBP: "£" };

  const convertPrice = (priceCzk: number): string => {
    const converted = priceCzk * exchangeRates[currency];
    if (currency === "CZK") return converted.toLocaleString("cs-CZ");
    return converted.toLocaleString("cs-CZ", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

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
    // FB Pixel: track checkout initiation for retargeting
    trackInitiateCheckout({
      contentName: `${flight.origin} → ${flight.destination}`,
      value: flight.salePrice || flight.price,
    });
  };

  // Track flight view for FB Pixel retargeting
  const handleFlightView = (flight: any) => {
    trackViewContent({
      contentName: `${flight.origin} → ${flight.destination}`,
      contentCategory: "flights",
      value: flight.salePrice || flight.price,
    });
  };

  // Track wishlist add for FB Pixel retargeting
  const handleWishlistPixel = (flight: any) => {
    trackAddToWishlist({
      contentName: `${flight.origin} → ${flight.destination}`,
      contentCategory: "flights",
      value: flight.salePrice || flight.price,
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
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#1a5276] to-[#2980b9] text-white py-12 pt-24">
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

            {/* Departure Date Filter */}
            <div className="relative">
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="pl-9 pr-3 py-2 border rounded-md text-sm w-[180px] bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Datum odletu"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Direct Flights Only Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-md border hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={directFlightsOnly}
                onChange={(e) => setDirectFlightsOnly(e.target.checked)}
                className="w-4 h-4 accent-[#E91E63] cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Pouze přímé lety</span>
            </label>

            {/* Price Range Slider */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md border">
              <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Cena:</span>
              <input
                type="range"
                min={0}
                max={50000}
                step={100}
                value={priceMin}
                onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax - 100))}
                className="w-20 h-1.5 accent-[#E91E63] cursor-pointer"
              />
              <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">{convertPrice(priceMin)} {currencySymbols[currency]}</span>
              <span className="text-xs text-gray-400">–</span>
              <input
                type="range"
                min={0}
                max={50000}
                step={100}
                value={priceMax}
                onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin + 100))}
                className="w-20 h-1.5 accent-[#E91E63] cursor-pointer"
              />
              <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">{convertPrice(priceMax)} {currencySymbols[currency]}</span>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border">
                <Globe className="w-3.5 h-3.5 text-gray-500" />
                {(["CZK", "EUR", "USD", "GBP"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                      currency === c
                        ? "bg-[#1a5276] text-white"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {currency !== "CZK" && currencyData && (
                <span className="text-[10px] text-gray-400" title={`Zdroj: ${currencyData.source}`}>
                  CNB kurz
                </span>
              )}
            </div>

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

            {(country || departure || departureDate || priceMin > 0 || priceMax < 50000 || directFlightsOnly) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCountry("");
                  setDeparture("");
                  setDepartureDate("");
                  setPriceMin(0);
                  setPriceMax(50000);
                  setDirectFlightsOnly(false);
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
              {flights
                .filter((f) => {
                  const price = f.salePrice || f.price;
                  if (priceMin > 0 && price < priceMin) return false;
                  if (priceMax < 50000 && price > priceMax) return false;
                  if (departureDate && 'departureDate' in f && f.departureDate) {
                    const fd = new Date(f.departureDate as string).toISOString().split('T')[0];
                    if (fd < departureDate) return false;
                  }
                  // Filter direct flights only (check if stops field is 0 or "direct" or doesn't exist)
                  if (directFlightsOnly) {
                    const stops = 'stops' in f ? f.stops : undefined;
                    if (stops !== undefined && stops !== 0 && stops !== "direct" && stops !== "Direct") {
                      return false;
                    }
                  }
                  return true;
                })
                .map((flight) => {
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
                        <button onClick={() => handleWishlistPixel(flight)} className="absolute top-3 left-3 bg-white/90 p-2 rounded-full hover:bg-white transition-colors">
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
                          <div className="flex items-center gap-2">
                            <SourceBadge source={(flight as any).source} />
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">★</span>
                              <span className="font-medium">{rating}</span>
                            </div>
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
                              {convertPrice(flight.salePrice)} {currencySymbols[currency]}
                            </span>
                            {currency !== "CZK" && (
                              <span className="text-gray-400 text-xs ml-1 line-through">
                                {flight.salePrice.toLocaleString("cs-CZ")} Kč
                              </span>
                            )}
                            <span className="text-gray-500 text-sm ml-2">za osobu · zpáteční</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Social sharing */}
                            <a
                              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(flight.link)}&quote=${encodeURIComponent(`Zpáteční letenka ${flight.title} za ${flight.salePrice.toLocaleString("cs-CZ")} Kč!`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white transition-colors"
                              title="Sdílet na Facebooku"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </a>
                            <a
                              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Zpáteční letenka ${flight.title} za ${flight.salePrice.toLocaleString("cs-CZ")} Kč! ✈️`)}&url=${encodeURIComponent(flight.link)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-black hover:bg-gray-800 text-white transition-colors"
                              title="Sdílet na X (Twitter)"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </a>
                            <a
                              href={flight.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                handleOfferClick(flight);
                                trackABTestConversion("cta_button_flights", ctaVariant);
                              }}
                              className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E65C00] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                            >
                              {ctaText}
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
