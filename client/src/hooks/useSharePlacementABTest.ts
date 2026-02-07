/**
 * A/B Test Hook: Share Button Placement
 * 
 * Variant A (card): Share button shown directly on destination cards
 * Variant B (detail): Share button shown only in destination detail page
 * 
 * Randomly assigns users to a variant and tracks interactions.
 */

import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";

type SharePlacementVariant = "card" | "detail";

const STORAGE_KEY = "ab_share_placement";

function getSessionId(): string {
  let sessionId = localStorage.getItem("ab_session_id");
  if (!sessionId) {
    sessionId = `s_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("ab_session_id", sessionId);
  }
  return sessionId;
}

export function useSharePlacementABTest() {
  const [variant, setVariant] = useState<SharePlacementVariant | null>(null);
  const [sessionId] = useState(getSessionId);

  const recordAssignment = trpc.abTestSharing.recordAssignment.useMutation();
  const recordEvent = trpc.abTestSharing.recordEvent.useMutation();

  useEffect(() => {
    // Check if variant already assigned
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "card" || stored === "detail") {
      setVariant(stored);
      return;
    }

    // Randomly assign variant (50/50)
    const assigned: SharePlacementVariant = Math.random() < 0.5 ? "card" : "detail";
    localStorage.setItem(STORAGE_KEY, assigned);
    setVariant(assigned);

    // Record assignment in backend
    recordAssignment.mutate({ sessionId, variant: assigned });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const trackShareClick = useCallback(
    (platform: string) => {
      if (!variant) return;
      recordEvent.mutate({
        sessionId,
        variant,
        eventType: "share_click",
        eventData: platform,
      });
    },
    [variant, sessionId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const trackShareOpen = useCallback(() => {
    if (!variant) return;
    recordEvent.mutate({
      sessionId,
      variant,
      eventType: "share_panel_open",
    });
  }, [variant, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const trackConversion = useCallback(
    (platform: string) => {
      if (!variant) return;
      recordEvent.mutate({
        sessionId,
        variant,
        eventType: "cta_click",
        eventData: platform,
      });
    },
    [variant, sessionId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return {
    variant,
    sessionId,
    showOnCard: variant === "card",
    showOnDetail: variant === "detail",
    trackShareClick,
    trackShareOpen,
    trackConversion,
  };
}
