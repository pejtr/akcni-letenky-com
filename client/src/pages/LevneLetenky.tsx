import { Link } from "wouter";
import { ArrowRight, Plane, Search, ShieldCheck, Star, TrendingDown, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";
import SocialProofNotification from "@/components/SocialProofNotification";
import CountdownTimer from "@/components/CountdownTimer";
import PelikanPrimaryDeals from "@/components/PelikanPrimaryDeals";
import { aviasalesAffiliateUrl, pelikanDeepLink } from "@shared/affiliateLinks";

const popularDestinations = [
  { name: "Londyn", code: "LON", price: "od 1 299 Kc" },
  { name: "Pariz", code: "PAR", price: "od 1 499 Kc" },
  { name: "Rim", code: "ROM", price: "od 1 199 Kc" },
  { name: "Barcelona", code: "BCN", price: "od 1 399 Kc" },
  { name: "Amsterdam", code: "AMS", price: "od 1 599 Kc" },
  { name: "Dubaj", code: "DXB", price: "od 5 999 Kc" },
  { name: "New York", code: "NYC", price: "od 9 999 Kc" },
  { name: "Bangkok", code: "BKK", price: "od 8 499 Kc" },
];

const trustItems = [
  { icon: Plane, label: "Pelikán nabídky", sub: "Primární prodejní partner" },
  { icon: ShieldCheck, label: "Affiliate měření", sub: "a_aid=levne-letenky" },
  { icon: TrendingDown, label: "Akční ceny", sub: "Feedy a kurátorované tipy" },
  { icon: Star, label: "Top destinace", sub: "Maledivy, Evropa, exotika" },
];

export default function LevneLetenky() {
  const buildPelikanLink = (content = "all") =>
    pelikanDeepLink("/cs/akcni-letenky", {
      campaign: "letenky-page",
      channel: "primary",
      content,
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <Navigation />
      <SocialProofNotification />

      <section className="bg-gradient-to-r from-[#1a5276] to-[#2980b9] text-white py-16 pt-28">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>Primarne Pelikan.cz - overene akcni nabidky</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Levne letenky</h1>
          <p className="text-xl opacity-90 mb-2">Rychly proklik na aktualni akcni letenky s affiliate merenim.</p>
          <p className="text-lg opacity-75 max-w-2xl mx-auto">
            Hlavni CTA vedou na Pelikan.cz s parametrem a_aid=levne-letenky. TravelPayouts sluzby zustavaji jen jako doplnek.
          </p>
          <div className="mt-4 flex justify-center">
            <CountdownTimer className="bg-white/20 px-4 py-2 rounded-full" />
          </div>
        </div>
      </section>

      <section className="py-8 bg-white">
        <div className="container">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100 mb-8">
            <div className="bg-gradient-to-r from-[#003087] to-[#1a5276] px-6 py-4 flex items-center gap-3">
              <div className="bg-white rounded-full p-2">
                <Plane className="w-5 h-5 text-[#003087]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Akcni letenky na Pelikan.cz</h2>
                <p className="text-sm text-white/80">Jeden jasny prodejni klik bez cizich iframe widgetu</p>
              </div>
              <span className="ml-auto bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                Top CTA
              </span>
            </div>
            <div className="p-5 bg-gray-50">
              <a
                href={buildPelikanLink("main-search")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E91E63] px-6 py-4 text-center font-bold text-white transition-colors hover:bg-[#C2185B]"
              >
                Zobrazit vsechny akcni letenky
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {trustItems.map((item) => (
              <div key={item.label} className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                <item.icon className="w-6 h-6 mx-auto mb-2 text-[#E91E63]" />
                <div className="font-semibold text-gray-800 text-sm">{item.label}</div>
                <div className="text-xs text-gray-500">{item.sub}</div>
              </div>
            ))}
          </div>

          <PelikanPrimaryDeals />

          <div className="my-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-[#1a5276]" />
              Popularni destinace
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {popularDestinations.map((dest) => (
                <a
                  key={dest.code}
                  href={buildPelikanLink(dest.code)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#E91E63] transition-all group"
                >
                  <div className="font-semibold text-gray-800 group-hover:text-[#E91E63] transition-colors">
                    {dest.name}
                  </div>
                  <div className="text-sm text-green-600 font-medium">{dest.price}</div>
                </a>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] rounded-2xl p-6 text-white mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Doplnkove porovnani cen</h3>
                <p className="opacity-90">Aviasales je sekundarni volba, hlavni prodejni flow zustava Pelikan.</p>
              </div>
              <a
                href={aviasalesAffiliateUrl("https://www.aviasales.com/", "letenky-page")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 bg-white text-[#FF6B35] font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Porovnat na Aviasales
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#1a5276] text-white py-8">
        <div className="container text-center">
          <p className="opacity-75">© 2026 Akcni Letenky. Vsechna prava vyhrazena.</p>
          <p className="text-sm opacity-50 mt-2">Primarni nabidky jsou poskytovany pres Pelikan.cz</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/" className="text-sm opacity-75 hover:opacity-100">Domu</Link>
            <Link href="/dovolene" className="text-sm opacity-75 hover:opacity-100">Dovolena</Link>
            <Link href="/blog" className="text-sm opacity-75 hover:opacity-100">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
