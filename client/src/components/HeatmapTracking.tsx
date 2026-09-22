import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { readConsent, subscribeConsent } from "@/lib/consent";

export function HeatmapTracking() {
  const [allowed, setAllowed] = useState(readConsent()?.analytics === true);
  const { data: hotjarId } = trpc.siteSettings.get.useQuery({ key: "hotjar_id" });
  const { data: clarityId } = trpc.siteSettings.get.useQuery({ key: "clarity_id" });

  useEffect(() => subscribeConsent((prefs) => setAllowed(prefs?.analytics === true)), []);
  useEffect(() => {
    if (!allowed) return;
    if (hotjarId?.value) loadHotjar(hotjarId.value);
    if (clarityId?.value) loadClarity(clarityId.value);
  }, [allowed, hotjarId?.value, clarityId?.value]);
  return null;
}
function loadHotjar(siteId: string) {
  if (typeof window === "undefined" || (window as any).hj) return;
  (function(h:any,o:any,t:any,j:any,a?:any,r?:any){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:Number.parseInt(siteId,10),hjsv:6};a=o.getElementsByTagName("head")[0];r=o.createElement("script");r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r)})(window,document,"https://static.hotjar.com/c/hotjar-",".js?sv=");
}
function loadClarity(projectId: string) {
  if (typeof window === "undefined" || (window as any).clarity) return;
  (function(c:any,l:any,a:any,r:any,i:any,t?:any,y?:any){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+encodeURIComponent(i);y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script",projectId);
}
