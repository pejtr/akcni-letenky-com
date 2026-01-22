import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Phone, ChevronRight, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

interface AirlineInfo {
  name: string;
  logo: string;
  description: string;
  website: string;
}

const airlinesData: Record<string, AirlineInfo> = {
  ryanair: {
    name: "Ryanair",
    logo: "/logo-ryanair.webp",
    description: "Ryanair je největší nízkonákladová letecká společnost v Evropě, která nabízí levné letenky do více než 200 destinací.",
    website: "https://www.ryanair.com",
  },
  wizzair: {
    name: "Wizz Air",
    logo: "/logo-wizzair.webp",
    description: "Wizz Air je maďarská nízkonákladová letecká společnost s rozsáhlou sítí letů po celé Evropě a vybraných destinacích mimo ni.",
    website: "https://www.wizzair.com",
  },
  "austrian-airlines": {
    name: "Austrian Airlines",
    logo: "/logo-austrian.webp",
    description: "Austrian Airlines je vlajková letecká společnost Rakouska, která nabízí kvalitní služby a spojení do celého světa přes Vídeň.",
    website: "https://www.austrian.com",
  },
  emirates: {
    name: "Emirates",
    logo: "/logo-emirates.webp",
    description: "Emirates je prémiová letecká společnost se sídlem v Dubaji, známá svým luxusním servisem a moderní flotilou letadel.",
    website: "https://www.emirates.com",
  },
  "qatar-airways": {
    name: "Qatar Airways",
    logo: "/logo-qatar.webp",
    description: "Qatar Airways je oceňovaná letecká společnost z Kataru, která pravidelně získává ocenění za kvalitu služeb a komfort.",
    website: "https://www.qatarairways.com",
  },
  "air-france": {
    name: "Air France",
    logo: "/logo-airfrance.webp",
    description: "Air France je francouzská vlajková letecká společnost, která nabízí spojení do celého světa s důrazem na francouzský styl a eleganci.",
    website: "https://www.airfrance.com",
  },
  lufthansa: {
    name: "Lufthansa",
    logo: "/logo-lufthansa.webp",
    description: "Lufthansa je největší německá letecká společnost a jeden z předních evropských dopravců s rozsáhlou globální sítí.",
    website: "https://www.lufthansa.com",
  },
  icelandair: {
    name: "Icelandair",
    logo: "/logo-icelandair.webp",
    description: "Icelandair je islandská letecká společnost, která nabízí spojení mezi Evropou a Severní Amerikou s možností stopoveru na Islandu.",
    website: "https://www.icelandair.com",
  },
  "turkish-airlines": {
    name: "Turkish Airlines",
    logo: "/logo-turkish.webp",
    description: "Turkish Airlines je turecká vlajková letecká společnost s jednou z největších sítí destinací na světě přes Istanbul.",
    website: "https://www.turkishairlines.com",
  },
  klm: {
    name: "KLM",
    logo: "/logo-klm.webp",
    description: "KLM Royal Dutch Airlines je nizozemská letecká společnost s dlouhou tradicí a kvalitními službami přes Amsterdam.",
    website: "https://www.klm.com",
  },
  "british-airways": {
    name: "British Airways",
    logo: "/logo-british.webp",
    description: "British Airways je britská vlajková letecká společnost, která nabízí prémiové služby a spojení do celého světa přes Londýn.",
    website: "https://www.britishairways.com",
  },
  lot: {
    name: "LOT Polish Airlines",
    logo: "/logo-lot.webp",
    description: "LOT Polish Airlines je polská vlajková letecká společnost s moderní flotilou a kvalitními službami přes Varšavu.",
    website: "https://www.lot.com",
  },
};

export default function AirlinePage() {
  const [, params] = useRoute("/letecke-spolecnosti/:airline");
  const airlineSlug = params?.airline || "";
  const airline = airlinesData[airlineSlug];

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch flights for this airline
  const { data: flights, isLoading } = trpc.flights.search.useQuery({
    airline: airline?.name,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("cs-CZ").format(price) + " Kč";
  };

  if (!airline) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Letecká společnost nenalezena</h1>
          <p className="text-muted-foreground mb-6">Omlouváme se, ale tuto leteckou společnost nemáme v nabídce.</p>
          <Button asChild>
            <a href="/">Zpět na hlavní stránku</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Sticky Navigation */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          isScrolled ? "bg-white shadow-md" : "bg-white"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                <Plane className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">AKČNÍ-</div>
                <div className="font-bold text-gray-900 text-sm -mt-1">LETENKY.com</div>
              </div>
              <span className="text-blue-600 text-sm ml-2">Nejlevnější Lety</span>
            </a>

            <nav className="hidden md:flex items-center gap-6">
              <a href="/" className="text-sm hover:text-primary transition-colors">
                🏠 Domů
              </a>
              <a href="#" className="text-sm hover:text-primary transition-colors">
                💸 LEVNÉ LETENKY
              </a>
              <a href="#" className="text-sm hover:text-primary transition-colors">
                ⭐ DOVOLENÁ
              </a>
              <a href="#" className="text-sm hover:text-primary transition-colors">
                ✈️ AEROLINKY
              </a>
            </nav>

            <div className="flex items-center gap-2 text-orange-500">
              <Phone className="w-4 h-4" />
              <span className="font-semibold text-sm">223 340 510</span>
            </div>
          </div>
        </div>
      </header>

      {/* Airline Header */}
      <section className="bg-white py-12 border-b">
        <div className="container max-w-6xl">
          <div className="flex items-center gap-6 mb-6">
            <img
              src={airline.logo}
              alt={`${airline.name} logo`}
              className="w-24 h-24 object-contain"
            />
            <div>
              <h1 className="text-4xl font-bold mb-2">Letenky {airline.name}</h1>
              <p className="text-lg text-muted-foreground">{airline.description}</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <a href={airline.website} target="_blank" rel="noopener noreferrer">
              Navštívit web {airline.name}
            </a>
          </Button>
        </div>
      </section>

      {/* Flight Listings */}
      <section className="py-12">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Akční letenky {airline.name}
          </h2>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Načítám letenky...</p>
            </div>
          ) : flights && flights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flights.map((flight) => (
                <a
                  key={flight.id}
                  href={`#flight-${flight.id}`}
                  className="bg-white rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">
                      {flight.fromCity} → {flight.toCity}
                    </h3>
                    {flight.discountPercent && flight.discountPercent > 0 && (
                      <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{flight.discountPercent}%
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Letecká společnost:</span>
                      <span className="font-semibold">{flight.airline}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Délka letu:</span>
                      <span className="font-semibold">{flight.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Zastávky:</span>
                      <span className="font-semibold">{flight.stops === 0 ? "Přímý let" : `${flight.stops} zastávka`}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      {flight.originalPrice && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(flight.originalPrice)}
                        </p>
                      )}
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(flight.price)}
                      </p>
                    </div>
                    <Button size="sm" className="bg-[#E91E63] hover:bg-[#C2185B]">
                      Zobrazit
                    </Button>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-muted-foreground mb-4">
                Momentálně nemáme k dispozici žádné akční letenky od {airline.name}.
              </p>
              <Button asChild>
                <a href="/">Prohlédnout všechny nabídky</a>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose This Airline */}
      <section className="py-12 bg-white">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Proč letět s {airline.name}?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold mb-2">Moderní flotila</h3>
              <p className="text-sm text-muted-foreground">
                Nejnovější letadla s vysokým komfortem a bezpečností
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChevronRight className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold mb-2">Široká síť destinací</h3>
              <p className="text-sm text-muted-foreground">
                Létejte do stovek destinací po celém světě
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-bold mb-2">Kvalitní služby</h3>
              <p className="text-sm text-muted-foreground">
                Profesionální posádka a vynikající zákaznický servis
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
