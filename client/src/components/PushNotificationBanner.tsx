/**
 * PushNotificationBanner Component
 * 
 * Shows a banner on the Wishlist/Price Alerts page encouraging users
 * to enable push notifications for instant price drop alerts.
 */

import { useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function PushNotificationBanner() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if not supported, already subscribed, or dismissed
  if (!isSupported || dismissed) return null;

  // If already subscribed, show a small status indicator
  if (isSubscribed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-green-600 text-lg">🔔</span>
          <span className="text-green-800 text-sm font-medium">
            Push notifikace jsou aktivní – budete okamžitě informováni o poklesech cen.
          </span>
        </div>
        <button
          onClick={async () => {
            await unsubscribe();
          }}
          className="text-green-600 text-xs underline hover:text-green-800"
          disabled={isLoading}
        >
          Vypnout
        </button>
      </div>
    );
  }

  // If permission denied
  if (permission === "denied") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-yellow-600 text-lg">⚠️</span>
          <span className="text-yellow-800 text-sm">
            Push notifikace jsou zablokované. Pro aktivaci je povolte v nastavení prohlížeče.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🔔</span>
            <h3 className="text-blue-900 font-bold text-sm">
              Zapněte push notifikace
            </h3>
          </div>
          <p className="text-blue-700 text-xs leading-relaxed">
            Dostávejte okamžitá upozornění přímo v prohlížeči, když cena letenky klesne.
            Žádný email, žádné čekání – notifikace se zobrazí ihned.
          </p>
          {error && (
            <p className="text-red-600 text-xs mt-1">{error}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={async () => {
              await subscribe();
            }}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? "Aktivuji..." : "Aktivovat"}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-blue-400 hover:text-blue-600 text-lg leading-none"
            title="Zavřít"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
