import React from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

interface PricePredictionWidgetProps {
  destination?: string;
  currentPrice?: number;
  averagePrice?: number;
}

export default function PricePredictionWidget({
  destination = "Dubaj",
  currentPrice = 4990,
  averagePrice = 8500,
}: PricePredictionWidgetProps) {
  const savings = averagePrice - currentPrice;
  const savingsPercent = Math.round((savings / averagePrice) * 100);

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-xl border border-emerald-400/30 my-6">
      <div className="flex items-center justify-between border-b border-emerald-700/50 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500 text-gray-950 font-black px-2.5 py-0.5 text-[10px]">
            <Sparkles className="w-3 h-3 mr-1 fill-gray-950" /> AI PŘEDPOVĚĎ CENY
          </Badge>
          <span className="text-[10px] text-emerald-200">Aktualizováno před 5 minutami</span>
        </div>
        <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2.5 py-0.5 rounded-full font-bold">
          🟢 Doporučení: KOUPOVAT HNED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-3">
        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
          <span className="text-[10px] text-emerald-200 block uppercase font-bold">Aktuální nejnižší cena</span>
          <span className="text-xl font-black text-amber-300">{currentPrice.toLocaleString("cs-CZ")} Kč</span>
        </div>
        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
          <span className="text-[10px] text-emerald-200 block uppercase font-bold">Běžná průměrná cena</span>
          <span className="text-xl font-bold text-gray-300 line-through">{averagePrice.toLocaleString("cs-CZ")} Kč</span>
        </div>
        <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-xl p-3 text-emerald-300">
          <span className="text-[10px] block uppercase font-extrabold">Úspora oproti průměru</span>
          <span className="text-xl font-black text-emerald-300">+{savings.toLocaleString("cs-CZ")} Kč ({savingsPercent}%)</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-emerald-100 mt-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Na základě analýzy 12 000+ historických letů očekáváme v příštích 7 dnech nárůst ceny o 15-25 %.</span>
      </div>
    </div>
  );
}
