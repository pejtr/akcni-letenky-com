import { useState } from "react";
import { Calendar, TrendingDown, ChevronRight, ShieldCheck, Plane } from "lucide-react";
import { pelikanDeepLink } from "@shared/affiliateLinks";

interface PriceCalendarProps {
  origin?: string;
  destination?: string;
  destinationName?: string;
  className?: string;
}

const monthlyDeals = [
  { month: "Srpen 2026", price: 890, days: "14-21 dní", popular: true },
  { month: "Září 2026", price: 746, days: "7-14 dní", popular: true },
  { month: "Říjen 2026", price: 712, days: "5-10 dní", popular: false },
  { month: "Listopad 2026", price: 690, days: "4-8 dní", popular: false },
  { month: "Prosinec 2026", price: 1090, days: "7-14 dní", popular: true },
  { month: "Leden 2027", price: 790, days: "5-12 dní", popular: false },
];

export default function PriceCalendarWidget({
  origin = "PRG",
  destination = "BCN",
  destinationName = "Barcelona",
  className = "",
}: PriceCalendarProps) {
  const [selectedMonth, setSelectedMonth] = useState(monthlyDeals[1]);

  const bookingUrl = pelikanDeepLink(`/cs/akcni-letenky/praha/${destinationName.toLowerCase()}`, {
    campaign: "price-calendar",
    channel: "calendar-widget",
    content: `${origin}-${destination}`,
  });

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-xl p-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#003087]">
              Cenový kalendář letenek do {destinationName}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
              Nejlevnější měsíce pro odlet z Prahy (Pelikán feed)
            </p>
          </div>
        </div>

        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
          <ShieldCheck className="w-4 h-4" /> Garance nejnižší ceny Pelikán.cz
        </span>
      </div>

      {/* Months Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {monthlyDeals.map((item, idx) => {
          const isSelected = selectedMonth.month === item.month;
          return (
            <button
              key={idx}
              onClick={() => setSelectedMonth(item)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-[#003087] text-white border-[#003087] shadow-lg scale-105"
                  : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
              }`}
            >
              <p className="text-xs font-medium opacity-80">{item.month}</p>
              <p className={`text-lg font-black mt-1 ${isSelected ? "text-orange-400" : "text-[#E91E63]"}`}>
                od {item.price.toLocaleString("cs-CZ")} Kč
              </p>
              <p className="text-[10px] opacity-75 mt-0.5">{item.days}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Month CTA Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl p-4 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-lg">
            ✈️
          </div>
          <div>
            <p className="text-sm font-bold text-[#003087]">
              Vybráno: {selectedMonth.month} — Praha → {destinationName}
            </p>
            <p className="text-xs text-gray-600">
              Nejlepší dostupná cena zpáteční letenky od <strong>{selectedMonth.price.toLocaleString("cs-CZ")} Kč</strong>
            </p>
          </div>
        </div>

        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto bg-[#FF5722] hover:bg-[#E64A19] text-white font-extrabold text-xs md:text-sm px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <span>Vyhledat termíny na Pelikán.cz</span>
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
