// ===================================================================
// EXPORT SYSTEM TYPES - ButtonStudio export functionality
// ===================================================================

import { ButtonCustomization } from "../../types/customization.ts";

export interface ExportOptions {
  includeAI?: boolean;
  customBranding?: boolean;
  analyticsEnabled?: boolean;
  autoStart?: boolean;
  autoCopy?: boolean;
  autoStopOnSilence?: boolean;
  silenceDuration?: number; // seconds of silence before auto-stop (default: 3)
}

export interface ExportResult {
  success: boolean;
  data?: string | ExportPackage;
  error?: string;
  downloadName?: string;
}

export interface ExportPackage {
  files: ExportFile[];
  instructions: string;
  metadata: {
    exportType: ExportType;
    timestamp: string;
    buttonName?: string;
  };
}

export interface ExportFile {
  path: string;
  content: string;
  mimeType?: string;
}

export type ExportType =
  | "html-standalone"
  | "pwa-package"
  | "share-link"
  | "mobile-react-native"
  | "mobile-capacitor"
  | "embed-code";

export interface ShareLinkData {
  version: number;
  customization: ButtonCustomization;
  apiKey?: boolean; // Just indicate if API key is needed, not the key itself
  metadata?: {
    title?: string;
    description?: string;
    created?: string;
  };
}

export interface PWAManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  scope?: string;
  display: "standalone" | "fullscreen" | "minimal-ui";
  display_override?: string[];
  background_color: string;
  theme_color: string;
  icons: PWAIcon[];
  orientation?: string;
  categories?: string[];
  lang?: string;
  dir?: string;
}

export interface PWAIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

export interface MobileTemplateConfig {
  platform: "react-native" | "capacitor";
  bundleId: string;
  appName: string;
  version: string;
  buttonConfig: ButtonCustomization;
}
