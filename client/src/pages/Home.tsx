import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { CalendarIcon, MapPin, Phone, Users, Heart, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import ChatbotWidget from "@/components/ChatbotWidget";
import SocialProofWidget from "@/components/SocialProofWidget";

export default function Home() {
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [date, setDate] = useState<Date>();
  const [passengers, setPassengers] = useState("1");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showStickyBanner, setShowStickyBanner] = useState(false);

  // Fetch featured flights
  const { data: featuredFlights, isLoading: featuredLoading } = trpc.flights.featured.useQuery();
  
  // Fetch all flights for main listing
  const { data: allFlights, isLoading: allLoading } = trpc.flights.list.useQuery();

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

  const handleSearch = () => {
    console.log("Searching flights:", { fromCity, toCity, date, passengers });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("cs-CZ").format(price) + " Kč";
  };

  const formatRating = (rating: number) => {
    return (rating / 10).toFixed(1);
  };

  // Popular destinations data
  const popularDestinations = [
    { city: "Londýn", price: 733, country: "Anglie", image: "/hero-bg.jpg" },
    { city: "New York", price: 7490, country: "USA", image: "/hero-bg.jpg" },
    { city: "Afrika", price: 7990, country: "Afrika", image: "/hero-bg.jpg" },
    { city: "Maroko", price: 1426, country: "Maroko", image: "/hero-bg.jpg" },
    { city: "Paříž", price: 1027, country: "Francie", image: "/hero-bg.jpg" },
    { city: "Vietnam", price: 7990, country: "Vietnam", image: "/hero-bg.jpg" },
    { city: "Bali", price: 12190, country: "Indonésie", image: "/hero-bg.jpg" },
    { city: "Srí Lanka", price: 13091, country: "Srí Lanka", image: "/hero-bg.jpg" },
    { city: "Dubaj", price: 5183, country: "SAE", image: "/hero-bg.jpg" },
    { city: "Thajsko", price: 12390, country: "Thajsko", image: "/hero-bg.jpg" },
    { city: "Santorini", price: 1791, country: "Řecko", image: "/hero-bg.jpg" },
    { city: "Jordánsko", price: 1114, country: "Ammán", image: "/hero-bg.jpg" },
    { city: "Řím", price: 712, country: "Itálie", image: "/hero-bg.jpg" },
    { city: "Island", price: 1460, country: "Island", image: "/hero-bg.jpg" },
    { city: "Miami", price: 9490, country: "USA", image: "/hero-bg.jpg" },
    { city: "Barcelona", price: 746, country: "Španělsko", image: "/hero-bg.jpg" },
  ];

  // Featured European cities
  const featuredCities = [
    {
      from: "Praha",
      to: "Londýn",
      price: 733,
      description: "Londýn – obchodní i kulturní centrum plné příležitostí a zážitků.",
      image: "/hero-bg.jpg",
    },
    {
      from: "Praha",
      to: "Paříž",
      price: 1027,
      description: "Město lásky, umění, módy i gastronomie.",
      image: "/hero-bg.jpg",
    },
    {
      from: "Praha",
      to: "Řím",
      price: 712,
      description: "Věčné město – památky, historie a skvělé jídlo.",
      image: "/hero-bg.jpg",
    },
    {
      from: "Praha",
      to: "Barcelona",
      price: 946,
      description: "Gaudí, tapas a městské pláže. Skvělá volba po celý rok.",
      image: "/hero-bg.jpg",
    },
  ];

  // Airlines data
  const airlines = [
    { name: "Austrian Airlines", logo: "🇦🇹" },
    { name: "Emirates", logo: "🇦🇪" },
    { name: "Qatar Airways", logo: "🇶🇦" },
    { name: "Ryanair", logo: "🇮🇪" },
    { name: "Air France", logo: "🇫🇷" },
    { name: "Lufthansa", logo: "🇩🇪" },
    { name: "Icelandair", logo: "🇮🇸" },
    { name: "Turkish Airlines", logo: "🇹🇷" },
    { name: "KLM", logo: "🇳🇱" },
    { name: "British Airways", logo: "🇬🇧" },
    { name: "Wizz Air", logo: "🇭🇺" },
    { name: "LOT", logo: "🇵🇱" },
  ];

  return (
    <div className="min-h-screen">
      {/* Sticky Navigation Header */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white shadow-md py-3"
            : "bg-white/90 backdrop-blur-sm py-4"
        )}
      >
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">✈</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              akcni-letenky.com
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="/" className="text-foreground hover:text-primary transition-colors font-medium">
              💸 LEVNÉ LETENKY
            </a>
            <a href="/dovolena" className="text-foreground hover:text-primary transition-colors font-medium">
              ⭐ DOVOLENÁ
            </a>
            <a href="/aerolinky" className="text-foreground hover:text-primary transition-colors font-medium">
              ✈️ AEROLINKY
            </a>
            <a href="/rezervace" className="text-foreground hover:text-primary transition-colors font-medium">
              🚀 RYCHLÁ REZERVACE
            </a>
          </nav>

          <div className="flex items-center gap-2 text-[#FF8C00]">
            <Phone className="w-5 h-5" />
            <span className="font-semibold text-lg">223 340 510</span>
          </div>
        </div>
      </header>

      {/* Yellow Banner */}
      <div className="bg-[#FFD700] py-6 mt-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-black text-center text-black tracking-wide">
            NEJLEVNĚJŠÍ AKČNÍ LETENKY
          </h1>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b border-border">
        <div className="container">
          <Tabs defaultValue="dovolena" className="w-full">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-none">
              <TabsTrigger
                value="dovolena"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
              >
                Dovolená se slevou až 80 %
              </TabsTrigger>
              <TabsTrigger
                value="eurovíkendy"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
              >
                Eurovíkendy
              </TabsTrigger>
              <TabsTrigger
                value="hotely"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
              >
                Hotely
              </TabsTrigger>
              <TabsTrigger
                value="nejlevnejsi"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
              >
                Nejlevnější letenky od 590 Kč
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Featured European Cities */}
      <section className="py-12 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCities.map((city, index) => (
              <div
                key={index}
                className="bg-card rounded-lg shadow-md overflow-hidden border border-border hover:shadow-xl transition-shadow"
              >
                <div
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${city.image})` }}
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">
                    {city.from} ⇄ {city.to}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {city.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#FF8C00]">
                      od {formatPrice(city.price)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zpáteční levné letenky Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Zpáteční levné letenky
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {popularDestinations.map((dest, index) => (
              <a
                key={index}
                href={`#${dest.city}`}
                className="bg-card rounded-lg shadow-sm border border-border p-4 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                    {dest.city}
                  </h3>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm font-semibold text-primary mb-1">
                  od {formatPrice(dest.price)}
                </p>
                <p className="text-xs text-muted-foreground">{dest.country}</p>
              </a>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-8 max-w-4xl mx-auto">
            * Uvedené ceny jsou obvykle za zpáteční lety včetně poplatků. Další služby (zavazadla apod.) mohou být zpoplatněny u dopravce/agentury.
          </p>
        </div>
      </section>

      {/* Trust Building Section */}
      <section className="py-12 bg-background">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-4">
            Akční letenky: hledejte nejvýhodnější spojení snadno
          </h2>
          <p className="text-center text-muted-foreground">
            Náš přehled akčních letenek vám pomůže rychle porovnat ceny napříč aerolinkami a agenturami, hlídat změny cen a najít termíny s nejlepší cenou. Zobrazené částky jsou obvykle konečné (daně/poplatky); další služby mohou být zpoplatněny u poskytovatele.
          </p>
        </div>
      </section>

      {/* Airline Logos Section */}
      <section className="py-12 bg-muted/20">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-8">
            Letecké společnosti
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
            {airlines.map((airline, index) => (
              <a
                key={index}
                href={`#${airline.name}`}
                className="bg-card rounded-lg shadow-sm border border-border p-4 hover:shadow-md transition-shadow flex flex-col items-center justify-center gap-2 group"
              >
                <span className="text-4xl">{airline.logo}</span>
                <span className="text-sm text-center font-medium group-hover:text-primary transition-colors">
                  {airline.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky Bottom Banner */}
      {showStickyBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFD700] py-4 shadow-lg animate-in slide-in-from-bottom-5">
          <div className="container">
            <div className="flex flex-wrap items-center justify-center gap-4 text-black font-semibold">
              <span className="text-sm md:text-base">Akční nabídka:</span>
              <a href="#letenky" className="hover:underline text-sm md:text-base">
                Letenky do 1 500 Kč
              </a>
              <span className="text-muted-foreground">|</span>
              <a href="#dovolena" className="hover:underline text-sm md:text-base">
                Dovolená se slevou až 80 %
              </a>
              <span className="text-muted-foreground">|</span>
              <a href="#eurovikendy" className="hover:underline text-sm md:text-base">
                Eurovíkendy
              </a>
              <span className="text-muted-foreground">|</span>
              <a href="#business" className="hover:underline text-sm md:text-base">
                Business class
              </a>
            </div>
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
