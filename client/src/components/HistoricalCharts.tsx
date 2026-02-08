/**
 * Historical Charts Component for Admin Dashboard
 * 
 * Displays 30-day trend charts for key business metrics:
 * - Affiliate clicks
 * - Page views
 * - Registrations
 * - Newsletter subscribers
 * - Chatbot conversations & leads
 * - Social shares
 */

import * as React from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Users,
  Mail,
  MessageSquare,
  Share2,
  Eye,
  MousePointerClick,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

type MetricKey =
  | "affiliateClicks"
  | "pageViews"
  | "registrations"
  | "subscribers"
  | "chatbotConversations"
  | "chatbotLeads"
  | "socialShares";

interface MetricConfig {
  key: MetricKey;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  hoverColor: string;
  icon: React.ReactNode;
}

const METRICS: MetricConfig[] = [
  {
    key: "affiliateClicks",
    label: "Affiliate kliky",
    shortLabel: "Kliky",
    color: "text-blue-600",
    bgColor: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    icon: <MousePointerClick className="w-4 h-4" />,
  },
  {
    key: "pageViews",
    label: "Zobrazení stránek",
    shortLabel: "Zobrazení",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500",
    hoverColor: "hover:bg-emerald-600",
    icon: <Eye className="w-4 h-4" />,
  },
  {
    key: "registrations",
    label: "Registrace",
    shortLabel: "Registrace",
    color: "text-purple-600",
    bgColor: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
    icon: <Users className="w-4 h-4" />,
  },
  {
    key: "subscribers",
    label: "Newsletter odběratelé",
    shortLabel: "Newsletter",
    color: "text-orange-600",
    bgColor: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
    icon: <Mail className="w-4 h-4" />,
  },
  {
    key: "chatbotConversations",
    label: "Chatbot konverzace",
    shortLabel: "Chatbot",
    color: "text-pink-600",
    bgColor: "bg-pink-500",
    hoverColor: "hover:bg-pink-600",
    icon: <MessageSquare className="w-4 h-4" />,
  },
  {
    key: "chatbotLeads",
    label: "Chatbot leady",
    shortLabel: "Leady",
    color: "text-cyan-600",
    bgColor: "bg-cyan-500",
    hoverColor: "hover:bg-cyan-600",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    key: "socialShares",
    label: "Sdílení",
    shortLabel: "Sdílení",
    color: "text-rose-600",
    bgColor: "bg-rose-500",
    hoverColor: "hover:bg-rose-600",
    icon: <Share2 className="w-4 h-4" />,
  },
];

// Mini bar chart for a single metric
function MiniChart({
  data,
  metricKey,
  bgColor,
  hoverColor,
}: {
  data: Array<Record<string, any>>;
  metricKey: MetricKey;
  bgColor: string;
  hoverColor: string;
}) {
  const values = data.map((d) => d[metricKey] as number);
  const maxVal = Math.max(...values, 1);

  return (
    <div className="h-20 flex items-end gap-[2px]">
      {data.map((day, i) => {
        const val = day[metricKey] as number;
        const heightPct = (val / maxVal) * 100;
        return (
          <div
            key={i}
            className={`flex-1 ${bgColor} ${hoverColor} transition-colors rounded-t cursor-pointer group relative`}
            style={{
              height: `${heightPct}%`,
              minHeight: val > 0 ? "2px" : "0",
            }}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {day.date}: {val}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Full-width combined chart
function CombinedChart({
  data,
  selectedMetrics,
}: {
  data: Array<Record<string, any>>;
  selectedMetrics: MetricKey[];
}) {
  if (data.length === 0) return null;

  // Find max value across all selected metrics for scaling
  const maxVal = Math.max(
    ...data.flatMap((d) => selectedMetrics.map((k) => d[k] as number)),
    1
  );

  // Color map for lines
  const colorMap: Record<MetricKey, string> = {
    affiliateClicks: "#3b82f6",
    pageViews: "#10b981",
    registrations: "#8b5cf6",
    subscribers: "#f97316",
    chatbotConversations: "#ec4899",
    chatbotLeads: "#06b6d4",
    socialShares: "#f43f5e",
  };

  const chartHeight = 200;
  const chartWidth = data.length * 20;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${Math.max(chartWidth, 600)} ${chartHeight + 30}`}
        className="w-full min-w-[600px]"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <g key={ratio}>
            <line
              x1="0"
              y1={chartHeight - ratio * chartHeight}
              x2={Math.max(chartWidth, 600)}
              y2={chartHeight - ratio * chartHeight}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x="2"
              y={chartHeight - ratio * chartHeight - 4}
              fill="#9ca3af"
              fontSize="9"
            >
              {Math.round(maxVal * ratio)}
            </text>
          </g>
        ))}

        {/* Lines for each metric */}
        {selectedMetrics.map((metricKey) => {
          const points = data
            .map((d, i) => {
              const x = (i / (data.length - 1 || 1)) * (Math.max(chartWidth, 600) - 20) + 10;
              const y = chartHeight - ((d[metricKey] as number) / maxVal) * (chartHeight - 10);
              return `${x},${y}`;
            })
            .join(" ");

          return (
            <polyline
              key={metricKey}
              points={points}
              fill="none"
              stroke={colorMap[metricKey]}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Date labels (every 5th day) */}
        {data.map((d, i) => {
          if (i % 5 !== 0 && i !== data.length - 1) return null;
          const x = (i / (data.length - 1 || 1)) * (Math.max(chartWidth, 600) - 20) + 10;
          return (
            <text
              key={i}
              x={x}
              y={chartHeight + 16}
              fill="#9ca3af"
              fontSize="8"
              textAnchor="middle"
            >
              {d.date.slice(5)} {/* MM-DD */}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export default function HistoricalCharts() {
  const [days, setDays] = React.useState(30);
  const [selectedMetrics, setSelectedMetrics] = React.useState<MetricKey[]>([
    "affiliateClicks",
    "pageViews",
  ]);

  const {
    data: historical,
    isLoading,
    refetch,
  } = trpc.historicalAnalytics.getData.useQuery(
    { days },
    { refetchOnWindowFocus: false }
  );

  const toggleMetric = (key: MetricKey) => {
    setSelectedMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Historické trendy
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Přehled klíčových metrik za posledních {days} dní
            {historical?.source === "report_log" && " (z denních reportů)"}
            {historical?.source === "live" && " (živá data)"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 14, 30, 60].map((d) => (
            <Button
              key={d}
              variant={days === d ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(d)}
              className="text-xs"
            >
              {d}d
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : !historical || historical.data.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Zatím nejsou k dispozici žádná historická data.</p>
            <p className="text-sm mt-1">Data se začnou sbírat po prvním denním reportu.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard
              label="Celkem kliků"
              value={historical.summary.totalClicks}
              avg={historical.summary.avgDailyClicks}
              icon={<MousePointerClick className="w-4 h-4 text-blue-600" />}
              bgColor="bg-blue-50"
            />
            <SummaryCard
              label="Celkem zobrazení"
              value={historical.summary.totalPageViews}
              avg={historical.summary.avgDailyPageViews}
              icon={<Eye className="w-4 h-4 text-emerald-600" />}
              bgColor="bg-emerald-50"
            />
            <SummaryCard
              label="Registrace"
              value={historical.summary.totalRegistrations}
              icon={<Users className="w-4 h-4 text-purple-600" />}
              bgColor="bg-purple-50"
            />
            <SummaryCard
              label="Konverzace"
              value={historical.summary.totalConversations}
              icon={<MessageSquare className="w-4 h-4 text-pink-600" />}
              bgColor="bg-pink-50"
            />
          </div>

          {/* Best/Worst Day */}
          {(historical.summary.bestDay || historical.summary.worstDay) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {historical.summary.bestDay && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-green-700 font-medium">Nejlepší den</p>
                    <p className="text-sm font-bold text-green-800">
                      {historical.summary.bestDay.date} – {historical.summary.bestDay.clicks} kliků
                    </p>
                  </div>
                </div>
              )}
              {historical.summary.worstDay && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-xs text-red-700 font-medium">Nejslabší den</p>
                    <p className="text-sm font-bold text-red-800">
                      {historical.summary.worstDay.date} – {historical.summary.worstDay.clicks} kliků
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Combined Line Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Porovnání metrik
              </CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {METRICS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => toggleMetric(m.key)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all ${
                      selectedMetrics.includes(m.key)
                        ? `${m.bgColor} text-white`
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {m.icon}
                    {m.shortLabel}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {selectedMetrics.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Vyberte alespoň jednu metriku pro zobrazení grafu
                </p>
              ) : (
                <CombinedChart
                  data={historical.data}
                  selectedMetrics={selectedMetrics}
                />
              )}
            </CardContent>
          </Card>

          {/* Individual Metric Mini Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {METRICS.map((m) => {
              const total = historical.data.reduce(
                (s, d) => s + (d[m.key as keyof typeof d] as number),
                0
              );
              const values = historical.data.map(
                (d) => d[m.key as keyof typeof d] as number
              );
              const avg = values.length > 0 ? Math.round(total / values.length) : 0;

              return (
                <Card key={m.key} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={m.color}>{m.icon}</span>
                        <span className="text-xs font-medium text-gray-700">
                          {m.shortLabel}
                        </span>
                      </div>
                      <span className="text-lg font-bold">{total}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-2">
                      Ø {avg}/den
                    </p>
                    <MiniChart
                      data={historical.data}
                      metricKey={m.key}
                      bgColor={m.bgColor}
                      hoverColor={m.hoverColor}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// Summary card sub-component
function SummaryCard({
  label,
  value,
  avg,
  icon,
  bgColor,
}: {
  label: string;
  value: number;
  avg?: number;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-xl p-4 border`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium text-gray-600">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value.toLocaleString("cs-CZ")}</p>
      {avg !== undefined && (
        <p className="text-[10px] text-muted-foreground">Ø {avg}/den</p>
      )}
    </div>
  );
}
