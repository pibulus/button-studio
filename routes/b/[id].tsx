// ===================================================================
// DYNAMIC PWA ROUTE - Serves PWA files based on encoded button config
// ===================================================================

import { Handlers } from "$fresh/server.ts";
import {
  createHostedButtonExporter,
  getHostedPwaAssetPaths,
} from "../../utils/export/hostedPwa.ts";

export const handler: Handlers = {
  GET(_req, ctx) {
    const { id } = ctx.params;
    const hostedButton = createHostedButtonExporter(id);

    if (!hostedButton) {
      return new Response("Invalid button configuration", { status: 404 });
    }

    const { exporter, appName } = hostedButton;
    const paths = getHostedPwaAssetPaths(id);
    const html = exporter.generatePWAHTML(appName, {
      includeAI: true, // Always include AI for now
      apiKey: "", // User will enter their own key
      manifestPath: paths.manifest,
      serviceWorkerPath: paths.serviceWorker,
      icon192Path: paths.icon192,
      icon512Path: paths.icon512,
      appleTouchIconPath: paths.appleTouchIcon,
    });

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  },
};
