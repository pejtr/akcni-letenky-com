import React from "react";
import EbookDownloadWidget from "@/components/EbookDownloadWidget";
import InstantAlertBar from "@/components/InstantAlertBar";
import TrustBadgesShield from "@/components/TrustBadgesShield";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, Sparkles, Star } from "lucide-react";

export default function EbookDownloadPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-b from-amber-950 via-orange-900 to-slate-900 text-white py-14 px-4 relative overflow-hidden">
        <div className="container max-w-5xl text-center relative z-10">
          <Badge className="bg-amber-500 text-gray-950 font-bold text-xs px-3 py-1 mb-4 shadow">
            <BookOpen className="w-3.5 h-3.5 mr-1" /> E-book Zdarma k Cestování 2026
          </Badge>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Jak Cestovat po Světě za Babku
          </h1>
          <p className="text-sm md:text-base text-amber-100 mt-3 max-w-2xl mx-auto leading-relaxed">
            Stáhněte si 54 stran nabitých praktickými tipy, tajnými triky na akční letenky, návodem na ubytování s 50% slevou a kompenzace od aerolinek.
          </p>
        </div>
      </section>

      <main className="container max-w-5xl py-8 flex-1 space-y-8">
        <TrustBadgesShield />
        <EbookDownloadWidget />
        <InstantAlertBar />

        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 my-8">
          <h3 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> Co se v e-booku dozvíte?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-700">
            <div className="flex items-start gap-2.5 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block mb-0.5">Jak fungují chybné tarify (Error Fares)</strong>
                Zřiďte si bezplatný systém notifikací a kupujte letenky do Asie či Ameriky od 2 990 Kč.
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block mb-0.5">Ušetřete na ubytování s Revolut & Booking.com</strong>
                Praktický návod na cashback a věrnostní programy.
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block mb-0.5">Jak získat odškodnění až 600 €</strong>
                Krok za krokem reklamací zpožděných i zrušených letů.
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block mb-0.5">Internet bez roamingu s eSIM</strong>
                Jak mít neomezená data od 89 Kč kdekoliv na světě.
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
