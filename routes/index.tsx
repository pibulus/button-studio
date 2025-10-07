import { Head } from "$fresh/runtime.ts";
import ButtonStudio from "../islands/ButtonStudio.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>
          ButtonStudio - Voice Button Design Lab | Create Beautiful Voice
          Buttons
        </title>
        <meta
          name="description"
          content="Design and customize beautiful voice recording buttons with real-time transcription. Export as HTML, PWA, or share your designs. The Figma for voice buttons."
        />

        {/* Mobile */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="theme-color" content="#FFF8F0" />

        {/* SEO and Open Graph */}
        <meta
          property="og:title"
          content="ButtonStudio - Voice Button Design Lab"
        />
        <meta
          property="og:description"
          content="Design beautiful voice recording buttons with real-time transcription. Export as HTML, PWA, or share your designs."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://buttonstudio.app" />
        <meta property="og:image" content="/og-image.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="ButtonStudio - Voice Button Design Lab"
        />
        <meta
          name="twitter:description"
          content="Design beautiful voice recording buttons with real-time transcription."
        />
        <meta name="twitter:image" content="/og-image.png" />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

        {/* Performance */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://buttonstudio.app/" />

        {/* Structured Data - JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "ButtonStudio",
            "alternateName": "ButtonStudio - Voice Button Design Lab",
            "url": "https://buttonstudio.app",
            "description": "Design and customize beautiful voice recording buttons with real-time transcription. Export as HTML, PWA, or share your designs.",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Voice recording buttons",
              "Real-time transcription with Gemini AI",
              "Visual customization",
              "Export as HTML or PWA",
              "Share button designs"
            ],
            "browserRequirements": "Requires JavaScript. Modern browser with Web Audio API support.",
            "screenshot": "https://buttonstudio.app/og-image.png",
            "creator": {
              "@type": "Person",
              "name": "Pablo Alvarado",
              "url": "https://github.com/pibulus"
            }
          })}
        </script>
      </Head>

      <ButtonStudio />
    </>
  );
}
