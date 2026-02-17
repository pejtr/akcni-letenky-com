import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Notification {
  id: string;
  destination: string;
  price: number;
  nights: number;
  imageUrl: string;
  type: "flight" | "vacation";
}

// Simulated recent purchases for social proof
const NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    destination: "Dubaj",
    price: 4990,
    nights: 7,
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100&h=100&fit=crop",
    type: "vacation",
  },
  {
    id: "2",
    destination: "Bali",
    price: 8990,
    nights: 10,
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=100&h=100&fit=crop",
    type: "vacation",
  },
  {
    id: "3",
    destination: "Paříž",
    price: 1990,
    nights: 0,
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=100&h=100&fit=crop",
    type: "flight",
  },
  {
    id: "4",
    destination: "Barcelona",
    price: 2490,
    nights: 0,
    imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=100&h=100&fit=crop",
    type: "flight",
  },
  {
    id: "5",
    destination: "Řím",
    price: 2190,
    nights: 0,
    imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=100&h=100&fit=crop",
    type: "flight",
  },
  {
    id: "6",
    destination: "Kypr",
    price: 6990,
    nights: 7,
    imageUrl: "https://images.unsplash.com/photo-1580837119756-563d608dd119?w=100&h=100&fit=crop",
    type: "vacation",
  },
];

export function NotificationWidget() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const currentNotification = NOTIFICATIONS[currentIndex];

  // Show notification after 3 seconds, then rotate every 15 seconds
  useEffect(() => {
    if (isDismissed) return;

    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(showTimer);
  }, [isDismissed]);

  useEffect(() => {
    if (!isVisible || isDismissed) return;

    const rotateTimer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % NOTIFICATIONS.length);
    }, 15000); // Rotate every 15 seconds

    return () => clearInterval(rotateTimer);
  }, [isVisible, isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  const handleCTA = () => {
    // Navigate to the relevant page based on type
    if (currentNotification.type === "flight") {
      window.location.href = "/levne-letenky";
    } else {
      window.location.href = "/dovolene";
    }
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div
      className="fixed bottom-6 left-6 z-40 animate-slide-in-left"
      role="alert"
      aria-live="polite"
    >
      <div className="bg-white rounded-lg shadow-2xl border-2 border-primary/20 p-4 max-w-sm relative overflow-hidden">
        {/* Pulsating background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent animate-pulse-slow pointer-events-none" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Zavřít notifikaci"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4 relative z-10">
          {/* Circular thumbnail with pulsating ring */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
            <img
              src={currentNotification.imageUrl}
              alt={currentNotification.destination}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary relative z-10"
            />
          </div>

          {/* Notification content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-600 mb-1">
              🔥 Právě si někdo koupil
            </p>
            <p className="font-bold text-gray-900 mb-1">
              {currentNotification.type === "vacation"
                ? `Dovolenou na ${currentNotification.destination}`
                : `Letenku do ${currentNotification.destination}`}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold text-primary">
                {currentNotification.price.toLocaleString("cs-CZ")} Kč
              </span>
              {currentNotification.nights > 0 && (
                <span className="text-gray-500">
                  • {currentNotification.nights} nocí
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CTA button positioned to the right */}
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleCTA}
            className="bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2 rounded-lg text-sm transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            TAM CHCI TAKY &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
