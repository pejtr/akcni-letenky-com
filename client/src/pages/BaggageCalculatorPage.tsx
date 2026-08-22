import React from "react";
import BaggageCalculatorWidget from "@/components/BaggageCalculatorWidget";
import TravelInsuranceWidget from "@/components/TravelInsuranceWidget";
import EsimWidget from "@/components/EsimWidget";
import FlightCompensationWidget from "@/components/FlightCompensationWidget";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Luggage, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export default function BaggageCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-950 via-indigo-900 to-slate-900 text-white py-12 px-4 relative overflow-hidden">
        <div className="container max-w-5xl text-center relative z-10">
          <Badge className="bg-amber-500 text-gray-950 font-bold text-xs px-3 py-1 mb-4 shadow">
            <Luggage className="w-3.5 h-3.5 mr-1" /> Pravidla Zavazadel Aerolinek 2026
          </Badge>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Kalkulačka Rozměrů & Poplatků za Zavazadla
          </h1>
          <p className="text-sm md:text-base text-blue-100 mt-3 max-w-2xl mx-auto leading-relaxed">
            Vyhněte se vysokým doplatkům na letišti! Zjistěte přesné limity pro příruční i odbavená zavazadla u Ryanairu, Wizz Airu, Smartwings, Lufthansy a Emirates.
          </p>
        </div>
      </section>

      <main className="container max-w-5xl py-8 flex-1 space-y-8">
        <BaggageCalculatorWidget />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Jak správně zabalit kabinové zavazadlo?
            </h3>
            <ul className="space-y-2 text-xs text-gray-700">
              <li>• Tekutiny v nádobkách do max 100 ml (celkem max 1 litr v průhledném sáčku).</li>
              <li>• Powerbanky a lithium-iontové baterie PATŘÍ VÝHRADNĚ do příručního zavazadla.</li>
              <li>• Cennosti, notebooky a doklady mějte vždy u sebe na palubě.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" /> Co když se zavazadlo zpozdí nebo ztratí?
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed">
              Při poškození nebo zpoždění odbaveného zavazadla máte dle Montrealské úmluvy nárok na odškodnění až 38 000 Kč (cca 1 300 SDR). Sjednejte si pro klid v duši i kvalitní cestovní pojištění.
            </p>
          </div>
        </div>

        <TravelInsuranceWidget />
        <EsimWidget destination="Dubaj" />
        <FlightCompensationWidget />
      </main>

      <Footer />
    </div>
  );
}
