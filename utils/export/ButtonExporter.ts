// ===================================================================
// BUTTON EXPORTER - Main export engine for ButtonStudio
// ===================================================================

import { ButtonCustomization } from "../../types/customization.ts";
import {
  ExportOptions,
  ExportPackage,
  ExportResult,
  ExportType,
  MobileTemplateConfig,
  PWAManifest,
} from "./types.ts";
import { generateShareLink } from "./shareLink.ts";
import { generateStandaloneHTML } from "./templates/html-standalone.ts";

export class ButtonExporter {
  customization: ButtonCustomization;
  apiKey?: string;
  customPrompt?: string;

  constructor(customization?: ButtonCustomization, options?: any) {
    // Handle both old and new constructor signatures
    if (customization && !options) {
      this.customization = customization;
    } else if (options) {
      this.customization = customization!;
      this.apiKey = options.apiKey;
      this.customPrompt = options.customPrompt;
    } else {
      this.customization = {} as ButtonCustomization;
    }
  }

  // ===================================================================
  // HTML STANDALONE EXPORT - Self-contained file
  // ===================================================================

  generateHTML(customization: ButtonCustomization, options: any = {}) {
    // Update internal state
    this.customization = customization;
    this.apiKey = options.apiKey;
    
    const html = generateStandaloneHTML(customization, {
      includeAI: options.includeAI && !!options.apiKey,
      apiKey: options.apiKey,
      customPrompt: this.customPrompt,
      customBranding: options.customBranding,
    });

    return {
      html,
      filename: this.generateFilename("html"),
    };
  }

  generateHTMLOld(options: ExportOptions = {}): ExportResult {
    try {
      const html = generateStandaloneHTML(this.customization, {
        includeAI: options.includeAI && !!this.apiKey,
        apiKey: this.apiKey,
        customPrompt: this.customPrompt,
        customBranding: options.customBranding,
      });

      const filename = this.generateFilename("html");

      return {
        success: true,
        data: html,
        downloadName: filename,
      };
    } catch (error) {
      return {
        success: false,
        error: `HTML export failed: ${error.message}`,
      };
    }
  }

  // ===================================================================
  // PWA EXPORT - Progressive Web App package
  // ===================================================================

  generatePWA(customization: ButtonCustomization, options: any = {}) {
    // Update internal state
    this.customization = customization;
    this.apiKey = options.apiKey;
    
    const appName = customization.content.label || "Voice Button";
    const manifest = this.generatePWAManifest(appName);
    const html = this.generatePWAHTML(appName, {
      includeAI: options.includeAI && !!options.apiKey,
      apiKey: options.apiKey,
      customPrompt: this.customPrompt,
    });
    const serviceWorker = this.generateServiceWorker();
    const icon192 = this.generateIconDataURL(192);
    const icon512 = this.generateIconDataURL(512);

    return {
      html,
      manifest: JSON.stringify(manifest, null, 2),
      serviceWorker,
      icon192,
      icon512,
      filename: `${this.sanitizeFilename(appName)}-pwa.zip`,
    };
  }

  generatePWAOld(options: ExportOptions = {}): ExportResult {
    try {
      const appName = this.customization.content.label || "Voice Button";
      const manifest = this.generatePWAManifest(appName);
      const html = this.generatePWAHTML(appName, options);
      const serviceWorker = this.generateServiceWorker();

      const exportPackage: ExportPackage = {
        files: [
          {
            path: "index.html",
            content: html,
            mimeType: "text/html",
          },
          {
            path: "manifest.json",
            content: JSON.stringify(manifest, null, 2),
            mimeType: "application/json",
          },
          {
            path: "sw.js",
            content: serviceWorker,
            mimeType: "application/javascript",
          },
          {
            path: "icon-192.png",
            content: this.generateIcon(192),
            mimeType: "image/png",
          },
          {
            path: "icon-512.png",
            content: this.generateIcon(512),
            mimeType: "image/png",
          },
        ],
        instructions: this.getPWAInstructions(),
        metadata: {
          exportType: "pwa-package" as ExportType,
          timestamp: new Date().toISOString(),
          buttonName: appName,
        },
      };

      return {
        success: true,
        data: exportPackage,
        downloadName: `${this.sanitizeFilename(appName)}-pwa.zip`,
      };
    } catch (error) {
      return {
        success: false,
        error: `PWA export failed: ${error.message}`,
      };
    }
  }

  // ===================================================================
  // SHARE LINK GENERATION
  // ===================================================================

  generateShareLink(customization: ButtonCustomization): string {
    // Update internal state
    this.customization = customization;
    
    return generateShareLink(customization, {
      title: customization.content.label,
      includeApiKey: false,
    });
  }

  generateShareLinkOld(options: {
    title?: string;
    description?: string;
  } = {}): ExportResult {
    try {
      const shareLink = generateShareLink(this.customization, {
        title: options.title || this.customization.content.label,
        description: options.description,
        includeApiKey: !!this.apiKey,
      });

      return {
        success: true,
        data: shareLink,
      };
    } catch (error) {
      return {
        success: false,
        error: `Share link generation failed: ${error.message}`,
      };
    }
  }

  // ===================================================================
  // MOBILE TEMPLATE GENERATION
  // ===================================================================

  generateMobileTemplate(
    platform: "react-native" | "capacitor",
    config: Partial<MobileTemplateConfig> = {},
  ): ExportResult {
    try {
      const appName = config.appName || this.customization.content.label ||
        "VoiceButton";
      const bundleId = config.bundleId ||
        `com.buttonstudio.${this.sanitizeFilename(appName).toLowerCase()}`;

      const templateConfig: MobileTemplateConfig = {
        platform,
        bundleId,
        appName,
        version: config.version || "1.0.0",
        buttonConfig: this.customization,
      };

      // Generate platform-specific files
      const files = platform === "react-native"
        ? this.generateReactNativeFiles(templateConfig)
        : this.generateCapacitorFiles(templateConfig);

      const exportPackage: ExportPackage = {
        files,
        instructions: this.getMobileInstructions(platform),
        metadata: {
          exportType: `mobile-${platform}` as ExportType,
          timestamp: new Date().toISOString(),
          buttonName: appName,
        },
      };

      return {
        success: true,
        data: exportPackage,
        downloadName: `${this.sanitizeFilename(appName)}-${platform}.zip`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Mobile template export failed: ${error.message}`,
      };
    }
  }

  // ===================================================================
  // EMBED CODE GENERATION
  // ===================================================================

  generateEmbedCode(options: {
    width?: number;
    height?: number;
    responsive?: boolean;
  } = {}): ExportResult {
    try {
      const shareLink = generateShareLink(this.customization);
      const baseUrl = typeof window !== "undefined"
        ? globalThis.location.origin
        : "";

      const embedUrl = `${baseUrl}/embed?share=${
        encodeURIComponent(shareLink)
      }`;
      const width = options.width || 400;
      const height = options.height || 300;

      const embedCode = options.responsive
        ? `<div style="position: relative; width: 100%; max-width: ${width}px; aspect-ratio: ${width}/${height};">
  <iframe src="${embedUrl}" 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
          allowfullscreen>
  </iframe>
</div>`
        : `<iframe src="${embedUrl}" 
        width="${width}" 
        height="${height}" 
        frameborder="0"
        allowfullscreen>
</iframe>`;

      return {
        success: true,
        data: embedCode,
      };
    } catch (error) {
      return {
        success: false,
        error: `Embed code generation failed: ${error.message}`,
      };
    }
  }

  // ===================================================================
  // HELPER METHODS
  // ===================================================================

  private generateFilename(extension: string): string {
    const name = this.customization.content.label || "voice-button";
    const timestamp = new Date().toISOString().slice(0, 10);
    return `${this.sanitizeFilename(name)}-${timestamp}.${extension}`;
  }

  private sanitizeFilename(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  private generatePWAManifest(appName: string): PWAManifest {
    const themeColor = this.customization.appearance.fillType === "solid"
      ? this.customization.appearance.solidColor
      : this.customization.appearance.gradient.start;

    return {
      name: appName,
      short_name: appName.slice(0, 12),
      description: `Voice recording button: ${appName}`,
      start_url: "./",
      scope: "./",
      display: "standalone",
      display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
      background_color: "#ffffff",
      theme_color: themeColor,
      orientation: "portrait-primary",
      categories: ["productivity", "utilities"],
      lang: "en-US",
      dir: "ltr",
      icons: [
        {
          src: "icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "maskable any",
        },
        {
          src: "icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable any",
        },
        {
          src: "icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "apple-touch-icon",
        },
      ],
    };
  }

  private generatePWAHTML(appName: string, options: any): string {
    // Enhanced HTML with PWA features
    const baseHTML = generateStandaloneHTML(this.customization, {
      includeAI: options.includeAI && !!options.apiKey,
      apiKey: options.apiKey,
      customPrompt: this.customPrompt,
      customBranding: options.customBranding,
    });

    // Add PWA meta tags and service worker registration
    return baseHTML.replace(
      "<head>",
      `<head>
    <!-- PWA Meta Tags -->
    <link rel="manifest" href="./manifest.json">
    <meta name="theme-color" content="${
        this.customization.appearance.fillType === "solid"
          ? this.customization.appearance.solidColor
          : this.customization.appearance.gradient.start
      }">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="${appName}">
    <link rel="apple-touch-icon" href="./icon-192.png">
    <link rel="apple-touch-icon" sizes="192x192" href="./icon-192.png">
    <link rel="apple-touch-icon" sizes="512x512" href="./icon-512.png">
    
    <!-- Service Worker Registration -->
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
              console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
              console.log('SW registration failed: ', registrationError);
            });
        });
      }
    </script>`,
    );
  }

  private generateServiceWorker(): string {
    return `// ButtonStudio PWA Service Worker
const CACHE_NAME = 'voice-button-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});`;
  }

  /**
   * Generate a PNG data URL icon that matches the button design
   * Uses SVG foreignObject to render the actual button HTML/CSS
   */
  private generateIconDataURL(size: number): string {
    const { customization } = this;
    const { appearance, content, effects } = customization;
    
    // Calculate scaling factor
    const buttonSize = Math.min(size * 0.6, size - 40); // Leave padding
    const borderRadius = appearance.roundness || 16;
    const borderWidth = appearance.borderWidth || 3;
    
    // Build gradient style if needed
    const backgroundStyle = appearance.fillType === "gradient" 
      ? `background: linear-gradient(${appearance.gradient.direction}deg, ${appearance.gradient.start}, ${appearance.gradient.end});`
      : `background: ${appearance.solidColor};`;
    
    // Build shadow style
    const shadowStyle = effects.shadow 
      ? `box-shadow: ${effects.shadowOffsetX || 4}px ${effects.shadowOffsetY || 4}px ${effects.shadowBlur || 0}px ${effects.shadowColor || '#000000'};`
      : '';
    
    // Scale emoji/text appropriately
    const fontSize = content.type === "emoji" 
      ? buttonSize * 0.5 
      : buttonSize * 0.15;
    
    // Create the SVG with embedded HTML button
    const svgContent = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <foreignObject width="${size}" height="${size}">
          <div xmlns="http://www.w3.org/1999/xhtml" style="
            width: ${size}px;
            height: ${size}px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
          ">
            <div style="
              width: ${buttonSize}px;
              height: ${buttonSize}px;
              border-radius: ${borderRadius}px;
              border: ${borderWidth}px solid ${appearance.borderColor || '#000'};
              ${backgroundStyle}
              ${shadowStyle}
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: ${fontSize}px;
              font-weight: bold;
              color: ${content.type === "text" ? (appearance.textColor || '#000') : 'inherit'};
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              overflow: hidden;
              position: relative;
            ">
              ${content.value || content.label || '🎤'}
            </div>
          </div>
        </foreignObject>
      </svg>
    `;
    
    // Clean up the SVG and encode it properly
    const cleanedSvg = svgContent
      .replace(/\n/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Encode to base64 with proper UTF-8 handling
    const utf8Bytes = new TextEncoder().encode(cleanedSvg);
    const base64 = btoa(String.fromCharCode(...utf8Bytes));
    
    return `data:image/svg+xml;base64,${base64}`;
  }

  private generateIcon(size: number): string {
    // Backwards compatibility wrapper
    return this.generateIconDataURL(size);
  }

  private generateReactNativeFiles(config: MobileTemplateConfig) {
    // Return basic React Native template files
    return [
      {
        path: "package.json",
        content: JSON.stringify(
          {
            name: config.appName.toLowerCase(),
            version: config.version,
            main: "index.js",
            dependencies: {
              "react": "^18.2.0",
              "react-native": "^0.72.0",
            },
          },
          null,
          2,
        ),
      },
      {
        path: "App.js",
        content: `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import VoiceButton from './VoiceButton';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>${config.appName}</Text>
      <VoiceButton config={${JSON.stringify(config.buttonConfig)}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
});`,
      },
      {
        path: "README.md",
        content:
          `# ${config.appName}\n\nReact Native voice button app generated by ButtonStudio.\n\n## Setup\n\n1. npm install\n2. npx react-native run-ios (or run-android)\n3. Add your Gemini API key to enable transcription`,
      },
    ];
  }

  private generateCapacitorFiles(config: MobileTemplateConfig) {
    // Return basic Capacitor template files
    return [
      {
        path: "capacitor.config.json",
        content: JSON.stringify(
          {
            appId: config.bundleId,
            appName: config.appName,
            webDir: "dist",
          },
          null,
          2,
        ),
      },
      {
        path: "src/index.html",
        content: generateStandaloneHTML(config.buttonConfig),
      },
    ];
  }

  private getPWAInstructions(): string {
    return `# PWA Installation Instructions

1. Upload all files to your web server
2. Ensure HTTPS is enabled (required for PWA)
3. Visit the URL in a mobile browser
4. Look for "Add to Home Screen" option
5. Your voice button is now installable as an app!

## Files included:
- index.html (main app)
- manifest.json (PWA configuration)
- sw.js (service worker for offline functionality)
- icon-*.png (app icons)`;
  }

  private getMobileInstructions(platform: string): string {
    if (platform === "react-native") {
      return `# React Native Setup

1. Extract files to a new directory
2. Run: npm install
3. Add your Gemini API key to enable transcription
4. Run: npx react-native run-ios (or run-android)

## Next steps:
- Test on physical device
- Configure app signing
- Submit to app stores`;
    } else {
      return `# Capacitor Setup

1. Extract files to a new directory
2. Run: npm install @capacitor/core @capacitor/cli
3. Run: npx cap add ios android
4. Run: npx cap run ios (or android)

## Next steps:
- Test on physical device
- Configure app signing
- Submit to app stores`;
    }
  }
}
