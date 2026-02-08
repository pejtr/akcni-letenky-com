/**
 * Service Worker for Akční Letenky
 * 
 * Handles push notifications for:
 * - Price drop alerts
 * - News and updates
 * - Promotional deals and offers
 * - Custom broadcast messages
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
    requireInteraction: notificationType === "deal", // Deals stay visible until user interacts
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Akční Letenky", options)
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  if (event.action === "dismiss") {
    return;
  }

  // Open the URL or focus existing tab
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Try to focus an existing tab
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open a new tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Handle service worker activation
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
