import React from "react";
import { ShieldCheck, ExternalLink, Plane, CheckCircle } from "lucide-react";

export default function TrustBadgesShield() {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-3.5 my-4 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="flex items-center justify-center gap-2 p-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold text-gray-800">Akční tipy z partnerského feedu</span>
        </div>
        <div className="flex items-center justify-center gap-2 p-1.5">
          <Plane className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-xs font-bold text-gray-800">Affiliate partner Pelikán.cz</span>
        </div>
        <div className="flex items-center justify-center gap-2 p-1.5">
          <ExternalLink className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-xs font-bold text-gray-800">Přímý přechod na prodejce</span>
        </div>
        <div className="flex items-center justify-center gap-2 p-1.5">
          <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-xs font-bold text-gray-800">Bez poplatku za vyhledávání</span>
        </div>
      </div>
    </div>
  );
}
