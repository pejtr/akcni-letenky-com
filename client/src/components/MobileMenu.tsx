/**
 * Mobile Menu Component
 * 
 * Responsive hamburger menu for mobile navigation
 * Includes slide-in animation and all navigation items
 */

import { useState } from "react";
import { Link } from "wouter";
import { Menu, X, Plane, MapPin, Palmtree, Building2, Zap, Phone, Train } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCtaAbTest } from "@/hooks/useCtaAbTest";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { ctaVariant: reservationCta, trackClick: trackReservationClick } = useCtaAbTest("reservation_button");

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Prevent body scroll when menu is open
    if (!isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
    document.body.style.overflow = "unset";
  };

  const menuItems: { href: string; label: string; icon: React.ReactNode; external?: boolean }[] = [
    {
      href: "/",
      label: "Nejlevnější Lety",
      icon: <Plane className="w-5 h-5" />,
    },
    {
      href: "/levne-letenky",
      label: "Levné Letenky",
      icon: <Zap className="w-5 h-5" />,
    },
    {
      href: "/dovolena",
      label: "Dovolená",
      icon: <Palmtree className="w-5 h-5" />,
    },
    {
      href: "/aerolinky",
      label: "Aerolinky",
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      href: "/vlaky-autobusy",
      label: "Vlaky & Autobusy",
      icon: <Train className="w-5 h-5" />,
    },
    {
      href: "https://www.kiwi.com/deep?affilid=akcniletenkyakcniletenky&currency=CZK&lang=cs",
      label: reservationCta.text,
      icon: <Plane className="w-5 h-5" />,
      external: true,
    },
  ];

  return (
    <>
      {/* Hamburger Button - Only visible on mobile */}
      <button
        onClick={toggleMenu}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Slide-in Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Plane className="w-6 h-6 text-[#FFD700]" />
            <span className="font-bold text-lg">Menu</span>
          </div>
          <button
            onClick={closeMenu}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-6">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { trackReservationClick(); closeMenu(); }}
                    className="flex items-center gap-3 p-4 rounded-lg bg-[#E91E63] hover:bg-[#C2185B] transition-colors group"
                  >
                    <span className="text-white group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span className="font-bold text-white">
                      {item.label}
                    </span>
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <span className="text-[#E91E63] group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span className="font-medium text-gray-700 group-hover:text-[#E91E63]">
                      {item.label}
                    </span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-gray-50">
          <a
            href="tel:+420223340510"
            className="flex items-center justify-center gap-2 w-full bg-[#E91E63] hover:bg-[#C2185B] text-white font-bold py-4 rounded-lg transition-colors"
          >
            <Phone className="w-5 h-5" />
            223 340 510
          </a>
          <p className="text-xs text-gray-600 text-center mt-3">
            Potřebujete pomoc? Zavolejte nám!
          </p>
        </div>
      </div>
    </>
  );
}
