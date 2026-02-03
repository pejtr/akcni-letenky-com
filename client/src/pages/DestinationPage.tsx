import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";
import { MapPin, Calendar, Plane, ArrowLeft, Star, Clock, Info, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useViewedDestinations } from "@/hooks/useViewedDestinations";
import { useWishlist } from "@/hooks/useWishlist";
import { useEffect } from "react";
import { generateOmioReferralLink, trackOmioClick } from "@/lib/omioAffiliate";
import { Train, Bus } from "lucide-react";

export default function DestinationPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const { data: destination, isLoading, error } = trpc.destinations.bySlug.useQuery({ slug });
  const { trackDestinationView } = useViewedDestinations();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  // Track destination view for personalization
  useEffect(() => {
    if (destination) {
      trackDestinationView(slug, destination.name, undefined);
    }
  }, [destination, slug, trackDestinationView]);
  const { data: articles } = trpc.articles.list.useQuery({ limit: 3 });
  const { data: flights } = trpc.flights.list.useQuery();

  // Filter flights to this destination
  const destinationFlights = flights?.filter(
    (flight) => destination && flight.toCity.toLowerCase().includes(destination.name.toLowerCase())
  ) || [];

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Destinace nenalezena</h1>
          <p className="text-gray-600 mb-8">Omlouváme se, ale tato destinace neexistuje.</p>
          <Link href="/">
            <a>
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zpět na hlavní stránku
              </Button>
            </a>
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
                <a className="text-gray-700 hover:text-pink-600 transition-colors">Blog</a>
              </Link>
              <a href="tel:+420123456789" className="text-gray-700 hover:text-pink-600 transition-colors">
                📞 +420 123 456 789
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/">
              <a className="hover:text-pink-600">Domů</a>
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              {isLoading ? "Načítání..." : `Letenky do ${destination?.name}`}
            </span>
          </nav>
        </div>
      </div>

      {isLoading ? (
        <div className="container py-12">
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-5/6" />
        </div>
      ) : destination ? (
        <>
          {/* Hero Section */}
          <section className="relative h-96 overflow-hidden">
            {destination.featuredImage && (
              <img
                src={destination.featuredImage}
                alt={destination.name}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
            <div className="absolute inset-0 flex items-end">
              <div className="container pb-12">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-4xl md:text-5xl font-bold text-white">
                    Letenky do {destination.name}
                  </h1>
                  <button
                    onClick={() => toggleWishlist(`city_${slug}`)}
                    className="bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 flex-shrink-0"
                    aria-label={isInWishlist(`city_${slug}`) ? `Odebrat ${destination.name} ze seznamu přání` : `Přidat ${destination.name} do seznamu přání`}
                  >
                    <Heart className={`w-6 h-6 ${isInWishlist(`city_${slug}`) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {destination.country}
                  </span>
                  {destination.region && (
                    <span className="flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      {destination.region}
                    </span>
                  )}
                  {destination.averagePrice && (
                    <span className="flex items-center gap-2 text-yellow-300 font-semibold">
                      <Plane className="w-5 h-5" />
                      od {new Intl.NumberFormat("cs-CZ").format(destination.averagePrice)} Kč
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="py-12">
            <div className="container">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Description */}
                <div className="lg:col-span-2">
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle className="text-2xl">Proč navštívit {destination.name}?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed mb-4">{destination.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="p-4 bg-pink-50 rounded-lg">
                          <Calendar className="w-6 h-6 text-pink-600 mb-2" />
                          <h3 className="font-semibold mb-1">Nejlepší doba</h3>
                          <p className="text-sm text-gray-600">Celoročně, nejlepší jaro a podzim</p>
                        </div>
                        <div className="p-4 bg-pink-50 rounded-lg">
                          <Clock className="w-6 h-6 text-pink-600 mb-2" />
                          <h3 className="font-semibold mb-1">Doba letu</h3>
                          <p className="text-sm text-gray-600">Přibližně 2 hodiny z Prahy</p>
                        </div>
                        <div className="p-4 bg-pink-50 rounded-lg">
                          <Star className="w-6 h-6 text-pink-600 mb-2" />
                          <h3 className="font-semibold mb-1">Oblíbenost</h3>
                          <p className="text-sm text-gray-600">
                            {destination.popularityScore ? `${destination.popularityScore}/100` : "Velmi oblíbené"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Available Flights */}
                  {destinationFlights.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-6">Aktuální nabídky letenek</h2>
                      <div className="grid grid-cols-1 gap-4">
                        {destinationFlights.slice(0, 5).map((flight) => (
                          <Card key={flight.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-4 mb-2">
                                    <h3 className="text-lg font-semibold">
                                      {flight.fromCity} → {flight.toCity}
                                    </h3>
                                    {flight.discountPercent && flight.discountPercent > 0 && (
                                      <Badge variant="destructive">-{flight.discountPercent}%</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Plane className="w-4 h-4" />
                                      {flight.airline}
                                    </span>
                                    <span>{flight.stops === 0 ? "Přímý let" : `${flight.stops} přestup`}</span>
                                    {flight.duration && <span>{flight.duration}</span>}
                                  </div>
                                </div>
                                <div className="text-right">
                                  {flight.originalPrice && flight.originalPrice > flight.price && (
                                    <p className="text-sm text-gray-400 line-through">
                                      {new Intl.NumberFormat("cs-CZ").format(flight.originalPrice)} Kč
                                    </p>
                                  )}
                                  <p className="text-2xl font-bold text-pink-600">
                                    {new Intl.NumberFormat("cs-CZ").format(flight.price)} Kč
                                  </p>
                                  <Button size="sm" className="mt-2">
                                    Zobrazit nabídku
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Sidebar */}
                <div>
                  {/* Search Widget */}
                  <Card className="mb-6 sticky top-24">
                    <CardHeader>
                      <CardTitle>Hledáte letenky?</CardTitle>
                      <CardDescription>Najděte nejlepší nabídky do {destination.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Odkud</label>
                          <input
                            type="text"
                            defaultValue="Praha"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Kam</label>
                          <input
                            type="text"
                            defaultValue={destination.name}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Kdy</label>
                          <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <Button className="w-full bg-pink-600 hover:bg-pink-700">Vyhledat letenky</Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Omio Alternative Transport */}
                  <Card className="mb-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-500">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Train className="w-5 h-5 text-blue-600" />
                        <CardTitle className="text-blue-900">Vlakem nebo autobusem?</CardTitle>
                      </div>
                      <CardDescription className="text-blue-700">
                        Pohodlné cestování do {destination.name} s Omio
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                          <Train className="w-4 h-4" />
                          <span>Ekologické cestování</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                          <Bus className="w-4 h-4" />
                          <span>Často levnější než letadlo</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                          <Star className="w-4 h-4" />
                          <span>Bez čekání na letišti</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <button
                        onClick={() => {
                          trackOmioClick(destination.name, "all", "destination_page_sidebar");
                          window.open(
                            generateOmioReferralLink(),
                            "_blank",
                            "noopener,noreferrer"
                          );
                        }}
                        className="w-full"
                      >
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          <Train className="w-4 h-4 mr-2" />
                          Vyhledat spojení
                        </Button>
                      </button>
                    </CardFooter>
                  </Card>

                  {/* Related Articles */}
                  {articles && articles.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Související články</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {articles.slice(0, 3).map((article) => (
                            <Link key={article.id} href={`/blog/${article.slug}`} className="block hover:bg-gray-50 p-2 rounded-lg transition-colors">
                              <h4 className="font-medium text-sm line-clamp-2 mb-1">{article.title}</h4>
                              <p className="text-xs text-gray-500">
                                {article.publishedAt
                                  ? new Date(article.publishedAt).toLocaleDateString("cs-CZ")
                                  : ""}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Link href="/blog">
                          <Button variant="outline" size="sm" className="w-full">
                            Všechny články
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-pink-600 to-pink-500 text-white py-16">
            <div className="container text-center">
              <h2 className="text-3xl font-bold mb-4">Připraveni létat do {destination.name}?</h2>
              <p className="text-pink-100 text-lg mb-8 max-w-2xl mx-auto">
                Prohlédněte si všechny aktuální nabídky letenek a najděte tu nejlepší cenu pro vaši cestu.
              </p>
              <Link href="/">
                <a>
                  <Button size="lg" variant="secondary">
                    Zobrazit všechny nabídky
                  </Button>
                </a>
              </Link>
            </div>
          </section>
        </>
      ) : null}

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
