import { Handlers } from "$fresh/server.ts";
import { serveHostedIcon } from "../../utils/export/hostedIconAsset.ts";

export const handler: Handlers = {
  GET(req) {
    return serveHostedIcon(req, 180, "png");
  },
};
