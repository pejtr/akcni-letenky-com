import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Heart, Plane, ChevronDown } from "lucide-react";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const wishlistCount = 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      role="banner"
      className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100 py-2"
    >
      <div className="container flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 hover:opacity-90 transition-opacity flex-shrink-0">
          <img
            src="/logo-akcni-letenky.png"
            alt="Akční Letenky"
            className="h-9 md:h-10 w-auto"
          />
        </Link>

        {/* Navigation Links - Čedok style */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1">
          <Link href="/last-minute" className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-[#1565C0] hover:bg-blue-50 font-medium px-3 py-2 rounded-md transition-colors whitespace-nowrap">
            <Plane className="w-4 h-4 text-orange-500" /> Last Minute
          </Link>
          <Link href="/letenky" className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-[#1565C0] hover:bg-blue-50 font-medium px-3 py-2 rounded-md transition-colors whitespace-nowrap">
            ✈️ Letenky
          </Link>
          <Link href="/dovolene" className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-[#1565C0] hover:bg-blue-50 font-medium px-3 py-2 rounded-md transition-colors whitespace-nowrap">
            ☀️ Dovolená
          </Link>
          <Link href="/hlidac-cen" className="flex items-center gap-1.5 text-sm text-[#1565C0] hover:bg-blue-50 font-bold px-3 py-2 rounded-md transition-colors whitespace-nowrap">
            🔔 Hlídač cen
          </Link>
          <Link href="/odskodneni-za-let" className="flex items-center gap-1.5 text-sm text-orange-700 hover:bg-orange-50 font-bold px-3 py-2 rounded-md transition-colors whitespace-nowrap">
            ✈️ Odškodnění 600 €
          </Link>
          <a
            href="https://www.pelikan.cz/cs/pobyty/kategorie/104?a_aid=levne-letenky"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-[#1565C0] hover:bg-blue-50 font-medium px-3 py-2 rounded-md transition-colors whitespace-nowrap"
          >
            🏛️ Eurovíkendy
          </a>

          {/* Aerolinky dropdown */}
          <div className="relative group">
            <a className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-[#1565C0] hover:bg-blue-50 font-medium px-3 py-2 rounded-md transition-colors whitespace-nowrap cursor-pointer">
              🏢 Aerolinky <ChevronDown className="w-3 h-3" />
            </a>
            <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-100 py-2">
              {["austrian-airlines", "emirates", "qatar-airways", "ryanair", "air-france", "lufthansa", "turkish-airlines", "klm", "british-airways", "wizz-air", "lot"].map((slug) => (
                <Link key={slug} href={`/letecka-spolecnost/${slug}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1565C0] transition-colors capitalize">
                  {slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/vlaky-autobusy" className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-[#1565C0] hover:bg-blue-50 font-medium px-3 py-2 rounded-md transition-colors whitespace-nowrap">
            🚆 Vlaky
          </Link>
          <Link href="/tipy-pro-cestovatele" className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-[#1565C0] hover:bg-blue-50 font-medium px-3 py-2 rounded-md transition-colors whitespace-nowrap">
            💡 Tipy
          </Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Wishlist */}
          <Link href="/wishlist" className="relative p-2 text-gray-500 hover:text-[#E91E63] transition-colors" aria-label="Oblíbené">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* CTA Button - Čedok blue style */}
          <a
            href="https://www.pelikan.cz/cs/akcni-letenky?a_aid=levne-letenky&utm_source=akcni-letenky&utm_medium=header&utm_campaign=cta"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 bg-[#1565C0] hover:bg-[#0d47a1] text-white font-semibold px-4 py-2 rounded-full text-sm shadow-sm transition-colors whitespace-nowrap"
          >
            <Plane className="w-3.5 h-3.5" />
            ZAREZERVOVAT TEĎ
          </a>
        </div>
      </div>
    </header>
  );
}
