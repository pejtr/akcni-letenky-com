/**
 * Urgency Timer Component
 * 
 * Displays countdown timer for flight offers to create urgency.
 * Timer persists in localStorage per offer.
 */

import * as React from "react";
import { Clock } from "lucide-react";

interface UrgencyTimerProps {
  offerId: string;
  className?: string;
}

export default function UrgencyTimer({ offerId, className = "" }: UrgencyTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null);

  React.useEffect(() => {
    const STORAGE_KEY = `urgency_timer_${offerId}`;
    
    // Get or create expiry time
    let expiryTime = localStorage.getItem(STORAGE_KEY);
    
    if (!expiryTime) {
      // Generate random expiry time between 6-24 hours from now
      const hoursUntilExpiry = 6 + Math.random() * 18;
      const expiry = Date.now() + (hoursUntilExpiry * 60 * 60 * 1000);
      localStorage.setItem(STORAGE_KEY, expiry.toString());
      expiryTime = expiry.toString();
    }

    const expiry = parseInt(expiryTime);

    // Update timer every second
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = expiry - now;

      if (remaining <= 0) {
        // Timer expired - generate new one
        const hoursUntilExpiry = 6 + Math.random() * 18;
        const newExpiry = Date.now() + (hoursUntilExpiry * 60 * 60 * 1000);
        localStorage.setItem(STORAGE_KEY, newExpiry.toString());
        setTimeLeft(newExpiry - Date.now());
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    // Set initial time
    setTimeLeft(expiry - Date.now());

    return () => clearInterval(interval);
  }, [offerId]);

  if (timeLeft === null) {
    return null;
  }

  // Calculate hours and minutes
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  // Determine urgency level
  const isUrgent = hours < 3;
  const isVeryUrgent = hours < 1;

  return (
    <div
      className={`flex items-center gap-2 text-sm font-medium ${
        isVeryUrgent
          ? "text-red-600 animate-pulse"
          : isUrgent
          ? "text-orange-600"
          : "text-gray-600"
      } ${className}`}
    >
      <Clock
        className={`w-4 h-4 ${
          isVeryUrgent ? "animate-pulse" : ""
        }`}
      />
      <span>
        Nabídka platí ještě{" "}
        <span className="font-bold">
          {hours > 0 && `${hours}h `}
          {minutes}min
        </span>
      </span>
    </div>
  );
}
