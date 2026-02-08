import { Link } from "wouter";
import { Plane, Train, Bus, Clock, Euro, Leaf, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RouteComparison {
  route: string;
  from: string;
  to: string;
  distance: string;
  flight: {
    price: number;
    duration: string;
    co2: string;
    pros: string[];
    cons: string[];
  };
  train: {
    price: number;
    duration: string;
    co2: string;
    pros: string[];
    cons: string[];
  };
  bus: {
    price: number;
    duration: string;
    co2: string;
    pros: string[];
    cons: string[];
  };
}

const popularRoutes: RouteComparison[] = [
  {
    route: "Praha → Vídeň",
    from: "Praha",
    to: "Vídeň",
    distance: "330 km",
    flight: {
      price: 1200,
      duration: "1h let + 3h letiště",
      co2: "35 kg CO₂",
      pros: ["Nejrychlejší čistý let", "Časté spoje"],
      cons: ["Drahé", "3h na letišti", "Vysoké emise"],
    },
    train: {
      price: 399,
      duration: "4h",
      co2: "3.5 kg CO₂",
      pros: ["Nejlevnější", "Centrum-centrum", "90% nižší emise"],
      cons: ["Delší než let"],
    },
    bus: {
      price: 299,
      duration: "4.5h",
      co2: "8 kg CO₂",
      pros: ["Nejlevnější", "Časté spoje"],
      cons: ["Nejdelší", "Méně pohodlné"],
    },
  },
  {
    route: "Praha → Berlín",
    from: "Praha",
    to: "Berlín",
    distance: "350 km",
    flight: {
      price: 1500,
      duration: "1h let + 3h letiště",
      co2: "40 kg CO₂",
      pros: ["Rychlý let"],
      cons: ["Nejdražší", "Dlouhá doba na letišti"],
    },
    train: {
      price: 599,
      duration: "4.5h",
      co2: "4 kg CO₂",
      pros: ["Pohodlné", "WiFi", "Centrum-centrum"],
      cons: ["Střední cena"],
    },
    bus: {
      price: 399,
      duration: "5h",
      co2: "10 kg CO₂",
      pros: ["Levné", "Časté spoje"],
      cons: ["Nejdelší"],
    },
  },
  {
    route: "Praha → Mnichov",
    from: "Praha",
    to: "Mnichov",
    distance: "380 km",
    flight: {
      price: 1800,
      duration: "1h let + 3h letiště",
      co2: "45 kg CO₂",
      pros: ["Rychlý let"],
      cons: ["Velmi drahé", "Vysoké emise"],
    },
    train: {
      price: 799,
      duration: "5.5h",
      co2: "4.5 kg CO₂",
      pros: ["Pohodlné", "Krásné výhledy", "Ekologické"],
      cons: ["Delší"],
    },
    bus: {
      price: 499,
      duration: "6h",
      co2: "12 kg CO₂",
      pros: ["Levné"],
      cons: ["Nejdelší", "Méně pohodlné"],
    },
  },
];

export default function PriceComparison() {
  const getBestValue = (route: RouteComparison): "flight" | "train" | "bus" => {
    // Calculate value score: lower price + lower CO2 + shorter time = better
    const scores = {
      flight: route.flight.price / 100 + parseInt(route.flight.co2) / 10,
      train: route.train.price / 100 + parseInt(route.train.co2) / 10,
      bus: route.bus.price / 100 + parseInt(route.bus.co2) / 10,
    };
    
    return Object.entries(scores).reduce((a, b) => (scores[a[0] as keyof typeof scores] < scores[b[0] as keyof typeof scores] ? a : b))[0] as "flight" | "train" | "bus";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">✈️</span>
              <span className="font-bold text-xl">AKČNÍ LETENKY</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Domů
              </Link>
              <Link href="/blog" className="text-gray-700 hover:text-blue-600 transition-colors">
                Blog
              </Link>
              <Link href="/vlaky-autobusy" className="text-gray-700 hover:text-blue-600 transition-colors">
                Vlaky & Autobusy
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-16">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Porovnání Cen Dopravy
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Zjistěte, který způsob dopravy je pro vás nejvýhodnější. Porovnáváme ceny, čas a ekologický dopad.
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 bg-white border-b">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">3</div>
              <div className="text-gray-600">Typy dopravy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">90%</div>
              <div className="text-gray-600">Nižší emise vlakem</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">70%</div>
              <div className="text-gray-600">Úspora oproti letu</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">4h</div>
              <div className="text-gray-600">Průměrná doba cesty</div>
            </div>
          </div>
        </div>
      </section>

      {/* Route Comparisons */}
      <section className="py-12">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Populární Trasy z Prahy</h2>
          
          <div className="space-y-8">
            {popularRoutes.map((route) => {
              const bestValue = getBestValue(route);
              
              return (
                <Card key={route.route} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">{route.route}</CardTitle>
                      <div className="text-sm text-gray-600">{route.distance}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
                      {/* Flight */}
                      <div className={`p-6 ${bestValue === "flight" ? "bg-blue-50 border-2 border-blue-500" : ""}`}>
                        <div className="flex items-center gap-2 mb-4">
                          <Plane className="w-6 h-6 text-blue-600" />
                          <h3 className="text-xl font-bold">Letadlo</h3>
                          {bestValue === "flight" && (
                            <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded">
                              Nejlepší hodnota
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2">
                            <Euro className="w-4 h-4 text-gray-500" />
                            <span className="text-2xl font-bold text-blue-600 whitespace-nowrap">
                              {route.flight.price} Kč
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {route.flight.duration}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Leaf className="w-4 h-4" />
                            {route.flight.co2}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <div className="text-sm font-semibold text-green-700 mb-1">✓ Výhody:</div>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {route.flight.pros.map((pro, i) => (
                                <li key={i}>• {pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-red-700 mb-1">✗ Nevýhody:</div>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {route.flight.cons.map((con, i) => (
                                <li key={i}>• {con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Train */}
                      <div className={`p-6 ${bestValue === "train" ? "bg-green-50 border-2 border-green-500" : ""}`}>
                        <div className="flex items-center gap-2 mb-4">
                          <Train className="w-6 h-6 text-green-600" />
                          <h3 className="text-xl font-bold">Vlak</h3>
                          {bestValue === "train" && (
                            <span className="ml-auto bg-green-600 text-white text-xs px-2 py-1 rounded">
                              Nejlepší hodnota
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2">
                            <Euro className="w-4 h-4 text-gray-500" />
                            <span className="text-2xl font-bold text-green-600 whitespace-nowrap">
                              {route.train.price} Kč
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {route.train.duration}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Leaf className="w-4 h-4" />
                            {route.train.co2}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <div className="text-sm font-semibold text-green-700 mb-1">✓ Výhody:</div>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {route.train.pros.map((pro, i) => (
                                <li key={i}>• {pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-red-700 mb-1">✗ Nevýhody:</div>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {route.train.cons.map((con, i) => (
                                <li key={i}>• {con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Bus */}
                      <div className={`p-6 ${bestValue === "bus" ? "bg-orange-50 border-2 border-orange-500" : ""}`}>
                        <div className="flex items-center gap-2 mb-4">
                          <Bus className="w-6 h-6 text-orange-600" />
                          <h3 className="text-xl font-bold">Autobus</h3>
                          {bestValue === "bus" && (
                            <span className="ml-auto bg-orange-600 text-white text-xs px-2 py-1 rounded">
                              Nejlepší hodnota
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2">
                            <Euro className="w-4 h-4 text-gray-500" />
                            <span className="text-2xl font-bold text-orange-600 whitespace-nowrap">
                              {route.bus.price} Kč
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {route.bus.duration}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Leaf className="w-4 h-4" />
                            {route.bus.co2}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <div className="text-sm font-semibold text-green-700 mb-1">✓ Výhody:</div>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {route.bus.pros.map((pro, i) => (
                                <li key={i}>• {pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-red-700 mb-1">✗ Nevýhody:</div>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {route.bus.cons.map((con, i) => (
                                <li key={i}>• {con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="p-6 bg-gray-50 border-t">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <TrendingDown className="w-4 h-4 inline mr-1" />
                          Nejlepší hodnota: <strong>{bestValue === "flight" ? "Letadlo" : bestValue === "train" ? "Vlak" : "Autobus"}</strong>
                        </div>
                        <Link href="/vlaky-autobusy">
                          <Button>Vyhledat Spojení →</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Jak Vybrat Nejlepší Dopravu?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="w-5 h-5 text-green-600" />
                  Pro Úsporu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Pokud chcete ušetřit, volte vlak nebo autobus. Rezervujte 2-3 měsíce předem pro nejlepší ceny.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>✓ Vlak: Střední cena, vysoký komfort</li>
                  <li>✓ Autobus: Nejlevnější, častá spojení</li>
                  <li>✓ Noční spoje = zdarma ubytování</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Pro Rychlost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Pro krátké vzdálenosti (do 500 km) je vlak často rychlejší než letadlo včetně času na letišti.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>✓ Vlak: Centrum-centrum, žádné čekání</li>
                  <li>✓ Letadlo: Rychlý let, ale 3h na letišti</li>
                  <li>✓ Do 500 km: Vlak je rychlejší</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  Pro Ekologii
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Vlak produkuje až 90% méně CO₂ než letadlo. Nejekologičtější volba pro vaše cesty.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>✓ Vlak: 90% nižší emise</li>
                  <li>✓ Autobus: 75% nižší emise</li>
                  <li>✓ Elektřina z obnovitelných zdrojů</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Najděte Si Své Spojení
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Porovnejte ceny všech dopravců a najděte nejlepší spojení pro vaši cestu.
          </p>
          <Link href="/vlaky-autobusy">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Vyhledat Spojení →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container text-center">
          <p className="text-gray-400">
            © 2026 Akční Letenky. Všechna práva vyhrazena.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              Domů
            </Link>
            <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
              Blog
            </Link>
            <Link href="/vlaky-autobusy" className="text-gray-400 hover:text-white transition-colors">
              Vlaky & Autobusy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
