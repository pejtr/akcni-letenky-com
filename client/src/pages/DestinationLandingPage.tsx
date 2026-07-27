import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, Calendar, TrendingDown, ExternalLink, Star, Hotel } from "lucide-react";
import { useParams } from "wouter";
import { bookingSearchLink, pelikanDeepLink } from "@shared/affiliateLinks";
import InternalLinkingHub from "@/components/InternalLinkingHub";

// Destination metadata for SEO
const destinationMeta: Record<string, {
  title: string;
  description: string;
  tips: string[];
  bestTime: string;
  image: string;
  bookingQuery: string;
  iataCode?: string;
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

function buildBookingUrl(query: string): string {
  return bookingSearchLink(query, "destination-page");
}

const grammarMap: Record<string, { title: string; preposition: string; genitive: string }> = {
  pariz: { title: "Paříž", preposition: "do", genitive: "Paříže" },
  paris: { title: "Paříž", preposition: "do", genitive: "Paříže" },
  barcelona: { title: "Barcelona", preposition: "do", genitive: "Barcelony" },
  london: { title: "Londýn", preposition: "do", genitive: "Londýna" },
  londyn: { title: "Londýn", preposition: "do", genitive: "Londýna" },
  rim: { title: "Řím", preposition: "do", genitive: "Říma" },
  rome: { title: "Řím", preposition: "do", genitive: "Říma" },
  "new-york": { title: "New York", preposition: "do", genitive: "New Yorku" },
  dubai: { title: "Dubaj", preposition: "do", genitive: "Dubaje" },
  dubaj: { title: "Dubaj", preposition: "do", genitive: "Dubaje" },
  vietnam: { title: "Vietnam", preposition: "do", genitive: "Vietnamu" },
  recko: { title: "Řecko", preposition: "do", genitive: "Řecka" },
  malta: { title: "Malta", preposition: "na", genitive: "Malty" },
  kypr: { title: "Kypr", preposition: "na", genitive: "Kypru" },
  egypt: { title: "Egypt", preposition: "do", genitive: "Egypta" },
  maledivy: { title: "Maledivy", preposition: "na", genitive: "Malediv" },
  bali: { title: "Bali", preposition: "na", genitive: "Bali" },
  istanbul: { title: "Istanbul", preposition: "do", genitive: "Istanbulu" },
  amsterdam: { title: "Amsterdam", preposition: "do", genitive: "Amsterdamu" },
};

const pelikanDestinationPaths: Record<string, string> = {
  barcelona: "/cs/akcni-letenky/praha/barcelona?data[from]=PRG&data[to]=BCN",
  dubai: "/cs/akcni-letenky/praha/dubaj?data[from]=PRG&data[to]=DXB",
  london: "/cs/akcni-letenky/praha/londyn?data[from]=PRG&data[to]=LON",
  "new-york": "/cs/akcni-letenky/praha/new-york?data[from]=PRG&data[to]=NYC",
  pariz: "/cs/akcni-letenky/praha/pariz?data[from]=PRG&data[to]=PAR",
  rim: "/cs/akcni-letenky/praha/rim?data[from]=PRG&data[to]=ROM",
  vietnam: "/cs/akcni-letenky/praha/hanoj?data[from]=PRG&data[to]=HAN",
};

export default function DestinationLandingPage() {
  const params = useParams();
  const rawSlug = (params.destination || "").toLowerCase().replace(/^letenky-do-/i, "").replace(/^letenky-/i, "");
  const destinationSlug = rawSlug;

  const { data: pelikanFlights } = trpc.flights.pelikan.useQuery({ limit: 12 });

  const grammar = grammarMap[destinationSlug] || {
    title: destinationSlug.charAt(0).toUpperCase() + destinationSlug.slice(1).replace(/-/g, " "),
    preposition: "do",
    genitive: destinationSlug.charAt(0).toUpperCase() + destinationSlug.slice(1).replace(/-/g, " "),
  };

  const meta = destinationMeta[destinationSlug] || {
    title: grammar.title,
    description: `Nejlevnější letenky ${grammar.preposition} ${grammar.genitive}. Porovnejte ceny od desítek aerolinek z Pelikán feedu a rezervujte ihned.`,
    tips: [
      `Rezervujte letenky ${grammar.preposition} ${grammar.genitive} s předstihem pro nejlepší ceny`,
      `Porovnejte akční nabídky od zavedených leteckých společností`,
      `Sledujte aktuální slevy a cenové kalendáře na Pelikán.cz`
    ],
    bestTime: "Celoročně",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80",
    bookingQuery: grammar.title
  };

  const pelikanDestinationUrl = pelikanDeepLink(
    pelikanDestinationPaths[destinationSlug] || `/cs/akcni-letenky/praha/${destinationSlug}`,
    {
      campaign: "destination-landing",
      channel: "pelikan-feed",
      content: destinationSlug,
    }
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-between">
      <div>
        <Navigation />

        {/* Hero Section */}
        <section
          className="relative bg-cover bg-center py-24 pt-32"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 48, 135, 0.75), rgba(0, 48, 135, 0.75)), url(${meta.image})`
          }}
        >
          <div className="container text-white">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-black mb-4">
                ✈️ Letenky {grammar.preposition} {grammar.genitive}
              </h1>
              <p className="text-xl opacity-90 mb-6 leading-relaxed">
                {meta.description}
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm font-semibold">
                  <Calendar className="w-4 h-4 text-yellow-300" />
                  <span>Nejlepší období: {meta.bestTime}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm font-semibold">
                  <TrendingDown className="w-4 h-4 text-emerald-300" />
                  <span>Aktuální nabídky z Pelikán.cz</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        {meta.tips.length > 0 && (
          <section className="py-8 bg-white border-b">
            <div className="container">
              <h2 className="text-2xl font-bold mb-4 text-[#003087]">💡 Tipy pro cestovatele</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {meta.tips.map((tip, index) => (
                  <Card key={index} className="border-l-4 border-l-[#E91E63] shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-700 font-medium">{tip}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Pelikán Offer Banner */}
        <section className="py-12 bg-gradient-to-b from-white to-green-50">
          <div className="container">
            <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                    Aktuální Pelikán.cz nabídky
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-gray-900">
                    Letenky {grammar.preposition} {grammar.genitive} s ověřeným affiliate odkazem
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Klik vede přímo na Pelikán.cz s parametrem a_aid=levne-letenky a garancí nejnižší ceny.
                  </p>
                </div>
                <a
                  href={pelikanDestinationUrl}
                  target="_blank"
                  rel="noopener"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E91E63] px-6 py-3 font-bold text-white transition-colors hover:bg-[#C2185B]"
                >
                  Zobrazit nabídky na Pelikán.cz
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
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

            {/* SEO Internal Linking Hub */}
            <InternalLinkingHub />
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
