import React from "react";
import { pelikanDeepLink } from "@shared/affiliateLinks";
import { trpc } from "@/lib/trpc";

export interface FlightOfferProps {
  id?: string;
  origin?: string;
  destination: string;
  airline?: string;
  description?: string;
  badgeText?: string;
  discountPercent?: number;
  originalPrice: number;
  salePrice: number;
  remainingSeats?: number;
  imageUrl: string;
  pelikanPath?: string;
  sourcePage?: string;
  isReturnFlight?: boolean;
}

export default function SingleFlightOfferCard({
  id = "fl-single",
  origin = "Praha",
  destination,
  airline = "Emirates",
  description,
  badgeText = "Last-minute nabídka",
  discountPercent,
  originalPrice,
  salePrice,
  remainingSeats = 5,
  imageUrl,
  pelikanPath,
  sourcePage = "single-offer-card",
  isReturnFlight = true,
}: FlightOfferProps) {
  const trackClick = trpc.affiliate.trackClick.useMutation();

  const savings = Math.max(0, originalPrice - salePrice);
  const calculatedDiscount = discountPercent || Math.round((savings / originalPrice) * 100);

  const targetPath = pelikanPath || `/cs/akcni-letenky/praha/${destination.toLowerCase().replace(/\s+/g, "-")}`;
  const affiliateUrl = pelikanDeepLink(targetPath, {
    campaign: "single-flight-card",
    channel: sourcePage,
    content: id,
  });

  const handleCardClick = () => {
    trackClick.mutate({
      destination,
      destinationSlug: destination.toLowerCase(),
      source: sourcePage,
      affiliatePartner: "pelikan",
      affiliateUrl,
    });
  };

  const defaultDesc = `${destination} vás okouzlí svou jedinečnou atmosférou! Užijte si nezapomenutelný zážitek a rezervujte akční letenky s garancí nejnižší ceny.`;

  return (
    <div className="bg-[#FFFDF5] border-2 border-amber-300 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 max-w-md mx-auto my-6">
      {/* Top Image Container */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={imageUrl}
          alt={`${origin} - ${destination}`}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";
          }}
        />

        {/* Top-Left Badge */}
        {badgeText && (
          <div className="absolute top-3 left-3 bg-[#FF5722] text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-white/30">
            <span>⏰</span>
            <span>{badgeText}</span>
          </div>
        )}

        {/* Top-Right Circle Discount Badge */}
        {calculatedDiscount > 0 && (
          <div className="absolute top-3 right-3 bg-[#FFC107] text-[#003087] w-14 h-14 rounded-full flex flex-col items-center justify-center font-black shadow-lg border-2 border-white leading-tight">
            <span className="text-sm">-{calculatedDiscount}%</span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-5 text-center">
        {/* Route Title */}
        <h3 className="text-2xl font-black text-[#002266] mb-1 flex items-center justify-center gap-2">
          <span>{origin}</span>
          <span className="text-[#FF5722] text-xl">{isReturnFlight ? "↔" : "➔"}</span>
          <span>{destination}</span>
        </h3>

        {/* Airline Info */}
        <p className="text-xs text-gray-600 mb-3">
          s leteckou společností <span className="font-semibold text-gray-800">{airline}</span>
        </p>

        {/* Description Text */}
        <p className="text-xs text-gray-700 leading-relaxed mb-4 px-2 font-medium">
          {description || defaultDesc}
        </p>

        {/* Feature Checkmark Bullet */}
        <div className="inline-flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 text-cyan-950 text-xs font-bold px-3 py-1.5 rounded-xl mb-5">
          <span>•</span>
          <span className="text-emerald-600">✅</span>
          <span>Zpáteční letenka včetně poplatků</span>
        </div>

        {/* Action & Price Box Container */}
        <div className="border-2 border-amber-400 bg-amber-50/50 rounded-2xl p-4 shadow-sm">
          {/* Action Price Pill */}
          <div className="inline-block bg-yellow-100 border border-yellow-300 text-pink-700 text-xs font-black px-4 py-1 rounded-full mb-3 uppercase tracking-wide">
            ⚠️ AKČNÍ CENA
          </div>

          {/* Old Price Strike-through */}
          {originalPrice && (
            <div className="mb-2">
              <span className="inline-block bg-yellow-400 text-red-700 line-through font-black text-lg px-4 py-0.5 rounded-lg shadow-inner">
                {originalPrice.toLocaleString("cs-CZ")} Kč
              </span>
            </div>
          )}

          {/* Primary CTA Button */}
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCardClick}
            className="block w-full bg-[#D81B60] hover:bg-[#c2185b] active:scale-[0.98] text-white font-black text-lg py-3 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 mb-2"
          >
            Koupit za {salePrice.toLocaleString("cs-CZ")} Kč
          </a>

          {/* Remaining Seats Urgency */}
          {remainingSeats > 0 && (
            <div className="bg-cyan-100/80 text-cyan-900 text-xs font-bold py-1.5 rounded-xl mb-2">
              Za tuto cenu zbývá <span className="text-blue-900 font-extrabold">{remainingSeats} míst</span>
            </div>
          )}

          {/* Savings Callout */}
          {savings > 0 && (
            <p className="text-xs font-black text-emerald-600">
              Ušetříte až {savings.toLocaleString("cs-CZ")} Kč
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
