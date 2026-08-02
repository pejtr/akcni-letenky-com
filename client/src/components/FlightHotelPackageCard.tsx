import React from "react";
import { Button } from "@/components/ui/button";
import { Hotel, Plane, ArrowRight, Sparkles } from "lucide-react";

interface FlightHotelPackageCardProps {
  destination: string;
  flightPrice: number;
  hotelEstimate7Days?: number;
  affiliateFlightUrl: string;
}

export default function FlightHotelPackageCard({
  destination,
  flightPrice,
  hotelEstimate7Days = 6200,
  affiliateFlightUrl,
}: FlightHotelPackageCardProps) {
  const totalPrice = flightPrice + hotelEstimate7Days;
  const bookingUrl = `https://www.akcni-letenky.com/dovolene?destination=${encodeURIComponent(destination)}`;

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-xl border border-blue-400/30 my-4">
      <div className="flex items-center justify-between border-b border-blue-700/50 pb-3 mb-3">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>💡 CHYTRÝ BALÍČEK: LETENKA + 7 DNÍ HOTEL</span>
        </div>
        <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-bold">
          Ušetříte až 35%
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
        <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
          <span className="text-blue-200 block text-[10px]">✈️ Akční letenka</span>
          <span className="font-bold text-sm text-white">{flightPrice.toLocaleString("cs-CZ")} Kč</span>
        </div>
        <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
          <span className="text-blue-200 block text-[10px]">🏨 4★ Hotel (7 nocí + snídaně)</span>
          <span className="font-bold text-sm text-white">{hotelEstimate7Days.toLocaleString("cs-CZ")} Kč</span>
        </div>
        <div className="bg-amber-500/20 border border-amber-400/40 rounded-xl p-2.5 text-amber-300">
          <span className="block text-[10px] font-bold uppercase">Celkem balíček / osoba</span>
          <span className="font-extrabold text-base text-amber-300">{totalPrice.toLocaleString("cs-CZ")} Kč</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <a href={affiliateFlightUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="outline" className="w-full text-white border-blue-300/40 hover:bg-white/10 text-xs font-semibold h-10">
            <Plane className="w-4 h-4 mr-1.5" /> Pouze letenka ({flightPrice.toLocaleString("cs-CZ")} Kč)
          </Button>
        </a>
        <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs h-10 shadow-lg">
            <Hotel className="w-4 h-4 mr-1.5" /> Zobrazit zájezdy & hotely v {destination} <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </a>
      </div>
    </div>
  );
}
