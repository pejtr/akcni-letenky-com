/**
 * Hero A/B Test Analytics Dashboard
 * 
 * Real-time analytics showing conversion rates, statistical significance,
 * and event breakdown for Hero Variant A vs B
 */

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, TrendingUp, Users, MousePointerClick, Eye, RefreshCw } from "lucide-react";

interface VariantStats {
  variant: string;
  assignments: number;
  views: number;
  clicks: number;
  conversions: number;
  conversionRate: number;
  clickThroughRate: number;
}

export default function HeroABTestDashboard() {
  const [stats, setStats] = useState<VariantStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const { data: testResults, refetch, isLoading } = trpc.abTest.getTestResults.useQuery(
    { testName: "hero_redesign" },
    { refetchInterval: 10000 } // Auto-refresh every 10 seconds
  );

  const { data: eventBreakdown } = trpc.abTest.getEventBreakdown.useQuery(
    { testName: "hero_redesign" },
    { refetchInterval: 10000 }
  );

  useEffect(() => {
    if (testResults) {
      const variantA = testResults.variantA;
      const variantB = testResults.variantB;

      // Count views and clicks from event breakdown
      const viewsA = eventBreakdown?.filter(e => e.variant === "A" && e.eventType === "view").reduce((sum, e) => sum + (e.count || 0), 0) || 0;
      const viewsB = eventBreakdown?.filter(e => e.variant === "B" && e.eventType === "view").reduce((sum, e) => sum + (e.count || 0), 0) || 0;
      const clicksA = eventBreakdown?.filter(e => e.variant === "A" && (e.eventType === "form_interaction" || e.eventType === "cta_click")).reduce((sum, e) => sum + (e.count || 0), 0) || 0;
      const clicksB = eventBreakdown?.filter(e => e.variant === "B" && (e.eventType === "form_interaction" || e.eventType === "cta_click")).reduce((sum, e) => sum + (e.count || 0), 0) || 0;

      const processedStats: VariantStats[] = [
        {
          variant: "A",
          assignments: variantA.assignments,
          views: viewsA || variantA.assignments,
          clicks: clicksA,
          conversions: variantA.conversions,
          conversionRate: variantA.assignments > 0 ? variantA.conversionRate : 0,
          clickThroughRate: (viewsA || variantA.assignments) > 0 ? (clicksA / (viewsA || variantA.assignments)) * 100 : 0,
        },
        {
          variant: "B",
          assignments: variantB.assignments,
          views: viewsB || variantB.assignments,
          clicks: clicksB,
          conversions: variantB.conversions,
          conversionRate: variantB.assignments > 0 ? variantB.conversionRate : 0,
          clickThroughRate: (viewsB || variantB.assignments) > 0 ? (clicksB / (viewsB || variantB.assignments)) * 100 : 0,
        },
      ];

      setStats(processedStats);
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, [testResults, eventBreakdown]);

  const handleRefresh = () => {
    refetch();
  };

  // Calculate statistical significance (Z-test for proportions)
  const calculateSignificance = () => {
    if (stats.length !== 2) return null;
    
    const [varA, varB] = stats;
    
    if (varA.views < 30 || varB.views < 30) {
      return { significant: false, message: "Nedostatek dat (min. 30 zobrazení na variantu)" };
    }

    const p1 = varA.conversions / varA.views;
    const p2 = varB.conversions / varB.views;
    const pPool = (varA.conversions + varB.conversions) / (varA.views + varB.views);
    
    const se = Math.sqrt(pPool * (1 - pPool) * (1/varA.views + 1/varB.views));
    const zScore = Math.abs((p1 - p2) / se);
    
    // Z-score > 1.96 means 95% confidence (p < 0.05)
    const significant = zScore > 1.96;
    const winner = varA.conversionRate > varB.conversionRate ? "A" : "B";
    const improvement = Math.abs(varA.conversionRate - varB.conversionRate).toFixed(2);
    
    return {
      significant,
      zScore: zScore.toFixed(2),
      winner,
      improvement,
      message: significant 
        ? `Varianta ${winner} je statisticky významně lepší (+${improvement}% konverze)`
        : `Rozdíl není statisticky významný (Z-score: ${zScore.toFixed(2)})`
    };
  };

  const significance = calculateSignificance();

  if (loading || isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hero Section A/B Test</h1>
          <p className="text-gray-600">
            Real-time analytics pro varianty A (kontrolní) vs B (optimalizovaná)
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Obnovit
        </Button>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500 mb-6">
        Poslední aktualizace: {lastUpdated.toLocaleTimeString("cs-CZ")}
      </div>

      {/* Statistical Significance Card */}
      {significance && (
        <Card className={`mb-6 ${significance.significant ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Statistická významnost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-lg font-semibold ${significance.significant ? 'text-green-700' : 'text-yellow-700'}`}>
              {significance.message}
            </p>
            {significance.significant && (
              <p className="text-sm text-gray-600 mt-2">
                Doporučení: Nasaďte variantu {significance.winner} pro všechny uživatele
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Variant Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {stats.map((variant) => (
          <Card key={variant.variant} className={variant.variant === "B" ? "border-blue-500" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Varianta {variant.variant}</span>
                {variant.variant === "A" && (
                  <span className="text-sm font-normal text-gray-500">(Kontrolní)</span>
                )}
                {variant.variant === "B" && (
                  <span className="text-sm font-normal text-blue-600">(Optimalizovaná)</span>
                )}
              </CardTitle>
              <CardDescription>
                {variant.variant === "A" ? "Jednoduchý design" : "Vylepšený design bez žlutého banneru"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Conversion Rate - Primary Metric */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Conversion Rate</span>
                    <BarChart className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-700">
                    {variant.conversionRate.toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {variant.conversions} konverzí z {variant.views} zobrazení
                  </div>
                </div>

                {/* Click-Through Rate */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Click-Through Rate</span>
                    <MousePointerClick className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-700">
                    {variant.clickThroughRate.toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {variant.clicks} kliknutí z {variant.views} zobrazení
                  </div>
                </div>

                {/* Event Breakdown */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="text-lg font-semibold">{variant.assignments}</div>
                    <div className="text-xs text-gray-600">Přiřazení</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Eye className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="text-lg font-semibold">{variant.views}</div>
                    <div className="text-xs text-gray-600">Zobrazení</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <MousePointerClick className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="text-lg font-semibold">{variant.clicks}</div>
                    <div className="text-xs text-gray-600">Kliknutí</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Srovnání metrik</CardTitle>
          <CardDescription>Vizuální porovnání výkonnosti variant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Conversion Rate Comparison */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Conversion Rate</span>
                <span className="text-xs text-gray-500">Vyšší je lepší</span>
              </div>
              <div className="space-y-2">
                {stats.map((variant) => (
                  <div key={`conv-${variant.variant}`} className="flex items-center gap-3">
                    <span className="w-16 text-sm font-medium">Varianta {variant.variant}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          variant.variant === "A" ? "bg-gray-600" : "bg-blue-600"
                        } transition-all duration-500`}
                        style={{ width: `${Math.min(variant.conversionRate * 10, 100)}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                        {variant.conversionRate.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Click-Through Rate Comparison */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Click-Through Rate</span>
                <span className="text-xs text-gray-500">Vyšší je lepší</span>
              </div>
              <div className="space-y-2">
                {stats.map((variant) => (
                  <div key={`ctr-${variant.variant}`} className="flex items-center gap-3">
                    <span className="w-16 text-sm font-medium">Varianta {variant.variant}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          variant.variant === "A" ? "bg-gray-600" : "bg-green-600"
                        } transition-all duration-500`}
                        style={{ width: `${Math.min(variant.clickThroughRate * 2, 100)}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                        {variant.clickThroughRate.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Methodology Note */}
      <Card className="mt-6 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Metodologie</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>Conversion Rate:</strong> Procento uživatelů, kteří provedli konverzi (kliknutí na CTA) z celkového počtu zobrazení.
          </p>
          <p>
            <strong>Click-Through Rate:</strong> Procento uživatelů, kteří klikli na jakýkoliv prvek (formulář, tlačítko) z celkového počtu zobrazení.
          </p>
          <p>
            <strong>Statistická významnost:</strong> Z-test pro rozdíl proporcí s 95% intervalem spolehlivosti (p &lt; 0.05). Vyžaduje minimálně 30 zobrazení na variantu.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
