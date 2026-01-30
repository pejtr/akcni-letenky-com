import { trpc } from "@/lib/trpc";
import { Plane, TrendingUp, Users } from "lucide-react";

// Destination to image mapping
const destinationImages: Record<string, string> = {
  "london": "/london.jpg",
  "londýn": "/london.jpg",
  "paris": "/paris.jpg",
  "paříž": "/paris.jpg",
  "new york": "/newyork.jpg",
  "barcelona": "/barcelona.jpg",
  "rome": "/rome.jpg",
  "řím": "/rome.jpg",
  "dubai": "/dubai.jpg",
  "dubaj": "/dubai.jpg",
  "bangkok": "/bangkok.jpg",
  "tokyo": "/tokyo.jpg",
  "tokio": "/tokyo.jpg",
  "amsterdam": "/amsterdam.jpg",
  "berlin": "/berlin.jpg",
  "berlín": "/berlin.jpg",
  "vienna": "/vienna.jpg",
  "vídeň": "/vienna.jpg",
  "madrid": "/madrid.jpg",
  "lisbon": "/lisbon.jpg",
  "lisabon": "/lisbon.jpg",
};

// Get image for destination (fallback to generic travel image)
const getDestinationImage = (destination: string): string => {
  const key = destination.toLowerCase().trim();
  return destinationImages[key] || "/hero-coastal.jpg";
};

export default function TopFlightsThisWeek() {
  const { data: topDestinations, isLoading } = trpc.affiliate.getTopThisWeek.useQuery({ limit: 6 });
  const trackClickMutation = trpc.affiliate.trackClick.useMutation();

  // Helper function to track affiliate clicks
  const trackAffiliateClick = (dest: string, destSlug: string, url: string) => {
    trackClickMutation.mutate({
      destination: dest,
      destinationSlug: destSlug,
      source: "top-this-week",
      affiliatePartner: "kiwi",
      affiliateUrl: url,
    });
  };

  // Helper to format click count
  const formatClicks = (clicks: number): string => {
    if (clicks >= 1000) {
      return `${(clicks / 1000).toFixed(1)}k`;
    }
    return clicks.toString();
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!topDestinations || topDestinations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Zatím nejsou k dispozici žádná data o nejprodávanějších letech.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {topDestinations.map((dest, index) => {
        const kiwiUrl = `https://www.kiwi.com/cs/search/results/prague-czech-republic/${dest.destinationSlug}?a_aid=levne-letenky`;
        const isTopThree = index < 3;

        return (
          <a
            key={dest.destinationSlug}
            href={kiwiUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackAffiliateClick(dest.destination, dest.destinationSlug, kiwiUrl)}
            className="group relative rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#E91E63] overflow-hidden min-h-[280px]"
          >
            {/* Background Image with Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundImage: `url('${getDestinationImage(dest.destination || "")}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 p-6 h-full flex flex-col justify-end">
            {/* Hot Badge for Top 3 */}
            {isTopThree && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-[#FF5722] to-[#E91E63] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                🔥 HOT
              </div>
            )}

            {/* Rank Badge */}
            <div className="absolute top-3 left-3 w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center font-black text-lg text-[#003087] shadow-md">
              #{index + 1}
            </div>

              {/* Content */}
              <div className="mt-12">
                {/* Destination */}
                <div className="flex items-center gap-2 mb-3">
                  <Plane className="w-5 h-5 text-white group-hover:rotate-45 transition-transform duration-300" />
                  <h3 className="text-xl font-bold text-white group-hover:text-[#FFD700] transition-colors">
                    {dest.destination || "Neznámá destinace"}
                  </h3>
                </div>

                {/* Price Section */}
                {dest.price && (
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#FFD700]">{dest.price.toLocaleString()} Kč</span>
                      {dest.originalPrice && dest.originalPrice > dest.price && (
                        <span className="text-sm text-gray-300 line-through">{dest.originalPrice.toLocaleString()} Kč</span>
                      )}
                    </div>
                    {dest.discountPercent > 0 && (
                      <span className="inline-block mt-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                        -{dest.discountPercent}% sleva
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="space-y-2 mb-4">
                  {/* Click Count */}
                  <div className="flex items-center gap-2 text-sm text-gray-200">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>
                      <strong className="text-blue-400">{formatClicks(dest.clicks)}</strong> lidí si prohlédlo
                    </span>
                  </div>

                  {/* Trending Indicator */}
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">Populární tento týden</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-400">
                  <span className="text-sm font-semibold text-white">Praha → {dest.destination || "Destinace"}</span>
                  <span className="text-xs text-gray-300 group-hover:text-[#FFD700] transition-colors">
                    Zobrazit lety →
                  </span>
                </div>
              </div>
            </div>

            {/* Hover Effect Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#E91E63]/5 to-[#FF5722]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </a>
        );
      })}
    </div>
  );
}
