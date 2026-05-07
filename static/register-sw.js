// Register Service Worker for ButtonSpa PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then((registration) => {
        console.log("✅ ServiceWorker registered:", registration.scope);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute

        // Handle updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New service worker available
              console.log("🔄 New version available! Refresh to update.");

              // Show update notification to user (optional)
              if (window.showUpdateNotification) {
                window.showUpdateNotification();
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error("❌ ServiceWorker registration failed:", error);
      });
  });

  // Handle controller change (new SW activated)
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

// iOS PWA Detection
if (window.navigator.standalone === true) {
  document.body.classList.add("ios-standalone");
  console.log("📱 Running as iOS PWA");
}

// Add to Home Screen prompt for iOS
if (
  /iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.navigator.standalone
) {
  // Check if user has dismissed the prompt before
  const dismissed = localStorage.getItem("ios-install-dismissed");
  const dismissedTime = dismissed ? parseInt(dismissed) : 0;
  const daysSinceDismissed = (Date.now() - dismissedTime) /
    (1000 * 60 * 60 * 24);

  // Show prompt if not dismissed or dismissed more than 7 days ago
  if (!dismissed || daysSinceDismissed > 7) {
    setTimeout(() => {
      if (window.showIOSInstallPrompt) {
        window.showIOSInstallPrompt();
      }
    }, 3000); // Show after 3 seconds
  }
}
