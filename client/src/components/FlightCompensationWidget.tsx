import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ExternalLink, Euro, CheckCircle2 } from "lucide-react";

export default function FlightCompensationWidget() {
  const airHelpUrl = "https://www.airhelp.com/cs/?utm_source=akcni-letenky&utm_medium=affiliate";

  return (
    <div className="bg-gradient-to-r from-orange-900 via-red-900 to-slate-900 text-white rounded-2xl p-5 shadow-xl border border-orange-400/30 my-6">
      <div className="flex flex-col md:flex-row items-center gap-5 justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-orange-500 text-gray-950 font-bold px-2.5 py-0.5 text-[10px]">
              <AlertCircle className="w-3 h-3 mr-1" /> ZNÁTE SVŮJ NÁROK?
            </Badge>
            <span className="text-[10px] text-orange-200">Proplácíme až 3 roky zpětně</span>
          </div>
          <h3 className="text-lg md:text-xl font-extrabold text-white leading-tight">
            🛫 Měli jste zpožděný nebo zrušený let?
          </h3>
          <p className="text-xs text-orange-100 mt-1 mb-3 leading-relaxed">
            Máte nárok na <span className="text-amber-300 font-extrabold">odškodnění až 15 000 Kč (600 €)</span> dle EU nařízení EC 261/2004. Bezplatná kontrola – platíte jen při úspěchu!
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-orange-100">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Vyřízení bez rizika (no win, no fee)</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Kontrola za 2 minuty zdarma</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Zpoždění 3h+ i zrušení letu</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Proplácíme i lety ze 3 let nazpět</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="text-center">
            <div className="text-3xl font-black text-amber-300">600 €</div>
            <div className="text-[10px] text-orange-200 font-semibold">maximální náhrada / osoba</div>
          </div>
          <a href={airHelpUrl} target="_blank" rel="noopener noreferrer">
            <Button className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold text-sm px-5 h-11 shadow-lg w-full">
              Zkontrolovat nárok ZDARMA <ExternalLink className="w-4 h-4 ml-1.5" />
            </Button>
          </a>
          <span className="text-[10px] text-orange-300 text-center">Proplácí Ryanair, Wizz Air, Czech Airlines, Emirates a další</span>
        </div>
      </div>
    </div>
  );
}
