/**
 * A/B Test Analytics Dashboard
 * 
 * Comprehensive dashboard for tracking newsletter A/B test performance
 * with mobile/desktop breakdown and conversion rate optimization
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ABTestStats {
  variant: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  mobileImpressions: number;
  mobileConversions: number;
  mobileConversionRate: number;
  desktopImpressions: number;
  desktopConversions: number;
  desktopConversionRate: number;
}

export default function ABTestAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  
  // Fetch A/B test stats from backend
  const { data: stats, isLoading } = trpc.newsletter.getABTestStats.useQuery({
    dateRange,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Načítám data...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalImpressions = stats?.reduce((sum: number, s: ABTestStats) => sum + s.impressions, 0) || 0;
  const totalConversions = stats?.reduce((sum: number, s: ABTestStats) => sum + s.conversions, 0) || 0;
  const overallConversionRate = totalImpressions > 0 
    ? ((totalConversions / totalImpressions) * 100).toFixed(2)
    : "0.00";

  const bestVariant = stats?.reduce((best: ABTestStats, current: ABTestStats) => 
    current.conversionRate > (best?.conversionRate || 0) ? current : best
  , stats[0]);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📊 A/B Test Analytics Dashboard
        </h1>
        <p className="text-gray-600">
          Sledování výkonnosti newsletter variant s mobilním/desktop rozpadem
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6 flex items-center gap-4">
        <Calendar className="w-5 h-5 text-gray-500" />
        <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Vyberte období" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Posledních 7 dní</SelectItem>
            <SelectItem value="30d">Posledních 30 dní</SelectItem>
            <SelectItem value="90d">Posledních 90 dní</SelectItem>
            <SelectItem value="all">Celková historie</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Celkové zobrazení
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {totalImpressions.toLocaleString("cs-CZ")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Celkové konverze
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {totalConversions.toLocaleString("cs-CZ")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Průměrná konverzní míra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {overallConversionRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best Performing Variant */}
      {bestVariant && (
        <Card className="mb-8 border-2 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏆 Nejlepší varianta
            </CardTitle>
            <CardDescription>
              Tato varianta má nejvyšší konverzní míru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  Varianta {bestVariant.variant.toUpperCase()}
                </p>
                <p className="text-gray-600">
                  {bestVariant.conversions} konverzí z {bestVariant.impressions} zobrazení
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-green-600">
                  {bestVariant.conversionRate.toFixed(2)}%
                </p>
                <p className="text-sm text-gray-600">konverzní míra</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variant Breakdown */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Detailní rozpad podle variant
        </h2>

        {stats?.map((variant: ABTestStats) => (
          <Card key={variant.variant} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="flex items-center justify-between">
                <span>Varianta {variant.variant.toUpperCase()}</span>
                <span className="text-2xl font-bold text-blue-600">
                  {variant.conversionRate.toFixed(2)}%
                </span>
              </CardTitle>
              <CardDescription>
                {variant.conversions} konverzí z {variant.impressions} zobrazení
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Mobile vs Desktop Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mobile Stats */}
                <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    📱 Mobilní zařízení
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Zobrazení:</span>
                      <span className="font-semibold">
                        {variant.mobileImpressions.toLocaleString("cs-CZ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Konverze:</span>
                      <span className="font-semibold text-green-600">
                        {variant.mobileConversions.toLocaleString("cs-CZ")}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-300">
                      <span className="text-gray-900 font-medium">Konverzní míra:</span>
                      <span className="text-xl font-bold text-blue-600">
                        {variant.mobileConversionRate.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Desktop Stats */}
                <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    💻 Desktop
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Zobrazení:</span>
                      <span className="font-semibold">
                        {variant.desktopImpressions.toLocaleString("cs-CZ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Konverze:</span>
                      <span className="font-semibold text-green-600">
                        {variant.desktopConversions.toLocaleString("cs-CZ")}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-purple-300">
                      <span className="text-gray-900 font-medium">Konverzní míra:</span>
                      <span className="text-xl font-bold text-purple-600">
                        {variant.desktopConversionRate.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm text-gray-600">
                  <span>Mobilní podíl</span>
                  <span>
                    {((variant.mobileImpressions / variant.impressions) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{
                      width: `${(variant.mobileImpressions / variant.impressions) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      {bestVariant && (
        <Card className="mt-8 border-2 border-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💡 Doporučení
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">
              <strong>Nejlepší varianta:</strong> Varianta {bestVariant.variant.toUpperCase()} má nejvyšší konverzní míru ({bestVariant.conversionRate.toFixed(2)}%). Zvažte použití této varianty pro všechny uživatele.
            </p>
            {bestVariant.mobileConversionRate > bestVariant.desktopConversionRate ? (
              <p className="text-gray-700">
                <strong>Mobilní optimalizace:</strong> Mobilní zařízení mají vyšší konverzní míru ({bestVariant.mobileConversionRate.toFixed(2)}% vs {bestVariant.desktopConversionRate.toFixed(2)}%). Zaměřte se na mobilní UX optimalizaci.
              </p>
            ) : (
              <p className="text-gray-700">
                <strong>Desktop optimalizace:</strong> Desktop má vyšší konverzní míru ({bestVariant.desktopConversionRate.toFixed(2)}% vs {bestVariant.mobileConversionRate.toFixed(2)}%). Zvažte zlepšení mobilního UX.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
