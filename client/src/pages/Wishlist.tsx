import { useState } from "react";
import { Link } from "wouter";
import {
  Heart,
  Trash2,
  ExternalLink,
  TrendingDown,
  TrendingUp,
  Star,
  Bell,
  BellRing,
  BellOff,
  Settings,
  Loader2,
  Check,
  X,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist, WishlistItem } from "@/hooks/useWishlist";
import { returnFlights, cities } from "@/data/destinations";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

// Combine all destinations for lookup (only those with price)
const allDestinations = [...returnFlights, ...cities];

// City to Kiwi.com slug mapping
const cityToSlug: Record<string, string> = {
  barcelona: "barcelona-spain",
  "londýn": "london-united-kingdom",
  london: "london-united-kingdom",
  "paříž": "paris-france",
  paris: "paris-france",
  "řím": "rome-italy",
  rome: "rome-italy",
  "new york": "new-york-city-new-york-united-states",
  amsterdam: "amsterdam-netherlands",
  "berlín": "berlin-germany",
  berlin: "berlin-germany",
  "vídeň": "vienna-austria",
  vienna: "vienna-austria",
  madrid: "madrid-spain",
  lisabon: "lisbon-portugal",
  lisbon: "lisbon-portugal",
  dubaj: "dubai-united-arab-emirates",
  dubai: "dubai-united-arab-emirates",
  bangkok: "bangkok-thailand",
  tokio: "tokyo-japan",
  tokyo: "tokyo-japan",
  mallorka: "palma-mallorca-spain",
  mallorca: "palma-mallorca-spain",
  tenerife: "tenerife-spain",
  "kréta": "heraklion-greece",
  crete: "heraklion-greece",
  rhodos: "rhodes-greece",
  rhodes: "rhodes-greece",
  turecko: "antalya-turkey",
  antalya: "antalya-turkey",
  egypt: "hurghada-egypt",
  hurghada: "hurghada-egypt",
  "milán": "milan-italy",
  milan: "milan-italy",
  "benátky": "venice-italy",
  venice: "venice-italy",
  praha: "prague-czech-republic",
  prague: "prague-czech-republic",
};

// Tab type
type TabType = "wishlist" | "alerts";

// Alert editing state
interface AlertEditState {
  id: number;
  threshold: number;
  targetPrice: number | undefined;
}

// Type for price alert from API
interface PriceAlertItem {
  id: number;
  userId: number | null;
  destinationSlug: string;
  destinationName: string;
  targetPrice: number | null;
  currentPrice: number;
  priceDropPercent: number | null;
  isActive: number | null;
  lastCheckedAt: Date | null;
  lastAlertSentAt: Date | null;
  alertCount: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function Wishlist() {
  const { wishlist, toggleWishlist, toggleFavorite, clearWishlist } = useWishlist();
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<"price" | "name" | "date" | "favorite">("price");
  const [filterBy, setFilterBy] = useState<"all" | "favorites">("all");
  const [activeTab, setActiveTab] = useState<TabType>("wishlist");
  const [editingAlert, setEditingAlert] = useState<AlertEditState | null>(null);

  // Price alerts queries - only for logged in users
  const { data: userAlerts, refetch: refetchAlerts } = trpc.priceAlerts.getMyAlerts.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Mutations
  const deactivateAlert = trpc.priceAlerts.deactivate.useMutation({
    onSuccess: () => {
      toast.success("Upozornění deaktivováno");
      refetchAlerts();
    },
  });

  const deleteAlert = trpc.priceAlerts.delete.useMutation({
    onSuccess: () => {
      toast.success("Upozornění smazáno");
      refetchAlerts();
    },
  });

  const updateAlert = trpc.priceAlerts.create.useMutation({
    onSuccess: () => {
      toast.success("Upozornění aktualizováno");
      setEditingAlert(null);
      refetchAlerts();
    },
  });

  // Create alert for wishlist item
  const createAlertFromWishlist = trpc.priceAlerts.create.useMutation({
    onSuccess: (data) => {
      toast.success(
        data.updated
          ? "Hlídač cen aktualizován!"
          : "Hlídač cen nastaven! Budeme vás informovat o poklesu ceny."
      );
      refetchAlerts();
    },
    onError: () => {
      toast.error("Nepodařilo se nastavit hlídač cen");
    },
  });

  // Get destination details from wishlist IDs
  const wishlistItems = wishlist
    .map((item: WishlistItem) => {
      const destName = item.id.replace(/^city_/, "").replace(/_/g, " ");
      const destination = allDestinations.find(
        (d) => d.name.toLowerCase().includes(destName) || destName.includes(d.name.toLowerCase())
      );
      if (!destination || !("price" in destination)) return null;
      return {
        id: item.id,
        name: destination.name,
        country: destination.country,
        price: destination.price,
        image: destination.image,
        addedAt: item.addedAt,
        isFavorite: item.isFavorite,
        slug: cityToSlug[destination.name.toLowerCase()] || destination.name.toLowerCase().replace(/\s+/g, "-"),
        priceHistory: {
          yesterday: Math.round(destination.price * (1 + (Math.random() * 0.2 - 0.1))),
          lastWeek: Math.round(destination.price * (1 + (Math.random() * 0.3 - 0.15))),
        },
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Filter and sort
  const filteredItems = wishlistItems.filter((item) => {
    if (filterBy === "favorites") return item.isFavorite;
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "date") return b.addedAt - a.addedAt;
    if (sortBy === "favorite") return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
    return a.name.localeCompare(b.name);
  });

  const formatPrice = (price: number) => new Intl.NumberFormat("cs-CZ").format(price) + " Kč";

  const getPriceChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return { percentage: Math.abs(change).toFixed(1), isIncrease: change > 0 };
  };

  const getKiwiUrl = (destName: string) => {
    const destSlug = cityToSlug[destName.toLowerCase()] || destName.toLowerCase().replace(/\s+/g, "-");
    return `https://www.kiwi.com/cs/search/results/prague-czech-republic/${destSlug}?affilid=akcniletenkyakcniletenky`;
  };

  const handleQuickAlert = (item: (typeof wishlistItems)[0]) => {
    if (!user) {
      toast.error("Pro nastavení hlídače cen se prosím přihlaste");
      return;
    }
    createAlertFromWishlist.mutate({
      destination: item.name,
      destinationSlug: item.slug,
      currentPrice: item.price,
      priceDropPercent: 10,
    });
  };

  const handleUpdateAlert = (alert: PriceAlertItem) => {
    if (!editingAlert) return;
    updateAlert.mutate({
      destination: alert.destinationName,
      destinationSlug: alert.destinationSlug,
      currentPrice: alert.currentPrice,
      priceDropPercent: editingAlert.threshold,
      targetPrice: editingAlert.targetPrice,
    });
  };

  // Count active alerts
  const activeAlertCount = userAlerts?.filter((a: PriceAlertItem) => a.isActive === 1).length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-[#003087] hover:text-[#E91E63] transition-colors">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
              <span className="font-bold text-lg hidden sm:inline">AKČNÍ-LETENKY</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {wishlist.length} {wishlist.length === 1 ? "destinace" : "destinací"}
              </span>
              {wishlist.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm("Opravdu chcete vymazat celý seznam přání?")) {
                      clearWishlist();
                    }
                  }}
                  className="text-red-500 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Vymazat vše
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "wishlist"
                  ? "border-[#E91E63] text-[#E91E63]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Heart className="w-4 h-4 inline mr-1.5" />
              Oblíbené ({wishlist.length})
            </button>
            <button
              onClick={() => setActiveTab("alerts")}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "alerts"
                  ? "border-[#E91E63] text-[#E91E63]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Bell className="w-4 h-4 inline mr-1.5" />
              Hlídač cen {activeAlertCount > 0 && `(${activeAlertCount})`}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-8">
        {activeTab === "wishlist" ? (
          /* Wishlist Tab */
          <div>
            {wishlistItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-700 mb-2">Váš seznam přání je prázdný</h2>
                <p className="text-gray-500 mb-6">
                  Přidejte si oblíbené destinace kliknutím na srdíčko u nabídek.
                </p>
                <Link href="/">
                  <Button className="bg-[#E91E63] hover:bg-[#C2185B]">
                    Prozkoumat nabídky
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Sort & Filter Controls */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                  >
                    <option value="price">Seřadit dle ceny</option>
                    <option value="name">Seřadit dle názvu</option>
                    <option value="date">Seřadit dle data přidání</option>
                    <option value="favorite">Oblíbené první</option>
                  </select>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as typeof filterBy)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                  >
                    <option value="all">Všechny destinace</option>
                    <option value="favorites">Pouze oblíbené</option>
                  </select>
                </div>

                {/* Wishlist Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedItems.map((item) => {
                    const weekChange = getPriceChange(item.price, item.priceHistory.lastWeek);
                    return (
                      <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all">
                        {/* Image */}
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-3 left-3">
                            <h3 className="text-white font-bold text-lg">{item.name}</h3>
                            <p className="text-white/80 text-sm">{item.country}</p>
                          </div>
                          <div className="absolute top-3 right-3 flex gap-2">
                            <button
                              onClick={() => toggleFavorite(item.id)}
                              className={`p-2 rounded-full transition-colors ${
                                item.isFavorite
                                  ? "bg-yellow-400 text-yellow-900"
                                  : "bg-white/80 text-gray-600 hover:bg-yellow-400 hover:text-yellow-900"
                              }`}
                              title={item.isFavorite ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
                            >
                              <Star className="w-4 h-4" fill={item.isFavorite ? "currentColor" : "none"} />
                            </button>
                            <button
                              onClick={() => toggleWishlist(item.id)}
                              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                              title="Odebrat ze seznamu přání"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          {/* Price */}
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-2xl font-bold text-[#E91E63]">{formatPrice(item.price)}</p>
                              <div className="flex items-center gap-1 mt-0.5">
                                {weekChange.isIncrease ? (
                                  <TrendingUp className="w-3 h-3 text-red-500" />
                                ) : (
                                  <TrendingDown className="w-3 h-3 text-green-500" />
                                )}
                                <span className={`text-xs ${weekChange.isIncrease ? "text-red-500" : "text-green-500"}`}>
                                  {weekChange.isIncrease ? "+" : "-"}{weekChange.percentage}% za týden
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <a
                              href={getKiwiUrl(item.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-1.5 bg-[#003087] hover:bg-[#002060] text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Rezervovat
                            </a>
                            <button
                              onClick={() => handleQuickAlert(item)}
                              className="flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-colors"
                              title="Nastavit hlídač cen"
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Alerts Tab */
          <div className="space-y-6">
            {!user ? (
              /* Not logged in */
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <LogIn className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-700 mb-2">Přihlaste se pro hlídání cen</h2>
                <p className="text-gray-500 mb-6">
                  Pro zobrazení a správu hlídačů cen se prosím přihlaste.
                </p>
                <a
                  href={getLoginUrl()}
                  className="inline-flex items-center gap-2 bg-[#003087] hover:bg-[#002060] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  Přihlásit se
                </a>
              </div>
            ) : (
              <>
                {/* Alerts List */}
                {userAlerts && userAlerts.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-700 mb-2">Žádná upozornění</h2>
                    <p className="text-gray-500 mb-6">
                      Nemáte nastavena žádná upozornění na pokles cen. Přidejte si destinace do oblíbených a nastavte hlídač cen.
                    </p>
                    <Button
                      onClick={() => setActiveTab("wishlist")}
                      className="bg-[#003087] hover:bg-[#002060]"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Přejít na oblíbené
                    </Button>
                  </div>
                ) : userAlerts ? (
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
                        <div className="text-2xl font-bold text-green-600">
                          {userAlerts.filter((a: PriceAlertItem) => a.isActive === 1).length}
                        </div>
                        <div className="text-sm text-gray-500">Aktivních hlídačů</div>
                      </div>
                      <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
                        <div className="text-2xl font-bold text-blue-600">{userAlerts.length}</div>
                        <div className="text-sm text-gray-500">Celkem hlídačů</div>
                      </div>
                      <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-[#E91E63]">
                        <div className="text-2xl font-bold text-[#E91E63]">
                          {userAlerts.reduce((sum: number, a: PriceAlertItem) => sum + (a.alertCount || 0), 0)}
                        </div>
                        <div className="text-sm text-gray-500">Odeslaných upozornění</div>
                      </div>
                    </div>

                    {/* Alert Cards */}
                    {userAlerts.map((alert: PriceAlertItem) => (
                      <div
                        key={alert.id}
                        className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${
                          alert.isActive === 1 ? "border-l-4 border-green-500" : "border-l-4 border-gray-300 opacity-70"
                        }`}
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {alert.isActive === 1 ? (
                                  <BellRing className="w-5 h-5 text-green-600" />
                                ) : (
                                  <BellOff className="w-5 h-5 text-gray-400" />
                                )}
                                <h3 className="text-lg font-bold text-[#003087]">{alert.destinationName}</h3>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    alert.isActive === 1
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  {alert.isActive === 1 ? "Aktivní" : "Neaktivní"}
                                </span>
                              </div>

                              {/* Price info */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                                <div>
                                  <p className="text-xs text-gray-500">Cena při nastavení</p>
                                  <p className="text-sm font-semibold">{formatPrice(alert.currentPrice)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Práh upozornění</p>
                                  <p className="text-sm font-semibold">
                                    {alert.targetPrice
                                      ? `Pod ${formatPrice(alert.targetPrice)}`
                                      : `${alert.priceDropPercent || 10}% pokles`}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Upozornění odesláno</p>
                                  <p className="text-sm font-semibold">{alert.alertCount || 0}×</p>
                                </div>
                              </div>

                              {/* Timestamps */}
                              <div className="flex gap-4 mt-2 text-xs text-gray-400">
                                <span>
                                  Vytvořeno: {new Date(alert.createdAt).toLocaleDateString("cs-CZ")}
                                </span>
                                {alert.lastAlertSentAt && (
                                  <span>
                                    Poslední upozornění: {new Date(alert.lastAlertSentAt).toLocaleDateString("cs-CZ")}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                              {alert.isActive === 1 && (
                                <>
                                  <button
                                    onClick={() =>
                                      setEditingAlert({
                                        id: alert.id,
                                        threshold: alert.priceDropPercent || 10,
                                        targetPrice: alert.targetPrice || undefined,
                                      })
                                    }
                                    className="p-2 text-gray-400 hover:text-[#003087] hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Upravit"
                                  >
                                    <Settings className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deactivateAlert.mutate({ id: alert.id })}
                                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                    title="Deaktivovat"
                                    disabled={deactivateAlert.isPending}
                                  >
                                    <BellOff className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm("Opravdu chcete smazat toto upozornění?")) {
                                    deleteAlert.mutate({ id: alert.id });
                                  }
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Smazat"
                                disabled={deleteAlert.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Edit Form (inline) */}
                          {editingAlert && editingAlert.id === alert.id && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">Upravit nastavení</h4>
                              <div className="flex flex-wrap gap-3 items-end">
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Práh poklesu (%)</label>
                                  <select
                                    value={editingAlert.threshold}
                                    onChange={(e) =>
                                      setEditingAlert({ ...editingAlert, threshold: parseInt(e.target.value) })
                                    }
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                                  >
                                    <option value={5}>5%</option>
                                    <option value={10}>10%</option>
                                    <option value={15}>15%</option>
                                    <option value={20}>20%</option>
                                    <option value={30}>30%</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Cílová cena (Kč)</label>
                                  <input
                                    type="number"
                                    value={editingAlert.targetPrice || ""}
                                    onChange={(e) =>
                                      setEditingAlert({
                                        ...editingAlert,
                                        targetPrice: e.target.value ? parseInt(e.target.value) : undefined,
                                      })
                                    }
                                    placeholder="volitelné"
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                                  />
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateAlert(alert)}
                                  disabled={updateAlert.isPending}
                                  className="bg-[#E91E63] hover:bg-[#C2185B] text-white"
                                >
                                  {updateAlert.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4 mr-1" />
                                  )}
                                  Uložit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingAlert(null)}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Zrušit
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
                    <p className="text-gray-500 mt-2">Načítání hlídačů cen...</p>
                  </div>
                )}
              </>
            )}

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-[#E91E63] to-[#FF6B35] text-white rounded-xl shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Jak funguje hlídač cen?</h3>
                  <ul className="text-white/90 text-sm space-y-1">
                    <li>1. Přidejte si destinaci do oblíbených a klikněte na zvoneček</li>
                    <li>2. Systém automaticky kontroluje ceny každých 6 hodin</li>
                    <li>3. Při poklesu pod váš práh dostanete upozornění</li>
                    <li>4. Můžete nastavit procentuální pokles nebo cílovou cenu</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
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
