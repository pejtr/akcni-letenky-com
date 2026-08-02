import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Luggage, CheckCircle2, AlertCircle, Info, ExternalLink } from "lucide-react";

interface AirlineBaggage {
  name: string;
  cabinBg: string;
  cabinSize: string;
  cabinWeight: string;
  checkedWeight: string;
  checkedPrice: string;
  tip: string;
}

const AIRLINES_BAGGAGE: Record<string, AirlineBaggage> = {
  ryanair: {
    name: "Ryanair",
    cabinBg: "Malé příruční zavazadlo v ceně",
    cabinSize: "40 x 20 x 25 cm",
    cabinWeight: "Bez váhového limitu (musí pod sedadlo)",
    checkedWeight: "10 kg / 20 kg",
    checkedPrice: "od 350 Kč / 650 Kč",
    tip: "Pro větší kabinové zavazadlo (55x40x20 cm do 10kg) dokupte službu Prioritní nástup (Priority).",
  },
  wizzair: {
    name: "Wizz Air",
    cabinBg: "Malý batoh v ceně zdarma",
    cabinSize: "40 x 30 x 20 cm",
    cabinWeight: "max. 10 kg",
    checkedWeight: "10 kg / 20 kg / 32 kg",
    checkedPrice: "od 290 Kč / 550 Kč",
    tip: "S WIZZ Priority získáte navíc kufřík na kolečkách 55 x 40 x 23 cm do 10 kg.",
  },
  smartwings: {
    name: "Smartwings",
    cabinBg: "Kabinové zavazadlo v ceně",
    cabinSize: "55 x 45 x 25 cm",
    cabinWeight: "max. 8 kg",
    checkedWeight: "23 kg (v závislosti na tarifu)",
    checkedPrice: "od 750 Kč",
    tip: "Kabinový kufřík je v ceně i nejlevnějšího tarifu Lite.",
  },
  lufthansa: {
    name: "Lufthansa / Austrian",
    cabinBg: "Kabinový kufr + osobní taška",
    cabinSize: "55 x 40 x 23 cm + 40 x 30 x 10 cm",
    cabinWeight: "max. 8 kg",
    checkedWeight: "23 kg",
    checkedPrice: "od 890 Kč",
    tip: "Na dálkových letech je odbavené zavazadlo do 23 kg v ceně letenky.",
  },
  emirates: {
    name: "Emirates",
    cabinBg: "Kabinové zavazadlo v ceně",
    cabinSize: "55 x 38 x 20 cm",
    cabinWeight: "max. 7 kg",
    checkedWeight: "25 kg až 35 kg",
    checkedPrice: "V ceně letenky!",
    tip: "Emirates nabízí nejštědřejší váhový limit pro odbavená zavazadla v ekonomické třídě.",
  },
};

export default function BaggageCalculatorWidget() {
  const [selectedAirline, setSelectedAirline] = useState<string>("ryanair");
  const data = AIRLINES_BAGGAGE[selectedAirline];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 mb-4">
        <div>
          <Badge className="bg-blue-600 text-white font-bold text-[10px] mb-1">
            🧳 Kalkulačka Rozměrů Zavazadel 2026
          </Badge>
          <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Luggage className="w-5 h-5 text-blue-600" />
            Rozměry & Poplatky za Zavazadla Aerolinek
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5 bg-gray-100 p-1 rounded-xl">
          {Object.keys(AIRLINES_BAGGAGE).map((slug) => (
            <button
              key={slug}
              onClick={() => setSelectedAirline(slug)}
              className={`py-1 px-3 text-xs font-bold rounded-lg transition-all ${
                selectedAirline === slug ? "bg-blue-600 text-white shadow" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {AIRLINES_BAGGAGE[slug].name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Kabinové příruční zavazadlo</span>
          </div>
          <div className="space-y-1 text-xs text-gray-700">
            <div><strong className="text-gray-900">Rozměr:</strong> {data.cabinSize}</div>
            <div><strong className="text-gray-900">Váha:</strong> {data.cabinWeight}</div>
            <div><strong className="text-gray-900">Stav:</strong> {data.cabinBg}</div>
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-2">
            <Luggage className="w-4 h-4 text-amber-600" />
            <span>Odbavené zavazadlo do podpalubí</span>
          </div>
          <div className="space-y-1 text-xs text-gray-700">
            <div><strong className="text-gray-900">Hmotnostní limit:</strong> {data.checkedWeight}</div>
            <div><strong className="text-gray-900">Orientační cena:</strong> {data.checkedPrice}</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex items-start gap-2 text-xs text-gray-700">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-gray-900">Tip pro cestovatele: </strong>
          {data.tip}
        </div>
      </div>
    </div>
  );
}
