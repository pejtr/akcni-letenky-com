import React from "react";
import { ShieldCheck, ExternalLink, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TravelInsuranceWidget() {
  const insuranceUrl = "https://www.axa-assistance.cz/cestovni-pojisteni";

  return (
    <div className="bg-gradient-to-r from-rose-900/40 via-purple-900/40 to-slate-900/40 border border-purple-300/40 rounded-2xl p-4 my-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl shrink-0 border border-rose-400/30">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900">
              🛡️ Nezapomeňte na Cestovní Pojištění!
            </h4>
            <p className="text-[11px] text-gray-600 mt-0.5">
              Kompletní krytí léčebných výloh, storno letenky & úrazu od 29 Kč / den.
            </p>
          </div>
        </div>

        <a href={insuranceUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
          <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 shadow">
            Sjednat pojištění od 29 Kč <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </Button>
        </a>
      </div>
    </div>
  );
}
