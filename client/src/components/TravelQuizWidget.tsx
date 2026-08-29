import React, { useState } from "react";
import { Compass, DollarSign, Sparkles, ArrowRight, RotateCcw, Plane, Hotel, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface QuizOption {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

interface ResultDeal {
  destination: string;
  country: string;
  price: number;
  type: string;
  image: string;
  link: string;
}

export default function TravelQuizWidget() {
  const [step, setStep] = useState<number>(1);
  const [budget, setBudget] = useState<string>("medium");
  const [style, setStyle] = useState<string>("beach");

  const budgetOptions: QuizOption[] = [
    { id: "low", title: "Do 3 500 Kč", desc: "Super levné eurovíkendy a nízkonákladovky", icon: "💰" },
    { id: "medium", title: "3 500 - 8 000 Kč", desc: "Středomoří, Řecko, Dubaj, Kanáry", icon: "✈️" },
    { id: "premium", title: "Nad 8 000 Kč", desc: "Karibik, Asie, Exotika a luxus", icon: "🏝️" },
  ];

  const styleOptions: QuizOption[] = [
    { id: "beach", title: "Moře & Pláže", desc: "Slunce, jemný písek a koupání", icon: "🏖️" },
    { id: "city", title: "Eurovíkendy & Památky", desc: "Kultura, skvělé jídlo a památky", icon: "🏛️" },
    { id: "exotic", title: "Exotika & Tropy", desc: "Palmy, korálové útesy a dobrodružství", icon: "🌴" },
  ];

  const getResults = (): ResultDeal[] => {
    if (budget === "low") {
      return [
        { destination: "Řím", country: "Itálie", price: 1290, type: "Zpáteční letenka", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80", link: "/letenky-rim" },
        { destination: "Barcelona", country: "Španělsko", price: 1890, type: "Zpáteční letenka", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80", link: "/letenky-barcelona" },
      ];
    }
    if (budget === "medium") {
      return [
        { destination: "Dubaj", country: "SAE", price: 3890, type: "Letenka + 4★ Hotel", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80", link: "/dubaj" },
        { destination: "Malta", country: "Středomoří", price: 2990, type: "Zpáteční letenka", image: "https://images.unsplash.com/photo-1565538420870-da08ff96a207?w=600&q=80", link: "/letenky-malta" },
      ];
    }
    return [
      { destination: "Bali", country: "Indonésie", price: 11990, type: "Zpáteční letenka", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80", link: "/bali" },
      { destination: "Maledivy", country: "Indický oceán", price: 12890, type: "Letenka + Resort", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80", link: "/letenky-maledivy" },
    ];
  };

  return (
    <div className="bg-gradient-to-br from-rose-50 via-white to-pink-50 rounded-3xl p-6 md:p-10 border border-rose-200/80 shadow-xl my-10 max-w-4xl mx-auto">
      {/* Quiz Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg md:text-xl leading-tight">
              AI Asistent: Najdi si ideální dovolenou podle rozpočtu
            </h3>
            <p className="text-slate-500 text-xs">Vyber si rozpočet a styl, zbytek spočítáme za vás.</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-xs font-bold text-rose-600 bg-rose-100 px-3 py-1 rounded-full">
            Krok {step} ze 3
          </span>
        </div>
      </div>

      {/* Step 1: Budget Selection */}
      {step === 1 && (
        <div>
          <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>1. Jaký máte přibližný rozpočet na osobu?</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {budgetOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setBudget(opt.id)}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  budget === opt.id
                    ? "bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-600/20 scale-[1.02]"
                    : "bg-white text-slate-800 border-slate-200 hover:border-rose-300 hover:bg-rose-50/50"
                }`}
              >
                <div className="text-3xl mb-2">{opt.icon}</div>
                <div className="font-black text-lg">{opt.title}</div>
                <div className={`text-xs mt-1 ${budget === opt.id ? "text-rose-100" : "text-slate-500"}`}>
                  {opt.desc}
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => setStep(2)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-rose-600/20"
            >
              Pokračovat k výběru stylu <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Style Selection */}
      {step === 2 && (
        <div>
          <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>2. Jaký styl cestování dáváte přednost?</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {styleOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setStyle(opt.id)}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  style === opt.id
                    ? "bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-600/20 scale-[1.02]"
                    : "bg-white text-slate-800 border-slate-200 hover:border-rose-300 hover:bg-rose-50/50"
                }`}
              >
                <div className="text-3xl mb-2">{opt.icon}</div>
                <div className="font-black text-lg">{opt.title}</div>
                <div className={`text-xs mt-1 ${style === opt.id ? "text-rose-100" : "text-slate-500"}`}>
                  {opt.desc}
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">
              Zpět
            </Button>
            <Button
              onClick={() => setStep(3)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-rose-600/20"
            >
              Zobrazit vyhledané akce <Sparkles className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-600" />
              <span>Nalezené TOP akční nabídky pro vás:</span>
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(1)}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Změnit zadání
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {getResults().map((res, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-md flex gap-4 items-center">
                <img
                  src={res.image}
                  alt={res.destination}
                  className="w-24 h-24 object-cover rounded-xl shrink-0"
                />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider">{res.country}</div>
                  <h5 className="text-lg font-black text-slate-900">{res.destination}</h5>
                  <div className="text-xs text-slate-500">{res.type}</div>
                  <div className="text-xl font-black text-slate-900 mt-2">
                    {res.price.toLocaleString("cs-CZ")} Kč
                  </div>
                </div>
                <Link href={res.link}>
                  <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl">
                    Zobrazit akci
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
