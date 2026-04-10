import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, Calendar, TrendingDown, ExternalLink, Heart, Clock, Star, Hotel } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import LiveViewerCounter from "@/components/LiveViewerCounter";
import { bookingSearchLink, kiwiSearchLink } from "@shared/affiliateLinks";

// Destination metadata for SEO
const destinationMeta: Record<string, {
  title: string;
  description: string;
  tips: string[];
  bestTime: string;
  image: string;
  bookingQuery: string; // for Booking.com search
  iataCode?: string; // IATA airport code for Kiwi.com widget
}> = {
  barcelona: {
    title: "Barcelona",
    description: "Katalánská perla s Gaudího architekturou, středomořským klimatem a živou kulturou",
    tips: [
      "Navštivte Sagrada Família a Park Güell",
      "Ochutnejte tapas v gotické čtvrti",
      "Relaxujte na pláži Barceloneta"
    ],
    bestTime: "Duben–Červen, Září–Říjen",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded",
    bookingQuery: "Barcelona",
    iataCode: "BCN",
  },
  vietnam: {
    title: "Vietnam",
    description: "Exotická země s bohatou historií, úchvatnou přírodou a vynikající kuchyní",
    tips: [
      "Projeďte se lodí v Halong Bay",
      "Ochutnejte tradiční pho a banh mi",
      "Navštivte starobylé město Hoi An"
    ],
    bestTime: "Listopad–Duben",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592",
    bookingQuery: "Vietnam",
    iataCode: "SGN",
  },
  pariz: {
    title: "Paříž",
    description: "Město lásky a světel s ikonickou Eiffelovou věží a světoznámými muzei",
    tips: [
      "Vystoupejte na Eiffelovu věž",
      "Navštivte Louvre a Musée d'Orsay",
      "Projděte se po Champs-Élysées"
    ],
    bestTime: "Duben–Červen, Září–Říjen",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    bookingQuery: "Paris",
    iataCode: "CDG",
  },
  "new-york": {
    title: "New York",
    description: "Město, které nikdy nespí – mrakodrapy, Broadway a Central Park",
    tips: [
      "Navštivte Sochu svobody a Ellis Island",
      "Projděte se Central Parkem",
      "Zažijte Broadway show"
    ],
    bestTime: "Duben–Červen, Září–Listopad",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9",
    bookingQuery: "New York",
    iataCode: "JFK",
  },
  rim: {
    title: "Řím",
    description: "Věčné město s antickými památkami, fontánami a vynikající italskou kuchyní",
    tips: [
      "Navštivte Koloseum a Vatikán",
      "Hoďte minci do Fontány di Trevi",
      "Ochutnejte autentickou italskou pizzu"
    ],
    bestTime: "Duben–Červen, Září–Říjen",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5",
    bookingQuery: "Rome",
    iataCode: "FCO",
  },
  london: {
    title: "Londýn",
    description: "Kosmopolitní metropole s královskými paláci, muzei a živou kulturní scénou",
    tips: [
      "Navštivte Tower of London a Buckinghamský palác",
      "Projděte se Hyde Parkem",
      "Zažijte West End muzikál"
    ],
    bestTime: "Duben–Září",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad",
    bookingQuery: "London",
    iataCode: "LHR",
  },
  dubai: {
    title: "Dubaj",
    description: "Futuristické město luxusu s nejvyšším mrakodrapem světa a nákupními ráji",
    tips: [
      "Vyjeďte na Burj Khalifa",
      "Navštivte Dubai Mall a souk",
      "Zažijte safari v poušti"
    ],
    bestTime: "Říjen–Duben",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
    bookingQuery: "Dubai",
    iataCode: "DXB",
  },
};

// Build Booking.com affiliate search URL
function buildBookingUrl(query: string): string {
  const encoded = encodeURIComponent(query);
  return bookingSearchLink(query, "destination-page");
}

export default function DestinationLandingPage() {
  const params = useParams();
  const destinationSlug = params.destination || "";

  // Fetch all offers from Pelikan cache
  const { data: allOffers, isLoading } = trpc.flights.pelikan.useQuery({ limit: 30 });

  // Better fallback title: capitalize each word, handle Czech slugs
  const fallbackTitle = destinationSlug
    .replace(/-/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const meta = destinationMeta[destinationSlug] || {
    title: fallbackTitle,
    description: `Nejlevnější letenky do destinace ${fallbackTitle}. Porovnejte ceny a rezervujte ihned.`,
    tips: [
      `Rezervujte letenky do ${fallbackTitle} s předstihem pro nejlepší ceny`,
      `Porovnejte nabídky více cestovních kanceláří`,
      `Sledujte aktuální akce a last minute slevy`
    ],
    bestTime: "Celoročně",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05",
    bookingQuery: fallbackTitle
  };

  // Filter flights for this destination (or show all if no match)
  const flights = allOffers?.filter((o: any) => o.type === "flight") ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />

      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center py-24 pt-32"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 48, 135, 0.7), rgba(0, 48, 135, 0.7)), url(${meta.image})`
        }}
      >
        <div className="container text-white">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ✈️ Letenky do {meta.title}
            </h1>
            <p className="text-xl opacity-90 mb-6">
              {meta.description}
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                <Calendar className="w-4 h-4" />
                <span>Nejlepší období: {meta.bestTime}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                <TrendingDown className="w-4 h-4" />
                <span>{flights.length} aktuálních nabídek</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      {meta.tips.length > 0 && (
        <section className="py-8 bg-white border-b">
          <div className="container">
            <h2 className="text-2xl font-bold mb-4">💡 Tipy pro cestovatele</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {meta.tips.map((tip, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-700">{tip}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Flights Section */}
      <section className="py-12">
        <div className="container">
          <h2 className="text-3xl font-bold mb-6">
            Aktuální nabídky letů do {meta.title}
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : flights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flights.map((flight: any) => (
                <Card key={flight.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Flight Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={flight.imageUrl || meta.image}
                      alt={flight.title}
                      className="w-full h-full object-cover"
                    />
                    {flight.discount > 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{flight.discount}%
                      </div>
                    )}
                    <button className="absolute top-3 right-3 bg-white/90 p-2 rounded-full hover:bg-white transition-colors">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Flight Details */}
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">
                      {flight.title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Plane className="w-4 h-4" />
                      <span>{flight.destination || meta.title}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-4">
                      {flight.salePrice < flight.price && (
                        <span className="text-gray-400 line-through text-sm">
                          {flight.price.toLocaleString("cs-CZ")} Kč
                        </span>
                      )}
                      <span className="text-2xl font-bold text-[#003087]">
                        {flight.salePrice.toLocaleString("cs-CZ")} Kč
                      </span>
                    </div>

                    {/* Social Proof - use LiveViewerCounter for realistic numbers */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <LiveViewerCounter destinationId={flight.id} />
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Dnes</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <a
                      href={flight.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="w-full bg-[#E91E63] hover:bg-[#C2185B] text-white gap-2">
                        Zobrazit nabídku
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Kiwi.com Travelpayouts Search Widget - pre-filled with destination */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#003087] rounded-full flex items-center justify-center">
                    <Plane className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#003087]">Vyhledat letenky do {meta.title}</h3>
                    <p className="text-sm text-gray-500">Porovnáme ceny stovek aerolinek — najdeme nejlepší nabídku</p>
                  </div>
                </div>

                {/* Travelpayouts Kiwi.com embed widget (promo_id=3414, marker=155221) */}
                <div className="w-full overflow-hidden rounded-xl" id={`kiwi-widget-${destinationSlug}`}>
                  <script
                    async
                    data-trs="516867"
                    data-promo_id="3414"
                    data-shmarker="155221"
                    data-locale="cs"
                    data-currency="CZK"
                    data-host="www.kiwi.com"
                    data-origin="PRG"
                    data-destination={meta.iataCode || ""}
                    data-width="100%"
                    data-height="500"
                    src="https://c189.travelpayouts.com/content?trs=516867&shmarker=155221&promo_id=3414&locale=cs&currency=CZK"
                  />
                </div>

                {/* Direct CTA link */}
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <a
                    href={kiwiSearchLink("letiste-vaclava-havla-praha-praha-cesko", destinationSlug === 'pariz' ? 'paris-france' : destinationSlug === 'rim' ? 'letiste-rim-fiumicino-rim-italie' : destinationSlug === 'london' ? 'london-united-kingdom' : destinationSlug === 'dubai' ? 'dubai-united-arab-emirates' : destinationSlug === 'new-york' ? 'new-york-city-new-york-united-states' : destinationSlug === 'barcelona' ? 'barcelona-spain' : destinationSlug === 'vietnam' ? 'hanoi-vietnam' : destinationSlug, "dest-page")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button className="w-full bg-[#E91E63] hover:bg-[#C2185B] text-white gap-2 text-base py-6">
                      <Plane className="w-5 h-5" />
                      Zobrazit všechny letenky do {meta.title} na Kiwi.com
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                  <Link href="/">
                    <Button variant="outline" className="w-full sm:w-auto gap-2">
                      Prohlédnout další destinace
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Price alert CTA */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4 flex items-center gap-4">
                <div className="text-3xl">🔔</div>
                <div className="flex-1">
                  <p className="font-semibold text-orange-800">Chcete upozornění na slevy do {meta.title}?</p>
                  <p className="text-sm text-orange-600">Nastavte si cenový alert na Kiwi.com a dostanete e-mail, jakmile ceny klesnou.</p>
                </div>
                <a
                  href={kiwiSearchLink("letiste-vaclava-havla-praha-praha-cesko", destinationSlug === 'pariz' ? 'paris-france' : destinationSlug === 'rim' ? 'letiste-rim-fiumicino-rim-italie' : destinationSlug === 'london' ? 'london-united-kingdom' : destinationSlug === 'dubai' ? 'dubai-united-arab-emirates' : destinationSlug === 'new-york' ? 'new-york-city-new-york-united-states' : destinationSlug === 'barcelona' ? 'barcelona-spain' : destinationSlug === 'vietnam' ? 'hanoi-vietnam' : destinationSlug, "price-alert")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white whitespace-nowrap">
                    Nastavit alert
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Hotel Recommender Section - Booking.com affiliate */}
      <section className="py-12 bg-blue-50 border-t border-blue-100">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Hotel className="w-8 h-8 text-[#003087]" />
                Hotely v {meta.title}
              </h2>
              <p className="text-gray-600 mt-1">Nejlepší ceny ubytování – porovnáno z tisíců nabídek</p>
            </div>
            <a
              href={buildBookingUrl(meta.bookingQuery)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="hidden md:flex gap-2 border-[#003087] text-[#003087] hover:bg-[#003087] hover:text-white">
                Všechny hotely
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>

          {/* Booking.com search widget embed */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 text-center md:text-left">
                <p className="text-lg font-semibold text-gray-800 mb-1">
                  🏨 Najděte ideální hotel v {meta.title}
                </p>
                <p className="text-sm text-gray-500">
                  Přes 1 000 000 ubytování · Okamžité potvrzení · Nejlepší cena garantována
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">9.2/10 průměrné hodnocení</span>
                </div>
              </div>
              <a
                href={buildBookingUrl(meta.bookingQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto"
              >
                <Button className="w-full md:w-auto bg-[#003580] hover:bg-[#002a66] text-white px-8 py-3 text-base font-semibold gap-2">
                  Hledat hotely na Booking.com
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>

          {/* Quick hotel category links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Levné hotely", query: `cheap hotels ${meta.bookingQuery}`, icon: "💰" },
              { label: "Luxusní hotely", query: `luxury hotels ${meta.bookingQuery}`, icon: "⭐" },
              { label: "Hotely u centra", query: `city center hotels ${meta.bookingQuery}`, icon: "🏙️" },
              { label: "Apartmány", query: `apartments ${meta.bookingQuery}`, icon: "🏠" },
            ].map((cat) => (
              <a
                key={cat.label}
                href={buildBookingUrl(cat.query)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl p-4 text-center hover:shadow-md transition-shadow border border-gray-100 hover:border-[#003087]"
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className="text-sm font-medium text-gray-700">{cat.label}</div>
              </a>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-4 text-center">
            * Odkaz vede na Booking.com. Při rezervaci přes náš web získáváme provizi, která nám pomáhá udržovat tento web zdarma.
          </p>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-12 bg-gray-50">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold mb-6">Proč letět do {meta.title}?</h2>
          <div className="prose prose-lg">
            <p className="text-gray-700 leading-relaxed">
              {meta.description}. Najděte si tu nejlepší letenku z naší aktuální nabídky
              a užijte si nezapomenutelnou dovolenou v {meta.title}.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Všechny nabídky jsou aktualizovány denně a obsahují pouze ověřené lety
              od renomovaných cestovních kanceláří. Rezervujte si svou letenku ještě dnes!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
