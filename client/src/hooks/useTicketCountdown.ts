/**
 * useTicketCountdown Hook
 * 
 * Creates a dynamic, gradually decreasing ticket count to create urgency.
 * The count starts from a session-persisted value and decreases at random intervals.
 * Resets daily to maintain credibility.
 */

import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "ticket_countdown_state";
const INITIAL_COUNT = 14; // Start with 14 tickets
const MIN_COUNT = 3; // Never go below 3

interface CountdownState {
  count: number;
  lastUpdated: number;
  dayKey: string;
}

function getDayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
}

function getStoredState(): CountdownState | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored) as CountdownState;
      // Reset if it's a new day
      if (state.dayKey !== getDayKey()) {
        return null;
      }
      return state;
    }
  } catch {}
  return null;
}

function saveState(state: CountdownState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useTicketCountdown(): number {
  const [count, setCount] = useState<number>(() => {
    const stored = getStoredState();
    return stored ? stored.count : INITIAL_COUNT;
  });
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Save initial state
    saveState({
      count,
      lastUpdated: Date.now(),
      dayKey: getDayKey(),
    });

    const scheduleNextDecrease = () => {
      // Random interval between 15-45 seconds
      const interval = (15 + Math.random() * 30) * 1000;
      
      timerRef.current = setTimeout(() => {
        setCount((prev) => {
          if (prev <= MIN_COUNT) {
            // Reset back to a higher number (simulates "new batch")
            const newCount = 8 + Math.floor(Math.random() * 5); // 8-12
            saveState({
              count: newCount,
              lastUpdated: Date.now(),
              dayKey: getDayKey(),
            });
            return newCount;
          }
          
          // Decrease by 1
          const newCount = prev - 1;
          saveState({
            count: newCount,
            lastUpdated: Date.now(),
            dayKey: getDayKey(),
          });
          return newCount;
        });
        
        // Schedule next decrease
        scheduleNextDecrease();
      }, interval);
    };

    scheduleNextDecrease();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return count;
}
