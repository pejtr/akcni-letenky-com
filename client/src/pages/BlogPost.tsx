import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { Calendar, User, ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { pelikanDeepLink } from "@shared/affiliateLinks";
import { generateArticleSchema, injectStructuredData, removeAllStructuredData } from "@/lib/structuredData";
import { trpc } from "@/lib/trpc";
import MarkdownContent from "@/components/MarkdownContent";
import InternalLinkingHub from "@/components/InternalLinkingHub";
import ArticleSidebar from "@/components/ArticleSidebar";
import SEO from "@/components/SEO";

/** Clean raw HTML wrapper tags like <article> if present */
function sanitizeArticleHtml(htmlStr: string): string {
  if (!htmlStr) return "";
  let clean = htmlStr.trim();
  clean = clean.replace(/^<article[^>]*>/i, "").replace(/<\/article>$/i, "");
  return clean;
}

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const { data: article, isLoading, error } = trpc.articles.bySlug.useQuery({ slug });

  // Add Article JSON-LD schema for SEO
  useEffect(() => {
    if (!article) return;

    removeAllStructuredData();

    const articleSchema = generateArticleSchema({
      title: article.title,
      description: article.excerpt || article.content.substring(0, 160),
      author: article.author || "Akční Letenky",
      datePublished: (article.publishedAt || article.createdAt).toISOString(),
      dateModified: (article.updatedAt || article.publishedAt || article.createdAt).toISOString(),
      image: article.featuredImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
      url: `https://akcni-letenky.com/blog/${article.slug}`,
    });

    injectStructuredData(articleSchema);

    return () => {
      removeAllStructuredData();
    };
  }, [article]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col justify-between">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh] pt-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Článek nenalezen</h1>
            <p className="text-gray-600 mb-8">Omlouváme se, ale tento článek neexistuje nebo byl odstraněn.</p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zpět na blog
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col justify-between">
      <SEO title={`${article?.title || "Blog"} | Akční Letenky`} description={article?.excerpt || "Přečtěte si nejnovější články o cestování."} canonical="https://www.akcni-letenky.com/blog" />
      <div>
        <Navigation />

        {/* Main Section with Article & Sidebar */}
        <section className="py-12 pt-28">
          <div className="container max-w-7xl">
            {/* Back Button */}
            <Link href="/blog">
              <Button variant="ghost" className="mb-6 -ml-2 text-[#1565C0]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zpět na blog
              </Button>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Content (8 cols) */}
              <div className="lg:col-span-8">
                {isLoading ? (
                  <div>
                    <Skeleton className="h-12 w-3/4 mb-4" />
                    <Skeleton className="h-6 w-1/2 mb-8" />
                    <Skeleton className="h-96 w-full mb-8 rounded-2xl" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ) : article ? (
                  <article>
                    {/* Article Header */}
                    <header className="mb-8">
                      <h1 className="text-3xl md:text-4xl font-black text-[#003087] mb-4 leading-tight">
                        {article.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          {article.author || "Akční Letenky"}
                        </span>
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          {article.publishedAt
                            ? new Date(article.publishedAt).toLocaleDateString("cs-CZ", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : "Nepublikováno"}
                        </span>
                        <span className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-blue-600" />
                          {article.viewCount || 0} zobrazení
                        </span>
                      </div>
                    </header>

                    {/* Featured Image */}
                    {article.featuredImage && (
                      <div className="rounded-2xl overflow-hidden mb-8 shadow-lg max-h-[450px]">
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

                    {/* Article Content */}
                    {isRawHtml ? (
                      <div
                        className="prose prose-lg max-w-none text-gray-800 leading-relaxed mb-12 prose-headings:text-[#003087] prose-headings:font-black prose-a:text-[#1565C0] prose-a:font-bold prose-img:rounded-2xl prose-img:shadow-md"
                        dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.content) }}
                      />
                    ) : (
                      <MarkdownContent content={article.content} className="mb-12" />
                    )}

                    {/* Keywords */}
                    {article.keywords && (
                      <div className="mb-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Klíčová slova:</h3>
                        <div className="flex flex-wrap gap-2">
                          {article.keywords.split(",").map((keyword, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-white text-blue-600 text-xs font-semibold rounded-full border border-blue-200 shadow-sm"
                            >
                              {keyword.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SEO Internal Linking Hub */}
                    <InternalLinkingHub />

                    {/* Call to Action - Pelikán Link */}
                    <div className="bg-gradient-to-r from-[#1565C0] to-[#0d47a1] text-white p-8 rounded-3xl text-center mb-8 shadow-xl border border-blue-400/20">
                      <h2 className="text-2xl md:text-3xl font-black mb-3">Hledáte levné letenky?</h2>
                      <p className="text-blue-100 mb-6 max-w-xl mx-auto text-sm md:text-base">
                        Prohlédněte si nejvýhodnější akční nabídky od stovek leteckých společností přehledně na Pelikán.cz!
                      </p>
                      <a
                        href={pelikanDeepLink("/cs/akcni-letenky", {
                          campaign: "blog-article-cta",
                          channel: "article-bottom",
                          content: slug,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="lg" className="bg-[#E91E63] hover:bg-[#c2185b] text-white font-bold px-8 py-3.5 rounded-xl shadow-lg text-base">
                          ✈️ Zobrazit nabídky letenek na Pelikán.cz
                        </Button>
                      </a>
                    </div>
                  </article>
                ) : null}
              </div>

              {/* Right Sidebar (4 cols) */}
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
