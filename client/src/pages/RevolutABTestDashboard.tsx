import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart, TrendingUp, Users, MousePointerClick, Calendar, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  calculateZScore,
  calculatePValue,
  calculateConfidenceInterval,
  calculateMinimumSampleSize,
  isStatisticallySignificant,
  getSignificanceLabel,
  formatWithCI,
} from "@/lib/statisticalSignificance";
import {
  calculateBayesianABTest,
  shouldStopTest,
  getBayesianRecommendation,
  formatCredibleInterval,
  type BayesianVariantResult,
} from "@/lib/bayesianABTest";

interface VariantMetrics {
  variant: string;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  conversionRate: number;
}

interface StatisticalSignificance {
  variant: string;
  zScore: number;
  pValue: number;
  confidenceInterval: [number, number];
  isSignificant: boolean;
  significanceLabel: string;
  minSampleSize: number;
}

interface TimeSeriesDataPoint {
  date: string;
  banner: number;
  text: number;
  minimal: number;
}

type DateRange = "7d" | "30d" | "all";
type AnalysisMode = "frequentist" | "bayesian" | "both";

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

  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataPoint[]>([]);
  const [statisticalSignificance, setStatisticalSignificance] = useState<StatisticalSignificance[]>([]);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("both");
  const [bayesianResults, setBayesianResults] = useState<BayesianVariantResult[]>([]);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [winnerVariant, setWinnerVariant] = useState<string | null>(null);

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

    // Generate simulated time-series data
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const today = new Date();
    const generatedData: TimeSeriesDataPoint[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("cs-CZ", { day: "numeric", month: "short" });

      // Simulate conversion rate trends with some variance
      const bannerBase = 14.1;
      const textBase = 17.6;
      const minimalBase = 11.5;

      const variance = () => (Math.random() - 0.5) * 3;

      generatedData.push({
        date: dateStr,
        banner: Math.max(0, bannerBase + variance() - (i / days) * 2), // Slight downward trend
        text: Math.max(0, textBase + variance() + (i / days) * 1.5), // Slight upward trend
        minimal: Math.max(0, minimalBase + variance()), // Stable
      });
    }

    setTimeSeriesData(generatedData);

    // Calculate statistical significance (comparing each variant to banner as control)
    const controlVariant = simulatedMetrics[0]; // banner is control
    const controlRate = controlVariant.conversions / controlVariant.clicks;
    const controlN = controlVariant.clicks;

    const significance: StatisticalSignificance[] = simulatedMetrics.map((variant) => {
      if (variant.variant === "banner") {
        // Control variant - no comparison needed
        const ci = calculateConfidenceInterval(controlRate, controlN);
        return {
          variant: variant.variant,
          zScore: 0,
          pValue: 1,
          confidenceInterval: ci,
          isSignificant: false,
          significanceLabel: "Kontrolní varianta",
          minSampleSize: 0,
        };
      }

      const variantRate = variant.conversions / variant.clicks;
      const variantN = variant.clicks;

      const zScore = calculateZScore(variantRate, variantN, controlRate, controlN);
      const pValue = calculatePValue(zScore);
      const ci = calculateConfidenceInterval(variantRate, variantN);
      const isSignificant = isStatisticallySignificant(pValue);
      const significanceLabel = getSignificanceLabel(pValue);
      const minSampleSize = calculateMinimumSampleSize(variantRate, controlRate);

      return {
        variant: variant.variant,
        zScore,
        pValue,
        confidenceInterval: ci,
        isSignificant,
        significanceLabel,
        minSampleSize,
      };
    });

    setStatisticalSignificance(significance);

    // Calculate Bayesian results
    const bayesianVariants = simulatedMetrics.map((variant) => ({
      name: variant.variant,
      successes: variant.conversions,
      failures: variant.clicks - variant.conversions,
    }));

    const bayesianResults = calculateBayesianABTest(bayesianVariants, 10000);
    setBayesianResults(bayesianResults);

    // Check for automatic test completion (95% probability threshold)
    const { shouldStop, winner } = shouldStopTest(bayesianResults, 0.95, 0.01);
    
    // Load completion status from localStorage
    const storedCompleted = localStorage.getItem("revolut_ab_test_completed") === "true";
    const storedWinner = localStorage.getItem("revolut_ab_test_winner");
    
    if (shouldStop && winner && !storedCompleted) {
      // Test just completed - save to localStorage
      localStorage.setItem("revolut_ab_test_completed", "true");
      localStorage.setItem("revolut_ab_test_winner", winner);
      setIsTestCompleted(true);
      setWinnerVariant(winner);
      
      // TODO: Send notification to owner
      console.log(`[RevolutABTest] Test completed! Winner: ${winner}`);
    } else if (storedCompleted && storedWinner) {
      // Load existing completion status
      setIsTestCompleted(true);
      setWinnerVariant(storedWinner);
    }
  }, [dateRange]);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Revolut Pop-up A/B Test Dashboard</h1>
            <p className="text-muted-foreground">
              Sledujte výkonnost jednotlivých variant a optimalizujte konverze
            </p>
          </div>
          {isTestCompleted && winnerVariant && (
            <div className="flex items-center gap-4">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Test dokončen: {getVariantName(winnerVariant)}
              </div>
              <button
                onClick={() => {
                  if (confirm("Opravdu chcete restartovat A/B test? Všechna data zůstanou zachována, ale test začne znovu s rovnoměrným rozdělením trafficu.")) {
                    localStorage.removeItem("revolut_ab_test_completed");
                    localStorage.removeItem("revolut_ab_test_winner");
                    setIsTestCompleted(false);
                    setWinnerVariant(null);
                  }
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
              >
                Restartovat test
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Mode Toggle */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Metoda analýzy</h3>
            <p className="text-sm text-muted-foreground">
              Vyberte statistickou metodu pro vyhodnocení A/B testu
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAnalysisMode("frequentist")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                analysisMode === "frequentist"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Frekventistická
            </button>
            <button
              onClick={() => setAnalysisMode("bayesian")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                analysisMode === "bayesian"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Bayesovská
            </button>
            <button
              onClick={() => setAnalysisMode("both")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                analysisMode === "both"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Obě
            </button>
          </div>
        </div>
      </Card>

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

      {/* Time-Series Chart */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Vývoj konverzních poměrů v čase</h2>
          
          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="px-3 py-2 border rounded-lg bg-background text-sm font-medium"
            >
              <option value="7d">Posledních 7 dní</option>
              <option value="30d">Posledních 30 dní</option>
              <option value="all">Vše (90 dní)</option>
            </select>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
              label={{ value: "Conversion Rate (%)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "white", 
                border: "1px solid #e5e7eb", 
                borderRadius: "8px",
                padding: "12px"
              }}
              formatter={(value: number) => `${value.toFixed(1)}%`}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => getVariantName(value)}
            />
            <Line 
              type="monotone" 
              dataKey="banner" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 3 }}
              activeDot={{ r: 5 }}
              name="banner"
            />
            <Line 
              type="monotone" 
              dataKey="text" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 3 }}
              activeDot={{ r: 5 }}
              name="text"
            />
            <Line 
              type="monotone" 
              dataKey="minimal" 
              stroke="#a855f7" 
              strokeWidth={2}
              dot={{ fill: "#a855f7", r: 3 }}
              activeDot={{ r: 5 }}
              name="minimal"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

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

              {/* Frequentist Statistical Significance */}
              {(analysisMode === "frequentist" || analysisMode === "both") &&
                statisticalSignificance.find((s) => s.variant === metric.variant) && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold">Statistická významnost</h4>
                    {(() => {
                      const sig = statisticalSignificance.find((s) => s.variant === metric.variant)!;
                      if (metric.variant === "banner") {
                        return (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            <AlertCircle className="w-3 h-3" />
                            Kontrolní varianta
                          </span>
                        );
                      }
                      return sig.isSignificant ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3 h-3" />
                          Statisticky významné
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          <XCircle className="w-3 h-3" />
                          Není významné
                        </span>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {(() => {
                      const sig = statisticalSignificance.find((s) => s.variant === metric.variant)!;
                      return (
                        <>
                          <div>
                            <p className="text-muted-foreground mb-1">95% CI</p>
                            <p className="font-medium">
                              {(sig.confidenceInterval[0] * 100).toFixed(1)}% - {(sig.confidenceInterval[1] * 100).toFixed(1)}%
                            </p>
                          </div>
                          {metric.variant !== "banner" && (
                            <>
                              <div>
                                <p className="text-muted-foreground mb-1">Z-score</p>
                                <p className="font-medium">{sig.zScore.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1">P-value</p>
                                <p className="font-medium">{sig.pValue.toFixed(4)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1">Min. vzorek</p>
                                <p className="font-medium">{sig.minSampleSize.toLocaleString()}</p>
                              </div>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {(() => {
                    const sig = statisticalSignificance.find((s) => s.variant === metric.variant)!;
                    if (metric.variant !== "banner") {
                      return (
                        <p className="mt-3 text-xs text-muted-foreground">
                          {sig.significanceLabel}
                          {!sig.isSignificant && metric.clicks < sig.minSampleSize && (
                            <span className="block mt-1 text-orange-600">
                              ⚠️ Potřebujete ještě {(sig.minSampleSize - metric.clicks).toLocaleString()} kliků pro validní závěry
                            </span>
                          )}
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              {/* Bayesian Analysis */}
              {(analysisMode === "bayesian" || analysisMode === "both") &&
                bayesianResults.find((b) => b.variant === metric.variant) && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-blue-900">Bayesovská analýza</h4>
                    {(() => {
                      const bayes = bayesianResults.find((b) => b.variant === metric.variant)!;
                      if (bayes.probabilityBest >= 0.95) {
                        return (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle2 className="w-3 h-3" />
                            Vítěz ({(bayes.probabilityBest * 100).toFixed(0)}%)
                          </span>
                        );
                      } else if (bayes.probabilityBest >= 0.60) {
                        return (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <TrendingUp className="w-3 h-3" />
                            Vede ({(bayes.probabilityBest * 100).toFixed(0)}%)
                          </span>
                        );
                      } else {
                        return (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            <AlertCircle className="w-3 h-3" />
                            Neutrální
                          </span>
                        );
                      }
                    })()}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {(() => {
                      const bayes = bayesianResults.find((b) => b.variant === metric.variant)!;
                      return (
                        <>
                          <div>
                            <p className="text-muted-foreground mb-1">P(nejlepší)</p>
                            <p className="font-medium text-blue-900">
                              {(bayes.probabilityBest * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Oček. ztráta</p>
                            <p className="font-medium text-blue-900">
                              {(bayes.expectedLoss * 100).toFixed(2)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">95% Cred. Int.</p>
                            <p className="font-medium text-blue-900">
                              {formatCredibleInterval(bayes.credibleInterval)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Střední hodnota</p>
                            <p className="font-medium text-blue-900">
                              {(bayes.mean * 100).toFixed(1)}%
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <p className="mt-3 text-xs text-blue-700">
                    {(() => {
                      const bayes = bayesianResults.find((b) => b.variant === metric.variant)!;
                      if (bayes.probabilityBest >= 0.95) {
                        return `⚡ Silně doporučujeme tuto variantu - ${(bayes.probabilityBest * 100).toFixed(1)}% pravděpodobnost, že je nejlepší`;
                      } else if (bayes.probabilityBest >= 0.80) {
                        return `📈 Tato varianta pravděpodobně vede, ale počkejte na více dat`;
                      } else if (bayes.probabilityBest >= 0.60) {
                        return `🔍 Mírně vede, ale rozdíly nejsou jasné`;
                      } else {
                        return `⏳ Pokračujte v testování pro jasnější výsledky`;
                      }
                    })()}
                  </p>
                </div>
              )}

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
