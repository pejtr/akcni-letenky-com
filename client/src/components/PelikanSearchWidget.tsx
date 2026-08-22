import React, { useEffect } from "react";
import { Plane, Search } from "lucide-react";

interface PelikanSearchWidgetProps {
  departures?: string;
  arrivals?: string;
  className?: string;
}

export default function PelikanSearchWidget({
  departures = "",
  arrivals = "",
  className = "",
}: PelikanSearchWidgetProps) {
  useEffect(() => {
    // Dynamically load Pelikán affiliate script if not already present
    const existingScript = document.querySelector(
      'script[src="https://cdn.pelikan.sk/app/affiliate-flights/app.min.js"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://cdn.pelikan.sk/app/affiliate-flights/app.min.js";
      script.async = true;
      script.defer = true;
      script.type = "application/javascript";
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className={`bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200/80 my-8 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
          <Search className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
            Vyhledávač Akčních Letenek Pelikán.cz
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Porovnání stovek aerolinek v reálném čase s garancí nejnižší ceny.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-slate-50 border border-slate-200 p-2 min-h-[140px]">
        {/* @ts-ignore custom element */}
        <peli-affiliate-flights
          id="peli-affiliate-flights"
          a_aid="levne-letenky"
          a_bid=""
          cssurl="https://cdn.pelikan.sk/app/affiliate-flights/default.min.css"
          logo=""
          market="cz"
          language="cz"
          backgroundcolor=""
          departures={departures}
          arrivals={arrivals}
        />
      </div>
    </div>
  );
}
