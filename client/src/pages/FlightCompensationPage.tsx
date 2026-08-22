import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Euro, Plane, Clock, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";

const COMPENSATION_TABLE = [
  { distance: "Do 1 500 km (Paříž, Vídeň, Praha–Londýn)", amount: "250 €", czk: "6 250 Kč" },
  { distance: "1 500 – 3 500 km (Turecko, Egypt, Kanárské ostrovy)", amount: "400 €", czk: "10 000 Kč" },
  { distance: "Nad 3 500 km (USA, Dubaj, Bali, Thajsko)", amount: "600 €", czk: "15 000 Kč" },
];

const FAQ_ITEMS = [
  { q: "Kdo má nárok na odškodnění?", a: "Každý cestující letícím z letiště v EU nebo letem společnosti se sídlem v EU, jehož let byl zpožděn o více než 3 hodiny, zrušen nebo mu byl odepřen nástup na palubu." },
  { q: "Jak daleko dozadu lze reklamovat?", a: "Dle EU nařízení EC 261/2004 lze uplatňovat nároky zpětně až 3 roky (v ČR) od data letu." },
  { q: "Co stojí podání nároku?", a: "Kontrola je zdarma. AirHelp si vezme 35% provizi pouze v případě úspěšného vyplacení. Pokud soud neuspěje, neplatíte nic." },
  { q: "Jak dlouho trvá vyřízení?", a: "Průměrná doba vyřízení je 8–12 týdnů. AirHelp zvládá i složité případy soudní cestou bez vašeho zapojení." },
];

export default function FlightCompensationPage() {
  const airHelpUrl = "https://www.airhelp.com/cs/?utm_source=akcni-letenky&utm_medium=affiliate";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-b from-orange-950 via-red-900 to-slate-900 text-white py-14 px-4 relative overflow-hidden">
        <div className="container max-w-5xl relative z-10 text-center">
          <Badge className="bg-orange-500 text-gray-950 font-bold px-3 py-1 mb-4 text-xs shadow">
            <AlertCircle className="w-3.5 h-3.5 mr-1" /> EU Nařízení EC 261/2004
          </Badge>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-3">
            Odškodnění za Zpožděný nebo Zrušený Let
          </h1>
          <p className="text-sm md:text-base text-orange-100 max-w-2xl mx-auto leading-relaxed mb-6">
            Máte nárok na odškodnění <strong className="text-amber-300">až 600 € (15 000 Kč)</strong> za každé zpoždění letadla nad 3 hodiny, zrušení nebo odepření nástupu na palubu. Bezplatná kontrola – platíte jen při úspěchu!
          </p>
          <a href={airHelpUrl} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold px-8 h-12 shadow-xl text-base">
              Zkontrolovat nárok ZDARMA <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </section>

      <main className="container max-w-5xl py-10 flex-1 space-y-12">

        {/* How much can you get */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1 flex items-center gap-2">
            <Euro className="w-6 h-6 text-amber-500" /> Kolik mi náleží?
          </h2>
          <p className="text-sm text-gray-500 mb-5">Výše odškodnění závisí na délce trasy vašeho letu:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COMPENSATION_TABLE.map((row, i) => (
              <Card key={i} className="border-amber-200 bg-amber-50/50 hover:shadow-md transition-all">
                <CardContent className="pt-5">
                  <Plane className="w-6 h-6 text-amber-500 mb-2" />
                  <p className="text-xs text-gray-600 mb-2 leading-relaxed">{row.distance}</p>
                  <div className="text-2xl font-black text-amber-600">{row.amount}</div>
                  <div className="text-xs text-gray-500 font-bold">≈ {row.czk} / osoba</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Qualifying conditions */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Kdy máte nárok?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {[
              "Let z letiště v EU (bez ohledu na aerolinky)",
              "Let do EU s aerolinkama se sídlem v EU",
              "Zpoždění příletu nad 3 hodiny",
              "Zrušení letu (s méně než 14 denním předstihem)",
              "Odepření nástupu (overbooking)",
              "Zmeškaná navazující letenka z důvodu zpoždění",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-5 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500" /> Jak to funguje? (3 kroky)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { step: "1", title: "Bezplatná kontrola", desc: "Vyplňte číslo letu a datum. Systém AirHelp okamžitě zkontroluje, zda máte nárok." },
              { step: "2", title: "Podání nároku", desc: "AirHelp komunikuje s aerolinkama za vás. Nemusíte dělat nic." },
              { step: "3", title: "Výplata náhrady", desc: "Po úspěšném vyřízení dostanete peníze. AirHelp si vezme 35% z odměny. Nic jiného neplatíte." },
            ].map((s) => (
              <Card key={s.step} className="text-center hover:shadow-md transition-all">
                <CardContent className="pt-5">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-extrabold text-lg mx-auto mb-3">{s.step}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-extrabold text-gray-900 mb-5">Nejčastější dotazy</h2>
          <div className="space-y-5">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <h3 className="font-bold text-gray-900 text-sm mb-1">{item.q}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-gradient-to-r from-orange-900 to-red-900 text-white rounded-2xl p-8 text-center shadow-xl">
          <Clock className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="text-2xl font-black mb-2">Netáhněte to na poslední chvíli!</h3>
          <p className="text-sm text-orange-100 mb-5 max-w-lg mx-auto">Nárok na odškodnění promlčí po 3 letech. Zkontrolujte VŠECHNY letěné lety za poslední 3 roky – klidně jich může být více!</p>
          <a href={airHelpUrl} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold px-8 h-12 shadow-xl text-sm">
              Spustit kontrolu všech letů ZDARMA <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
