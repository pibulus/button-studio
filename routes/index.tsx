import { Head } from "$fresh/runtime.ts";
import ButtonStudio from "../islands/ButtonStudio.tsx";
import {
  BRAND_DESCRIPTION,
  BRAND_NAME,
  BRAND_OG_DESCRIPTION,
  BRAND_OG_TITLE,
  BRAND_SHORT_DESCRIPTION,
  BRAND_TITLE,
} from "../utils/brand.ts";

export default function Home() {
  return (
    <>
      <Head>
        <title>{BRAND_TITLE}</title>
        <meta
          name="description"
          content={BRAND_DESCRIPTION}
        />

        {/* SEO and Open Graph */}
        <meta
          property="og:title"
          content={BRAND_OG_TITLE}
        />
        <meta
          property="og:description"
          content={BRAND_OG_DESCRIPTION}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://buttonspa.app" />
        <meta property="og:image" content="/og-image.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={BRAND_OG_TITLE}
        />
        <meta
          name="twitter:description"
          content={BRAND_OG_DESCRIPTION}
        />
        <meta name="twitter:image" content="/og-image.png" />

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
        <link rel="canonical" href="https://buttonspa.app/" />

        {/* Structured Data - JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": BRAND_NAME,
            "alternateName": "ButtonSpa - Buttons That Do Things",
            "url": "https://buttonspa.app",
            "description": BRAND_DESCRIPTION,
            "applicationCategory": "ProductivityApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
            },
            "featureList": [
              "Buttons that do useful things",
              "Prompt-shaped outputs like diaries, recipes, and notes",
              "Voice transcription starter button",
              "Shareable button links",
              "Home screen install for iPhone and Android",
              "Standalone HTML export",
              BRAND_SHORT_DESCRIPTION,
            ],
            "browserRequirements":
              "Requires JavaScript. Modern browser with Web Audio API support.",
            "screenshot": "https://buttonspa.app/og-image.png",
            "creator": {
              "@type": "Person",
              "name": "Pablo Alvarado",
              "url": "https://github.com/pibulus",
            },
          })}
        </script>
      </Head>

      <ButtonStudio />
    </>
  );
}
