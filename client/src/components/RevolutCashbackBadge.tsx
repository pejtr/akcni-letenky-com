import React from "react";
import { Gift, ExternalLink } from "lucide-react";

export default function RevolutCashbackBadge() {
  const revolutUrl = "https://revolut.ngls.net/c/akcniletenky";

  return (
    <a
      href={revolutUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block group my-3"
    >
      <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-purple-300 hover:border-purple-500 rounded-xl p-3 transition-all">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-600 text-white rounded-lg shrink-0 shadow-sm">
            <Gift className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-purple-900 block group-hover:text-purple-700 transition-colors">
              🎁 Získejte 500 Kč zpět na tuto letenku!
            </span>
            <span className="text-[11px] text-purple-700 block">
              Při platbě přes novou kartu Revolut (zřízení zdarma za 3 minuty bez poplatků).
            </span>
          </div>
          <ExternalLink className="w-4 h-4 text-purple-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </div>
      </div>
    </a>
  );
}
