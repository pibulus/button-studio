import { Handlers } from "$fresh/server.ts";
import {
  createHostedButtonExporter,
  getHostedPwaAssetPaths,
} from "../../utils/export/hostedPwa.ts";

export const handler: Handlers = {
  GET(req) {
    const id = new URL(req.url).searchParams.get("id");

    if (!id) {
      return new Response("Missing button id", { status: 400 });
    }

    const hostedButton = createHostedButtonExporter(id);

    if (!hostedButton) {
      return new Response("Invalid button configuration", { status: 404 });
    }

    const { exporter, appName } = hostedButton;
    const paths = getHostedPwaAssetPaths(id);
    const manifest = exporter.generatePWAManifest(appName, {
      startUrl: paths.startUrl,
      scope: paths.scope,
      icon192: paths.icon192,
      icon512: paths.icon512,
      iconType: "image/png",
    });

    return new Response(JSON.stringify(manifest, null, 2), {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  },
};
