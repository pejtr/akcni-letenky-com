import { CreditCard, ExternalLink, ShieldCheck } from "lucide-react";
import { useConversionTracking } from "@/hooks/useConversionTracking";

const affiliateUrl = import.meta.env.VITE_REVOLUT_AFFILIATE_URL?.trim() ?? "";

function isSafeAffiliateUrl(value: string): boolean {
  if (!value) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export default function RevolutTravelMoneyCard() {
  const { trackAffiliateClick } = useConversionTracking();

  if (!isSafeAffiliateUrl(affiliateUrl)) return null;

  return (
    <section className="py-7 bg-white" aria-label="Partnerská nabídka pro cestovatele">
      <div className="container">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 to-slate-800 p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
                <CreditCard className="h-4 w-4" />
                Travel money · partner
              </div>
              <h2 className="text-2xl md:text-3xl font-black">Peníze na cestu připravené před odletem</h2>
              <p className="mt-3 text-sm md:text-base leading-relaxed text-slate-300">
                Podívejte se na aktuální nabídku Revolut pro cestovatele. Konkrétní podmínky,
                dostupnost a případná zvýhodnění vždy ověřte na stránce Revolutu.
              </p>
            </div>
            <div className="shrink-0">
              <a
                href={affiliateUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                onClick={() => trackAffiliateClick("travel_money", undefined, "revolut")}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-slate-950 transition hover:bg-sky-100"
              >
                Zobrazit nabídku Revolut <ExternalLink className="h-4 w-4" />
              </a>
              <p className="mt-2 flex items-center justify-end gap-1 text-[11px] text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Partnerský odkaz · nabídka se může měnit
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
