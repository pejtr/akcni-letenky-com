/**
 * ConversionFunnelDashboard Component
 * 
 * Visualizes the user conversion funnel with drop-off analysis.
 * Shows the journey: Visit → Browse → View Offer → Click Affiliate → Convert
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, TrendingDown, TrendingUp, ArrowDown, BarChart3, AlertTriangle } from "lucide-react";

export default function ConversionFunnelDashboard() {
  const [days, setDays] = useState(30);
  
  const { data: funnel, isLoading: funnelLoading } = trpc.conversionFunnel.getFunnel.useQuery({ days });
  const { data: summary, isLoading: summaryLoading } = trpc.conversionFunnel.getSummary.useQuery({ days });

  const isLoading = funnelLoading || summaryLoading;

  const getBarColor = (percentage: number): string => {
    if (percentage > 70) return "bg-green-500";
    if (percentage > 40) return "bg-yellow-500";
    if (percentage > 20) return "bg-orange-500";
    return "bg-red-500";
  };

  const getDropoffColor = (dropoffPercent: number): string => {
    if (dropoffPercent < 20) return "text-green-600";
    if (dropoffPercent < 40) return "text-yellow-600";
    if (dropoffPercent < 60) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Filter className="w-5 h-5" />
          Konverzní Funnel
        </CardTitle>
        <div className="flex gap-2 mt-2">
          {[
            { label: "7d", value: 7 },
            { label: "14d", value: 14 },
            { label: "30d", value: 30 },
            { label: "60d", value: 60 },
          ].map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={days === opt.value ? "default" : "outline"}
              onClick={() => setDays(opt.value)}
              className="text-xs"
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <BarChart3 className="w-4 h-4 mx-auto text-purple-500 mb-1" />
                <p className="text-lg font-bold text-gray-900">{funnel?.totalSessions?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-500">Celkem sessions</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <TrendingUp className="w-4 h-4 mx-auto text-green-500 mb-1" />
                <p className="text-lg font-bold text-gray-900">{funnel?.overallConversionRate || 0}%</p>
                <p className="text-xs text-gray-500">Konverzní poměr</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <AlertTriangle className="w-4 h-4 mx-auto text-red-500 mb-1" />
                <p className="text-lg font-bold text-gray-900">
                  {summary?.biggestDropoff?.dropoffPercent || 0}%
                </p>
                <p className="text-xs text-gray-500">
                  Největší odpad
                  {summary?.biggestDropoff && (
                    <span className="block text-[10px] text-gray-400 mt-0.5">{summary.biggestDropoff.label}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Funnel Visualization */}
            <div className="space-y-2">
              {funnel?.steps?.map((step, index) => (
                <div key={step.step}>
                  {/* Step */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 truncate">{step.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{step.count.toLocaleString()}</span>
                          <span className="text-xs text-gray-500">({step.percentage}%)</span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getBarColor(step.percentage)}`}
                          style={{ width: `${Math.max(step.percentage, 2)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Drop-off indicator between steps */}
                  {index < (funnel?.steps?.length || 0) - 1 && step.dropoff > 0 && (
                    <div className="flex items-center gap-3 my-1 ml-4">
                      <ArrowDown className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      <div className="flex items-center gap-1">
                        <TrendingDown className={`w-3 h-3 ${getDropoffColor(step.dropoffPercent)}`} />
                        <span className={`text-xs font-medium ${getDropoffColor(step.dropoffPercent)}`}>
                          -{step.dropoff.toLocaleString()} ({step.dropoffPercent}% odpad)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {(!funnel?.steps || funnel.steps.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Zatím žádná data</p>
                  <p className="text-xs opacity-70">Funnel se začne plnit po návštěvách uživatelů</p>
                </div>
              )}
            </div>

            {/* Daily Conversion Trend (mini chart) */}
            {summary?.dailyConversions && summary.dailyConversions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Denní konverzní trend</h4>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-end gap-1 h-20">
                    {summary.dailyConversions.slice(-14).map((day, i) => {
                      const maxSessions = Math.max(...summary.dailyConversions.slice(-14).map(d => d.sessions), 1);
                      const height = (day.sessions / maxSessions) * 100;
                      return (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center gap-0.5"
                          title={`${day.date}: ${day.sessions} sessions, ${day.conversions} konverzí (${day.rate}%)`}
                        >
                          <div className="w-full relative" style={{ height: `${Math.max(height, 5)}%` }}>
                            <div className="absolute inset-0 bg-purple-200 rounded-t" />
                            {day.conversions > 0 && (
                              <div
                                className="absolute bottom-0 left-0 right-0 bg-purple-600 rounded-t"
                                style={{ height: `${(day.conversions / day.sessions) * 100}%` }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-gray-400">
                      {summary.dailyConversions.slice(-14)[0]?.date?.split("-").slice(1).join(".")}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {summary.dailyConversions[summary.dailyConversions.length - 1]?.date?.split("-").slice(1).join(".")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Top Pages */}
            {summary?.topPages && summary.topPages.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Nejaktivnější stránky</h4>
                <div className="space-y-1">
                  {summary.topPages.slice(0, 5).map((p, i) => (
                    <div key={i} className="flex items-center justify-between bg-white rounded px-3 py-1.5 text-sm">
                      <span className="font-mono text-gray-600 text-xs truncate">{p.page}</span>
                      <span className="font-semibold text-purple-600 ml-2">{p.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
