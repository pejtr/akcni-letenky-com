/**
 * HeatmapVisualization Component
 * 
 * Displays a click heatmap overlay for the admin dashboard.
 * Shows where users click most on the homepage with color-coded intensity.
 */

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MousePointerClick, Flame, Target, Layers } from "lucide-react";

interface HeatmapPoint {
  x: number;
  y: number;
  count: number;
  elementTag?: string;
  elementText?: string;
}

export default function HeatmapVisualization() {
  const [days, setDays] = useState(7);
  const [page, setPage] = useState("/");
  
  const { data, isLoading } = trpc.heatmap.getData.useQuery({ page, days });

  const heatmapData = useMemo(() => {
    if (!data?.points) return { grid: [] as { x: number; y: number; intensity: number; count: number }[], topElements: [] as { tag: string; text: string; count: number }[], totalClicks: 0 };
    
    // Normalize points to a grid (divide viewport into cells)
    const GRID_COLS = 20;
    const GRID_ROWS = 15;
    const grid: Map<string, number> = new Map();
    let totalClicks = 0;
    
    // Count element clicks
    const elementCounts: Map<string, number> = new Map();
    
    for (const point of data.points as HeatmapPoint[]) {
      // Normalize x,y to grid cells (0-1 range based on viewport)
      const col = Math.min(Math.floor((point.x / 1920) * GRID_COLS), GRID_COLS - 1);
      const row = Math.min(Math.floor((point.y / 1080) * GRID_ROWS), GRID_ROWS - 1);
      const key = `${col}-${row}`;
      grid.set(key, (grid.get(key) || 0) + point.count);
      totalClicks += point.count;
      
      if (point.elementTag && point.elementText) {
        const elKey = `${point.elementTag}: ${point.elementText.substring(0, 40)}`;
        elementCounts.set(elKey, (elementCounts.get(elKey) || 0) + point.count);
      }
    }
    
    // Find max for normalization
    const maxCount = Math.max(...Array.from(grid.values()), 1);
    
    const gridCells = Array.from(grid.entries()).map(([key, count]) => {
      const [col, row] = key.split("-").map(Number);
      return {
        x: col,
        y: row,
        intensity: count / maxCount,
        count,
      };
    });
    
    // Top elements
    const topElements = Array.from(elementCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, count]) => {
        const [tag, ...textParts] = key.split(": ");
        return { tag, text: textParts.join(": "), count };
      });
    
    return { grid: gridCells, topElements, totalClicks };
  }, [data]);

  const getHeatColor = (intensity: number): string => {
    if (intensity > 0.8) return "rgba(255, 0, 0, 0.7)";
    if (intensity > 0.6) return "rgba(255, 80, 0, 0.6)";
    if (intensity > 0.4) return "rgba(255, 165, 0, 0.5)";
    if (intensity > 0.2) return "rgba(255, 255, 0, 0.4)";
    return "rgba(0, 255, 0, 0.3)";
  };

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Flame className="w-5 h-5" />
          Click Heatmap
        </CardTitle>
        <div className="flex gap-2 mt-2">
          {[
            { label: "7d", value: 7 },
            { label: "14d", value: 14 },
            { label: "30d", value: 30 },
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
          <select
            value={page}
            onChange={(e) => setPage(e.target.value)}
            className="ml-auto text-xs border rounded px-2 py-1 bg-white"
          >
            <option value="/">Homepage</option>
            <option value="/levne-letenky">Levné letenky</option>
            <option value="/dovolena">Dovolená</option>
            <option value="/wishlist">Wishlist</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <MousePointerClick className="w-4 h-4 mx-auto text-orange-500 mb-1" />
                <p className="text-lg font-bold text-gray-900">{heatmapData.totalClicks.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Celkem kliků</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <Target className="w-4 h-4 mx-auto text-red-500 mb-1" />
                <p className="text-lg font-bold text-gray-900">{heatmapData.grid.length}</p>
                <p className="text-xs text-gray-500">Aktivních zón</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <Layers className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                <p className="text-lg font-bold text-gray-900">{(data?.points as any[])?.length || 0}</p>
                <p className="text-xs text-gray-500">Unikátních bodů</p>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
              {/* Grid overlay */}
              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(20, 1fr)`, gridTemplateRows: `repeat(15, 1fr)` }}>
                {heatmapData.grid.map((cell, i) => (
                  <div
                    key={i}
                    style={{
                      gridColumn: cell.x + 1,
                      gridRow: cell.y + 1,
                      backgroundColor: getHeatColor(cell.intensity),
                      borderRadius: "50%",
                      transform: `scale(${0.5 + cell.intensity * 0.5})`,
                      filter: `blur(${Math.max(1, 3 - cell.intensity * 3)}px)`,
                    }}
                    title={`${cell.count} kliků`}
                  />
                ))}
              </div>
              
              {/* Page label */}
              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {page} · {days}d
              </div>
              
              {/* Legend */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                <span>Málo</span>
                <div className="flex gap-0.5">
                  {["rgba(0,255,0,0.5)", "rgba(255,255,0,0.5)", "rgba(255,165,0,0.6)", "rgba(255,80,0,0.7)", "rgba(255,0,0,0.8)"].map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span>Hodně</span>
              </div>

              {heatmapData.totalClicks === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <MousePointerClick className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Zatím žádná data</p>
                    <p className="text-xs opacity-70">Kliknutí se začnou zobrazovat po návštěvách uživatelů</p>
                  </div>
                </div>
              )}
            </div>

            {/* Top Clicked Elements */}
            {heatmapData.topElements.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Nejklikovanější prvky</h4>
                <div className="space-y-1">
                  {heatmapData.topElements.slice(0, 5).map((el, i) => (
                    <div key={i} className="flex items-center justify-between bg-white rounded px-3 py-1.5 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{el.tag}</span>
                        <span className="truncate text-gray-700">{el.text}</span>
                      </div>
                      <span className="font-semibold text-orange-600 ml-2">{el.count}x</span>
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
