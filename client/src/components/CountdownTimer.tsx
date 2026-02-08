import { useState, useEffect, useMemo } from "react";
import { Clock } from "lucide-react";

/**
 * Countdown timer that creates urgency by showing time remaining
 * until the "offer expires". Resets every 6 hours to maintain urgency.
 */
export default function CountdownTimer({ className = "" }: { className?: string }) {
  // Calculate a stable end time based on 6-hour windows
  const endTime = useMemo(() => {
    const now = Date.now();
    const sixHours = 6 * 60 * 60 * 1000;
    // Round up to next 6-hour window
    const windowEnd = Math.ceil(now / sixHours) * sixHours;
    return windowEnd;
  }, []);

  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = endTime - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = endTime - Date.now();
      const seconds = Math.max(0, Math.floor(diff / 1000));
      setTimeLeft(seconds);
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (timeLeft <= 0) return null;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Clock className="w-3.5 h-3.5 text-red-500 animate-pulse" />
      <span className="text-xs font-bold text-red-600 whitespace-nowrap">
        Akce končí za{" "}
        <span className="font-mono bg-red-100 text-red-700 px-1 py-0.5 rounded text-xs">
          {pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </span>
      </span>
    </div>
  );
}
