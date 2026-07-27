import React from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Plane, Palmtree, Lightbulb, BookOpen, ArrowRight, Sparkles, Star } from "lucide-react";
import { pelikanDeepLink } from "@shared/affiliateLinks";

// Top curated Pelikán flights for sidebar (Default + Destination Specific)
const DESTINATION_FLIGHTS: Record<string, Array<{ id: string; title: string; price: number; imageUrl: string; path: string }>> = {
  italy: [
    {
      id: "side-fl-it-1",
      title: "Řím z Prahy",
      price: 890,
      imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80",
      path: "/cs/akcni-letenky/praha/rim",
    },
    {
      id: "side-fl-it-2",
      title: "Neapol z Prahy",
      price: 990,
      imageUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&q=80",
      path: "/cs/akcni-letenky/praha/neapol",
    },
    {
      id: "side-fl-it-3",
      title: "Cagliari (Sardinie) z Prahy",
      price: 1290,
      imageUrl: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&q=80",
      path: "/cs/akcni-letenky/praha/cagliari",
    },
    {
      id: "side-fl-it-4",
      title: "Catania (Sicílie) z Prahy",
      price: 1190,
      imageUrl: "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=400&q=80",
      path: "/cs/akcni-letenky/praha/catania",
    },
  ],
  default: [
    {
      id: "side-fl-1",
      title: "Paříž z Prahy",
      price: 1150,
      imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80",
      path: "/cs/akcni-letenky/praha/pariz",
    },
    {
      id: "side-fl-2",
      title: "Londýn z Prahy",
      price: 790,
      imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80",
      path: "/cs/akcni-letenky/praha/londyn",
    },
    {
      id: "side-fl-3",
      title: "Dubaj z Prahy",
      price: 6990,
      imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80",
      path: "/cs/akcni-letenky/praha/dubaj",
    },
  ],
};

// Top curated Pelikán vacations for sidebar
const DESTINATION_VACATIONS: Record<string, Array<{ id: string; title: string; price: number; imageUrl: string; path: string }>> = {
  italy: [
    {
      id: "side-vac-it-1",
      title: "Sardinie Resort All Inclusive",
      price: 14890,
      imageUrl: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&q=80",
      path: "https://www.pelikan.cz/cs/pobyt/sardinie-dovolena",
    },
    {
      id: "side-vac-it-2",
      title: "Ischia Wellness & Termální lázně",
      price: 12490,
      imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80",
      path: "https://www.pelikan.cz/cs/pobyt/ischia-dovolena",
    },
  ],
  default: [
    {
      id: "side-vac-1",
      title: "Maledivy Resort All Inclusive",
      price: 32890,
      imageUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80",
      path: "https://www.pelikan.cz/cs/pobyt/maledivy-all-inclusive",
    },
    {
      id: "side-vac-2",
      title: "Řecko Rhodos ★★★★★",
      price: 15790,
      imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80",
      path: "https://www.pelikan.cz/cs/pobyt/rhodos-dovolena",
    },
  ],
};

export default function ArticleSidebar({ currentSlug }: { currentSlug?: string }) {
  const { data: recentArticles } = trpc.articles.recent.useQuery({ limit: 4 });
  const trackClick = trpc.affiliate.trackClick.useMutation();

  const isItaly = currentSlug && /italii|rim|rimske|neapol|sardinsk|catania|etnea|coperto|pecorino|gelato|vatikan/i.test(currentSlug);
  const flightDeals = isItaly ? DESTINATION_FLIGHTS.italy : DESTINATION_FLIGHTS.default;
  const vacationDeals = isItaly ? DESTINATION_VACATIONS.italy : DESTINATION_VACATIONS.default;

  const handleSidebarClick = (destination: string, url: string) => {
    trackClick.mutate({
      destination,
      destinationSlug: destination.toLowerCase(),
      source: "article-right-sidebar",
      affiliatePartner: "pelikan",
      affiliateUrl: url,
    });
  };

  return (
    <aside className="space-y-6 sticky top-24">
      {/* 1. TOP Letenky Widget */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-md">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
            <Plane className="w-4 h-4" />
          </span>
          <h3 className="font-black text-gray-900 text-base">🔥 TOP Akční Letenky</h3>
        </div>

        <div className="space-y-3">
          {flightDeals.map((fl) => {
            const url = pelikanDeepLink(fl.path, { campaign: "sidebar-top-flights", content: fl.id });
            return (
              <a
                key={fl.id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleSidebarClick(fl.title, url)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50/80 transition-colors group"
              >
                <img
                  src={fl.imageUrl}
                  alt={fl.title}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {fl.title}
                  </h4>
                  <p className="text-[11px] text-gray-500">Zpáteční z Prahy</p>
                  <span className="text-sm font-black text-[#FF6B00]">
                    od {fl.price.toLocaleString("cs-CZ")} Kč
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </a>
            );
          })}
        </div>

        <Link href="/letenky">
          <a className="mt-4 block text-center text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
            Všechny akční letenky →
          </a>
        </Link>
      </div>

      {/* 2. TOP Dovolené Widget */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-md">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <span className="p-1.5 bg-orange-100 text-orange-700 rounded-lg">
            <Palmtree className="w-4 h-4" />
          </span>
          <h3 className="font-black text-gray-900 text-base">🏖️ TOP Dovolené</h3>
        </div>

        <div className="space-y-3">
          {vacationDeals.map((vac) => {
            const url = pelikanDeepLink(vac.path, { campaign: "sidebar-top-vacations", content: vac.id });
            return (
              <a
                key={vac.id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleSidebarClick(vac.title, url)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-orange-50/80 transition-colors group"
              >
                <img
                  src={vac.imageUrl}
                  alt={vac.title}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-gray-800 line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {vac.title}
                  </h4>
                  <p className="text-[11px] text-emerald-600 font-semibold">✓ Ubytování + Strava</p>
                  <span className="text-sm font-black text-[#FF6B00]">
                    od {vac.price.toLocaleString("cs-CZ")} Kč
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </a>
            );
          })}
        </div>

        <Link href="/dovolene">
          <a className="mt-4 block text-center text-xs font-bold text-orange-600 hover:text-orange-800 hover:underline">
            Všechny nabízené dovolené →
          </a>
        </Link>
      </div>

      {/* 3. Tipy pro Cestovatele Widget */}
      <div className="bg-gradient-to-br from-[#1a5276] to-[#2980b9] text-white rounded-2xl p-5 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-yellow-300" />
          <h3 className="font-black text-base text-white">💡 Praktické tipy</h3>
        </div>
        <p className="text-xs text-white/90 mb-4 leading-relaxed">
          Ušetřete až 50% při rezervaci letenek díky našim prověřeným návodům.
        </p>
        <ul className="space-y-2 text-xs mb-4">
          <li className="flex items-center gap-1.5">
            <span className="text-yellow-300">✓</span> Kdy rezervovat nejlevnější letenky
          </li>
          <li className="flex items-center gap-1.5">
            <span className="text-yellow-300">✓</span> Jak na kabinové zavazadlo bez poplatku
          </li>
          <li className="flex items-center gap-1.5">
            <span className="text-yellow-300">✓</span> Triky pro anonymní vyhledávání
          </li>
        </ul>
        <Link href="/tipy-pro-cestovatele">
          <a className="block w-full bg-[#E91E63] hover:bg-[#c2185b] text-white text-center font-bold py-2.5 rounded-xl text-xs shadow transition-colors">
            Zobrazit cestovatelské tipy →
          </a>
        </Link>
      </div>

      {/* 4. Články z Blogu Widget */}
      {recentArticles && recentArticles.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-md">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <span className="p-1.5 bg-pink-100 text-pink-700 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </span>
            <h3 className="font-black text-gray-900 text-base">📰 Nejnovější články</h3>
          </div>

          <div className="space-y-3">
            {recentArticles
              .filter((a) => a.slug !== currentSlug)
              .slice(0, 3)
              .map((art) => (
                <Link key={art.id} href={`/blog/${art.slug}`}>
                  <a className="block p-2 rounded-xl hover:bg-gray-50 transition-colors group">
                    <h4 className="font-bold text-xs text-gray-800 line-clamp-2 group-hover:text-pink-600 transition-colors mb-1">
                      {art.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 line-clamp-1">{art.excerpt}</p>
                  </a>
                </Link>
              ))}
          </div>

          <Link href="/blog">
            <a className="mt-4 block text-center text-xs font-bold text-pink-600 hover:text-pink-800 hover:underline">
              Více článků na blogu →
            </a>
          </Link>
        </div>
      )}
    </aside>
  );
}
