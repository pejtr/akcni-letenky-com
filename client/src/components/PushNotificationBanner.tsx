/**
 * PushNotificationBanner Component
 * 
 * Shows a banner on the Wishlist/Price Alerts page encouraging users
 * to enable push notifications. When subscribed, shows category preferences
 * so users can choose which types of notifications to receive.
 */

import { useState } from "react";
import {
  usePushNotifications,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  type NotificationCategory,
} from "@/hooks/usePushNotifications";

const ALL_CATEGORIES: NotificationCategory[] = ["price_drop", "news", "deal", "custom"];

const CATEGORY_ICONS: Record<NotificationCategory, string> = {
  price_drop: "📉",
  news: "📰",
  deal: "🏷️",
  custom: "💬",
};

export function PushNotificationBanner() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    preferences,
    toggleCategory,
    isPrefsLoading,
  } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);

  if (!isSupported || dismissed) return null;

  // Subscribed state with preferences
  if (isSubscribed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-lg">🔔</span>
            <span className="text-green-800 text-sm font-medium">
              Push notifikace jsou aktivní
            </span>
            <span className="text-green-600 text-xs bg-green-100 px-2 py-0.5 rounded-full">
              {preferences.length}/{ALL_CATEGORIES.length} kategorií
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPrefs(!showPrefs)}
              className="text-green-700 text-xs font-medium hover:text-green-900 flex items-center gap-1"
            >
              ⚙️ {showPrefs ? "Skrýt" : "Předvolby"}
            </button>
            <button
              onClick={async () => { await unsubscribe(); }}
              className="text-green-600 text-xs underline hover:text-green-800"
              disabled={isLoading}
            >
              Vypnout
            </button>
          </div>
        </div>

        {/* Category preferences */}
        {showPrefs && (
          <div className="mt-3 pt-3 border-t border-green-200">
            <p className="text-green-700 text-xs mb-3">
              Vyberte, které typy notifikací chcete dostávat:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const isEnabled = preferences.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    disabled={isPrefsLoading}
                    className={`flex items-start gap-2 p-2.5 rounded-lg border text-left transition-all ${
                      isEnabled
                        ? "bg-green-100 border-green-300 text-green-800"
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                    } ${isPrefsLoading ? "opacity-50" : ""}`}
                  >
                    <span className="text-base mt-0.5">{CATEGORY_ICONS[cat]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{CATEGORY_LABELS[cat]}</span>
                        <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] ${
                          isEnabled ? "bg-green-500 text-white" : "bg-gray-300 text-white"
                        }`}>
                          {isEnabled ? "✓" : ""}
                        </span>
                      </div>
                      <p className="text-[10px] leading-tight mt-0.5 opacity-75">
                        {CATEGORY_DESCRIPTIONS[cat]}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            {error && (
              <p className="text-red-600 text-xs mt-2">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Permission denied
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

  // Not subscribed - show opt-in banner
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
            Dostávejte okamžitá upozornění přímo v prohlížeči – poklesy cen, akční nabídky i novinky.
            Po aktivaci si můžete vybrat, které kategorie chcete dostávat.
          </p>
          {error && (
            <p className="text-red-600 text-xs mt-1">{error}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={async () => { await subscribe(); }}
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
