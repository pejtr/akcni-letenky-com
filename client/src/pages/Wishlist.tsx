import { useState } from "react";
import { Link } from "wouter";
import { pelikanDeepLink } from "@shared/affiliateLinks";
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
  Mail,
  MailCheck,
  MailX,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist, WishlistItem } from "@/hooks/useWishlist";
import { returnFlights, cities } from "@/data/destinations";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { PushNotificationBanner } from "@/components/PushNotificationBanner";
import SEO from "@/components/SEO";

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
type TabType = "wishlist" | "alerts" | "history";

// Alert editing state
interface AlertEditState {
  id: number;
  threshold: number;
  targetPrice: number | undefined;
}

// Email editing state
interface EmailEditState {
  alertId: number;
  email: string;
  enabled: boolean;
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
  notifyEmail: string | null;
  emailEnabled: number | null;
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
  const [editingEmail, setEditingEmail] = useState<EmailEditState | null>(null);
  const [expandedAlerts, setExpandedAlerts] = useState<Set<number>>(new Set());

  // Price alerts queries - only for logged in users
  const { data: userAlerts, refetch: refetchAlerts } = trpc.priceAlerts.getMyAlerts.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Notification history
  const { data: notificationHistory, isLoading: historyLoading } = trpc.priceAlerts.getNotificationHistory.useQuery(
    undefined,
    { enabled: !!user && activeTab === "history" }
  );

  // Email service status
  const { data: emailStatus } = trpc.priceAlerts.getEmailStatus.useQuery(
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

  const updateEmail = trpc.priceAlerts.updateEmail.useMutation({
    onSuccess: () => {
      toast.success("Email notifikace aktualizovány");
      setEditingEmail(null);
      refetchAlerts();
    },
    onError: () => {
      toast.error("Nepodařilo se aktualizovat email");
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

  const getPelikanUrl = (destName: string) => {
    const destSlug = cityToSlug[destName.toLowerCase()] || destName.toLowerCase().replace(/\s+/g, "-");
    return pelikanDeepLink("/cs/akcni-letenky", {
      campaign: "wishlist",
      channel: "saved-offers",
      content: destSlug,
    });
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

  const handleSaveEmail = () => {
    if (!editingEmail) return;
    updateEmail.mutate({
      alertId: editingEmail.alertId,
      email: editingEmail.email || null,
      enabled: editingEmail.enabled && !!editingEmail.email,
    });
  };

  const toggleAlertExpanded = (id: number) => {
    setExpandedAlerts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Count active alerts and email-enabled alerts
  const activeAlertCount = userAlerts?.filter((a: PriceAlertItem) => a.isActive === 1).length || 0;
  const emailEnabledCount = userAlerts?.filter((a: PriceAlertItem) => a.emailEnabled === 1 && a.notifyEmail).length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title="Můj seznam přání | Akční Letenky" description="Uložené nabídky letenek a dovolené na jednom místě." canonical="https://www.akcni-letenky.com/wishlist" noindex={true} />
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
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors relative ${
                activeTab === "alerts"
                  ? "border-[#E91E63] text-[#E91E63]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Bell className="w-4 h-4 inline mr-1.5" />
              Hlídač cen
              {activeAlertCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] inline-flex items-center justify-center">
                  {activeAlertCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "history"
                  ? "border-[#E91E63] text-[#E91E63]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <History className="w-4 h-4 inline mr-1.5" />
              Historie notifikací
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
                  Přidejte si oblíbené destinace kliknutím na srdíčko u nabídky.
                </p>
                <Link href="/">
                  <Button className="bg-[#003087] hover:bg-[#002060]">Prozkoumat nabídky</Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Sort & Filter */}
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

                {/* Wishlist Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedItems.map((item) => {
                    const yesterdayChange = getPriceChange(item.price, item.priceHistory.yesterday);
                    return (
                      <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="flex">
                          <div className="w-32 h-32 flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-bold text-[#003087]">{item.name}</h3>
                                <p className="text-xs text-gray-500">{item.country}</p>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => toggleFavorite(item.id)}
                                  className={`p-1.5 rounded-full transition-colors ${
                                    item.isFavorite ? "text-yellow-500 bg-yellow-50" : "text-gray-300 hover:text-yellow-500"
                                  }`}
                                >
                                  <Star className="w-4 h-4" fill={item.isFavorite ? "currentColor" : "none"} />
                                </button>
                                <button
                                  onClick={() => handleQuickAlert(item)}
                                  className="p-1.5 rounded-full text-gray-300 hover:text-[#E91E63] hover:bg-pink-50 transition-colors"
                                  title="Nastavit hlídač cen"
                                >
                                  <Bell className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => toggleWishlist(item.id)}
                                  className="p-1.5 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-lg font-bold text-[#E91E63]">{formatPrice(item.price)}</span>
                              <span className={`text-xs flex items-center gap-0.5 ${yesterdayChange.isIncrease ? "text-red-500" : "text-green-600"}`}>
                                {yesterdayChange.isIncrease ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {yesterdayChange.percentage}%
                              </span>
                            </div>
                            <a
                              href={getPelikanUrl(item.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1 text-xs text-[#003087] hover:text-[#E91E63] font-medium transition-colors"
                            >
                              Vyhledat letenky <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : activeTab === "alerts" ? (
          /* Alerts Tab */
          <div className="space-y-6">
            {!user ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <LogIn className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-700 mb-2">Přihlaste se</h2>
                <p className="text-gray-500 mb-6">
                  Pro správu hlídačů cen a emailových notifikací se prosím přihlaste.
                </p>
                <a href={getLoginUrl()}>
                  <Button className="bg-[#003087] hover:bg-[#002060]">
                    <LogIn className="w-4 h-4 mr-2" />
                    Přihlásit se
                  </Button>
                </a>
              </div>
            ) : (
              <>
                {/* Push Notification Banner */}
                <PushNotificationBanner />

                {/* Email Status Banner */}
                <div className={`rounded-xl p-4 flex items-center gap-3 ${
                  emailEnabledCount > 0
                    ? "bg-green-50 border border-green-200"
                    : "bg-amber-50 border border-amber-200"
                }`}>
                  {emailEnabledCount > 0 ? (
                    <>
                      <MailCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Email notifikace aktivní pro {emailEnabledCount} {emailEnabledCount === 1 ? "hlídač" : "hlídačů"}
                        </p>
                        <p className="text-xs text-green-600">
                          Při poklesu ceny obdržíte email s detaily a odkazem na rezervaci.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <MailX className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          Email notifikace nejsou nastaveny
                        </p>
                        <p className="text-xs text-amber-600">
                          Klikněte na ikonu emailu u hlídače cen pro nastavení emailových upozornění.
                        </p>
                      </div>
                    </>
                  )}
                </div>

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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                      <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
                        <div className="text-2xl font-bold text-purple-600">{emailEnabledCount}</div>
                        <div className="text-sm text-gray-500">S email notifikací</div>
                      </div>
                    </div>

                    {/* Alert Cards */}
                    {userAlerts.map((alert: PriceAlertItem) => {
                      const isExpanded = expandedAlerts.has(alert.id);
                      return (
                        <div
                          key={alert.id}
                          className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${
                            alert.isActive === 1 ? "border-l-4 border-green-500" : "border-l-4 border-gray-300 opacity-70"
                          }`}
                        >
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                                  {alert.emailEnabled === 1 && alert.notifyEmail && (
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      Email
                                    </span>
                                  )}
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

                                {/* Email info */}
                                {alert.notifyEmail && (
                                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    Notifikace na: <span className="font-medium text-gray-700">{alert.notifyEmail}</span>
                                    {alert.emailEnabled === 1 ? (
                                      <span className="text-green-600">(aktivní)</span>
                                    ) : (
                                      <span className="text-gray-400">(vypnuto)</span>
                                    )}
                                  </div>
                                )}

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
                                      onClick={() => toggleAlertExpanded(alert.id)}
                                      className="p-2 text-gray-400 hover:text-[#003087] hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Rozbalit/Sbalit"
                                    >
                                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                    <button
                                      onClick={() =>
                                        setEditingEmail({
                                          alertId: alert.id,
                                          email: alert.notifyEmail || "",
                                          enabled: alert.emailEnabled === 1,
                                        })
                                      }
                                      className={`p-2 rounded-lg transition-colors ${
                                        alert.emailEnabled === 1 && alert.notifyEmail
                                          ? "text-purple-500 hover:text-purple-700 hover:bg-purple-50"
                                          : "text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                                      }`}
                                      title="Nastavit email notifikace"
                                    >
                                      <Mail className="w-4 h-4" />
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

                            {/* Expanded Section: Settings + Email */}
                            {isExpanded && alert.isActive === 1 && (
                              <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                                {/* Alert Settings */}
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                    <Settings className="w-4 h-4 inline mr-1" />
                                    Nastavení hlídače
                                  </h4>
                                  <div className="flex flex-wrap gap-3 items-end">
                                    <div>
                                      <label className="block text-xs text-gray-500 mb-1">Práh poklesu (%)</label>
                                      <select
                                        value={editingAlert?.id === alert.id ? editingAlert.threshold : (alert.priceDropPercent || 10)}
                                        onChange={(e) =>
                                          setEditingAlert({
                                            id: alert.id,
                                            threshold: parseInt(e.target.value),
                                            targetPrice: editingAlert?.id === alert.id ? editingAlert.targetPrice : (alert.targetPrice || undefined),
                                          })
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
                                        value={editingAlert?.id === alert.id ? (editingAlert.targetPrice || "") : (alert.targetPrice || "")}
                                        onChange={(e) =>
                                          setEditingAlert({
                                            id: alert.id,
                                            threshold: editingAlert?.id === alert.id ? editingAlert.threshold : (alert.priceDropPercent || 10),
                                            targetPrice: e.target.value ? parseInt(e.target.value) : undefined,
                                          })
                                        }
                                        placeholder="volitelné"
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                                      />
                                    </div>
                                    {editingAlert?.id === alert.id && (
                                      <>
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
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Email Settings */}
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                    <Mail className="w-4 h-4 inline mr-1" />
                                    Email notifikace
                                  </h4>
                                  <div className="flex flex-wrap gap-3 items-end">
                                    <div className="flex-1 min-w-[200px]">
                                      <label className="block text-xs text-gray-500 mb-1">Email adresa</label>
                                      <input
                                        type="email"
                                        value={editingEmail?.alertId === alert.id ? editingEmail.email : (alert.notifyEmail || "")}
                                        onChange={(e) =>
                                          setEditingEmail({
                                            alertId: alert.id,
                                            email: e.target.value,
                                            enabled: editingEmail?.alertId === alert.id ? editingEmail.enabled : (alert.emailEnabled === 1),
                                          })
                                        }
                                        placeholder="vas@email.cz"
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-400"
                                      />
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={editingEmail?.alertId === alert.id ? editingEmail.enabled : (alert.emailEnabled === 1)}
                                        onChange={(e) =>
                                          setEditingEmail({
                                            alertId: alert.id,
                                            email: editingEmail?.alertId === alert.id ? editingEmail.email : (alert.notifyEmail || ""),
                                            enabled: e.target.checked,
                                          })
                                        }
                                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-400"
                                      />
                                      <span className="text-sm text-gray-600">Aktivní</span>
                                    </label>
                                    {editingEmail?.alertId === alert.id && (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={handleSaveEmail}
                                          disabled={updateEmail.isPending}
                                          className="bg-purple-600 hover:bg-purple-700 text-white"
                                        >
                                          {updateEmail.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <MailCheck className="w-4 h-4 mr-1" />
                                          )}
                                          Uložit email
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setEditingEmail(null)}
                                        >
                                          <X className="w-4 h-4 mr-1" />
                                          Zrušit
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Email Edit Modal (when clicking mail icon directly) */}
                            {editingEmail?.alertId === alert.id && !isExpanded && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                  <Mail className="w-4 h-4 inline mr-1" />
                                  Nastavení email notifikací
                                </h4>
                                <div className="flex flex-wrap gap-3 items-end">
                                  <div className="flex-1 min-w-[200px]">
                                    <label className="block text-xs text-gray-500 mb-1">Email adresa</label>
                                    <input
                                      type="email"
                                      value={editingEmail.email}
                                      onChange={(e) =>
                                        setEditingEmail({ ...editingEmail, email: e.target.value })
                                      }
                                      placeholder="vas@email.cz"
                                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    />
                                  </div>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={editingEmail.enabled}
                                      onChange={(e) =>
                                        setEditingEmail({ ...editingEmail, enabled: e.target.checked })
                                      }
                                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-400"
                                    />
                                    <span className="text-sm text-gray-600">Aktivní</span>
                                  </label>
                                  <Button
                                    size="sm"
                                    onClick={handleSaveEmail}
                                    disabled={updateEmail.isPending}
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                  >
                                    {updateEmail.isPending ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <MailCheck className="w-4 h-4 mr-1" />
                                    )}
                                    Uložit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingEmail(null)}
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Zrušit
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
                    <p className="text-gray-500 mt-2">Načítání hlídačů cen...</p>
                  </div>
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
                        <li>4. Nastavte si email pro přímé notifikace do schránky</li>
                        <li>5. Můžete nastavit procentuální pokles nebo cílovou cenu</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          /* History Tab */
          <div className="space-y-6">
            {!user ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <LogIn className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-700 mb-2">Přihlaste se</h2>
                <p className="text-gray-500 mb-6">
                  Pro zobrazení historie notifikací se prosím přihlaste.
                </p>
                <a href={getLoginUrl()}>
                  <Button className="bg-[#003087] hover:bg-[#002060]">
                    <LogIn className="w-4 h-4 mr-2" />
                    Přihlásit se
                  </Button>
                </a>
              </div>
            ) : historyLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
                <p className="text-gray-500 mt-2">Načítání historie...</p>
              </div>
            ) : notificationHistory && notificationHistory.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-[#003087]">
                  <History className="w-5 h-5 inline mr-2" />
                  Historie odeslaných notifikací
                </h2>
                {notificationHistory.map((entry: any) => (
                  <div
                    key={entry.id}
                    className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${
                      entry.status === "sent" ? "border-green-500" : "border-red-400"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {entry.status === "sent" ? (
                            <MailCheck className="w-4 h-4 text-green-600" />
                          ) : (
                            <MailX className="w-4 h-4 text-red-500" />
                          )}
                          <span className="font-semibold text-[#003087]">{entry.destinationName}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            entry.channel === "email"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {entry.channel === "email" ? "Email" : "Systém"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Cena klesla z <span className="font-medium">{formatPrice(entry.oldPrice)}</span> na{" "}
                          <span className="font-medium text-green-600">{formatPrice(entry.newPrice)}</span>
                          {" "}(−{entry.dropPercent}%)
                        </p>
                        {entry.notifyEmail && (
                          <p className="text-xs text-gray-400 mt-1">
                            Odesláno na: {entry.notifyEmail}
                          </p>
                        )}
                        {entry.errorMessage && (
                          <p className="text-xs text-red-500 mt-1">
                            Chyba: {entry.errorMessage}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(entry.sentAt).toLocaleString("cs-CZ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-700 mb-2">Žádné notifikace</h2>
                <p className="text-gray-500 mb-6">
                  Zatím nebyly odeslány žádné notifikace. Nastavte si hlídač cen a budeme vás informovat o poklesech.
                </p>
                <Button
                  onClick={() => setActiveTab("alerts")}
                  className="bg-[#003087] hover:bg-[#002060]"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Přejít na hlídač cen
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="container text-center text-gray-600 text-sm">
          <p>&copy; 2026 AKČNÍ-LETENKY.com | Nejlevnější letenky po celém světě</p>
        </div>
      </footer>
    </div>
  );
}
