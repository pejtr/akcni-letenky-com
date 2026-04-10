/**
 * SEO Destination Page Component
 * 
 * Reusable component for both country and city destination pages
 * with keyword-optimized content, affiliate links, and structured data
 */

import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Plane, TrendingUp, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
// Footer component not available
import { destinationCountries, destinationCities, type SEODestination } from "../../../shared/seoDestinations";
import { kiwiAffiliateUrl } from "@shared/affiliateLinks";

export default function SEODestinationPage() {
  const [location] = useLocation();
  
  // Extract slug from URL path
  const slug = location.replace(/^\/letenky-(do-)?/, "");
  
  // Find destination data
  const allDestinations = [...destinationCountries, ...destinationCities];
  const destination = allDestinations.find((d) => d.slug === slug);

  if (!destination) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navigation />
        <div className="container py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Destinace nenalezena</h1>
          <p className="text-gray-600">Požadovaná destinace neexistuje.</p>
        </div>
        {/* Footer component not available */}
      </div>
    );
  }

  // Generate Schema.org Place structured data
  const placeSchema = destination.latitude && destination.longitude ? {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": destination.name,
    "description": destination.description,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": destination.latitude,
      "longitude": destination.longitude
    },
    "url": `https://akcni-letenky.com${location}`
  } : null;

  // Generate Schema.org TravelAction structured data
  const travelActionSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAction",
    "name": `Letenky do ${destination.name}`,
    "description": destination.metaDescription,
    "target": {
      "@type": "Place",
      "name": destination.name,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": destination.type === "country" ? destination.name : undefined
      }
    },
    "provider": {
      "@type": "Organization",
      "name": "Akční Letenky",
      "url": "https://akcni-letenky.com"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Helmet>
        <title>{destination.title}</title>
        <meta name="description" content={destination.metaDescription} />
        <meta name="keywords" content={destination.keywords.join(", ")} />
        
        {/* Open Graph */}
        <meta property="og:title" content={destination.title} />
        <meta property="og:description" content={destination.metaDescription} />
        <meta property="og:image" content={destination.image} />
        <meta property="og:type" content="website" />
        
        {/* Structured Data */}
        {placeSchema && (
          <script type="application/ld+json">
            {JSON.stringify(placeSchema)}
          </script>
        )}
        <script type="application/ld+json">
          {JSON.stringify(travelActionSchema)}
        </script>
      </Helmet>

      <Navigation />

      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${destination.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        </div>
        <div className="relative container h-full flex flex-col justify-center text-white">
          <Badge className="w-fit mb-4 bg-primary text-white">
            {destination.type === "country" ? "Země" : "Město"}
          </Badge>
          <h1 className="text-5xl font-bold mb-4">{destination.h1}</h1>
          <p className="text-2xl text-gray-200">{destination.h2}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {destination.description}
                </p>
              </CardContent>
            </Card>

            {/* SEO Keywords */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Vyhledávané Dotazy
                </h2>
                <div className="flex flex-wrap gap-2">
                  {destination.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-semibold">Měsíční vyhledávání:</span>{" "}
                    {destination.searchVolume.toLocaleString("cs-CZ")}
                  </div>
                  <div>
                    <span className="font-semibold">SEO obtížnost:</span>{" "}
                    {destination.difficulty}/100
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Destinations */}
            {destination.relatedDestinations && destination.relatedDestinations.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-primary" />
                    Související Destinace
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {destination.relatedDestinations.map((relatedSlug) => {
                      const related = allDestinations.find((d) => d.slug === relatedSlug);
                      if (!related) return null;
                      
                      const relatedPath = related.type === "country" 
                        ? `/letenky-do-${related.slug}` 
                        : `/letenky-${related.slug}`;
                      
                      return (
                        <a
                          key={relatedSlug}
                          href={relatedPath}
                          className="block p-4 border rounded-lg hover:border-primary transition-colors"
                        >
                          <div className="font-semibold">{related.name}</div>
                          <div className="text-sm text-gray-600">{related.h2}</div>
                        </a>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - CTAs */}
          <div className="space-y-6">
            {/* Pelikan.cz CTA */}
            <Card className="border-primary">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="text-sm font-semibold text-primary uppercase">
                    Nejlepší Nabídka
                  </div>
                  <h3 className="text-2xl font-bold">
                    Letenky od {destination.name === "Londýn" ? "733" : destination.name === "Řím" ? "712" : "990"} Kč
                  </h3>
                  <p className="text-sm text-gray-600">
                    Porovnání cen od všech leteckých společností
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="w-full"
                  >
                    <a
                      href={destination.pelikanUrl}
                      target="_blank"
                      rel="noopener nofollow sponsored"
                      className="flex items-center justify-center gap-2"
                    >
                      <Plane className="h-5 w-5" />
                      Zobrazit Letenky na Pelikan.cz
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <div className="text-xs text-gray-500">
                    ✓ Nejlepší ceny ✓ Affiliate partner
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kiwi.com CTA */}
            {destination.kiwiUrl && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="text-sm font-semibold text-gray-600 uppercase">
                      Alternativní Nabídka
                    </div>
                    <h3 className="text-xl font-bold">Kiwi.com</h3>
                    <p className="text-sm text-gray-600">
                      Jednosměrné lety a flexibilní termíny
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      <a
                        href={kiwiAffiliateUrl(destination.kiwiUrl, "seo-dest")}
                        target="_blank"
                        rel="noopener nofollow"
                        className="flex items-center justify-center gap-2"
                      >
                        Vyhledat na Kiwi.com
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Box */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">💡 Tip na úsporu</h4>
                <p className="text-sm text-gray-700">
                  Nejlevnější letenky najdete obvykle 2-3 měsíce před odletem. 
                  Sledujte ceny pravidelně a využijte cenových alertů.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer component not available */}
    </div>
  );
}
