import { dirname, join } from "jsr:@std/path@^1.0.6";
import { NativeLoader } from "./loader_native.ts";
import { PortableLoader } from "./loader_portable.ts";
import { findWorkspace, isInNodeModules } from "./shared.ts";
import { esbuildResolutionToURL, isNodeModulesResolution, urlToEsbuildResolution } from "./shared.ts";
const LOADERS = [
  "native",
  "portable"
];
/** The default loader to use. */ export const DEFAULT_LOADER = await Deno.permissions.query({
  name: "run"
}).then((res)=>res.state !== "granted") ? "portable" : "native";
const BUILTIN_NODE_MODULES = new Set([
  "assert",
  "assert/strict",
  "async_hooks",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "constants",
  "crypto",
  "dgram",
  "diagnostics_channel",
  "dns",
  "dns/promises",
  "domain",
  "events",
  "fs",
  "fs/promises",
  "http",
  "http2",
  "https",
  "module",
  "net",
  "os",
  "path",
  "path/posix",
  "path/win32",
  "perf_hooks",
  "process",
  "punycode",
  "querystring",
  "repl",
  "readline",
  "stream",
  "stream/consumers",
  "stream/promises",
  "stream/web",
  "string_decoder",
  "sys",
  "test",
  "timers",
  "timers/promises",
  "tls",
  "tty",
  "url",
  "util",
  "util/types",
  "v8",
  "vm",
  "worker_threads",
  "zlib"
]);
/**
 * The Deno loader plugin for esbuild. This plugin will load fully qualified
 * `file`, `http`, `https`, and `data` URLs.
 *
 * **Note** that this plugin does not do relative->absolute specifier
 * resolution, or import map resolution. You must use the `denoResolverPlugin`
 * _before_ the `denoLoaderPlugin` to do that.
 *
 * This plugin can be backed by two different loaders, the `native` loader and
 * the `portable` loader.
 *
 * ### Native Loader
 *
 * The native loader shells out to the Deno executable under the hood to load
 * files. Requires `--allow-read` and `--allow-run`. In this mode the download
 * cache is shared with the Deno executable. This mode respects deno.lock,
 * DENO_DIR, DENO_AUTH_TOKENS, and all similar loading configuration. Files are
 * cached on disk in the same Deno cache as the Deno executable, and will not be
 * re-downloaded on subsequent builds.
 *
 * NPM specifiers can be used in the native loader without requiring a local
 * `node_modules` directory. NPM packages are resolved, downloaded, cached, and
 * loaded in the same way as the Deno executable does.
 *
 * JSR specifiers can be used without restrictions in the native loader. To
 * ensure dependencies are de-duplicated correctly, it is recommended to use a
 * lockfile.
 *
 * ### Portable Loader
 *
 * The portable loader does module downloading and caching with only Web APIs.
 * Requires `--allow-read` and/or `--allow-net`. This mode does not respect
 * deno.lock, DENO_DIR, DENO_AUTH_TOKENS, or any other loading configuration. It
 * does not cache downloaded files. It will re-download files on every build.
 *
 * NPM specifiers can be used in the portable loader, but require a local
 * `node_modules` directory. The `node_modules` directory must be created prior
 * using Deno's `--node-modules-dir` flag.
 *
 * JSR specifiers require a lockfile to be present to resolve.
 */ export function denoLoaderPlugin(options = {}) {
  const loader = options.loader ?? DEFAULT_LOADER;
  if (LOADERS.indexOf(loader) === -1) {
    throw new Error(`Invalid loader: ${loader}`);
  }
  return {
    name: "deno-loader",
    setup (build) {
      const cwd = build.initialOptions.absWorkingDir ?? Deno.cwd();
      let nodeModulesDir = null;
      let loaderImpl;
      const packageIdByNodeModules = new Map();
      build.onStart(function onStart() {
        loaderImpl?.[Symbol.dispose]?.();
        loaderImpl = undefined;
        packageIdByNodeModules.clear();
        let nodeModulesDirOpt = options.nodeModulesDir;
        let lockPath = options.lockPath;
        if (nodeModulesDirOpt === undefined || loader === "portable" && lockPath === undefined) {
          const workspace = findWorkspace(cwd, build.initialOptions.entryPoints, options.configPath);
          try {
            if (nodeModulesDirOpt === undefined) {
              nodeModulesDirOpt = workspace.node_modules_dir();
            }
            if (loader === "portable" && lockPath === undefined) {
              lockPath = workspace.lock_path();
            }
          } finally{
            workspace.free();
          }
        }
        if (nodeModulesDirOpt === "auto" || nodeModulesDirOpt === "manual") {
          nodeModulesDir = join(cwd, "node_modules");
        }
        switch(loader){
          case "native":
            loaderImpl = new NativeLoader({
              infoOptions: {
                cwd,
                config: options.configPath,
                importMap: options.importMapURL,
                lock: options.lockPath,
                nodeModulesDir: nodeModulesDirOpt
              }
            });
            break;
          case "portable":
            {
              loaderImpl = new PortableLoader({
                lock: lockPath
              });
            }
        }
      });
      async function onResolve(args) {
        if (isNodeModulesResolution(args)) {
          if (BUILTIN_NODE_MODULES.has(args.path) || BUILTIN_NODE_MODULES.has("node:" + args.path)) {
            return {
              path: args.path,
              external: true
            };
          }
          if (nodeModulesDir !== null) {
            return undefined;
          } else if (loaderImpl.nodeModulesDirForPackage && loaderImpl.packageIdFromNameInPackage) {
            let parentPackageId;
            let path = args.importer;
            while(true){
              const packageId = packageIdByNodeModules.get(path);
              if (packageId) {
                parentPackageId = packageId;
                break;
              }
              const pathBefore = path;
              path = dirname(path);
              if (path === pathBefore) break;
            }
            if (!parentPackageId) {
              throw new Error(`Could not find package ID for importer: ${args.importer}`);
            }
            if (args.path.startsWith(".")) {
              return undefined;
            } else {
              let packageName;
              let pathParts;
              if (args.path.startsWith("@")) {
                const [scope, name, ...rest] = args.path.split("/");
                packageName = `${scope}/${name}`;
                pathParts = rest;
              } else {
                const [name, ...rest] = args.path.split("/");
                packageName = name;
                pathParts = rest;
              }
              const packageId = loaderImpl.packageIdFromNameInPackage(packageName, parentPackageId);
              const id = packageId ?? parentPackageId;
              const resolveDir = await loaderImpl.nodeModulesDirForPackage(id);
              packageIdByNodeModules.set(resolveDir, id);
              const path = [
                packageName,
                ...pathParts
              ].join("/");
              return await build.resolve(path, {
                kind: args.kind,
                resolveDir,
                importer: args.importer
              });
            }
          } else {
            throw new Error(`To use "npm:" specifiers, you must specify 'nodeModulesDir: "manual"', or use 'loader: "native"'.`);
          }
        }
        const specifier = esbuildResolutionToURL(args);
        // Once we have an absolute path, let the loader resolver figure out
        // what to do with it.
        const res = await loaderImpl.resolve(specifier);
        switch(res.kind){
          case "esm":
            {
              const { specifier } = res;
              return urlToEsbuildResolution(specifier);
            }
          case "npm":
            {
              let resolveDir;
              if (nodeModulesDir !== null) {
                resolveDir = nodeModulesDir;
              } else if (loaderImpl.nodeModulesDirForPackage) {
                resolveDir = await loaderImpl.nodeModulesDirForPackage(res.packageId);
                packageIdByNodeModules.set(resolveDir, res.packageId);
              } else {
                throw new Error(`To use "npm:" specifiers, you must specify 'nodeModulesDir: "manual"', or use 'loader: "native"'.`);
              }
              const path = `${res.packageName}${res.path ?? ""}`;
              return await build.resolve(path, {
                kind: args.kind,
                resolveDir,
                importer: args.importer
              });
            }
          case "node":
            {
              return {
                path: res.path,
                external: true
              };
            }
        }
      }
      build.onResolve({
        filter: /.*/,
        namespace: "file"
      }, onResolve);
      build.onResolve({
        filter: /.*/,
        namespace: "http"
      }, onResolve);
      build.onResolve({
        filter: /.*/,
        namespace: "https"
      }, onResolve);
      build.onResolve({
        filter: /.*/,
        namespace: "data"
      }, onResolve);
      build.onResolve({
        filter: /.*/,
        namespace: "npm"
      }, onResolve);
      build.onResolve({
        filter: /.*/,
        namespace: "jsr"
      }, onResolve);
      build.onResolve({
        filter: /.*/,
        namespace: "node"
      }, onResolve);
      function onLoad(args) {
        if (args.namespace === "file" && isInNodeModules(args.path)) {
          // inside node_modules, just let esbuild do it's thing
          return undefined;
        }
        const specifier = esbuildResolutionToURL(args);
        return loaderImpl.loadEsm(specifier);
      }
      // TODO(lucacasonato): once https://github.com/evanw/esbuild/pull/2968 is fixed, remove the catch all "file" handler
      build.onLoad({
        filter: /.*/,
        namespace: "file"
      }, onLoad);
      build.onLoad({
        filter: /.*/,
        namespace: "http"
      }, onLoad);
      build.onLoad({
        filter: /.*/,
        namespace: "https"
      }, onLoad);
      build.onLoad({
        filter: /.*/,
        namespace: "data"
      }, onLoad);
    }
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BsdWNhL2VzYnVpbGQtZGVuby1sb2FkZXIvMC4xMS4wL3NyYy9wbHVnaW5fZGVub19sb2FkZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgKiBhcyBlc2J1aWxkIGZyb20gXCIuL2VzYnVpbGRfdHlwZXMudHNcIjtcbmltcG9ydCB7IGRpcm5hbWUsIGpvaW4gfSBmcm9tIFwianNyOkBzdGQvcGF0aEBeMS4wLjZcIjtcbmltcG9ydCB7IE5hdGl2ZUxvYWRlciB9IGZyb20gXCIuL2xvYWRlcl9uYXRpdmUudHNcIjtcbmltcG9ydCB7IFBvcnRhYmxlTG9hZGVyIH0gZnJvbSBcIi4vbG9hZGVyX3BvcnRhYmxlLnRzXCI7XG5pbXBvcnQgeyBmaW5kV29ya3NwYWNlLCBpc0luTm9kZU1vZHVsZXMgfSBmcm9tIFwiLi9zaGFyZWQudHNcIjtcbmltcG9ydCB7XG4gIGVzYnVpbGRSZXNvbHV0aW9uVG9VUkwsXG4gIGlzTm9kZU1vZHVsZXNSZXNvbHV0aW9uLFxuICB0eXBlIExvYWRlcixcbiAgdXJsVG9Fc2J1aWxkUmVzb2x1dGlvbixcbn0gZnJvbSBcIi4vc2hhcmVkLnRzXCI7XG5cbi8qKiBPcHRpb25zIGZvciB0aGUge0BsaW5rIGRlbm9Mb2FkZXJQbHVnaW59LiAqL1xuZXhwb3J0IGludGVyZmFjZSBEZW5vTG9hZGVyUGx1Z2luT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBTcGVjaWZ5IHdoaWNoIGxvYWRlciB0byB1c2UuIEJ5IGRlZmF1bHQgdGhpcyB3aWxsIHVzZSB0aGUgYG5hdGl2ZWAgbG9hZGVyLFxuICAgKiB1bmxlc3MgdGhlIGAtLWFsbG93LXJ1bmAgcGVybWlzc2lvbiBoYXMgbm90IGJlZW4gZ2l2ZW4uXG4gICAqXG4gICAqIFNlZSB7QGxpbmsgZGVub0xvYWRlclBsdWdpbn0gZm9yIG1vcmUgaW5mb3JtYXRpb24gb24gdGhlIGRpZmZlcmVudCBsb2FkZXJzLlxuICAgKi9cbiAgbG9hZGVyPzogXCJuYXRpdmVcIiB8IFwicG9ydGFibGVcIjtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgcGF0aCB0byBhIGRlbm8uanNvbiBjb25maWcgZmlsZSB0byB1c2UuIFRoaXMgaXMgZXF1aXZhbGVudCB0b1xuICAgKiB0aGUgYC0tY29uZmlnYCBmbGFnIHRvIHRoZSBEZW5vIGV4ZWN1dGFibGUuIFRoaXMgcGF0aCBtdXN0IGJlIGFic29sdXRlLlxuICAgKlxuICAgKiBOT1RFOiBJbXBvcnQgbWFwcyBpbiB0aGUgY29uZmlnIGZpbGUgYXJlIG5vdCB1c2VkIHRvIGluZm9ybSByZXNvbHV0aW9uLCBhc1xuICAgKiB0aGlzIGhhcyBhbHJlYWR5IGJlZW4gZG9uZSBieSB0aGUgYGRlbm9SZXNvbHZlclBsdWdpbmAuIFRoaXMgb3B0aW9uIGlzIG9ubHlcbiAgICogdXNlZCB3aGVuIHNwZWNpZnlpbmcgYGxvYWRlcjogXCJuYXRpdmVcImAgdG8gbW9yZSBlZmZpY2llbnRseSBsb2FkIG1vZHVsZXNcbiAgICogZnJvbSB0aGUgY2FjaGUuIFdoZW4gc3BlY2lmeWluZyBgbG9hZGVyOiBcIm5hdGl2ZVwiYCwgdGhpcyBvcHRpb24gbXVzdCBiZSBpblxuICAgKiBzeW5jIHdpdGggdGhlIGBjb25maWdQYXRoYCBvcHRpb24gZm9yIGBkZW5vUmVzb2x2ZXJQbHVnaW5gLlxuICAgKlxuICAgKiBJZiBub3Qgc3BlY2lmaWVkLCB0aGUgcGx1Z2luIHdpbGwgYXR0ZW1wdCB0byBmaW5kIHRoZSBuZWFyZXN0IGRlbm8uanNvbiBhbmRcbiAgICogdXNlIHRoYXQuIElmIHRoZSBkZW5vLmpzb24gaXMgcGFydCBvZiBhIHdvcmtzcGFjZSwgdGhlIHBsdWdpbiB3aWxsXG4gICAqIGF1dG9tYXRpY2FsbHkgZmluZCB0aGUgd29ya3NwYWNlIHJvb3QuXG4gICAqL1xuICBjb25maWdQYXRoPzogc3RyaW5nO1xuICAvKipcbiAgICogU3BlY2lmeSBhIFVSTCB0byBhbiBpbXBvcnQgbWFwIGZpbGUgdG8gdXNlIHdoZW4gcmVzb2x2aW5nIGltcG9ydFxuICAgKiBzcGVjaWZpZXJzLiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gdGhlIGAtLWltcG9ydC1tYXBgIGZsYWcgdG8gdGhlIERlbm9cbiAgICogZXhlY3V0YWJsZS4gVGhpcyBVUkwgbWF5IGJlIHJlbW90ZSBvciBhIGxvY2FsIGZpbGUgVVJMLlxuICAgKlxuICAgKiBJZiB0aGlzIG9wdGlvbiBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgZGVuby5qc29uIGNvbmZpZyBmaWxlIGlzIGNvbnN1bHRlZCB0b1xuICAgKiBkZXRlcm1pbmUgd2hhdCBpbXBvcnQgbWFwIHRvIHVzZSwgaWYgYW55LlxuICAgKlxuICAgKiBOT1RFOiBJbXBvcnQgbWFwcyBpbiB0aGUgY29uZmlnIGZpbGUgYXJlIG5vdCB1c2VkIHRvIGluZm9ybSByZXNvbHV0aW9uLCBhc1xuICAgKiB0aGlzIGhhcyBhbHJlYWR5IGJlZW4gZG9uZSBieSB0aGUgYGRlbm9SZXNvbHZlclBsdWdpbmAuIFRoaXMgb3B0aW9uIGlzIG9ubHlcbiAgICogdXNlZCB3aGVuIHNwZWNpZnlpbmcgYGxvYWRlcjogXCJuYXRpdmVcImAgdG8gbW9yZSBlZmZpY2llbnRseSBsb2FkIG1vZHVsZXNcbiAgICogZnJvbSB0aGUgY2FjaGUuIFdoZW4gc3BlY2lmeWluZyBgbG9hZGVyOiBcIm5hdGl2ZVwiYCwgdGhpcyBvcHRpb24gbXVzdCBiZSBpblxuICAgKiBzeW5jIHdpdGggdGhlIGBpbXBvcnRNYXBVUkxgIG9wdGlvbiBmb3IgYGRlbm9SZXNvbHZlclBsdWdpbmAuXG4gICAqL1xuICBpbXBvcnRNYXBVUkw/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSBwYXRoIHRvIGEgbG9jayBmaWxlIHRvIHVzZS4gVGhpcyBpcyBlcXVpdmFsZW50IHRvIHRoZSBgLS1sb2NrYFxuICAgKiBmbGFnIHRvIHRoZSBEZW5vIGV4ZWN1dGFibGUuIFRoaXMgcGF0aCBtdXN0IGJlIGFic29sdXRlLlxuICAgKlxuICAgKiBJZiB0aGlzIG9wdGlvbiBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgZGVuby5qc29uIGNvbmZpZyBmaWxlIGlzIGNvbnN1bHRlZCB0b1xuICAgKiBkZXRlcm1pbmUgd2hhdCBpbXBvcnQgbWFwIHRvIHVzZSwgaWYgYW55LlxuICAgKlxuICAgKiBBIGxvY2tmaWxlIG11c3QgYmUgcHJlc2VudCB0byByZXNvbHZlIGBqc3I6YCBzcGVjaWZpZXJzIHdpdGggdGhlIGBwb3J0YWJsZWBcbiAgICogbG9hZGVyLiBXaGVuIHVzaW5nIHRoZSBgbmF0aXZlYCBsb2FkZXIsIGEgbG9ja2ZpbGUgaXMgbm90IHJlcXVpcmVkLCBidXQgdG9cbiAgICogZW5zdXJlIGRlcGVuZGVuY2llcyBhcmUgZGUtZHVwbGljYXRlZCBjb3JyZWN0bHksIGl0IGlzIHJlY29tbWVuZGVkIHRvIHVzZSBhXG4gICAqIGxvY2tmaWxlLlxuICAgKlxuICAgKiBOT1RFOiB3aGVuIHVzaW5nIGBsb2FkZXI6IFwicG9ydGFibGVcImAsIGludGVncml0eSBjaGVja3MgYXJlIG5vdCBwZXJmb3JtZWRcbiAgICogZm9yIEVTTSBtb2R1bGVzLlxuICAgKi9cbiAgbG9ja1BhdGg/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBTcGVjaWZ5IGhvdyB0aGUgbG9hZGVyIHNob3VsZCBoYW5kbGUgTlBNIHBhY2thZ2VzLiBCeSBkZWZhdWx0IGFuZCBpZiB0aGlzXG4gICAqIG9wdGlvbiBpcyBzZXQgdG8gYG5vbmVgLCB0aGUgbG9hZGVyIHdpbGwgdXNlIHRoZSBnbG9iYWwgY2FjaGUgdG8gcmVzb2x2ZVxuICAgKiBOUE0gcGFja2FnZXMuIElmIHRoaXMgb3B0aW9uIGlzIHNldCB0byBgbWFudWFsYCwgdGhlIGxvYWRlciB3aWxsIHVzZSBhXG4gICAqIG1hbnVhbGx5IG1hbmFnZWQgYG5vZGVfbW9kdWxlc2AgZGlyZWN0b3J5LiBJZiB0aGlzIG9wdGlvbiBpcyBzZXQgdG8gYGF1dG9gLFxuICAgKiB0aGUgbG9hZGVyIHdpbGwgdXNlIGEgbG9jYWwgYG5vZGVfbW9kdWxlc2AgZGlyZWN0b3J5LlxuICAgKlxuICAgKiBJZiB0aGlzIG9wdGlvbiBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgZGVuby5qc29uIGNvbmZpZyBmaWxlIGlzIGNvbnN1bHRlZCB0b1xuICAgKiBkZXRlcm1pbmUgd2hpY2ggbW9kZSB0byB1c2UuIElmIG5vIGNvbmZpZyBmaWxlIGlzIHByZXNlbnQsIG9yIHRoZSBjb25maWdcbiAgICogZmlsZSBkb2VzIG5vdCBzcGVjaWZ5IHRoaXMgb3B0aW9uLCB0aGUgZGVmYXVsdCBpcyBgbm9uZWAgaWYgbm8gcGFja2FnZS5qc29uXG4gICAqIGlzIHByZXNlbnQsIGFuZCBgYXV0b2AgaWYgYSBwYWNrYWdlLmpzb24gaXMgcHJlc2VudC5cbiAgICpcbiAgICogVGhpcyBvcHRpb24gaXMgaWdub3JlZCB3aGVuIHVzaW5nIHRoZSBgcG9ydGFibGVgIGxvYWRlciwgYXMgdGhlIHBvcnRhYmxlXG4gICAqIGxvYWRlciBhbHdheXMgdXNlcyBhIG1hbnVhbCBgbm9kZV9tb2R1bGVzYCBkaXJlY3RvcnkgKGVxdWl2YWxlbnQgb2ZcbiAgICogYG5vZGVNb2R1bGVzRGlyOiBcIm1hbnVhbFwiYCkuXG4gICAqL1xuICBub2RlTW9kdWxlc0Rpcj86IFwiYXV0b1wiIHwgXCJtYW51YWxcIiB8IFwibm9uZVwiO1xufVxuXG5jb25zdCBMT0FERVJTID0gW1wibmF0aXZlXCIsIFwicG9ydGFibGVcIl0gYXMgY29uc3Q7XG5cbi8qKiBUaGUgZGVmYXVsdCBsb2FkZXIgdG8gdXNlLiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfTE9BREVSOiBcIm5hdGl2ZVwiIHwgXCJwb3J0YWJsZVwiID1cbiAgYXdhaXQgRGVuby5wZXJtaXNzaW9ucy5xdWVyeSh7IG5hbWU6IFwicnVuXCIgfSlcbiAgICAgIC50aGVuKChyZXMpID0+IHJlcy5zdGF0ZSAhPT0gXCJncmFudGVkXCIpXG4gICAgPyBcInBvcnRhYmxlXCJcbiAgICA6IFwibmF0aXZlXCI7XG5cbmNvbnN0IEJVSUxUSU5fTk9ERV9NT0RVTEVTID0gbmV3IFNldChbXG4gIFwiYXNzZXJ0XCIsXG4gIFwiYXNzZXJ0L3N0cmljdFwiLFxuICBcImFzeW5jX2hvb2tzXCIsXG4gIFwiYnVmZmVyXCIsXG4gIFwiY2hpbGRfcHJvY2Vzc1wiLFxuICBcImNsdXN0ZXJcIixcbiAgXCJjb25zb2xlXCIsXG4gIFwiY29uc3RhbnRzXCIsXG4gIFwiY3J5cHRvXCIsXG4gIFwiZGdyYW1cIixcbiAgXCJkaWFnbm9zdGljc19jaGFubmVsXCIsXG4gIFwiZG5zXCIsXG4gIFwiZG5zL3Byb21pc2VzXCIsXG4gIFwiZG9tYWluXCIsXG4gIFwiZXZlbnRzXCIsXG4gIFwiZnNcIixcbiAgXCJmcy9wcm9taXNlc1wiLFxuICBcImh0dHBcIixcbiAgXCJodHRwMlwiLFxuICBcImh0dHBzXCIsXG4gIFwibW9kdWxlXCIsXG4gIFwibmV0XCIsXG4gIFwib3NcIixcbiAgXCJwYXRoXCIsXG4gIFwicGF0aC9wb3NpeFwiLFxuICBcInBhdGgvd2luMzJcIixcbiAgXCJwZXJmX2hvb2tzXCIsXG4gIFwicHJvY2Vzc1wiLFxuICBcInB1bnljb2RlXCIsXG4gIFwicXVlcnlzdHJpbmdcIixcbiAgXCJyZXBsXCIsXG4gIFwicmVhZGxpbmVcIixcbiAgXCJzdHJlYW1cIixcbiAgXCJzdHJlYW0vY29uc3VtZXJzXCIsXG4gIFwic3RyZWFtL3Byb21pc2VzXCIsXG4gIFwic3RyZWFtL3dlYlwiLFxuICBcInN0cmluZ19kZWNvZGVyXCIsXG4gIFwic3lzXCIsXG4gIFwidGVzdFwiLFxuICBcInRpbWVyc1wiLFxuICBcInRpbWVycy9wcm9taXNlc1wiLFxuICBcInRsc1wiLFxuICBcInR0eVwiLFxuICBcInVybFwiLFxuICBcInV0aWxcIixcbiAgXCJ1dGlsL3R5cGVzXCIsXG4gIFwidjhcIixcbiAgXCJ2bVwiLFxuICBcIndvcmtlcl90aHJlYWRzXCIsXG4gIFwiemxpYlwiLFxuXSk7XG5cbi8qKlxuICogVGhlIERlbm8gbG9hZGVyIHBsdWdpbiBmb3IgZXNidWlsZC4gVGhpcyBwbHVnaW4gd2lsbCBsb2FkIGZ1bGx5IHF1YWxpZmllZFxuICogYGZpbGVgLCBgaHR0cGAsIGBodHRwc2AsIGFuZCBgZGF0YWAgVVJMcy5cbiAqXG4gKiAqKk5vdGUqKiB0aGF0IHRoaXMgcGx1Z2luIGRvZXMgbm90IGRvIHJlbGF0aXZlLT5hYnNvbHV0ZSBzcGVjaWZpZXJcbiAqIHJlc29sdXRpb24sIG9yIGltcG9ydCBtYXAgcmVzb2x1dGlvbi4gWW91IG11c3QgdXNlIHRoZSBgZGVub1Jlc29sdmVyUGx1Z2luYFxuICogX2JlZm9yZV8gdGhlIGBkZW5vTG9hZGVyUGx1Z2luYCB0byBkbyB0aGF0LlxuICpcbiAqIFRoaXMgcGx1Z2luIGNhbiBiZSBiYWNrZWQgYnkgdHdvIGRpZmZlcmVudCBsb2FkZXJzLCB0aGUgYG5hdGl2ZWAgbG9hZGVyIGFuZFxuICogdGhlIGBwb3J0YWJsZWAgbG9hZGVyLlxuICpcbiAqICMjIyBOYXRpdmUgTG9hZGVyXG4gKlxuICogVGhlIG5hdGl2ZSBsb2FkZXIgc2hlbGxzIG91dCB0byB0aGUgRGVubyBleGVjdXRhYmxlIHVuZGVyIHRoZSBob29kIHRvIGxvYWRcbiAqIGZpbGVzLiBSZXF1aXJlcyBgLS1hbGxvdy1yZWFkYCBhbmQgYC0tYWxsb3ctcnVuYC4gSW4gdGhpcyBtb2RlIHRoZSBkb3dubG9hZFxuICogY2FjaGUgaXMgc2hhcmVkIHdpdGggdGhlIERlbm8gZXhlY3V0YWJsZS4gVGhpcyBtb2RlIHJlc3BlY3RzIGRlbm8ubG9jayxcbiAqIERFTk9fRElSLCBERU5PX0FVVEhfVE9LRU5TLCBhbmQgYWxsIHNpbWlsYXIgbG9hZGluZyBjb25maWd1cmF0aW9uLiBGaWxlcyBhcmVcbiAqIGNhY2hlZCBvbiBkaXNrIGluIHRoZSBzYW1lIERlbm8gY2FjaGUgYXMgdGhlIERlbm8gZXhlY3V0YWJsZSwgYW5kIHdpbGwgbm90IGJlXG4gKiByZS1kb3dubG9hZGVkIG9uIHN1YnNlcXVlbnQgYnVpbGRzLlxuICpcbiAqIE5QTSBzcGVjaWZpZXJzIGNhbiBiZSB1c2VkIGluIHRoZSBuYXRpdmUgbG9hZGVyIHdpdGhvdXQgcmVxdWlyaW5nIGEgbG9jYWxcbiAqIGBub2RlX21vZHVsZXNgIGRpcmVjdG9yeS4gTlBNIHBhY2thZ2VzIGFyZSByZXNvbHZlZCwgZG93bmxvYWRlZCwgY2FjaGVkLCBhbmRcbiAqIGxvYWRlZCBpbiB0aGUgc2FtZSB3YXkgYXMgdGhlIERlbm8gZXhlY3V0YWJsZSBkb2VzLlxuICpcbiAqIEpTUiBzcGVjaWZpZXJzIGNhbiBiZSB1c2VkIHdpdGhvdXQgcmVzdHJpY3Rpb25zIGluIHRoZSBuYXRpdmUgbG9hZGVyLiBUb1xuICogZW5zdXJlIGRlcGVuZGVuY2llcyBhcmUgZGUtZHVwbGljYXRlZCBjb3JyZWN0bHksIGl0IGlzIHJlY29tbWVuZGVkIHRvIHVzZSBhXG4gKiBsb2NrZmlsZS5cbiAqXG4gKiAjIyMgUG9ydGFibGUgTG9hZGVyXG4gKlxuICogVGhlIHBvcnRhYmxlIGxvYWRlciBkb2VzIG1vZHVsZSBkb3dubG9hZGluZyBhbmQgY2FjaGluZyB3aXRoIG9ubHkgV2ViIEFQSXMuXG4gKiBSZXF1aXJlcyBgLS1hbGxvdy1yZWFkYCBhbmQvb3IgYC0tYWxsb3ctbmV0YC4gVGhpcyBtb2RlIGRvZXMgbm90IHJlc3BlY3RcbiAqIGRlbm8ubG9jaywgREVOT19ESVIsIERFTk9fQVVUSF9UT0tFTlMsIG9yIGFueSBvdGhlciBsb2FkaW5nIGNvbmZpZ3VyYXRpb24uIEl0XG4gKiBkb2VzIG5vdCBjYWNoZSBkb3dubG9hZGVkIGZpbGVzLiBJdCB3aWxsIHJlLWRvd25sb2FkIGZpbGVzIG9uIGV2ZXJ5IGJ1aWxkLlxuICpcbiAqIE5QTSBzcGVjaWZpZXJzIGNhbiBiZSB1c2VkIGluIHRoZSBwb3J0YWJsZSBsb2FkZXIsIGJ1dCByZXF1aXJlIGEgbG9jYWxcbiAqIGBub2RlX21vZHVsZXNgIGRpcmVjdG9yeS4gVGhlIGBub2RlX21vZHVsZXNgIGRpcmVjdG9yeSBtdXN0IGJlIGNyZWF0ZWQgcHJpb3JcbiAqIHVzaW5nIERlbm8ncyBgLS1ub2RlLW1vZHVsZXMtZGlyYCBmbGFnLlxuICpcbiAqIEpTUiBzcGVjaWZpZXJzIHJlcXVpcmUgYSBsb2NrZmlsZSB0byBiZSBwcmVzZW50IHRvIHJlc29sdmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZW5vTG9hZGVyUGx1Z2luKFxuICBvcHRpb25zOiBEZW5vTG9hZGVyUGx1Z2luT3B0aW9ucyA9IHt9LFxuKTogZXNidWlsZC5QbHVnaW4ge1xuICBjb25zdCBsb2FkZXIgPSBvcHRpb25zLmxvYWRlciA/PyBERUZBVUxUX0xPQURFUjtcbiAgaWYgKExPQURFUlMuaW5kZXhPZihsb2FkZXIpID09PSAtMSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBsb2FkZXI6ICR7bG9hZGVyfWApO1xuICB9XG4gIHJldHVybiB7XG4gICAgbmFtZTogXCJkZW5vLWxvYWRlclwiLFxuICAgIHNldHVwKGJ1aWxkKSB7XG4gICAgICBjb25zdCBjd2QgPSBidWlsZC5pbml0aWFsT3B0aW9ucy5hYnNXb3JraW5nRGlyID8/IERlbm8uY3dkKCk7XG5cbiAgICAgIGxldCBub2RlTW9kdWxlc0Rpcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gICAgICBsZXQgbG9hZGVySW1wbDogTG9hZGVyIHwgdW5kZWZpbmVkO1xuXG4gICAgICBjb25zdCBwYWNrYWdlSWRCeU5vZGVNb2R1bGVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICAgICAgYnVpbGQub25TdGFydChmdW5jdGlvbiBvblN0YXJ0KCkge1xuICAgICAgICBsb2FkZXJJbXBsPy5bU3ltYm9sLmRpc3Bvc2VdPy4oKTtcbiAgICAgICAgbG9hZGVySW1wbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgcGFja2FnZUlkQnlOb2RlTW9kdWxlcy5jbGVhcigpO1xuXG4gICAgICAgIGxldCBub2RlTW9kdWxlc0Rpck9wdDogXCJhdXRvXCIgfCBcIm1hbnVhbFwiIHwgXCJub25lXCIgfCB1bmRlZmluZWQgPVxuICAgICAgICAgIG9wdGlvbnMubm9kZU1vZHVsZXNEaXI7XG4gICAgICAgIGxldCBsb2NrUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkID0gb3B0aW9ucy5sb2NrUGF0aDtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIChub2RlTW9kdWxlc0Rpck9wdCA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICAobG9hZGVyID09PSBcInBvcnRhYmxlXCIgJiYgbG9ja1BhdGggPT09IHVuZGVmaW5lZCkpXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IHdvcmtzcGFjZSA9IGZpbmRXb3Jrc3BhY2UoXG4gICAgICAgICAgICBjd2QsXG4gICAgICAgICAgICBidWlsZC5pbml0aWFsT3B0aW9ucy5lbnRyeVBvaW50cyxcbiAgICAgICAgICAgIG9wdGlvbnMuY29uZmlnUGF0aCxcbiAgICAgICAgICApO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAobm9kZU1vZHVsZXNEaXJPcHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBub2RlTW9kdWxlc0Rpck9wdCA9IHdvcmtzcGFjZS5ub2RlX21vZHVsZXNfZGlyKCkgYXNcbiAgICAgICAgICAgICAgICB8IFwiYXV0b1wiXG4gICAgICAgICAgICAgICAgfCBcIm1hbnVhbFwiXG4gICAgICAgICAgICAgICAgfCBcIm5vbmVcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsb2FkZXIgPT09IFwicG9ydGFibGVcIiAmJiBsb2NrUGF0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIGxvY2tQYXRoID0gd29ya3NwYWNlLmxvY2tfcGF0aCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB3b3Jrc3BhY2UuZnJlZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoXG4gICAgICAgICAgbm9kZU1vZHVsZXNEaXJPcHQgPT09IFwiYXV0b1wiIHx8XG4gICAgICAgICAgbm9kZU1vZHVsZXNEaXJPcHQgPT09IFwibWFudWFsXCJcbiAgICAgICAgKSB7XG4gICAgICAgICAgbm9kZU1vZHVsZXNEaXIgPSBqb2luKGN3ZCwgXCJub2RlX21vZHVsZXNcIik7XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2ggKGxvYWRlcikge1xuICAgICAgICAgIGNhc2UgXCJuYXRpdmVcIjpcbiAgICAgICAgICAgIGxvYWRlckltcGwgPSBuZXcgTmF0aXZlTG9hZGVyKHtcbiAgICAgICAgICAgICAgaW5mb09wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBjd2QsXG4gICAgICAgICAgICAgICAgY29uZmlnOiBvcHRpb25zLmNvbmZpZ1BhdGgsXG4gICAgICAgICAgICAgICAgaW1wb3J0TWFwOiBvcHRpb25zLmltcG9ydE1hcFVSTCxcbiAgICAgICAgICAgICAgICBsb2NrOiBvcHRpb25zLmxvY2tQYXRoLFxuICAgICAgICAgICAgICAgIG5vZGVNb2R1bGVzRGlyOiBub2RlTW9kdWxlc0Rpck9wdCxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcInBvcnRhYmxlXCI6IHtcbiAgICAgICAgICAgIGxvYWRlckltcGwgPSBuZXcgUG9ydGFibGVMb2FkZXIoe1xuICAgICAgICAgICAgICBsb2NrOiBsb2NrUGF0aCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGFzeW5jIGZ1bmN0aW9uIG9uUmVzb2x2ZShcbiAgICAgICAgYXJnczogZXNidWlsZC5PblJlc29sdmVBcmdzLFxuICAgICAgKTogUHJvbWlzZTxlc2J1aWxkLk9uUmVzb2x2ZVJlc3VsdCB8IHVuZGVmaW5lZD4ge1xuICAgICAgICBpZiAoaXNOb2RlTW9kdWxlc1Jlc29sdXRpb24oYXJncykpIHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBCVUlMVElOX05PREVfTU9EVUxFUy5oYXMoYXJncy5wYXRoKSB8fFxuICAgICAgICAgICAgQlVJTFRJTl9OT0RFX01PRFVMRVMuaGFzKFwibm9kZTpcIiArIGFyZ3MucGF0aClcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIHBhdGg6IGFyZ3MucGF0aCxcbiAgICAgICAgICAgICAgZXh0ZXJuYWw6IHRydWUsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobm9kZU1vZHVsZXNEaXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgIGxvYWRlckltcGwhLm5vZGVNb2R1bGVzRGlyRm9yUGFja2FnZSAmJlxuICAgICAgICAgICAgbG9hZGVySW1wbCEucGFja2FnZUlkRnJvbU5hbWVJblBhY2thZ2VcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGxldCBwYXJlbnRQYWNrYWdlSWQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGxldCBwYXRoID0gYXJncy5pbXBvcnRlcjtcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHBhY2thZ2VJZCA9IHBhY2thZ2VJZEJ5Tm9kZU1vZHVsZXMuZ2V0KHBhdGgpO1xuICAgICAgICAgICAgICBpZiAocGFja2FnZUlkKSB7XG4gICAgICAgICAgICAgICAgcGFyZW50UGFja2FnZUlkID0gcGFja2FnZUlkO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IHBhdGhCZWZvcmUgPSBwYXRoO1xuICAgICAgICAgICAgICBwYXRoID0gZGlybmFtZShwYXRoKTtcbiAgICAgICAgICAgICAgaWYgKHBhdGggPT09IHBhdGhCZWZvcmUpIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFwYXJlbnRQYWNrYWdlSWQpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBDb3VsZCBub3QgZmluZCBwYWNrYWdlIElEIGZvciBpbXBvcnRlcjogJHthcmdzLmltcG9ydGVyfWAsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYXJncy5wYXRoLnN0YXJ0c1dpdGgoXCIuXCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBsZXQgcGFja2FnZU5hbWU6IHN0cmluZztcbiAgICAgICAgICAgICAgbGV0IHBhdGhQYXJ0czogc3RyaW5nW107XG4gICAgICAgICAgICAgIGlmIChhcmdzLnBhdGguc3RhcnRzV2l0aChcIkBcIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBbc2NvcGUsIG5hbWUsIC4uLnJlc3RdID0gYXJncy5wYXRoLnNwbGl0KFwiL1wiKTtcbiAgICAgICAgICAgICAgICBwYWNrYWdlTmFtZSA9IGAke3Njb3BlfS8ke25hbWV9YDtcbiAgICAgICAgICAgICAgICBwYXRoUGFydHMgPSByZXN0O1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IFtuYW1lLCAuLi5yZXN0XSA9IGFyZ3MucGF0aC5zcGxpdChcIi9cIik7XG4gICAgICAgICAgICAgICAgcGFja2FnZU5hbWUgPSBuYW1lO1xuICAgICAgICAgICAgICAgIHBhdGhQYXJ0cyA9IHJlc3Q7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgcGFja2FnZUlkID0gbG9hZGVySW1wbCEucGFja2FnZUlkRnJvbU5hbWVJblBhY2thZ2UoXG4gICAgICAgICAgICAgICAgcGFja2FnZU5hbWUsXG4gICAgICAgICAgICAgICAgcGFyZW50UGFja2FnZUlkLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBjb25zdCBpZCA9IHBhY2thZ2VJZCA/PyBwYXJlbnRQYWNrYWdlSWQ7XG4gICAgICAgICAgICAgIGNvbnN0IHJlc29sdmVEaXIgPSBhd2FpdCBsb2FkZXJJbXBsIS5ub2RlTW9kdWxlc0RpckZvclBhY2thZ2UoaWQpO1xuICAgICAgICAgICAgICBwYWNrYWdlSWRCeU5vZGVNb2R1bGVzLnNldChyZXNvbHZlRGlyLCBpZCk7XG4gICAgICAgICAgICAgIGNvbnN0IHBhdGggPSBbcGFja2FnZU5hbWUsIC4uLnBhdGhQYXJ0c10uam9pbihcIi9cIik7XG4gICAgICAgICAgICAgIHJldHVybiBhd2FpdCBidWlsZC5yZXNvbHZlKHBhdGgsIHtcbiAgICAgICAgICAgICAgICBraW5kOiBhcmdzLmtpbmQsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZURpcixcbiAgICAgICAgICAgICAgICBpbXBvcnRlcjogYXJncy5pbXBvcnRlcixcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgYFRvIHVzZSBcIm5wbTpcIiBzcGVjaWZpZXJzLCB5b3UgbXVzdCBzcGVjaWZ5ICdub2RlTW9kdWxlc0RpcjogXCJtYW51YWxcIicsIG9yIHVzZSAnbG9hZGVyOiBcIm5hdGl2ZVwiJy5gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc3BlY2lmaWVyID0gZXNidWlsZFJlc29sdXRpb25Ub1VSTChhcmdzKTtcblxuICAgICAgICAvLyBPbmNlIHdlIGhhdmUgYW4gYWJzb2x1dGUgcGF0aCwgbGV0IHRoZSBsb2FkZXIgcmVzb2x2ZXIgZmlndXJlIG91dFxuICAgICAgICAvLyB3aGF0IHRvIGRvIHdpdGggaXQuXG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGxvYWRlckltcGwhLnJlc29sdmUoc3BlY2lmaWVyKTtcblxuICAgICAgICBzd2l0Y2ggKHJlcy5raW5kKSB7XG4gICAgICAgICAgY2FzZSBcImVzbVwiOiB7XG4gICAgICAgICAgICBjb25zdCB7IHNwZWNpZmllciB9ID0gcmVzO1xuICAgICAgICAgICAgcmV0dXJuIHVybFRvRXNidWlsZFJlc29sdXRpb24oc3BlY2lmaWVyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSBcIm5wbVwiOiB7XG4gICAgICAgICAgICBsZXQgcmVzb2x2ZURpcjogc3RyaW5nO1xuICAgICAgICAgICAgaWYgKG5vZGVNb2R1bGVzRGlyICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIHJlc29sdmVEaXIgPSBub2RlTW9kdWxlc0RpcjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobG9hZGVySW1wbCEubm9kZU1vZHVsZXNEaXJGb3JQYWNrYWdlKSB7XG4gICAgICAgICAgICAgIHJlc29sdmVEaXIgPSBhd2FpdCBsb2FkZXJJbXBsIS5ub2RlTW9kdWxlc0RpckZvclBhY2thZ2UoXG4gICAgICAgICAgICAgICAgcmVzLnBhY2thZ2VJZCxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgcGFja2FnZUlkQnlOb2RlTW9kdWxlcy5zZXQocmVzb2x2ZURpciwgcmVzLnBhY2thZ2VJZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYFRvIHVzZSBcIm5wbTpcIiBzcGVjaWZpZXJzLCB5b3UgbXVzdCBzcGVjaWZ5ICdub2RlTW9kdWxlc0RpcjogXCJtYW51YWxcIicsIG9yIHVzZSAnbG9hZGVyOiBcIm5hdGl2ZVwiJy5gLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcGF0aCA9IGAke3Jlcy5wYWNrYWdlTmFtZX0ke3Jlcy5wYXRoID8/IFwiXCJ9YDtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBidWlsZC5yZXNvbHZlKHBhdGgsIHtcbiAgICAgICAgICAgICAga2luZDogYXJncy5raW5kLFxuICAgICAgICAgICAgICByZXNvbHZlRGlyLFxuICAgICAgICAgICAgICBpbXBvcnRlcjogYXJncy5pbXBvcnRlcixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIFwibm9kZVwiOiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBwYXRoOiByZXMucGF0aCxcbiAgICAgICAgICAgICAgZXh0ZXJuYWw6IHRydWUsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYnVpbGQub25SZXNvbHZlKHsgZmlsdGVyOiAvLiovLCBuYW1lc3BhY2U6IFwiZmlsZVwiIH0sIG9uUmVzb2x2ZSk7XG4gICAgICBidWlsZC5vblJlc29sdmUoeyBmaWx0ZXI6IC8uKi8sIG5hbWVzcGFjZTogXCJodHRwXCIgfSwgb25SZXNvbHZlKTtcbiAgICAgIGJ1aWxkLm9uUmVzb2x2ZSh7IGZpbHRlcjogLy4qLywgbmFtZXNwYWNlOiBcImh0dHBzXCIgfSwgb25SZXNvbHZlKTtcbiAgICAgIGJ1aWxkLm9uUmVzb2x2ZSh7IGZpbHRlcjogLy4qLywgbmFtZXNwYWNlOiBcImRhdGFcIiB9LCBvblJlc29sdmUpO1xuICAgICAgYnVpbGQub25SZXNvbHZlKHsgZmlsdGVyOiAvLiovLCBuYW1lc3BhY2U6IFwibnBtXCIgfSwgb25SZXNvbHZlKTtcbiAgICAgIGJ1aWxkLm9uUmVzb2x2ZSh7IGZpbHRlcjogLy4qLywgbmFtZXNwYWNlOiBcImpzclwiIH0sIG9uUmVzb2x2ZSk7XG4gICAgICBidWlsZC5vblJlc29sdmUoeyBmaWx0ZXI6IC8uKi8sIG5hbWVzcGFjZTogXCJub2RlXCIgfSwgb25SZXNvbHZlKTtcblxuICAgICAgZnVuY3Rpb24gb25Mb2FkKFxuICAgICAgICBhcmdzOiBlc2J1aWxkLk9uTG9hZEFyZ3MsXG4gICAgICApOiBQcm9taXNlPGVzYnVpbGQuT25Mb2FkUmVzdWx0IHwgbnVsbCB8IHVuZGVmaW5lZD4gfCB1bmRlZmluZWQge1xuICAgICAgICBpZiAoYXJncy5uYW1lc3BhY2UgPT09IFwiZmlsZVwiICYmIGlzSW5Ob2RlTW9kdWxlcyhhcmdzLnBhdGgpKSB7XG4gICAgICAgICAgLy8gaW5zaWRlIG5vZGVfbW9kdWxlcywganVzdCBsZXQgZXNidWlsZCBkbyBpdCdzIHRoaW5nXG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzcGVjaWZpZXIgPSBlc2J1aWxkUmVzb2x1dGlvblRvVVJMKGFyZ3MpO1xuICAgICAgICByZXR1cm4gbG9hZGVySW1wbCEubG9hZEVzbShzcGVjaWZpZXIpO1xuICAgICAgfVxuICAgICAgLy8gVE9ETyhsdWNhY2Fzb25hdG8pOiBvbmNlIGh0dHBzOi8vZ2l0aHViLmNvbS9ldmFudy9lc2J1aWxkL3B1bGwvMjk2OCBpcyBmaXhlZCwgcmVtb3ZlIHRoZSBjYXRjaCBhbGwgXCJmaWxlXCIgaGFuZGxlclxuICAgICAgYnVpbGQub25Mb2FkKHsgZmlsdGVyOiAvLiovLCBuYW1lc3BhY2U6IFwiZmlsZVwiIH0sIG9uTG9hZCk7XG4gICAgICBidWlsZC5vbkxvYWQoeyBmaWx0ZXI6IC8uKi8sIG5hbWVzcGFjZTogXCJodHRwXCIgfSwgb25Mb2FkKTtcbiAgICAgIGJ1aWxkLm9uTG9hZCh7IGZpbHRlcjogLy4qLywgbmFtZXNwYWNlOiBcImh0dHBzXCIgfSwgb25Mb2FkKTtcbiAgICAgIGJ1aWxkLm9uTG9hZCh7IGZpbHRlcjogLy4qLywgbmFtZXNwYWNlOiBcImRhdGFcIiB9LCBvbkxvYWQpO1xuICAgIH0sXG4gIH07XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsU0FBUyxPQUFPLEVBQUUsSUFBSSxRQUFRLHVCQUF1QjtBQUNyRCxTQUFTLFlBQVksUUFBUSxxQkFBcUI7QUFDbEQsU0FBUyxjQUFjLFFBQVEsdUJBQXVCO0FBQ3RELFNBQVMsYUFBYSxFQUFFLGVBQWUsUUFBUSxjQUFjO0FBQzdELFNBQ0Usc0JBQXNCLEVBQ3RCLHVCQUF1QixFQUV2QixzQkFBc0IsUUFDakIsY0FBYztBQTZFckIsTUFBTSxVQUFVO0VBQUM7RUFBVTtDQUFX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
// denoCacheMetadata=16596656739442984150,8279162933559615325