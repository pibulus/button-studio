// ===================================================================
// HOSTED CONFIG CODEC - URL-safe base64 encode/decode for /b/{id} links
// ===================================================================
// ZERO imports by design: this file must be safe to bundle client-side.
// Do NOT import from hostedPwa.ts or ButtonExporter.ts (server-only deps).

export function encodeHostedButtonConfig(customization: unknown): string {
  const configJson = JSON.stringify(customization);
  const utf8Bytes = new TextEncoder().encode(configJson);
  const binaryString = Array.from(
    utf8Bytes,
    (byte) => String.fromCharCode(byte),
  ).join("");
  const base64 = btoa(binaryString);

  return base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function decodeHostedButtonConfig(id: string): unknown {
  const base64 = id.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "==".substring(0, (4 - base64.length % 4) % 4);
  const binaryString = atob(padded);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
}
