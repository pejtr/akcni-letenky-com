import { useState } from "react";
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
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { CalendarIcon, MapPin, Phone, Users, Heart } from "lucide-react";
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

  // Fetch featured flights
  const { data: featuredFlights, isLoading: featuredLoading } = trpc.flights.featured.useQuery();
  
  // Fetch all flights for main listing
  const { data: allFlights, isLoading: allLoading } = trpc.flights.list.useQuery();

  // Handle scroll for sticky navigation
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setIsScrolled(window.scrollY > 50);
    });
  }

  const handleSearch = () => {
    console.log("Searching flights:", { fromCity, toCity, date, passengers });
    // TODO: Implement flight search navigation
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("cs-CZ").format(price) + " Kč";
  };

  const formatRating = (rating: number) => {
    return (rating / 10).toFixed(1);
  };

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
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">✈</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              akcni-letenky.com
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="/"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Domů
            </a>
            <a
              href="/lety"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Lety
            </a>
            <a
              href="/kontakt"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Kontakt
            </a>
            <a
              href="/kusy"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Kusy
            </a>
          </nav>

          {/* Phone Number */}
          <div className="flex items-center gap-2 text-[#FF8C00]">
            <Phone className="w-5 h-5" />
            <span className="font-semibold text-lg">223 340 510</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative h-[600px] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: "url(/hero-bg.jpg)",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

        {/* Content */}
        <div className="relative z-10 container text-center">
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
            Last Minute Letenky 2026:
          </h1>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-12 drop-shadow-lg">
            AŽ -60% Sleva!
          </h2>

          {/* Search Form */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* From City */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <Input
                  placeholder="Odkud?"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  className="pl-10 h-14 text-lg border-2 border-border focus:border-primary"
                />
              </div>

              {/* To City */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <Input
                  placeholder="Kam?"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  className="pl-10 h-14 text-lg border-2 border-border focus:border-primary"
                />
              </div>

              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-14 justify-start text-left font-normal border-2 border-border hover:border-primary",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    {date ? (
                      format(date, "PPP", { locale: cs })
                    ) : (
                      <span>Kdy?</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={cs}
                  />
                </PopoverContent>
              </Popover>

              {/* Passengers */}
              <Select value={passengers} onValueChange={setPassengers}>
                <SelectTrigger className="h-14 border-2 border-border focus:border-primary">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <SelectValue placeholder="Kolik osob?" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 osoba</SelectItem>
                  <SelectItem value="2">2 osoby</SelectItem>
                  <SelectItem value="3">3 osoby</SelectItem>
                  <SelectItem value="4">4 osoby</SelectItem>
                  <SelectItem value="5">5+ osob</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="w-full mt-6 h-16 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            >
              HLEDAT LETENKY
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Offers Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12">
            Nejlepší nabídky na únor
          </h2>

          {featuredLoading ? (
            <div className="text-center text-muted-foreground">Načítání nabídek...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredFlights?.map((flight) => (
                <div
                  key={flight.id}
                  className="bg-card rounded-xl shadow-lg overflow-hidden border border-border hover:shadow-xl transition-shadow"
                >
                  <div
                    className="relative h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${flight.imageUrl})` }}
                  >
                    <div className="absolute top-4 left-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full font-bold">
                      -{flight.discountPercent}%
                    </div>
                    <button className="absolute top-4 right-4 text-white hover:scale-110 transition-transform">
                      <Heart className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">
                      {flight.fromCity} ⇄ {flight.toCity}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-yellow-500">★★★★</span>
                      <span className="text-sm text-muted-foreground">
                        {formatRating(flight.rating || 45)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {flight.stops === 0 ? "Přímý let" : `${flight.stops} zastávka`} · {flight.duration}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(flight.price || 0)}
                      </span>
                    </div>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                      onClick={() => window.open(flight.affiliateUrl, "_blank")}
                    >
                      REZERVUJTE TEĎ
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Listings Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-4">
            Last Minute Letenky
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Objevte nejlepší nabídky na letenky s okamžitým odletem
          </p>

          {allLoading ? (
            <div className="text-center text-muted-foreground">Načítání nabídek...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {allFlights?.slice(0, 6).map((flight) => (
                <div
                  key={flight.id}
                  className="bg-card rounded-xl shadow-md overflow-hidden border border-border flex hover:shadow-lg transition-shadow"
                >
                  <div
                    className="w-1/3 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${flight.imageUrl})` }}
                  >
                    <button className="absolute top-2 right-2 text-white hover:scale-110 transition-transform">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-bold text-lg mb-2">
                      {flight.fromCity} ⇄ {flight.toCity}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-yellow-500">★★★★</span>
                      <span className="text-sm text-muted-foreground">
                        {formatRating(flight.rating || 45)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {flight.airline} · {flight.duration} · {flight.stops === 0 ? "Přímý let" : `${flight.stops} zastávka`}
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      {flight.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(flight.originalPrice)}
                        </span>
                      )}
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(flight.price || 0)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold"
                      onClick={() => window.open(flight.affiliateUrl, "_blank")}
                    >
                      ZOBRAZIT NABÍDKU
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Chatbot Widget */}
      <ChatbotWidget />

      {/* Social Proof Widget */}
      <SocialProofWidget />
    </div>
  );
}
