import React from "react";
import PriceTrackerWidget from "@/components/PriceTrackerWidget";
import InstantAlertBar from "@/components/InstantAlertBar";
import TrustBadgesShield from "@/components/TrustBadgesShield";
import TravelInsuranceWidget from "@/components/TravelInsuranceWidget";
import FlightCompensationWidget from "@/components/FlightCompensationWidget";
import EsimWidget from "@/components/EsimWidget";
import AirportLoungeWidget from "@/components/AirportLoungeWidget";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, ShieldCheck, Bell, Sparkles, CheckCircle2, Zap } from "lucide-react";


export default function PriceTrackerPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-blue-950 via-indigo-900 to-slate-900 text-white py-12 px-4 relative overflow-hidden">
        <div className="container max-w-5xl text-center relative z-10">
          <Badge className="bg-amber-500 text-gray-950 font-bold text-xs px-3 py-1 mb-4 shadow">
            <TrendingDown className="w-3.5 h-3.5 mr-1" /> Automatické Sledování Cen 24/7
          </Badge>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Hlídač Cen Letenek & Dovolených
          </h1>
          <p className="text-sm md:text-base text-blue-100 mt-3 max-w-2xl mx-auto leading-relaxed">
            Nenechte si ujít žádnou chybu v ceně! Nastavte si požadovanou destinaci a maximální rozpočet. Systém 24/7 sleduje poklesy cen a ihned vás upozorní.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container max-w-5xl py-8 flex-1">
        <TrustBadgesShield />

        {/* Embedded Interactive Price Tracker Widget */}
        <PriceTrackerWidget defaultDestination="Dubaj" defaultMaxPrice={5000} />

        <InstantAlertBar />

        {/* Live Mock Price Trends Section */}
        <section className="my-10">
          <div className="mb-4">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Aktuálně Sledované Trháky s Největším Poklesem Ceny
            </h2>
            <p className="text-xs text-gray-500 mt-1">Tyto akční ceny byly zachyceny hlídačem cen za posledních 24 hodin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-all border-emerald-200 bg-emerald-50/30">
              <CardContent className="pt-5 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">📉 Pokles o 42%</Badge>
                  <span className="text-[10px] text-gray-500">Před 12 minutami</span>
                </div>
                <h4 className="font-extrabold text-base text-gray-900">Praha ↔ Dubaj</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-gray-400 line-through">12 500 Kč</span>
                  <span className="text-lg font-black text-emerald-700">4 990 Kč</span>
                </div>
                <p className="text-xs text-gray-600">Zpáteční letenky s garancí nejnižší ceny.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all border-emerald-200 bg-emerald-50/30">
              <CardContent className="pt-5 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">📉 Pokles o 38%</Badge>
                  <span className="text-[10px] text-gray-500">Před 35 minutami</span>
                </div>
                <h4 className="font-extrabold text-base text-gray-900">Praha ↔ Bali</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-gray-400 line-through">22 000 Kč</span>
                  <span className="text-lg font-black text-emerald-700">13 890 Kč</span>
                </div>
                <p className="text-xs text-gray-600">Kompletní balíček letenky a ubytování v Ubudu.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all border-emerald-200 bg-emerald-50/30">
              <CardContent className="pt-5 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">📉 Pokles o 50%</Badge>
                  <span className="text-[10px] text-gray-500">Před 1 hodinou</span>
                </div>
                <h4 className="font-extrabold text-base text-gray-900">Praha ↔ Řím</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-gray-400 line-through">3 500 Kč</span>
                  <span className="text-lg font-black text-emerald-700">1 190 Kč</span>
                </div>
                <p className="text-xs text-gray-600">Přímý let se všemi poplatky v ceně.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <TravelInsuranceWidget />
        <FlightCompensationWidget />
        <EsimWidget destination="Dubaj" />
        <AirportLoungeWidget />

        {/* FAQ */}
        <section className="my-10 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-extrabold text-gray-900 mb-4">Často Kladené Dotazy k Hlídači Cen</h3>
          <div className="space-y-4 text-xs text-gray-700">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Je hlídač cen letenek a dovolených zdarma?</h4>
              <p className="mt-1">Ano, hlídač cen je 100% zdarma bez jakýchkoliv skrytých poplatků nebo závazků.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Jak často kontrolujete ceny?</h4>
              <p className="mt-1">Ceny letenek i dovolených kontrolujeme nepřetržitě 24 hodin denně, 7 dní v týdnu v reálném čase.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Co se stane, když cena klesne pod můj limit?</h4>
              <p className="mt-1">Ihned vám odešleme e-mail a notifikaci s přímým odkazem na rezervaci akční nabídky.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
