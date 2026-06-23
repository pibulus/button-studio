// ===================================================================
// SHARE LINK SYSTEM - URL encoding/decoding for button sharing
// ===================================================================

import { ButtonCustomization } from "../../types/customization.ts";
import { ShareLinkData } from "./types.ts";

const CURRENT_VERSION = 1;
const URL_PREFIX = "bs://"; // ButtonSpa protocol

// Encode button customization into a shareable URL
export function generateShareLink(
  customization: ButtonCustomization,
  options: {
    title?: string;
    description?: string;
    includeApiKey?: boolean;
  } = {},
): string {
  try {
    const shareData: ShareLinkData = {
      version: CURRENT_VERSION,
      customization,
      apiKey: options.includeApiKey,
      metadata: {
        title: options.title,
        description: options.description,
        created: new Date().toISOString(),
      },
    };

    // Serialize and compress
    const jsonString = JSON.stringify(shareData);
    const compressed = compressString(jsonString);

    // Fix for Unicode characters - encode to UTF-8 first
    const utf8Bytes = new TextEncoder().encode(compressed);
    const binaryString = Array.from(
      utf8Bytes,
      (byte) => String.fromCharCode(byte),
    ).join("");
    const encoded = btoa(binaryString);

    // Clean up for URL safety
    const urlSafe = encoded
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    return `${URL_PREFIX}${urlSafe}`;
  } catch (error) {
    console.error("Error generating share link:", error);
    throw new Error("Failed to generate share link");
  }
}

// Decode a share link back to button customization
export function parseShareLink(shareLink: string): ShareLinkData | null {
  try {
    // Remove protocol prefix
    const encoded = shareLink.replace(URL_PREFIX, "");

    // Restore URL-safe encoding
    const base64 = encoded
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(encoded.length + (4 - encoded.length % 4) % 4, "=");

    // Decode from base64 and handle UTF-8
    const binaryString = atob(base64);
    const utf8Bytes = new Uint8Array(
      Array.from(binaryString, (char) => char.charCodeAt(0)),
    );
    const compressed = new TextDecoder().decode(utf8Bytes);
    const jsonString = decompressString(compressed);
    const shareData: ShareLinkData = JSON.parse(jsonString);

    // Version compatibility check
    if (shareData.version > CURRENT_VERSION) {
      console.warn("Share link version is newer than supported");
      return null;
    }

    return shareData;
  } catch (error) {
    console.error("Error parsing share link:", error);
    return null;
  }
}

// Simple string compression (could be enhanced with actual compression library)
function compressString(str: string): string {
  // For now, just return the string - could add LZ compression later
  return str;
}

function decompressString(str: string): string {
  // For now, just return the string - matches compression above
  return str;
}

// Validate that a customization object is complete and valid
export function validateCustomization(
  customization: Record<string, unknown>,
): boolean {
  try {
    const a = customization.appearance as Record<string, unknown> | undefined;
    const i = customization.interactions as Record<string, unknown> | undefined;
    const c = customization.content as Record<string, unknown> | undefined;
    return (
      customization &&
      typeof customization === "object" &&
      !!a &&
      !!i &&
      !!c &&
      !!c.value &&
      typeof a.scale === "number" &&
      typeof i.squishPower === "number"
    );
  } catch {
    return false;
  }
}

// Generate a preview URL for social sharing
export function generatePreviewUrl(customization: ButtonCustomization): string {
  const baseUrl = globalThis.location.origin;
  const shareLink = generateShareLink(customization);
  return `${baseUrl}/?share=${encodeURIComponent(shareLink)}`;
}

// Check if current URL contains a share link
export function checkForShareLink(): ShareLinkData | null {
  const urlParams = new URLSearchParams(globalThis.location.search);
  const shareParam = urlParams.get("share");

  if (shareParam) {
    return parseShareLink(decodeURIComponent(shareParam));
  }

  return null;
}
