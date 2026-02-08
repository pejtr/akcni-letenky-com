import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, MousePointerClick, MapPin, ArrowLeft, RefreshCw, Send, Bell, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  
  // Fetch affiliate click data
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.affiliate.getStats.useQuery(
    undefined,
    { enabled: user?.role === "admin" }
  );
  
  const { data: topDestinations, isLoading: destLoading } = trpc.affiliate.getTopDestinations.useQuery(
    { limit: 10 },
    { enabled: user?.role === "admin" }
  );
  
  const { data: clicksBySource, isLoading: sourceLoading } = trpc.affiliate.getClicksBySource.useQuery(
    undefined,
    { enabled: user?.role === "admin" }
  );
  
  const { data: clickTrend, isLoading: trendLoading } = trpc.affiliate.getClickTrend.useQuery(
    { days: 30 },
    { enabled: user?.role === "admin" }
  );
  
  const { data: recentClicks, isLoading: recentLoading } = trpc.affiliate.getRecentClicks.useQuery(
    { limit: 10 },
    { enabled: user?.role === "admin" }
  );

  // Check if user is admin
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-2">Přístup odepřen</h2>
            <p className="text-muted-foreground mb-4">
              Tato stránka je dostupná pouze pro administrátory.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zpět na hlavní stránku
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = statsLoading || destLoading || sourceLoading || trendLoading || recentLoading;

  // Calculate max clicks for chart scaling
  const maxTrendClicks = clickTrend ? Math.max(...clickTrend.map(d => d.clicks), 1) : 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zpět
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetchStats()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Obnovit
          </Button>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Dnes
              </CardTitle>
              <MousePointerClick className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {statsLoading ? "..." : stats?.today || 0}
              </div>
              <p className="text-xs text-muted-foreground">kliknutí</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tento týden
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {statsLoading ? "..." : stats?.thisWeek || 0}
              </div>
              <p className="text-xs text-muted-foreground">kliknutí</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tento měsíc
              </CardTitle>
              <BarChart3 className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {statsLoading ? "..." : stats?.thisMonth || 0}
              </div>
              <p className="text-xs text-muted-foreground">kliknutí</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Celkem
              </CardTitle>
              <MapPin className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {statsLoading ? "..." : stats?.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">kliknutí</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Click Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trend kliknutí (posledních 30 dní)</CardTitle>
            </CardHeader>
            <CardContent>
              {trendLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : clickTrend && clickTrend.length > 0 ? (
                <div className="h-48 flex items-end gap-1">
                  {clickTrend.map((day, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 transition-colors rounded-t cursor-pointer group relative"
                      style={{ height: `${(day.clicks / maxTrendClicks) * 100}%`, minHeight: day.clicks > 0 ? '4px' : '0' }}
                      title={`${day.date}: ${day.clicks} kliknutí`}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {day.date}: {day.clicks}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  Zatím žádná data
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clicks by Source */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kliknutí podle zdroje</CardTitle>
            </CardHeader>
            <CardContent>
              {sourceLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : clicksBySource && clicksBySource.length > 0 ? (
                <div className="space-y-4">
                  {clicksBySource.map((source, index) => {
                    const totalClicks = clicksBySource.reduce((sum, s) => sum + s.clicks, 0);
                    const percentage = totalClicks > 0 ? (source.clicks / totalClicks) * 100 : 0;
                    const sourceLabels: Record<string, string> = {
                      featured: "Featured karty",
                      grid: "Mřížka destinací",
                      search: "Vyhledávání",
                      banner: "Banner",
                    };
                    const sourceColors: Record<string, string> = {
                      featured: "bg-blue-500",
                      grid: "bg-green-500",
                      search: "bg-orange-500",
                      banner: "bg-purple-500",
                    };
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{sourceLabels[source.source] || source.source}</span>
                          <span className="text-muted-foreground">{source.clicks} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${sourceColors[source.source] || 'bg-gray-500'} transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  Zatím žádná data
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Destinations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top 10 destinací</CardTitle>
            </CardHeader>
            <CardContent>
              {destLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : topDestinations && topDestinations.length > 0 ? (
                <div className="space-y-3">
                  {topDestinations.map((dest, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-medium">{dest.destination}</span>
                      </div>
                      <span className="text-muted-foreground">{dest.clicks} kliknutí</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Zatím žádná data
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Clicks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Poslední kliknutí</CardTitle>
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : recentClicks && recentClicks.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentClicks.map((click, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <span className="font-medium">{click.destination}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({click.source})
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(click.createdAt).toLocaleString("cs-CZ")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Zatím žádná data
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Admin Navigation */}
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">Další sekce</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/share-ab-test">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-200">
                <CardContent className="pt-5 pb-4 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">A/B Test: Sdílecí tlačítka</p>
                    <p className="text-xs text-muted-foreground">Karta vs. detail stránka</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/ab-test">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-200">
                <CardContent className="pt-5 pb-4 flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">A/B Test: Chatbot</p>
                    <p className="text-xs text-muted-foreground">Persona varianty</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/emails">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200">
                <CardContent className="pt-5 pb-4 flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Email Analytics</p>
                    <p className="text-xs text-muted-foreground">Newsletter a notifikace</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Daily Report & Push Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Daily Report Card */}
          <DailyReportCard />
          {/* Push Notifications Card */}
          <PushNotificationsCard />
        </div>

        {/* RESEND_API_KEY Warning */}
        <ResendKeyWarning />
      </main>
    </div>
  );
}

// ============ Daily Report Card ============

function DailyReportCard() {
  const { data: lastResult, refetch } = trpc.dailyReport.getLastResult.useQuery();
  const sendNow = trpc.dailyReport.sendNow.useMutation({
    onSuccess: () => refetch(),
  });
  const { data: preview } = trpc.dailyReport.preview.useQuery();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">📊 Denní report</CardTitle>
        <Send className="w-4 h-4 text-blue-600" />
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">
          Automatický report se odesílá každý den v 7:00 CET.
        </p>

        {preview && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-blue-50 rounded p-2 text-center">
              <p className="text-lg font-bold text-blue-700">{preview.affiliateClicks}</p>
              <p className="text-[10px] text-blue-600">Affiliate kliky</p>
            </div>
            <div className="bg-green-50 rounded p-2 text-center">
              <p className="text-lg font-bold text-green-700">{preview.pageViews}</p>
              <p className="text-[10px] text-green-600">Zobrazení</p>
            </div>
            <div className="bg-purple-50 rounded p-2 text-center">
              <p className="text-lg font-bold text-purple-700">{preview.newRegistrations}</p>
              <p className="text-[10px] text-purple-600">Registrace</p>
            </div>
            <div className="bg-orange-50 rounded p-2 text-center">
              <p className="text-lg font-bold text-orange-700">{preview.chatbotConversations}</p>
              <p className="text-[10px] text-orange-600">Chatbot</p>
            </div>
          </div>
        )}

        {lastResult && (
          <div className={`text-xs p-2 rounded mb-3 ${
            lastResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            Poslední report: {lastResult.metrics.date}
            {lastResult.emailSent ? ' ✉️ Email odeslán' : ''}
            {lastResult.ownerNotified ? ' 🔔 Notifikace' : ''}
          </div>
        )}

        <Button
          size="sm"
          className="w-full"
          onClick={() => sendNow.mutate()}
          disabled={sendNow.isPending}
        >
          {sendNow.isPending ? (
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <Send className="w-3 h-3 mr-1" />
          )}
          Odeslat report nyní
        </Button>
      </CardContent>
    </Card>
  );
}

// ============ Push Notifications Card ============

function PushNotificationsCard() {
  const { data: pushStats } = trpc.pushNotifications.getStats.useQuery();
  const broadcast = trpc.pushNotifications.broadcast.useMutation();
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">🔔 Push notifikace</CardTitle>
        <Bell className="w-4 h-4 text-purple-600" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-gray-50 rounded p-2 text-center">
            <p className="text-lg font-bold">{pushStats?.configured ? '✅' : '❌'}</p>
            <p className="text-[10px] text-muted-foreground">Konfigurováno</p>
          </div>
          <div className="bg-gray-50 rounded p-2 text-center">
            <p className="text-lg font-bold">{pushStats?.activeSubscriptions || 0}</p>
            <p className="text-[10px] text-muted-foreground">Aktivní</p>
          </div>
          <div className="bg-gray-50 rounded p-2 text-center">
            <p className="text-lg font-bold">{pushStats?.totalSubscriptions || 0}</p>
            <p className="text-[10px] text-muted-foreground">Celkem</p>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <input
            type="text"
            placeholder="Titulek notifikace"
            value={broadcastTitle}
            onChange={(e) => setBroadcastTitle(e.target.value)}
            className="w-full text-xs border rounded px-2 py-1.5"
          />
          <input
            type="text"
            placeholder="Text notifikace"
            value={broadcastBody}
            onChange={(e) => setBroadcastBody(e.target.value)}
            className="w-full text-xs border rounded px-2 py-1.5"
          />
        </div>

        <Button
          size="sm"
          className="w-full"
          onClick={() => {
            if (!broadcastTitle || !broadcastBody) return;
            broadcast.mutate({ title: broadcastTitle, body: broadcastBody });
            setBroadcastTitle('');
            setBroadcastBody('');
          }}
          disabled={broadcast.isPending || !broadcastTitle || !broadcastBody}
        >
          {broadcast.isPending ? (
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <Bell className="w-3 h-3 mr-1" />
          )}
          Odeslat broadcast
        </Button>

        {broadcast.isSuccess && (
          <p className="text-xs text-green-600 mt-2 text-center">
            Odesláno: {broadcast.data.sent} úspěšně, {broadcast.data.failed} selhalo
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ============ Resend API Key Warning ============

function ResendKeyWarning() {
  const { data: emailStatus } = trpc.priceAlerts.getEmailStatus.useQuery();

  // Only show warning if email is not configured
  if (emailStatus && (emailStatus as any).configured !== false) return null;

  return (
    <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="text-sm font-bold text-amber-800">RESEND_API_KEY není nakonfigurován</h3>
        <p className="text-xs text-amber-700 mt-1">
          Emailové notifikace (denní reporty, price alerts, newsletter) nebudou fungovat bez platného Resend API klíče.
          Nastavte ho v sekci Settings → Secrets v Management UI.
        </p>
        <p className="text-xs text-amber-600 mt-1">
          Získejte klíč na{' '}
          <a href="https://resend.com" target="_blank" rel="noopener" className="underline font-medium">
            resend.com
          </a>{' '}
          → API Keys (ne SMTP přihlašovací údaje).
        </p>
      </div>
    </div>
  );
}
