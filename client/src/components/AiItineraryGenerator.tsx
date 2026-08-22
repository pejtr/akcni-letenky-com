import React, { useState } from "react";
import { Sparkles, Calendar, MapPin, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AiItineraryGeneratorProps {
  destination?: string;
}

export default function AiItineraryGenerator({ destination = "Dubaj" }: { destination?: string }) {
  const [days, setDays] = useState<3 | 5 | 7>(5);

  const ITINERARY_DATA: Record<string, Record<number, { day: number; title: string; desc: string; affiliateType: "flight" | "hotel" | "tour" | "car"; linkUrl: string }[]>> = {
    Dubaj: {
      3: [
        { day: 1, title: "Přílet & Prohlídka ikonického mrakodrapu Burj Khalifa", desc: "Vychutnejte si panoramatický výhled ze 125. patra a večerní tancující fontánu v Dubai Mall.", affiliateType: "tour", linkUrl: "https://www.getyourguide.com/dubai-l173/burj-khalifa-t3884/" },
        { day: 2, title: "Adrenalinové Pouštní Safari & Tradiční Bedounské kempování", desc: "Jízda na 4x4 dunách, velbloudi, sandboarding a luxusní večeře pod hvězdami.", affiliateType: "tour", linkUrl: "https://www.getyourguide.com/dubai-l173/desert-safari-t4120/" },
        { day: 3, title: "Relaxace na pláži Jumeirah Beach & Nákupy na Souk Madinat", desc: "Závěrečný odpočinek u azurového moře a výhled na 7★ hotel Burj Al Arab.", affiliateType: "hotel", linkUrl: "https://www.akcni-letenky.com/dovolene?destination=Dubaj" },
      ],
      5: [
        { day: 1, title: "Přílet & Prohlídka ikonického mrakodrapu Burj Khalifa", desc: "Vychutnejte si panoramatický výhled ze 125. patra a večerní tancující fontánu v Dubai Mall.", affiliateType: "tour", linkUrl: "https://www.getyourguide.com/dubai-l173/burj-khalifa-t3884/" },
        { day: 2, title: "Adrenalinové Pouštní Safari & Tradiční Bedounské kempování", desc: "Jízda na 4x4 dunách, velbloudi, sandboarding a luxusní večeře pod hvězdami.", affiliateType: "tour", linkUrl: "https://www.getyourguide.com/dubai-l173/desert-safari-t4120/" },
        { day: 3, title: "Historická čtvrť Al Fahidi & Plavba tradiční lodí Abra po Dubai Creek", desc: "Objevte starou Dubaj, trh s kořením Spice Souk a Zlatý trh Gold Souk.", affiliateType: "tour", linkUrl: "https://www.getyourguide.com/dubai-l173/" },
        { day: 4, title: "Futuristické Muzeum Budoucnosti (Museum of the Future) & Dubai Frame", desc: "Nahlédněte do architektury a technologií roku 2071.", affiliateType: "tour", linkUrl: "https://www.getyourguide.com/dubai-l173/" },
        { day: 5, title: "Celodenní Relax na Palm Jumeirah & Vodní park Aquaventure", desc: "Zábava v největším aquaparku světa u hotelu Atlantis.", affiliateType: "hotel", linkUrl: "https://www.akcni-letenky.com/dovolene?destination=Dubaj" },
      ],
      7: [
        { day: 1, title: "Přílet & Prohlídka mrakodrapu Burj Khalifa", desc: "Panoramatický výhled ze 125. patra a fontána.", affiliateType: "tour", linkUrl: "https://www.getyourguide.com/dubai-l173/burj-khalifa-t3884/" },
        { day: 2, title: "Pouštní Safari s BBQ večeří", desc: "Duny, velbloudi a západ slunce.", affiliateType: "tour", linkUrl: "https://www.getyourguide.com/dubai-l173/desert-safari-t4120/" },
        { day: 3, title: "Stará Dubaj & Trhy Spice Souk", desc: "Kultura a historie v Al Fahidi.", affiliateType: "tour", linkUrl: "https://www.getyourguide.com/dubai-l173/" },
        { day: 4, title: "Muzeum Budoucnosti & Dubai Marina", desc: "Moderní architektura a jachty.", affiliateType: "tour", linkUrl: "https://www.getyourguide.com/dubai-l173/" },
        { day: 5, title: "Aquapark Atlantis & Palm Jumeirah", desc: "Zábava a relaxace u moře.", affiliateType: "hotel", linkUrl: "https://www.akcni-letenky.com/dovolene?destination=Dubaj" },
        { day: 6, title: "Jednodenní výlet do Abu Dhabi (Velká mešita Šejka Zayeda)", desc: "Impozantní mešita a palác Qasr Al Watan.", affiliateType: "car", linkUrl: "https://www.rentalcars.com" },
        { day: 7, title: "Nákupy v Mall of the Emirates & Odlet", desc: "Krytá lyžařská sjezdovka Ski Dubai a odlet domů.", affiliateType: "flight", linkUrl: "https://www.akcni-letenky.com/letenky-dubaj" },
      ],
    },
  };

  const itinerary = ITINERARY_DATA[destination]?.[days] || ITINERARY_DATA["Dubaj"][days];

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-400/30 my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-700/50 pb-4 mb-5">
        <div>
          <Badge className="bg-indigo-500 text-white font-bold px-2.5 py-0.5 mb-1.5">
            🤖 AI Travel Itinerary Planner
          </Badge>
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            Plán dovolené na míru pro {destination} ({days} dní)
          </h3>
        </div>
        <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl backdrop-blur-sm">
          {([3, 5, 7] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`py-1 px-3 text-xs font-bold rounded-lg transition-all ${
                days === d ? "bg-amber-500 text-gray-950 shadow" : "text-indigo-200 hover:text-white"
              }`}
            >
              {d} Dní
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {itinerary.map((item) => (
          <div key={item.day} className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl p-3.5 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block mb-0.5">
                  📅 DEN {item.day}
                </span>
                <h4 className="font-bold text-xs text-white leading-tight">{item.title}</h4>
                <p className="text-[11px] text-indigo-100 mt-1 leading-relaxed">{item.desc}</p>
              </div>
              <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 mt-1">
                <Button size="sm" variant="outline" className="text-xs text-amber-300 border-amber-400/40 hover:bg-amber-500 hover:text-gray-950 font-bold px-2.5 h-8">
                  Rezervovat <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
