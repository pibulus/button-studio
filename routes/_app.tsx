import { type PageProps } from "$fresh/server.ts";
import { BRAND_NAME } from "../utils/brand.ts";

export default function App({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        {/* PWA & iOS App Meta Tags */}
        <meta name="application-name" content={BRAND_NAME} />
        <meta name="apple-mobile-web-app-title" content={BRAND_NAME} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#F7F0E2" />

        {/* iOS Icon */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Standard Icons */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="icon" href="/favicon.ico" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* iOS Splash Screens for common devices */}
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
          href="/splash-iphone-15-pro-max.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
          href="/splash-iphone-15-pro.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
          href="/splash-iphone-14.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
          href="/splash-iphone-x.png"
        />

        {/* Prevent zooming and bouncing on iOS */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />

        <link rel="stylesheet" href="/styles.css" />

        {/* Service Worker Registration for PWA */}
        <script src="/register-sw.js" defer></script>
      </head>
      <body class="safe-area-inset">
        <Component />
      </body>
    </html>
  );
}
