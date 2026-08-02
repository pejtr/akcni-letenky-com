import React, { useState, useEffect } from "react";
import { Clock, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UrgencyTimerProps {
  initialMinutes?: number;
  remainingSeats?: number;
  price?: number;
  onVerifyClick?: () => void;
}

export default function UrgencyTimer({
  initialMinutes = 165, // ~2h 45m
  remainingSeats = 3,
  price,
  onVerifyClick,
}: UrgencyTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-500/30 rounded-xl p-3 my-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-amber-700">
          <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>⚡ Akční cena vyprší za: <span className="font-mono text-sm text-rose-600 ml-1">{formattedTime}</span></span>
        </div>
        <div className="flex items-center gap-1 font-semibold text-rose-700">
          <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>Zbývá pouze <span className="font-extrabold">{remainingSeats}</span> míst za tuto cenu!</span>
        </div>
      </div>
    </div>
  );
}
