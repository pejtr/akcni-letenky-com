/**
 * usePushNotifications Hook
 * 
 * Manages browser push notification subscription state and category preferences.
 * Handles service worker registration, permission requests,
 * and subscription management via tRPC.
 */

import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";

export type PushPermissionState = "default" | "granted" | "denied" | "unsupported";
export type NotificationCategory = "price_drop" | "news" | "deal" | "custom";

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  price_drop: "Poklesy cen",
  news: "Novinky",
  deal: "Akční nabídky",
  custom: "Ostatní",
};

export const CATEGORY_DESCRIPTIONS: Record<NotificationCategory, string> = {
  price_drop: "Upozornění na pokles cen sledovaných destinací",
  news: "Novinky a tipy pro cestování",
  deal: "Speciální akční nabídky a slevy",
  custom: "Ostatní oznámení a důležité informace",
};

export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationCategory[]>([
    "price_drop", "news", "deal", "custom",
  ]);

  const subscribeMutation = trpc.pushNotifications.subscribe.useMutation();
  const unsubscribeMutation = trpc.pushNotifications.unsubscribe.useMutation();
  const updatePrefsMutation = trpc.pushNotifications.updatePreferences.useMutation();

  // Check if push is supported
  const isSupported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;

  // Get VAPID public key from env
  const vapidPublicKey = typeof import.meta !== "undefined"
    ? (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY
    : null;

  // Fetch preferences when we have an endpoint
  const prefsQuery = trpc.pushNotifications.getPreferences.useQuery(
    { endpoint: currentEndpoint || "" },
    { enabled: !!currentEndpoint && isSubscribed }
  );

  // Sync fetched preferences
  useEffect(() => {
    if (prefsQuery.data?.preferences) {
      setPreferences(prefsQuery.data.preferences as NotificationCategory[]);
    }
  }, [prefsQuery.data]);

  // Check current permission and subscription state
  useEffect(() => {
    if (!isSupported) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission as PushPermissionState);
    checkSubscription();
  }, [isSupported]);

  async function checkSubscription() {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
        if (subscription) {
          setCurrentEndpoint(subscription.endpoint);
        }
      }
    } catch (err) {
      console.warn("[PushNotifications] Failed to check subscription:", err);
    }
  }

  // Convert VAPID key from base64 to Uint8Array
  function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer as ArrayBuffer;
  }

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported || !vapidPublicKey) {
      setError("Push notifikace nejsou podporovány v tomto prohlížeči.");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermissionState);

      if (perm !== "granted") {
        setError("Notifikace byly zamítnuty. Povolte je v nastavení prohlížeče.");
        setIsLoading(false);
        return false;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const subJson = subscription.toJSON();

      await subscribeMutation.mutateAsync({
        endpoint: subJson.endpoint!,
        keys: {
          p256dh: subJson.keys!.p256dh!,
          auth: subJson.keys!.auth!,
        },
      });

      setIsSubscribed(true);
      setCurrentEndpoint(subJson.endpoint!);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error("[PushNotifications] Subscribe failed:", err);
      setError(err.message || "Nepodařilo se aktivovat push notifikace.");
      setIsLoading(false);
      return false;
    }
  }, [isSupported, vapidPublicKey, subscribeMutation]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!isSupported) return false;

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await unsubscribeMutation.mutateAsync({
            endpoint: subscription.endpoint,
          });
        }
      }

      setIsSubscribed(false);
      setCurrentEndpoint(null);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error("[PushNotifications] Unsubscribe failed:", err);
      setError(err.message || "Nepodařilo se deaktivovat push notifikace.");
      setIsLoading(false);
      return false;
    }
  }, [isSupported, unsubscribeMutation]);

  // Update category preferences
  const updatePreferences = useCallback(async (newPrefs: NotificationCategory[]) => {
    if (!currentEndpoint) return false;

    try {
      await updatePrefsMutation.mutateAsync({
        endpoint: currentEndpoint,
        preferences: newPrefs,
      });
      setPreferences(newPrefs);
      return true;
    } catch (err: any) {
      console.error("[PushNotifications] Failed to update preferences:", err);
      setError(err.message || "Nepodařilo se uložit předvolby.");
      return false;
    }
  }, [currentEndpoint, updatePrefsMutation]);

  // Toggle a single category
  const toggleCategory = useCallback(async (category: NotificationCategory) => {
    const newPrefs = preferences.includes(category)
      ? preferences.filter((c) => c !== category)
      : [...preferences, category];
    
    // Ensure at least one category is enabled
    if (newPrefs.length === 0) {
      setError("Musíte mít alespoň jednu kategorii aktivní.");
      return false;
    }

    return await updatePreferences(newPrefs);
  }, [preferences, updatePreferences]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    preferences,
    updatePreferences,
    toggleCategory,
    isPrefsLoading: prefsQuery.isLoading || updatePrefsMutation.isPending,
  };
}
