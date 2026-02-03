import { useState } from "react";
import { Link } from "wouter";
import { Heart, Trash2, ExternalLink, TrendingDown, TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist, WishlistItem } from "@/hooks/useWishlist";
import { returnFlights, cities, topDestinations } from "@/data/destinations";

// Combine all destinations for lookup (only those with price)
const allDestinations = [...returnFlights, ...cities];

// City to Kiwi.com slug mapping
const cityToSlug: Record<string, string> = {
  "barcelona": "barcelona-spain",
  "londýn": "london-united-kingdom",
  "london": "london-united-kingdom",
  "paříž": "paris-france",
  "paris": "paris-france",
  "řím": "rome-italy",
  "rome": "rome-italy",
  "new york": "new-york-city-new-york-united-states",
  "amsterdam": "amsterdam-netherlands",
  "berlín": "berlin-germany",
  "berlin": "berlin-germany",
  "vídeň": "vienna-austria",
  "vienna": "vienna-austria",
  "madrid": "madrid-spain",
  "lisabon": "lisbon-portugal",
  "lisbon": "lisbon-portugal",
  "dubaj": "dubai-united-arab-emirates",
  "dubai": "dubai-united-arab-emirates",
  "bangkok": "bangkok-thailand",
  "tokio": "tokyo-japan",
  "tokyo": "tokyo-japan",
  "mallorka": "palma-mallorca-spain",
  "mallorca": "palma-mallorca-spain",
  "tenerife": "tenerife-spain",
  "kréta": "heraklion-greece",
  "crete": "heraklion-greece",
  "rhodos": "rhodes-greece",
  "rhodes": "rhodes-greece",
  "turecko": "antalya-turkey",
  "antalya": "antalya-turkey",
  "egypt": "hurghada-egypt",
  "hurghada": "hurghada-egypt",
  "milán": "milan-italy",
  "milan": "milan-italy",
  "benátky": "venice-italy",
  "venice": "venice-italy",
  "praha": "prague-czech-republic",
  "prague": "prague-czech-republic",
};

export default function Wishlist() {
  const { wishlist, toggleWishlist, toggleFavorite, clearWishlist } = useWishlist();
  const [sortBy, setSortBy] = useState<"price" | "name" | "date" | "favorite">("price");
  const [filterBy, setFilterBy] = useState<"all" | "favorites">("all");

  // Get destination details from wishlist IDs
  const wishlistItems = wishlist
    .map((item: WishlistItem) => {
      // Extract destination name from ID (e.g., "city_london" -> "london")
      const destName = item.id.replace(/^city_/, "").replace(/_/g, " ");
      
      // Find destination in our data
      const destination = allDestinations.find(
        (d) => d.name.toLowerCase().includes(destName) || destName.includes(d.name.toLowerCase())
      );

      if (!destination || !('price' in destination)) return null;

      return {
        id: item.id,
        name: destination.name,
        country: destination.country,
        price: destination.price,
        image: destination.image,
        addedAt: item.addedAt,
        isFavorite: item.isFavorite,
        // Simulate price history (random fluctuation)
        priceHistory: {
          yesterday: Math.round(destination.price * (1 + (Math.random() * 0.2 - 0.1))),
          lastWeek: Math.round(destination.price * (1 + (Math.random() * 0.3 - 0.15))),
        },
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Filter wishlist items
  const filteredItems = wishlistItems.filter(item => {
    if (filterBy === "favorites") {
      return item.isFavorite;
    }
    return true;
  });

  // Sort wishlist items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "price") {
      return a.price - b.price;
    }
    if (sortBy === "date") {
      return b.addedAt - a.addedAt; // Newest first
    }
    if (sortBy === "favorite") {
      return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0); // Favorites first
    }
    return a.name.localeCompare(b.name);
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("cs-CZ").format(price) + " Kč";
  };

  const getPriceChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(change).toFixed(1),
      isIncrease: change > 0,
    };
  };

  const getKiwiUrl = (destName: string) => {
    const destSlug = cityToSlug[destName.toLowerCase()] || destName.toLowerCase().replace(/\s+/g, "-");
    return `https://www.kiwi.com/cs/search/results/prague-czech-republic/${destSlug}?affilid=akcniletenkyakcniletenky`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="flex items-center gap-2 text-[#003087] hover:text-[#E91E63] transition-colors">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
                <span className="font-bold text-xl">AKČNÍ-LETENKY.com</span>
              </a>
            </Link>
            <Button asChild variant="outline">
              <Link href="/">
                <a>← Zpět na hlavní stránku</a>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#003087] mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8 fill-red-500 text-red-500" />
            Váš Seznam Přání
          </h1>
          <p className="text-gray-600">
            Sledujte ceny vašich oblíbených destinací a rezervujte ve správný moment
          </p>
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Váš seznam přání je prázdný
            </h2>
            <p className="text-gray-500 mb-6">
              Začněte přidávat destinace kliknutím na ❤️ ikonu u nabídek
            </p>
            <Button asChild size="lg">
              <Link href="/">
                <a>Prohlédnout nabídky</a>
              </Link>
            </Button>
          </div>
        )}

        {/* Wishlist Items */}
        {wishlistItems.length > 0 && (
          <>
            {/* Controls */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm font-semibold text-gray-700">
                    {sortedItems.length} {sortedItems.length === 1 ? "destinace" : "destinací"}
                    {filterBy === "favorites" && " (oblíbené)"}
                  </span>
                  <div className="h-4 w-px bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Filtr:</label>
                    <select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value as "all" | "favorites")}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    >
                      <option value="all">Všechny destinace</option>
                      <option value="favorites">⭐ Pouze oblíbené</option>
                    </select>
                  </div>
                  <div className="h-4 w-px bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Řadit podle:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "price" | "name" | "date" | "favorite")}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    >
                      <option value="price">Ceny (nejlevnější)</option>
                      <option value="name">Názvu (A-Z)</option>
                      <option value="date">Data přidání (nejnovější)</option>
                      <option value="favorite">Oblíbenosti</option>
                    </select>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearWishlist}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Vymazat vše
                </Button>
              </div>
            </div>

            {/* Destination Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedItems.map((item) => {
                const priceChange = getPriceChange(item.price, item.priceHistory.yesterday);
                const weekChange = getPriceChange(item.price, item.priceHistory.lastWeek);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <div
                        className="h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${item.image})` }}
                      />
                      {/* Action buttons */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        {/* Favorite star button */}
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className="bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110"
                          aria-label={item.isFavorite ? `Odebrat ${item.name} z oblíbených` : `Přidat ${item.name} do oblíbených`}
                        >
                          <Star className={`w-5 h-5 ${item.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                        </button>
                        {/* Remove from wishlist button */}
                        <button
                          onClick={() => toggleWishlist(item.id)}
                          className="bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110"
                          aria-label={`Odebrat ${item.name} ze seznamu přání`}
                        >
                          <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-xl mb-1 text-[#003087]">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500">{item.country}</p>
                        </div>
                        {item.isFavorite && (
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-4">
                        Přidáno: {new Date(item.addedAt).toLocaleDateString('cs-CZ')}
                      </p>

                      {/* Current Price */}
                      <div className="mb-4">
                        <div className="text-3xl font-bold text-[#E91E63] mb-1">
                          {formatPrice(item.price)}
                        </div>
                        <div className="text-xs text-gray-500">za zpáteční letenku</div>
                      </div>

                      {/* Price History */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
                        <div className="text-xs font-semibold text-gray-700 mb-2">
                          Vývoj ceny:
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Včera:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700">
                              {formatPrice(item.priceHistory.yesterday)}
                            </span>
                            {priceChange.isIncrease ? (
                              <span className="flex items-center text-red-600 text-xs">
                                <TrendingUp className="w-3 h-3 mr-0.5" />
                                +{priceChange.percentage}%
                              </span>
                            ) : (
                              <span className="flex items-center text-green-600 text-xs">
                                <TrendingDown className="w-3 h-3 mr-0.5" />
                                -{priceChange.percentage}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Před týdnem:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700">
                              {formatPrice(item.priceHistory.lastWeek)}
                            </span>
                            {weekChange.isIncrease ? (
                              <span className="flex items-center text-red-600 text-xs">
                                <TrendingUp className="w-3 h-3 mr-0.5" />
                                +{weekChange.percentage}%
                              </span>
                            ) : (
                              <span className="flex items-center text-green-600 text-xs">
                                <TrendingDown className="w-3 h-3 mr-0.5" />
                                -{weekChange.percentage}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <a
                        href={getKiwiUrl(item.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button className="w-full bg-[#E91E63] hover:bg-[#C2185B] text-white font-bold">
                          Rezervovat nyní
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Alert Info */}
            <div className="mt-8 bg-gradient-to-r from-[#E91E63] to-[#FF6B35] text-white rounded-xl shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">
                    💡 Tip: Sledujte ceny a rezervujte ve správný moment
                  </h3>
                  <p className="text-white/90 text-sm">
                    Ceny letenek se mění každý den. Přihlaste se k odběru newsletteru a dostávejte upozornění,
                    když cena vaší oblíbené destinace klesne!
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="container text-center text-gray-600 text-sm">
          <p>© 2026 AKČNÍ-LETENKY.com | Nejlevnější letenky po celém světě</p>
        </div>
      </footer>
    </div>
  );
}
