import { contentType, extname, SEPARATOR, STATUS_CODE } from "./deps.ts";
import * as router from "./router.ts";
import { ALIVE_URL, DEV_CLIENT_URL, DEV_ERROR_OVERLAY_URL, JS_PREFIX } from "./constants.ts";
import { BUILD_ID, DENO_DEPLOYMENT_ID } from "./build_id.ts";
import { render as internalRender } from "./render.ts";
import { SELF } from "../runtime/csp.ts";
import { ASSET_CACHE_BUST_KEY, INTERNAL_PREFIX } from "../runtime/utils.ts";
import { EsbuildBuilder } from "../build/mod.ts";
import { setAllIslands } from "./rendering/preact_hooks.ts";
import { getCodeFrame } from "./code_frame.ts";
import { getInternalFreshState } from "./config.ts";
import { composeMiddlewares, ROOT_BASE_ROUTE, selectSharedRoutes, toBaseRoute } from "./compose.ts";
import { extractRoutes } from "./fs_extract.ts";
import { loadAotSnapshot } from "../build/aot_snapshot.ts";
import { ErrorOverlay } from "./error_overlay.tsx";
import { withBase } from "./router.ts";
import { PARTIAL_SEARCH_PARAM } from "../constants.ts";
import TailwindErrorPage from "./tailwind_aot_error_page.tsx";
// TODO: Completed type clashes in older Deno versions
// deno-lint-ignore no-explicit-any
const DEFAULT_CONN_INFO = {
  localAddr: {
    transport: "tcp",
    hostname: "localhost",
    port: 8080
  },
  remoteAddr: {
    transport: "tcp",
    hostname: "localhost",
    port: 1234
  }
};
// deno-lint-ignore no-explicit-any
const NOOP_COMPONENT = ()=>null;
const NOOP_NEXT = ()=>Promise.resolve(new Response(null, {
    status: 500
  }));
export async function getServerContext(state) {
  const { config, denoJson, denoJsonPath: configPath } = state;
  if (config.dev) {
    // Ensure that debugging hooks are set up for SSR rendering
    await import("preact/debug");
  }
  // Plugins are already instantiated in build mode
  if (!state.build) {
    await Promise.all(config.plugins.map((plugin)=>plugin.configResolved?.(state.config)));
  }
  const extractResult = await extractRoutes(state);
  // Restore snapshot if available
  let snapshot = null;
  if (state.loadSnapshot) {
    const loadedSnapshot = await loadAotSnapshot(config);
    if (loadedSnapshot !== null) {
      snapshot = loadedSnapshot;
      state.didLoadSnapshot = true;
    }
  }
  const finalSnapshot = snapshot ?? new EsbuildBuilder({
    buildID: BUILD_ID,
    entrypoints: collectEntrypoints(config.dev, extractResult.islands, config.plugins),
    configPath,
    dev: config.dev,
    jsx: denoJson.compilerOptions?.jsx,
    jsxImportSource: denoJson.compilerOptions?.jsxImportSource,
    target: state.config.build.target,
    absoluteWorkingDir: Deno.cwd(),
    basePath: state.config.basePath
  });
  return new ServerContext(state, extractResult, finalSnapshot);
}
export class ServerContext {
  #renderFn;
  #plugins;
  #builder;
  #state;
  #extractResult;
  #dev;
  #revision = 0;
  constructor(state, extractResult, snapshot){
    this.#state = state;
    this.#extractResult = extractResult;
    this.#renderFn = state.config.render;
    this.#plugins = state.config.plugins;
    this.#dev = state.config.dev;
    this.#builder = snapshot;
  }
  /**
   * Process the manifest into individual components and pages.
   */ static async fromManifest(manifest, config) {
    const configWithDefaults = await getInternalFreshState(manifest, config);
    return getServerContext(configWithDefaults);
  }
  /**
   * This functions returns a request handler that handles all routes required
   * by Fresh, including static files.
   */ handler() {
    const basePath = this.#state.config.basePath;
    const renderNotFound = createRenderNotFound(this.#extractResult, this.#dev, this.#plugins, this.#renderFn, this.#maybeBuildSnapshot());
    const handlers = this.#handlers(renderNotFound);
    const inner = router.router(handlers);
    const withMiddlewares = composeMiddlewares(this.#extractResult.middlewares, handlers.errorHandler, router.getParamsAndRoute(handlers), renderNotFound, basePath);
    const trailingSlashEnabled = this.#state.config.router?.trailingSlash;
    const isDev = this.#dev;
    if (this.#dev) {
      this.#revision = Date.now();
    }
    // deno-lint-ignore no-this-alias
    const _self = this;
    return async function handler(req, connInfo = DEFAULT_CONN_INFO) {
      const url = new URL(req.url);
      // Syntactically having double slashes in the pathname is valid per
      // spec, but there is no behavior defined for that. Practically all
      // servers normalize the pathname of a URL to not include double
      // forward slashes.
      url.pathname = url.pathname.replaceAll(/\/+/g, "/");
      const aliveUrl = basePath + ALIVE_URL;
      if (isDev) {
        // Live reload: Send updates to browser
        if (url.pathname === aliveUrl) {
          if (req.headers.get("upgrade") !== "websocket") {
            return new Response(null, {
              status: 501
            });
          }
          // TODO: When a change is made the Deno server restarts,
          // so for now the WebSocket connection is only used for
          // the client to know when the server is back up. Once we
          // have HMR we'll actively start sending messages back
          // and forth.
          const { response, socket } = Deno.upgradeWebSocket(req);
          socket.addEventListener("open", ()=>{
            socket.send(JSON.stringify({
              type: "initial-state",
              revision: _self.#revision
            }));
          });
          return response;
        } else if (url.pathname === withBase(DEV_CLIENT_URL, basePath) || url.pathname === withBase(`${DEV_CLIENT_URL}.map`, basePath)) {
          const bundlePath = url.pathname.endsWith(".map") ? "fresh_dev_client.js.map" : "fresh_dev_client.js";
          return _self.#bundleAssetRoute(bundlePath);
        }
      }
      // Redirect requests that end with a trailing slash to their non-trailing
      // slash counterpart.
      // Ex: /about/ -> /about
      if (url.pathname.length > 1 && url.pathname.endsWith("/") && !trailingSlashEnabled) {
        // Remove trailing slashes
        const path = url.pathname.replace(/\/+$/, "");
        const location = `${path}${url.search}`;
        return new Response(null, {
          status: STATUS_CODE.TemporaryRedirect,
          headers: {
            location
          }
        });
      } else if (trailingSlashEnabled && !url.pathname.endsWith("/")) {
        // If the last element of the path has a "." it's a file
        const isFile = url.pathname.split("/").at(-1)?.includes(".");
        // If the path uses the internal prefix, don't redirect it
        const isInternal = url.pathname.startsWith(INTERNAL_PREFIX);
        if (!isFile && !isInternal) {
          url.pathname += "/";
          return Response.redirect(url, STATUS_CODE.PermanentRedirect);
        }
      }
      // Redirect to base path if not present in url
      if (basePath && !url.pathname.startsWith(basePath)) {
        const to = new URL(basePath + url.pathname, url.origin);
        return Response.redirect(to, 302);
      }
      const ctx = {
        url,
        params: {},
        config: _self.#state.config,
        basePath: _self.#state.config.basePath,
        localAddr: connInfo.localAddr,
        remoteAddr: connInfo.remoteAddr,
        state: {},
        isPartial: url.searchParams.has(PARTIAL_SEARCH_PARAM),
        destination: "route",
        error: undefined,
        codeFrame: undefined,
        Component: NOOP_COMPONENT,
        next: NOOP_NEXT,
        render: NOOP_NEXT,
        renderNotFound: async (data)=>{
          ctx.data = data;
          return await renderNotFound(req, ctx);
        },
        route: "",
        get pattern () {
          return ctx.route;
        },
        data: undefined
      };
      return await withMiddlewares(req, ctx, inner);
    };
  }
  #maybeBuildSnapshot() {
    if ("build" in this.#builder || this.#builder instanceof Promise) {
      return null;
    }
    return this.#builder;
  }
  async buildSnapshot() {
    if ("build" in this.#builder) {
      const builder = this.#builder;
      this.#builder = builder.build();
      try {
        const snapshot = await this.#builder;
        this.#builder = snapshot;
      } catch (err) {
        this.#builder = builder;
        throw err;
      }
    }
    return this.#builder;
  }
  /**
   * This function returns all routes required by Fresh as an extended
   * path-to-regex, to handler mapping.
   */ #handlers(renderNotFound) {
    const internalRoutes = {};
    const staticRoutes = {};
    let routes = {};
    const assetRoute = withBase(`${INTERNAL_PREFIX}${JS_PREFIX}/${BUILD_ID}/:path*`, this.#state.config.basePath);
    internalRoutes[assetRoute] = {
      baseRoute: toBaseRoute(assetRoute),
      methods: {
        default: (_req, ctx)=>this.#bundleAssetRoute(ctx.params.path)
      }
    };
    // Add the static file routes.
    // each files has 2 static routes:
    // - one serving the file at its location without a "cache bursting" mechanism
    // - one containing the BUILD_ID in the path that can be cached
    for (const { localUrl, path, size, contentType, etag } of this.#extractResult.staticFiles){
      staticRoutes[path.replaceAll(SEPARATOR, "/")] = {
        baseRoute: toBaseRoute(path),
        methods: {
          "HEAD": this.#staticFileHandler(localUrl, size, contentType, etag),
          "GET": this.#staticFileHandler(localUrl, size, contentType, etag)
        }
      };
    }
    // Tell renderer about all globally available islands
    setAllIslands(this.#extractResult.islands);
    const dependenciesFn = (path)=>{
      const snapshot = this.#maybeBuildSnapshot();
      return snapshot?.dependencies(path) ?? [];
    };
    const genRender = (route, status)=>{
      const imports = [];
      if (this.#dev) imports.push(this.#state.config.basePath + DEV_CLIENT_URL);
      return (req, ctx, error, codeFrame)=>{
        return async (data, options)=>{
          if (route.component === undefined) {
            throw new Error("This page does not have a component to render.");
          }
          const layouts = selectSharedRoutes(route.baseRoute, this.#extractResult.layouts);
          ctx.error = error;
          ctx.data = data;
          const resp = await internalRender({
            request: req,
            context: ctx,
            route,
            plugins: this.#plugins,
            app: this.#extractResult.app,
            layouts,
            imports,
            dependenciesFn,
            renderFn: this.#renderFn,
            codeFrame
          });
          if (resp instanceof Response) {
            return resp;
          }
          return sendResponse(resp, {
            status: options?.status ?? status,
            statusText: options?.statusText,
            headers: options?.headers,
            isDev: this.#dev
          });
        };
      };
    };
    for (const route of this.#extractResult.routes){
      if (this.#state.config.router?.trailingSlash && route.pattern != "/") {
        route.pattern += "/";
      }
      const createRender = genRender(route, STATUS_CODE.OK);
      if (typeof route.handler === "function") {
        routes[route.pattern] = {
          baseRoute: route.baseRoute,
          methods: {
            default: (req, ctx)=>{
              ctx.render = createRender(req, ctx);
              return route.handler(req, ctx);
            }
          }
        };
      } else {
        routes[route.pattern] = {
          baseRoute: route.baseRoute,
          methods: {}
        };
        for (const [method, handler] of Object.entries(route.handler)){
          routes[route.pattern].methods[method] = (req, ctx)=>{
            ctx.render = createRender(req, ctx);
            return handler(req, ctx);
          };
        }
      }
    }
    let otherHandler = (req, ctx)=>{
      ctx.render = (data)=>{
        ctx.data = data;
        return renderNotFound(req, ctx);
      };
      return this.#extractResult.notFound.handler(req, ctx);
    };
    const errorHandlerRender = genRender(this.#extractResult.error, STATUS_CODE.InternalServerError);
    const errorHandler = async (req, ctx, error)=>{
      console.error("%cAn error occurred during route handling or page rendering.", "color:red");
      let codeFrame;
      if (this.#dev && error instanceof Error) {
        codeFrame = await getCodeFrame(error);
        if (codeFrame) {
          console.error();
          console.error(codeFrame);
        }
      }
      console.error(error);
      ctx.error = error;
      ctx.render = errorHandlerRender(req, ctx, error, codeFrame);
      return this.#extractResult.error.handler(req, ctx);
    };
    if (this.#dev) {
      const devErrorUrl = withBase(DEV_ERROR_OVERLAY_URL, this.#state.config.basePath);
      const baseRoute = toBaseRoute(devErrorUrl);
      internalRoutes[devErrorUrl] = {
        baseRoute,
        methods: {
          default: async (req, ctx)=>{
            const resp = await internalRender({
              request: req,
              context: ctx,
              route: {
                component: ErrorOverlay,
                inheritLayouts: false,
                appWrapper: false,
                csp: false,
                url: req.url,
                name: "error overlay route",
                handler: (_req, ctx)=>ctx.render(),
                baseRoute,
                pattern: baseRoute
              },
              plugins: this.#plugins,
              app: this.#extractResult.app,
              layouts: [],
              imports: [],
              dependenciesFn: ()=>[],
              renderFn: this.#renderFn,
              codeFrame: undefined
            });
            if (resp instanceof Response) {
              return resp;
            }
            return sendResponse(resp, {
              status: 200,
              isDev: this.#dev,
              statusText: undefined,
              headers: undefined
            });
          }
        }
      };
    }
    // This page is shown when the user uses the tailwindcss plugin and
    // hasn't configured AOT builds.
    if (!this.#state.config.dev && this.#state.loadSnapshot && !this.#state.didLoadSnapshot && this.#state.config.plugins.some((plugin)=>plugin.name === "tailwind")) {
      if (DENO_DEPLOYMENT_ID !== undefined) {
        // Don't fail hard here and instead rewrite all routes to a special
        // error route. Otherwise the first user experience of deploying a
        // Fresh project would be pretty disruptive
        console.error("%cError: Ahead of time builds not configured but required by the tailwindcss plugin.\nTo resolve this error, set up ahead of time builds: https://fresh.deno.dev/docs/concepts/ahead-of-time-builds", "color: red");
        console.log();
        // Clear all routes so that everything redirects to the tailwind
        // error page.
        routes = {};
        const freshErrorPage = genRender({
          appWrapper: false,
          inheritLayouts: false,
          component: TailwindErrorPage,
          csp: false,
          name: "tailwind_error_route",
          pattern: "*",
          url: "",
          baseRoute: toBaseRoute("*"),
          handler: (_req, ctx)=>ctx.render()
        }, STATUS_CODE.InternalServerError);
        otherHandler = (req, ctx)=>{
          const render = freshErrorPage(req, ctx);
          return render();
        };
      } else {
        // Not on Deno Deploy. The user likely forgot to run `deno task build`
        console.warn('%cNo pre-compiled tailwind styles found.\n\nDid you forget to run "deno task build" prior to starting the production server?', "color: yellow");
      }
    }
    return {
      internalRoutes,
      staticRoutes,
      routes,
      otherHandler,
      errorHandler
    };
  }
  #staticFileHandler(localUrl, size, contentType, etag) {
    return async (req)=>{
      const url = new URL(req.url);
      const key = url.searchParams.get(ASSET_CACHE_BUST_KEY);
      if (key !== null && BUILD_ID !== key) {
        url.searchParams.delete(ASSET_CACHE_BUST_KEY);
        const location = url.pathname + url.search;
        return new Response(null, {
          status: 307,
          headers: {
            location
          }
        });
      }
      const headers = new Headers({
        "content-type": contentType,
        etag,
        vary: "If-None-Match"
      });
      if (key !== null) {
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
      }
      const ifNoneMatch = req.headers.get("if-none-match");
      if (ifNoneMatch === etag || ifNoneMatch === "W/" + etag) {
        return new Response(null, {
          status: 304,
          headers
        });
      } else if (req.method === "HEAD") {
        headers.set("content-length", String(size));
        return new Response(null, {
          status: 200,
          headers
        });
      } else {
        const file = await Deno.open(localUrl);
        headers.set("content-length", String(size));
        return new Response(file.readable, {
          headers
        });
      }
    };
  }
  async #bundleAssetRoute(filePath) {
    const snapshot = await this.buildSnapshot();
    const contents = await snapshot.read(filePath);
    if (!contents) return new Response(null, {
      status: 404
    });
    const headers = {
      "Cache-Control": this.#dev ? "no-cache, no-store, max-age=0, must-revalidate" : "public, max-age=604800, immutable"
    };
    const type = contentType(extname(filePath));
    if (type) headers["Content-Type"] = type;
    return new Response(contents, {
      status: 200,
      headers
    });
  }
}
const createRenderNotFound = (extractResult, dev, plugins, renderFunction, buildSnapshot)=>{
  const dependenciesFn = (path)=>{
    const snapshot = buildSnapshot;
    return snapshot?.dependencies(path) ?? [];
  };
  return async (req, ctx)=>{
    const notFound = extractResult.notFound;
    if (!notFound.component) {
      return sendResponse([
        "Not found.",
        "",
        undefined
      ], {
        status: STATUS_CODE.NotFound,
        isDev: dev,
        statusText: undefined,
        headers: undefined
      });
    }
    const layouts = selectSharedRoutes(ROOT_BASE_ROUTE, extractResult.layouts);
    const imports = [];
    const resp = await internalRender({
      request: req,
      context: ctx,
      route: notFound,
      plugins: plugins,
      app: extractResult.app,
      layouts,
      imports,
      dependenciesFn,
      renderFn: renderFunction
    });
    if (resp instanceof Response) {
      return resp;
    }
    return sendResponse(resp, {
      status: STATUS_CODE.NotFound,
      isDev: dev,
      statusText: undefined,
      headers: undefined
    });
  };
};
// Normalize a path for use in a URL. Returns null if the path is unparsable.
export function normalizeURLPath(path) {
  try {
    const pathUrl = new URL("file:///");
    pathUrl.pathname = path;
    return pathUrl.pathname;
  } catch  {
    return null;
  }
}
function serializeCSPDirectives(csp) {
  return Object.entries(csp).filter(([_key, value])=>value !== undefined).map(([k, v])=>{
    // Turn camel case into snake case.
    const key = k.replace(/[A-Z]/g, (m)=>`-${m.toLowerCase()}`);
    const value = Array.isArray(v) ? v.join(" ") : v;
    return `${key} ${value}`;
  }).join("; ");
}
function collectEntrypoints(dev, islands, plugins) {
  const entrypointBase = "../runtime/entrypoints";
  const entryPoints = {
    main: dev ? import.meta.resolve(`${entrypointBase}/main_dev.ts`) : import.meta.resolve(`${entrypointBase}/main.ts`),
    deserializer: import.meta.resolve(`${entrypointBase}/deserializer.ts`)
  };
  if (dev) {
    entryPoints.fresh_dev_client = import.meta.resolve(`${entrypointBase}/client.ts`);
  }
  try {
    import.meta.resolve("@preact/signals");
    entryPoints.signals = import.meta.resolve(`${entrypointBase}/signals.ts`);
  } catch  {
  // @preact/signals is not in the import map
  }
  for (const island of islands){
    entryPoints[`island-${island.name}`] = island.url;
  }
  for (const plugin of plugins){
    for (const [name, url] of Object.entries(plugin.entrypoints ?? {})){
      entryPoints[`plugin-${plugin.name}-${name}`] = url;
    }
  }
  return entryPoints;
}
function sendResponse(resp, options) {
  const [body, uuid, csp] = resp;
  const headers = new Headers({
    "content-type": "text/html; charset=utf-8",
    "x-fresh-uuid": uuid
  });
  if (csp) {
    if (options.isDev) {
      csp.directives.connectSrc = [
        ...csp.directives.connectSrc ?? [],
        SELF
      ];
    }
    const directive = serializeCSPDirectives(csp.directives);
    if (csp.reportOnly) {
      headers.set("content-security-policy-report-only", directive);
    } else {
      headers.set("content-security-policy", directive);
    }
  }
  if (options.headers) {
    if (Array.isArray(options.headers)) {
      for (const [key, value] of options.headers){
        headers.append(key, value);
      }
    } else if (options.headers instanceof Headers) {
      options.headers.forEach((value, key)=>{
        headers.append(key, value);
      });
    } else {
      for (const [key, value] of Object.entries(options.headers)){
        headers.append(key, value);
      }
    }
  }
  return new Response(body, {
    status: options.status,
    statusText: options.statusText,
    headers
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZnJlc2hAMS43LjMvc3JjL3NlcnZlci9jb250ZXh0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNvbnRlbnRUeXBlLCBleHRuYW1lLCBTRVBBUkFUT1IsIFNUQVRVU19DT0RFIH0gZnJvbSBcIi4vZGVwcy50c1wiO1xuaW1wb3J0ICogYXMgcm91dGVyIGZyb20gXCIuL3JvdXRlci50c1wiO1xuaW1wb3J0IHsgRnJlc2hDb25maWcsIEZyZXNoQ29udGV4dCwgTWFuaWZlc3QgfSBmcm9tIFwiLi9tb2QudHNcIjtcbmltcG9ydCB7XG4gIEFMSVZFX1VSTCxcbiAgREVWX0NMSUVOVF9VUkwsXG4gIERFVl9FUlJPUl9PVkVSTEFZX1VSTCxcbiAgSlNfUFJFRklYLFxufSBmcm9tIFwiLi9jb25zdGFudHMudHNcIjtcbmltcG9ydCB7IEJVSUxEX0lELCBERU5PX0RFUExPWU1FTlRfSUQgfSBmcm9tIFwiLi9idWlsZF9pZC50c1wiO1xuXG5pbXBvcnQge1xuICBFcnJvclBhZ2UsXG4gIEhhbmRsZXIsXG4gIEludGVybmFsRnJlc2hTdGF0ZSxcbiAgSXNsYW5kLFxuICBQbHVnaW4sXG4gIFJlbmRlckZ1bmN0aW9uLFxuICBSZW5kZXJPcHRpb25zLFxuICBSb3V0ZSxcbiAgU2VydmVIYW5kbGVySW5mbyxcbiAgVW5rbm93blBhZ2UsXG4gIFVua25vd25SZW5kZXJGdW5jdGlvbixcbn0gZnJvbSBcIi4vdHlwZXMudHNcIjtcbmltcG9ydCB7IHJlbmRlciBhcyBpbnRlcm5hbFJlbmRlciB9IGZyb20gXCIuL3JlbmRlci50c1wiO1xuaW1wb3J0IHtcbiAgQ29udGVudFNlY3VyaXR5UG9saWN5LFxuICBDb250ZW50U2VjdXJpdHlQb2xpY3lEaXJlY3RpdmVzLFxuICBTRUxGLFxufSBmcm9tIFwiLi4vcnVudGltZS9jc3AudHNcIjtcbmltcG9ydCB7IEFTU0VUX0NBQ0hFX0JVU1RfS0VZLCBJTlRFUk5BTF9QUkVGSVggfSBmcm9tIFwiLi4vcnVudGltZS91dGlscy50c1wiO1xuaW1wb3J0IHsgQnVpbGRlciwgQnVpbGRTbmFwc2hvdCwgRXNidWlsZEJ1aWxkZXIgfSBmcm9tIFwiLi4vYnVpbGQvbW9kLnRzXCI7XG5pbXBvcnQgeyBzZXRBbGxJc2xhbmRzIH0gZnJvbSBcIi4vcmVuZGVyaW5nL3ByZWFjdF9ob29rcy50c1wiO1xuaW1wb3J0IHsgZ2V0Q29kZUZyYW1lIH0gZnJvbSBcIi4vY29kZV9mcmFtZS50c1wiO1xuaW1wb3J0IHsgZ2V0SW50ZXJuYWxGcmVzaFN0YXRlIH0gZnJvbSBcIi4vY29uZmlnLnRzXCI7XG5pbXBvcnQge1xuICBjb21wb3NlTWlkZGxld2FyZXMsXG4gIFJPT1RfQkFTRV9ST1VURSxcbiAgc2VsZWN0U2hhcmVkUm91dGVzLFxuICB0b0Jhc2VSb3V0ZSxcbn0gZnJvbSBcIi4vY29tcG9zZS50c1wiO1xuaW1wb3J0IHsgZXh0cmFjdFJvdXRlcywgRnNFeHRyYWN0UmVzdWx0IH0gZnJvbSBcIi4vZnNfZXh0cmFjdC50c1wiO1xuaW1wb3J0IHsgbG9hZEFvdFNuYXBzaG90IH0gZnJvbSBcIi4uL2J1aWxkL2FvdF9zbmFwc2hvdC50c1wiO1xuaW1wb3J0IHsgRXJyb3JPdmVybGF5IH0gZnJvbSBcIi4vZXJyb3Jfb3ZlcmxheS50c3hcIjtcbmltcG9ydCB7IHdpdGhCYXNlIH0gZnJvbSBcIi4vcm91dGVyLnRzXCI7XG5pbXBvcnQgeyBQQVJUSUFMX1NFQVJDSF9QQVJBTSB9IGZyb20gXCIuLi9jb25zdGFudHMudHNcIjtcbmltcG9ydCBUYWlsd2luZEVycm9yUGFnZSBmcm9tIFwiLi90YWlsd2luZF9hb3RfZXJyb3JfcGFnZS50c3hcIjtcblxuLy8gVE9ETzogQ29tcGxldGVkIHR5cGUgY2xhc2hlcyBpbiBvbGRlciBEZW5vIHZlcnNpb25zXG4vLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuY29uc3QgREVGQVVMVF9DT05OX0lORk86IGFueSA9IHtcbiAgbG9jYWxBZGRyOiB7IHRyYW5zcG9ydDogXCJ0Y3BcIiwgaG9zdG5hbWU6IFwibG9jYWxob3N0XCIsIHBvcnQ6IDgwODAgfSxcbiAgcmVtb3RlQWRkcjogeyB0cmFuc3BvcnQ6IFwidGNwXCIsIGhvc3RuYW1lOiBcImxvY2FsaG9zdFwiLCBwb3J0OiAxMjM0IH0sXG59O1xuXG4vLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuY29uc3QgTk9PUF9DT01QT05FTlQgPSAoKSA9PiBudWxsIGFzIGFueTtcbmNvbnN0IE5PT1BfTkVYVCA9ICgpID0+IFByb21pc2UucmVzb2x2ZShuZXcgUmVzcG9uc2UobnVsbCwgeyBzdGF0dXM6IDUwMCB9KSk7XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgVXNlIHtAbGlua2NvZGUgRnJvbU1hbmlmZXN0Q29uZmlnfSBpbnN0ZWFkXG4gKi9cbmV4cG9ydCB0eXBlIEZyb21NYW5pZmVzdE9wdGlvbnMgPSBGcm9tTWFuaWZlc3RDb25maWc7XG5cbmV4cG9ydCB0eXBlIEZyb21NYW5pZmVzdENvbmZpZyA9IEZyZXNoQ29uZmlnICYge1xuICBkZXY/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFNlcnZlckNvbnRleHQoc3RhdGU6IEludGVybmFsRnJlc2hTdGF0ZSkge1xuICBjb25zdCB7IGNvbmZpZywgZGVub0pzb24sIGRlbm9Kc29uUGF0aDogY29uZmlnUGF0aCB9ID0gc3RhdGU7XG5cbiAgaWYgKGNvbmZpZy5kZXYpIHtcbiAgICAvLyBFbnN1cmUgdGhhdCBkZWJ1Z2dpbmcgaG9va3MgYXJlIHNldCB1cCBmb3IgU1NSIHJlbmRlcmluZ1xuICAgIGF3YWl0IGltcG9ydChcInByZWFjdC9kZWJ1Z1wiKTtcbiAgfVxuXG4gIC8vIFBsdWdpbnMgYXJlIGFscmVhZHkgaW5zdGFudGlhdGVkIGluIGJ1aWxkIG1vZGVcbiAgaWYgKCFzdGF0ZS5idWlsZCkge1xuICAgIGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgY29uZmlnLnBsdWdpbnMubWFwKChwbHVnaW4pID0+IHBsdWdpbi5jb25maWdSZXNvbHZlZD8uKHN0YXRlLmNvbmZpZykpLFxuICAgICk7XG4gIH1cblxuICBjb25zdCBleHRyYWN0UmVzdWx0ID0gYXdhaXQgZXh0cmFjdFJvdXRlcyhzdGF0ZSk7XG5cbiAgLy8gUmVzdG9yZSBzbmFwc2hvdCBpZiBhdmFpbGFibGVcbiAgbGV0IHNuYXBzaG90OiBCdWlsZGVyIHwgQnVpbGRTbmFwc2hvdCB8IFByb21pc2U8QnVpbGRTbmFwc2hvdD4gfCBudWxsID0gbnVsbDtcbiAgaWYgKHN0YXRlLmxvYWRTbmFwc2hvdCkge1xuICAgIGNvbnN0IGxvYWRlZFNuYXBzaG90ID0gYXdhaXQgbG9hZEFvdFNuYXBzaG90KGNvbmZpZyk7XG4gICAgaWYgKGxvYWRlZFNuYXBzaG90ICE9PSBudWxsKSB7XG4gICAgICBzbmFwc2hvdCA9IGxvYWRlZFNuYXBzaG90O1xuICAgICAgc3RhdGUuZGlkTG9hZFNuYXBzaG90ID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBmaW5hbFNuYXBzaG90ID0gc25hcHNob3QgPz8gbmV3IEVzYnVpbGRCdWlsZGVyKHtcbiAgICBidWlsZElEOiBCVUlMRF9JRCxcbiAgICBlbnRyeXBvaW50czogY29sbGVjdEVudHJ5cG9pbnRzKFxuICAgICAgY29uZmlnLmRldixcbiAgICAgIGV4dHJhY3RSZXN1bHQuaXNsYW5kcyxcbiAgICAgIGNvbmZpZy5wbHVnaW5zLFxuICAgICksXG4gICAgY29uZmlnUGF0aCxcbiAgICBkZXY6IGNvbmZpZy5kZXYsXG4gICAganN4OiBkZW5vSnNvbi5jb21waWxlck9wdGlvbnM/LmpzeCxcbiAgICBqc3hJbXBvcnRTb3VyY2U6IGRlbm9Kc29uLmNvbXBpbGVyT3B0aW9ucz8uanN4SW1wb3J0U291cmNlLFxuICAgIHRhcmdldDogc3RhdGUuY29uZmlnLmJ1aWxkLnRhcmdldCxcbiAgICBhYnNvbHV0ZVdvcmtpbmdEaXI6IERlbm8uY3dkKCksXG4gICAgYmFzZVBhdGg6IHN0YXRlLmNvbmZpZy5iYXNlUGF0aCxcbiAgfSk7XG5cbiAgcmV0dXJuIG5ldyBTZXJ2ZXJDb250ZXh0KFxuICAgIHN0YXRlLFxuICAgIGV4dHJhY3RSZXN1bHQsXG4gICAgZmluYWxTbmFwc2hvdCxcbiAgKTtcbn1cblxuZXhwb3J0IGNsYXNzIFNlcnZlckNvbnRleHQge1xuICAjcmVuZGVyRm46IFJlbmRlckZ1bmN0aW9uO1xuICAjcGx1Z2luczogUGx1Z2luW107XG4gICNidWlsZGVyOiBCdWlsZGVyIHwgUHJvbWlzZTxCdWlsZFNuYXBzaG90PiB8IEJ1aWxkU25hcHNob3Q7XG4gICNzdGF0ZTogSW50ZXJuYWxGcmVzaFN0YXRlO1xuICAjZXh0cmFjdFJlc3VsdDogRnNFeHRyYWN0UmVzdWx0O1xuICAjZGV2OiBib29sZWFuO1xuICAjcmV2aXNpb24gPSAwO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHN0YXRlOiBJbnRlcm5hbEZyZXNoU3RhdGUsXG4gICAgZXh0cmFjdFJlc3VsdDogRnNFeHRyYWN0UmVzdWx0LFxuICAgIHNuYXBzaG90OiBCdWlsZGVyIHwgQnVpbGRTbmFwc2hvdCB8IFByb21pc2U8QnVpbGRTbmFwc2hvdD4sXG4gICkge1xuICAgIHRoaXMuI3N0YXRlID0gc3RhdGU7XG4gICAgdGhpcy4jZXh0cmFjdFJlc3VsdCA9IGV4dHJhY3RSZXN1bHQ7XG4gICAgdGhpcy4jcmVuZGVyRm4gPSBzdGF0ZS5jb25maWcucmVuZGVyO1xuICAgIHRoaXMuI3BsdWdpbnMgPSBzdGF0ZS5jb25maWcucGx1Z2lucztcbiAgICB0aGlzLiNkZXYgPSBzdGF0ZS5jb25maWcuZGV2O1xuICAgIHRoaXMuI2J1aWxkZXIgPSBzbmFwc2hvdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzIHRoZSBtYW5pZmVzdCBpbnRvIGluZGl2aWR1YWwgY29tcG9uZW50cyBhbmQgcGFnZXMuXG4gICAqL1xuICBzdGF0aWMgYXN5bmMgZnJvbU1hbmlmZXN0KFxuICAgIG1hbmlmZXN0OiBNYW5pZmVzdCxcbiAgICBjb25maWc6IEZyb21NYW5pZmVzdENvbmZpZyxcbiAgKTogUHJvbWlzZTxTZXJ2ZXJDb250ZXh0PiB7XG4gICAgY29uc3QgY29uZmlnV2l0aERlZmF1bHRzID0gYXdhaXQgZ2V0SW50ZXJuYWxGcmVzaFN0YXRlKFxuICAgICAgbWFuaWZlc3QsXG4gICAgICBjb25maWcsXG4gICAgKTtcbiAgICByZXR1cm4gZ2V0U2VydmVyQ29udGV4dChjb25maWdXaXRoRGVmYXVsdHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgZnVuY3Rpb25zIHJldHVybnMgYSByZXF1ZXN0IGhhbmRsZXIgdGhhdCBoYW5kbGVzIGFsbCByb3V0ZXMgcmVxdWlyZWRcbiAgICogYnkgRnJlc2gsIGluY2x1ZGluZyBzdGF0aWMgZmlsZXMuXG4gICAqL1xuICBoYW5kbGVyKCk6IChyZXE6IFJlcXVlc3QsIGNvbm5JbmZvPzogU2VydmVIYW5kbGVySW5mbykgPT4gUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIGNvbnN0IGJhc2VQYXRoID0gdGhpcy4jc3RhdGUuY29uZmlnLmJhc2VQYXRoO1xuICAgIGNvbnN0IHJlbmRlck5vdEZvdW5kID0gY3JlYXRlUmVuZGVyTm90Rm91bmQoXG4gICAgICB0aGlzLiNleHRyYWN0UmVzdWx0LFxuICAgICAgdGhpcy4jZGV2LFxuICAgICAgdGhpcy4jcGx1Z2lucyxcbiAgICAgIHRoaXMuI3JlbmRlckZuLFxuICAgICAgdGhpcy4jbWF5YmVCdWlsZFNuYXBzaG90KCksXG4gICAgKTtcbiAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuI2hhbmRsZXJzKHJlbmRlck5vdEZvdW5kKTtcbiAgICBjb25zdCBpbm5lciA9IHJvdXRlci5yb3V0ZXIoaGFuZGxlcnMpO1xuICAgIGNvbnN0IHdpdGhNaWRkbGV3YXJlcyA9IGNvbXBvc2VNaWRkbGV3YXJlcyhcbiAgICAgIHRoaXMuI2V4dHJhY3RSZXN1bHQubWlkZGxld2FyZXMsXG4gICAgICBoYW5kbGVycy5lcnJvckhhbmRsZXIsXG4gICAgICByb3V0ZXIuZ2V0UGFyYW1zQW5kUm91dGUoaGFuZGxlcnMpLFxuICAgICAgcmVuZGVyTm90Rm91bmQsXG4gICAgICBiYXNlUGF0aCxcbiAgICApO1xuICAgIGNvbnN0IHRyYWlsaW5nU2xhc2hFbmFibGVkID0gdGhpcy4jc3RhdGUuY29uZmlnLnJvdXRlcj8udHJhaWxpbmdTbGFzaDtcbiAgICBjb25zdCBpc0RldiA9IHRoaXMuI2RldjtcblxuICAgIGlmICh0aGlzLiNkZXYpIHtcbiAgICAgIHRoaXMuI3JldmlzaW9uID0gRGF0ZS5ub3coKTtcbiAgICB9XG5cbiAgICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLXRoaXMtYWxpYXNcbiAgICBjb25zdCBfc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihcbiAgICAgIHJlcTogUmVxdWVzdCxcbiAgICAgIGNvbm5JbmZvOiBTZXJ2ZUhhbmRsZXJJbmZvID0gREVGQVVMVF9DT05OX0lORk8sXG4gICAgKSB7XG4gICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHJlcS51cmwpO1xuICAgICAgLy8gU3ludGFjdGljYWxseSBoYXZpbmcgZG91YmxlIHNsYXNoZXMgaW4gdGhlIHBhdGhuYW1lIGlzIHZhbGlkIHBlclxuICAgICAgLy8gc3BlYywgYnV0IHRoZXJlIGlzIG5vIGJlaGF2aW9yIGRlZmluZWQgZm9yIHRoYXQuIFByYWN0aWNhbGx5IGFsbFxuICAgICAgLy8gc2VydmVycyBub3JtYWxpemUgdGhlIHBhdGhuYW1lIG9mIGEgVVJMIHRvIG5vdCBpbmNsdWRlIGRvdWJsZVxuICAgICAgLy8gZm9yd2FyZCBzbGFzaGVzLlxuICAgICAgdXJsLnBhdGhuYW1lID0gdXJsLnBhdGhuYW1lLnJlcGxhY2VBbGwoL1xcLysvZywgXCIvXCIpO1xuXG4gICAgICBjb25zdCBhbGl2ZVVybCA9IGJhc2VQYXRoICsgQUxJVkVfVVJMO1xuXG4gICAgICBpZiAoaXNEZXYpIHtcbiAgICAgICAgLy8gTGl2ZSByZWxvYWQ6IFNlbmQgdXBkYXRlcyB0byBicm93c2VyXG4gICAgICAgIGlmICh1cmwucGF0aG5hbWUgPT09IGFsaXZlVXJsKSB7XG4gICAgICAgICAgaWYgKHJlcS5oZWFkZXJzLmdldChcInVwZ3JhZGVcIikgIT09IFwid2Vic29ja2V0XCIpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwgeyBzdGF0dXM6IDUwMSB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBUT0RPOiBXaGVuIGEgY2hhbmdlIGlzIG1hZGUgdGhlIERlbm8gc2VydmVyIHJlc3RhcnRzLFxuICAgICAgICAgIC8vIHNvIGZvciBub3cgdGhlIFdlYlNvY2tldCBjb25uZWN0aW9uIGlzIG9ubHkgdXNlZCBmb3JcbiAgICAgICAgICAvLyB0aGUgY2xpZW50IHRvIGtub3cgd2hlbiB0aGUgc2VydmVyIGlzIGJhY2sgdXAuIE9uY2Ugd2VcbiAgICAgICAgICAvLyBoYXZlIEhNUiB3ZSdsbCBhY3RpdmVseSBzdGFydCBzZW5kaW5nIG1lc3NhZ2VzIGJhY2tcbiAgICAgICAgICAvLyBhbmQgZm9ydGguXG4gICAgICAgICAgY29uc3QgeyByZXNwb25zZSwgc29ja2V0IH0gPSBEZW5vLnVwZ3JhZGVXZWJTb2NrZXQocmVxKTtcblxuICAgICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCAoKSA9PiB7XG4gICAgICAgICAgICBzb2NrZXQuc2VuZChcbiAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiaW5pdGlhbC1zdGF0ZVwiLFxuICAgICAgICAgICAgICAgIHJldmlzaW9uOiBfc2VsZi4jcmV2aXNpb24sXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICB1cmwucGF0aG5hbWUgPT09IHdpdGhCYXNlKERFVl9DTElFTlRfVVJMLCBiYXNlUGF0aCkgfHxcbiAgICAgICAgICB1cmwucGF0aG5hbWUgPT09IHdpdGhCYXNlKGAke0RFVl9DTElFTlRfVVJMfS5tYXBgLCBiYXNlUGF0aClcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgYnVuZGxlUGF0aCA9ICh1cmwucGF0aG5hbWUuZW5kc1dpdGgoXCIubWFwXCIpKVxuICAgICAgICAgICAgPyBcImZyZXNoX2Rldl9jbGllbnQuanMubWFwXCJcbiAgICAgICAgICAgIDogXCJmcmVzaF9kZXZfY2xpZW50LmpzXCI7XG5cbiAgICAgICAgICByZXR1cm4gX3NlbGYuI2J1bmRsZUFzc2V0Um91dGUoYnVuZGxlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUmVkaXJlY3QgcmVxdWVzdHMgdGhhdCBlbmQgd2l0aCBhIHRyYWlsaW5nIHNsYXNoIHRvIHRoZWlyIG5vbi10cmFpbGluZ1xuICAgICAgLy8gc2xhc2ggY291bnRlcnBhcnQuXG4gICAgICAvLyBFeDogL2Fib3V0LyAtPiAvYWJvdXRcbiAgICAgIGlmIChcbiAgICAgICAgdXJsLnBhdGhuYW1lLmxlbmd0aCA+IDEgJiYgdXJsLnBhdGhuYW1lLmVuZHNXaXRoKFwiL1wiKSAmJlxuICAgICAgICAhdHJhaWxpbmdTbGFzaEVuYWJsZWRcbiAgICAgICkge1xuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgc2xhc2hlc1xuICAgICAgICBjb25zdCBwYXRoID0gdXJsLnBhdGhuYW1lLnJlcGxhY2UoL1xcLyskLywgXCJcIik7XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gYCR7cGF0aH0ke3VybC5zZWFyY2h9YDtcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7XG4gICAgICAgICAgc3RhdHVzOiBTVEFUVVNfQ09ERS5UZW1wb3JhcnlSZWRpcmVjdCxcbiAgICAgICAgICBoZWFkZXJzOiB7IGxvY2F0aW9uIH0sXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmICh0cmFpbGluZ1NsYXNoRW5hYmxlZCAmJiAhdXJsLnBhdGhuYW1lLmVuZHNXaXRoKFwiL1wiKSkge1xuICAgICAgICAvLyBJZiB0aGUgbGFzdCBlbGVtZW50IG9mIHRoZSBwYXRoIGhhcyBhIFwiLlwiIGl0J3MgYSBmaWxlXG4gICAgICAgIGNvbnN0IGlzRmlsZSA9IHVybC5wYXRobmFtZS5zcGxpdChcIi9cIikuYXQoLTEpPy5pbmNsdWRlcyhcIi5cIik7XG5cbiAgICAgICAgLy8gSWYgdGhlIHBhdGggdXNlcyB0aGUgaW50ZXJuYWwgcHJlZml4LCBkb24ndCByZWRpcmVjdCBpdFxuICAgICAgICBjb25zdCBpc0ludGVybmFsID0gdXJsLnBhdGhuYW1lLnN0YXJ0c1dpdGgoSU5URVJOQUxfUFJFRklYKTtcblxuICAgICAgICBpZiAoIWlzRmlsZSAmJiAhaXNJbnRlcm5hbCkge1xuICAgICAgICAgIHVybC5wYXRobmFtZSArPSBcIi9cIjtcbiAgICAgICAgICByZXR1cm4gUmVzcG9uc2UucmVkaXJlY3QodXJsLCBTVEFUVVNfQ09ERS5QZXJtYW5lbnRSZWRpcmVjdCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUmVkaXJlY3QgdG8gYmFzZSBwYXRoIGlmIG5vdCBwcmVzZW50IGluIHVybFxuICAgICAgaWYgKGJhc2VQYXRoICYmICF1cmwucGF0aG5hbWUuc3RhcnRzV2l0aChiYXNlUGF0aCkpIHtcbiAgICAgICAgY29uc3QgdG8gPSBuZXcgVVJMKGJhc2VQYXRoICsgdXJsLnBhdGhuYW1lLCB1cmwub3JpZ2luKTtcbiAgICAgICAgcmV0dXJuIFJlc3BvbnNlLnJlZGlyZWN0KHRvLCAzMDIpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjdHg6IEZyZXNoQ29udGV4dCA9IHtcbiAgICAgICAgdXJsLFxuICAgICAgICBwYXJhbXM6IHt9LFxuICAgICAgICBjb25maWc6IF9zZWxmLiNzdGF0ZS5jb25maWcsXG4gICAgICAgIGJhc2VQYXRoOiBfc2VsZi4jc3RhdGUuY29uZmlnLmJhc2VQYXRoLFxuICAgICAgICBsb2NhbEFkZHI6IGNvbm5JbmZvLmxvY2FsQWRkcixcbiAgICAgICAgcmVtb3RlQWRkcjogY29ubkluZm8ucmVtb3RlQWRkcixcbiAgICAgICAgc3RhdGU6IHt9LFxuICAgICAgICBpc1BhcnRpYWw6IHVybC5zZWFyY2hQYXJhbXMuaGFzKFBBUlRJQUxfU0VBUkNIX1BBUkFNKSxcbiAgICAgICAgZGVzdGluYXRpb246IFwicm91dGVcIixcbiAgICAgICAgZXJyb3I6IHVuZGVmaW5lZCxcbiAgICAgICAgY29kZUZyYW1lOiB1bmRlZmluZWQsXG4gICAgICAgIENvbXBvbmVudDogTk9PUF9DT01QT05FTlQsXG4gICAgICAgIG5leHQ6IE5PT1BfTkVYVCxcbiAgICAgICAgcmVuZGVyOiBOT09QX05FWFQsXG4gICAgICAgIHJlbmRlck5vdEZvdW5kOiBhc3luYyAoZGF0YSkgPT4ge1xuICAgICAgICAgIGN0eC5kYXRhID0gZGF0YTtcbiAgICAgICAgICByZXR1cm4gYXdhaXQgcmVuZGVyTm90Rm91bmQocmVxLCBjdHgpO1xuICAgICAgICB9LFxuICAgICAgICByb3V0ZTogXCJcIixcbiAgICAgICAgZ2V0IHBhdHRlcm4oKSB7XG4gICAgICAgICAgcmV0dXJuIGN0eC5yb3V0ZTtcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YTogdW5kZWZpbmVkLFxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIGF3YWl0IHdpdGhNaWRkbGV3YXJlcyhyZXEsIGN0eCwgaW5uZXIpO1xuICAgIH07XG4gIH1cblxuICAjbWF5YmVCdWlsZFNuYXBzaG90KCk6IEJ1aWxkU25hcHNob3QgfCBudWxsIHtcbiAgICBpZiAoXCJidWlsZFwiIGluIHRoaXMuI2J1aWxkZXIgfHwgdGhpcy4jYnVpbGRlciBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy4jYnVpbGRlcjtcbiAgfVxuXG4gIGFzeW5jIGJ1aWxkU25hcHNob3QoKSB7XG4gICAgaWYgKFwiYnVpbGRcIiBpbiB0aGlzLiNidWlsZGVyKSB7XG4gICAgICBjb25zdCBidWlsZGVyID0gdGhpcy4jYnVpbGRlcjtcbiAgICAgIHRoaXMuI2J1aWxkZXIgPSBidWlsZGVyLmJ1aWxkKCk7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzbmFwc2hvdCA9IGF3YWl0IHRoaXMuI2J1aWxkZXI7XG4gICAgICAgIHRoaXMuI2J1aWxkZXIgPSBzbmFwc2hvdDtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aGlzLiNidWlsZGVyID0gYnVpbGRlcjtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy4jYnVpbGRlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYWxsIHJvdXRlcyByZXF1aXJlZCBieSBGcmVzaCBhcyBhbiBleHRlbmRlZFxuICAgKiBwYXRoLXRvLXJlZ2V4LCB0byBoYW5kbGVyIG1hcHBpbmcuXG4gICAqL1xuICAjaGFuZGxlcnMoXG4gICAgcmVuZGVyTm90Rm91bmQ6IFVua25vd25SZW5kZXJGdW5jdGlvbixcbiAgKToge1xuICAgIGludGVybmFsUm91dGVzOiByb3V0ZXIuUm91dGVzO1xuICAgIHN0YXRpY1JvdXRlczogcm91dGVyLlJvdXRlcztcbiAgICByb3V0ZXM6IHJvdXRlci5Sb3V0ZXM7XG5cbiAgICBvdGhlckhhbmRsZXI6IHJvdXRlci5IYW5kbGVyO1xuICAgIGVycm9ySGFuZGxlcjogcm91dGVyLkVycm9ySGFuZGxlcjtcbiAgfSB7XG4gICAgY29uc3QgaW50ZXJuYWxSb3V0ZXM6IHJvdXRlci5Sb3V0ZXMgPSB7fTtcbiAgICBjb25zdCBzdGF0aWNSb3V0ZXM6IHJvdXRlci5Sb3V0ZXMgPSB7fTtcbiAgICBsZXQgcm91dGVzOiByb3V0ZXIuUm91dGVzID0ge307XG5cbiAgICBjb25zdCBhc3NldFJvdXRlID0gd2l0aEJhc2UoXG4gICAgICBgJHtJTlRFUk5BTF9QUkVGSVh9JHtKU19QUkVGSVh9LyR7QlVJTERfSUR9LzpwYXRoKmAsXG4gICAgICB0aGlzLiNzdGF0ZS5jb25maWcuYmFzZVBhdGgsXG4gICAgKTtcbiAgICBpbnRlcm5hbFJvdXRlc1thc3NldFJvdXRlXSA9IHtcbiAgICAgIGJhc2VSb3V0ZTogdG9CYXNlUm91dGUoYXNzZXRSb3V0ZSksXG4gICAgICBtZXRob2RzOiB7XG4gICAgICAgIGRlZmF1bHQ6IChfcmVxLCBjdHgpID0+IHRoaXMuI2J1bmRsZUFzc2V0Um91dGUoY3R4LnBhcmFtcy5wYXRoKSxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIC8vIEFkZCB0aGUgc3RhdGljIGZpbGUgcm91dGVzLlxuICAgIC8vIGVhY2ggZmlsZXMgaGFzIDIgc3RhdGljIHJvdXRlczpcbiAgICAvLyAtIG9uZSBzZXJ2aW5nIHRoZSBmaWxlIGF0IGl0cyBsb2NhdGlvbiB3aXRob3V0IGEgXCJjYWNoZSBidXJzdGluZ1wiIG1lY2hhbmlzbVxuICAgIC8vIC0gb25lIGNvbnRhaW5pbmcgdGhlIEJVSUxEX0lEIGluIHRoZSBwYXRoIHRoYXQgY2FuIGJlIGNhY2hlZFxuICAgIGZvciAoXG4gICAgICBjb25zdCB7IGxvY2FsVXJsLCBwYXRoLCBzaXplLCBjb250ZW50VHlwZSwgZXRhZyB9IG9mIHRoaXMuI2V4dHJhY3RSZXN1bHRcbiAgICAgICAgLnN0YXRpY0ZpbGVzXG4gICAgKSB7XG4gICAgICBzdGF0aWNSb3V0ZXNbcGF0aC5yZXBsYWNlQWxsKFNFUEFSQVRPUiwgXCIvXCIpXSA9IHtcbiAgICAgICAgYmFzZVJvdXRlOiB0b0Jhc2VSb3V0ZShwYXRoKSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgIFwiSEVBRFwiOiB0aGlzLiNzdGF0aWNGaWxlSGFuZGxlcihcbiAgICAgICAgICAgIGxvY2FsVXJsLFxuICAgICAgICAgICAgc2l6ZSxcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlLFxuICAgICAgICAgICAgZXRhZyxcbiAgICAgICAgICApLFxuICAgICAgICAgIFwiR0VUXCI6IHRoaXMuI3N0YXRpY0ZpbGVIYW5kbGVyKFxuICAgICAgICAgICAgbG9jYWxVcmwsXG4gICAgICAgICAgICBzaXplLFxuICAgICAgICAgICAgY29udGVudFR5cGUsXG4gICAgICAgICAgICBldGFnLFxuICAgICAgICAgICksXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIFRlbGwgcmVuZGVyZXIgYWJvdXQgYWxsIGdsb2JhbGx5IGF2YWlsYWJsZSBpc2xhbmRzXG4gICAgc2V0QWxsSXNsYW5kcyh0aGlzLiNleHRyYWN0UmVzdWx0LmlzbGFuZHMpO1xuXG4gICAgY29uc3QgZGVwZW5kZW5jaWVzRm4gPSAocGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBzbmFwc2hvdCA9IHRoaXMuI21heWJlQnVpbGRTbmFwc2hvdCgpO1xuICAgICAgcmV0dXJuIHNuYXBzaG90Py5kZXBlbmRlbmNpZXMocGF0aCkgPz8gW107XG4gICAgfTtcblxuICAgIGNvbnN0IGdlblJlbmRlciA9IDxEYXRhID0gdW5kZWZpbmVkPihcbiAgICAgIHJvdXRlOiBSb3V0ZTxEYXRhPiB8IFVua25vd25QYWdlIHwgRXJyb3JQYWdlLFxuICAgICAgc3RhdHVzOiBudW1iZXIsXG4gICAgKSA9PiB7XG4gICAgICBjb25zdCBpbXBvcnRzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgaWYgKHRoaXMuI2RldikgaW1wb3J0cy5wdXNoKHRoaXMuI3N0YXRlLmNvbmZpZy5iYXNlUGF0aCArIERFVl9DTElFTlRfVVJMKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHJlcTogUmVxdWVzdCxcbiAgICAgICAgY3R4OiBGcmVzaENvbnRleHQsXG4gICAgICAgIGVycm9yPzogdW5rbm93bixcbiAgICAgICAgY29kZUZyYW1lPzogc3RyaW5nLFxuICAgICAgKSA9PiB7XG4gICAgICAgIHJldHVybiBhc3luYyAoZGF0YT86IERhdGEsIG9wdGlvbnM/OiBSZW5kZXJPcHRpb25zKSA9PiB7XG4gICAgICAgICAgaWYgKHJvdXRlLmNvbXBvbmVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGlzIHBhZ2UgZG9lcyBub3QgaGF2ZSBhIGNvbXBvbmVudCB0byByZW5kZXIuXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBsYXlvdXRzID0gc2VsZWN0U2hhcmVkUm91dGVzKFxuICAgICAgICAgICAgcm91dGUuYmFzZVJvdXRlLFxuICAgICAgICAgICAgdGhpcy4jZXh0cmFjdFJlc3VsdC5sYXlvdXRzLFxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBjdHguZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgICBjdHguZGF0YSA9IGRhdGE7XG4gICAgICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGludGVybmFsUmVuZGVyKHtcbiAgICAgICAgICAgIHJlcXVlc3Q6IHJlcSxcbiAgICAgICAgICAgIGNvbnRleHQ6IGN0eCxcbiAgICAgICAgICAgIHJvdXRlLFxuICAgICAgICAgICAgcGx1Z2luczogdGhpcy4jcGx1Z2lucyxcbiAgICAgICAgICAgIGFwcDogdGhpcy4jZXh0cmFjdFJlc3VsdC5hcHAsXG4gICAgICAgICAgICBsYXlvdXRzLFxuICAgICAgICAgICAgaW1wb3J0cyxcbiAgICAgICAgICAgIGRlcGVuZGVuY2llc0ZuLFxuICAgICAgICAgICAgcmVuZGVyRm46IHRoaXMuI3JlbmRlckZuLFxuICAgICAgICAgICAgY29kZUZyYW1lLFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKHJlc3AgaW5zdGFuY2VvZiBSZXNwb25zZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3A7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHNlbmRSZXNwb25zZShyZXNwLCB7XG4gICAgICAgICAgICBzdGF0dXM6IG9wdGlvbnM/LnN0YXR1cyA/PyBzdGF0dXMsXG4gICAgICAgICAgICBzdGF0dXNUZXh0OiBvcHRpb25zPy5zdGF0dXNUZXh0LFxuICAgICAgICAgICAgaGVhZGVyczogb3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIGlzRGV2OiB0aGlzLiNkZXYsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgIH07XG5cbiAgICBmb3IgKGNvbnN0IHJvdXRlIG9mIHRoaXMuI2V4dHJhY3RSZXN1bHQucm91dGVzKSB7XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuI3N0YXRlLmNvbmZpZy5yb3V0ZXI/LnRyYWlsaW5nU2xhc2ggJiYgcm91dGUucGF0dGVybiAhPSBcIi9cIlxuICAgICAgKSB7XG4gICAgICAgIHJvdXRlLnBhdHRlcm4gKz0gXCIvXCI7XG4gICAgICB9XG4gICAgICBjb25zdCBjcmVhdGVSZW5kZXIgPSBnZW5SZW5kZXIocm91dGUsIFNUQVRVU19DT0RFLk9LKTtcbiAgICAgIGlmICh0eXBlb2Ygcm91dGUuaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJvdXRlc1tyb3V0ZS5wYXR0ZXJuXSA9IHtcbiAgICAgICAgICBiYXNlUm91dGU6IHJvdXRlLmJhc2VSb3V0ZSxcbiAgICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiAocmVxLCBjdHgpID0+IHtcbiAgICAgICAgICAgICAgY3R4LnJlbmRlciA9IGNyZWF0ZVJlbmRlcihyZXEsIGN0eCk7XG4gICAgICAgICAgICAgIHJldHVybiAocm91dGUuaGFuZGxlciBhcyBIYW5kbGVyKShyZXEsIGN0eCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByb3V0ZXNbcm91dGUucGF0dGVybl0gPSB7XG4gICAgICAgICAgYmFzZVJvdXRlOiByb3V0ZS5iYXNlUm91dGUsXG4gICAgICAgICAgbWV0aG9kczoge30sXG4gICAgICAgIH07XG4gICAgICAgIGZvciAoY29uc3QgW21ldGhvZCwgaGFuZGxlcl0gb2YgT2JqZWN0LmVudHJpZXMocm91dGUuaGFuZGxlcikpIHtcbiAgICAgICAgICByb3V0ZXNbcm91dGUucGF0dGVybl0ubWV0aG9kc1ttZXRob2QgYXMgcm91dGVyLktub3duTWV0aG9kXSA9IChcbiAgICAgICAgICAgIHJlcSxcbiAgICAgICAgICAgIGN0eCxcbiAgICAgICAgICApID0+IHtcbiAgICAgICAgICAgIGN0eC5yZW5kZXIgPSBjcmVhdGVSZW5kZXIocmVxLCBjdHgpO1xuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZXIocmVxLCBjdHgpO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgb3RoZXJIYW5kbGVyOiByb3V0ZXIuSGFuZGxlciA9IChyZXEsIGN0eCkgPT4ge1xuICAgICAgY3R4LnJlbmRlciA9IChkYXRhKSA9PiB7XG4gICAgICAgIGN0eC5kYXRhID0gZGF0YTtcbiAgICAgICAgcmV0dXJuIHJlbmRlck5vdEZvdW5kKHJlcSwgY3R4KTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy4jZXh0cmFjdFJlc3VsdC5ub3RGb3VuZC5oYW5kbGVyKHJlcSwgY3R4KTtcbiAgICB9O1xuXG4gICAgY29uc3QgZXJyb3JIYW5kbGVyUmVuZGVyID0gZ2VuUmVuZGVyKFxuICAgICAgdGhpcy4jZXh0cmFjdFJlc3VsdC5lcnJvcixcbiAgICAgIFNUQVRVU19DT0RFLkludGVybmFsU2VydmVyRXJyb3IsXG4gICAgKTtcbiAgICBjb25zdCBlcnJvckhhbmRsZXI6IHJvdXRlci5FcnJvckhhbmRsZXIgPSBhc3luYyAoXG4gICAgICByZXEsXG4gICAgICBjdHgsXG4gICAgICBlcnJvcixcbiAgICApID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgIFwiJWNBbiBlcnJvciBvY2N1cnJlZCBkdXJpbmcgcm91dGUgaGFuZGxpbmcgb3IgcGFnZSByZW5kZXJpbmcuXCIsXG4gICAgICAgIFwiY29sb3I6cmVkXCIsXG4gICAgICApO1xuICAgICAgbGV0IGNvZGVGcmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgICAgaWYgKHRoaXMuI2RldiAmJiBlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIGNvZGVGcmFtZSA9IGF3YWl0IGdldENvZGVGcmFtZShlcnJvcik7XG5cbiAgICAgICAgaWYgKGNvZGVGcmFtZSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoKTtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGNvZGVGcmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuXG4gICAgICBjdHguZXJyb3IgPSBlcnJvcjtcbiAgICAgIGN0eC5yZW5kZXIgPSBlcnJvckhhbmRsZXJSZW5kZXIocmVxLCBjdHgsIGVycm9yLCBjb2RlRnJhbWUpO1xuICAgICAgcmV0dXJuIHRoaXMuI2V4dHJhY3RSZXN1bHQuZXJyb3IuaGFuZGxlcihyZXEsIGN0eCk7XG4gICAgfTtcblxuICAgIGlmICh0aGlzLiNkZXYpIHtcbiAgICAgIGNvbnN0IGRldkVycm9yVXJsID0gd2l0aEJhc2UoXG4gICAgICAgIERFVl9FUlJPUl9PVkVSTEFZX1VSTCxcbiAgICAgICAgdGhpcy4jc3RhdGUuY29uZmlnLmJhc2VQYXRoLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGJhc2VSb3V0ZSA9IHRvQmFzZVJvdXRlKGRldkVycm9yVXJsKTtcbiAgICAgIGludGVybmFsUm91dGVzW2RldkVycm9yVXJsXSA9IHtcbiAgICAgICAgYmFzZVJvdXRlLFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgZGVmYXVsdDogYXN5bmMgKHJlcSwgY3R4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXNwID0gYXdhaXQgaW50ZXJuYWxSZW5kZXIoe1xuICAgICAgICAgICAgICByZXF1ZXN0OiByZXEsXG4gICAgICAgICAgICAgIGNvbnRleHQ6IGN0eCxcbiAgICAgICAgICAgICAgcm91dGU6IHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQ6IEVycm9yT3ZlcmxheSxcbiAgICAgICAgICAgICAgICBpbmhlcml0TGF5b3V0czogZmFsc2UsXG4gICAgICAgICAgICAgICAgYXBwV3JhcHBlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgY3NwOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB1cmw6IHJlcS51cmwsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJlcnJvciBvdmVybGF5IHJvdXRlXCIsXG4gICAgICAgICAgICAgICAgaGFuZGxlcjogKF9yZXE6IFJlcXVlc3QsIGN0eDogRnJlc2hDb250ZXh0KSA9PiBjdHgucmVuZGVyKCksXG4gICAgICAgICAgICAgICAgYmFzZVJvdXRlLFxuICAgICAgICAgICAgICAgIHBhdHRlcm46IGJhc2VSb3V0ZSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcGx1Z2luczogdGhpcy4jcGx1Z2lucyxcbiAgICAgICAgICAgICAgYXBwOiB0aGlzLiNleHRyYWN0UmVzdWx0LmFwcCxcbiAgICAgICAgICAgICAgbGF5b3V0czogW10sXG4gICAgICAgICAgICAgIGltcG9ydHM6IFtdLFxuICAgICAgICAgICAgICBkZXBlbmRlbmNpZXNGbjogKCkgPT4gW10sXG4gICAgICAgICAgICAgIHJlbmRlckZuOiB0aGlzLiNyZW5kZXJGbixcbiAgICAgICAgICAgICAgY29kZUZyYW1lOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKHJlc3AgaW5zdGFuY2VvZiBSZXNwb25zZSkge1xuICAgICAgICAgICAgICByZXR1cm4gcmVzcDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHNlbmRSZXNwb25zZShyZXNwLCB7XG4gICAgICAgICAgICAgIHN0YXR1czogMjAwLFxuICAgICAgICAgICAgICBpc0RldjogdGhpcy4jZGV2LFxuICAgICAgICAgICAgICBzdGF0dXNUZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgIGhlYWRlcnM6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIFRoaXMgcGFnZSBpcyBzaG93biB3aGVuIHRoZSB1c2VyIHVzZXMgdGhlIHRhaWx3aW5kY3NzIHBsdWdpbiBhbmRcbiAgICAvLyBoYXNuJ3QgY29uZmlndXJlZCBBT1QgYnVpbGRzLlxuICAgIGlmIChcbiAgICAgICF0aGlzLiNzdGF0ZS5jb25maWcuZGV2ICYmXG4gICAgICB0aGlzLiNzdGF0ZS5sb2FkU25hcHNob3QgJiYgIXRoaXMuI3N0YXRlLmRpZExvYWRTbmFwc2hvdCAmJlxuICAgICAgdGhpcy4jc3RhdGUuY29uZmlnLnBsdWdpbnMuc29tZSgocGx1Z2luKSA9PiBwbHVnaW4ubmFtZSA9PT0gXCJ0YWlsd2luZFwiKVxuICAgICkge1xuICAgICAgaWYgKERFTk9fREVQTE9ZTUVOVF9JRCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIERvbid0IGZhaWwgaGFyZCBoZXJlIGFuZCBpbnN0ZWFkIHJld3JpdGUgYWxsIHJvdXRlcyB0byBhIHNwZWNpYWxcbiAgICAgICAgLy8gZXJyb3Igcm91dGUuIE90aGVyd2lzZSB0aGUgZmlyc3QgdXNlciBleHBlcmllbmNlIG9mIGRlcGxveWluZyBhXG4gICAgICAgIC8vIEZyZXNoIHByb2plY3Qgd291bGQgYmUgcHJldHR5IGRpc3J1cHRpdmVcbiAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICBcIiVjRXJyb3I6IEFoZWFkIG9mIHRpbWUgYnVpbGRzIG5vdCBjb25maWd1cmVkIGJ1dCByZXF1aXJlZCBieSB0aGUgdGFpbHdpbmRjc3MgcGx1Z2luLlxcblRvIHJlc29sdmUgdGhpcyBlcnJvciwgc2V0IHVwIGFoZWFkIG9mIHRpbWUgYnVpbGRzOiBodHRwczovL2ZyZXNoLmRlbm8uZGV2L2RvY3MvY29uY2VwdHMvYWhlYWQtb2YtdGltZS1idWlsZHNcIixcbiAgICAgICAgICBcImNvbG9yOiByZWRcIixcbiAgICAgICAgKTtcbiAgICAgICAgY29uc29sZS5sb2coKTtcblxuICAgICAgICAvLyBDbGVhciBhbGwgcm91dGVzIHNvIHRoYXQgZXZlcnl0aGluZyByZWRpcmVjdHMgdG8gdGhlIHRhaWx3aW5kXG4gICAgICAgIC8vIGVycm9yIHBhZ2UuXG4gICAgICAgIHJvdXRlcyA9IHt9O1xuXG4gICAgICAgIGNvbnN0IGZyZXNoRXJyb3JQYWdlID0gZ2VuUmVuZGVyKHtcbiAgICAgICAgICBhcHBXcmFwcGVyOiBmYWxzZSxcbiAgICAgICAgICBpbmhlcml0TGF5b3V0czogZmFsc2UsXG4gICAgICAgICAgY29tcG9uZW50OiBUYWlsd2luZEVycm9yUGFnZSxcbiAgICAgICAgICBjc3A6IGZhbHNlLFxuICAgICAgICAgIG5hbWU6IFwidGFpbHdpbmRfZXJyb3Jfcm91dGVcIixcbiAgICAgICAgICBwYXR0ZXJuOiBcIipcIixcbiAgICAgICAgICB1cmw6IFwiXCIsXG4gICAgICAgICAgYmFzZVJvdXRlOiB0b0Jhc2VSb3V0ZShcIipcIiksXG4gICAgICAgICAgaGFuZGxlcjogKF9yZXE6IFJlcXVlc3QsIGN0eDogRnJlc2hDb250ZXh0KSA9PiBjdHgucmVuZGVyKCksXG4gICAgICAgIH0sIFNUQVRVU19DT0RFLkludGVybmFsU2VydmVyRXJyb3IpO1xuICAgICAgICBvdGhlckhhbmRsZXIgPSAocmVxLCBjdHgpID0+IHtcbiAgICAgICAgICBjb25zdCByZW5kZXIgPSBmcmVzaEVycm9yUGFnZShyZXEsIGN0eCk7XG4gICAgICAgICAgcmV0dXJuIHJlbmRlcigpO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTm90IG9uIERlbm8gRGVwbG95LiBUaGUgdXNlciBsaWtlbHkgZm9yZ290IHRvIHJ1biBgZGVubyB0YXNrIGJ1aWxkYFxuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgJyVjTm8gcHJlLWNvbXBpbGVkIHRhaWx3aW5kIHN0eWxlcyBmb3VuZC5cXG5cXG5EaWQgeW91IGZvcmdldCB0byBydW4gXCJkZW5vIHRhc2sgYnVpbGRcIiBwcmlvciB0byBzdGFydGluZyB0aGUgcHJvZHVjdGlvbiBzZXJ2ZXI/JyxcbiAgICAgICAgICBcImNvbG9yOiB5ZWxsb3dcIixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4geyBpbnRlcm5hbFJvdXRlcywgc3RhdGljUm91dGVzLCByb3V0ZXMsIG90aGVySGFuZGxlciwgZXJyb3JIYW5kbGVyIH07XG4gIH1cblxuICAjc3RhdGljRmlsZUhhbmRsZXIoXG4gICAgbG9jYWxVcmw6IFVSTCxcbiAgICBzaXplOiBudW1iZXIsXG4gICAgY29udGVudFR5cGU6IHN0cmluZyxcbiAgICBldGFnOiBzdHJpbmcsXG4gICk6IHJvdXRlci5NYXRjaEhhbmRsZXIge1xuICAgIHJldHVybiBhc3luYyAocmVxOiBSZXF1ZXN0KSA9PiB7XG4gICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHJlcS51cmwpO1xuICAgICAgY29uc3Qga2V5ID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoQVNTRVRfQ0FDSEVfQlVTVF9LRVkpO1xuICAgICAgaWYgKGtleSAhPT0gbnVsbCAmJiBCVUlMRF9JRCAhPT0ga2V5KSB7XG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuZGVsZXRlKEFTU0VUX0NBQ0hFX0JVU1RfS0VZKTtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSB1cmwucGF0aG5hbWUgKyB1cmwuc2VhcmNoO1xuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtcbiAgICAgICAgICBzdGF0dXM6IDMwNyxcbiAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSGVhZGVycyh7XG4gICAgICAgIFwiY29udGVudC10eXBlXCI6IGNvbnRlbnRUeXBlLFxuICAgICAgICBldGFnLFxuICAgICAgICB2YXJ5OiBcIklmLU5vbmUtTWF0Y2hcIixcbiAgICAgIH0pO1xuICAgICAgaWYgKGtleSAhPT0gbnVsbCkge1xuICAgICAgICBoZWFkZXJzLnNldChcIkNhY2hlLUNvbnRyb2xcIiwgXCJwdWJsaWMsIG1heC1hZ2U9MzE1MzYwMDAsIGltbXV0YWJsZVwiKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGlmTm9uZU1hdGNoID0gcmVxLmhlYWRlcnMuZ2V0KFwiaWYtbm9uZS1tYXRjaFwiKTtcbiAgICAgIGlmIChpZk5vbmVNYXRjaCA9PT0gZXRhZyB8fCBpZk5vbmVNYXRjaCA9PT0gXCJXL1wiICsgZXRhZykge1xuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHsgc3RhdHVzOiAzMDQsIGhlYWRlcnMgfSk7XG4gICAgICB9IGVsc2UgaWYgKHJlcS5tZXRob2QgPT09IFwiSEVBRFwiKSB7XG4gICAgICAgIGhlYWRlcnMuc2V0KFwiY29udGVudC1sZW5ndGhcIiwgU3RyaW5nKHNpemUpKTtcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7IHN0YXR1czogMjAwLCBoZWFkZXJzIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZmlsZSA9IGF3YWl0IERlbm8ub3Blbihsb2NhbFVybCk7XG4gICAgICAgIGhlYWRlcnMuc2V0KFwiY29udGVudC1sZW5ndGhcIiwgU3RyaW5nKHNpemUpKTtcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShmaWxlLnJlYWRhYmxlLCB7IGhlYWRlcnMgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jICNidW5kbGVBc3NldFJvdXRlKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICBjb25zdCBzbmFwc2hvdCA9IGF3YWl0IHRoaXMuYnVpbGRTbmFwc2hvdCgpO1xuICAgIGNvbnN0IGNvbnRlbnRzID0gYXdhaXQgc25hcHNob3QucmVhZChmaWxlUGF0aCk7XG4gICAgaWYgKCFjb250ZW50cykgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7IHN0YXR1czogNDA0IH0pO1xuXG4gICAgY29uc3QgaGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgIFwiQ2FjaGUtQ29udHJvbFwiOiB0aGlzLiNkZXZcbiAgICAgICAgPyBcIm5vLWNhY2hlLCBuby1zdG9yZSwgbWF4LWFnZT0wLCBtdXN0LXJldmFsaWRhdGVcIlxuICAgICAgICA6IFwicHVibGljLCBtYXgtYWdlPTYwNDgwMCwgaW1tdXRhYmxlXCIsXG4gICAgfTtcblxuICAgIGNvbnN0IHR5cGUgPSBjb250ZW50VHlwZShleHRuYW1lKGZpbGVQYXRoKSk7XG4gICAgaWYgKHR5cGUpIGhlYWRlcnNbXCJDb250ZW50LVR5cGVcIl0gPSB0eXBlO1xuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShjb250ZW50cywge1xuICAgICAgc3RhdHVzOiAyMDAsXG4gICAgICBoZWFkZXJzLFxuICAgIH0pO1xuICB9XG59XG5cbmNvbnN0IGNyZWF0ZVJlbmRlck5vdEZvdW5kID0gKFxuICBleHRyYWN0UmVzdWx0OiBGc0V4dHJhY3RSZXN1bHQsXG4gIGRldjogYm9vbGVhbixcbiAgcGx1Z2luczogUGx1Z2luPFJlY29yZDxzdHJpbmcsIHVua25vd24+PltdLFxuICByZW5kZXJGdW5jdGlvbjogUmVuZGVyRnVuY3Rpb24sXG4gIGJ1aWxkU25hcHNob3Q6IEJ1aWxkU25hcHNob3QgfCBudWxsLFxuKTogVW5rbm93blJlbmRlckZ1bmN0aW9uID0+IHtcbiAgY29uc3QgZGVwZW5kZW5jaWVzRm4gPSAocGF0aDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3Qgc25hcHNob3QgPSBidWlsZFNuYXBzaG90O1xuICAgIHJldHVybiBzbmFwc2hvdD8uZGVwZW5kZW5jaWVzKHBhdGgpID8/IFtdO1xuICB9O1xuXG4gIHJldHVybiBhc3luYyAocmVxLCBjdHgpID0+IHtcbiAgICBjb25zdCBub3RGb3VuZCA9IGV4dHJhY3RSZXN1bHQubm90Rm91bmQ7XG4gICAgaWYgKCFub3RGb3VuZC5jb21wb25lbnQpIHtcbiAgICAgIHJldHVybiBzZW5kUmVzcG9uc2UoW1wiTm90IGZvdW5kLlwiLCBcIlwiLCB1bmRlZmluZWRdLCB7XG4gICAgICAgIHN0YXR1czogU1RBVFVTX0NPREUuTm90Rm91bmQsXG4gICAgICAgIGlzRGV2OiBkZXYsXG4gICAgICAgIHN0YXR1c1RleHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgaGVhZGVyczogdW5kZWZpbmVkLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgbGF5b3V0cyA9IHNlbGVjdFNoYXJlZFJvdXRlcyhcbiAgICAgIFJPT1RfQkFTRV9ST1VURSxcbiAgICAgIGV4dHJhY3RSZXN1bHQubGF5b3V0cyxcbiAgICApO1xuXG4gICAgY29uc3QgaW1wb3J0czogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCByZXNwID0gYXdhaXQgaW50ZXJuYWxSZW5kZXIoe1xuICAgICAgcmVxdWVzdDogcmVxLFxuICAgICAgY29udGV4dDogY3R4LFxuICAgICAgcm91dGU6IG5vdEZvdW5kLFxuICAgICAgcGx1Z2luczogcGx1Z2lucyxcbiAgICAgIGFwcDogZXh0cmFjdFJlc3VsdC5hcHAsXG4gICAgICBsYXlvdXRzLFxuICAgICAgaW1wb3J0cyxcbiAgICAgIGRlcGVuZGVuY2llc0ZuLFxuICAgICAgcmVuZGVyRm46IHJlbmRlckZ1bmN0aW9uLFxuICAgIH0pO1xuXG4gICAgaWYgKHJlc3AgaW5zdGFuY2VvZiBSZXNwb25zZSkge1xuICAgICAgcmV0dXJuIHJlc3A7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbmRSZXNwb25zZShyZXNwLCB7XG4gICAgICBzdGF0dXM6IFNUQVRVU19DT0RFLk5vdEZvdW5kLFxuICAgICAgaXNEZXY6IGRldixcbiAgICAgIHN0YXR1c1RleHQ6IHVuZGVmaW5lZCxcbiAgICAgIGhlYWRlcnM6IHVuZGVmaW5lZCxcbiAgICB9KTtcbiAgfTtcbn07XG5cbi8vIE5vcm1hbGl6ZSBhIHBhdGggZm9yIHVzZSBpbiBhIFVSTC4gUmV0dXJucyBudWxsIGlmIHRoZSBwYXRoIGlzIHVucGFyc2FibGUuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplVVJMUGF0aChwYXRoOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXRoVXJsID0gbmV3IFVSTChcImZpbGU6Ly8vXCIpO1xuICAgIHBhdGhVcmwucGF0aG5hbWUgPSBwYXRoO1xuICAgIHJldHVybiBwYXRoVXJsLnBhdGhuYW1lO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXJpYWxpemVDU1BEaXJlY3RpdmVzKGNzcDogQ29udGVudFNlY3VyaXR5UG9saWN5RGlyZWN0aXZlcyk6IHN0cmluZyB7XG4gIHJldHVybiBPYmplY3QuZW50cmllcyhjc3ApXG4gICAgLmZpbHRlcigoW19rZXksIHZhbHVlXSkgPT4gdmFsdWUgIT09IHVuZGVmaW5lZClcbiAgICAubWFwKChbaywgdl06IFtzdHJpbmcsIHN0cmluZyB8IHN0cmluZ1tdXSkgPT4ge1xuICAgICAgLy8gVHVybiBjYW1lbCBjYXNlIGludG8gc25ha2UgY2FzZS5cbiAgICAgIGNvbnN0IGtleSA9IGsucmVwbGFjZSgvW0EtWl0vZywgKG0pID0+IGAtJHttLnRvTG93ZXJDYXNlKCl9YCk7XG4gICAgICBjb25zdCB2YWx1ZSA9IEFycmF5LmlzQXJyYXkodikgPyB2LmpvaW4oXCIgXCIpIDogdjtcbiAgICAgIHJldHVybiBgJHtrZXl9ICR7dmFsdWV9YDtcbiAgICB9KVxuICAgIC5qb2luKFwiOyBcIik7XG59XG5cbmZ1bmN0aW9uIGNvbGxlY3RFbnRyeXBvaW50cyhcbiAgZGV2OiBib29sZWFuLFxuICBpc2xhbmRzOiBJc2xhbmRbXSxcbiAgcGx1Z2luczogUGx1Z2luW10sXG4pOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcbiAgY29uc3QgZW50cnlwb2ludEJhc2UgPSBcIi4uL3J1bnRpbWUvZW50cnlwb2ludHNcIjtcbiAgY29uc3QgZW50cnlQb2ludHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgbWFpbjogZGV2XG4gICAgICA/IGltcG9ydC5tZXRhLnJlc29sdmUoYCR7ZW50cnlwb2ludEJhc2V9L21haW5fZGV2LnRzYClcbiAgICAgIDogaW1wb3J0Lm1ldGEucmVzb2x2ZShgJHtlbnRyeXBvaW50QmFzZX0vbWFpbi50c2ApLFxuICAgIGRlc2VyaWFsaXplcjogaW1wb3J0Lm1ldGEucmVzb2x2ZShgJHtlbnRyeXBvaW50QmFzZX0vZGVzZXJpYWxpemVyLnRzYCksXG4gIH07XG5cbiAgaWYgKGRldikge1xuICAgIGVudHJ5UG9pbnRzLmZyZXNoX2Rldl9jbGllbnQgPSBpbXBvcnQubWV0YS5yZXNvbHZlKFxuICAgICAgYCR7ZW50cnlwb2ludEJhc2V9L2NsaWVudC50c2AsXG4gICAgKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgaW1wb3J0Lm1ldGEucmVzb2x2ZShcIkBwcmVhY3Qvc2lnbmFsc1wiKTtcbiAgICBlbnRyeVBvaW50cy5zaWduYWxzID0gaW1wb3J0Lm1ldGEucmVzb2x2ZShgJHtlbnRyeXBvaW50QmFzZX0vc2lnbmFscy50c2ApO1xuICB9IGNhdGNoIHtcbiAgICAvLyBAcHJlYWN0L3NpZ25hbHMgaXMgbm90IGluIHRoZSBpbXBvcnQgbWFwXG4gIH1cblxuICBmb3IgKGNvbnN0IGlzbGFuZCBvZiBpc2xhbmRzKSB7XG4gICAgZW50cnlQb2ludHNbYGlzbGFuZC0ke2lzbGFuZC5uYW1lfWBdID0gaXNsYW5kLnVybDtcbiAgfVxuXG4gIGZvciAoY29uc3QgcGx1Z2luIG9mIHBsdWdpbnMpIHtcbiAgICBmb3IgKGNvbnN0IFtuYW1lLCB1cmxdIG9mIE9iamVjdC5lbnRyaWVzKHBsdWdpbi5lbnRyeXBvaW50cyA/PyB7fSkpIHtcbiAgICAgIGVudHJ5UG9pbnRzW2BwbHVnaW4tJHtwbHVnaW4ubmFtZX0tJHtuYW1lfWBdID0gdXJsO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBlbnRyeVBvaW50cztcbn1cblxuZnVuY3Rpb24gc2VuZFJlc3BvbnNlKFxuICByZXNwOiBbc3RyaW5nLCBzdHJpbmcsIENvbnRlbnRTZWN1cml0eVBvbGljeSB8IHVuZGVmaW5lZF0sXG4gIG9wdGlvbnM6IHtcbiAgICBzdGF0dXM6IG51bWJlcjtcbiAgICBzdGF0dXNUZXh0OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgaGVhZGVycz86IEhlYWRlcnNJbml0O1xuICAgIGlzRGV2OiBib29sZWFuO1xuICB9LFxuKSB7XG4gIGNvbnN0IFtib2R5LCB1dWlkLCBjc3BdID0gcmVzcDtcbiAgY29uc3QgaGVhZGVyczogSGVhZGVycyA9IG5ldyBIZWFkZXJzKHtcbiAgICBcImNvbnRlbnQtdHlwZVwiOiBcInRleHQvaHRtbDsgY2hhcnNldD11dGYtOFwiLFxuICAgIFwieC1mcmVzaC11dWlkXCI6IHV1aWQsXG4gIH0pO1xuXG4gIGlmIChjc3ApIHtcbiAgICBpZiAob3B0aW9ucy5pc0Rldikge1xuICAgICAgY3NwLmRpcmVjdGl2ZXMuY29ubmVjdFNyYyA9IFtcbiAgICAgICAgLi4uKGNzcC5kaXJlY3RpdmVzLmNvbm5lY3RTcmMgPz8gW10pLFxuICAgICAgICBTRUxGLFxuICAgICAgXTtcbiAgICB9XG4gICAgY29uc3QgZGlyZWN0aXZlID0gc2VyaWFsaXplQ1NQRGlyZWN0aXZlcyhjc3AuZGlyZWN0aXZlcyk7XG4gICAgaWYgKGNzcC5yZXBvcnRPbmx5KSB7XG4gICAgICBoZWFkZXJzLnNldChcImNvbnRlbnQtc2VjdXJpdHktcG9saWN5LXJlcG9ydC1vbmx5XCIsIGRpcmVjdGl2ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhlYWRlcnMuc2V0KFwiY29udGVudC1zZWN1cml0eS1wb2xpY3lcIiwgZGlyZWN0aXZlKTtcbiAgICB9XG4gIH1cblxuICBpZiAob3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkob3B0aW9ucy5oZWFkZXJzKSkge1xuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2Ygb3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKGtleSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAob3B0aW9ucy5oZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgICAgb3B0aW9ucy5oZWFkZXJzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoa2V5LCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMob3B0aW9ucy5oZWFkZXJzKSkge1xuICAgICAgICBoZWFkZXJzLmFwcGVuZChrZXksIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFJlc3BvbnNlKGJvZHksIHtcbiAgICBzdGF0dXM6IG9wdGlvbnMuc3RhdHVzLFxuICAgIHN0YXR1c1RleHQ6IG9wdGlvbnMuc3RhdHVzVGV4dCxcbiAgICBoZWFkZXJzLFxuICB9KTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLFdBQVcsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsUUFBUSxZQUFZO0FBQ3pFLFlBQVksWUFBWSxjQUFjO0FBRXRDLFNBQ0UsU0FBUyxFQUNULGNBQWMsRUFDZCxxQkFBcUIsRUFDckIsU0FBUyxRQUNKLGlCQUFpQjtBQUN4QixTQUFTLFFBQVEsRUFBRSxrQkFBa0IsUUFBUSxnQkFBZ0I7QUFlN0QsU0FBUyxVQUFVLGNBQWMsUUFBUSxjQUFjO0FBQ3ZELFNBR0UsSUFBSSxRQUNDLG9CQUFvQjtBQUMzQixTQUFTLG9CQUFvQixFQUFFLGVBQWUsUUFBUSxzQkFBc0I7QUFDNUUsU0FBaUMsY0FBYyxRQUFRLGtCQUFrQjtBQUN6RSxTQUFTLGFBQWEsUUFBUSw4QkFBOEI7QUFDNUQsU0FBUyxZQUFZLFFBQVEsa0JBQWtCO0FBQy9DLFNBQVMscUJBQXFCLFFBQVEsY0FBYztBQUNwRCxTQUNFLGtCQUFrQixFQUNsQixlQUFlLEVBQ2Ysa0JBQWtCLEVBQ2xCLFdBQVcsUUFDTixlQUFlO0FBQ3RCLFNBQVMsYUFBYSxRQUF5QixrQkFBa0I7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
// denoCacheMetadata=10852723229034476476,13458448871169791155