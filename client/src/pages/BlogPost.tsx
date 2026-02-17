import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { Calendar, User, ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { generateArticleSchema, injectStructuredData, removeAllStructuredData } from "@/lib/structuredData";
import { trpc } from "@/lib/trpc";

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const { data: article, isLoading, error } = trpc.articles.bySlug.useQuery({ slug });
  const { data: recentArticles } = trpc.articles.recent.useQuery({ limit: 3 });

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
      image: article.featuredImage || "https://akcni-letenky.com/default-article-image.jpg",
      url: `https://akcni-letenky.com/blog/${article.slug}`,
    });

    injectStructuredData(articleSchema);

    return () => {
      removeAllStructuredData();
    };
  }, [article]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Akční Letenky" className="h-10" />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-700 hover:text-pink-600 transition-colors">Domů</Link>
              <Link href="/blog" className="text-gray-700 hover:text-pink-600 transition-colors">Blog</Link>
              <a href="tel:+420123456789" className="text-gray-700 hover:text-pink-600 transition-colors">
                📞 +420 123 456 789
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <article className="py-12">
        <div className="container max-w-4xl">
          {/* Back Button */}
          <Link href="/blog">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zpět na blog
            </Button>
          </Link>

          {isLoading ? (
            <div>
              <Skeleton className="h-12 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-8" />
              <Skeleton className="h-96 w-full mb-8" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : article ? (
            <>
              {/* Article Header */}
              <header className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{article.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {article.author}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("cs-CZ", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Nepublikováno"}
                  </span>
                  <span className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    {article.viewCount || 0} zobrazení
                  </span>
                </div>
              </header>

              {/* Featured Image */}
              {article.featuredImage && (
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-96 object-cover rounded-lg shadow-lg mb-8"
                />
              )}

              {/* Article Content */}
              <div className="prose prose-lg max-w-none mb-12">
                {article.content.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Keywords */}
              {article.keywords && (
                <div className="mb-8 p-4 bg-pink-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Klíčová slova:</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.keywords.split(",").map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white text-pink-600 text-sm rounded-full border border-pink-200"
                      >
                        {keyword.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-pink-600 to-pink-500 text-white p-8 rounded-lg text-center mb-12">
                <h2 className="text-2xl font-bold mb-4">Hledáte levné letenky?</h2>
                <p className="text-pink-100 mb-6">
                  Prohlédněte si naše aktuální nabídky a ušetřete až 70% na letenkách do celého světa!
                </p>
                <Link href="/">
                  <Button size="lg" variant="secondary">
                    Zobrazit akční letenky
                  </Button>
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </article>

      {/* Related Articles */}
      {recentArticles && recentArticles.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container max-w-6xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Další články</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentArticles
                .filter((a) => a.slug !== slug)
                .slice(0, 3)
                .map((relatedArticle) => (
                  <Card key={relatedArticle.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      {relatedArticle.featuredImage && (
                        <img
                          src={relatedArticle.featuredImage}
                          alt={relatedArticle.title}
                          className="w-full h-40 object-cover rounded-t-lg mb-4"
                        />
                      )}
                      <CardTitle className="text-lg line-clamp-2">{relatedArticle.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm line-clamp-2">{relatedArticle.excerpt}</p>
                      <Link href={`/blog/${relatedArticle.slug}`}>
                        <Button variant="link" className="mt-4 p-0">
                          Číst více →
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container">
          <div className="text-center">
            <p className="text-gray-400">© 2026 Akční Letenky. Všechna práva vyhrazena.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
