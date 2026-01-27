import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatbotWidget from "@/components/ChatbotWidget";
import SocialProofWidget from "@/components/SocialProofWidget";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBottomBanner, setShowBottomBanner] = useState(false);
  
  // Handle scroll for sticky navigation and bottom banner
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
      
      // Calculate scroll percentage for bottom banner
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (window.scrollY / scrollHeight) * 100;
      setShowBottomBanner(scrollPercent > 60);
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

  // FAQ data for rich snippets
  const faqData = [
    {
      question: "Jak najít nejlevnější letenky?",
      answer: "Nejlevnější letenky najdete porovnáním cen napříč aerolinkami. Doporučujeme rezervovat 2-3 měsíce předem, být flexibilní s daty a využívat naše denní akční nabídky. Sledujte také naši FB skupinu s 33 500 členy pro exkluzivní tipy."
    },
    {
      question: "Jsou uvedené ceny konečné?",
      answer: "Ano, zobrazené ceny jsou obvykle konečné včetně daní a poplatků. Další služby jako zavazadla, výběr sedadla nebo strava mohou být zpoplatněny zvlášť u dopravce nebo agentury."
    },
    {
      question: "Jak funguje rezervace letenek?",
      answer: "Po výběru letu vás přesměrujeme na web partnera (Pelikán, Kiwi.com), kde dokončíte rezervaci. Platba probíhá přímo u partnera, který zajistí vystavení letenek a potvrzení."
    },
    {
      question: "Mohu letenku stornovat nebo změnit?",
      answer: "Podmínky storna a změn závisí na tarifu a aerolince. Levné tarify jsou obvykle nevratné, dražší tarify umožňují změny za poplatek. Doporučujeme cestovní pojištění pro případ nečekaných událostí."
    },
    {
      question: "Kdy je nejlepší čas na nákup letenek?",
      answer: "Obecně platí: čím dříve, tím levněji. Pro evropské destinace rezervujte 1-2 měsíce předem, pro dálkové lety 3-6 měsíců. Last minute nabídky mohou být výhodné, ale výběr je omezený."
    },
    {
      question: "Jaké dokumenty potřebuji k cestě?",
      answer: "Pro cesty po EU stačí občanský průkaz. Pro mimoevropské destinace potřebujete platný cestovní pas (minimálně 6 měsíců platnosti). Některé země vyžadují víza - ověřte si požadavky před cestou."
    }
  ];

  // Airlines data with original logos
  const airlines = [
    { name: "Austrian Airlines", logo: "/logo-austrian.webp", url: "https://www.akcni-letenky.com/letecke-spolecnosti/austrian-airlines-letenky/" },
    { name: "Emirates", logo: "/logo-emirates.webp", url: "https://www.akcni-letenky.com/letecke-spolecnosti/emirates-letenky/" },
    { name: "Qatar Airways", logo: "/logo-qatar.webp", url: "https://www.akcni-letenky.com/letecke-spolecnosti/qatar-airways-letenky/" },
    { name: "Ryanair", logo: "/logo-ryanair.webp", url: "https://www.akcni-letenky.com/letecke-spolecnosti/ryanair-letenky/" },
    { name: "Air France", logo: "/logo-airfrance.webp", url: "https://www.akcni-letenky.com/letecke-spolecnosti/air-france-letenky/" },
    { name: "Lufthansa", logo: "/logo-lufthansa.webp", url: "https://www.akcni-letenky.com/letecke-spolecnosti/lufthansa-letenky/" },
    { name: "Icelandair", logo: "/logo-icelandair.webp", url: "https://www.akcni-letenky.com/letecke-spolecnosti/icelandair-letenky/" },
    { name: "Turkish Airlines", logo: "/logo-turkish.webp", url: "https://www.akcni-letenky.com/letecke-spolecnosti/turkish-airlines-letenky/" },
    { name: "KLM", logo: "/logo-klm.webp", url: "https://www.akcni-letenky.com/letecke-spolecnosti/klm-letenky/" },
    { name: "British Airways", logo: "/logo-british.webp", url: "https://www.akcni-letenky.com/letecke-spolecnosti/british-airways-letenky/" },
    { name: "Wizz Air", logo: "/logo-wizzair.webp", url: "https://www.akcni-letenky.com/letecke-spolecnosti/wizzair-letenky/" },
    { name: "LOT", logo: "/logo-lot.webp", url: "https://www.akcni-letenky.com/letecke-spolecnosti/lot-letenky/" },
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
          <div className="flex items-center gap-2 text-[#E91E63]">
            <Phone className="w-4 h-4" />
            <span className="font-semibold">223 340 510</span>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section className="relative mt-16 min-h-[500px] md:min-h-[600px] flex items-center justify-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-coastal.jpg')" }}
        >
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-orange-400/30 via-transparent to-black/20" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 container text-center px-4">
          {/* Yellow Banner */}
          <div className="inline-block bg-[#FFD700] px-8 py-4 rounded-lg mb-4 shadow-lg">
            <h1 className="text-2xl md:text-4xl font-black text-[#003087] tracking-wide">
              NEJLEVNĚJŠÍ AKČNÍ LETENKY
            </h1>
          </div>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl font-bold text-white mb-8" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Ušetřete do 50% na letu
          </p>
          
          {/* Search Form Card */}
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative text-left">
                <label className="block text-xs text-muted-foreground mb-1">kam se chystáte?</label>
                <input
                  type="text"
                  placeholder="Napiš. Barcelona"
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                />
              </div>
              <div className="relative text-left">
                <label className="block text-xs text-muted-foreground mb-1">kdy?</label>
                <input
                  type="text"
                  placeholder="dd.mm.rrrr"
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                />
              </div>
              <div className="relative text-left">
                <label className="block text-xs text-muted-foreground mb-1">kolik osob?</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 appearance-none">
                  <option value="1">1 osoba</option>
                  <option value="2">2 osoby</option>
                  <option value="3">3 osoby</option>
                  <option value="4">4 osoby</option>
                  <option value="5">5+ osob</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-bold py-3 rounded-md text-sm">
                  VYHLEDAT DOVOLENOU
                </Button>
              </div>
            </div>
          </div>
          
          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
              <span className="text-[#FF6B35] font-bold text-lg">500+</span>
              <span className="text-xs text-gray-600">Recenzí</span>
            </div>
            <div className="bg-white rounded-full p-3 shadow-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
              <span className="text-blue-600 font-bold">Certifikace</span>
            </div>
          </div>
        </div>
      </section>

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
      <section aria-labelledby="return-flights" className="py-12 bg-[#F5F7FA]">
        <div className="container">
          {/* Yellow Banner Title */}
          <div className="flex justify-center mb-8">
            <div className="bg-[#FFD700] py-3 px-6 rounded-lg">
              <h2 id="return-flights" className="text-xl font-bold text-black">
                Zpáteční levné letenky
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {popularDestinations.map((dest, index) => (
              <a
                key={index}
                href={`#${dest.city}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all group p-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={dest.image}
                    alt={`${dest.city}, ${dest.country}`}
                    className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-1 group-hover:underline">
                      {dest.city}
                    </h3>
                    <p className="text-sm text-gray-500">od {formatPrice(dest.price)}</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm font-bold text-black">{dest.country}</p>
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
      <section aria-labelledby="airlines" className="py-12 bg-[#F5F7FA]">
        <div className="container">
          <h2 id="airlines" className="text-2xl font-bold text-center mb-8">
            Letecké společnosti
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {airlines.map((airline, index) => (
              <a
                key={index}
                href={`#${airline.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-4 flex items-center gap-3 group"
              >
                <img
                  src={airline.logo}
                  alt={`${airline.name} logo`}
                  className="w-12 h-12 object-contain flex-shrink-0"
                  loading="lazy"
                />
                <span className="text-sm font-medium text-blue-600 group-hover:underline">
                  {airline.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section with Schema.org FAQPage */}
      <section aria-labelledby="faq" className="py-12 bg-white">
        {/* FAQPage Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqData.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })}
        </script>
        <div className="container max-w-4xl">
          <h2 id="faq" className="text-2xl font-bold text-center mb-8">
            Často kladené otázky
          </h2>
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <details
                key={index}
                className="bg-[#F5F7FA] rounded-lg shadow-sm group"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-semibold text-lg hover:bg-gray-100 rounded-lg transition-colors">
                  <span>{faq.question}</span>
                  <span className="text-[#E91E63] text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-5 pb-5 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky Bottom Banner - Shows after 60% scroll */}
      {showBottomBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#FFD700] py-4 px-4 shadow-lg z-40 animate-in slide-in-from-bottom">
          <div className="container">
            <p className="text-center text-base md:text-lg font-bold text-black">
              Akční nabídka: <span className="text-[#E91E63]">Letenky do 1 500 Kč</span> | 
              <span className="text-blue-700"> Dovolená se slevou až 80 %</span> | 
              <span className="text-blue-700"> Eurovíkendy</span> | 
              <span className="text-blue-700"> Business class</span>
            </p>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <footer className="bg-[#FF9800] py-16">
        <div className="container">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-5xl mx-auto">
            {/* Main Heading */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#FFD700] rounded-lg flex items-center justify-center">
                  <span className="text-3xl">✈️</span>
                </div>
                <h2 className="text-3xl font-black text-[#003087]">AKČNÍ-LETENKY.com</h2>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Objevte <strong>nejlevnější letenky</strong> a splňte si své cestovatelské sny. Porovnáváme za vás nabídky od desítek leteckých společností, abyste mohli letět chytře a za zlevněné ceny.
              </p>
            </div>

            {/* Yellow Banner */}
            <div className="bg-[#FFD700] rounded-lg px-6 py-3 mb-8 flex items-center justify-center gap-4 flex-wrap">
              <span className="text-sm font-semibold text-[#003087]">⭐ Business class</span>
              <span className="text-sm font-semibold text-[#003087]">✈️ Přímé lety</span>
              <span className="text-sm font-semibold text-[#003087]">💰 Časté dotazy</span>
            </div>

            {/* Two Columns */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Left Column - Why Book With Us */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  Proč rezervovat u nás?
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-sm">Garantujeme <strong>nejlevnější letenky</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-sm">Denně čerstvé <strong>akční letenky</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-sm">Přehledné porovnání desítek aerolinek</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-sm">Snadná a bezpečná online rezervace</span>
                  </li>
                </ul>
              </div>

              {/* Right Column - Community */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-blue-600">👥</span>
                  Přidejte se ke komunitě 60 tis. + členů
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#1877F2] rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">f</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Akční letenky a cestování</p>
                      <p className="text-xs text-muted-foreground">Tipy a rady od komunity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#1877F2] rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">f</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Tour De Svět - Cestování</p>
                      <p className="text-xs text-muted-foreground">Inspirace pro vaše cesty</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Button size="lg" className="bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold px-8 py-6 text-lg rounded-full shadow-lg">
                ✈️ Zobrazit nejvýhodnější letenky
              </Button>
            </div>

            {/* Bottom Yellow Banner */}
            <div className="bg-[#FFD700] rounded-lg px-6 py-3 mt-8 text-center">
              <p className="text-sm text-[#003087]">
                Půjčka na dovolenou s úrokem od <strong>4,49 %</strong>! To je výhodné financování se Zonky! →
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center mt-8 text-white text-sm">
            <p>© 2026 AKČNÍ-LETENKY.com | Všechna práva vyhrazena</p>
          </div>
        </div>
      </footer>

      {/* Chatbot Widget */}
      <ChatbotWidget />

      {/* Social Proof Widget */}
      <SocialProofWidget />
    </div>
  );
}
