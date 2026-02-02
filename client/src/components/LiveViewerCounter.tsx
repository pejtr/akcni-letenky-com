/**
 * Live Viewer Counter Component
 * 
 * Displays simulated "X lidí právě prohlíží" counter on destination cards
 * to increase urgency and social proof
 */

import { useState, useEffect, useMemo } from "react";
import { Eye } from "lucide-react";

interface LiveViewerCounterProps {
  destinationId: string;
  className?: string;
  minViewers?: number;
  maxViewers?: number;
}

// Generate consistent base number for destination (seeded random)
function getBaseViewers(destinationId: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < destinationId.length; i++) {
    const char = destinationId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const normalized = Math.abs(hash) / 2147483647;
  return Math.floor(min + normalized * (max - min));
}

export default function LiveViewerCounter({
  destinationId,
  className = "",
  minViewers = 15,
  maxViewers = 45,
}: LiveViewerCounterProps) {
  // Get base viewer count (consistent per destination)
  const baseViewers = useMemo(
    () => getBaseViewers(destinationId, minViewers, maxViewers),
    [destinationId, minViewers, maxViewers]
  );

  const [currentViewers, setCurrentViewers] = useState(baseViewers);
  const [isIncreasing, setIsIncreasing] = useState(true);

  // Fluctuate viewer count every 30-60 seconds
  useEffect(() => {
    const updateViewers = () => {
      setCurrentViewers(prev => {
        // Random change between -3 and +5
        const change = Math.floor(Math.random() * 9) - 3;
        const newValue = prev + change;
        
        // Keep within reasonable bounds
        if (newValue < minViewers) {
          setIsIncreasing(true);
          return minViewers + Math.floor(Math.random() * 5);
        }
        if (newValue > maxViewers) {
          setIsIncreasing(false);
          return maxViewers - Math.floor(Math.random() * 5);
        }
        
        setIsIncreasing(change > 0);
        return newValue;
      });
    };

    // Update every 30-60 seconds
    const interval = setInterval(updateViewers, 30000 + Math.random() * 30000);
    
    return () => clearInterval(interval);
  }, [minViewers, maxViewers]);

  return (
    <div className={`flex items-center gap-1.5 text-xs ${className}`}>
      {/* Pulsing red dot */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </span>
      
      {/* Eye icon */}
      <Eye className="w-3.5 h-3.5 text-gray-500" />
      
      {/* Viewer count with animation */}
      <span className={`font-semibold transition-all duration-300 ${isIncreasing ? 'text-green-600' : 'text-gray-600'}`}>
        {currentViewers}
      </span>
      
      <span className="text-gray-500">lidí prohlíží</span>
    </div>
  );
}
