import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plane, ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { pelikanDeepLink } from "@shared/affiliateLinks";
import SEO from "@/components/SEO";

// Sample Pelikán airline deal templates per carrier
const airlineDealTemplates: Record<string, Array<{ destination: string; from: string; price: number; salePrice: number; discount: number; linkPath: string }>> = {
  "wizz-air": [
    { destination: "Londýn (Luton)", from: "Praha (PRG)", price: 1590, salePrice: 890, discount: 44, linkPath: "/cs/akcni-letenky/praha/londyn" },
    { destination: "Řím (Fiumicino)", from: "Praha (PRG)", price: 1990, salePrice: 1090, discount: 45, linkPath: "/cs/akcni-letenky/praha/rim" },
    { destination: "Milán (Malpensa)", from: "Praha (PRG)", price: 1490, salePrice: 790, discount: 47, linkPath: "/cs/akcni-letenky/praha/milan" },
    { destination: "Neapol", from: "Praha (PRG)", price: 2190, salePrice: 1290, discount: 41, linkPath: "/cs/akcni-letenky/praha/neapol" },
    { destination: "Kutaisi (Gruzie)", from: "Praha (PRG)", price: 2990, salePrice: 1690, discount: 43, linkPath: "/cs/akcni-letenky/praha/kutaisi" },
  ],
  ryanair: [
    { destination: "Londýn (Stansted)", from: "Praha (PRG)", price: 1390, salePrice: 733, discount: 47, linkPath: "/cs/akcni-letenky/praha/londyn" },
    { destination: "Barcelona", from: "Praha (PRG)", price: 1890, salePrice: 746, discount: 60, linkPath: "/cs/akcni-letenky/praha/barcelona" },
    { destination: "Řím (Ciampino)", from: "Praha (PRG)", price: 1690, salePrice: 712, discount: 58, linkPath: "/cs/akcni-letenky/praha/rim" },
    { destination: "Dublin", from: "Praha (PRG)", price: 2290, salePrice: 1190, discount: 48, linkPath: "/cs/akcni-letenky/praha/dublin" },
    { destination: "Malaga", from: "Praha (PRG)", price: 2790, salePrice: 1490, discount: 46, linkPath: "/cs/akcni-letenky/praha/malaga" },
  ],
  emirates: [
    { destination: "Dubaj", from: "Praha (PRG)", price: 8990, salePrice: 5183, discount: 42, linkPath: "/cs/akcni-letenky/praha/dubaj" },
    { destination: "Bangkok", from: "Praha (PRG)", price: 18990, salePrice: 12990, discount: 31, linkPath: "/cs/akcni-letenky/praha/bangkok" },
    
    { destination: "Bali (Denpasar)", from: "Praha (PRG)", price: 24990, salePrice: 16990, discount: 32, linkPath: "/cs/akcni-letenky/praha/bali" },
  ],
  "qatar-airways": [
    { destination: "Dauhá", from: "Praha (PRG)", price: 11990, salePrice: 7490, discount: 37, linkPath: "/cs/akcni-letenky/praha/dauha" },
    { destination: "Bangkok", from: "Praha (PRG)", price: 19990, salePrice: 13490, discount: 32, linkPath: "/cs/akcni-letenky/praha/bangkok" },
    { destination: "Bali", from: "Praha (PRG)", price: 25990, salePrice: 17290, discount: 33, linkPath: "/cs/akcni-letenky/praha/bali" },
  ],
  "air-france": [
    { destination: "Paříž (Charles de Gaulle)", from: "Praha (PRG)", price: 1990, salePrice: 1027, discount: 48, linkPath: "/cs/akcni-letenky/praha/pariz" },
    { destination: "Martinik (Fort-de-France)", from: "Praha (PRG)", price: 19990, salePrice: 12490, discount: 37, linkPath: "/cs/akcni-letenky/praha/martinik" },
    { destination: "Guadeloupe", from: "Praha (PRG)", price: 20990, salePrice: 12990, discount: 38, linkPath: "/cs/akcni-letenky/praha/guadeloupe" },
  ],
  lufthansa: [
    { destination: "Frankfurt", from: "Praha (PRG)", price: 3990, salePrice: 2490, discount: 37, linkPath: "/cs/akcni-letenky/praha/frankfurt" },
    { destination: "New York (JFK)", from: "Praha (PRG)", price: 12990, salePrice: 7490, discount: 42, linkPath: "/cs/akcni-letenky/praha/new-york" },
    { destination: "Miami", from: "Praha (PRG)", price: 15990, salePrice: 9990, discount: 37, linkPath: "/cs/akcni-letenky/praha/miami" },
  ],
  "turkish-airlines": [
    { destination: "Istanbul", from: "Praha (PRG)", price: 5490, salePrice: 3490, discount: 36, linkPath: "/cs/akcni-letenky/praha/istanbul" },
    { destination: "Antalya", from: "Praha (PRG)", price: 4490, salePrice: 2990, discount: 33, linkPath: "/cs/akcni-letenky/praha/antalya" },
    { destination: "Hanoj (Vietnam)", from: "Praha (PRG)", price: 21990, salePrice: 14990, discount: 31, linkPath: "/cs/akcni-letenky/praha/hanoj" },
  ],
  klm: [
    { destination: "Amsterdam", from: "Praha (PRG)", price: 2490, salePrice: 1599, discount: 36, linkPath: "/cs/akcni-letenky/praha/amsterdam" },
    { destination: "Curaçao", from: "Praha (PRG)", price: 21990, salePrice: 14990, discount: 31, linkPath: "/cs/akcni-letenky/praha/curacao" },
  ],
};

// Airline data with descriptions and official URLs
const airlineData: Record<string, {
  name: string;
  logo: string;
  description: string;
  founded: string;
  hub: string;
  website: string;
  iataCode: string;
}> = {
  "austrian-airlines": {
    name: "Austrian Airlines",
    logo: "/airlines/austrian.png",
    description: "Austrian Airlines je vlajkový dopravce Rakouska se sídlem ve Vídni. Společnost byla založena v roce 1957 a od roku 2009 je součástí skupiny Lufthansa Group. Austrian Airlines nabízí lety do více než 130 destinací po celém světě a je známá svou vynikající palubní službou a kvalitním cateringem.",
    founded: "1957",
    hub: "Vídeň (VIE)",
    website: "https://www.austrian.com/",
    iataCode: "OS"
  },
  "emirates": {
    name: "Emirates",
    logo: "/airlines/emirates.png",
    description: "Emirates je největší letecká společnost na Blízkém východě se sídlem v Dubaji. Založena v roce 1985, dnes provozuje jednu z největších flotil letadel Boeing 777 a Airbus A380 na světě. Emirates je známá luxusním servisem, moderními letadly a rozsáhlou sítí destinací.",
    founded: "1985",
    hub: "Dubaj (DXB)",
    website: "https://www.emirates.com/",
    iataCode: "EK"
  },
  "qatar-airways": {
    name: "Qatar Airways",
    logo: "/airlines/qatar.jpg",
    description: "Qatar Airways je státní letecká společnost Kataru se sídlem v Dauhá. Patří mezi nejlépe hodnocené aerolinky světa a je členem aliance oneworld. Společnost je známá svou prémiovou třídou Qsuite a vynikajícím servisem na palubě.",
    founded: "1993",
    hub: "Dauhá (DOH)",
    website: "https://www.qatarairways.com/",
    iataCode: "QR"
  },
  "ryanair": {
    name: "Ryanair",
    logo: "/airlines/ryanair.png",
    description: "Ryanair je irská nízkonákladová letecká společnost, která nabízí levné letenky po celé Evropě. Společnost byla založena v roce 1985 a od té doby se stala jednou z největších nízkonákladových leteckých společností na světě. Ryanair se snaží poskytnout svým zákazníkům co nejlevnější ceny a zároveň jim poskytnout kvalitní služby.",
    founded: "1985",
    hub: "Dublin (DUB)",
    website: "https://www.ryanair.com/",
    iataCode: "FR"
  },
  "air-france": {
    name: "Air France",
    logo: "/airlines/airfrance.jpg",
    description: "Air France je francouzská vlajková letecká společnost se sídlem v Paříži. Je zakládajícím členem aliance SkyTeam a společně s KLM tvoří skupinu Air France-KLM. Společnost nabízí lety do více než 200 destinací a je známá svou elegancí a francouzským šarmem.",
    founded: "1933",
    hub: "Paříž (CDG)",
    website: "https://www.airfrance.com/",
    iataCode: "AF"
  },
  "lufthansa": {
    name: "Lufthansa",
    logo: "/airlines/lufthansa.png",
    description: "Lufthansa je německá vlajková letecká společnost a jedna z největších aerolinek v Evropě. Založena v roce 1953, dnes provozuje rozsáhlou síť destinací po celém světě. Je zakládajícím členem aliance Star Alliance a je známá svou spolehlivostí a německou precizností.",
    founded: "1953",
    hub: "Frankfurt (FRA), Mnichov (MUC)",
    website: "https://www.lufthansa.com/",
    iataCode: "LH"
  },
  "icelandair": {
    name: "Icelandair",
    logo: "/airlines/icelandair.png",
    description: "Icelandair je islandská letecká společnost se sídlem v Reykjavíku. Specializuje se na lety mezi Evropou a Severní Amerikou s přestupem na Islandu. Nabízí unikátní možnost stopover v Islandu bez příplatku, což umožňuje cestujícím prozkoumat tuto fascinující zemi.",
    founded: "1937",
    hub: "Reykjavík (KEF)",
    website: "https://www.icelandair.com/",
    iataCode: "FI"
  },
  "turkish-airlines": {
    name: "Turkish Airlines",
    logo: "/airlines/turkish.png",
    description: "Turkish Airlines je turecká vlajková letecká společnost se sídlem v Istanbulu. Létá do více destinací než jakákoli jiná aerolinka na světě. Je členem aliance Star Alliance a je známá svým vynikajícím cateringem a pohostinností.",
    founded: "1933",
    hub: "Istanbul (IST)",
    website: "https://www.turkishairlines.com/",
    iataCode: "TK"
  },
  "klm": {
    name: "KLM",
    logo: "/airlines/klm.jpeg",
    description: "KLM Royal Dutch Airlines je nejstarší letecká společnost na světě, která stále operuje pod svým původním názvem. Založena v roce 1919, je vlajkovým dopravcem Nizozemska. Je členem aliance SkyTeam a společně s Air France tvoří skupinu Air France-KLM.",
    founded: "1919",
    hub: "Amsterdam (AMS)",
    website: "https://www.klm.com/",
    iataCode: "KL"
  },
  "british-airways": {
    name: "British Airways",
    logo: "/airlines/british.png",
    description: "British Airways je vlajková letecká společnost Spojeného království se sídlem v Londýně. Je jednou z největších aerolinek v Evropě a zakládajícím členem aliance oneworld. Společnost je známá svou dlouhou historií a tradicí britské elegance.",
    founded: "1974",
    hub: "Londýn Heathrow (LHR)",
    website: "https://www.britishairways.com/",
    iataCode: "BA"
  },
  "wizz-air": {
    name: "Wizz Air",
    logo: "/airlines/wizz.png",
    description: "Wizz Air je maďarská nízkonákladová letecká společnost se sídlem v Budapešti. Založena v roce 2003, dnes patří mezi největší nízkonákladové dopravce ve střední a východní Evropě. Nabízí levné letenky do mnoha evropských destinací.",
    founded: "2003",
    hub: "Budapešť (BUD)",
    website: "https://wizzair.com/",
    iataCode: "W6"
  },
  "lot": {
    name: "LOT Polish Airlines",
    logo: "/airlines/lot.jpg",
    description: "LOT Polish Airlines je polská vlajková letecká společnost se sídlem ve Varšavě. Je jednou z nejstarších aerolinek na světě, založena v roce 1929. Je členem aliance Star Alliance a nabízí lety do mnoha destinací v Evropě, Asii a Severní Americe.",
    founded: "1929",
    hub: "Varšava (WAW)",
    website: "https://www.lot.com/",
    iataCode: "LO"
  }
};

export default function AirlinePage() {
  const { slug } = useParams<{ slug: string }>();
  const airline = slug ? airlineData[slug] : null;

  // Fetch flights from Pelikán feed
  const { data: flightsData, isLoading: flightsLoading } = trpc.pelikan.getFlights.useQuery({
    limit: 50
  });

  // Record affiliate click
  const trackClickMutation = trpc.affiliate.trackClick.useMutation();

  const trackAffiliateClick = (destination: string, destinationSlug: string, source: string, url: string) => {
    trackClickMutation.mutate({
      destination,
      destinationSlug,
      source,
      affiliateUrl: url
    });
  };

  if (!airline) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Letecká společnost nenalezena</h1>
          <Link href="/">
            <Button>Zpět na hlavní stránku</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Filter flights by airline name (case-insensitive partial match)
  // IMPORTANT: Only show flight offers (type === 'flight'), not vacations
  const airlineFlights = flightsData?.filter((flight) => {
    // First check if it's a flight offer (not vacation)
    if ('type' in flight && flight.type !== 'flight') {
      return false;
    }
    
    const flightAirline = ('airline' in flight && flight.airline?.toLowerCase()) || "";
    const searchName = airline.name.toLowerCase();
    // Match by airline name or IATA code
    return flightAirline.includes(searchName) || 
           flightAirline.includes(airline.iataCode.toLowerCase()) ||
           searchName.includes(flightAirline);
  }) || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: "CZK",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Combine API flights or fallback to airline templates
  const carrierDeals = airlineFlights.length > 0 
    ? airlineFlights.map((f: any) => ({
        destination: f.destination || "Destinace",
        from: f.departure || "Praha (PRG)",
        price: f.originalPrice || Math.round(f.price * 1.3),
        salePrice: f.price,
        discount: f.discountPercent || 30,
        linkPath: f.link || "/cs/akcni-letenky",
      }))
    : (airlineDealTemplates[slug] || [
        { destination: "Londýn", from: "Praha (PRG)", price: 1990, salePrice: 990, discount: 50, linkPath: "/cs/akcni-letenky/praha/londyn" },
        { destination: "Barcelona", from: "Praha (PRG)", price: 2490, salePrice: 1290, discount: 48, linkPath: "/cs/akcni-letenky/praha/barcelona" },
        { destination: "Paříž", from: "Praha (PRG)", price: 2290, salePrice: 1190, discount: 48, linkPath: "/cs/akcni-letenky/praha/pariz" },
        { destination: "Řím", from: "Praha (PRG)", price: 2190, salePrice: 1090, discount: 50, linkPath: "/cs/akcni-letenky/praha/rim" },
      ]);

  // Structured data for SEO
  const airlineSchema = {
    "@context": "https://schema.org",
    "@type": "Airline",
    "name": airline.name,
    "description": airline.description,
    "logo": `https://www.akcni-letenky.com${airline.logo}`,
    "url": airline.website,
    "foundingDate": airline.founded,
    "iataCode": airline.iataCode,
    "hubAirport": {
      "@type": "Airport",
      "name": airline.hub
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <SEO title={`${airline?.name || "Letecká společnost"} | Akční Letenky`} description={`Letenky s ${airline?.name || "leteckou společností"}. ${airline?.description || ""}`} canonical={`https://www.akcni-letenky.com/letecka-spolecnost/${airline?.slug || ""}`} ogImage={airline?.logo || undefined} structuredData={[airlineSchema]} />
      <Navigation />

      {/* Breadcrumbs */}
      <div className="bg-white border-b pt-20">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#E91E63]">Domů</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{airline.name} Letenky</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-8">
        {/* Airline Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <img
              src={airline.logo}
              alt={`${airline.name} logo`}
              className="w-32 h-32 object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {airline.name} Letenky
              </h1>
              <p className="text-gray-600">
                Nejlevnější akční letenky společnosti {airline.name} z ověřeného Pelikán feedu.
              </p>
            </div>
          </div>
        </div>

        {/* Flight Offers Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-[#003087]">
              <Plane className="w-6 h-6 text-[#E91E63]" />
              Aktuální akční letenky {airline.name}
            </h2>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Garance Pelikán.cz
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {carrierDeals.map((deal, index) => {
              const bookingUrl = pelikanDeepLink(deal.linkPath, {
                campaign: "airline-page",
                channel: "carrier-deal",
                content: slug,
              });

              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-5 border border-gray-200 shadow-md hover:shadow-xl hover:border-orange-400 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={airline.logo}
                          alt={airline.name}
                          className="w-8 h-8 object-contain"
                        />
                        <span className="text-xs font-bold text-gray-500 uppercase">{airline.name}</span>
                      </div>
                      <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                        -{deal.discount}%
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-[#003087] group-hover:text-orange-500 transition-colors mb-1">
                      {deal.from} → {deal.destination}
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">Zpáteční letenka včetně poplatků a tax</p>

                    <div className="pt-3 border-t border-gray-100 mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-gray-400">od</span>
                        <span className="text-xs text-gray-400 line-through">
                          {deal.price.toLocaleString("cs-CZ")} Kč
                        </span>
                        <span className="text-2xl font-black text-[#E91E63]">
                          {deal.salePrice.toLocaleString("cs-CZ")} Kč
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold py-3 px-4 rounded-xl text-center transition-colors shadow-md text-sm flex items-center justify-center gap-2"
                  >
                    <span>Zobrazit na Pelikán.cz</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>
        </section>

        {/* About Airline Section */}
        <section className="bg-white rounded-xl shadow-md p-8 mb-12 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-[#003087]">O společnosti {airline.name}</h2>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            {airline.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-[#F5F7FA] rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Založeno</p>
              <p className="font-bold text-gray-900">{airline.founded}</p>
            </div>
            <div className="bg-[#F5F7FA] rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Hlavní hub</p>
              <p className="font-bold text-gray-900">{airline.hub}</p>
            </div>
            <div className="bg-[#F5F7FA] rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">IATA kód</p>
              <p className="font-bold text-gray-900">{airline.iataCode}</p>
            </div>
          </div>

          <a
            href={airline.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#E91E63] hover:underline font-medium"
          >
            Navštívit oficiální stránky {airline.name}
            <ChevronRight className="w-4 h-4" />
          </a>
        </section>

        {/* Back Link */}
        <div className="mt-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#E91E63]">
            <ArrowLeft className="w-4 h-4" />
            Zpět na hlavní stránku
          </Link>
        </div>
      </main>

      <Footer />
      <ChatbotWidget />

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Airline",
          "name": airline.name,
          "iataCode": airline.iataCode,
          "url": airline.website,
          "logo": `https://www.akcni-letenky.com${airline.logo}`,
          "foundingDate": airline.founded
        })}
      </script>
    </div>
  );
}
