import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ShieldCheck, Mail, MapPin, Building2, HelpCircle, CheckCircle2, ArrowRight, ExternalLink, Send, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function AboutAndContact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Dotaz k nabídce letenek");
  const [message, setMessage] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [sent, setSent] = useState(false);

  const contactMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSent(true);
      toast.success("Děkujeme! Vaše zpráva byla odeslána redakci.");
      setName("");
      setEmail("");
      setMessage("");
      setGdprConsent(false);
    },
    onError: (err) => {
      toast.error(err.message || "Odeslání se nezdařilo. Zkuste to prosím znovu.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      toast.error("Vyplňte prosím e-mail a text zprávy.");
      return;
    }
    if (!gdprConsent) {
      toast.error("Pro odeslání zprávy je nutný souhlas se zpracováním osobních údajů.");
      return;
    }

    contactMutation.mutate({
      name: name.trim() || undefined,
      email: email.trim(),
      subject,
      message: message.trim(),
      gdprConsent,
      honeypot: honeypot || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SEO
        title="O nás a Kontakt | Akcni-letenky.com"
        description="Informace o provozovateli portálu Akcni-letenky.com, affiliate partnerství s Pelikán.cz a kontakt na redakci."
        canonical="https://www.akcni-letenky.com/o-nas"
      />
      <Navigation />

      <main className="flex-grow container py-10 max-w-5xl">
        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 text-xs font-bold mb-4">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Nezávislý agregátor akčních letenek a cestovatelských tipů
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            O projektu a Kontakt
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
            Akcni-letenky.com přináší vybrané akční tipy na letenky z Prahy, Vídně, Bratislavy i okolních letišť. 
            Aktuální cenu, dostupnost a kompletní přepravní podmínky vždy ověříte přímo u prodejce.
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
                Jak fungujeme a affiliate partnerství
              </h2>
              <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
                <p>
                  <strong>1. Nejsme prodejcem letenek:</strong> Na tomto webu neprobíhá nákup letenek, rezervace ani platby. 
                  Fungujeme jako agregátor a informační portál s tipy na výhodné lety.
                </p>
                <p>
                  <strong>2. Affiliate partnerství:</strong> Jsme affiliate partnerem portálu Pelikán.cz. 
                  Po kliknutí na nabídku jste přesměrováni k prodejci, kde probíhá výběr termínu, zadání údajů, platba i vystavení letenky.
                </p>
                <p>
                  <strong>3. Žádné poplatky za vyhledávání:</strong> Za prohlížení našeho webu neplatíte žádný poplatek. 
                  Pokud rezervaci dokončíte u partnera, můžeme obdržet provizi z affiliate programu. Cena pro vás zůstává stejná.
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Naše zásady transparentnosti:</h3>
                <ul className="space-y-2.5 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Jasné odlety:</strong> U každého tipu uvádíme odletové letiště (Praha, Vídeň, Bratislava apod.), aby nedocházelo k záměnám.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Orientační ceny:</strong> Ceny odpovídají údajům z partnerského zdroje v okamžiku načtení. Závaznou konečnou cenu vždy potvrzuje prodejce.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Podmínky tarifů a zavazadel:</strong> Pravidla pro příruční i odbavená zavazadla určuje konkrétní dopravce a najdete je v detailu rezervace na Pelikán.cz.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Operator Details */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-slate-700" />
                Provozovatel a partneři
              </h2>
              <div className="space-y-3 text-sm text-slate-600">
                <div>
                  <div className="font-semibold text-slate-900">Provozovatel portálu:</div>
                  <div>Akcni-letenky.com (informační a affiliate portál)</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Kontaktní e-mail:</div>
                  <div className="text-blue-600">info@akcni-letenky.com</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Affiliate partner pro vyhledávání a prodej:</div>
                  <div className="text-slate-700">Pelikan Slovakia s.r.o., IČO: 35897821 (akreditovaný IATA prodejce letenek)</div>
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
                Máte tip na akční letenku, podnět k článku nebo dotaz? Zprávy zpracováváme v pracovních dnech.
              </p>

              {sent ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                  <h3 className="font-bold text-emerald-900 mb-1">Zpráva byla úspěšně odeslána!</h3>
                  <p className="text-xs text-emerald-700 mb-4">Děkujeme za vaši zprávu. Ozveme se vám zpět.</p>
                  <Button variant="outline" size="sm" onClick={() => setSent(false)}>
                    Odeslat další zprávu
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Honeypot hidden input for bot protection */}
                  <input
                    type="text"
                    name="website_hp"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    style={{ display: "none" }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

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

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="gdprConsent"
                      checked={gdprConsent}
                      onChange={(e) => setGdprConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="gdprConsent" className="text-xs text-slate-600">
                      Souhlasím se zpracováním osobních údajů (jméno a e-mail) za účelem vyřízení tohoto dotazu.
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={contactMutation.isPending}
                    className="w-full bg-[#1565C0] hover:bg-[#0d47a1] text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    {contactMutation.isPending ? (
                      "Odesílám..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Odeslat zprávu
                      </>
                    )}
                  </Button>
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