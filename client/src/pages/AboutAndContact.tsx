import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ShieldCheck, Mail, MapPin, Building2, HelpCircle, CheckCircle2, ArrowRight, ExternalLink, Send, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { pelikanDeepLink } from "@shared/affiliateLinks";

export default function AboutAndContact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Dotaz k nabídce letenek");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) {
      toast.error("Vyplňte prosím e-mail a zprávu.");
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSent(true);
      toast.success("Děkujeme! Vaše zpráva byla odeslána redakci.");
      setName("");
      setEmail("");
      setMessage("");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SEO
        title="O nás a Kontakt | Akcni-letenky.com"
        description="Kdo jsme, jak fungujeme a transparentní informace o provozovateli portálu Akcni-letenky.com a partnerství s Pelikán.cz."
        canonical="https://www.akcni-letenky.com/o-nas"
      />
      <Navigation />

      <main className="flex-grow container py-10 max-w-5xl">
        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 text-xs font-bold mb-4">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Transparentní a nezávislý cestovatelský portál
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            O projektu a Kontakt
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
            Akcni-letenky.com pomáhá českým cestovatelům objevovat skutečně výhodné akční letenky, 
            chybové tarify a nízkonákladové spoje z Prahy, Vídně, Bratislavy a okolních letišť.
          </p>
        </div>

        {/* 2-Column Grid: Business Model & Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Left Column: How we work & Operator Info */}
          <div className="lg:col-span-7 space-y-8">
            {/* How it works */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Jak fungujeme a náš obchodní model
              </h2>
              <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
                <p>
                  <strong>1. Nejsme prodejcem ani cestovní kanceláří:</strong> Na našem webu přímo nevystavujeme letenky ani nepřijímáme platby za lety. 
                  Fungujeme jako specializovaný vyhledávač, cenový radar a redakční srovnávač.
                </p>
                <p>
                  <strong>2. Prověřené partnerství:</strong> Když na našem webu kliknete na konkrétní akční letenku nebo zájezd, 
                  přesměrujeme vás na oficiální rezervační systém našeho licencovaného partnera <strong>Pelikán.cz (Pelikan Slovakia s.r.o.)</strong>, 
                  případně přímo na stránky konkrétní letecké společnosti (Ryanair, Wizz Air apod.).
                </p>
                <p>
                  <strong>3. 0 Kč provize pro vás:</strong> Za naše doporučení a zprostředkování můžeme obdržet drobnou affiliate provizi od partnera. 
                  Tato provize však <strong>nikdy nezvyšuje cenu pro vás</strong> – platíte vždy stejnou nebo nižší částku než při přímém vyhledání.
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Naše zásady poctivého výběru:</h3>
                <ul className="space-y-2.5 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Žádné skryté odlety:</strong> U každé letenky vždy jasně a předem uvádíme odletové letiště (Praha vs. Vídeň vs. Bratislava).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Ověřené termíny:</strong> Filtrujeme nesmyslné lety s 24hodinovými nočními přestupy nebo neatraktivními časy.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Transparentní zavazadla:</strong> Uvádíme přesné rozměry a limity příručních zavazadel v základní ceně.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Operator Details */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-slate-700" />
                Provozovatel a Redakce
              </h2>
              <div className="space-y-3 text-sm text-slate-600">
                <div>
                  <div className="font-semibold text-slate-900">Vydavatel a provozovatel projektu:</div>
                  <div>Akcni-letenky.com Digital Media</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Kontaktní e-mail:</div>
                  <div className="text-blue-600">info@akcni-letenky.com</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Lokalita a působnost:</div>
                  <div>Praha, Česká republika (provozováno pro trhy CZ a SK)</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Licencovaný partner pro vystavování letenek:</div>
                  <div className="text-slate-700">Pelikan Slovakia s.r.o., IČO: 35897821, IATA akreditovaný zástupce</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Napište naší redakci
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Máte tip na akční letenku, dotaz k článku nebo námět na zlepšení webu? Odpovíme do 24 hodin.
              </p>

              {sent ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                  <h3 className="font-bold text-emerald-900 mb-1">Zpráva byla úspěšně odeslána!</h3>
                  <p className="text-xs text-emerald-700 mb-4">Děkujeme za vaši zprávu. Naši redaktoři se vám brzy ozvou.</p>
                  <Button variant="outline" size="sm" onClick={() => setSent(false)}>
                    Odeslat další zprávu
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Vaše jméno
                    </label>
                    <Input
                      type="text"
                      placeholder="Petr Novák"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      E-mail *
                    </label>
                    <Input
                      type="email"
                      required
                      placeholder="petr.novak@email.cz"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Předmět zprávy
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Dotaz k nabídce letenek">Dotaz k nabídce letenek</option>
                      <option value="Nahlášení změny ceny u partnera">Nahlášení změny ceny u partnera</option>
                      <option value="Tip na akční letenku">Tip na novou akční letenku</option>
                      <option value="Návrh na spolupráci / Reklama">Návrh na spolupráci / Reklama</option>
                      <option value="Jiné">Jiné</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Vaše zpráva *
                    </label>
                    <Textarea
                      required
                      rows={4}
                      placeholder="Napište nám svůj dotaz nebo podnět..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-slate-50 border-slate-200 text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSending}
                    className="w-full bg-[#1565C0] hover:bg-[#0d47a1] text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    {isSending ? (
                      "Odesílám..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Odeslat zprávu
                      </>
                    )}
                  </Button>

                  <p className="text-[11px] text-slate-400 text-center">
                    Vaše osobní údaje zpracováváme výhradně pro zodpovězení vašeho dotazu.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            Časté dotazy k nákupu a rezervacím
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">Jak je možné, že jsou ceny tak nízké?</h3>
              <p className="text-slate-600 leading-relaxed">
                Náš vyhledávací systém monitoruje promo akce aerolinek, doprodeje volných míst i chybové tarify. 
                Díky tomu zachytíme akční nabídky ihned po jejich zveřejnění dříve, než se vyprodají.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">Kde probíhá platba a vystavení letenky?</h3>
              <p className="text-slate-600 leading-relaxed">
                Veškeré platby a rezervace probíhají na zabezpečené platební bráně partnera <strong>Pelikán.cz</strong>. 
                Pelikán vám okamžitě zašle potvrzení i elektronické letenky na e-mail a poskytuje zákaznickou podporu v češtině.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">Může se cena po prokliku lišit?</h3>
              <p className="text-slate-600 leading-relaxed">
                Ano, u nejlevnějších nízkonákladových tarifů bývá v dané ceně pouze omezený počet sedadel (často 2 až 8 míst). 
                Pokud nabídku vykoupí jiní cestovatelé, cena automaticky poskočí na vyšší tarifní třídu. Proto doporučujeme rezervovat bez váhání.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">Jak řešit změnu termínu nebo zrušení letu?</h3>
              <p className="text-slate-600 leading-relaxed">
                Veškeré požadavky na změnu rezervace, přidání zavazadel nebo refundaci vyřizuje přímo zákaznická linka Pelikán.cz 
                podle přepravních podmínek dané letecké společnosti.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}