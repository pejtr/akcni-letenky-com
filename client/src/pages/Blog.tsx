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
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="flex items-center gap-2">
                <img src="/logo.png" alt="Akční Letenky" className="h-10" />
              </a>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/">
                <a className="text-gray-700 hover:text-pink-600 transition-colors">Domů</a>
              </Link>
              <Link href="/blog">
                <a className="text-pink-600 font-semibold">Blog</a>
              </Link>
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
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {article.featuredImage && (
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-48 object-cover rounded-t-lg mb-4"
                      />
                    )}
                    <CardTitle className="text-xl line-clamp-2">{article.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {article.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString("cs-CZ")
                          : "Nepublikováno"}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-3">{article.excerpt}</p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/blog/${article.slug}`}>
                      <a>
                        <Button variant="outline" className="group">
                          Číst více
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </a>
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
                <a>
                  <Button>Zpět na hlavní stránku</Button>
                </a>
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
