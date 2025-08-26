// ===================================================================
// DYNAMIC PWA ROUTE - Serves PWA files based on encoded button config
// ===================================================================

import { Handlers } from "$fresh/server.ts";
import { ButtonCustomization, defaultCustomization } from "../../types/customization.ts";
import { ButtonExporter } from "../../utils/export/ButtonExporter.ts";

// Decode button config from URL-safe base64 with UTF-8 support
function decodeButtonConfig(id: string): ButtonCustomization | null {
  try {
    // Replace URL-safe characters back to standard base64
    const base64 = id.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if necessary
    const padded = base64 + '=='.substring(0, (4 - base64.length % 4) % 4);
    // Decode base64 to binary string
    const binaryString = atob(padded);
    // Convert binary string to UTF-8
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    const json = decoder.decode(bytes);
    return JSON.parse(json);
  } catch (error) {
    console.error("Failed to decode button config:", error);
    return null;
  }
}

export const handler: Handlers = {
  GET(req, ctx) {
    const { id } = ctx.params;
    const url = new URL(req.url);
    const path = url.pathname;

    // Decode the button configuration from the ID
    let customization = decodeButtonConfig(id);
    if (!customization) {
      return new Response("Invalid button configuration", { status: 404 });
    }
    
    // Merge with defaults to ensure all required fields are present
    customization = {
      ...defaultCustomization,
      ...customization,
      appearance: {
        ...defaultCustomization.appearance,
        ...(customization.appearance || {}),
        gradient: {
          ...defaultCustomization.appearance.gradient,
          ...(customization.appearance?.gradient || {}),
        },
      },
      interactions: {
        ...defaultCustomization.interactions,
        ...(customization.interactions || {}),
      },
      content: {
        ...defaultCustomization.content,
        ...(customization.content || {}),
      },
      effects: {
        ...defaultCustomization.effects,
        ...(customization.effects || {}),
      },
      feedback: {
        ...defaultCustomization.feedback,
        ...(customization.feedback || {}),
      },
      sound: {
        ...defaultCustomization.sound,
        ...(customization.sound || {}),
      },
      voice: {
        ...defaultCustomization.voice,
        ...(customization.voice || {}),
      },
      recording: {
        ...defaultCustomization.recording,
        ...(customization.recording || {}),
      },
    };

    // Create exporter with the decoded configuration
    const exporter = new ButtonExporter(customization);
    const appName = customization.content.label || "Voice Button";

    // Route based on requested file
    if (path.endsWith("/manifest.json")) {
      const manifest = exporter.generatePWAManifest(appName);
      return new Response(JSON.stringify(manifest, null, 2), {
        headers: {
          "Content-Type": "application/manifest+json",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    if (path.endsWith("/sw.js")) {
      const serviceWorker = exporter.generateServiceWorker();
      return new Response(serviceWorker, {
        headers: {
          "Content-Type": "application/javascript",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    if (path.endsWith("/icon-192.png")) {
      const iconDataUrl = exporter.generateIconDataURL(192);
      const base64Data = iconDataUrl.split(",")[1];
      const imageData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      return new Response(imageData, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    if (path.endsWith("/icon-512.png")) {
      const iconDataUrl = exporter.generateIconDataURL(512);
      const base64Data = iconDataUrl.split(",")[1];
      const imageData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      return new Response(imageData, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // Default to serving the HTML page
    const html = exporter.generatePWAHTML(appName, {
      includeAI: true, // Always include AI for now
      apiKey: "", // User will enter their own key
    });

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  },
};