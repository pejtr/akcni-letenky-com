import { trpc } from "@/lib/trpc";
import { Plane, TrendingUp, Users } from "lucide-react";

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
            className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 border-2 border-transparent hover:border-[#E91E63] overflow-hidden"
          >
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
                <Plane className="w-5 h-5 text-[#E91E63] group-hover:rotate-45 transition-transform duration-300" />
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#E91E63] transition-colors">
                  {dest.destination}
                </h3>
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-4">
                {/* Click Count */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>
                    <strong className="text-blue-600">{formatClicks(dest.clicks)}</strong> lidí si prohlédlo
                  </span>
                </div>

                {/* Trending Indicator */}
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">Populární tento týden</span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-sm font-semibold text-[#003087]">Praha → {dest.destination}</span>
                <span className="text-xs text-gray-500 group-hover:text-[#E91E63] transition-colors">
                  Zobrazit lety →
                </span>
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
