import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, TrendingUp, RefreshCw, Trophy, Target } from "lucide-react";
import { Link } from "wouter";

// Persona avatar mapping
const personaAvatars: Record<string, string> = {
  phoebe: "/avatars/phoebe.png",
  piper: "/avatars/piper.png",
  prue: "/avatars/prue.png",
};

export default function ABTestDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { data: stats, isLoading, refetch } = trpc.abTest.getStatus.useQuery();
  const optimizeMutation = trpc.abTest.optimize.useMutation({
    onSuccess: () => refetch(),
  });

  if (authLoading || isLoading) {
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
            <p className="text-muted-foreground mb-4">Tato stránka je dostupná pouze pro administrátory.</p>
            <Link href="/">
              <Button>Zpět na hlavní stránku</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalConversations = stats?.totalConversations || 0;
  const results = stats?.results || [];
  const totalConversions = results.reduce((sum, r) => sum + r.totalConversions, 0);
  const overallConversionRate = totalConversations > 0 ? (totalConversions / totalConversations * 100) : 0;

  // Find best performing persona from results
  const bestResult = results.find(r => r.isWinner) || results.reduce((best, current) => {
    return current.conversionRate > (best?.conversionRate || 0) ? current : best;
  }, results[0]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">← Zpět</Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">A/B Test Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Obnovit
            </Button>
            <Button 
              size="sm"
              onClick={() => optimizeMutation.mutate()}
              disabled={optimizeMutation.isPending || !stats?.isOptimizationReady}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Optimalizovat váhy
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Celkem konverzací</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalConversations}</div>
              <p className="text-xs text-muted-foreground">
                {!stats?.isOptimizationReady ? `${stats?.minimumRequired || 100 - totalConversations} do auto-optimalizace` : "Připraveno k optimalizaci"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Celkem konverzí</CardTitle>
              <Target className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalConversions}</div>
              <p className="text-xs text-muted-foreground">Affiliate prokliky</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Průměrná konverze</CardTitle>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallConversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Všechny persony</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Nejlepší persona</CardTitle>
              <Trophy className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-800 capitalize">{bestResult?.name || "—"}</div>
              <p className="text-xs text-yellow-700">
                {bestResult ? `${bestResult.conversionRate.toFixed(1)}% konverze` : "Žádná data"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Persona Cards */}
        <h2 className="text-xl font-bold mb-4">Výsledky A/B testu</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {results.map((result) => {
            const persona = stats?.personas.find(p => p.name === result.name);
            const isBest = result.isWinner || (result.name === bestResult?.name && totalConversations > 10);
            const trafficWeight = persona?.weight || 0.33;
            
            return (
              <Card key={result.name} className={isBest ? "ring-2 ring-yellow-400 shadow-lg" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={personaAvatars[result.name] || "/avatars/default.png"} 
                        alt={persona?.displayName || result.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <CardTitle className="text-lg">{persona?.displayName || result.name}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">{result.name}</p>
                      </div>
                    </div>
                    {isBest && (
                      <Badge className="bg-yellow-500 hover:bg-yellow-600">
                        <Trophy className="w-3 h-3 mr-1" />
                        Nejlepší
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Traffic Weight */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Traffic weight</span>
                      <span className="font-medium">{(trafficWeight * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={trafficWeight * 100} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{result.totalSessions}</div>
                      <div className="text-xs text-muted-foreground">Konverzací</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{result.totalConversions}</div>
                      <div className="text-xs text-muted-foreground">Konverzí</div>
                    </div>
                  </div>

                  {/* Conversion Rate */}
                  <div className="text-center pt-2 border-t">
                    <div className="text-3xl font-bold" style={{ color: result.conversionRate > overallConversionRate ? '#16a34a' : '#6b7280' }}>
                      {result.conversionRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Konverzní poměr</div>
                    {result.conversionRate > overallConversionRate && overallConversionRate > 0 && (
                      <Badge variant="outline" className="mt-2 text-green-600 border-green-600">
                        +{(result.conversionRate - overallConversionRate).toFixed(1)}% nad průměrem
                      </Badge>
                    )}
                  </div>

                  {/* Avg Messages */}
                  <div className="text-center text-sm text-muted-foreground">
                    Průměr zpráv: {result.avgMessages.toFixed(1)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Box */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-bold text-blue-800 mb-2">Jak funguje A/B testování?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Každý nový uživatel je náhodně přiřazen k jedné z person podle aktuálních traffic weights</li>
              <li>• Konverze = uživatel klikl na affiliate odkaz během konverzace</li>
              <li>• Po 100+ konverzacích se automaticky optimalizují váhy - nejlepší persona dostane 50% trafficu</li>
              <li>• Můžete také ručně spustit optimalizaci tlačítkem "Optimalizovat váhy"</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
