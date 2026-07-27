import { Link } from "wouter";
import { Plane, Sun, Heart, ShieldCheck, ExternalLink, Mail, Star, Building2 } from "lucide-react";
import { pelikanDeepLink } from "@shared/affiliateLinks";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200 pt-14 pb-8 border-t border-slate-800">
      <div className="container">

        {/* 3-Column Pelikán Affiliate Category Links (per user spec) */}
        <div className="bg-slate-800/60 rounded-2xl p-6 md:p-8 mb-12 border border-slate-700/60">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Column 1: Akční nabídky */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span>🌴</span> Akční nabídky
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <a href="https://www.pelikan.cz/cs/akcni-letenky/S:PRI?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Letenky do 1 500 Kč
                  </a>
                </li>
                <li>
                  <a href="https://www.pelikan.cz/cs/pobyty/kategorie/121?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Dovolená se slevou až 80 %
                  </a>
                </li>
                <li>
                  <a href="https://www.pelikan.cz/cs/pobyty/kategorie/104?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Eurovíkendy
                  </a>
                </li>
                <li>
                  <a href="https://cestovani.pelikan.cz/premium-cestovani?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Business class
                  </a>
                </li>
                <li>
                  <a href="https://www.pelikan.cz/cs/pobyty/kategorie/101/vsechny?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors flex items-center gap-1">
                    <span>🚀</span> <span>TOP akce</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.pelikan.cz/cs/pobyty/s-pelikanem?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Mauricius
                  </a>
                </li>
                <li>
                  <a href="https://www.pelikan.cz/cs/pobyt/nabidka-tydne?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Krátké výlety
                  </a>
                </li>
                <li>
                  <a href="https://cestovani.pelikan.cz/dovolena/maledivy?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Maledivy
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Dovolené */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span>⭐</span> Dovolené
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <a href="https://cestovani.pelikan.cz/premium-formular?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors flex items-center gap-1">
                    <span>⭐</span> <span>Premium dovolená</span>
                  </a>
                </li>
                <li>
                  <a href="https://cestovani.pelikan.cz/dovolena/dubaj-emiraty?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Dovolená v Dubaji
                  </a>
                </li>
                <li>
                  <a href="https://www.pelikan.cz/cs/pobyty/kategorie/150?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Poznávací zájezdy
                  </a>
                </li>
                <li>
                  <a href="https://cestovani.pelikan.cz/dovolena/spanelsko?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Kanárské ostrovy
                  </a>
                </li>
                <li>
                  <a href="https://cestovani.pelikan.cz/dovolena/last-minute?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Last minute
                  </a>
                </li>
                <li>
                  <a href="https://www.pelikan.cz/cs/pobyty/kategorie/101/vsechny?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Nejlepší dovolené
                  </a>
                </li>
                <li>
                  <a href="https://www.pelikan.cz/cs/pobyty/kategorie/121?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Wellness
                  </a>
                </li>
                <li>
                  <a href="https://www.pelikan.cz/cs/pobyty/kategorie/177?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Exotická dovolená
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Hotely & Místa */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span>🏛️</span> Hotely & Místa
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <a href="https://cestovani.pelikan.cz/dovolena/italie?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Pobyty v Římě
                  </a>
                </li>
                <li>
                  <a href="https://www.pelikan.cz/cs/pobyty/s-pelikanem?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Hotely v Česku
                  </a>
                </li>
                <li>
                  <a href="https://cestovani.pelikan.cz/dovolena/italie?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Pobyt v Benátkách
                  </a>
                </li>
                <li>
                  <a href="https://www.pelikan.cz/cs/akcni-letenky/S:SEL?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Dovolená v USA
                  </a>
                </li>
                <li>
                  <a href="https://cestovani.pelikan.cz/dovolena/na-slovensku?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Hotely na Slovensku
                  </a>
                </li>
                <li>
                  <a href="https://www.pelikan.cz/cs/pobyty/kategorie/137?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Ostrov Madeira
                  </a>
                </li>
                <li>
                  <a href="https://cestovani.pelikan.cz/dovolena/chorvatsko?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    S vlastní dopravou
                  </a>
                </li>
                <li>
                  <a href="https://cestovani.pelikan.cz/dovolena/malta?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:underline transition-colors">
                    Ostrov Malta
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand & Contact */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#FFD700] rounded-xl flex items-center justify-center font-bold text-xl text-[#003087] shadow-md">
                ✈️
              </div>
              <span className="font-black text-2xl tracking-tight text-white">
                AKČNÍ-LETENKY<span className="text-[#E91E63]">.com</span>
              </span>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed">
              Váš nejrychlejší vyhledávač akčních letenek a zájezdů. Denně prohledáváme stamiliony letenek od stovek aerolinek a cestovních kanceláří.
            </p>

            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Primární affiliate partner: <strong>Pelikán.cz</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>info@akcni-letenky.com</span>
              </div>
            </div>
          </div>

          {/* Column 2: Top Destinace (Internal Links) */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <Plane className="w-4 h-4 text-[#E91E63]" /> Top Destinace
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/londyn" className="hover:text-white hover:underline transition-colors">
                  Letenky do Londýna od 733 Kč
                </Link>
              </li>
              <li>
                <Link href="/barcelona" className="hover:text-white hover:underline transition-colors">
                  Letenky do Barcelony od 746 Kč
                </Link>
              </li>
              <li>
                <Link href="/pariz" className="hover:text-white hover:underline transition-colors">
                  Letenky do Paříže od 1 027 Kč
                </Link>
              </li>
              <li>
                <Link href="/rim" className="hover:text-white hover:underline transition-colors">
                  Letenky do Říma od 712 Kč
                </Link>
              </li>
              <li>
                <Link href="/new-york" className="hover:text-white hover:underline transition-colors">
                  Letenky do New Yorku od 7 490 Kč
                </Link>
              </li>
              <li>
                <Link href="/dubaj" className="hover:text-white hover:underline transition-colors">
                  Letenky do Dubaje od 5 183 Kč
                </Link>
              </li>
              <li>
                <Link href="/recko" className="hover:text-white hover:underline transition-colors">
                  Dovolená a letenky v Řecku
                </Link>
              </li>
              <li>
                <Link href="/malta" className="hover:text-white hover:underline transition-colors">
                  Letenky na Maltu od 1 290 Kč
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Služby a nabídka */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" /> Služby a nabídka
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/levne-letenky" className="hover:text-white hover:underline transition-colors">
                  Last Minute akční letenky
                </Link>
              </li>
              <li>
                <Link href="/dovolene" className="hover:text-white hover:underline transition-colors">
                  Dovolené se slevou až 80 %
                </Link>
              </li>
              <li>
                <Link href="/vlaky-autobusy" className="hover:text-white hover:underline transition-colors">
                  Vlakové a autobusové spoje
                </Link>
              </li>
              <li>
                <Link href="/tipy-pro-cestovatele" className="hover:text-white hover:underline transition-colors">
                  Tipy pro cestovatele & průvodci
                </Link>
              </li>
              <li>
                <Link href="/aerolinky" className="hover:text-white hover:underline transition-colors">
                  Přehled leteckých společností
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-white hover:underline transition-colors">
                  Uložené oblíbené nabídky
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Partner Pelikán.cz */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">Partner Rezervací</h3>
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Všechny vyhledané letenky a zájezdy rezervujete přímo u prověřeného partnera <strong>Pelikán.cz</strong> s plnou garancí odbavení.
              </p>
              <a
                href={pelikanDeepLink("/cs/akcni-letenky", {
                  campaign: "global-footer",
                  channel: "footer-box",
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full bg-[#E91E63] hover:bg-[#c2185b] text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-colors"
              >
                <span>Hledat na Pelikán.cz</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p>© {new Date().getFullYear()} AKČNÍ-LETENKY.com. Všechna práva vyhrazena.</p>
          <div className="flex items-center gap-6">
            <Link href="/tipy-pro-cestovatele" className="hover:text-slate-300 transition-colors">
              Průvodci a články
            </Link>
            <span>•</span>
            <Link href="/wishlist" className="hover:text-slate-300 transition-colors">
              Hlídač cen
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
