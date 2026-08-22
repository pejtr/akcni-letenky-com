import { ArrowRight, BadgeCheck, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { PRIMARY_PELIKAN_OFFERS } from "@shared/pelikanOffers";

export default function PelikanPrimaryDeals() {
  const trackClickMutation = trpc.affiliate.trackClick.useMutation();
  const offers = PRIMARY_PELIKAN_OFFERS.slice(0, 6);

  if (offers.length === 0) return null;

  const trackClick = (offer: (typeof offers)[number], source: string) => {
    trackClickMutation.mutate({
      destination: offer.destination,
      destinationSlug: offer.id,
      source,
      affiliatePartner: "pelikan",
      affiliateUrl: offer.url,
    });
  };

  return (
    <section className="bg-white py-5 md:py-12" aria-labelledby="pelikan-primary-deals">
      <div className="container">
        <div className="flex items-end justify-between gap-4 mb-4 md:mb-7">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-full px-3 py-1 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Pelikan.cz vybrane nabidky
            </div>
            <h2 id="pelikan-primary-deals" className="text-2xl md:text-3xl font-black text-[#003087] leading-tight">
              Maledivy, ktere prodavaji
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Kuratorovane Pelikan deeplinky s affiliate merenim.
            </p>
          </div>

          <a
            href={offers[0]?.url}
            target="_blank"
            rel="noopener"
            referrerPolicy="no-referrer-when-downgrade"
            onClick={() => offers[0] && trackClick(offers[0], "pelikan-primary-header")}
            className="hidden sm:inline-flex items-center gap-2 bg-[#E91E63] hover:bg-[#C2185B] text-white rounded-full px-5 py-2.5 font-bold text-sm shadow-sm"
          >
            Top nabidka <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="-mx-4 px-4 overflow-x-auto pb-3 md:mx-0 md:px-0 md:overflow-visible">
          <div className="flex gap-4 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-6">
            {offers.map((offer, index) => (
              <a
                key={offer.id}
                href={offer.url}
                target="_blank"
                rel="noopener"
                referrerPolicy="no-referrer-when-downgrade"
                onClick={() => trackClick(offer, "pelikan-primary-card")}
                className="snap-start shrink-0 w-[82vw] max-w-[340px] md:w-auto md:max-w-none bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={offer.imageUrl}
                    alt={offer.title}
                    width={900}
                    height={650}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={index === 0 ? "high" : "low"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  {index === 0 && (
                    <div className="absolute top-3 left-3 bg-[#FFD700] text-[#003087] rounded-full px-3 py-1 text-xs font-black shadow">
                      TOP SELL
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-xs font-semibold text-white/80">{offer.destination}</p>
                    <h3 className="font-black text-lg leading-tight line-clamp-2">{offer.title}</h3>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {offer.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="bg-blue-50 text-blue-700 rounded-full px-2 py-1 text-[11px] font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">{offer.subtitle}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                      <BadgeCheck className="w-4 h-4" />
                      Pelikan affiliate
                    </span>
                    <span className="inline-flex items-center gap-1 bg-[#E91E63] text-white rounded-full px-3 py-2 text-xs font-bold">
                      Zobrazit <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="https://www.pelikan.cz/cs/akcni-letenky"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#003087] hover:bg-[#002060] text-white font-black text-sm md:text-base px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            Zobrazit všechny exkluzivní nabídky na Pelikán.cz <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
