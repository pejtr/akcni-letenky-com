/**
 * Personalized Homepage Section
 * 
 * Shows personalized destination recommendations based on browsing history.
 * Uses both localStorage (client-side) and server-side tracking for recommendations.
 * Integrates A/B test for share button placement (card vs detail).
 */

import { useState, useEffect, useMemo } from "react";
import { Sparkles, TrendingDown, ArrowRight, Bell, Eye } from "lucide-react";
import { kiwiTilesLink } from "@shared/affiliateLinks";
import { trpc } from "@/lib/trpc";
import PriceAlertModal from "./PriceAlertModal";
import SocialSharePanel from "./SocialSharePanel";
import { useSharePlacementABTest } from "@/hooks/useSharePlacementABTest";

function getSessionId(): string {
  const key = "akcni-letenky-session";
  let sessionId = localStorage.getItem(key);
  if (!sessionId) {
    sessionId = "s_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
}

// Destination images mapping
const destinationImages: Record<string, string> = {
  "london-united-kingdom": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop",
  "paris-france": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop",
  "rome-italy": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop",
  "barcelona-spain": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop",
  "amsterdam-netherlands": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=300&fit=crop",
  "berlin-germany": "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=400&h=300&fit=crop",
  "vienna-austria": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=400&h=300&fit=crop",
  "dubai-united-arab-emirates": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop",
  "bangkok-thailand": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&h=300&fit=crop",
  "lisbon-portugal": "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=400&h=300&fit=crop",
  "istanbul-turkey": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=300&fit=crop",
  "athens-greece": "https://images.unsplash.com/photo-1555993539-1732b0258235?w=400&h=300&fit=crop",
  "venice-italy": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&h=300&fit=crop",
  "madrid-spain": "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=400&h=300&fit=crop",
  "budapest-hungary": "https://images.unsplash.com/photo-1551867633-194f125bddfa?w=400&h=300&fit=crop",
  "santorini-greece": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop",
};

export default function PersonalizedSection() {
  const [sessionId] = useState(getSessionId);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    destination: string;
    slug: string;
    price: number;
  }>({ isOpen: false, destination: "", slug: "", price: 0 });

  // A/B test for share button placement
  const { showOnCard, trackShareClick, trackShareOpen } = useSharePlacementABTest();

  const queryInput = useMemo(() => ({ sessionId, limit: 6 }), [sessionId]);
  const { data: recommendations } = trpc.personalization.getRecommendations.useQuery(queryInput);

  // Check if user has any browsing history (from localStorage)
  const [hasHistory, setHasHistory] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("viewed_destinations");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHasHistory(Array.isArray(parsed) && parsed.length > 0);
      } catch {
        setHasHistory(false);
      }
    }
  }, []);

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <>
      <section className="py-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="container">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-[#E91E63] to-[#FF5722] rounded-full p-2">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#003087]">
                  {hasHistory ? "Doporučeno pro vás" : "Populární destinace"}
                </h2>
                <p className="text-sm text-gray-500">
                  {hasHistory
                    ? "Na základě vašeho prohlížení"
                    : "Nejoblíbenější destinace našich zákazníků"}
                </p>
              </div>
            </div>
          </div>

          {/* Recommendation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec) => {
              const image = destinationImages[rec.destinationSlug] ||
                `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop`;
              
              // Simulate discount
              const originalPrice = Math.round(rec.estimatedPrice * 1.25);
              const discountPercent = Math.round(((originalPrice - rec.estimatedPrice) / originalPrice) * 100);

              return (
                <div
                  key={rec.destinationSlug}
                  className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={image}
                      alt={rec.destination}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    {/* Discount badge */}
                    <div className="absolute top-3 left-3 bg-[#E91E63] text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{discountPercent}%
                    </div>
                    {/* Reason badge */}
                    {hasHistory && (
                      <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        <Eye className="w-3 h-3 inline mr-1" />
                        {rec.reason}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-[#003087]">
                        {rec.destination}
                      </h3>
                      {/* A/B Test: Show share button on card only for variant A */}
                      {showOnCard && (
                        <div onClick={() => { trackShareOpen(); trackShareClick("card_inline"); }}>
                          <SocialSharePanel
                            destination={rec.destination}
                            destinationSlug={rec.destinationSlug}
                            price={rec.estimatedPrice}
                            compact
                          />
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-gray-400 line-through">
                        {originalPrice.toLocaleString("cs-CZ")} Kč
                      </span>
                      <span className="text-xl font-bold text-[#E91E63]">
                        {rec.estimatedPrice.toLocaleString("cs-CZ")} Kč
                      </span>
                      <span className="text-xs text-gray-400">zpát.</span>
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                        <TrendingDown className="w-3 h-3 inline" /> Sleva
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <a
                        href={kiwiTilesLink("letiste-vaclava-havla-praha-praha-cesko", rec.destinationSlug, "personalized")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-[#003087] hover:bg-[#002060] text-white text-sm font-medium py-2 px-3 rounded-lg text-center transition-colors flex items-center justify-center gap-1"
                      >
                        Zobrazit lety →
                      </a>
                      <button
                        onClick={() =>
                          setAlertModal({
                            isOpen: true,
                            destination: rec.destination,
                            slug: rec.destinationSlug,
                            price: rec.estimatedPrice,
                          })
                        }
                        className="bg-orange-100 hover:bg-orange-200 text-orange-600 p-2 rounded-lg transition-colors"
                        title="Hlídat cenu"
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Price Alert Modal */}
      <PriceAlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        destination={alertModal.destination}
        destinationSlug={alertModal.slug}
        currentPrice={alertModal.price}
      />
    </>
  );
}
