import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const POPUP_DELAY_MS = 30000; // 30 seconds
const STORAGE_KEY = "revolut_popup_dismissed";

export function RevolutPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if popup was already dismissed in this session
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      return;
    }

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
    // Track conversion
    if (window.fbq) {
      window.fbq("track", "Lead", {
        content_name: "Revolut Referral Click",
        content_category: "Affiliate",
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
        <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
            aria-label="Zavřít"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* Banner image - clickable */}
          <button
            onClick={handleClick}
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
              onClick={handleClick}
              className="w-full bg-white text-blue-600 font-bold py-4 px-6 rounded-lg hover:bg-blue-50 transition-colors text-lg shadow-lg"
            >
              Získat 500 Kč bonus →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
