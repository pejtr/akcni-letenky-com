import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { Calendar, User, ArrowLeft, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/Navigation";
import { generateArticleSchema, generateBreadcrumbSchema, injectStructuredData, removeAllStructuredData } from "@/lib/structuredData";
import { trpc } from "@/lib/trpc";
import { kiwiAffiliateUrl } from "@shared/affiliateLinks";

export default function TipArticle() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const { data: article, isLoading, error } = trpc.articles.bySlug.useQuery({ slug });
  const { data: relatedArticles } = trpc.articles.byCategory.useQuery(
    { category: "tips", limit: 4 },
    { enabled: !!article }
  );

  // Article JSON-LD + BreadcrumbList schema for SEO
  useEffect(() => {
    if (!article) return;

    removeAllStructuredData();

    // Article schema
    injectStructuredData(generateArticleSchema({
      title: article.title,
      description: article.metaDescription || article.content.substring(0, 160),
      author: article.author || "Akční Letenky",
      datePublished: (article.publishedAt || article.createdAt).toISOString(),
      dateModified: (article.updatedAt || article.publishedAt || article.createdAt).toISOString(),
      image: article.featuredImage || "https://akcni-letenky.com/default-article-image.jpg",
      url: `https://akcni-letenky.com/tipy-pro-cestovatele/${article.slug}`,
    }));

    // BreadcrumbList
    injectStructuredData(generateBreadcrumbSchema([
      { name: "Akční Letenky", url: "/" },
      { name: "Tipy pro cestovatele", url: "/tipy-pro-cestovatele" },
      { name: article.title, url: `/tipy-pro-cestovatele/${article.slug}` },
    ]));

    return () => removeAllStructuredData();
  }, [article]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Článek nenalezen</h1>
            <p className="text-gray-600 mb-8">Omlouváme se, ale tento tip neexistuje nebo byl odstraněn.</p>
            <Link href="/tipy-pro-cestovatele">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zpět na tipy
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <Navigation />

      {/* Article Content */}
      <article className="py-12 pt-28">
        <div className="container max-w-4xl">
          {/* Breadcrumb + Back Button */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-[#1a5276] transition-colors">Domů</Link>
            <span>/</span>
            <Link href="/tipy-pro-cestovatele" className="hover:text-[#1a5276] transition-colors">Tipy pro cestovatele</Link>
            {article && (
              <>
                <span>/</span>
                <span className="text-gray-700 line-clamp-1">{article.title}</span>
              </>
            )}
          </div>

          <Link href="/tipy-pro-cestovatele">
            <Button variant="ghost" className="mb-6 -ml-2 text-[#1a5276]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zpět na tipy
            </Button>
          </Link>

          {isLoading ? (
            <div>
              <Skeleton className="h-12 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-8" />
              <Skeleton className="h-80 w-full mb-8 rounded-2xl" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : article ? (
            <>
              {/* Article Header */}
              <header className="mb-8">
                <div className="inline-flex items-center gap-2 bg-[#1a5276]/10 text-[#1a5276] px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  <Lightbulb className="w-4 h-4" />
                  Tip pro cestovatele
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-[#003087] mb-4 leading-tight">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {article.author || "Akční Letenky"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("cs-CZ", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Aktuální"}
                  </span>
                </div>
              </header>

              {/* Featured Image */}
              {article.featuredImage && (
                <div className="rounded-2xl overflow-hidden mb-8 shadow-md">
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-64 md:h-80 object-cover"
                  />
                </div>
              )}

              {/* Article Body */}
              <div
                className="prose prose-lg max-w-none prose-headings:text-[#003087] prose-a:text-[#E91E63] prose-strong:text-[#003087]"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* CTA Banner */}
              <div className="mt-10 p-6 bg-gradient-to-r from-[#1a5276] to-[#2980b9] rounded-2xl text-white text-center">
                <p className="text-lg font-bold mb-2">Připraveni hledat levné letenky?</p>
                <p className="text-white/80 text-sm mb-4">Porovnejte stovky aerolinek a najděte nejlepší cenu na Kiwi.com</p>
                <a
                  href={kiwiAffiliateUrl("https://www.kiwi.com/cs/")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#E91E63] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#c2185b] transition-colors"
                >
                  ✈️ Hledat letenky na Kiwi.com
                </a>
              </div>
            </>
          ) : null}
        </div>
      </article>

      {/* Related Tips */}
      {relatedArticles && relatedArticles.filter(a => a.slug !== slug).length > 0 && (
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-black text-[#003087] mb-6">
              💡 Další tipy pro cestovatele
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedArticles
                .filter(a => a.slug !== slug)
                .slice(0, 3)
                .map(a => (
                  <Link key={a.id} href={`/tipy-pro-cestovatele/${a.slug}`}>
                    <div className="group rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
                      {a.featuredImage && (
                        <div className="h-32 overflow-hidden">
                          <img
                            src={a.featuredImage}
                            alt={a.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-3">
                        <h3 className="font-bold text-[#003087] text-sm leading-snug group-hover:text-[#E91E63] transition-colors line-clamp-2">
                          {a.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
