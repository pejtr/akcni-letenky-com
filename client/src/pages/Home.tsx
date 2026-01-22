import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatbotWidget from "@/components/ChatbotWidget";
import SocialProofWidget from "@/components/SocialProofWidget";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showStickyBanner, setShowStickyBanner] = useState(false);

  // Handle scroll for sticky elements
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
      
      // Show sticky banner after scrolling 50% of page
      const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (window.scrollY / pageHeight) * 100;
      setShowStickyBanner(scrollPercentage > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("cs-CZ").format(price) + " Kč";
  };

  // Popular destinations data with original images
  const popularDestinations = [
    { city: "Londýn", price: 733, country: "Anglie", image: "/dest-london.webp" },
    { city: "New York", price: 7490, country: "USA", image: "/dest-newyork.webp" },
    { city: "Afrika", price: 7990, country: "Afrika", image: "/dest-africa.webp" },
    { city: "Maroko", price: 1426, country: "Maroko", image: "/dest-maroko.webp" },
    { city: "Paříž", price: 1027, country: "Francie", image: "/dest-paris.webp" },
    { city: "Vietnam", price: 7990, country: "Vietnam", image: "/dest-vietnam.webp" },
    { city: "Bali", price: 12790, country: "Indonésie", image: "/dest-bali.webp" },
    { city: "Srí Lanka", price: 13990, country: "Srí Lanka", image: "/dest-srilanka.webp" },
    { city: "Dubaj", price: 5183, country: "Spojené Arabské Emiráty", image: "/dest-dubai.webp" },
    { city: "Thajsko", price: 12390, country: "Thajsko", image: "/dest-thailand.webp" },
    { city: "Santorini", price: 1791, country: "Řecko", image: "/dest-santorini.webp" },
    { city: "Jordánsko", price: 1114, country: "Ammán", image: "/dest-jordan.webp" },
    { city: "Řím", price: 712, country: "Itálie", image: "/dest-rome.webp" },
    { city: "Island", price: 1460, country: "Island", image: "/dest-iceland.webp" },
    { city: "Miami", price: 9490, country: "USA", image: "/dest-miami.webp" },
    { city: "Barcelona", price: 746, country: "Španělsko", image: "/dest-barcelona.webp" },
  ];

  // Featured European cities with original images
  const featuredCities = [
    {
      from: "Praha",
      to: "Londýn",
      price: 733,
      description: "Londýn – obchodní i kulturní centrum plné příležitostí a zážitků.",
      image: "/featured-london.webp",
    },
    {
      from: "Praha",
      to: "Paříž",
      price: 1027,
      description: "Město lásky, umění, módy i gastronomie.",
      image: "/featured-paris.webp",
    },
    {
      from: "Praha",
      to: "Řím",
      price: 712,
      description: "Věčné město – památky, historie a skvělé jídlo.",
      image: "/featured-rome.webp",
    },
    {
      from: "Praha",
      to: "Barcelona",
      price: 946,
      description: "Gaudí, tapas a městské pláže. Skvělá volba po celý rok.",
      image: "/featured-barcelona.webp",
    },
  ];

  // Airlines data with original logos
  const airlines = [
    { name: "Austrian Airlines", logo: "/logo-austrian.webp" },
    { name: "Emirates", logo: "/logo-emirates.webp" },
    { name: "Qatar Airways", logo: "/logo-qatar.webp" },
    { name: "Ryanair", logo: "/logo-ryanair.webp" },
    { name: "Air France", logo: "/logo-airfrance.webp" },
    { name: "Lufthansa", logo: "/logo-lufthansa.webp" },
    { name: "Icelandair", logo: "/logo-icelandair.webp" },
    { name: "Turkish Airlines", logo: "/logo-turkish.webp" },
    { name: "KLM", logo: "/logo-klm.webp" },
    { name: "British Airways", logo: "/logo-british.webp" },
    { name: "Wizz Air", logo: "/logo-wizzair.webp" },
    { name: "LOT", logo: "/logo-lot.webp" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Breadcrumbs with Schema.org */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Domů",
              "item": "https://www.akcni-letenky.com/"
            }
          ]
        })}
      </script>
      {/* Sticky Navigation Header */}
      <header role="banner"
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-sm",
          isScrolled ? "py-2" : "py-3"
        )}
      >
        <div className="container flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#FFD700] rounded-lg flex items-center justify-center">
              <span className="text-2xl">✈️</span>
            </div>
            <span className="font-bold text-lg">AKČNÍ-<br/>LETENKY.com</span>
            <span className="hidden md:inline text-sm text-blue-600 ml-2">
              Nejlevnější Lety
            </span>
          </div>

          {/* Navigation */}
          <nav role="navigation" aria-label="Main navigation" className="hidden md:flex items-center gap-6">
            <a href="/" className="text-sm text-foreground hover:text-blue-600 transition-colors font-medium flex items-center gap-1">
              💸 LEVNÉ LETENKY
            </a>
            <a href="/dovolena" className="text-sm text-foreground hover:text-blue-600 transition-colors font-medium flex items-center gap-1">
              ⭐ DOVOLENÁ
            </a>
            <a href="/blog" className="text-sm text-foreground hover:text-blue-600 transition-colors font-medium flex items-center gap-1">
              📝 BLOG
            </a>
            <a href="/aerolinky" className="text-sm text-foreground hover:text-blue-600 transition-colors font-medium flex items-center gap-1">
              ✈️ AEROLINKY
            </a>
            <a href="/rezervace" className="text-sm text-foreground hover:text-blue-600 transition-colors font-medium flex items-center gap-1">
              🚀 RYCHLÁ REZERVACE
            </a>
          </nav>

          {/* Phone */}
          <div className="flex items-center gap-2 text-[#FF6B35]">
            <Phone className="w-4 h-4" />
            <span className="font-semibold">223 340 510</span>
          </div>
        </div>
      </header>

      {/* Yellow Banner */}
      <div className="bg-[#FFD700] py-8 mt-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-black text-center text-black tracking-wide">
            NEJLEVNĚJŠÍ AKČNÍ LETENKY
          </h1>
        </div>
      </div>

      {/* Hero Search Form */}
      <div className="bg-white py-8 border-b border-border">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <label className="block text-xs text-muted-foreground mb-1">Kam se chystáte?</label>
              <input
                type="text"
                placeholder="Např. Barcelona"
                className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <label className="block text-xs text-muted-foreground mb-1">Kdy?</label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <label className="block text-xs text-muted-foreground mb-1">Kolik osob?</label>
              <select className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="1">1 osoba</option>
                <option value="2">2 osoby</option>
                <option value="3">3 osoby</option>
                <option value="4">4 osoby</option>
                <option value="5">5+ osob</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-[#E91E63] hover:bg-[#C2185B] text-white font-bold py-3 rounded-md">
                VYHLEDAT DOVOLENOU
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Links */}
      <div className="bg-white py-4 border-b border-border">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <a href="#dovolena" className="text-blue-600 hover:underline font-medium">
              Dovolená se slevou až 80 %
            </a>
            <span className="text-muted-foreground">|</span>
            <a href="#eurovikendy" className="text-blue-600 hover:underline font-medium">
              Eurovíkendy
            </a>
            <span className="text-muted-foreground">|</span>
            <a href="#hotely" className="text-blue-600 hover:underline font-medium">
              Hotely
            </a>
            <span className="text-muted-foreground">|</span>
            <a href="#nejlevnejsi" className="text-blue-600 hover:underline font-medium">
              Nejlevnější letenky od 590 Kč
            </a>
          </div>
        </div>
      </div>

      {/* Featured European Cities */}
      <section aria-labelledby="featured-cities" className="py-10 bg-[#F0F4F8]">
        <h2 id="featured-cities" className="sr-only">Nejlevnější letenky do evropských měst</h2>
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCities.map((city, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${city.image})` }}
                  role="img"
                  aria-label={`Fotografie ${city.to}`}
                />
                <div className="p-5">
                  <h3 className="font-bold text-lg text-blue-700 mb-2 text-center">
                    {city.from} ⇄ {city.to}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center min-h-[40px]">
                    {city.description}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-2 border-[#FF8C00] text-[#FF8C00] hover:bg-[#FF8C00] hover:text-white font-bold rounded-lg"
                  >
                    od {formatPrice(city.price)}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zpáteční levné letenky Grid */}
      <section aria-labelledby="return-flights" className="py-12 bg-white">
        <div className="container">
          {/* Yellow Banner Title */}
          <div className="bg-[#FFD700] py-3 px-6 inline-block rounded-lg mb-8 mx-auto block text-center">
            <h2 id="return-flights" className="text-xl font-bold text-black">
              Zpáteční levné letenky
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {popularDestinations.map((dest, index) => (
              <a
                key={index}
                href={`#${dest.city}`}
                className="bg-white rounded-lg shadow-sm border border-border p-4 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-16 h-16 bg-cover bg-center rounded-md flex-shrink-0"
                    style={{ backgroundImage: `url(${dest.image})` }}
                    role="img"
                    aria-label={`Fotografie ${dest.city}, ${dest.country}`}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base group-hover:text-blue-600 transition-colors mb-1">
                      {dest.city}
                    </h3>
                    <p className="text-sm text-muted-foreground">od {formatPrice(dest.price)}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">{dest.country}</p>
                </div>
              </a>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-8 max-w-4xl mx-auto">
            * Uvedené ceny jsou obvykle za zpáteční lety včetně poplatků. Další služby (zavazadla apod.) mohou být zpoplatněny u dopravce/agentury.
          </p>
        </div>
      </section>

      {/* Trust Building Section */}
      <article className="py-12 bg-[#F5F7FA]">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-4">
            Akční letenky: hledejte nejvýhodnější spojení snadno
          </h2>
          <p className="text-center text-muted-foreground leading-relaxed">
            Náš přehled akčních letenek vám pomůže rychle porovnat ceny napříč aerolinkami a agenturami, hlídat změny cen a najít termíny s nejlepší cenou. Zobrazené částky jsou obvykle konečné (daně/poplatky); další služby mohou být zpoplatněny u poskytovatele.
          </p>
        </div>
      </article>

      {/* Airline Logos Section */}
      <section aria-labelledby="airlines" className="py-12 bg-white">
        <div className="container">
          <h2 id="airlines" className="text-2xl font-bold text-center mb-8">
            Letecké společnosti
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {airlines.map((airline, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-border p-4 hover:shadow-md transition-shadow flex flex-col items-center justify-center gap-2"
              >
                <span className="text-3xl">{airline.logo}</span>
                <span className="text-xs text-center font-medium text-muted-foreground">
                  {airline.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky Bottom Banner */}
      {showStickyBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#FFD700] py-3 px-4 shadow-lg z-40 animate-in slide-in-from-bottom">
          <div className="container">
            <p className="text-center text-sm md:text-base font-bold text-black">
              Akční nabídka: <span className="text-[#E91E63]">Letenky do 1 500 Kč</span> | 
              <span className="text-blue-700"> Dovolená se slevou až 80 %</span> | 
              <span className="text-blue-700"> Eurovíkendy</span> | 
              <span className="text-blue-700"> Business class</span>
            </p>
          </div>
        </div>
      )}

      {/* Chatbot Widget */}
      <ChatbotWidget />

      {/* Social Proof Widget */}
      <SocialProofWidget />
    </div>
  );
}
