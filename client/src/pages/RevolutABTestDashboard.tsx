import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart, TrendingUp, Users, MousePointerClick } from "lucide-react";

interface VariantMetrics {
  variant: string;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  conversionRate: number;
}

export default function RevolutABTestDashboard() {
  const [metrics, setMetrics] = useState<VariantMetrics[]>([
    { variant: "banner", impressions: 0, clicks: 0, ctr: 0, conversions: 0, conversionRate: 0 },
    { variant: "text", impressions: 0, clicks: 0, ctr: 0, conversions: 0, conversionRate: 0 },
    { variant: "minimal", impressions: 0, clicks: 0, ctr: 0, conversions: 0, conversionRate: 0 },
  ]);

  const [trafficWeights, setTrafficWeights] = useState({
    banner: 33.33,
    text: 33.33,
    minimal: 33.34,
  });

  // TODO: Fetch real metrics from Meta Pixel events via tRPC
  // const { data: realMetrics } = trpc.analytics.getRevolutABTestMetrics.useQuery();

  useEffect(() => {
    // Simulate loading metrics from Meta Pixel
    // In production, this would fetch from Meta Conversion API or database
    const simulatedMetrics: VariantMetrics[] = [
      { variant: "banner", impressions: 1250, clicks: 85, ctr: 6.8, conversions: 12, conversionRate: 14.1 },
      { variant: "text", impressions: 1180, clicks: 102, ctr: 8.6, conversions: 18, conversionRate: 17.6 },
      { variant: "minimal", impressions: 1220, clicks: 78, ctr: 6.4, conversions: 9, conversionRate: 11.5 },
    ];
    setMetrics(simulatedMetrics);

    // Auto-optimize traffic weights based on conversion rates
    const totalConversionRate = simulatedMetrics.reduce((sum, m) => sum + m.conversionRate, 0);
    if (totalConversionRate > 0) {
      const optimizedWeights = {
        banner: (simulatedMetrics[0].conversionRate / totalConversionRate) * 100,
        text: (simulatedMetrics[1].conversionRate / totalConversionRate) * 100,
        minimal: (simulatedMetrics[2].conversionRate / totalConversionRate) * 100,
      };
      setTrafficWeights(optimizedWeights);
    }
  }, []);

  const totalImpressions = metrics.reduce((sum, m) => sum + m.impressions, 0);
  const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0);
  const totalConversions = metrics.reduce((sum, m) => sum + m.conversions, 0);
  const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const overallConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

  const getVariantName = (variant: string) => {
    switch (variant) {
      case "banner":
        return "Varianta A (Banner)";
      case "text":
        return "Varianta B (Text)";
      case "minimal":
        return "Varianta C (Minimal)";
      default:
        return variant;
    }
  };

  const getVariantColor = (variant: string) => {
    switch (variant) {
      case "banner":
        return "bg-blue-500";
      case "text":
        return "bg-green-500";
      case "minimal":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Revolut Pop-up A/B Test Dashboard</h1>
        <p className="text-muted-foreground">
          Sledujte výkonnost jednotlivých variant a optimalizujte konverze
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <p className="text-sm font-medium text-muted-foreground">Celkem zobrazení</p>
          </div>
          <p className="text-3xl font-bold">{totalImpressions.toLocaleString()}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <MousePointerClick className="w-5 h-5 text-green-500" />
            <p className="text-sm font-medium text-muted-foreground">Celkem kliků</p>
          </div>
          <p className="text-3xl font-bold">{totalClicks.toLocaleString()}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart className="w-5 h-5 text-purple-500" />
            <p className="text-sm font-medium text-muted-foreground">CTR</p>
          </div>
          <p className="text-3xl font-bold">{overallCTR.toFixed(1)}%</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
          </div>
          <p className="text-3xl font-bold">{overallConversionRate.toFixed(1)}%</p>
        </Card>
      </div>

      {/* Variant Comparison */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Porovnání variant</h2>
        
        <div className="space-y-6">
          {metrics.map((metric) => (
            <div key={metric.variant} className="border-b pb-6 last:border-b-0 last:pb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${getVariantColor(metric.variant)}`} />
                  <h3 className="text-lg font-semibold">{getVariantName(metric.variant)}</h3>
                </div>
                <div className="text-sm text-muted-foreground">
                  Traffic: {trafficWeights[metric.variant as keyof typeof trafficWeights].toFixed(1)}%
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Zobrazení</p>
                  <p className="text-2xl font-bold">{metric.impressions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Kliky</p>
                  <p className="text-2xl font-bold">{metric.clicks.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">CTR</p>
                  <p className="text-2xl font-bold">{metric.ctr.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Konverze</p>
                  <p className="text-2xl font-bold">{metric.conversions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Conv. Rate</p>
                  <p className="text-2xl font-bold text-green-600">{metric.conversionRate.toFixed(1)}%</p>
                </div>
              </div>

              {/* Visual bar for conversion rate */}
              <div className="mt-4">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getVariantColor(metric.variant)}`}
                    style={{ width: `${Math.min(metric.conversionRate * 5, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Winner & Recommendations */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Doporučení</h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Nejlepší varianta: {getVariantName(metrics.sort((a, b) => b.conversionRate - a.conversionRate)[0].variant)}</p>
              <p className="text-sm text-green-700 mt-1">
                Tato varianta má nejvyšší conversion rate ({metrics.sort((a, b) => b.conversionRate - a.conversionRate)[0].conversionRate.toFixed(1)}%).
                Doporučujeme zvýšit traffic allocation na tuto variantu.
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-semibold text-blue-900 mb-2">Automatická optimalizace</p>
            <p className="text-sm text-blue-700">
              Traffic weights jsou automaticky upravovány na základě conversion rates. 
              Varianta s vyšší conversion rate dostává více zobrazení.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
