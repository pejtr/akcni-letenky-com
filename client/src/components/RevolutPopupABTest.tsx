import { useEffect, useState } from "react";
import { X, CreditCard, TrendingDown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const POPUP_DELAY_MS = 30000; // 30 seconds
const STORAGE_KEY = "revolut_popup_dismissed";
const VARIANT_KEY = "revolut_popup_variant";

type PopupVariant = "banner" | "text" | "minimal";

interface VariantConfig {
  name: PopupVariant;
  weight: number; // For weighted random selection
}

const VARIANTS: VariantConfig[] = [
  { name: "banner", weight: 1 }, // Variant A: Current banner
  { name: "text", weight: 1 },   // Variant B: Text-focused
  { name: "minimal", weight: 1 }, // Variant C: Minimal
];

/**
 * Get or assign variant using weighted random selection
 */
function getVariant(): PopupVariant {
  // Check if variant was already assigned
  const stored = sessionStorage.getItem(VARIANT_KEY);
  if (stored && ["banner", "text", "minimal"].includes(stored)) {
    return stored as PopupVariant;
  }

  // Weighted random selection
  const totalWeight = VARIANTS.reduce((sum, v) => sum + v.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const variant of VARIANTS) {
    random -= variant.weight;
    if (random <= 0) {
      sessionStorage.setItem(VARIANT_KEY, variant.name);
      return variant.name;
    }
  }

  return "banner"; // Fallback
}

export function RevolutPopupABTest() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [variant, setVariant] = useState<PopupVariant>("banner");

  useEffect(() => {
    // Check if popup was already dismissed in this session
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      return;
    }

    // Assign variant
    const assignedVariant = getVariant();
    setVariant(assignedVariant);

    // Show popup after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, POPUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem(STORAGE_KEY, "true");
    }, 300); // Animation duration
  };

  const handleClick = () => {
    // Track conversion with variant info
    if (window.fbq) {
      window.fbq("track", "Lead", {
        content_name: "Revolut Referral Click",
        content_category: "Affiliate",
        variant: variant,
      });
    }
    
    // Open in new tab
    window.open("https://www.revolut-bonus.cz", "_blank");
    handleClose();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 z-[9998] transition-opacity duration-300",
          isClosing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleClose}
      />

      {/* Popup */}
      <div
        className={cn(
          "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]",
          "w-[90vw] max-w-2xl transition-all duration-300",
          isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
        )}
      >
        {variant === "banner" && <BannerVariant onClose={handleClose} onClick={handleClick} />}
        {variant === "text" && <TextVariant onClose={handleClose} onClick={handleClick} />}
        {variant === "minimal" && <MinimalVariant onClose={handleClose} onClick={handleClick} />}
      </div>
    </>
  );
}

/**
 * Variant A: Banner image (current design)
 */
function BannerVariant({ onClose, onClick }: { onClose: () => void; onClick: () => void }) {
  return (
    <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
        aria-label="Zavřít"
      >
        <X className="w-5 h-5 text-gray-700" />
      </button>

      {/* Banner image - clickable */}
      <button
        onClick={onClick}
        className="w-full block hover:opacity-95 transition-opacity"
      >
        <img
          src="/revolut-banner.png"
          alt="Revolut nabídka pro cestovatele - 500 Kč bonus za registraci"
          className="w-full h-auto"
        />
      </button>

      {/* CTA button */}
      <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600">
        <button
          onClick={onClick}
          className="w-full bg-white text-blue-600 font-bold py-4 px-6 rounded-lg hover:bg-blue-50 transition-colors text-lg shadow-lg"
        >
          Získat kartu pro cestovatele + 500 Kč bonus →
        </button>
      </div>
    </div>
  );
}

/**
 * Variant B: Text-focused with bullet points
 */
function TextVariant({ onClose, onClick }: { onClose: () => void; onClick: () => void }) {
  return (
    <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden p-8">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 bg-white hover:bg-gray-100 rounded-full p-2 shadow-lg transition-all hover:scale-110"
        aria-label="Zavřít"
      >
        <X className="w-5 h-5 text-gray-700" />
      </button>

      {/* Content */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <CreditCard className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Revolut karta pro cestovatele
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Ušetřete tisíce korun na zahraničních platbách a směnách měn
        </p>
      </div>

      {/* Benefits */}
      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">500 Kč bonus za registraci</p>
            <p className="text-sm text-gray-600">Peníze obdržíte po první transakci</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Žádné poplatky za platby v zahraničí</p>
            <p className="text-sm text-gray-600">Plaťte kdekoli na světě bez skrytých poplatků</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Bezplatné směny do 1000 EUR měsíčně</p>
            <p className="text-sm text-gray-600">Mezibankový kurz bez poplatků</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Cestovní pojištění zdarma</p>
            <p className="text-sm text-gray-600">V rámci prémiových tarifů</p>
          </div>
        </div>
      </div>

      {/* CTA button */}
      <button
        onClick={onClick}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-lg shadow-lg"
      >
        Získat kartu pro cestovatele + 500 Kč bonus →
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Platí pro nové zákazníky. Podmínky na www.revolut-bonus.cz
      </p>
    </div>
  );
}

/**
 * Variant C: Minimal design
 */
function MinimalVariant({ onClose, onClick }: { onClose: () => void; onClick: () => void }) {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-2xl overflow-hidden p-12 text-white">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 bg-white/20 hover:bg-white/30 rounded-full p-2 shadow-lg transition-all hover:scale-110"
        aria-label="Zavřít"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Content */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-6">
          <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="48" fill="white" opacity="0.2"/>
            <text x="50" y="65" fontSize="48" fill="white" textAnchor="middle" fontWeight="bold">R</text>
          </svg>
        </div>

        <h2 className="text-4xl font-bold mb-4">
          Revolut karta pro cestovatele
        </h2>

        <p className="text-2xl font-semibold mb-2">
          500 Kč bonus + žádné poplatky v zahraničí
        </p>

        <p className="text-lg opacity-90 mb-8">
          Ušetřete tisíce na každé cestě
        </p>

        {/* CTA button */}
        <button
          onClick={onClick}
          className="bg-white text-blue-600 font-bold py-4 px-8 rounded-lg hover:bg-blue-50 transition-all text-lg shadow-xl hover:shadow-2xl hover:scale-105"
        >
          Získat kartu pro cestovatele →
        </button>
      </div>
    </div>
  );
}

export default RevolutPopupABTest;
