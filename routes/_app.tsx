import { type PageProps } from "$fresh/server.ts";
export default function App({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <title>ButtonSpa - Voice Button Designer</title>

        {/* PWA & iOS App Meta Tags */}
        <meta name="application-name" content="ButtonSpa" />
        <meta name="apple-mobile-web-app-title" content="ButtonSpa" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#FF69B4" />
        <meta
          name="description"
          content="Make cute buttons that do real things. Design voice buttons, export them as tiny apps, and save them to your phone."
        />

        {/* Open Graph / Social Media */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://buttonspa.app/" />
        <meta
          property="og:title"
          content="ButtonSpa - Voice Button Designer"
        />
        <meta
          property="og:description"
          content="Make cute buttons that do real things. Design polished voice buttons, then share, embed, or install them as tiny apps."
        />
        <meta property="og:image" content="/og-image.png" />

        {/* Twitter Card */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://buttonspa.app/" />
        <meta
          property="twitter:title"
          content="ButtonSpa - Voice Button Designer"
        />
        <meta
          property="twitter:description"
          content="Make cute buttons that do real things. Design polished voice buttons, then share, embed, or install them as tiny apps."
        />
        <meta property="twitter:image" content="/og-image.png" />

        {/* iOS Icon Support - Multiple Sizes */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon-180.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/apple-touch-icon-152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/apple-touch-icon-120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/apple-touch-icon-76.png"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Standard Icons */}
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
