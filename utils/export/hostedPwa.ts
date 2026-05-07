import {
  ButtonCustomization,
  defaultCustomization,
} from "../../types/customization.ts";
import { ButtonExporter } from "./ButtonExporter.ts";

export function decodeHostedButtonConfig(
  id: string,
): ButtonCustomization | null {
  try {
    const base64 = id.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "==".substring(0, (4 - base64.length % 4) % 4);
    const binaryString = atob(padded);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const json = new TextDecoder().decode(bytes);
    return normalizeHostedCustomization(JSON.parse(json));
  } catch (error) {
    console.error("Failed to decode button config:", error);
    return null;
  }
}

export function createHostedButtonExporter(id: string): {
  customization: ButtonCustomization;
  exporter: ButtonExporter;
  appName: string;
} | null {
  const customization = decodeHostedButtonConfig(id);

  if (!customization) {
    return null;
  }

  return {
    customization,
    exporter: new ButtonExporter(customization),
    appName: customization.content.label || "Voice Button",
  };
}

export function getHostedPwaAssetPaths(id: string) {
  const encodedId = encodeURIComponent(id);

  return {
    startUrl: `/b/${id}`,
    scope: "/b/",
    manifest: `/b/manifest.json?id=${encodedId}`,
    icon192: `/b/icon-192.png?id=${encodedId}`,
    icon512: `/b/icon-512.png?id=${encodedId}`,
    appleTouchIcon: `/b/apple-touch-icon.png?id=${encodedId}`,
    serviceWorker: "/sw.js",
  };
}

function normalizeHostedCustomization(
  customization: Partial<ButtonCustomization>,
): ButtonCustomization {
  return {
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
}
