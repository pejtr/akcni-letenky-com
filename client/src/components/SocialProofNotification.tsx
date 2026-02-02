/**
 * Social Proof Notification Widget
 * 
 * Displays real-time notifications like "Petr z Prahy právě rezervoval letenku..."
 * to increase trust and urgency
 */

import { useState, useEffect } from "react";
import { Plane, X } from "lucide-react";

interface Notification {
  id: number;
  name: string;
  city: string;
  destination: string;
  destinationSlug: string;
  action: string;
  timestamp: Date;
}

// Czech first names and cities for realistic notifications
const FIRST_NAMES = [
  "Petr", "Jan", "Pavel", "Martin", "Tomáš", "Jiří", "Lukáš", "David", "Jakub", "Michal",
  "Jana", "Eva", "Marie", "Petra", "Hana", "Lenka", "Kateřina", "Lucie", "Veronika", "Anna"
];

const CITIES = [
  "Prahy", "Brna", "Ostravy", "Plzně", "Liberce", "Olomouce", "Hradce Králové", 
  "Pardubic", "Zlína", "Karlových Varů", "Jihlavy", "Ústí nad Labem"
];

const DESTINATIONS = [
  { name: "Paříž", slug: "paris-france" },
  { name: "Barcelona", slug: "barcelona-spain" },
  { name: "Londýn", slug: "london-united-kingdom" },
  { name: "Řím", slug: "rome-italy" },
  { name: "Amsterdam", slug: "amsterdam-netherlands" },
  { name: "Madrid", slug: "madrid-spain" },
  { name: "Berlín", slug: "berlin-germany" },
  { name: "Vídeň", slug: "vienna-austria" },
  { name: "Budapešť", slug: "budapest-hungary" },
  { name: "Dublin", slug: "dublin-ireland" },
  { name: "Lisabon", slug: "lisbon-portugal" },
  { name: "Atény", slug: "athens-greece" },
  { name: "Istanbul", slug: "istanbul-turkey" },
  { name: "Dubaj", slug: "dubai-united-arab-emirates" },
  { name: "New York", slug: "new-york-new-york-united-states" }
];

const ACTIONS = [
  "právě rezervoval letenku do",
  "právě koupil letenku do",
  "si právě prohlíží letenky do",
  "právě našel skvělou nabídku do"
];

export default function SocialProofNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nextId, setNextId] = useState(1);

  // Generate random notification
  const generateNotification = (): Notification => {
    const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const destObj = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
    const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];

    return {
      id: nextId,
      name,
      city,
      destination: destObj.name,
      destinationSlug: destObj.slug,
      action,
      timestamp: new Date(),
    };
  };

  // Show notification
  const showNotification = () => {
    const notification = generateNotification();
    setNotifications(prev => [...prev, notification]);
    setNextId(prev => prev + 1);

    // Auto-remove after 8 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 8000);
  };

  // Start showing notifications
  useEffect(() => {
    // Show first notification after 5 seconds
    const initialTimeout = setTimeout(() => {
      showNotification();
    }, 5000);

    // Then show new notification every 15-25 seconds
    const interval = setInterval(() => {
      showNotification();
    }, 15000 + Math.random() * 10000); // Random between 15-25 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Manual close
  const handleClose = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-[60] space-y-3 max-w-sm">
      {notifications.map((notification, index) => {
        const kiwiUrl = `https://www.kiwi.com/cs/search/results/prague-czech-republic/${notification.destinationSlug}?a_aid=levne-letenky`;
        
        return (
        <a
          key={notification.id}
          href={kiwiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white border-2 border-orange-500 rounded-lg shadow-2xl p-4 animate-in slide-in-from-left duration-500 hover:border-orange-600 hover:shadow-3xl transition-all cursor-pointer"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 leading-relaxed">
                <span className="font-bold">{notification.name}</span>
                {" z "}
                <span className="font-semibold">{notification.city}</span>
                {" "}
                {notification.action}
                {" "}
                <span className="font-bold text-orange-600">{notification.destination}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Před {Math.floor((Date.now() - notification.timestamp.getTime()) / 1000)} sekundami
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => handleClose(notification.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Zavřít"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 animate-progress"
              style={{
                animation: "progress 8s linear forwards",
              }}
            />
          </div>
        </a>
        );
      })}

      <style>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
