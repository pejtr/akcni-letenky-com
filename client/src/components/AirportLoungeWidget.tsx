import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wine, Wifi, Coffee, ShowerHead, CheckCircle2, ExternalLink, Sparkles } from "lucide-react";

interface AirportLoungeWidgetProps {
  airportName?: string;
  airportCode?: string;
}

// Priority Pass affiliate URL
const PRIORITY_PASS_URL = "https://www.prioritypass.com/?utm_source=akcniletenky&utm_medium=affiliate";
const DRAGON_PASS_URL = "https://www.dragonpass.com.cn/?utm_source=akcniletenky";

export default function AirportLoungeWidget({
  airportName = "Praha Václav Havel",
  airportCode = "PRG",
}: AirportLoungeWidgetProps) {

  return (
    <div className="bg-gradient-to-r from-amber-900/70 via-yellow-900/70 to-slate-900/80 text-white rounded-2xl p-5 shadow-xl border border-amber-400/30 my-6">
      <div className="flex flex-col md:flex-row items-center gap-5 justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-amber-500 text-gray-950 font-extrabold px-2.5 py-0.5 text-[10px]">
              <Sparkles className="w-3 h-3 mr-1 fill-gray-950" /> LETIŠTNÍ VIP SALONEK
            </Badge>
            <span className="text-[10px] text-amber-200">Priority Pass Partner</span>
          </div>
          <h3 className="text-lg font-extrabold text-white leading-tight">
            🍷 VIP Salonek na letišti {airportName} ({airportCode})
          </h3>
          <p className="text-xs text-amber-100 mt-1 mb-3 leading-relaxed">
            Čekejte v pohodlí exkluzivního salonku s neomezeným jídlem, prémiovými nápoji a rychlou Wi-Fi. Vstup od <span className="font-extrabold text-amber-300">590 Kč / osoba</span>.
          </p>
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-[11px] text-amber-100">
            <span className="flex items-center gap-1.5"><Wine className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Neomezené jídlo & pití</span>
            <span className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Rychlé Wi-Fi připojení</span>
            <span className="flex items-center gap-1.5"><ShowerHead className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Sprchy a soukromé kabinky</span>
            <span className="flex items-center gap-1.5"><Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Prémiová káva & čaj zdarma</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Rezervace na den D</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> 1300+ salonků ve světě</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2.5 shrink-0">
          <div className="text-center">
            <div className="text-[10px] text-amber-300 font-semibold">Vstup od</div>
            <div className="text-3xl font-black text-amber-300">590 Kč</div>
            <div className="text-[10px] text-amber-200">/ osoba / pobyt</div>
          </div>
          <a href={PRIORITY_PASS_URL} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold text-xs px-4 h-10 shadow-lg w-full">
              <Wine className="w-4 h-4 mr-1.5" /> Rezervovat VIP Salonek <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </Button>
          </a>
          <a href={DRAGON_PASS_URL} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="outline" className="border-amber-400/40 text-amber-200 hover:bg-amber-500/20 font-bold text-xs px-4 h-9 w-full">
              DragonPass Salonky <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
