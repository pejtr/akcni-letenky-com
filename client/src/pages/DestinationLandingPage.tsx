import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, Calendar, TrendingDown, ExternalLink, Heart, Users, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Slug mapping for destinations (Kiwi format -> simple format)
const slugMapping: Record<string, string> = {
  "barcelona-spain": "barcelona",
  "london-united-kingdom": "london",
  "paris-france": "pariz",
  "rome-italy": "rim",
  "new-york-city-new-york-united-states": "new-york",
  "vietnam": "vietnam",
};

// Destination metadata for SEO
const destinationMeta: Record<string, {
  title: string;
  description: string;
  tips: string[];
  bestTime: string;
  image: string;
}> = {
  barcelona: {
    title: "Barcelona",
    description: "Katalánská perla s Gaudího architekturou, středomořským klimatem a živou kulturou",
    tips: [
      "Navštivte Sagrada Família a Park Güell",
      "Ochutnejte tapas v gotické čtvrti",
      "Relaxujte na pláži Barceloneta"
    ],
    bestTime: "Duben-Červen, Září-Říjen",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded"
  },
  vietnam: {
    title: "Vietnam",
    description: "Exotická země s bohatou historií, úchvatnou přírodou a vynikající kuchyní",
    tips: [
      "Projeďte se lodí v Halong Bay",
      "Ochutnejte tradiční pho a banh mi",
      "Navštivte starobylé město Hoi An"
    ],
    bestTime: "Listopad-Duben",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592"
  },
  pariz: {
    title: "Paříž",
    description: "Město lásky a světel s ikonickou Eiffelovou věží a světoznámými muzei",
    tips: [
      "Vystoupejte na Eiffelovu věž",
      "Navštivte Louvre a Musée d'Orsay",
      "Projděte se po Champs-Élysées"
    ],
    bestTime: "Duben-Červen, Září-Říjen",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34"
  },
  "new-york": {
    title: "New York",
    description: "Město, které nikdy nespí - mrakodrapy, Broadway a Central Park",
    tips: [
      "Navštivte Sochu svobody a Ellis Island",
      "Projděte se Central Parkem",
      "Zažijte Broadway show"
    ],
    bestTime: "Duben-Červen, Září-Listopad",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9"
  },
  rim: {
    title: "Řím",
    description: "Věčné město s antickými památkami, fontánami a vynikající italskou kuchyní",
    tips: [
      "Navštivte Koloseum a Vatikán",
      "Hoďte minci do Fontány di Trevi",
      "Ochutnejte autentickou italskou pizzu"
    ],
    bestTime: "Duben-Červen, Září-Říjen",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5"
  },
};

export default function DestinationLandingPage() {
  const params = useParams();
  const destinationSlug = params.destination || "";
  
  // Fetch flights from Pelikan cache
  const { data: flights, isLoading } = trpc.flights.pelikan.useQuery({ limit: 20 });

  const meta = destinationMeta[destinationSlug] || {
    title: destinationSlug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    description: `Nejlevnější letenky do destinace ${destinationSlug}`,
    tips: [],
    bestTime: "Celoročně",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05"
  };

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
                <span>{flights?.length || 0} aktuálních nabídek</span>
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
          ) : flights && flights.length > 0 ? (
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

                    {/* Social Proof */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{Math.floor(Math.random() * 50) + 10} lidí si prohlédlo</span>
                      </div>
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
            <Card className="p-8 text-center">
              <p className="text-gray-500 mb-4">
                Momentálně nemáme k dispozici žádné lety do {meta.title}.
              </p>
              <Link href="/">
                <Button variant="outline">Prohlédnout všechny destinace</Button>
              </Link>
            </Card>
          )}
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
