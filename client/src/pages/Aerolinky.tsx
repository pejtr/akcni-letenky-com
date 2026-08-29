import SEO from "@/components/SEO";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import { Plane, Star, MapPin, TrendingUp } from "lucide-react";

export default function Aerolinky() {
  const airlines = [
    {
      name: "Ryanair",
      logo: "🛫",
      description: "Největší nízkonákladová letecká společnost v Evropě",
      destinations: "200+ destinací",
      rating: "4.2",
      slug: "ryanair"
    },
    {
      name: "Wizz Air",
      logo: "✈️",
      description: "Maďarská nízkonákladová letecká společnost",
      destinations: "150+ destinací",
      rating: "4.1",
      slug: "wizz-air"
    },
    {
      name: "Czech Airlines",
      logo: "🇨🇿",
      description: "Národní letecký dopravce České republiky",
      destinations: "50+ destinací",
      rating: "4.3",
      slug: "czech-airlines"
    },
    {
      name: "Lufthansa",
      logo: "🦅",
      description: "Německá prémiová letecká společnost",
      destinations: "300+ destinací",
      rating: "4.5",
      slug: "lufthansa"
    },
    {
      name: "Emirates",
      logo: "🌟",
      description: "Dubajská prémiová letecká společnost",
      destinations: "150+ destinací",
      rating: "4.7",
      slug: "emirates"
    },
    {
      name: "Turkish Airlines",
      logo: "🇹🇷",
      description: "Turecká letecká společnost s globálním pokrytím",
      destinations: "300+ destinací",
      rating: "4.4",
      slug: "turkish-airlines"
    },
    {
      name: "Austrian Airlines",
      logo: "🇦🇹",
      description: "Rakouská letecká společnost",
      destinations: "130+ destinací",
      rating: "4.3",
      slug: "austrian-airlines"
    },
    {
      name: "Air France",
      logo: "🇫🇷",
      description: "Francouzská prémiová letecká společnost",
      destinations: "200+ destinací",
      rating: "4.4",
      slug: "air-france"
    },
    {
      name: "KLM",
      logo: "🇳🇱",
      description: "Nizozemská letecká společnost",
      destinations: "170+ destinací",
      rating: "4.5",
      slug: "klm"
    },
    {
      name: "British Airways",
      logo: "🇬🇧",
      description: "Britská prémiová letecká společnost",
      destinations: "180+ destinací",
      rating: "4.3",
      slug: "british-airways"
    },
    {
      name: "Qatar Airways",
      logo: "🏆",
      description: "Katarská prémiová letecká společnost",
      destinations: "160+ destinací",
      rating: "4.8",
      slug: "qatar-airways"
    },
    {
      name: "LOT Polish Airlines",
      logo: "🇵🇱",
      description: "Polská letecká společnost",
      destinations: "120+ destinací",
      rating: "4.2",
      slug: "lot-polish-airlines"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <SEO
        title="Letecké společnosti"
        description="Porovnejte ceny a služby všech hlavních aerolinek. Přehled leteckých společností létajících z České republiky."
        canonical="https://www.akcni-letenky.com/aerolinky"
      />
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#003087] to-[#0047AB] text-white py-12 pt-24">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            ✈️ Letecké společnosti
          </h1>
          <p className="text-xl opacity-90 mb-2">
            Porovnejte ceny a služby všech hlavních aerolinek
          </p>
          <p className="text-lg opacity-75">
            Najděte tu nejlepší leteckou společnost pro vaši cestu
          </p>
        </div>
      </section>

      {/* Airlines Grid */}
      <section className="py-12">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {airlines.map((airline, index) => (
              <Link key={index} href={`/letecka-spolecnost/${airline.slug}`} className="block bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 group">
                  {/* Logo & Name */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      {airline.logo}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#E91E63] transition-colors">
                        {airline.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{airline.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4">
                    {airline.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{airline.destinations}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#E91E63]">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-semibold">Zobrazit lety →</span>
                    </div>
                  </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 bg-blue-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Plane className="w-12 h-12 text-[#003087] mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Jak vybrat správnou leteckou společnost?
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="font-bold text-gray-900 mb-2">Cena</h3>
                <p className="text-sm text-gray-600">
                  Porovnejte ceny základního tarifu i s příplatky za zavazadla
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl mb-3">⭐</div>
                <h3 className="font-bold text-gray-900 mb-2">Služby</h3>
                <p className="text-sm text-gray-600">
                  Zkontrolujte, co je zahrnuto v ceně (jídlo, zavazadla, výběr sedadla)
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl mb-3">🕐</div>
                <h3 className="font-bold text-gray-900 mb-2">Časy letů</h3>
                <p className="text-sm text-gray-600">
                  Vyberte si časy, které vám vyhovují, a zkontrolujte přestupy
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="container">
          <div className="bg-gradient-to-r from-[#FFD700] to-[#FFC107] rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-[#003087] mb-4">
              Hledáte nejlevnější letenky?
            </h2>
            <p className="text-lg text-[#003087] mb-6">
              Porovnáme ceny všech aerolinek a najdeme tu nejlepší nabídku pro vás
            </p>
            <Link href="/levne-letenky" className="inline-block bg-[#E91E63] hover:bg-[#C2185B] text-white font-bold px-8 py-4 rounded-full text-lg shadow-lg transition-all hover:scale-105">
              Vyhledat letenky →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
