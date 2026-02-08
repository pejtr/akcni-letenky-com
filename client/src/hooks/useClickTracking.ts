/**
 * useClickTracking Hook
 * 
 * Tracks all click events on the page and sends them in batches to the server.
 * Uses a buffer to minimize network requests (sends every 5 seconds or when buffer reaches 20 events).
 */

import { useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";

interface ClickData {
  page: string;
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
  elementTag: string;
  elementText: string;
  elementId: string;
  elementClass: string;
  sessionId: string;
}

function getSessionId(): string {
  let sid = sessionStorage.getItem("click_session_id");
  if (!sid) {
    sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem("click_session_id", sid);
  }
  return sid;
}

export function useClickTracking(enabled: boolean = true) {
  const bufferRef = useRef<ClickData[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const batchMutation = trpc.heatmap.recordBatch.useMutation();

  const flush = useCallback(() => {
    if (bufferRef.current.length === 0) return;
    const batch = [...bufferRef.current];
    bufferRef.current = [];
    batchMutation.mutate({ events: batch });
  }, [batchMutation]);

  useEffect(() => {
    if (!enabled) return;

    const sessionId = getSessionId();

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Skip tracking clicks on admin pages
      if (window.location.pathname.startsWith("/admin")) return;

      const clickData: ClickData = {
        page: window.location.pathname,
        x: e.clientX + window.scrollX,
        y: e.clientY + window.scrollY,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        elementTag: target.tagName?.toLowerCase() || "",
        elementText: (target.textContent || "").trim().substring(0, 100),
        elementId: target.id || "",
        elementClass: (target.className && typeof target.className === "string") 
          ? target.className.substring(0, 200) : "",
        sessionId,
      };

      bufferRef.current.push(clickData);

      // Flush if buffer is large enough
      if (bufferRef.current.length >= 20) {
        const batch = [...bufferRef.current];
        bufferRef.current = [];
        batchMutation.mutate({ events: batch });
      }
    };

    document.addEventListener("click", handleClick, { passive: true });

    // Flush buffer periodically (every 10 seconds)
    timerRef.current = setInterval(() => {
      if (bufferRef.current.length > 0) {
        const batch = [...bufferRef.current];
        bufferRef.current = [];
        batchMutation.mutate({ events: batch });
      }
    }, 10000);

    // Flush on page unload
    const handleUnload = () => {
      if (bufferRef.current.length > 0) {
        const batch = [...bufferRef.current];
        bufferRef.current = [];
        // Use sendBeacon for reliability on unload
        const payload = JSON.stringify(batch);
        navigator.sendBeacon?.("/api/trpc/heatmap.recordBatch", payload);
      }
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("beforeunload", handleUnload);
      if (timerRef.current) clearInterval(timerRef.current);
      // Flush remaining
      if (bufferRef.current.length > 0) {
        const batch = [...bufferRef.current];
        bufferRef.current = [];
        batchMutation.mutate({ events: batch });
      }
    };
  }, [enabled, batchMutation]);

  return { flush };
}
