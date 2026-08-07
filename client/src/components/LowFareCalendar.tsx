import React, { useState } from "react";
import { Calendar, TrendingDown, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MonthFare {
  month: string;
  price: number;
  status: "best" | "average" | "peak";
  label: string;
  prefilledDates: string;
}

interface LowFareCalendarProps {
  destinationName?: string;
  destinationSlug?: string;
  basePrice?: number;
}

export default function LowFareCalendar({
  destinationName = "Dubaj",
  destinationSlug = "dubaj",
  basePrice = 3490,
}: LowFareCalendarProps) {
  const months: MonthFare[] = [
    { month: "Září 2026", price: Math.round(basePrice * 1.1), status: "average", label: "Průměrná cena", prefilledDates: "2026-09" },
    { month: "Říjen 2026", price: Math.round(basePrice * 0.85), status: "best", label: "🔥 Nejlevnější", prefilledDates: "2026-10" },
    { month: "Listopad 2026", price: Math.round(basePrice * 0.9), status: "best", label: "Top sezóna/Sleva", prefilledDates: "2026-11" },
    { month: "Prosinec 2026", price: Math.round(basePrice * 1.45), status: "peak", label: "Vánoční špička", prefilledDates: "2026-12" },
    { month: "Leden 2027", price: Math.round(basePrice * 0.82), status: "best", label: "🔥 Výprodej", prefilledDates: "2027-01" },
    { month: "Únor 2027", price: Math.round(basePrice * 0.95), status: "average", label: "Ideální počasí", prefilledDates: "2027-02" },
  ];

  const [selectedMonth, setSelectedMonth] = useState<MonthFare>(months[1]);

  const bookingUrl = `https://www.akcni-letenky.com/dovolene?destination=${encodeURIComponent(destinationName)}&date=${selectedMonth.prefilledDates}`;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-2xl border border-indigo-500/20 my-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2 border border-emerald-500/30">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Měsíční kalendář nejnižších cen</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Kdy letět do destinace <span className="text-emerald-400">{destinationName}</span> nejlevněji?
          </h3>
          <p className="text-slate-300 text-sm mt-1">
            Porovnání historických trendů a volných kapacit v reálném čase.
          </p>
        </div>
        <div className="text-left md:text-right bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
          <div className="text-xs text-slate-400">Nejnižší zjištěná cena</div>
          <div className="text-3xl font-black text-emerald-400">
            od {selectedMonth.price.toLocaleString("cs-CZ")} Kč
          </div>
        </div>
      </div>

      {/* Month Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {months.map((m) => {
          const isSelected = selectedMonth.month === m.month;
          return (
            <button
              key={m.month}
              onClick={() => setSelectedMonth(m)}
              className={`flex flex-col justify-between p-3.5 rounded-2xl text-left transition-all duration-200 border ${
                isSelected
                  ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/25 scale-[1.03] font-bold"
                  : m.status === "best"
                  ? "bg-slate-800/90 text-white border-emerald-500/40 hover:border-emerald-400"
                  : "bg-slate-800/50 text-slate-300 border-slate-700/60 hover:bg-slate-800"
              }`}
            >
              <div>
                <div className={`text-xs ${isSelected ? "text-slate-900 font-bold" : "text-slate-400"}`}>
                  {m.month}
                </div>
                <div className={`text-lg font-black mt-1 ${isSelected ? "text-slate-950" : "text-white"}`}>
                  {m.price.toLocaleString("cs-CZ")} Kč
                </div>
              </div>
              <div className="mt-3">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold inline-block ${
                    isSelected
                      ? "bg-slate-950/20 text-slate-950"
                      : m.status === "best"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : m.status === "peak"
                      ? "bg-rose-500/20 text-rose-300"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {m.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Month Detail & Action CTA */}
      <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200">
              Vybrané období: <span className="text-white font-bold">{selectedMonth.month}</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
              Garantovaná nejnižší cena zpáteční letenky s poplatky a zavazadlem
            </div>
          </div>
        </div>

        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto"
        >
          <Button
            size="lg"
            className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black px-8 py-6 text-base rounded-xl shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
             Vyhledat letenky na {selectedMonth.month}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </a>
      </div>
    </div>
  );
}
