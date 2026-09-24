import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Compass,
  Mail,
  MapPin,
  Plane,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import OmniContextAd from "@/components/OmniContextAd";
import { trpc } from "@/lib/trpc";
import { readConsent, subscribeConsent } from "@/lib/consent";

function formatPrice(value: number) {
  return new Intl.NumberFormat("cs-CZ").format(value) + " Kč";
}

function getSessionId() {
  if (typeof window === "undefined") return "server";
  const key = "home_v2_session";
  const current = sessionStorage.getItem(key);
  if (current) return current;
  const next = "home_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
  sessionStorage.setItem(key, next);
  return next;
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState<"idle" | "success" | "error">("idle");
  const [analyticsAllowed, setAnalyticsAllowed] = useState(readConsent()?.analytics === true);
  const pageViewTracked = useRef(false);

  const flightsQuery = trpc.pelikan.getFlights.useQuery({
    limit: 12,
    sortBy: "price_asc",
  });
  const subscribe = trpc.newsletter.subscribe.useMutation();
  const trackEvent = trpc.conversionFunnel.trackEvent.useMutation();

  useEffect(() => subscribeConsent((preferences) => {
    setAnalyticsAllowed(preferences?.analytics === true);
  }), []);

  useEffect(() => {
    if (!analyticsAllowed || pageViewTracked.current) return;
    pageViewTracked.current = true;
    trackEvent.mutate({
      sessionId: getSessionId(),
      eventType: "page_visit",
      page: "/",
      metadata: { version: "deal-radar-v2" },
    });
  }, [analyticsAllowed, trackEvent]);

  const deals = useMemo(
    () =>
      (flightsQuery.data ?? [])
        .filter(
          (flight) =>
            Number.isFinite(flight.salePrice) &&
            flight.salePrice > 0 &&
            Boolean(flight.destination?.trim()) &&
            Boolean(flight.imageUrl?.trim()),
        )
        .slice(0, 6),
    [flightsQuery.data],
  );

  const record = (eventType: string, metadata?: Record<string, unknown>) => {
    if (!analyticsAllowed) return;
    trackEvent.mutate({
      sessionId: getSessionId(),
      eventType,
      page: "/",
      metadata,
    });
  };

  const handleNewsletter = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewsletterState("idle");
    try {
      await subscribe.mutateAsync({ email: email.trim() });
      setNewsletterState("success");
      setEmail("");
      record("newsletter_signup", { source: "zippy_drop" });
    } catch {
      setNewsletterState("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-slate-950">
      <SEO
        title="Akční letenky, které stojí za to"
        description="Přehled akčních letenek a cestovatelských tipů. Ceny a dostupnost zobrazujeme z partnerských dat a finálně je ověříte u prodejce."
        canonical="https://www.akcni-letenky.com/"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Domů",
                item: "https://www.akcni-letenky.com/",
              },
            ],
          },
        ]}
      />

      <Navigation />

      <main>
        <section className="relative overflow-hidden bg-[#071526] pt-28 text-white">
          <div className="absolute inset-0 opacity-70 [background:radial-gradient(circle_at_78%_22%,rgba(14,165,233,.28),transparent_32%),radial-gradient(circle_at_18%_82%,rgba(250,204,21,.11),transparent_28%)]" />
          <div className="container relative py-16 md:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
              <div className="max-w-3xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-200">
                  <Sparkles className="h-4 w-4" />
                  AKČNÍ ZUZKA · virtuální průvodkyně
                </div>
                <h1 className="max-w-[13ch] text-4xl font-black leading-[1.04] tracking-[-0.04em] sm:text-5xl md:text-7xl">
                  Akční letenky, které stojí za to.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                  Akční Zuzka vám představuje zajímavé nálezy z našeho deal radaru.
                  ZIPPY je může doručit do e-mailu. Konečnou cenu i dostupnost vždy
                  ověříte přímo u prodejce.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#dnesni-akce"
                    onClick={() => record("engagement", { action: "hero_deals_click" })}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-300 px-6 py-3 text-sm font-black text-slate-950 shadow-lg shadow-amber-300/10 transition hover:bg-amber-200"
                  >
                    Dnešní akce
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <Link
                    href="/letenky"
                    onClick={() => record("search", { action: "hero_search_click" })}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    <Search className="h-4 w-4" />
                    Hledat konkrétní let
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Nabídky z partnerských dat
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Rezervace probíhá u prodejce
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-300" />
                    Hlídač cen zdarma
                  </span>
                </div>
              </div>

              <div id="akcni-zuzka" className="relative mx-auto w-full max-w-lg scroll-mt-24">
                <div className="absolute -inset-8 rounded-full bg-sky-400/10 blur-3xl" />
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
                  <div className="relative h-[540px] overflow-hidden sm:h-[590px]">
                    <img
                      src="/brand/akcni-zuzka-promo.webp"
                      alt="Akční Zuzka, virtuální průvodkyně Akční-Letenky.com"
                      className="absolute inset-y-0 left-[-4%] h-full w-[185%] max-w-none object-cover object-left"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#071526] via-[#071526]/10 to-transparent" />
                    <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/65 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white backdrop-blur">
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      Akční Zuzka
                    </div>

                    <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-[#071526]/90 p-5 shadow-xl backdrop-blur-md">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-200">
                            Zuzka doporučuje
                          </p>
                          <p className="mt-1 text-sm text-slate-300">
                            Aktuální nabídka z partnerského feedu
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          live
                        </span>
                      </div>

                      {deals[0] ? (
                        <a
                          href={"/go/pelikan/" + encodeURIComponent(deals[0].id) + "?vertical=flight&placement=home_zuzka_featured"}
                          target="_blank"
                          rel="sponsored noopener noreferrer"
                          onClick={() =>
                            record("affiliate_click", {
                              action: "zuzka_featured_click",
                              dealId: deals[0].id,
                              destination: deals[0].destination,
                              price: deals[0].salePrice,
                            })
                          }
                          className="mt-4 flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.06] p-4 transition hover:border-sky-300/40 hover:bg-white/[0.1]"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-300/10 text-sky-200">
                            <Plane className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-black text-white">
                              {deals[0].departure || "Odlet"} → {deals[0].destination}
                            </div>
                            <div className="mt-1 text-xs text-slate-400">
                              Cena a dostupnost se ověří u partnera
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-black text-amber-300">
                              {formatPrice(deals[0].salePrice)}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-400">ověřit →</div>
                          </div>
                        </a>
                      ) : (
                        <Link
                          href="/letenky"
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white hover:bg-white/[0.1]"
                        >
                          Prohlédnout letenky
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                  Akční Zuzka je virtuální průvodkyně značky Akční-Letenky.com.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Doporučení z naší sítě" className="border-b border-slate-200 bg-white">
          <OmniContextAd
            placement="home_after_hero"
            context={{ topic: "travel", intent: "inspiration", route: "/" }}
            variant="billboard"
          />
        </section>

        <section id="dnesni-akce" className="scroll-mt-24 py-16 md:py-20">
          <div className="container">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-extrabold text-sky-700">
                  <Sparkles className="h-4 w-4" />
                  Akční Zuzka doporučuje
                </div>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950 md:text-4xl">
                  Dnešní výběr letenek
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                  Zobrazujeme pouze karty s platnou cenou, destinací a obrázkem. Konečnou
                  dostupnost vždy potvrzuje partner.
                </p>
              </div>
              <Link
                href="/letenky"
                className="inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-900"
              >
                Všechny letenky
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {deals.map((deal) => (
                <article
                  key={deal.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_50px_-30px_rgba(15,23,42,.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_-28px_rgba(15,23,42,.42)]"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-200">
                    <img
                      src={deal.imageUrl}
                      alt={deal.destination}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/5 to-transparent" />
                    <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-slate-950/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
                      Akční letenka
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                        <MapPin className="h-3.5 w-3.5" />
                        {deal.country || "Destinace"}
                      </div>
                      <h3 className="mt-1 text-2xl font-black text-white">{deal.destination}</h3>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                          {deal.departure ? "Odlet: " + deal.departure : "Partnerská nabídka"}
                        </p>
                        <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                          {formatPrice(deal.salePrice)}
                        </p>
                      </div>
                      <Plane className="mt-1 h-5 w-5 text-sky-600" />
                    </div>

                    <a
                      href={"/go/pelikan/" + encodeURIComponent(deal.id) + "?vertical=flight&placement=home_deal_card"}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      onClick={() =>
                        record("affiliate_click", {
                          action: "deal_card_click",
                          dealId: deal.id,
                          destination: deal.destination,
                          price: deal.salePrice,
                        })
                      }
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f5fc2] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#0a4f9f]"
                    >
                      Ověřit cenu u partnera
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <p className="mt-3 text-center text-[11px] leading-4 text-slate-500">
                      Cena a dostupnost se mohou změnit. Rezervaci dokončíte mimo Akční-Letenky.com.
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {flightsQuery.isError && (
              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                Aktuální feed se nepodařilo načíst. Žádné náhradní nebo smyšlené ceny
                nezobrazujeme.
              </div>
            )}
          </div>
        </section>

        <section aria-label="Kontextové doporučení" className="pb-16 md:pb-20">
          <div className="container">
            <OmniContextAd
              placement="home_after_deals"
              context={{ topic: "travel", intent: "package", route: "/" }}
              variant="native"
              excludeCampaignIds={["do-italie-travel-inspiration-v1"]}
            />
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-16 md:py-20">
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-amber-900">
                  <Sparkles className="h-4 w-4" />
                  ZIPPY · pomocník Akční Zuzky
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] md:text-4xl">
                  Kam chcete zmizet?
                </h2>
                <p className="mt-3 max-w-xl leading-7 text-slate-600">
                  Nemusíte znát přesnou trasu. Vyberte typ cesty a pokračujte do relevantního
                  přehledu bez dalšího přeplněného formuláře.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { href: "/letenky", title: "City break", copy: "Evropa a krátké výlety", icon: Compass },
                  { href: "/dovolene", title: "Za sluncem", copy: "Moře, pobyty a dovolené", icon: Sparkles },
                  { href: "/hlidac-cen", title: "Počkám na cenu", copy: "Nastavit hlídač cen", icon: Bell },
                  { href: "/tipy-pro-cestovatele", title: "Potřebuji inspiraci", copy: "Průvodci a cestovní tipy", icon: MapPin },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={() => record("intent_select", { intent: item.title })}
                      className="group rounded-2xl border border-slate-200 bg-[#f8fbff] p-5 transition hover:border-sky-300 hover:bg-sky-50"
                    >
                      <Icon className="h-5 w-5 text-sky-700" />
                      <div className="mt-4 font-black text-slate-950">{item.title}</div>
                      <div className="mt-1 text-sm text-slate-600">{item.copy}</div>
                      <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-sky-700">
                        Pokračovat <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#071526] py-16 text-white md:py-20">
          <div className="container">
            <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.06] p-7 md:p-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 text-sm font-extrabold text-amber-300">
                    <Mail className="h-4 w-4" />
                    ZIPPY DROP · od Akční Zuzky
                  </div>
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.03em]">
                    Nechte si zajímavé letenky doručit.
                  </h2>
                  <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                    Občas pošleme nový výběr akčních letenek a praktické tipy. Bez
                    vymyšlených slev a bez zbytečného spamu.
                  </p>
                </div>

                <div className="w-full lg:w-[360px]">
                  {newsletterState === "success" ? (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-sm font-semibold text-emerald-200">
                      Hotovo. Další zajímavý výběr vám může přistát rovnou v e-mailu.
                    </div>
                  ) : (
                    <form onSubmit={handleNewsletter} className="space-y-3">
                      <label htmlFor="zippy-drop-email" className="sr-only">
                        E-mail pro ZIPPY Drop
                      </label>
                      <input
                        id="zippy-drop-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        autoComplete="email"
                        placeholder="vas@email.cz"
                        className="h-12 w-full rounded-xl border border-white/15 bg-slate-950/45 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300/60 focus:ring-2 focus:ring-sky-300/15"
                      />
                      <button
                        type="submit"
                        disabled={subscribe.isPending}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 text-sm font-black text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {subscribe.isPending ? "Ukládám…" : "Chci ZIPPY Drop"}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <p className="text-xs leading-5 text-slate-500">
                        Odběr můžete kdykoli zrušit.
                      </p>
                    </form>
                  )}
                  {newsletterState === "error" && (
                    <p className="mt-2 text-xs text-rose-300" role="alert">
                      E-mail se nepodařilo uložit. Zkuste to prosím znovu.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-black tracking-[-0.03em] md:text-4xl">
                Jak Akční Letenky fungují
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                Nejsme rezervační kancelář. Pomáháme s objevováním nabídek a předáváme vás
                na web prodejce, kde vidíte finální podmínky.
              </p>
            </div>

            <div className="mt-9 grid gap-5 md:grid-cols-3">
              {[
                {
                  icon: Radar,
                  title: "1. Systém třídí",
                  copy: "Z partnerských dat vybíráme použitelné nabídky s cenou, destinací a platným cílem.",
                },
                {
                  icon: Search,
                  title: "2. Vy si vyberete",
                  copy: "Projdete přehled nebo použijete vyhledávání podle vlastní trasy.",
                },
                {
                  icon: ShieldCheck,
                  title: "3. Partner potvrdí",
                  copy: "Finální cenu, dostupnost, storno a podmínky potvrzuje konkrétní prodejce.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-black">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.copy}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white py-14">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl font-black tracking-[-0.02em]">
                Akční letenky bez zbytečného chaosu
              </h2>
              <div className="mt-4 grid gap-6 text-sm leading-7 text-slate-600 md:grid-cols-2">
                <p>
                  Akční-Letenky.com je nezávislá discovery vrstva pro české cestovatele.
                  Nabídky neprodáváme vlastním checkoutem; po výběru vás předáme partnerovi,
                  který potvrdí cenu a dokončí rezervaci.
                </p>
                <p>
                  Pro konkrétní trasu pokračujte do{" "}
                  <Link href="/letenky" className="font-bold text-sky-700 hover:underline">
                    přehledu letenek
                  </Link>
                  . Pokud nechcete cenu kontrolovat ručně, můžete si nastavit{" "}
                  <Link href="/hlidac-cen" className="font-bold text-sky-700 hover:underline">
                    hlídač cen
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
