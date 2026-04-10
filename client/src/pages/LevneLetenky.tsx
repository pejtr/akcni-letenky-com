import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Plane, ArrowRight, Search, Star, TrendingDown, Globe, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";
import SocialProofNotification from "@/components/SocialProofNotification";
import CountdownTimer from "@/components/CountdownTimer";
import FlightMapWidget from "@/components/FlightMapWidget";
import { kiwiSearchLink, kiwiAffiliateUrl } from "@shared/affiliateLinks";

// Travelpayouts Kiwi.com widget loader
function KiwiSearchWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || loaded) return;
    setLoaded(true);

    // Create the tp-widget div
    const widgetDiv = document.createElement("div");
    widgetDiv.setAttribute("data-tp-widget", "kiwi-search");

    // Load the Travelpayouts Kiwi.com Flights Search Form (promo_id=3414)
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://tpemb.com/content?currency=czk&trs=516867&shmarker=155221&locale=cs&stops=any&show_hotels=true&powered_by=true&promo_id=3414";
    script.charset = "utf-8";

    containerRef.current.appendChild(script);
  }, [loaded]);

  return <div ref={containerRef} className="w-full min-h-[200px]" />;
}

// Travelpayouts Popular Routes Widget
function KiwiPopularRoutesWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || loaded) return;
    setLoaded(true);

    const script = document.createElement("script");
    script.async = true;
    // Popular Routes Widget (promo_id=3413)
    script.src = "https://tpemb.com/content?currency=czk&trs=516867&shmarker=155221&locale=cs&powered_by=true&promo_id=3413";
    script.charset = "utf-8";

    containerRef.current.appendChild(script);
  }, [loaded]);

  return <div ref={containerRef} className="w-full min-h-[200px]" />;
}

// Popular destinations for quick search
const popularDestinations = [
  { name: "Londýn", code: "LON", flag: "🇬🇧", price: "od 1 299 Kč" },
  { name: "Paříž", code: "PAR", flag: "🇫🇷", price: "od 1 499 Kč" },
  { name: "Řím", code: "ROM", flag: "🇮🇹", price: "od 1 199 Kč" },
  { name: "Barcelona", code: "BCN", flag: "🇪🇸", price: "od 1 399 Kč" },
  { name: "Amsterdam", code: "AMS", flag: "🇳🇱", price: "od 1 599 Kč" },
  { name: "Dubaj", code: "DXB", flag: "🇦🇪", price: "od 5 999 Kč" },
  { name: "New York", code: "NYC", flag: "🇺🇸", price: "od 9 999 Kč" },
  { name: "Bangkok", code: "BKK", flag: "🇹🇭", price: "od 8 499 Kč" },
];

export default function LevneLetenky() {
  const [origin, setOrigin] = useState("PRG");
  const [destination, setDestination] = useState("");

  const buildKiwiLink = (dest?: string) => {
    if (dest) {
      return kiwiSearchLink("letiste-vaclava-havla-praha-praha-cesko", dest, "letenky-page");
    }
    return kiwiAffiliateUrl("https://www.kiwi.com/cs/", "letenky-page");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Navigation */}
      <Navigation />
      {/* Social Proof Notifications */}
      <SocialProofNotification />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#1a5276] to-[#2980b9] text-white py-16 pt-28">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>Přes 500 aerolinek · Nejnižší ceny garantovány</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            ✈️ Levné Letenky
          </h1>
          <p className="text-xl opacity-90 mb-2">
            Porovnejte ceny letenek z celého světa
          </p>
          <p className="text-lg opacity-75 max-w-2xl mx-auto">
            Najděte nejlevnější letenky na tisíce destinací. Přímé lety i s přestupem, jednosměrné i zpáteční.
          </p>
          {/* Urgency Timer */}
          <div className="mt-4 flex justify-center">
            <CountdownTimer className="bg-white/20 px-4 py-2 rounded-full" />
          </div>
        </div>
      </section>

      {/* Main Search Widget Section */}
      <section className="py-8 bg-white">
        <div className="container">
          {/* Kiwi.com Search Widget */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100 mb-8">
            <div className="bg-gradient-to-r from-[#00A991] to-[#007a6a] px-6 py-4 flex items-center gap-3">
              <div className="bg-white rounded-full p-2">
                <Plane className="w-5 h-5 text-[#00A991]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Hledat letenky - Kiwi.com</h2>
                <p className="text-sm text-white/80">Miliony letů · Nejlepší ceny · Okamžité potvrzení</p>
              </div>
              <span className="ml-auto bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                ⭐ Doporučujeme
              </span>
            </div>
            <div className="p-4 bg-gray-50">
              <KiwiSearchWidget />
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: "✈️", label: "500+ aerolinek", sub: "Největší výběr" },
              { icon: "💰", label: "Nejnižší ceny", sub: "Garantováno" },
              { icon: "🔒", label: "Bezpečná platba", sub: "SSL šifrování" },
              { icon: "📱", label: "24/7 podpora", sub: "Vždy k dispozici" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="font-semibold text-gray-800 text-sm">{item.label}</div>
                <div className="text-xs text-gray-500">{item.sub}</div>
              </div>
            ))}
          </div>

          {/* Popular Destinations Quick Links */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-[#1a5276]" />
              Populární destinace
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {popularDestinations.map((dest) => (
                <a
                  key={dest.code}
                  href={buildKiwiLink(dest.name.toLowerCase())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#00A991] transition-all group"
                >
                  <div className="text-2xl mb-1">{dest.flag}</div>
                  <div className="font-semibold text-gray-800 group-hover:text-[#00A991] transition-colors">
                    {dest.name}
                  </div>
                  <div className="text-sm text-green-600 font-medium">{dest.price}</div>
                </a>
              ))}
            </div>
          </div>

          {/* Popular Routes Widget */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-8">
            <div className="bg-gradient-to-r from-[#1a5276] to-[#2980b9] px-6 py-4 flex items-center gap-3">
              <Globe className="w-6 h-6 text-white" />
              <div>
                <h2 className="text-lg font-bold text-white">Nejpopulárnější trasy</h2>
                <p className="text-sm text-white/80">Nejhledanější letenky tento týden</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50">
              <KiwiPopularRoutesWidget />
            </div>
          </div>

          {/* Aviasales Interactive Map Widget */}
          <div className="mb-10">
            <FlightMapWidget
              origin="PRG"
              locale="cs"
              currency="CZK"
              height={580}
              subId="letenky-page"
            />
          </div>

          {/* Aviasales CTA */}
          <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] rounded-2xl p-6 text-white mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Chcete porovnat více možností?</h3>
                <p className="opacity-90">Aviasales porovná stovky aerolinek najednou a najde nejnižší cenu</p>
              </div>
              <a
                href="https://www.aviasales.com/?marker=155221"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 bg-white text-[#FF6B35] font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Hledat na Aviasales
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-lg font-bold text-[#1a5276] mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Tipy pro nejlevnější letenky
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { tip: "Rezervujte 6-8 týdnů předem", detail: "Ideální čas pro nejlepší ceny na evropské lety" },
                { tip: "Leťte v úterý nebo středu", detail: "Nejlevnější dny v týdnu pro odlet" },
                { tip: "Buďte flexibilní s daty", detail: "Rozdíl 1-2 dny může ušetřit stovky korun" },
                { tip: "Sledujte cenové alerty", detail: "Nastavte si upozornění na pokles cen" },
              ].map((item) => (
                <div key={item.tip} className="flex gap-3">
                  <div className="w-6 h-6 bg-[#1a5276] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{item.tip}</div>
                    <div className="text-sm text-gray-600">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a5276] text-white py-8">
        <div className="container text-center">
          <p className="opacity-75">
            © 2024 Akční Letenky. Všechna práva vyhrazena.
          </p>
          <p className="text-sm opacity-50 mt-2">
            Letenky jsou poskytovány partnery Kiwi.com a Aviasales
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/" className="text-sm opacity-75 hover:opacity-100">Domů</Link>
            <Link href="/dovolena" className="text-sm opacity-75 hover:opacity-100">Dovolená</Link>
            <Link href="/blog" className="text-sm opacity-75 hover:opacity-100">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
