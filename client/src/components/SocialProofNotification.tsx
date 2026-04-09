/**
 * Unified Social Proof Notification Widget
 * 
 * Displays real-time notifications like "Petr z Prahy právě rezervoval/a letenku..."
 * to increase trust and urgency
 * 
 * Features:
 * - Circular destination thumbnail with pulse animation
 * - Price display for added credibility
 * - A/B testing for position (left/right) and frequency
 * - Database tracking for affiliate clicks
 * - CTA button "TAM CHCI TAKY >"
 */

import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { kiwiSearchLink } from "@shared/affiliateLinks";
import {
  getAssignedVariant,
  trackImpression,
  trackClick as trackABClick,
  getPositionClasses,
  getAnimationClasses,
  type SocialProofVariant,
} from "@/lib/socialProofABTest";

interface Notification {
  id: number;
  name: string;
  city: string;
  destination: string;
  destinationSlug: string;
  action: string;
  price: string;
  imageUrl: string;
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

// Only use destinations with existing images - using optimized thumbnails for fast loading
const DESTINATIONS = [
  { name: "Paříž", slug: "paris-france", image: "/thumbs/paris.jpg", priceRange: [1200, 1800] },
  { name: "Barcelona", slug: "barcelona-spain", image: "/thumbs/barcelona.jpg", priceRange: [1100, 1600] },
  { name: "Londýn", slug: "london-united-kingdom", image: "/thumbs/london.jpg", priceRange: [900, 1400] },
  { name: "Řím", slug: "rome-italy", image: "/thumbs/rome.jpg", priceRange: [1000, 1500] },
  { name: "Dubaj", slug: "dubai-united-arab-emirates", image: "/thumbs/dubai.jpg", priceRange: [8000, 12000] },
  { name: "Bali", slug: "bali-indonesia", image: "/thumbs/bali.jpg", priceRange: [12000, 18000] },
  { name: "New York", slug: "new-york-new-york-united-states", image: "/thumbs/newyork.jpg", priceRange: [9000, 15000] },
  { name: "Malta", slug: "malta", image: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/DJjaoQyTXcscHYgH.jpg", priceRange: [1500, 2500] },
  { name: "Chorvatsko", slug: "croatia", image: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/vDFnKepqgOENDyxi.jpg", priceRange: [800, 1500] },
  { name: "Kypr", slug: "cyprus", image: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/fahRfrtwCRRnemOO.jpg", priceRange: [2000, 3500] },
  { name: "Zanzibar", slug: "zanzibar-tanzania", image: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/SvAWJCDHRySUSggs.jpg", priceRange: [15000, 25000] },
];

const ACTIONS = [
  "právě rezervoval/a letenku do",
  "právě koupil/a letenku do",
];

export default function SocialProofNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nextId, setNextId] = useState(1);
  const trackClickMutation = trpc.affiliate.trackClick.useMutation();
  
  // Get A/B test variant (memoized to prevent re-assignment)
  const variant = useMemo<SocialProofVariant>(() => getAssignedVariant(), []);

  // Track click on notification
  const handleNotificationClick = (notification: Notification, kiwiUrl: string) => {
    // Track in database
    trackClickMutation.mutate({
      destination: notification.destination,
      destinationSlug: notification.destinationSlug,
      source: "social-proof",
      affiliatePartner: "kiwi",
      affiliateUrl: kiwiUrl,
    });
    // Track for A/B test
    trackABClick(variant.id);
  };

  // Generate random notification
  const generateNotification = (): Notification => {
    const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const destObj = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
    const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    
    // Generate random price within destination's range
    const [minPrice, maxPrice] = destObj.priceRange;
    const price = Math.floor(Math.random() * (maxPrice - minPrice) + minPrice);

    return {
      id: nextId,
      name,
      city,
      destination: destObj.name,
      destinationSlug: destObj.slug,
      action,
      price: `${price.toLocaleString('cs-CZ')} Kč`,
      imageUrl: destObj.image,
      timestamp: new Date(),
    };
  };

  // Show notification
  const showNotification = () => {
    const notification = generateNotification();
    setNotifications(prev => [...prev, notification]);
    setNextId(prev => prev + 1);
    
    // Track impression for A/B test
    trackImpression(variant.id);

    // Auto-remove after display duration from variant
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, variant.displayDuration);
  };

  // Start showing notifications based on variant timing
  useEffect(() => {
    // Show first notification after initial delay from variant
    const initialTimeout = setTimeout(() => {
      showNotification();
    }, variant.initialDelay);

    // Then show new notification at random interval from variant
    const interval = setInterval(() => {
      showNotification();
    }, variant.minInterval + Math.random() * (variant.maxInterval - variant.minInterval));

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [variant]); // eslint-disable-line react-hooks/exhaustive-deps

  // Manual close
  const handleClose = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) {
    return null;
  }

  const positionClasses = getPositionClasses(variant);
  const animationClasses = getAnimationClasses(variant);

  return (
    <div className={positionClasses}>
      {notifications.map((notification, index) => {
        const kiwiUrl = kiwiSearchLink("prague-czech-republic", notification.destinationSlug, "social-proof");
        
        return (
          <a
            key={notification.id}
            href={kiwiUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleNotificationClick(notification, kiwiUrl)}
            className={`block bg-white border-2 border-orange-500 rounded-xl shadow-2xl p-4 ${animationClasses} hover:border-orange-600 hover:shadow-3xl transition-all cursor-pointer max-w-sm`}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="flex items-start gap-3">
              {/* Circular Thumbnail with Pulse Animation */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500 animate-pulse">
                <img
                  src={notification.imageUrl}
                  alt={notification.destination}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {notification.name} z {notification.city}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {notification.action}{" "}
                  <span className="font-bold text-orange-600">{notification.destination}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  za {notification.price}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={(e) => handleClose(notification.id, e)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Zavřít"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CTA Button */}
            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
              <span className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors">
                TAM CHCI TAKY &gt;
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 animate-progress"
                style={{
                  animation: `progress ${variant.displayDuration}ms linear forwards`,
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
