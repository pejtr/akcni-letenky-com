import { useCallback, useEffect, useState } from "react";
import { Cookie, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { OPEN_CONSENT_EVENT, readConsent, saveConsent } from "@/lib/consent";

function loadGoogleAnalytics(measurementId: string) {
  if (!measurementId || typeof window === "undefined") return;
  const win = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
  if (!win.gtag) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
    win.dataLayer = win.dataLayer || [];
    win.gtag = (...args: unknown[]) => { win.dataLayer?.push(args); };
    win.gtag("js", new Date());
  }
  win.gtag?.("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  win.gtag?.("config", measurementId, { anonymize_ip: true });
}

function revokeLoadedTracking() {
  const win = window as Window & {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  };
  win.gtag?.("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  win.fbq?.("consent", "revoke");
}

export default function GdprConsentBanner() {
  const initial = readConsent();
  const [visible, setVisible] = useState(!initial);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(initial?.analytics ?? false);
  const [marketing, setMarketing] = useState(initial?.marketing ?? false);
  const { data: gaSetting } = trpc.siteSettings.get.useQuery({ key: "google_analytics_id" });

  useEffect(() => {
    if (initial?.analytics && gaSetting?.value) loadGoogleAnalytics(gaSetting.value);
    // initial consent is intentionally evaluated once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gaSetting?.value]);

  useEffect(() => {
    const open = () => {
      const current = readConsent();
      setAnalytics(current?.analytics ?? false);
      setMarketing(current?.marketing ?? false);
      setShowDetails(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open);
  }, []);

  const acceptAll = useCallback(() => {
    saveConsent({ analytics: true, marketing: true });
    if (gaSetting?.value) loadGoogleAnalytics(gaSetting.value);
    setVisible(false);
  }, [gaSetting?.value]);

  const acceptSelected = useCallback(() => {
    saveConsent({ analytics, marketing });
    if (analytics && gaSetting?.value) loadGoogleAnalytics(gaSetting.value);
    if (!analytics || !marketing) revokeLoadedTracking();
    setVisible(false);
  }, [analytics, marketing, gaSetting?.value]);

  const rejectAll = useCallback(() => {
    saveConsent({ analytics: false, marketing: false });
    revokeLoadedTracking();
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] p-3 sm:p-4">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50">
              <Cookie className="h-5 w-5 text-sky-700" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-black text-slate-950">Nastavení soukromí</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Nezbytné úložiště používáme pro fungování webu. Analytické a marketingové
                technologie spouštíme až podle vašeho výběru.
              </p>
            </div>
            <button type="button" onClick={rejectAll} className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Odmítnout volitelné cookies a zavřít">
              <X className="h-5 w-5" />
            </button>
          </div>

          {showDetails && (
            <div className="mt-5 space-y-3 border-t border-slate-200 pt-4">
              <label className="flex items-start gap-3 opacity-70">
                <input type="checkbox" checked disabled className="mt-1 h-4 w-4" />
                <span><span className="block text-sm font-bold text-slate-900">Nezbytné</span><span className="text-xs leading-5 text-slate-500">Základní funkce webu a bezpečnost. Nelze vypnout.</span></span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-1 h-4 w-4 accent-sky-700" />
                <span><span className="block text-sm font-bold text-slate-900">Analytika</span><span className="text-xs leading-5 text-slate-500">Měření používání webu, výkonu funnelu a behaviorální analýzy.</span></span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-1 h-4 w-4 accent-sky-700" />
                <span><span className="block text-sm font-bold text-slate-900">Marketing</span><span className="text-xs leading-5 text-slate-500">Meta Pixel a související reklamní měření.</span></span>
              </label>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button onClick={acceptAll} className="bg-[#0f5fc2] font-bold text-white hover:bg-[#0a4f9f]">Přijmout vše</Button>
            {showDetails ? (
              <Button onClick={acceptSelected} variant="outline" className="font-bold">Uložit výběr</Button>
            ) : (
              <Button onClick={() => setShowDetails(true)} variant="outline" className="font-bold">Upravit nastavení</Button>
            )}
            <button type="button" onClick={rejectAll} className="text-sm font-semibold text-slate-500 underline underline-offset-4 hover:text-slate-800">Odmítnout volitelné</button>
            <div className="ml-auto inline-flex items-center gap-1 text-xs text-slate-400"><Shield className="h-3.5 w-3.5" />Nastavení lze změnit v patičce</div>
          </div>
        </div>
      </div>
    </div>
  );
}
