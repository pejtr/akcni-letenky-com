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
    price: "946 Kč",
    imageUrl: "/destinations/barcelona.jpg",
  },
  {
    id: 2,
    name: "Petr",
    city: "Brno",
    destination: "Paříž",
    price: "1 027 Kč",
    imageUrl: "/destinations/paris.jpg",
  },
  {
    id: 3,
    name: "Marie",
    city: "Ostrava",
    destination: "Londýn",
    price: "733 Kč",
    imageUrl: "/destinations/london.jpg",
  },
  {
    id: 4,
    name: "Tomáš",
    city: "Plzeň",
    destination: "Řím",
    price: "712 Kč",
    imageUrl: "/destinations/rome.jpg",
  },
  {
    id: 5,
    name: "Lucie",
    city: "Liberec",
    destination: "Dubaj",
    price: "5 183 Kč",
    imageUrl: "/destinations/dubai.jpg",
  },
  {
    id: 6,
    name: "Martin",
    city: "Olomouc",
    destination: "Bali",
    price: "12 790 Kč",
    imageUrl: "/destinations/bali.jpg",
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

      // Hide after 8 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 8000);
    };

    // Show first notification after 5 seconds
    const initialTimeout = setTimeout(showNotification, 5000);

    // Show notifications every 25 seconds
    const interval = setInterval(showNotification, 25000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!currentNotification || !isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-16 md:bottom-6 left-4 md:left-6 z-60 bg-card border border-border rounded-xl shadow-2xl max-w-sm animate-in slide-in-from-left-5 fade-in duration-500",
        !isVisible && "animate-out slide-out-to-left-5 fade-out"
      )}
    >
      <div className="p-3">
        <div className="flex items-center gap-3 mb-2">
          {/* Circular thumbnail */}
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary animate-pulse">
            <img
              src={currentNotification.imageUrl}
              alt={currentNotification.destination}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">
              {currentNotification.name} z {currentNotification.city}
            </p>
            <p className="text-[11px] text-muted-foreground">
              právě zakoupil letenku do{" "}
              <span className="font-semibold text-primary">
                {currentNotification.destination}
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              za {currentNotification.price}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            title="Zavřít notifikaci"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CTA Button - Below content */}
        <button
          className="w-full bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-bold hover:bg-primary/90 transition-colors"
          onClick={() => {
            // TODO: Navigate to offer
            console.log("Navigate to offer");
          }}
        >
          TAM CHCI &gt;
        </button>
      </div>
    </div>
  );
}
