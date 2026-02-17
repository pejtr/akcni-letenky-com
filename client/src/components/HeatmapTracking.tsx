import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

/**
 * HeatmapTracking Component
 * 
 * Dynamically loads heatmap tracking scripts (Hotjar or Microsoft Clarity)
 * based on admin settings and GDPR consent.
 * 
 * Only loads if:
 * 1. User has consented to analytics cookies
 * 2. Admin has configured a tracking ID
 */
export function HeatmapTracking() {
  const { data: hotjarId } = trpc.siteSettings.get.useQuery({ key: "hotjar_id" });
  const { data: clarityId } = trpc.siteSettings.get.useQuery({ key: "clarity_id" });

  useEffect(() => {
    // Check GDPR consent for analytics
    const consent = localStorage.getItem("gdpr_consent");
    if (!consent) return;

    let consentData: { analytics?: boolean } = {};
    try {
      consentData = JSON.parse(consent);
    } catch {
      return;
    }

    if (!consentData.analytics) return;

    // Load Hotjar if configured
    if (hotjarId?.value) {
      loadHotjar(hotjarId.value);
    }

    // Load Microsoft Clarity if configured
    if (clarityId?.value) {
      loadClarity(clarityId.value);
    }
  }, [hotjarId, clarityId]);

  return null;
}

/**
 * Load Hotjar tracking script
 */
function loadHotjar(siteId: string) {
  if (typeof window === "undefined") return;
  if ((window as any).hj) return; // Already loaded

  (function (h: any, o: any, t: any, j: any, a?: any, r?: any) {
    h.hj =
      h.hj ||
      function () {
        (h.hj.q = h.hj.q || []).push(arguments);
      };
    h._hjSettings = { hjid: parseInt(siteId), hjsv: 6 };
    a = o.getElementsByTagName("head")[0];
    r = o.createElement("script");
    r.async = 1;
    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
    a.appendChild(r);
  })(window, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");

  console.log("[Hotjar] Tracking initialized with site ID:", siteId);
}

/**
 * Load Microsoft Clarity tracking script
 */
function loadClarity(projectId: string) {
  if (typeof window === "undefined") return;
  if ((window as any).clarity) return; // Already loaded

  (function (c: any, l: any, a: any, r: any, i: any, t?: any, y?: any) {
    c[a] =
      c[a] ||
      function () {
        (c[a].q = c[a].q || []).push(arguments);
      };
    t = l.createElement(r);
    t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", projectId);

  console.log("[Clarity] Tracking initialized with project ID:", projectId);
}
