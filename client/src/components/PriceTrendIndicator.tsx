import * as React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceTrendIndicatorProps {
  destinationId: string;
  currentPrice: number;
  className?: string;
}

function hashWithSeed(id: string, seed: string): number {
  const combined = id + ":" + seed;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) / 2147483647;
}

export default function PriceTrendIndicator({ destinationId, currentPrice, className }: PriceTrendIndicatorProps) {
  const trend = React.useMemo(() => {
    const trendValue = hashWithSeed(destinationId, "trend");
    const changePercent = hashWithSeed(destinationId, "change");
    const days = hashWithSeed(destinationId, "days");

    const isDown = trendValue > 0.35;
    const percentChange = Math.round(5 + changePercent * 20);
    const daysAgo = Math.round(1 + days * 6);

    return { isDown, percentChange, daysAgo };
  }, [destinationId]);

  if (!trend.isDown) return null;

  return (
    <div className={cn("flex items-center gap-1 text-xs font-medium", className)}>
      <TrendingDown className="w-3 h-3 text-green-600" />
      <span className="text-green-600">
        &#8722;{trend.percentChange}% za {trend.daysAgo} dny
      </span>
      <span className="text-gray-400 line-through text-[10px] ml-1">
        {Math.round(currentPrice * (1 + trend.percentChange / 100)).toLocaleString("cs-CZ")} Kč
      </span>
    </div>
  );
}