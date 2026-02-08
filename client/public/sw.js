/**
 * Service Worker for Akční Letenky
 * 
 * Handles push notifications for price drop alerts.
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

  const options = {
    body: data.body || "Nová nabídka na Akční Letenky!",
    icon: data.icon || "/favicon.ico",
    badge: data.badge || "/favicon.ico",
    tag: data.tag || "akcni-letenky",
    data: {
      url: data.url || "/",
      ...data.data,
    },
    vibrate: [200, 100, 200],
    actions: [
      {
        action: "open",
        title: "Zobrazit nabídku",
      },
      {
        action: "dismiss",
        title: "Zavřít",
      },
    ],
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
