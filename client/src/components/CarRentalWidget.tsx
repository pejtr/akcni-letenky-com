import React from "react";
import { Car, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CarRentalWidget({ destination = "Dubaj" }: { destination?: string }) {
  const rentalUrl = `https://www.rentalcars.com/SearchResults.do?dropCity=${encodeURIComponent(destination)}`;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-700 my-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl shrink-0 border border-blue-400/30">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
              🚗 Autopůjčovny na letišti v destinaci {destination}
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Srovnání všech světových autopůjčoven (Hertz, Avis, Europcar, Budget) s garancí nejnižší ceny od 450 Kč / den.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2 font-medium">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Bezplatné zrušení zdarma</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Neomezené kilometry</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Plné pojištění v ceně</span>
            </div>
          </div>
        </div>

        <a href={rentalUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 h-10 shadow">
            Vyhledat auta od 450 Kč/den <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </a>
      </div>
    </div>
  );
}
