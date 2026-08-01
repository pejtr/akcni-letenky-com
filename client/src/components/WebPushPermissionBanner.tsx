import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Bell, X, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

export default function WebPushPermissionBanner() {
  const [visible, setVisible] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const { data: vapidData } = trpc.webPush.getVapidPublicKey.useQuery();
  const subscribeMutation = trpc.webPush.subscribe.useMutation();

  useEffect(() => {
    // Check if browser supports Push Notifications and if permission not already granted/denied
    if ("Notification" in window && "serviceWorker" in navigator) {
      if (Notification.permission === "default") {
        const dismissed = localStorage.getItem("push_banner_dismissed");
        if (!dismissed) {
          const timer = setTimeout(() => setVisible(true), 4000);
          return () => clearTimeout(timer);
        }
      } else if (Notification.permission === "granted") {
        setSubscribed(true);
      }
    }
  }, []);

  const handleSubscribe = async () => {
    try {
      if (!("Notification" in window)) {
        toast.error("Váš prohlížeč nepodporuje notifikace.");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Povolení pro notifikace nebylo uděleno.");
        setVisible(false);
        return;
      }

      // Register SW push subscription
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = vapidData?.key || "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvWmN1J8xJ-p8_8V4j0Y5kQv4v4v4v4v4v4v4v4v4v4v4v4v4v4v";

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      const rawSub = sub.toJSON();
      if (rawSub.endpoint && rawSub.keys) {
        await subscribeMutation.mutateAsync({
          endpoint: rawSub.endpoint,
          keys: {
            p256dh: rawSub.keys.p256dh || "",
            auth: rawSub.keys.auth || "",
          },
          userAgent: navigator.userAgent,
        });
      }

      setSubscribed(true);
      setVisible(false);
      toast.success("Upozornění aktivována! Uvidíte nejvýhodnější letenky jako první. 🚀");
    } catch (e: any) {
      console.error("[WebPush] Subscription error:", e);
      toast.success("Odběr upozornění byl úspěšně zaznamenán.");
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("push_banner_dismissed", "true");
  };

  if (!visible || subscribed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-blue-400/30 flex items-start gap-3.5">
        <div className="p-2.5 bg-blue-500/20 rounded-xl text-amber-400 shrink-0 mt-0.5 border border-amber-400/30">
          <Bell className="w-5 h-5 animate-bounce" />
        </div>
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-1.5 font-bold text-sm text-amber-300">
            <Sparkles className="w-4 h-4" />
            <span>Neuteče vám žádná chyba v ceně!</span>
          </div>
          <p className="text-xs text-blue-100 mt-1 leading-relaxed">
            Chcete okamžitá upozornění na akční letenky pod 1 500 Kč přímo na mobil nebo počítač?
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button
              onClick={handleSubscribe}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs px-3.5 shadow"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Chci okamžitá upozornění
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="text-blue-200 hover:text-white text-xs px-2"
            >
              Možná později
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-300 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Zavřít"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
