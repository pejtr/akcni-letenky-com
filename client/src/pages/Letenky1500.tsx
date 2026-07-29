import { Link } from "wouter";
import { Plane, MapPin, TrendingDown, Clock, Star, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";

const PELIKAN_LINK = "https://www.pelikan.cz/cs/akcni-letenky/LP:0_1500,S:PRI?a_aid=levne-letenky&utm_source=akcni-letenky&utm_medium=landing-page&utm_campaign=1500kc";

const topDestinations = [
  { city: "Londýn", country: "Velká Británie", price: "733", image: "/destinations/london.jpg" },
  { city: "Řím", country: "Itálie", price: "712", image: "/destinations/rome.jpg" },
  { city: "Barcelona", country: "Španělsko", price: "946", image: "/destinations/barcelona.jpg" },
  { city: "Paříž", country: "Francie", price: "1 027", image: "/destinations/paris.jpg" },
  { city: "Amsterdam", country: "Nizozemsko", price: "1 190", image: "/destinations/amsterdam.jpg" },
  { city: "Berlín", country: "Německo", price: "890", image: "/destinations/berlin.jpg" },
];

const benefits = [
  { icon: TrendingDown, title: "Nejnižší ceny", desc: "Garantujeme nejlepší ceny na trhu" },
  { icon: Clock, title: "Rychlá rezervace", desc: "Zarezervujte za 2 minuty" },
  { icon: Star, title: "Ověřené nabídky", desc: "Všechny lety jsou dostupné" },
];

export default function Letenky1500() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Letenky do 1 500 Kč | Nejlevnější lety po Evropě | Akční Letenky"
        description="Objevte nejlevnější letenky do 1 500 Kč zpáteční. Londýn od 733 Kč, Řím od 712 Kč, Barcelona od 946 Kč. Rezervujte ještě dnes!"
        canonicalUrl="https://www.akcni-letenky.com/letendy-do-1500-kc"
      />
      {/* Header */}
      <header className="bg-gradient-to-r from-[#FFD700] to-[#FFC107] shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-akcni-letenky.png" alt="Akční Letenky" className="h-9 md:h-10" />
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-xs text-[#003087] hover:text-[#001f5c] font-semibold">
              Domů
            </Link>
            <Link href="/levne-letenky" className="text-xs text-[#003087] hover:text-[#001f5c] font-semibold">
              Levné letenky
            </Link>
            <Link href="/blog" className="text-xs text-[#003087] hover:text-[#001f5c] font-semibold">
              Blog
            </Link>
          </nav>
          <a
            href={PELIKAN_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#E91E63] hover:bg-[#C2185B] text-white px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Plane className="w-3.5 h-3.5" />
            ZOBRAZIT LETY
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#003087] to-[#001f5c] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block bg-[#FFD700] text-[#003087] text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Exkluzivní nabídka
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Letenky do 1 500 Kč zpáteční
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Objevte nejlevnější lety po Evropě. Londýn, Řím, Barcelona a další top destinace za neuvěřitelné ceny.
          </p>
          <a
            href={PELIKAN_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#E91E63] hover:bg-[#C2185B] text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            ZOBRAZIT VŠECHNY LETY
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="bg-white py-8 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E91E63]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-[#E91E63]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Destinations */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Nejlevnější destinace do 1 500 Kč
          </h2>
          <p className="text-gray-600 text-center mb-10">
            Vyberte si z našich TOP nabídek a letěte ještě dnes
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {topDestinations.map((dest, i) => (
              <Card key={i} className="overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.city}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-[#E91E63] text-white px-3 py-1 rounded-full text-sm font-bold">
                    od {dest.price} Kč
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[#003087]" />
                    <h3 className="text-lg font-bold text-gray-900">{dest.city}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{dest.country}</p>
                  <a
                    href={PELIKAN_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-[#003087] hover:bg-[#001f5c] text-white text-center py-2.5 rounded-lg font-semibold transition-colors"
                  >
                    Zobrazit termíny →
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <a
              href={PELIKAN_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#E91E63] hover:bg-[#C2185B] text-white px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg"
            >
              <Plane className="w-5 h-5" />
              ZOBRAZIT VŠECHNY LETY DO 1 500 KČ
            </a>
          </div>
        </div>
      </section>

      {/* Why Book Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Proč rezervovat u nás?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">✅ Garantované nejnižší ceny</h3>
              <p className="text-gray-700 leading-relaxed">
                Porovnáváme ceny ze stovek leteckých společností a agentur, abychom vám přinesli ty
                nejlepší nabídky. Žádné skryté poplatky.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">⚡ Rychlá a snadná rezervace</h3>
              <p className="text-gray-700 leading-relaxed">
                Zarezervujte si letenku za pár kliknutí. Bezpečná platba a okamžité potvrzení
                rezervace e-mailem.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">🌍 Tisíce destinací</h3>
              <p className="text-gray-700 leading-relaxed">
                Nabízíme lety do více než 1 000 destinací po celém světě. Od evropských metropolí
                po exotické destinace.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">📞 Zákaznická podpora 24/7</h3>
              <p className="text-gray-700 leading-relaxed">
                Náš tým je tu pro vás kdykoliv potřebujete. Pomůžeme vám s rezervací i po ní.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-[#E91E63] to-[#C2185B] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Nečekejte — letenky rychle mizí!
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Tyto ceny jsou dostupné pouze omezenou dobu. Zarezervujte si svůj let ještě dnes.
          </p>
          <a
            href={PELIKAN_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#E91E63] hover:bg-gray-100 px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg"
          >
            <Plane className="w-5 h-5" />
            ZOBRAZIT VŠECHNY LETY
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 AKČNÍ-LETENKY.com | Všechna práva vyhrazena
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Ceny jsou orientační a mohou se měnit. Zobrazené ceny zahrnují zpáteční letenku včetně
            všech poplatků a daní.
          </p>
        </div>
      </footer>
    </div>
  );
}
