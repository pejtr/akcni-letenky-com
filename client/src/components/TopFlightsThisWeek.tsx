import { trpc } from "@/lib/trpc";
import { Plane, TrendingUp } from "lucide-react";
import { Link } from "wouter";

function getInternalDestinationUrl(destName: string): string {
  if (!destName) return "/levne-letenky";
  const cleanName = destName.toLowerCase().replace(/^letenky\s+do\s+/i, "").trim();
  
  const map: Record<string, string> = {
    malta: "/malta",
    "řecko": "/recko",
    recko: "/recko",
    barcelona: "/barcelona",
    kypr: "/kypr",
    "londýn": "/londyn",
    london: "/londyn",
    "paříž": "/pariz",
    paris: "/pariz",
    "řím": "/rim",
    rome: "/rim",
    "new york": "/new-york",
    dubaj: "/dubaj",
    dubai: "/dubaj",
    bali: "/bali",
    afrika: "/dovolene",
    "levná exotika": "/dovolene",
    exotika: "/dovolene",
    istanbul: "/letenky-do-istanbul",
    amsterdam: "/amsterdam",
    "vídeň": "/viden",
    "berlín": "/berlin",
    egypt: "/letenky-do-egypt",
  };
  
  if (map[cleanName]) return map[cleanName];
  
  const slug = cleanName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
    
  return `/${slug}`;
}

export default function TopFlightsThisWeek() {
  const { data: flights, isLoading } = trpc.pelikan.getFlights.useQuery({
    limit: 6,
    sortBy: "price_asc",
  });
  const trackClickMutation = trpc.affiliate.trackClick.useMutation();

  const trackAffiliateClick = (flight: any) => {
    trackClickMutation.mutate({
      destination: flight.destination,
      destinationSlug: flight.id,
      source: "top-this-week",
      affiliatePartner: "pelikan",
      affiliateUrl: flight.link,
    });
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("cs-CZ").format(price);
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

  if (!flights || flights.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aktuální letenky z Pelikán feedu teď nejsou k dispozici.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {flights.map((flight, index) => {
        const isTopThree = index < 3;
        const departure = "departure" in flight ? flight.departure : undefined;
        const airline = "airline" in flight ? flight.airline : undefined;
        const internalUrl = getInternalDestinationUrl(flight.destination || flight.title);

        return (
          <Link
            key={flight.id}
            href={internalUrl}
            onClick={() => trackAffiliateClick(flight)}
            className="group relative rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#E91E63] overflow-hidden min-h-[280px] block cursor-pointer"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundImage: `url('${flight.imageUrl || "/hero-coastal.jpg"}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </div>

            <div className="relative z-10 p-6 h-full flex flex-col justify-end">
              {isTopThree && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-[#FF5722] to-[#E91E63] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  HOT
                </div>
              )}

              <div className="absolute top-3 left-3 w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center font-black text-lg text-[#003087] shadow-md">
                #{index + 1}
              </div>

              <div className="mt-12">
                <div className="flex items-center gap-2 mb-3">
                  <Plane className="w-5 h-5 text-white group-hover:rotate-45 transition-transform duration-300" />
                  <h3 className="text-xl font-bold text-white group-hover:text-[#FFD700] transition-colors">
                    {flight.destination || flight.title}
                  </h3>
                </div>

                {flight.salePrice && (
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#FFD700]">
                        {formatPrice(flight.salePrice)} Kč
                      </span>
                      <span className="text-xs text-gray-300 ml-1">zpáteční</span>
                      {flight.price && flight.price > flight.salePrice && (
                        <span className="text-sm text-gray-300 line-through">
                          {formatPrice(flight.price)} Kč
                        </span>
                      )}
                    </div>
                    {flight.discount > 0 && (
                      <span className="inline-block mt-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                        -{flight.discount}% sleva
                      </span>
                    )}
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-200">
                    <Plane className="w-4 h-4 text-blue-400" />
                    <span>{departure || "Praha"} → {flight.destination}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">Aktuálně z Pelikán feedu</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-400">
                  <span className="text-sm font-semibold text-white">{airline || "Pelikán.cz"}</span>
                  <span className="text-xs text-gray-300 group-hover:text-[#FFD700] transition-colors">
                    Zobrazit lety →
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-[#E91E63]/5 to-[#FF5722]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </Link>
        );
      })}
    </div>
  );
}
