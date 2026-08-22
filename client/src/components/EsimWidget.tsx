import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Wifi, CheckCircle2, ExternalLink, Zap } from "lucide-react";

// Destinations outside EU that require eSIM (highest demand)
const ESIM_DESTINATIONS: Record<string, { price: string; dataPlan: string; countries: string }> = {
  "Dubaj": { price: "120", dataPlan: "5 GB / 7 dní", countries: "Spojené arabské emiráty" },
  "Bali": { price: "150", dataPlan: "5 GB / 10 dní", countries: "Indonésie" },
  "New York": { price: "180", dataPlan: "10 GB / 14 dní", countries: "USA & Kanada" },
  "Egypt": { price: "99", dataPlan: "5 GB / 7 dní", countries: "Egypt" },
  "Turecko": { price: "89", dataPlan: "7 GB / 7 dní", countries: "Turecko" },
  "Vietnam": { price: "130", dataPlan: "10 GB / 15 dní", countries: "Vietnam" },
  "Srí Lanka": { price: "110", dataPlan: "5 GB / 10 dní", countries: "Srí Lanka" },
  "Thajsko": { price: "140", dataPlan: "10 GB / 15 dní", countries: "Thajsko" },
  "Japonsko": { price: "200", dataPlan: "10 GB / 14 dní", countries: "Japonsko" },
  "Maroko": { price: "95", dataPlan: "5 GB / 7 dní", countries: "Maroko" },
};

const DEFAULT_ESIM = { price: "99", dataPlan: "5 GB / 7 dní", countries: "mezinárodní" };

export default function EsimWidget({ destination = "Dubaj" }: { destination?: string }) {
  const esim = ESIM_DESTINATIONS[destination] || DEFAULT_ESIM;
  const airaloUrl = `https://www.airalo.com/?referral_code=akcniletenky`;
  const holaflyUrl = `https://www.holafly.com/cs/?utm_source=akcniletenky`;

  return (
    <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-slate-900 text-white rounded-2xl p-5 shadow-xl border border-violet-400/30 my-6">
      <div className="flex flex-col md:flex-row items-center gap-5 justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-violet-500 text-white font-bold px-2.5 py-0.5 text-[10px]">
              <Zap className="w-3 h-3 mr-1" /> ŽÁDNÝ ROAMING
            </Badge>
            <Badge className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-bold px-2.5 py-0.5 text-[10px]">
              Aktivace za 2 minuty
            </Badge>
          </div>
          <h3 className="text-lg font-extrabold text-white leading-tight flex items-center gap-2">
            <Wifi className="w-5 h-5 text-violet-300" />
            Neomezený internet v {destination} od {esim.price} Kč
          </h3>
          <p className="text-xs text-violet-100 mt-1 mb-3 leading-relaxed">
            Bez výměny fyzické SIM karty. Aktivujte eSIM ještě před odletem a mějte internet ihned po přistání. Bez drahého roamingu!
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-violet-100">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Bez fyzické SIM, 100% digitální</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Plán: {esim.dataPlan}</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Pokrytí: {esim.countries}</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Funguje v iPhone i Android</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2.5 shrink-0">
          <div className="text-center">
            <div className="text-[10px] text-violet-300 font-semibold">Cena od</div>
            <div className="text-3xl font-black text-white">{esim.price} Kč</div>
            <div className="text-[10px] text-violet-200">{esim.dataPlan}</div>
          </div>
          <a href={airaloUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button className="bg-violet-500 hover:bg-violet-600 text-white font-extrabold text-xs px-4 h-10 shadow-lg w-full">
              <Smartphone className="w-4 h-4 mr-1.5" /> Airalo eSIM – Aktivovat <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </Button>
          </a>
          <a href={holaflyUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="outline" className="border-violet-400/40 text-violet-200 hover:bg-violet-500/20 font-bold text-xs px-4 h-9 w-full">
              <Wifi className="w-3.5 h-3.5 mr-1.5" /> Holafly eSIM <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
