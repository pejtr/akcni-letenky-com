/**
 * Omio Section Component
 * 
 * Displays train, bus, and ferry booking options via Omio affiliate program
 * 6% commission on all bookings
 */

import { Button } from "@/components/ui/button";
import { Train, Bus, Ship, ArrowRight, Clock, Zap } from "lucide-react";
import { generateOmioRouteLink, trackOmioClick, POPULAR_OMIO_ROUTES } from "@/lib/omioAffiliate";

export default function OmioSection() {
  const handleOmioClick = async (route: typeof POPULAR_OMIO_ROUTES[0]) => {
    await trackOmioClick(route.toCs, route.transportType, "homepage_section");
    
    const affiliateLink = generateOmioRouteLink(route.from, route.to);
    window.open(affiliateLink, "_blank", "noopener,noreferrer");
  };

  const getTransportIcon = (type: "train" | "bus" | "ferry") => {
    switch (type) {
      case "train":
        return <Train className="w-5 h-5" />;
      case "bus":
        return <Bus className="w-5 h-5" />;
      case "ferry":
        return <Ship className="w-5 h-5" />;
    }
  };

  const getTransportLabel = (type: "train" | "bus" | "ferry") => {
    switch (type) {
      case "train":
        return "Vlak";
      case "bus":
        return "Autobus";
      case "ferry":
        return "Trajekt";
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-semibold">Nová možnost cestování</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Vlaky, Autobusy & Trajekty
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pohodlné cestování po Evropě vlakem nebo autobusem. Často levnější než letadlo!
          </p>
        </div>

        {/* Popular Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {POPULAR_OMIO_ROUTES.map((route, index) => (
            <button
              key={index}
              onClick={() => handleOmioClick(route)}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-xl transition-all group text-left"
            >
              {/* Transport Type Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-blue-600">
                  {getTransportIcon(route.transportType)}
                  <span className="text-sm font-semibold">
                    {getTransportLabel(route.transportType)}
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>

              {/* Route */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-bold text-gray-900">
                    {route.fromCs}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-xl font-bold text-gray-900">
                    {route.toCs}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{route.duration}</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  {route.price}
                </span>
                <span className="text-sm text-gray-500">
                  na osobu
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-3">
            Vyhledejte spojení po celé Evropě
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Porovnejte ceny vlaků, autobusů a trajektů od více než 1000 dopravců. 
            Rezervujte online a cestujte pohodlně.
          </p>
          <a
            href={`https://tp.media/r?marker=155221&trs=89558&p=2078&u=${encodeURIComponent("https://omio.com")}&campaign_id=91`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackOmioClick("všechny destinace", "all", "homepage_cta")}
          >
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-6 text-lg"
            >
              <Train className="w-5 h-5 mr-2" />
              Vyhledat spojení na Omio
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>
          <p className="text-xs text-blue-200 mt-4">
            ✓ Více než 100 000 tras  ✓ 12 jazyků  ✓ Nízké rezervační poplatky
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Train className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-bold mb-2">Ekologické cestování</h4>
            <p className="text-sm text-gray-600">
              Vlaky a autobusy produkují až 90% méně CO₂ než letadla
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-bold mb-2">Bez čekání na letišti</h4>
            <p className="text-sm text-gray-600">
              Přijeďte 15 minut před odjezdem, žádné bezpečnostní kontroly
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <h4 className="font-bold mb-2">Centrum do centra</h4>
            <p className="text-sm text-gray-600">
              Nádraží jsou v centru měst, ušetříte čas i peníze za dopravu
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
