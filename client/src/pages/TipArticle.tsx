import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { Lightbulb, Calendar, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { pelikanDeepLink } from "@shared/affiliateLinks";
import { generateArticleSchema, generateBreadcrumbSchema, injectStructuredData, removeAllStructuredData } from "@/lib/structuredData";
import { trpc } from "@/lib/trpc";
import MarkdownContent from "@/components/MarkdownContent";
import InternalLinkingHub from "@/components/InternalLinkingHub";
import ArticleSidebar from "@/components/ArticleSidebar";

function sanitizeArticleHtml(htmlStr: string): string {
  if (!htmlStr) return "";
  let clean = htmlStr.trim();
  clean = clean.replace(/^<article[^>]*>/i, "").replace(/<\/article>$/i, "");
  return clean;
}

export default function TipArticle() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const { data: article, isLoading, error } = trpc.articles.bySlug.useQuery({ slug });

  // Add Article & Breadcrumb JSON-LD schema for SEO
  useEffect(() => {
    if (!article) return;

    removeAllStructuredData();

    injectStructuredData(generateArticleSchema({
      title: article.title,
      description: article.excerpt || article.content.substring(0, 160),
      author: article.author || "Akční Letenky",
      datePublished: (article.publishedAt || article.createdAt).toISOString(),
      dateModified: (article.updatedAt || article.publishedAt || article.createdAt).toISOString(),
      image: article.featuredImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
      url: `https://akcni-letenky.com/tipy-pro-cestovatele/${article.slug}`,
    }));

    injectStructuredData(generateBreadcrumbSchema([
      { name: "Domů", url: "/" },
      { name: "Tipy pro cestovatele", url: "/tipy-pro-cestovatele" },
      { name: article.title, url: `/tipy-pro-cestovatele/${article.slug}` },
    ]));

    return () => {
      removeAllStructuredData();
    };
  }, [article]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh] pt-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Tip nenalezen</h1>
            <p className="text-gray-600 mb-8">Omlouváme se, ale tento tip pro cestovatele neexistuje.</p>
            <Link href="/tipy-pro-cestovatele">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zpět na tipy
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isRawHtml = article && /<[a-z][\s\S]*>/i.test(article.content);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <Navigation />

        <section className="py-12 pt-28">
          <div className="container max-w-7xl">
            {/* Back Link */}
            <Link href="/tipy-pro-cestovatele">
              <Button variant="ghost" className="mb-6 -ml-2 text-[#1a5276]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zpět na tipy
              </Button>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Content Column (8 cols) */}
              <div className="lg:col-span-8">
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
                  <article>
                    {/* Article Header */}
                    <header className="mb-8">
                      <div className="inline-flex items-center gap-2 bg-[#1a5276]/10 text-[#1a5276] px-3.5 py-1.5 rounded-full text-xs font-bold mb-4">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        Tip pro cestovatele
                      </div>
                      <h1 className="text-3xl md:text-4xl font-black text-[#003087] mb-4 leading-tight">
                        {article.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
                        <span className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-[#1a5276]" />
                          {article.author || "Akční Letenky"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#1a5276]" />
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
                      <div className="rounded-2xl overflow-hidden mb-8 shadow-md max-h-[420px]">
                        <img
                          src={article.featuredImage}
                          alt={article.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";
                          }}
                        />
                      </div>
                    )}

                    {/* Article Body */}
                    {isRawHtml ? (
                      <div
                        className="prose prose-lg max-w-none text-gray-800 leading-relaxed mb-8 prose-headings:text-[#003087] prose-headings:font-black prose-a:text-[#1565C0] prose-a:font-bold prose-img:rounded-2xl prose-img:shadow-md"
                        dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.content) }}
                      />
                    ) : (
                      <MarkdownContent content={article.content} className="mb-8" />
                    )}

                    {/* SEO Internal Linking Hub */}
                    <InternalLinkingHub />

                    {/* CTA Banner */}
                    <div className="mt-10 p-8 bg-gradient-to-r from-[#1a5276] to-[#2980b9] rounded-3xl text-white text-center shadow-lg border border-blue-400/20">
                      <p className="text-xl md:text-2xl font-black mb-2">Připraveni hledat levné letenky?</p>
                      <p className="text-white/90 text-sm mb-6 max-w-xl mx-auto">Vyberte si z nejnovějších akčních nabídek přehledně na Pelikán.cz.</p>
                      <a
                        href={pelikanDeepLink("/cs/akcni-letenky", {
                          campaign: "tips-article",
                          channel: "article-cta",
                          content: slug,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-[#E91E63] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[#c2185b] transition-colors shadow-md text-sm md:text-base"
                      >
                        ✈️ Hledat letenky na Pelikan.cz
                      </a>
                    </div>
                  </article>
                ) : null}
              </div>

              {/* Right Sidebar Column (4 cols) */}
              <div className="lg:col-span-4">
                <ArticleSidebar currentSlug={slug} />
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
