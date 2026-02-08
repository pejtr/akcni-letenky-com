/**
 * Service Worker for Akční Letenky
 * 
 * Handles push notifications for:
 * - Price drop alerts
 * - News and updates
 * - Promotional deals and offers
 * - Custom broadcast messages
 * - A/B test variant tracking
 * 
 * Registered from the frontend when user opts in to push notifications.
 */

// Listen for push events
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = {
      title: "Akční Letenky",
      body: event.data.text(),
    };
  }

  const notificationType = data.data?.type || "custom";

  // Category-specific icons and actions
  const categoryConfig = {
    price_drop: {
      icon: data.icon || "/favicon.ico",
      badge: "/favicon.ico",
      actions: [
        { action: "open", title: "📉 Zobrazit nabídku" },
        { action: "dismiss", title: "Zavřít" },
      ],
    },
    news: {
      icon: data.icon || "/favicon.ico",
      badge: "/favicon.ico",
      actions: [
        { action: "open", title: "📰 Přečíst novinku" },
        { action: "dismiss", title: "Zavřít" },
      ],
    },
    deal: {
      icon: data.icon || "/favicon.ico",
      badge: "/favicon.ico",
      actions: [
        { action: "open", title: "🏷️ Zobrazit akci" },
        { action: "dismiss", title: "Zavřít" },
      ],
    },
    custom: {
      icon: data.icon || "/favicon.ico",
      badge: "/favicon.ico",
      actions: [
        { action: "open", title: "Otevřít" },
        { action: "dismiss", title: "Zavřít" },
      ],
    },
  };

  const config = categoryConfig[notificationType] || categoryConfig.custom;

  const options = {
    body: data.body || "Nová nabídka na Akční Letenky!",
    icon: config.icon,
    badge: config.badge,
    tag: data.tag || `akcni-letenky-${notificationType}`,
    data: {
      url: data.url || "/",
      type: notificationType,
      ...data.data,
    },
    vibrate: [200, 100, 200],
    actions: config.actions,
    requireInteraction: notificationType === "deal",
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Akční Letenky", options)
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notifData = event.notification.data || {};
  const url = notifData.url || "/";

  if (event.action === "dismiss") {
    return;
  }

  // Track A/B test open if this notification is part of a test
  if (notifData.abTestId && notifData.variant) {
    event.waitUntil(
      trackAbTestOpen(notifData.abTestId, notifData.variant)
    );
  }

  // Open the URL or focus existing tab
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Track A/B test notification open via tRPC
async function trackAbTestOpen(testId, variant) {
  try {
    const response = await fetch("/api/trpc/pushNotifications.recordAbOpen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        json: { testId: testId, variant: variant },
      }),
    });
    if (!response.ok) {
      console.warn("[SW] Failed to track A/B test open:", response.status);
    }
  } catch (err) {
    console.warn("[SW] Failed to track A/B test open:", err);
  }
}

// Handle service worker activation
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
