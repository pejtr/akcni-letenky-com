/**
 * usePushNotifications Hook
 * 
 * Manages browser push notification subscription state.
 * Handles service worker registration, permission requests,
 * and subscription management via tRPC.
 */

import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";

export type PushPermissionState = "default" | "granted" | "denied" | "unsupported";

export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribeMutation = trpc.pushNotifications.subscribe.useMutation();
  const unsubscribeMutation = trpc.pushNotifications.unsubscribe.useMutation();

  // Check if push is supported
  const isSupported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;

  // Get VAPID public key from env
  const vapidPublicKey = typeof import.meta !== "undefined"
    ? (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY
    : null;

  // Check current permission and subscription state
  useEffect(() => {
    if (!isSupported) {
      setPermission("unsupported");
      return;
    }

    // Check Notification permission
    setPermission(Notification.permission as PushPermissionState);

    // Check if already subscribed
    checkSubscription();
  }, [isSupported]);

  async function checkSubscription() {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
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
      // Request notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermissionState);

      if (perm !== "granted") {
        setError("Notifikace byly zamítnuty. Povolte je v nastavení prohlížeče.");
        setIsLoading(false);
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const subJson = subscription.toJSON();

      // Save subscription to server
      await subscribeMutation.mutateAsync({
        endpoint: subJson.endpoint!,
        keys: {
          p256dh: subJson.keys!.p256dh!,
          auth: subJson.keys!.auth!,
        },
      });

      setIsSubscribed(true);
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
          // Unsubscribe from push manager
          await subscription.unsubscribe();

          // Remove from server
          await unsubscribeMutation.mutateAsync({
            endpoint: subscription.endpoint,
          });
        }
      }

      setIsSubscribed(false);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error("[PushNotifications] Unsubscribe failed:", err);
      setError(err.message || "Nepodařilo se deaktivovat push notifikace.");
      setIsLoading(false);
      return false;
    }
  }, [isSupported, unsubscribeMutation]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  };
}
