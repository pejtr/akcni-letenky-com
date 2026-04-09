import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Heart, ChevronDown } from "lucide-react";
export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const wishlistCount = 0; // TODO: Implement wishlist count

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
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-gradient-to-r from-[#FFD700] to-[#FFC107] shadow-md",
        isScrolled ? "py-1.5" : "py-2"
      )}
    >
      <div className="container flex items-center justify-between gap-2">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-2xl">✈️</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[#003087] font-black text-base md:text-lg tracking-tight">
                AKČNÍ-
              </span>
              <span className="text-[#003087] font-black text-base md:text-lg tracking-tight -mt-1">
                LETENKY.com
              </span>
            </div>
          </a>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          <Link href="/levne-letenky">
            <a className="flex items-center gap-1.5 text-[#003087] hover:text-[#E91E63] font-semibold text-sm transition-colors">
              <span>💸</span>
              <span>LETENKY</span>
            </a>
          </Link>
          <Link href="/dovolene">
            <a className="flex items-center gap-1.5 text-[#003087] hover:text-[#E91E63] font-semibold text-sm transition-colors">
              <span>⭐</span>
              <span>DOVOLENÁ</span>
            </a>
          </Link>
          {/* AEROLINKY Dropdown */}
          <div className="relative group">
            <Link href="/aerolinky">
              <a className="flex items-center gap-1.5 text-[#003087] hover:text-[#E91E63] font-semibold text-sm transition-colors">
                <span>✈️</span>
                <span>AEROLINKY</span>
                <ChevronDown className="w-3 h-3" />
              </a>
            </Link>
            
            {/* Dropdown Menu */}
            <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <Link href="/letecke-spolecnosti/austrian-airlines">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#F5F7FA] hover:text-[#E91E63] transition-colors">
                    Austrian Airlines
                  </a>
                </Link>
                <Link href="/letecke-spolecnosti/emirates">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#F5F7FA] hover:text-[#E91E63] transition-colors">
                    Emirates
                  </a>
                </Link>
                <Link href="/letecke-spolecnosti/qatar-airways">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#F5F7FA] hover:text-[#E91E63] transition-colors">
                    Qatar Airways
                  </a>
                </Link>
                <Link href="/letecke-spolecnosti/ryanair">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#F5F7FA] hover:text-[#E91E63] transition-colors">
                    Ryanair
                  </a>
                </Link>
                <Link href="/letecke-spolecnosti/air-france">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#F5F7FA] hover:text-[#E91E63] transition-colors">
                    Air France
                  </a>
                </Link>
                <Link href="/letecke-spolecnosti/lufthansa">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#F5F7FA] hover:text-[#E91E63] transition-colors">
                    Lufthansa
                  </a>
                </Link>
                <Link href="/letecke-spolecnosti/icelandair">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#F5F7FA] hover:text-[#E91E63] transition-colors">
                    Icelandair
                  </a>
                </Link>
                <Link href="/letecke-spolecnosti/turkish-airlines">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#F5F7FA] hover:text-[#E91E63] transition-colors">
                    Turkish Airlines
                  </a>
                </Link>
                <Link href="/letecke-spolecnosti/klm">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#F5F7FA] hover:text-[#E91E63] transition-colors">
                    KLM
                  </a>
                </Link>
                <Link href="/letecke-spolecnosti/british-airways">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#F5F7FA] hover:text-[#E91E63] transition-colors">
                    British Airways
                  </a>
                </Link>
                <Link href="/letecke-spolecnosti/wizz-air">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#F5F7FA] hover:text-[#E91E63] transition-colors">
                    Wizz Air
                  </a>
                </Link>
                <Link href="/letecke-spolecnosti/lot">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#F5F7FA] hover:text-[#E91E63] transition-colors">
                    LOT Polish Airlines
                  </a>
                </Link>
              </div>
            </div>
          </div>
          <Link href="/vlaky-autobusy">
            <a className="flex items-center gap-1.5 text-[#003087] hover:text-[#E91E63] font-semibold text-sm transition-colors">
              <span>🚆</span>
              <span>VLAKY</span>
            </a>
          </Link>
          <Link href="/tipy-pro-cestovatele">
            <a className="flex items-center gap-1.5 text-[#003087] hover:text-[#E91E63] font-semibold text-sm transition-colors">
              <span>💡</span>
              <span>TIPY</span>
            </a>
          </Link>
        </nav>

        {/* Right Side - Wishlist & CTA */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Wishlist Icon */}
          <Link href="/wishlist">
            <a className="relative p-2 hover:bg-white/20 rounded-lg transition-colors" aria-label="Seznam přání">
              <Heart className="w-5 h-5 text-[#E91E63]" fill="currentColor" />
              {wishlistCount && wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E91E63] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </a>
          </Link>

          {/* CTA Button - Hidden on small screens */}
          <a
            href="https://www.pelikan.cz/cs/akcni-letenky?a_aid=levne-letenky&utm_source=akcni-letenky&utm_medium=header&utm_campaign=cta"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block bg-[#E91E63] hover:bg-[#C2185B] text-white font-bold px-4 py-2 rounded-full text-sm shadow-lg transition-all hover:scale-105"
          >
            ZAREZERVOVAT TEĎ
          </a>

          {/* Phone Number - Desktop only */}
          <a
            href="tel:+420223340510"
            className="hidden lg:flex items-center gap-1.5 text-[#E91E63] hover:text-[#C2185B] font-bold text-sm transition-colors"
          >
            <span>📞</span>
            <span>223 340 510</span>
          </a>
        </div>
      </div>
    </header>
  );
}
