import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  name: string;
  city: string;
  destination: string;
  price: string;
  imageUrl: string;
}

const sampleNotifications: Notification[] = [
  {
    id: 1,
    name: "Jana",
    city: "Praha",
    destination: "Barcelona",
    price: "12 090 Kč",
    imageUrl: "/hero-bg.jpg",
  },
  {
    id: 2,
    name: "Petr",
    city: "Brno",
    destination: "Istanbul",
    price: "16 990 Kč",
    imageUrl: "/hero-bg.jpg",
  },
  {
    id: 3,
    name: "Marie",
    city: "Ostrava",
    destination: "Egypt",
    price: "13 364 Kč",
    imageUrl: "/hero-bg.jpg",
  },
  {
    id: 4,
    name: "Tomáš",
    city: "Plzeň",
    destination: "Malaga",
    price: "8 990 Kč",
    imageUrl: "/hero-bg.jpg",
  },
];

export default function SocialProofWidget() {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showNotification = () => {
      const randomNotification =
        sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
      setCurrentNotification(randomNotification);
      setIsVisible(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    // Show first notification after 3 seconds
    const initialTimeout = setTimeout(showNotification, 3000);

    // Show notifications every 15 seconds
    const interval = setInterval(showNotification, 15000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!currentNotification || !isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-6 z-40 bg-card border border-border rounded-xl shadow-2xl max-w-sm animate-in slide-in-from-left-5 fade-in duration-500",
        !isVisible && "animate-out slide-out-to-left-5 fade-out"
      )}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Circular thumbnail */}
        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary animate-pulse">
          <img
            src={currentNotification.imageUrl}
            alt={currentNotification.destination}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {currentNotification.name} z {currentNotification.city}
          </p>
          <p className="text-xs text-muted-foreground">
            právě zakoupil letenku do{" "}
            <span className="font-semibold text-primary">
              {currentNotification.destination}
            </span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            za {currentNotification.price}
          </p>
        </div>

        {/* CTA Button */}
        <button
          className="flex-shrink-0 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold hover:bg-primary/90 transition-colors whitespace-nowrap"
          onClick={() => {
            // TODO: Navigate to offer
            console.log("Navigate to offer");
          }}
        >
          TAM CHCI &gt;
        </button>

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
