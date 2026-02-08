/**
 * A/B Test Dashboard - Social Sharing Button Placement
 * 
 * Comprehensive analytics dashboard for the share button placement test:
 * Variant A: Share button on destination cards (PersonalizedSection)
 * Variant B: Share button on destination detail page
 * 
 * Features:
 * - Overall conversion comparison with winner indicator
 * - Statistical significance testing (z-test)
 * - Conversion funnel visualization
 * - Daily trend chart (CSS-based)
 * - Event breakdown table
 * - Actionable recommendations
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, RefreshCw, TrendingUp, TrendingDown, BarChart3, 
  Share2, MousePointerClick, Eye, Target, Award, AlertTriangle,
  CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react";
import { Link } from "wouter";
import { useMemo } from "react";

export default function ShareABTestDashboard() {
  const { user, loading: authLoading } = useAuth();

  const { data, isLoading, refetch } = trpc.abTestSharing.getFullAnalytics.useQuery(
    undefined,
    { enabled: user?.role === "admin", refetchInterval: 60000 }
  );

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
              <Button><ArrowLeft className="w-4 h-4 mr-2" />Zpět na hlavní stránku</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />Admin
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                A/B Test: Sdílecí tlačítka
              </h1>
              <p className="text-sm text-muted-foreground">
                Karta destinace vs. Detail stránka
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />Obnovit
          </Button>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Načítám analytická data...</p>
            </div>
          </div>
        ) : data ? (
          <DashboardContent data={data} />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Žádná data</h3>
              <p className="text-muted-foreground">
                A/B test sdílecích tlačítek zatím nemá žádná data. Data se začnou sbírat automaticky, 
                jakmile uživatelé navštíví stránky s aktivním testem.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

function DashboardContent({ data }: { data: any }) {
  const { variantA, variantB, significance, totalSessions, dailyData, funnelData, winner, lift, recommendation, events } = data;

  return (
    <>
      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Celkem sessions"
          value={totalSessions.toLocaleString("cs-CZ")}
          icon={<Eye className="w-5 h-5" />}
          color="blue"
        />
        <KPICard
          title="Varianta A (Karta)"
          value={`${variantA.conversionRate.toFixed(1)}%`}
          subtitle={`${variantA.conversions}/${variantA.assignments}`}
          icon={<MousePointerClick className="w-5 h-5" />}
          color="emerald"
          highlight={winner === 'A'}
        />
        <KPICard
          title="Varianta B (Detail)"
          value={`${variantB.conversionRate.toFixed(1)}%`}
          subtitle={`${variantB.conversions}/${variantB.assignments}`}
          icon={<MousePointerClick className="w-5 h-5" />}
          color="purple"
          highlight={winner === 'B'}
        />
        <KPICard
          title="Lift vítěze"
          value={lift > 0 ? `+${lift}%` : '0%'}
          subtitle={winner ? `Varianta ${winner} vede` : 'Remíza'}
          icon={lift > 0 ? <TrendingUp className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
          color={lift > 0 ? "green" : "gray"}
        />
      </div>

      {/* Statistical Significance + Winner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SignificanceCard significance={significance} totalSessions={totalSessions} />
        <WinnerCard winner={winner} variantA={variantA} variantB={variantB} lift={lift} />
      </div>

      {/* Conversion Funnel */}
      <FunnelCard funnelData={funnelData} />

      {/* Daily Trend */}
      <TrendCard dailyData={dailyData} />

      {/* Event Breakdown */}
      <EventBreakdownCard events={events} variantA={variantA} variantB={variantB} />

      {/* Recommendation */}
      <RecommendationCard recommendation={recommendation} significance={significance} />
    </>
  );
}

function KPICard({ title, value, subtitle, icon, color, highlight }: {
  title: string; value: string; subtitle?: string; icon: React.ReactNode; color: string; highlight?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    purple: 'text-purple-600 bg-purple-50',
    green: 'text-green-600 bg-green-50',
    gray: 'text-gray-600 bg-gray-50',
  };
  const cls = colorClasses[color] || colorClasses.blue;

  return (
    <Card className={highlight ? 'ring-2 ring-yellow-400 shadow-lg' : ''}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className={`p-2 rounded-lg ${cls}`}>{icon}</div>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {highlight && (
          <div className="flex items-center gap-1 mt-2">
            <Award className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-xs font-medium text-yellow-600">Vítěz</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SignificanceCard({ significance, totalSessions }: { significance: any; totalSessions: number }) {
  const minSessions = 100;
  const progress = Math.min(totalSessions / minSessions * 100, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          Statistická významnost
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!significance ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Nedostatek dat</p>
                <p className="text-xs text-yellow-700 mt-0.5">
                  Potřeba minimálně 10 sessions v každé variantě pro statistický test.
                </p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Průběh sběru dat</span>
                <span>{totalSessions}/{minSessions} sessions</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${
              significance.isSignificant 
                ? 'bg-green-50 border-green-200' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              {significance.isSignificant ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-orange-600 shrink-0" />
              )}
              <div>
                <p className={`text-sm font-medium ${significance.isSignificant ? 'text-green-800' : 'text-orange-800'}`}>
                  {significance.isSignificant ? 'Statisticky významný rozdíl' : 'Rozdíl není statisticky významný'}
                </p>
                <p className={`text-xs mt-0.5 ${significance.isSignificant ? 'text-green-700' : 'text-orange-700'}`}>
                  Hladina spolehlivosti 95% (p {'<'} 0.05)
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground">p-hodnota</p>
                <p className="text-lg font-bold">{significance.pValue.toFixed(4)}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground">z-skóre</p>
                <p className="text-lg font-bold">{significance.zScore.toFixed(3)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WinnerCard({ winner, variantA, variantB, lift }: { winner: string | null; variantA: any; variantB: any; lift: number }) {
  return (
    <Card className={winner ? 'border-2 border-yellow-400' : ''}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-500" />
          Aktuální vítěz
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!winner ? (
          <div className="text-center py-4">
            <Minus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Obě varianty mají stejnou konverzi</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white ${
                winner === 'A' ? 'bg-emerald-500' : 'bg-purple-500'
              }`}>
                {winner}
              </div>
              <div>
                <p className="font-semibold text-lg">
                  {winner === 'A' ? 'Na kartě destinace' : 'V detailu destinace'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Konverze: {(winner === 'A' ? variantA : variantB).conversionRate.toFixed(1)}%
                </p>
              </div>
            </div>
            {/* Comparison bar */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium w-24 text-emerald-700">A: Karta</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(variantA.conversionRate * 5, 5)}%` }}
                  >
                    <span className="text-xs font-bold text-white">{variantA.conversionRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium w-24 text-purple-700">B: Detail</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(variantB.conversionRate * 5, 5)}%` }}
                  >
                    <span className="text-xs font-bold text-white">{variantB.conversionRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
            {lift > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-medium">+{lift}% lift oproti slabší variantě</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FunnelCard({ funnelData }: { funnelData: any }) {
  const stages = [
    { key: 'impressions', label: 'Zobrazení (Impressions)', icon: <Eye className="w-4 h-4" /> },
    { key: 'clicks', label: 'Kliknutí na sdílení', icon: <MousePointerClick className="w-4 h-4" /> },
    { key: 'shares', label: 'Dokončené sdílení', icon: <Share2 className="w-4 h-4" /> },
  ];

  const maxImpressions = Math.max(funnelData.variantA.impressions, funnelData.variantB.impressions, 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600" />
          Konverzní trychtýř
        </CardTitle>
        <CardDescription>Porovnání cesty uživatele od zobrazení po dokončení sdílení</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, idx) => {
            const aVal = funnelData.variantA[stage.key] || 0;
            const bVal = funnelData.variantB[stage.key] || 0;
            const aPercent = funnelData.variantA.impressions > 0 
              ? (aVal / funnelData.variantA.impressions * 100) : 0;
            const bPercent = funnelData.variantB.impressions > 0 
              ? (bVal / funnelData.variantB.impressions * 100) : 0;
            const aWidth = Math.max((aVal / maxImpressions) * 100, 3);
            const bWidth = Math.max((bVal / maxImpressions) * 100, 3);

            return (
              <div key={stage.key}>
                <div className="flex items-center gap-2 mb-2">
                  {stage.icon}
                  <span className="text-sm font-medium">{stage.label}</span>
                  {idx > 0 && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      (% z impressions)
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-8 text-emerald-700 font-medium">A</span>
                    <div className="flex-1 h-7 bg-gray-100 rounded overflow-hidden relative">
                      <div 
                        className="h-full bg-emerald-400 rounded transition-all flex items-center px-2"
                        style={{ width: `${aWidth}%` }}
                      >
                        <span className="text-xs font-bold text-emerald-900 whitespace-nowrap">
                          {aVal.toLocaleString("cs-CZ")}
                          {idx > 0 && ` (${aPercent.toFixed(1)}%)`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-8 text-purple-700 font-medium">B</span>
                    <div className="flex-1 h-7 bg-gray-100 rounded overflow-hidden relative">
                      <div 
                        className="h-full bg-purple-400 rounded transition-all flex items-center px-2"
                        style={{ width: `${bWidth}%` }}
                      >
                        <span className="text-xs font-bold text-purple-900 whitespace-nowrap">
                          {bVal.toLocaleString("cs-CZ")}
                          {idx > 0 && ` (${bPercent.toFixed(1)}%)`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {idx < stages.length - 1 && (
                  <div className="flex justify-center py-1">
                    <div className="w-px h-4 bg-gray-300"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function TrendCard({ dailyData }: { dailyData: any[] }) {
  const chartData = useMemo(() => {
    if (!dailyData || dailyData.length === 0) return null;
    const maxVal = Math.max(
      ...dailyData.map(d => Math.max(d.variantA.impressions, d.variantB.impressions, 1))
    );
    return { data: dailyData, maxVal };
  }, [dailyData]);

  if (!chartData || chartData.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Denní trend (posledních 30 dní)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Zatím nejsou k dispozici denní data.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          Denní trend (posledních 30 dní)
        </CardTitle>
        <CardDescription>Impressions a kliknutí podle variant</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-xs">A: Impressions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-300"></div>
            <span className="text-xs">A: Kliky</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-xs">B: Impressions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-300"></div>
            <span className="text-xs">B: Kliky</span>
          </div>
        </div>

        {/* CSS Bar Chart */}
        <div className="overflow-x-auto">
          <div className="flex items-end gap-1 min-h-[200px]" style={{ minWidth: `${chartData.data.length * 50}px` }}>
            {chartData.data.map((day, idx) => {
              const aImpH = (day.variantA.impressions / chartData.maxVal) * 180;
              const bImpH = (day.variantB.impressions / chartData.maxVal) * 180;
              const aClickH = (day.variantA.clicks / chartData.maxVal) * 180;
              const bClickH = (day.variantB.clicks / chartData.maxVal) * 180;
              const dateStr = new Date(day.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });

              return (
                <div key={day.date} className="flex flex-col items-center gap-0.5 flex-1 min-w-[40px]" title={`${dateStr}: A=${day.variantA.impressions}imp/${day.variantA.clicks}click, B=${day.variantB.impressions}imp/${day.variantB.clicks}click`}>
                  <div className="flex items-end gap-0.5 h-[180px]">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-3 bg-emerald-500 rounded-t" style={{ height: `${Math.max(aImpH, 2)}px` }}></div>
                      <div className="w-3 bg-emerald-300 rounded-t" style={{ height: `${Math.max(aClickH, 1)}px` }}></div>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-3 bg-purple-500 rounded-t" style={{ height: `${Math.max(bImpH, 2)}px` }}></div>
                      <div className="w-3 bg-purple-300 rounded-t" style={{ height: `${Math.max(bClickH, 1)}px` }}></div>
                    </div>
                  </div>
                  {(idx % Math.max(1, Math.floor(chartData.data.length / 10)) === 0 || idx === chartData.data.length - 1) && (
                    <span className="text-[10px] text-muted-foreground mt-1 -rotate-45 origin-top-left whitespace-nowrap">
                      {dateStr}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EventBreakdownCard({ events, variantA, variantB }: { events: any; variantA: any; variantB: any }) {
  const eventLabels: Record<string, string> = {
    'click': 'Kliknutí na sdílení',
    'share_complete': 'Dokončené sdílení',
    'cta_click': 'Klik na CTA',
    'impression': 'Zobrazení',
    'hover': 'Najetí myší',
    'copy_link': 'Kopírování odkazu',
    'facebook_share': 'Sdílení na Facebook',
    'twitter_share': 'Sdílení na Twitter',
    'whatsapp_share': 'Sdílení přes WhatsApp',
  };

  // Aggregate events into a table format
  const eventTypes = new Set<string>();
  const eventMap: Record<string, { A: number; B: number }> = {};

  if (events) {
    for (const [variant, variantEvents] of Object.entries(events)) {
      if (typeof variantEvents === 'object' && variantEvents !== null) {
        for (const [eventType, count] of Object.entries(variantEvents as Record<string, number>)) {
          eventTypes.add(eventType);
          if (!eventMap[eventType]) eventMap[eventType] = { A: 0, B: 0 };
          eventMap[eventType][variant as 'A' | 'B'] = count as number;
        }
      }
    }
  }

  const sortedEvents = Array.from(eventTypes).sort();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          Rozpad událostí
        </CardTitle>
        <CardDescription>Detailní přehled všech trackovaných akcí uživatelů</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Zatím nebyly zaznamenány žádné události.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Událost</th>
                  <th className="text-right py-2 px-3 font-medium text-emerald-700">Varianta A</th>
                  <th className="text-right py-2 px-3 font-medium text-purple-700">Varianta B</th>
                  <th className="text-right py-2 px-3 font-medium">Rozdíl</th>
                </tr>
              </thead>
              <tbody>
                {sortedEvents.map(eventType => {
                  const a = eventMap[eventType]?.A || 0;
                  const b = eventMap[eventType]?.B || 0;
                  const diff = a - b;
                  return (
                    <tr key={eventType} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3">{eventLabels[eventType] || eventType}</td>
                      <td className="text-right py-2 px-3 font-mono">{a.toLocaleString("cs-CZ")}</td>
                      <td className="text-right py-2 px-3 font-mono">{b.toLocaleString("cs-CZ")}</td>
                      <td className="text-right py-2 px-3">
                        <span className={`inline-flex items-center gap-1 font-mono ${
                          diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {diff > 0 ? <ArrowUpRight className="w-3 h-3" /> : diff < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                          {diff > 0 ? '+' : ''}{diff.toLocaleString("cs-CZ")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {/* Totals row */}
                <tr className="bg-gray-50 font-semibold">
                  <td className="py-2 px-3">Celkem konverze / sessions</td>
                  <td className="text-right py-2 px-3 font-mono text-emerald-700">
                    {variantA.conversions} / {variantA.assignments}
                  </td>
                  <td className="text-right py-2 px-3 font-mono text-purple-700">
                    {variantB.conversions} / {variantB.assignments}
                  </td>
                  <td className="text-right py-2 px-3">
                    <span className="font-mono">
                      {variantA.conversionRate.toFixed(1)}% vs {variantB.conversionRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecommendationCard({ recommendation, significance }: { recommendation: string; significance: any }) {
  const isPositive = significance?.isSignificant;
  
  return (
    <Card className={`border-2 ${isPositive ? 'border-green-400 bg-green-50/50' : 'border-blue-400 bg-blue-50/50'}`}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {isPositive ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-blue-600" />
          )}
          Doporučení
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{recommendation}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="px-3 py-1.5 bg-white rounded-lg border text-xs">
            <span className="text-muted-foreground">Status: </span>
            <span className="font-medium">{isPositive ? 'Připraveno k rozhodnutí' : 'Sbírání dat'}</span>
          </div>
          {significance && (
            <div className="px-3 py-1.5 bg-white rounded-lg border text-xs">
              <span className="text-muted-foreground">Spolehlivost: </span>
              <span className="font-medium">{((1 - significance.pValue) * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
