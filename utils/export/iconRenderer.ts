import { initWasm, Resvg } from "@resvg/resvg-wasm";
import {
  ButtonCustomization,
  getSmartTextColor,
} from "../../types/customization.ts";

const NOTO_EMOJI_BASE =
  "https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji@v2.051/svg";

const emojiSvgCache = new Map<string, Promise<string | null>>();
let resvgReady: Promise<void> | null = null;
let iconFontReady: Promise<Uint8Array> | null = null;

export async function generateButtonIconSvg(
  customization: ButtonCustomization,
  size: number,
): Promise<string> {
  const emojiSvg = customization.content.type === "emoji"
    ? await getEmojiSvgDataUrl(customization.content.value)
    : null;

  return buildButtonIconSvg(customization, size, emojiSvg);
}

export async function generateButtonIconPng(
  customization: ButtonCustomization,
  size: number,
  requestUrl: string,
): Promise<Uint8Array> {
  await ensureResvgReady(requestUrl);

  const svg = await generateButtonIconSvg(customization, size);
  const iconFont = await getIconFont(requestUrl);
  const renderer = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: size,
    },
    font: {
      fontBuffers: [iconFont],
      loadSystemFonts: false,
      defaultFontFamily: "Inter",
      sansSerifFamily: "Inter",
    },
  });

  return renderer.render().asPng();
}

function buildButtonIconSvg(
  customization: ButtonCustomization,
  size: number,
  emojiSvgDataUrl: string | null,
): string {
  const { appearance, content, effects } = customization;
  const iconRadius = Math.round(size * 0.22);
  const buttonSize = Math.round(size * 0.58);
  const buttonX = Math.round((size - buttonSize) / 2);
  const buttonY = Math.round((size - buttonSize) / 2);
  const buttonRadius = appearance.shape === "circle"
    ? buttonSize / 2
    : Math.min(appearance.roundness || 16, buttonSize / 2);
  const borderWidth = Math.max(0, Math.round(appearance.borderWidth || 0));
  const shadowOffset = Math.max(4, Math.round(size * 0.035));
  const fillId = `button-fill-${size}`;
  const backgroundFill = "#fffaf2";
  const startColor = appearance.fillType === "solid"
    ? appearance.solidColor
    : appearance.gradient.start;
  const textColor = appearance.textColor === "white"
    ? "#ffffff"
    : appearance.textColor === "black"
    ? "#111111"
    : getSmartTextColor(startColor) === "white"
    ? "#ffffff"
    : "#111111";
  const contentValue = (content.value || content.label || "").trim();
  const isEmoji = content.type === "emoji";
  const label = contentValue || (isEmoji ? "🎤" : "Boop");
  const fontSize = isEmoji
    ? Math.round(buttonSize * 0.46)
    : getFittedFontSize(label, buttonSize);
  const contentSvg = isEmoji && emojiSvgDataUrl
    ? `<image href="${emojiSvgDataUrl}" x="${buttonX + buttonSize * 0.25}" y="${
      buttonY + buttonSize * 0.25
    }" width="${buttonSize * 0.5}" height="${buttonSize * 0.5}" />`
    : `<text x="${size / 2}" y="${
      size / 2 + (isEmoji ? size * 0.015 : size * 0.006)
    }" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" font-family="${
      isEmoji
        ? "Apple Color Emoji, Segoe UI Emoji, sans-serif"
        : "Inter, Arial, sans-serif"
    }" font-size="${fontSize}" font-weight="800">${escapeXml(label)}</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    ${getFillDefinition(customization, fillId)}
    <filter id="button-glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="${
    Math.max(4, size * 0.035)
  }" result="blur" />
      <feColorMatrix in="blur" type="matrix" values="1 0 0 0 1  0 0.45 0 0 0.38  0 0 0.9 0 0.72  0 0 0 0.5 0" />
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" rx="${iconRadius}" fill="${backgroundFill}" />
  ${
    effects.shadow
      ? getButtonShape({
        x: buttonX + shadowOffset,
        y: buttonY + shadowOffset,
        size: buttonSize,
        radius: buttonRadius,
        fill: "#111111",
        opacity: "0.82",
      })
      : ""
  }
  ${
    getButtonShape({
      x: buttonX,
      y: buttonY,
      size: buttonSize,
      radius: buttonRadius,
      fill: `url(#${fillId})`,
      stroke: "#111111",
      strokeWidth: borderWidth,
      filter: effects.glow ? "url(#button-glow)" : undefined,
    })
  }
  ${contentSvg}
</svg>`;
}

function getFillDefinition(
  customization: ButtonCustomization,
  fillId: string,
): string {
  const { appearance } = customization;

  if (appearance.fillType === "solid") {
    return `<linearGradient id="${fillId}"><stop offset="0%" stop-color="${appearance.solidColor}" /></linearGradient>`;
  }

  const { x1, y1, x2, y2 } = getGradientVector(
    appearance.gradient.direction || 135,
  );

  return `<linearGradient id="${fillId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
    <stop offset="0%" stop-color="${appearance.gradient.start}" />
    <stop offset="100%" stop-color="${appearance.gradient.end}" />
  </linearGradient>`;
}

function getGradientVector(direction: number) {
  const angle = ((direction - 90) * Math.PI) / 180;
  const x = Math.cos(angle);
  const y = Math.sin(angle);

  return {
    x1: 50 - x * 50,
    y1: 50 - y * 50,
    x2: 50 + x * 50,
    y2: 50 + y * 50,
  };
}

function getButtonShape(options: {
  x: number;
  y: number;
  size: number;
  radius: number;
  fill: string;
  opacity?: string;
  stroke?: string;
  strokeWidth?: number;
  filter?: string;
}): string {
  const stroke = options.stroke
    ? ` stroke="${options.stroke}" stroke-width="${options.strokeWidth || 0}"`
    : "";
  const opacity = options.opacity ? ` opacity="${options.opacity}"` : "";
  const filter = options.filter ? ` filter="${options.filter}"` : "";

  return `<rect x="${options.x}" y="${options.y}" width="${options.size}" height="${options.size}" rx="${options.radius}" fill="${options.fill}"${stroke}${opacity}${filter} />`;
}

function getFittedFontSize(label: string, buttonSize: number): number {
  const characterCount = Math.max(label.length, 1);
  const widthBasedSize = (buttonSize * 0.72) / (characterCount * 0.54);

  return Math.round(Math.max(12, Math.min(buttonSize * 0.22, widthBasedSize)));
}

function ensureResvgReady(requestUrl: string): Promise<void> {
  if (!resvgReady) {
    const wasmUrl = new URL("/vendor/resvg/index_bg.wasm", requestUrl);
    resvgReady = initWasm(fetch(wasmUrl));
  }

  return resvgReady;
}

function getIconFont(requestUrl: string): Promise<Uint8Array> {
  if (!iconFontReady) {
    const fontUrl = new URL("/vendor/fonts/inter.ttf", requestUrl);
    iconFontReady = fetch(fontUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load icon font: ${response.status}`);
        }

        return response.arrayBuffer();
      })
      .then((buffer) => new Uint8Array(buffer));
  }

  return iconFontReady;
}

async function getEmojiSvgDataUrl(value: string): Promise<string | null> {
  const codepoint = toNotoEmojiCodepoint(value);

  if (!codepoint) {
    return null;
  }

  if (!emojiSvgCache.has(codepoint)) {
    emojiSvgCache.set(codepoint, fetchEmojiSvg(codepoint));
  }

  const svg = await emojiSvgCache.get(codepoint);

  if (!svg) {
    return null;
  }

  const bytes = new TextEncoder().encode(svg);
  const base64 = btoa(String.fromCharCode(...bytes));

  return `data:image/svg+xml;base64,${base64}`;
}

async function fetchEmojiSvg(codepoint: string): Promise<string | null> {
  try {
    const response = await fetch(`${NOTO_EMOJI_BASE}/emoji_u${codepoint}.svg`);

    if (!response.ok) {
      return null;
    }

    return await response.text();
  } catch (error) {
    console.warn("Failed to fetch emoji icon asset:", error);
    return null;
  }
}

function toNotoEmojiCodepoint(value: string): string | null {
  const emoji = getFirstGrapheme(value.trim());

  if (!emoji) {
    return null;
  }

  const codepoints = Array.from(emoji)
    .map((character) => character.codePointAt(0)?.toString(16))
    .filter((codepoint): codepoint is string =>
      !!codepoint && codepoint !== "fe0f" && codepoint !== "fe0e"
    );

  return codepoints.length > 0 ? codepoints.join("_") : null;
}

function getFirstGrapheme(value: string): string {
  if (!value) {
    return "";
  }

  if ("Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    const first = segmenter.segment(value)[Symbol.iterator]().next();

    return first.value?.segment || "";
  }

  return Array.from(value)[0] || "";
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
