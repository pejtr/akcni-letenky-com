import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Calendar, User, ArrowRight, BookOpen, Plane, Lightbulb, TrendingDown, Shield, Star } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/Navigation";
import CountdownTimer from "@/components/CountdownTimer";
import { injectStructuredData, removeAllStructuredData, generateBreadcrumbSchema } from "@/lib/structuredData";
import { pelikanDeepLink } from "@shared/affiliateLinks";

const PELIKAN_LINK = pelikanDeepLink("/cs/akcni-letenky", {
  campaign: "travel-tips",
  channel: "tips-page",
});

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "jak-najit-levne-letenky-triky": <TrendingDown className="w-5 h-5" />,
  "nejlevnejsi-destinace-z-prahy": <Plane className="w-5 h-5" />,
  "cenovy-kalendar-letenek-jak-pouzivat": <Calendar className="w-5 h-5" />,
  "last-minute-letenky-myty-a-pravda": <Lightbulb className="w-5 h-5" />,
  "levne-letenky-pro-rodinu-pruvodce": <Star className="w-5 h-5" />,
  "vernostni-programy-aerolinek-jak-letat-zdarma": <BookOpen className="w-5 h-5" />,
  "prirucni-zavazadlo-zdarma-pravidla-aerolinek": <Shield className="w-5 h-5" />,
  "skryte-poplatky-letenky-jak-se-vyhnout": <Shield className="w-5 h-5" />,
};

const FEATURED_TIPS = [
  { icon: "💸", title: "Rezervujte v úterý", desc: "Nejnižší ceny letenek se objevují v úterý a středu" },
  { icon: "📅", title: "Flexibilní data", desc: "Posun odletu o 1–2 dny může ušetřit až 2 000 Kč" },
  { icon: "🔔", title: "Cenové alerty", desc: "Nastavte si upozornění na pokles ceny na Kiwi.com" },
  { icon: "🕵️", title: "Inkognito mód", desc: "Vždy hledejte v anonymním okně prohlížeče" },
  { icon: "✈️", title: "Alternativní letiště", desc: "Z Vídně nebo Bratislavy se někdy letí levněji" },
  { icon: "🧳", title: "Příruční zavazadlo", desc: "Ušetřete stovky Kč tím, že se vejdete do kabiny" },
];

export default function TipyCestovatele() {
  // Inject Schema.org JSON-LD for SEO
  useEffect(() => {
    removeAllStructuredData();
    // BreadcrumbList
    injectStructuredData(generateBreadcrumbSchema([
      { name: "Akční Letenky", url: "/" },
      { name: "Tipy pro cestovatele", url: "/tipy-pro-cestovatele" },
    ]));
    // CollectionPage schema for the tips listing
    injectStructuredData({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Tipy pro cestovatele | Akční Letenky",
      "description": "Průvodce levným cestováním: jak najít levné letenky, ušetřit na cestování a cestovat jako profík.",
      "url": "https://akcni-letenky.com/tipy-pro-cestovatele",
      "publisher": {
        "@type": "Organization",
        "name": "Akční Letenky",
        "url": "https://akcni-letenky.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://akcni-letenky.com/logo.png"
        }
      },
      "inLanguage": "cs",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Akční Letenky", "item": "https://akcni-letenky.com" },
          { "@type": "ListItem", "position": 2, "name": "Tipy pro cestovatele", "item": "https://akcni-letenky.com/tipy-pro-cestovatele" }
        ]
      }
    });
    return () => removeAllStructuredData();
  }, []);

  const { data: tipsArticles, isLoading: tipsLoading } = trpc.articles.byCategory.useQuery({
    category: "tips",
  });

  const { data: recentArticles, isLoading: recentLoading } = trpc.articles.recent.useQuery({
    limit: 3,
  });

  const isLoading = tipsLoading;
  const articles = tipsArticles ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#1a5276] to-[#2980b9] text-white py-16 pt-28">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <BookOpen className="w-4 h-4" />
            Průvodce levným cestováním
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Tipy pro cestovatele
          </h1>
          <p className="text-xl opacity-90 mb-2">
            Jak najít levné letenky, ušetřit na cestování a cestovat jako profík
          </p>
          <p className="text-lg opacity-75 max-w-2xl mx-auto">
            Prověřené tipy, triky a průvodce od zkušených cestovatelů. Ušetřete tisíce korun na každé cestě.
          </p>
          <div className="mt-6 flex justify-center">
            <CountdownTimer className="bg-white/20 px-4 py-2 rounded-full" />
          </div>
        </div>
      </section>

      {/* Quick Tips Banner */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="container">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            ⚡ Rychlé tipy pro okamžitou úsporu
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {FEATURED_TIPS.map((tip, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-4 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors"
              >
                <span className="text-3xl mb-2">{tip.icon}</span>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{tip.title}</h3>
                <p className="text-xs text-gray-500">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Articles Section */}
      <section className="py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Průvodci a tipy</h2>
              <p className="text-gray-500 mt-1">
                {articles.length > 0 ? `${articles.length} článků` : "Načítám články..."}
              </p>
            </div>
            <a
              href={PELIKAN_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 bg-[#E91E63] hover:bg-[#C2185B] text-white font-bold px-5 py-2.5 rounded-full text-sm shadow-lg transition-all hover:scale-105"
            >
              <Plane className="w-4 h-4" />
              Hledat letenky
            </a>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-32" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Card
                  key={article.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-0 shadow-md"
                >
                  {/* Featured Image */}
                  {article.featuredImage ? (
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-[#1a5276] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          Tip
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-sky-400" />
                    </div>
                  )}

                  <CardHeader className="pb-2">
                    <h3 className="font-bold text-gray-800 text-lg leading-snug line-clamp-2 group-hover:text-[#1a5276] transition-colors">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {article.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString("cs-CZ", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "Aktuální"}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-3">
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Link href={`/blog/${article.slug}`}>
                      <Button
                        variant="outline"
                        className="group/btn border-[#1a5276] text-[#1a5276] hover:bg-[#1a5276] hover:text-white transition-all"
                      >
                        Číst článek
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Články se načítají...
              </h3>
              <p className="text-gray-400 mb-6">
                Brzy zde najdete tipy a průvodce pro levné cestování.
              </p>
              <Link href="/">
                <Button>Zpět na hlavní stránku</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section — Kiwi.com */}
      <section className="py-12 bg-gradient-to-r from-[#1a5276] to-[#2980b9]">
        <div className="container text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Připraveni letět levně?</h2>
          <p className="text-lg opacity-85 mb-6 max-w-xl mx-auto">
            Využijte tipy z našich článků a najděte nejlevnější letenky na Kiwi.com — porovnání stovek aerolinek na jednom místě.
          </p>
          <a
            href={PELIKAN_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#E91E63] hover:bg-[#C2185B] text-white font-bold px-8 py-4 rounded-full text-lg shadow-xl transition-all hover:scale-105"
          >
            <Plane className="w-5 h-5" />
            Hledat levné letenky →
          </a>
          <p className="text-sm opacity-60 mt-3">
            Porovnání 700+ aerolinek · Bez skrytých poplatků · Cenový kalendář
          </p>
        </div>
      </section>

      {/* Related: Recent Blog Articles */}
      {!recentLoading && recentArticles && recentArticles.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Nejnovější z blogu</h2>
              <Link href="/blog">
                <Button variant="outline" className="text-sm">
                  Všechny články <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow border-0 shadow-sm">
                  {article.featuredImage && (
                    <div className="h-36 overflow-hidden rounded-t-lg">
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
                      {article.title}
                    </h3>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <Link href={`/blog/${article.slug}`}>
                      <Button variant="ghost" size="sm" className="text-[#1a5276] p-0 h-auto">
                        Číst více →
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Akční Letenky · <Link href="/blog">Blog</Link> ·{" "}
            <Link href="/levne-letenky">Letenky</Link> ·{" "}
            <Link href="/dovolene">Dovolená</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
