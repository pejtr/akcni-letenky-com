import { Link } from "wouter";
import { Train, Bus, Plane, Leaf, Clock, Euro, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateOmioReferralLink, generateOmioLink, generateOmioRouteLink, trackOmioClick, POPULAR_OMIO_ROUTES } from "@/lib/omioAffiliate";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";

export default function VlakyAutobusy() {
  const handleOmioSearch = (from: string, to: string) => {
    trackOmioClick(to, "train", "vlaky_autobusy_page");
    window.open(generateOmioRouteLink(from, to), "_blank", "noopener,noreferrer");
  };

  const popularRoutes = POPULAR_OMIO_ROUTES;

  const comparison = [
    {
      category: "Ekologie",
      train: "90% nižší emise CO₂",
      flight: "Vysoké emise CO₂",
      trainBetter: true,
    },
    {
      category: "Cena",
      train: "Často levnější",
      flight: "Vyšší ceny + poplatky",
      trainBetter: true,
    },
    {
      category: "Pohodlí",
      train: "Volný pohyb, WiFi, občerstvení",
      flight: "Omezený prostor",
      trainBetter: true,
    },
    {
      category: "Čas na letišti",
      train: "Žádné čekání, přímý nástup",
      flight: "2-3h check-in + bezpečnost",
      trainBetter: true,
    },
    {
      category: "Centrum města",
      train: "Přímo do centra",
      flight: "Letiště mimo město",
      trainBetter: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <SEO title="Vlaky a autobusy | Akční Letenky" description="Levné jízdenky na vlaky a autobusy po Evropě. Porovnejte ceny a ušetřete." canonical="https://www.akcni-letenky.com/vlaky-autobusy" />
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 pt-32 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Train className="w-12 h-12" />
              <Bus className="w-12 h-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Cestujte Vlakem & Autobusem
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Ekologicky, pohodlně a často levněji než letadlem
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-300" />
                <span>90% nižší emise CO₂</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-300" />
                <span>Žádné čekání na letišti</span>
              </div>
              <div className="flex items-center gap-2">
                <Euro className="w-5 h-5 text-green-300" />
                <span>Výhodné ceny</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Omio Search Widget */}
      <section className="py-16">
        <div className="container">
          <Card className="max-w-4xl mx-auto shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Vyhledejte Spojení</CardTitle>
              <CardDescription className="text-lg">
                Porovnáme za vás vlaky, autobusy i letadla
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <p className="text-gray-700 mb-4">
                  Vyhledávání spojení přes našeho partnera <strong>Omio</strong>
                </p>
                <Button
                  size="lg"
                  onClick={() => {
                    trackOmioClick("all", "all", "vlaky_autobusy_widget");
                    window.open(generateOmioReferralLink(), "_blank", "noopener,noreferrer");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-6 text-lg"
                >
                  <Train className="w-6 h-6 mr-2" />
                  Vyhledat Spojení na Omio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nejoblíbenější Trasy z Prahy
            </h2>
            <p className="text-lg text-gray-600">
              Rychlé a pohodlné spojení do evropských měst
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {popularRoutes.map((route, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl">{route.fromCs} → {route.toCs}</CardTitle>
                    {route.transportType === "train" && <Train className="w-6 h-6 text-blue-600" />}
                    {route.transportType === "bus" && <Bus className="w-6 h-6 text-orange-600" />}
                  </div>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {route.duration}
                    </span>
                    <span className="font-semibold text-blue-600">{route.price}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => {
                      trackOmioClick(route.toCs, route.transportType, "vlaky_autobusy_page");
                      // We pass the English names and transportType to generate an SEO deep link
                      const link = generateOmioLink({ from: route.from, to: route.to, transportType: route.transportType });
                      window.open(link, "_blank", "noopener,noreferrer");
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Vyhledat Spojení
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison: Train vs Flight */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Vlak vs Letadlo: Porovnání
            </h2>
            <p className="text-lg text-gray-600">
              Proč je vlak často lepší volbou pro cesty po Evropě
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Kategorie</th>
                      <th className="px-6 py-4 text-left font-semibold text-blue-600">
                        <div className="flex items-center gap-2">
                          <Train className="w-5 h-5" />
                          Vlak
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600">
                        <div className="flex items-center gap-2">
                          <Plane className="w-5 h-5" />
                          Letadlo
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {comparison.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{item.category}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {item.trainBetter && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />}
                            <span className={item.trainBetter ? "text-green-700 font-medium" : "text-gray-600"}>
                              {item.train}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{item.flight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Proč Cestovat Vlakem?
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>Ekologické Cestování</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Vlaky produkují až <strong>90% méně CO₂</strong> než letadla. Cestujte s čistým svědomím a přispějte k ochraně planety.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>Ušetřete Čas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Žádné 2-3 hodiny na letišti. <strong>Přijďte 10 minut před odjezdem</strong> a nádraží jsou přímo v centru měst.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Euro className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>Výhodné Ceny</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Vlaky jsou často <strong>levnější než letadla</strong>, zejména při včasné rezervaci. Žádné skryté poplatky za zavazadla.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Train className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle>Maximální Pohodlí</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    <strong>Volný pohyb</strong> po vagonu, WiFi zdarma, občerstvení a krásné výhledy z okna během celé cesty.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Připraveni na Cestu Vlakem?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Najděte nejlepší spojení a rezervujte si místo ještě dnes
          </p>
          <Button
            size="lg"
            onClick={() => {
              trackOmioClick("all", "all", "vlaky_autobusy_cta");
              window.open(generateOmioReferralLink(), "_blank", "noopener,noreferrer");
            }}
            className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-6 text-lg"
          >
            <Train className="w-6 h-6 mr-2" />
            Vyhledat Spojení na Omio
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container text-center">
          <p className="text-gray-400">
            © 2026 AKČNÍ-LETENKY.com | Všechna práva vyhrazena
          </p>
          <div className="mt-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
              ← Zpět na hlavní stránku
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
