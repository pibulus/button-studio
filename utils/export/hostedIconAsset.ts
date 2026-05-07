import { createHostedButtonExporter } from "./hostedPwa.ts";
import {
  generateButtonIconPng,
  generateButtonIconSvg,
} from "./iconRenderer.ts";

export async function serveHostedIcon(
  req: Request,
  size: number,
  format: "png" | "svg",
): Promise<Response> {
  const id = new URL(req.url).searchParams.get("id");

  if (!id) {
    return new Response("Missing button id", { status: 400 });
  }

  const hostedButton = createHostedButtonExporter(id);

  if (!hostedButton) {
    return new Response("Invalid button configuration", { status: 404 });
  }

  if (format === "svg") {
    const svg = await generateButtonIconSvg(hostedButton.customization, size);

    return new Response(svg, {
      headers: getIconHeaders("image/svg+xml"),
    });
  }

  const png = await generateButtonIconPng(
    hostedButton.customization,
    size,
    req.url,
  );

  return new Response(png, {
    headers: getIconHeaders("image/png"),
  });
}

function getIconHeaders(contentType: string): HeadersInit {
  return {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
  };
}
