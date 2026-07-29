import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Blog() {
  const { data: articles, isLoading } = trpc.articles.list.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <SEO
        title="Blog | Akční Letenky"
        description="Tipy na levné letenky, cestovatelské rady a inspirace pro vaše cesty. Přečtěte si nejnovější články o cestování."
        canonical="https://www.akcni-letenky.com/blog"
      />
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Akční Letenky" className="h-10" />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-700 hover:text-pink-600 transition-colors">Domů</Link>
              <Link href="/blog" className="text-pink-600 font-semibold">Blog</Link>
              <a href="tel:+420123456789" className="text-gray-700 hover:text-pink-600 transition-colors">
                📞 +420 123 456 789
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-600 to-pink-500 text-white py-16">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cestovatelský Blog</h1>
          <p className="text-xl text-pink-100 max-w-2xl">
            Tipy, triky a inspirace pro vaše cesty. Objevte nejlepší destinace, ušetřete na letenkách a cestujte jako profík.
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-48 w-full mb-4" />
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
          ) : articles && articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Card key={article.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
                  <div>
                    <Link href={`/blog/${article.slug}`}>
                      <a className="block cursor-pointer">
                        {article.featuredImage && (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={article.featuredImage}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardHeader className="pt-4">
                          <CardTitle className="text-xl font-bold group-hover:text-[#E91E63] transition-colors line-clamp-2">
                            {article.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 text-sm mt-2">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {article.author || "Akční Letenky"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {article.publishedAt
                                ? new Date(article.publishedAt).toLocaleDateString("cs-CZ")
                                : "Aktuální"}
                            </span>
                          </CardDescription>
                        </CardHeader>
                      </a>
                    </Link>

                    <CardContent>
                      <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed">{article.excerpt}</p>
                    </CardContent>
                  </div>

                  <CardFooter className="pt-0">
                    <Link href={`/blog/${article.slug}`}>
                      <Button variant="outline" className="group/btn w-full border-pink-500 text-pink-600 hover:bg-pink-600 hover:text-white transition-colors">
                        Číst článek
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Zatím zde nejsou žádné články</h2>
              <p className="text-gray-500 mb-8">Brzy přidáme nové zajímavé články o cestování a levných letenkách.</p>
              <Link href="/">
                <Button>Zpět na hlavní stránku</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container">
          <div className="text-center">
            <p className="text-gray-400">© 2026 Akční Letenky. Všechna práva vyhrazena.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
