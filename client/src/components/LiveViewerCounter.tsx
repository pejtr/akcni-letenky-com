/**
 * Live Viewer Counter Component
 * 
 * Displays simulated "X lidí právě prohlíží" counter on destination cards
 * to increase urgency and social proof
 * 
 * Time-based realistic counts:
 * - 6:00-10:00: 5-12 lidí (morning)
 * - 10:00-16:00: 15-30 lidí (daytime)
 * - 16:00-20:00: 35-60 lidí (evening peak)
 * - 20:00-24:00: 18-35 lidí (declining)
 * - 0:00-6:00: 2-8 lidí (night minimum)
 */

import { useState, useEffect, useMemo } from "react";
import { Eye } from "lucide-react";

interface LiveViewerCounterProps {
  destinationId: string;
  className?: string;
}

// Get time-based viewer range based on hour of day
function getViewerRangeByTime(): { min: number; max: number } {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 10) {
    // Morning: 6am-10am
    return { min: 5, max: 12 };
  } else if (hour >= 10 && hour < 16) {
    // Daytime: 10am-4pm
    return { min: 15, max: 30 };
  } else if (hour >= 16 && hour < 20) {
    // Evening peak: 4pm-8pm
    return { min: 35, max: 60 };
  } else if (hour >= 20 || hour < 0) {
    // Late evening: 8pm-12am
    return { min: 18, max: 35 };
  } else {
    // Night: 12am-6am
    return { min: 2, max: 8 };
  }
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
}: LiveViewerCounterProps) {
  // Get time-based range
  const { min: minViewers, max: maxViewers } = getViewerRangeByTime();
  
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
      // Recalculate range in case hour changed
      const { min, max } = getViewerRangeByTime();
      
      setCurrentViewers(prev => {
        // Random change between -5 and +8 (more dynamic)
        const change = Math.floor(Math.random() * 14) - 5;
        const newValue = prev + change;
        
        // Keep within time-based bounds
        if (newValue < min) {
          setIsIncreasing(true);
          return min + Math.floor(Math.random() * 5);
        }
        if (newValue > max) {
          setIsIncreasing(false);
          return max - Math.floor(Math.random() * 5);
        }
        
        setIsIncreasing(change > 0);
        return newValue;
      });
    };

    // Update every 30-60 seconds
    const interval = setInterval(updateViewers, 30000 + Math.random() * 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Update base viewers when hour changes
  useEffect(() => {
    const checkHourChange = () => {
      const { min, max } = getViewerRangeByTime();
      const newBase = getBaseViewers(destinationId, min, max);
      setCurrentViewers(newBase);
    };

    // Check every minute for hour change
    const interval = setInterval(checkHourChange, 60000);
    
    return () => clearInterval(interval);
  }, [destinationId]);

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
