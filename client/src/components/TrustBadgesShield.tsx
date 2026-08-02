import React from "react";
import { ShieldCheck, Lock, Star, Zap } from "lucide-react";

export default function TrustBadgesShield() {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-3.5 my-4 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="flex items-center justify-center gap-2 p-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold text-gray-800">Garance nejnižší ceny v ČR</span>
        </div>
        <div className="flex items-center justify-center gap-2 p-1.5">
          <Lock className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-xs font-bold text-gray-800">Oficiální partneři Pelikán & Kiwi</span>
        </div>
        <div className="flex items-center justify-center gap-2 p-1.5">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
          <span className="text-xs font-bold text-gray-800">Hodnocení aerolinek 4.8/5</span>
        </div>
        <div className="flex items-center justify-center gap-2 p-1.5">
          <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-xs font-bold text-gray-800">Bez skrytých poplatků</span>
        </div>
      </div>
    </div>
  );
}
