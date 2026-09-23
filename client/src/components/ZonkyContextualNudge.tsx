import { useEffect, useMemo, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { useLocation } from "wouter";

const AFFILIATE_ID = "w5xssm4v";
const ZONKY_GENERAL_URL = "https://www.zonky.cz/pujcka-od-zonky/";

const ELIGIBLE_ROUTES = [
  "/",
  "/levne-letenky",
  "/last-minute",
  "/letenky",
  "/dovolene",
  "/hlidac-cen",
  "/porovnani-cen",
  "/tipy-pro-cestovatele",
  "/dubaj",
  "/bali",
  "/new-york",
];

function normalizePath(path: string): string {
  return path
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 36) || "home";
}

function buildAffiliateUrl(path: string): string {
  const url = new URL(ZONKY_GENERAL_URL);
  url.searchParams.set("a_box", AFFILIATE_ID);
  url.searchParams.set(
    "a_cha",
    `akcni_${normalizePath(path)}_behavior`.slice(0, 63),
  );
  return url.toString();
}

export default function ZonkyContextualNudge() {
  const [location] = useLocation();
  const [visible, setVisible] = useState(false);
  const [shownOnce, setShownOnce] = useState(false);
  const [timeReady, setTimeReady] = useState(false);
  const [scrollReady, setScrollReady] = useState(false);

  const eligible = useMemo(
    () =>
      ELIGIBLE_ROUTES.includes(location) ||
      location.startsWith("/letenky-do-") ||
      location.startsWith("/tipy-pro-cestovatele/"),
    [location],
  );

  const destinationUrl = useMemo(() => buildAffiliateUrl(location), [location]);

  useEffect(() => {
    if (!eligible || shownOnce) return;

    setTimeReady(false);
    setScrollReady(false);

    const timer = window.setTimeout(() => setTimeReady(true), 20_000);

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = Math.max(1, doc.scrollHeight - window.innerHeight);
      if (window.scrollY / scrollable >= 0.35) {
        setScrollReady(true);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [eligible, location, shownOnce]);

  useEffect(() => {
    if (!eligible || shownOnce || !timeReady || !scrollReady) return;
    setVisible(true);
    setShownOnce(true);
  }, [eligible, scrollReady, shownOnce, timeReady]);

  if (!visible) return null;

  return (
    <aside
      className="fixed bottom-4 right-4 z-[70] w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-orange-200 bg-white p-4 shadow-2xl"
      aria-label="Partnerská nabídka financování"
    >
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-3 top-3 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Zavřít nabídku"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="pr-7">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
          Partnerská nabídka
        </div>
        <h3 className="text-base font-black text-slate-950">
          Řešíte rozpočet na cestu?
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Podívejte se na aktuální možnosti financování u Zonky. Konkrétní
          podmínky a dostupnost vždy ověřte přímo na stránce Zonky.
        </p>
      </div>

      <a
        href={destinationUrl}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
      >
        Zobrazit aktuální možnosti
        <ExternalLink className="h-4 w-4" />
      </a>

      <p className="mt-2 text-[10px] leading-snug text-slate-400">
        Reklamní sdělení · partnerský odkaz.
      </p>
    </aside>
  );
}
