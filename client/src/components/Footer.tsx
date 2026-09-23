import { useState } from "react";
import { Link } from "wouter";
import { Bell, ExternalLink, Mail, Plane, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { openConsentSettings } from "@/lib/consent";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      setStatus("success");
      setEmail("");
    },
    onError: () => setStatus("error"),
  });

  return (
    <footer className="border-t border-slate-800 bg-[#07111f] py-14 text-slate-300">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr_.8fr_1.2fr]">
          <div>
            <Link href="/" className="inline-flex items-center">
              <img src="/logo-akcni-letenky.png" alt="Akční Letenky" className="h-10 w-auto brightness-0 invert" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
              Nezávislá discovery vrstva pro akční letenky a cestovatelské tipy.
              Akční Zuzka je virtuální průvodkyně značky; rezervace, platba a finální
              podmínky probíhají u konkrétního prodejce.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              Transparentní partnerský model
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-white">Objevovat</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/letenky" className="hover:text-white">Akční letenky</Link></li>
              <li><Link href="/dovolene" className="hover:text-white">Dovolené</Link></li>
              <li><Link href="/aerolinky" className="hover:text-white">Aerolinky</Link></li>
              <li><Link href="/tipy-pro-cestovatele" className="hover:text-white">Tipy pro cestovatele</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-white">Nástroje</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/hlidac-cen" className="inline-flex items-center gap-2 hover:text-white">
                  <Bell className="h-4 w-4" /> Hlídač cen
                </Link>
              </li>
              <li><Link href="/kalkulacka-zavazadel" className="hover:text-white">Kalkulačka zavazadel</Link></li>
              <li><Link href="/odskodneni-za-let" className="hover:text-white">Odškodnění za let</Link></li>
              <li><Link href="/o-nas" className="hover:text-white">O projektu a kontakt</Link></li>
            </ul>
          </div>

          <div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
              <div className="inline-flex items-center gap-2 text-sm font-black text-amber-300">
                <Mail className="h-4 w-4" />
                ZIPPY DROP · od Akční Zuzky
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Nové akční letenky a praktické tipy od naší virtuální průvodkyně rovnou do e-mailu.
              </p>

              {status === "success" ? (
                <p className="mt-4 rounded-xl bg-emerald-400/10 p-3 text-sm font-semibold text-emerald-200">
                  Odběr je aktivní.
                </p>
              ) : (
                <form
                  className="mt-4 space-y-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setStatus("idle");
                    subscribe.mutate({ email: email.trim() });
                  }}
                >
                  <label htmlFor="footer-zippy-email" className="sr-only">E-mail pro ZIPPY Drop</label>
                  <input
                    id="footer-zippy-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="vas@email.cz"
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400"
                  />
                  <button
                    type="submit"
                    disabled={subscribe.isPending}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 text-sm font-black text-white transition hover:bg-sky-400 disabled:opacity-60"
                  >
                    <Plane className="h-4 w-4" />
                    {subscribe.isPending ? "Ukládám…" : "Přihlásit odběr"}
                  </button>
                </form>
              )}
              {status === "error" && (
                <p className="mt-2 text-xs text-rose-300">Odběr se nepodařilo uložit. Zkuste to znovu.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-sky-300">Partner tip</p>
              <p className="mt-2 text-sm font-bold text-white">Řešíte někdy větší výdaj?</p>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                Podívejte se na aktuální možnosti financování přímo u Zonky. Konkrétní podmínky vždy stanovuje Zonky.
              </p>
            </div>
            <a
              href="https://www.zonky.cz/pujcka-od-zonky/?a_box=w5xssm4v&a_cha=akcni_letenky_footer"
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-sky-400/30 bg-sky-400/10 px-5 py-3 text-sm font-black text-sky-200 transition hover:bg-sky-400/20"
            >
              Aktuální nabídka Zonky <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">Partnerský odkaz</p>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Akční-Letenky.com</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p>
              Nabídky mohou obsahovat affiliate odkazy. Při rezervaci může provozovatel získat provizi
              bez navýšení ceny pro uživatele.
            </p>
            <button type="button" onClick={openConsentSettings} className="font-semibold text-slate-400 underline underline-offset-4 hover:text-white">
              Nastavení cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
