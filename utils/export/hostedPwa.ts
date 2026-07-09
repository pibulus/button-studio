import {
  ButtonCustomization,
  defaultCustomization,
} from "../../types/customization.ts";
import { ButtonExporter } from "./ButtonExporter.ts";
import { decodeHostedButtonConfig as decodeRawHostedConfig } from "./hostedConfigCodec.ts";

export function decodeHostedButtonConfig(
  id: string,
): ButtonCustomization | null {
  try {
    return normalizeHostedCustomization(
      decodeRawHostedConfig(id) as Partial<ButtonCustomization>,
    );
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
    exporter: new ButtonExporter(customization, {
      customPrompt: customization.api?.customPrompt,
    }),
    appName: customization.content.label || "Action Button",
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
  const merged: ButtonCustomization = {
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
    sound: {
      ...defaultCustomization.sound,
      ...(customization.sound || {}),
    },
    recording: {
      ...defaultCustomization.recording,
      ...(customization.recording || {}),
    },
  };

  return sanitizeHostedCustomization(merged);
}

function sanitizeHostedCustomization(
  customization: ButtonCustomization,
): ButtonCustomization {
  const customPrompt = sanitizeText(
    customization.api?.customPrompt || "",
    2000,
  );
  // Only allow the known output-format enum through from an untrusted URL.
  const rawFormat = customization.api?.format;
  const format = rawFormat === "list" || rawFormat === "sections"
    ? rawFormat
    : "text";

  return {
    ...customization,
    appearance: {
      ...customization.appearance,
      theme: enumValue(customization.appearance.theme, [
        "minimal",
        "warm",
        "professional",
        "lush",
      ], defaultCustomization.appearance.theme),
      colorIntensity: enumValue(customization.appearance.colorIntensity, [
        "pastel",
        "neon",
      ], defaultCustomization.appearance.colorIntensity),
      fillType: enumValue(customization.appearance.fillType, [
        "solid",
        "gradient",
      ], defaultCustomization.appearance.fillType),
      solidColor: safeHexColor(
        customization.appearance.solidColor,
        defaultCustomization.appearance.solidColor,
      ),
      shape: enumValue(customization.appearance.shape, [
        "circle",
        "square",
      ], defaultCustomization.appearance.shape),
      scale: clampNumber(customization.appearance.scale, 0.5, 2),
      roundness: clampNumber(customization.appearance.roundness, 0, 50),
      borderWidth: clampNumber(customization.appearance.borderWidth, 0, 10),
      shadowType: enumValue(customization.appearance.shadowType, [
        "brutalist",
        "diffused",
      ], defaultCustomization.appearance.shadowType),
      borderStyle: enumValue(customization.appearance.borderStyle, [
        "solid",
        "dashed",
        "dotted",
        "double",
      ], defaultCustomization.appearance.borderStyle),
      gradient: {
        start: safeHexColor(
          customization.appearance.gradient.start,
          defaultCustomization.appearance.gradient.start,
        ),
        end: safeHexColor(
          customization.appearance.gradient.end,
          defaultCustomization.appearance.gradient.end,
        ),
        direction: clampNumber(
          customization.appearance.gradient.direction,
          0,
          360,
        ),
      },
      textColor: enumValue(customization.appearance.textColor, [
        "auto",
        "black",
        "white",
      ], defaultCustomization.appearance.textColor),
    },
    interactions: {
      ...customization.interactions,
      hoverEffect: enumValue(customization.interactions.hoverEffect, [
        "squish",
        "grow",
        "bright",
        "tilt",
      ], defaultCustomization.interactions.hoverEffect),
      clickAnimation: enumValue(customization.interactions.clickAnimation, [
        "none",
        "bounce",
        "shrink",
        "spin",
        "flash",
      ], defaultCustomization.interactions.clickAnimation),
      textTransform: enumValue(customization.interactions.textTransform, [
        "none",
        "uppercase",
        "lowercase",
        "capitalize",
      ], defaultCustomization.interactions.textTransform),
      fontWeight: enumValue(customization.interactions.fontWeight, [
        "normal",
        "bold",
        "light",
      ], defaultCustomization.interactions.fontWeight),
      squishPower: clampNumber(customization.interactions.squishPower, 0, 20),
      bounceFactor: clampNumber(customization.interactions.bounceFactor, 0, 15),
      hoverLift: clampNumber(customization.interactions.hoverLift, 0, 10),
      animationSpeed: clampNumber(
        customization.interactions.animationSpeed,
        0.5,
        2,
      ),
      easingStyle: enumValue(customization.interactions.easingStyle, [
        "bouncy",
        "smooth",
        "snappy",
      ], defaultCustomization.interactions.easingStyle),
    },
    content: {
      type: enumValue(customization.content.type, [
        "emoji",
        "text",
        "icon",
      ], defaultCustomization.content.type),
      value: sanitizeText(customization.content.value, 80) ||
        defaultCustomization.content.value,
      label: sanitizeText(
        customization.content.label || defaultCustomization.content.label || "",
        80,
      ),
    },
    effects: {
      breathing: Boolean(customization.effects.breathing),
      bounce: Boolean(customization.effects.bounce),
      glow: Boolean(customization.effects.glow),
      shadow: Boolean(customization.effects.shadow),
      shine: Boolean(customization.effects.shine),
      pulse: Boolean(customization.effects.pulse),
    },
    sound: {
      enabled: Boolean(customization.sound.enabled),
      type: enumValue(customization.sound.type, [
        "slate",
        "amber",
        "coral",
        "sage",
        "pearl",
      ], defaultCustomization.sound.type),
      volume: clampNumber(customization.sound.volume, 0, 100),
    },
    recording: {
      visualFeedback: enumValue(customization.recording.visualFeedback, [
        "timer",
        "pulse",
        "glow",
        "ring",
        "none",
      ], defaultCustomization.recording.visualFeedback),
      showTimer: Boolean(customization.recording.showTimer),
      pulseIntensity: clampNumber(
        customization.recording.pulseIntensity,
        0,
        100,
      ),
      ringColor: safeHexColor(
        customization.recording.ringColor,
        defaultCustomization.recording.ringColor,
      ),
      keepSize: Boolean(customization.recording.keepSize),
    },
    api: customPrompt ? { customPrompt, format } : undefined,
  };
}

function sanitizeText(value: string, maxLength: number): string {
  return String(value || "")
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      return code < 32 || code === 127 ? " " : char;
    })
    .join("")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function safeHexColor(value: string, fallback: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(String(value || "")) ? value : fallback;
}

function clampNumber(value: unknown, min: number, max: number): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.min(max, Math.max(min, number));
}

function enumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? value as T : fallback;
}
