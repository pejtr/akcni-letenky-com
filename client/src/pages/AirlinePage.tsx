import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Phone, ChevronRight, Plane, ArrowLeft } from "lucide-react";
import ChatbotWidget from "@/components/ChatbotWidget";

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
  const airlineFlights = flightsData?.filter((flight) => {
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

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/logo-akcni-letenky.png"
                alt="Akční Letenky"
                className="h-10 object-contain"
              />
              <span className="text-[#FFD700] font-bold text-lg hidden md:inline">
                Nejlevnější Lety
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/levne-letenky" className="text-gray-700 hover:text-[#E91E63] flex items-center gap-1">
                <span>✈️</span> LEVNÉ LETENKY
              </Link>
              <Link href="/dovolene" className="text-gray-700 hover:text-[#E91E63] flex items-center gap-1">
                <span>⭐</span> DOVOLENÉ
              </Link>
              <Link href="/blog" className="text-gray-700 hover:text-[#E91E63] flex items-center gap-1">
                <span>📰</span> BLOG
              </Link>
            </nav>

            <a
              href="tel:+420223340510"
              className="flex items-center gap-2 text-[#E91E63] font-bold"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">223 340 510</span>
            </a>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="bg-white border-b">
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
                Nejlevnější letenky společnosti {airline.name}
              </p>
            </div>
          </div>
        </div>

        {/* About Airline Section - MOVED BEFORE OFFERS */}
        <section className="bg-white rounded-xl shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">O společnosti {airline.name}</h2>
          
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

        {/* Flight Offers Section - MOVED AFTER ARTICLE */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Plane className="w-6 h-6 text-[#E91E63]" />
            Aktuální nabídky {airline.name}
          </h2>

          {flightsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E91E63] mx-auto mb-4"></div>
              <p className="text-gray-600">Načítám nabídky...</p>
            </div>
          ) : airlineFlights.length > 0 ? (
            <div className="space-y-4">
              {airlineFlights.slice(0, 10).map((flight, index) => (
                <a
                  key={index}
                  href={`${flight.link}${flight.link.includes('?') ? '&' : '?'}a_aid=levne-letenky`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 p-3 md:p-4 group"
                  onClick={() => trackAffiliateClick(
                    flight.destination || "Unknown",
                    flight.destination?.toLowerCase().replace(/\s+/g, "-") || "unknown",
                    "airline-page",
                    flight.link
                  )}
                >
                  {/* Destination Image */}
                  <div className="relative w-full md:w-28 h-32 md:h-20 flex-shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={flight.imageUrl || "/destinations/default.jpg"}
                      alt={flight.destination || "Destinace"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {/* Airplane overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Plane className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content wrapper for mobile/desktop layout */}
                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 flex-1">
                    {/* Flight Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 text-sm md:text-base">{('departure' in flight && flight.departure) || "Praha"}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-bold text-gray-900 text-sm md:text-base">{flight.destination}</span>
                        {flight.discount && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            {flight.discount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Airline Logo */}
                        <img
                          src={airline.logo}
                          alt={airline.name}
                          className="w-8 h-8 object-contain"
                        />
                        <p className="text-xs md:text-sm text-gray-500">
                          {flight.country || airline.name}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-left md:text-right flex-shrink-0">
                      <p className="text-xs text-gray-500">od</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900">
                        {formatPrice(flight.price)}
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className="bg-[#E91E63] hover:bg-[#C2185B] text-white text-xs md:text-sm px-3 md:px-4 py-2 flex-shrink-0 w-full md:w-auto"
                  >
                    Pokračovat
                  </Button>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Momentálně nemáme nabídky od {airline.name}
              </h3>
              <p className="text-gray-500 mb-6">
                Zkuste se podívat na naše další nabídky levných letenek
              </p>
              <Link href="/levne-letenky">
                <Button className="bg-[#E91E63] hover:bg-[#C2185B]">
                  Zobrazit všechny letenky
                </Button>
              </Link>
            </div>
          )}

          {airlineFlights.length > 0 && (
            <div className="text-center mt-6">
              <Link href="/levne-letenky">
                <Button variant="outline" className="text-[#E91E63] border-[#E91E63] hover:bg-[#E91E63] hover:text-white">
                  Zobrazit další akční letenky
                </Button>
              </Link>
            </div>
          )}
        </section>



        {/* Back Link */}
        <div className="mt-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#E91E63]">
            <ArrowLeft className="w-4 h-4" />
            Zpět na hlavní stránku
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#FF9800] py-12 mt-12">
        <div className="container text-center text-white">
          <p className="font-bold text-lg mb-2">Akční Letenky</p>
          <p className="text-sm opacity-90">
            © {new Date().getFullYear()} Všechna práva vyhrazena
          </p>
        </div>
      </footer>

      {/* Chatbot */}
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
