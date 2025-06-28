import { dirname, extname, fromFileUrl, SEPARATOR, toFileUrl } from "jsr:@std/path@^1.0.6";
import { instantiate, WasmWorkspace } from "./wasm/loader.generated.js";
export function findWorkspace(cwd, entryPoints, configPath) {
  const cwdFileUrl = toFileUrl(cwd);
  if (!cwdFileUrl.pathname.endsWith("/")) {
    cwdFileUrl.pathname += "/";
  }
  let entrypoints;
  let isConfigFile = false;
  if (configPath !== undefined) {
    entrypoints = [
      configPath
    ];
    isConfigFile = true;
  } else if (Array.isArray(entryPoints)) {
    entrypoints = entryPoints.flatMap((entrypoint)=>{
      let specifier;
      if (typeof entrypoint === "string") {
        specifier = entrypoint;
      } else {
        specifier = entrypoint.in;
      }
      const url = new URL(specifier, cwdFileUrl.href);
      if (url.protocol === "file:") {
        return [
          dirname(fromFileUrl(url.href))
        ];
      } else {
        return [];
      }
    });
  } else if (typeof entryPoints === "object") {
    entrypoints = Object.values(entryPoints).flatMap((entrypoint)=>{
      const url = new URL(entrypoint, cwdFileUrl.href);
      if (url.protocol === "file:") {
        return [
          dirname(fromFileUrl(url.href))
        ];
      } else {
        return [];
      }
    });
  } else {
    entrypoints = [];
  }
  if (entrypoints.length === 0) {
    entrypoints = [
      cwd
    ];
  }
  instantiate();
  return WasmWorkspace.discover(entrypoints, isConfigFile);
}
export function mediaTypeToLoader(mediaType) {
  switch(mediaType){
    case "JavaScript":
    case "Mjs":
      return "js";
    case "JSX":
      return "jsx";
    case "TypeScript":
    case "Mts":
      return "ts";
    case "TSX":
      return "tsx";
    case "Json":
      return "json";
    default:
      return null;
  }
}
/**
 * Turn a URL into an {@link EsbuildResolution} by splitting the URL into a
 * namespace and path.
 *
 * For file URLs, the path returned is a file path not a URL path representing a
 * file.
 */ export function urlToEsbuildResolution(url) {
  if (url.protocol === "file:") {
    return {
      path: fromFileUrl(url),
      namespace: "file"
    };
  }
  const namespace = url.protocol.slice(0, -1);
  const path = url.href.slice(namespace.length + 1);
  return {
    path,
    namespace
  };
}
/**
 * Turn an {@link EsbuildResolution} into a URL by joining the namespace and
 * path into a URL string.
 *
 * For file URLs, the path is interpreted as a file path not as a URL path
 * representing a file.
 */ export function esbuildResolutionToURL(specifier) {
  if (specifier.namespace === "file") {
    return toFileUrl(specifier.path);
  }
  return new URL(`${specifier.namespace}:${specifier.path}`);
}
export function mapContentType(specifier, contentType) {
  if (contentType !== null) {
    const contentTypes = contentType.split(";");
    const mediaType = contentTypes[0].toLowerCase();
    switch(mediaType){
      case "application/typescript":
      case "text/typescript":
      case "video/vnd.dlna.mpeg-tts":
      case "video/mp2t":
      case "application/x-typescript":
        return mapJsLikeExtension(specifier, "TypeScript");
      case "application/javascript":
      case "text/javascript":
      case "application/ecmascript":
      case "text/ecmascript":
      case "application/x-javascript":
      case "application/node":
        return mapJsLikeExtension(specifier, "JavaScript");
      case "text/jsx":
        return "JSX";
      case "text/tsx":
        return "TSX";
      case "application/json":
      case "text/json":
        return "Json";
      case "application/wasm":
        return "Wasm";
      case "text/plain":
      case "application/octet-stream":
        return mediaTypeFromSpecifier(specifier);
      default:
        return "Unknown";
    }
  } else {
    return mediaTypeFromSpecifier(specifier);
  }
}
function mapJsLikeExtension(specifier, defaultType) {
  const path = specifier.pathname;
  switch(extname(path)){
    case ".jsx":
      return "JSX";
    case ".mjs":
      return "Mjs";
    case ".cjs":
      return "Cjs";
    case ".tsx":
      return "TSX";
    case ".ts":
      if (path.endsWith(".d.ts")) {
        return "Dts";
      } else {
        return defaultType;
      }
    case ".mts":
      {
        if (path.endsWith(".d.mts")) {
          return "Dmts";
        } else {
          return defaultType == "JavaScript" ? "Mjs" : "Mts";
        }
      }
    case ".cts":
      {
        if (path.endsWith(".d.cts")) {
          return "Dcts";
        } else {
          return defaultType == "JavaScript" ? "Cjs" : "Cts";
        }
      }
    default:
      return defaultType;
  }
}
export function mediaTypeFromSpecifier(specifier) {
  const path = specifier.pathname;
  switch(extname(path)){
    case "":
      if (path.endsWith("/.tsbuildinfo")) {
        return "TsBuildInfo";
      } else {
        return "Unknown";
      }
    case ".ts":
      if (path.endsWith(".d.ts")) {
        return "Dts";
      } else {
        return "TypeScript";
      }
    case ".mts":
      if (path.endsWith(".d.mts")) {
        return "Dmts";
      } else {
        return "Mts";
      }
    case ".cts":
      if (path.endsWith(".d.cts")) {
        return "Dcts";
      } else {
        return "Cts";
      }
    case ".tsx":
      return "TSX";
    case ".js":
      return "JavaScript";
    case ".jsx":
      return "JSX";
    case ".mjs":
      return "Mjs";
    case ".cjs":
      return "Cjs";
    case ".json":
      return "Json";
    case ".wasm":
      return "Wasm";
    case ".tsbuildinfo":
      return "TsBuildInfo";
    case ".map":
      return "SourceMap";
    default:
      return "Unknown";
  }
}
export function parseNpmSpecifier(specifier) {
  if (specifier.protocol !== "npm:") throw new Error("Invalid npm specifier");
  const path = specifier.pathname;
  const startIndex = path[0] === "/" ? 1 : 0;
  let pathStartIndex;
  let versionStartIndex;
  if (path[startIndex] === "@") {
    const firstSlash = path.indexOf("/", startIndex);
    if (firstSlash === -1) {
      throw new Error(`Invalid npm specifier: ${specifier}`);
    }
    pathStartIndex = path.indexOf("/", firstSlash + 1);
    versionStartIndex = path.indexOf("@", firstSlash + 1);
  } else {
    pathStartIndex = path.indexOf("/", startIndex);
    versionStartIndex = path.indexOf("@", startIndex);
  }
  if (pathStartIndex === -1) pathStartIndex = path.length;
  if (versionStartIndex === -1) versionStartIndex = path.length;
  if (versionStartIndex > pathStartIndex) {
    versionStartIndex = pathStartIndex;
  }
  if (startIndex === versionStartIndex) {
    throw new Error(`Invalid npm specifier: ${specifier}`);
  }
  return {
    name: path.slice(startIndex, versionStartIndex),
    version: versionStartIndex === pathStartIndex ? null : path.slice(versionStartIndex + 1, pathStartIndex),
    path: pathStartIndex === path.length ? null : path.slice(pathStartIndex)
  };
}
export function parseJsrSpecifier(specifier) {
  if (specifier.protocol !== "jsr:") throw new Error("Invalid jsr specifier");
  const path = specifier.pathname;
  const startIndex = path[0] === "/" ? 1 : 0;
  if (path[startIndex] !== "@") {
    throw new Error(`Invalid jsr specifier: ${specifier}`);
  }
  const firstSlash = path.indexOf("/", startIndex);
  if (firstSlash === -1) {
    throw new Error(`Invalid jsr specifier: ${specifier}`);
  }
  let pathStartIndex = path.indexOf("/", firstSlash + 1);
  let versionStartIndex = path.indexOf("@", firstSlash + 1);
  if (pathStartIndex === -1) pathStartIndex = path.length;
  if (versionStartIndex === -1) versionStartIndex = path.length;
  if (versionStartIndex > pathStartIndex) {
    versionStartIndex = pathStartIndex;
  }
  if (startIndex === versionStartIndex) {
    throw new Error(`Invalid jsr specifier: ${specifier}`);
  }
  return {
    name: path.slice(startIndex, versionStartIndex),
    version: versionStartIndex === pathStartIndex ? null : path.slice(versionStartIndex + 1, pathStartIndex),
    path: pathStartIndex === path.length ? null : path.slice(pathStartIndex)
  };
}
const SLASH_NODE_MODULES_SLASH = `${SEPARATOR}node_modules${SEPARATOR}`;
const SLASH_NODE_MODULES = `${SEPARATOR}node_modules`;
export function isInNodeModules(path) {
  return path.includes(SLASH_NODE_MODULES_SLASH) || path.endsWith(SLASH_NODE_MODULES);
}
export function isNodeModulesResolution(args) {
  return (args.namespace === "" || args.namespace === "file") && (isInNodeModules(args.resolveDir) || isInNodeModules(args.path) || isInNodeModules(args.importer));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BsdWNhL2VzYnVpbGQtZGVuby1sb2FkZXIvMC4xMS4wL3NyYy9zaGFyZWQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZGlybmFtZSwgZXh0bmFtZSwgZnJvbUZpbGVVcmwsIFNFUEFSQVRPUiwgdG9GaWxlVXJsIH0gZnJvbSBcImpzcjpAc3RkL3BhdGhAXjEuMC42XCI7XG5pbXBvcnQgdHlwZSB7IE1lZGlhVHlwZSB9IGZyb20gXCIuL2Rlbm8udHNcIjtcbmltcG9ydCB0eXBlICogYXMgZXNidWlsZCBmcm9tIFwiLi9lc2J1aWxkX3R5cGVzLnRzXCI7XG5pbXBvcnQgeyBpbnN0YW50aWF0ZSwgV2FzbVdvcmtzcGFjZSB9IGZyb20gXCIuL3dhc20vbG9hZGVyLmdlbmVyYXRlZC5qc1wiO1xuaW1wb3J0IHR5cGUgeyBCdWlsZE9wdGlvbnMgfSBmcm9tIFwiLi9lc2J1aWxkX3R5cGVzLnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9hZGVyIHtcbiAgcmVzb2x2ZShzcGVjaWZpZXI6IFVSTCk6IFByb21pc2U8TG9hZGVyUmVzb2x1dGlvbj47XG4gIGxvYWRFc20oc3BlY2lmaWVyOiBVUkwpOiBQcm9taXNlPGVzYnVpbGQuT25Mb2FkUmVzdWx0IHwgdW5kZWZpbmVkPjtcblxuICBwYWNrYWdlSWRGcm9tTmFtZUluUGFja2FnZT8oXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHBhcmVudFBhY2thZ2VJZDogc3RyaW5nLFxuICApOiBzdHJpbmcgfCBudWxsO1xuICBub2RlTW9kdWxlc0RpckZvclBhY2thZ2U/KG5wbVBhY2thZ2VJZD86IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPjtcblxuICBbU3ltYm9sLmRpc3Bvc2VdPygpOiB2b2lkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZFdvcmtzcGFjZShcbiAgY3dkOiBzdHJpbmcsXG4gIGVudHJ5UG9pbnRzOiBCdWlsZE9wdGlvbnNbXCJlbnRyeVBvaW50c1wiXSxcbiAgY29uZmlnUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkLFxuKTogV2FzbVdvcmtzcGFjZSB7XG4gIGNvbnN0IGN3ZEZpbGVVcmwgPSB0b0ZpbGVVcmwoY3dkKTtcbiAgaWYgKCFjd2RGaWxlVXJsLnBhdGhuYW1lLmVuZHNXaXRoKFwiL1wiKSkge1xuICAgIGN3ZEZpbGVVcmwucGF0aG5hbWUgKz0gXCIvXCI7XG4gIH1cblxuICBsZXQgZW50cnlwb2ludHM6IEFycmF5PHN0cmluZz47XG4gIGxldCBpc0NvbmZpZ0ZpbGUgPSBmYWxzZTtcbiAgaWYgKGNvbmZpZ1BhdGggIT09IHVuZGVmaW5lZCkge1xuICAgIGVudHJ5cG9pbnRzID0gW2NvbmZpZ1BhdGhdO1xuICAgIGlzQ29uZmlnRmlsZSA9IHRydWU7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShlbnRyeVBvaW50cykpIHtcbiAgICBlbnRyeXBvaW50cyA9IGVudHJ5UG9pbnRzLmZsYXRNYXAoXG4gICAgICAoZW50cnlwb2ludCkgPT4ge1xuICAgICAgICBsZXQgc3BlY2lmaWVyOiBzdHJpbmc7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBlbnRyeXBvaW50ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgc3BlY2lmaWVyID0gZW50cnlwb2ludDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzcGVjaWZpZXIgPSBlbnRyeXBvaW50LmluO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChzcGVjaWZpZXIsIGN3ZEZpbGVVcmwuaHJlZik7XG4gICAgICAgIGlmICh1cmwucHJvdG9jb2wgPT09IFwiZmlsZTpcIikge1xuICAgICAgICAgIHJldHVybiBbZGlybmFtZShmcm9tRmlsZVVybCh1cmwuaHJlZikpXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZW50cnlQb2ludHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICBlbnRyeXBvaW50cyA9IE9iamVjdC52YWx1ZXMoZW50cnlQb2ludHMpLmZsYXRNYXAoXG4gICAgICAoZW50cnlwb2ludCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKGVudHJ5cG9pbnQsIGN3ZEZpbGVVcmwuaHJlZik7XG4gICAgICAgIGlmICh1cmwucHJvdG9jb2wgPT09IFwiZmlsZTpcIikge1xuICAgICAgICAgIHJldHVybiBbZGlybmFtZShmcm9tRmlsZVVybCh1cmwuaHJlZikpXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICBlbnRyeXBvaW50cyA9IFtdO1xuICB9XG4gIGlmIChlbnRyeXBvaW50cy5sZW5ndGggPT09IDApIHtcbiAgICBlbnRyeXBvaW50cyA9IFtjd2RdO1xuICB9XG5cbiAgaW5zdGFudGlhdGUoKTtcbiAgcmV0dXJuIFdhc21Xb3Jrc3BhY2UuZGlzY292ZXIoZW50cnlwb2ludHMsIGlzQ29uZmlnRmlsZSk7XG59XG5cbmV4cG9ydCB0eXBlIExvYWRlclJlc29sdXRpb24gPVxuICB8IExvYWRlclJlc29sdXRpb25Fc21cbiAgfCBMb2FkZXJSZXNvbHV0aW9uTnBtXG4gIHwgTG9hZGVyUmVzb2x1dGlvbk5vZGU7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9hZGVyUmVzb2x1dGlvbkVzbSB7XG4gIGtpbmQ6IFwiZXNtXCI7XG4gIHNwZWNpZmllcjogVVJMO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIExvYWRlclJlc29sdXRpb25OcG0ge1xuICBraW5kOiBcIm5wbVwiO1xuICBwYWNrYWdlSWQ6IHN0cmluZztcbiAgcGFja2FnZU5hbWU6IHN0cmluZztcbiAgcGF0aDogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIExvYWRlclJlc29sdXRpb25Ob2RlIHtcbiAga2luZDogXCJub2RlXCI7XG4gIHBhdGg6IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lZGlhVHlwZVRvTG9hZGVyKG1lZGlhVHlwZTogTWVkaWFUeXBlKTogZXNidWlsZC5Mb2FkZXIgfCBudWxsIHtcbiAgc3dpdGNoIChtZWRpYVR5cGUpIHtcbiAgICBjYXNlIFwiSmF2YVNjcmlwdFwiOlxuICAgIGNhc2UgXCJNanNcIjpcbiAgICAgIHJldHVybiBcImpzXCI7XG4gICAgY2FzZSBcIkpTWFwiOlxuICAgICAgcmV0dXJuIFwianN4XCI7XG4gICAgY2FzZSBcIlR5cGVTY3JpcHRcIjpcbiAgICBjYXNlIFwiTXRzXCI6XG4gICAgICByZXR1cm4gXCJ0c1wiO1xuICAgIGNhc2UgXCJUU1hcIjpcbiAgICAgIHJldHVybiBcInRzeFwiO1xuICAgIGNhc2UgXCJKc29uXCI6XG4gICAgICByZXR1cm4gXCJqc29uXCI7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKiBFc2J1aWxkJ3MgcmVwcmVzZW50YXRpb24gb2YgYSBtb2R1bGUgc3BlY2lmaWVyLiAqL1xuZXhwb3J0IGludGVyZmFjZSBFc2J1aWxkUmVzb2x1dGlvbiB7XG4gIC8qKiBUaGUgbmFtZXNwYWNlLCBsaWtlIGBmaWxlYCwgYGh0dHBzYCwgb3IgYG5wbWAuICovXG4gIG5hbWVzcGFjZTogc3RyaW5nO1xuICAvKiogVGhlIHBhdGguIFdoZW4gdGhlIG5hbWVzcGFjZSBpcyBgZmlsZWAsIHRoaXMgaXMgYSBmaWxlIHBhdGguIE90aGVyd2lzZVxuICAgKiB0aGlzIGlzIGV2ZXJ5dGhpbmcgaW4gYSBVUkwgd2l0aCB0aGUgbmFtZXNwYWNlIGFzIHRoZSBzY2hlbWUsIGFmdGVyIHRoZVxuICAgKiBgOmAgb2YgdGhlIHNjaGVtZS4gKi9cbiAgcGF0aDogc3RyaW5nO1xufVxuXG4vKipcbiAqIFR1cm4gYSBVUkwgaW50byBhbiB7QGxpbmsgRXNidWlsZFJlc29sdXRpb259IGJ5IHNwbGl0dGluZyB0aGUgVVJMIGludG8gYVxuICogbmFtZXNwYWNlIGFuZCBwYXRoLlxuICpcbiAqIEZvciBmaWxlIFVSTHMsIHRoZSBwYXRoIHJldHVybmVkIGlzIGEgZmlsZSBwYXRoIG5vdCBhIFVSTCBwYXRoIHJlcHJlc2VudGluZyBhXG4gKiBmaWxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXJsVG9Fc2J1aWxkUmVzb2x1dGlvbih1cmw6IFVSTCk6IEVzYnVpbGRSZXNvbHV0aW9uIHtcbiAgaWYgKHVybC5wcm90b2NvbCA9PT0gXCJmaWxlOlwiKSB7XG4gICAgcmV0dXJuIHsgcGF0aDogZnJvbUZpbGVVcmwodXJsKSwgbmFtZXNwYWNlOiBcImZpbGVcIiB9O1xuICB9XG5cbiAgY29uc3QgbmFtZXNwYWNlID0gdXJsLnByb3RvY29sLnNsaWNlKDAsIC0xKTtcbiAgY29uc3QgcGF0aCA9IHVybC5ocmVmLnNsaWNlKG5hbWVzcGFjZS5sZW5ndGggKyAxKTtcbiAgcmV0dXJuIHsgcGF0aCwgbmFtZXNwYWNlIH07XG59XG5cbi8qKlxuICogVHVybiBhbiB7QGxpbmsgRXNidWlsZFJlc29sdXRpb259IGludG8gYSBVUkwgYnkgam9pbmluZyB0aGUgbmFtZXNwYWNlIGFuZFxuICogcGF0aCBpbnRvIGEgVVJMIHN0cmluZy5cbiAqXG4gKiBGb3IgZmlsZSBVUkxzLCB0aGUgcGF0aCBpcyBpbnRlcnByZXRlZCBhcyBhIGZpbGUgcGF0aCBub3QgYXMgYSBVUkwgcGF0aFxuICogcmVwcmVzZW50aW5nIGEgZmlsZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVzYnVpbGRSZXNvbHV0aW9uVG9VUkwoc3BlY2lmaWVyOiBFc2J1aWxkUmVzb2x1dGlvbik6IFVSTCB7XG4gIGlmIChzcGVjaWZpZXIubmFtZXNwYWNlID09PSBcImZpbGVcIikge1xuICAgIHJldHVybiB0b0ZpbGVVcmwoc3BlY2lmaWVyLnBhdGgpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBVUkwoYCR7c3BlY2lmaWVyLm5hbWVzcGFjZX06JHtzcGVjaWZpZXIucGF0aH1gKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcENvbnRlbnRUeXBlKFxuICBzcGVjaWZpZXI6IFVSTCxcbiAgY29udGVudFR5cGU6IHN0cmluZyB8IG51bGwsXG4pOiBNZWRpYVR5cGUge1xuICBpZiAoY29udGVudFR5cGUgIT09IG51bGwpIHtcbiAgICBjb25zdCBjb250ZW50VHlwZXMgPSBjb250ZW50VHlwZS5zcGxpdChcIjtcIik7XG4gICAgY29uc3QgbWVkaWFUeXBlID0gY29udGVudFR5cGVzWzBdLnRvTG93ZXJDYXNlKCk7XG4gICAgc3dpdGNoIChtZWRpYVR5cGUpIHtcbiAgICAgIGNhc2UgXCJhcHBsaWNhdGlvbi90eXBlc2NyaXB0XCI6XG4gICAgICBjYXNlIFwidGV4dC90eXBlc2NyaXB0XCI6XG4gICAgICBjYXNlIFwidmlkZW8vdm5kLmRsbmEubXBlZy10dHNcIjpcbiAgICAgIGNhc2UgXCJ2aWRlby9tcDJ0XCI6XG4gICAgICBjYXNlIFwiYXBwbGljYXRpb24veC10eXBlc2NyaXB0XCI6XG4gICAgICAgIHJldHVybiBtYXBKc0xpa2VFeHRlbnNpb24oc3BlY2lmaWVyLCBcIlR5cGVTY3JpcHRcIik7XG4gICAgICBjYXNlIFwiYXBwbGljYXRpb24vamF2YXNjcmlwdFwiOlxuICAgICAgY2FzZSBcInRleHQvamF2YXNjcmlwdFwiOlxuICAgICAgY2FzZSBcImFwcGxpY2F0aW9uL2VjbWFzY3JpcHRcIjpcbiAgICAgIGNhc2UgXCJ0ZXh0L2VjbWFzY3JpcHRcIjpcbiAgICAgIGNhc2UgXCJhcHBsaWNhdGlvbi94LWphdmFzY3JpcHRcIjpcbiAgICAgIGNhc2UgXCJhcHBsaWNhdGlvbi9ub2RlXCI6XG4gICAgICAgIHJldHVybiBtYXBKc0xpa2VFeHRlbnNpb24oc3BlY2lmaWVyLCBcIkphdmFTY3JpcHRcIik7XG4gICAgICBjYXNlIFwidGV4dC9qc3hcIjpcbiAgICAgICAgcmV0dXJuIFwiSlNYXCI7XG4gICAgICBjYXNlIFwidGV4dC90c3hcIjpcbiAgICAgICAgcmV0dXJuIFwiVFNYXCI7XG4gICAgICBjYXNlIFwiYXBwbGljYXRpb24vanNvblwiOlxuICAgICAgY2FzZSBcInRleHQvanNvblwiOlxuICAgICAgICByZXR1cm4gXCJKc29uXCI7XG4gICAgICBjYXNlIFwiYXBwbGljYXRpb24vd2FzbVwiOlxuICAgICAgICByZXR1cm4gXCJXYXNtXCI7XG4gICAgICBjYXNlIFwidGV4dC9wbGFpblwiOlxuICAgICAgY2FzZSBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiOlxuICAgICAgICByZXR1cm4gbWVkaWFUeXBlRnJvbVNwZWNpZmllcihzcGVjaWZpZXIpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIFwiVW5rbm93blwiO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbWVkaWFUeXBlRnJvbVNwZWNpZmllcihzcGVjaWZpZXIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1hcEpzTGlrZUV4dGVuc2lvbihcbiAgc3BlY2lmaWVyOiBVUkwsXG4gIGRlZmF1bHRUeXBlOiBNZWRpYVR5cGUsXG4pOiBNZWRpYVR5cGUge1xuICBjb25zdCBwYXRoID0gc3BlY2lmaWVyLnBhdGhuYW1lO1xuICBzd2l0Y2ggKGV4dG5hbWUocGF0aCkpIHtcbiAgICBjYXNlIFwiLmpzeFwiOlxuICAgICAgcmV0dXJuIFwiSlNYXCI7XG4gICAgY2FzZSBcIi5tanNcIjpcbiAgICAgIHJldHVybiBcIk1qc1wiO1xuICAgIGNhc2UgXCIuY2pzXCI6XG4gICAgICByZXR1cm4gXCJDanNcIjtcbiAgICBjYXNlIFwiLnRzeFwiOlxuICAgICAgcmV0dXJuIFwiVFNYXCI7XG4gICAgY2FzZSBcIi50c1wiOlxuICAgICAgaWYgKHBhdGguZW5kc1dpdGgoXCIuZC50c1wiKSkge1xuICAgICAgICByZXR1cm4gXCJEdHNcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0VHlwZTtcbiAgICAgIH1cbiAgICBjYXNlIFwiLm10c1wiOiB7XG4gICAgICBpZiAocGF0aC5lbmRzV2l0aChcIi5kLm10c1wiKSkge1xuICAgICAgICByZXR1cm4gXCJEbXRzXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZGVmYXVsdFR5cGUgPT0gXCJKYXZhU2NyaXB0XCIgPyBcIk1qc1wiIDogXCJNdHNcIjtcbiAgICAgIH1cbiAgICB9XG4gICAgY2FzZSBcIi5jdHNcIjoge1xuICAgICAgaWYgKHBhdGguZW5kc1dpdGgoXCIuZC5jdHNcIikpIHtcbiAgICAgICAgcmV0dXJuIFwiRGN0c1wiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRUeXBlID09IFwiSmF2YVNjcmlwdFwiID8gXCJDanNcIiA6IFwiQ3RzXCI7XG4gICAgICB9XG4gICAgfVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZGVmYXVsdFR5cGU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lZGlhVHlwZUZyb21TcGVjaWZpZXIoc3BlY2lmaWVyOiBVUkwpOiBNZWRpYVR5cGUge1xuICBjb25zdCBwYXRoID0gc3BlY2lmaWVyLnBhdGhuYW1lO1xuICBzd2l0Y2ggKGV4dG5hbWUocGF0aCkpIHtcbiAgICBjYXNlIFwiXCI6XG4gICAgICBpZiAocGF0aC5lbmRzV2l0aChcIi8udHNidWlsZGluZm9cIikpIHtcbiAgICAgICAgcmV0dXJuIFwiVHNCdWlsZEluZm9cIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBcIlVua25vd25cIjtcbiAgICAgIH1cbiAgICBjYXNlIFwiLnRzXCI6XG4gICAgICBpZiAocGF0aC5lbmRzV2l0aChcIi5kLnRzXCIpKSB7XG4gICAgICAgIHJldHVybiBcIkR0c1wiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFwiVHlwZVNjcmlwdFwiO1xuICAgICAgfVxuICAgIGNhc2UgXCIubXRzXCI6XG4gICAgICBpZiAocGF0aC5lbmRzV2l0aChcIi5kLm10c1wiKSkge1xuICAgICAgICByZXR1cm4gXCJEbXRzXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gXCJNdHNcIjtcbiAgICAgIH1cbiAgICBjYXNlIFwiLmN0c1wiOlxuICAgICAgaWYgKHBhdGguZW5kc1dpdGgoXCIuZC5jdHNcIikpIHtcbiAgICAgICAgcmV0dXJuIFwiRGN0c1wiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFwiQ3RzXCI7XG4gICAgICB9XG4gICAgY2FzZSBcIi50c3hcIjpcbiAgICAgIHJldHVybiBcIlRTWFwiO1xuICAgIGNhc2UgXCIuanNcIjpcbiAgICAgIHJldHVybiBcIkphdmFTY3JpcHRcIjtcbiAgICBjYXNlIFwiLmpzeFwiOlxuICAgICAgcmV0dXJuIFwiSlNYXCI7XG4gICAgY2FzZSBcIi5tanNcIjpcbiAgICAgIHJldHVybiBcIk1qc1wiO1xuICAgIGNhc2UgXCIuY2pzXCI6XG4gICAgICByZXR1cm4gXCJDanNcIjtcbiAgICBjYXNlIFwiLmpzb25cIjpcbiAgICAgIHJldHVybiBcIkpzb25cIjtcbiAgICBjYXNlIFwiLndhc21cIjpcbiAgICAgIHJldHVybiBcIldhc21cIjtcbiAgICBjYXNlIFwiLnRzYnVpbGRpbmZvXCI6XG4gICAgICByZXR1cm4gXCJUc0J1aWxkSW5mb1wiO1xuICAgIGNhc2UgXCIubWFwXCI6XG4gICAgICByZXR1cm4gXCJTb3VyY2VNYXBcIjtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFwiVW5rbm93blwiO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTnBtU3BlY2lmaWVyIHtcbiAgbmFtZTogc3RyaW5nO1xuICB2ZXJzaW9uOiBzdHJpbmcgfCBudWxsO1xuICBwYXRoOiBzdHJpbmcgfCBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VOcG1TcGVjaWZpZXIoc3BlY2lmaWVyOiBVUkwpOiBOcG1TcGVjaWZpZXIge1xuICBpZiAoc3BlY2lmaWVyLnByb3RvY29sICE9PSBcIm5wbTpcIikgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBucG0gc3BlY2lmaWVyXCIpO1xuICBjb25zdCBwYXRoID0gc3BlY2lmaWVyLnBhdGhuYW1lO1xuICBjb25zdCBzdGFydEluZGV4ID0gcGF0aFswXSA9PT0gXCIvXCIgPyAxIDogMDtcbiAgbGV0IHBhdGhTdGFydEluZGV4O1xuICBsZXQgdmVyc2lvblN0YXJ0SW5kZXg7XG4gIGlmIChwYXRoW3N0YXJ0SW5kZXhdID09PSBcIkBcIikge1xuICAgIGNvbnN0IGZpcnN0U2xhc2ggPSBwYXRoLmluZGV4T2YoXCIvXCIsIHN0YXJ0SW5kZXgpO1xuICAgIGlmIChmaXJzdFNsYXNoID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIG5wbSBzcGVjaWZpZXI6ICR7c3BlY2lmaWVyfWApO1xuICAgIH1cbiAgICBwYXRoU3RhcnRJbmRleCA9IHBhdGguaW5kZXhPZihcIi9cIiwgZmlyc3RTbGFzaCArIDEpO1xuICAgIHZlcnNpb25TdGFydEluZGV4ID0gcGF0aC5pbmRleE9mKFwiQFwiLCBmaXJzdFNsYXNoICsgMSk7XG4gIH0gZWxzZSB7XG4gICAgcGF0aFN0YXJ0SW5kZXggPSBwYXRoLmluZGV4T2YoXCIvXCIsIHN0YXJ0SW5kZXgpO1xuICAgIHZlcnNpb25TdGFydEluZGV4ID0gcGF0aC5pbmRleE9mKFwiQFwiLCBzdGFydEluZGV4KTtcbiAgfVxuXG4gIGlmIChwYXRoU3RhcnRJbmRleCA9PT0gLTEpIHBhdGhTdGFydEluZGV4ID0gcGF0aC5sZW5ndGg7XG4gIGlmICh2ZXJzaW9uU3RhcnRJbmRleCA9PT0gLTEpIHZlcnNpb25TdGFydEluZGV4ID0gcGF0aC5sZW5ndGg7XG5cbiAgaWYgKHZlcnNpb25TdGFydEluZGV4ID4gcGF0aFN0YXJ0SW5kZXgpIHtcbiAgICB2ZXJzaW9uU3RhcnRJbmRleCA9IHBhdGhTdGFydEluZGV4O1xuICB9XG5cbiAgaWYgKHN0YXJ0SW5kZXggPT09IHZlcnNpb25TdGFydEluZGV4KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIG5wbSBzcGVjaWZpZXI6ICR7c3BlY2lmaWVyfWApO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBwYXRoLnNsaWNlKHN0YXJ0SW5kZXgsIHZlcnNpb25TdGFydEluZGV4KSxcbiAgICB2ZXJzaW9uOiB2ZXJzaW9uU3RhcnRJbmRleCA9PT0gcGF0aFN0YXJ0SW5kZXhcbiAgICAgID8gbnVsbFxuICAgICAgOiBwYXRoLnNsaWNlKHZlcnNpb25TdGFydEluZGV4ICsgMSwgcGF0aFN0YXJ0SW5kZXgpLFxuICAgIHBhdGg6IHBhdGhTdGFydEluZGV4ID09PSBwYXRoLmxlbmd0aCA/IG51bGwgOiBwYXRoLnNsaWNlKHBhdGhTdGFydEluZGV4KSxcbiAgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBKc3JTcGVjaWZpZXIge1xuICBuYW1lOiBzdHJpbmc7XG4gIHZlcnNpb246IHN0cmluZyB8IG51bGw7XG4gIHBhdGg6IHN0cmluZyB8IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUpzclNwZWNpZmllcihzcGVjaWZpZXI6IFVSTCk6IEpzclNwZWNpZmllciB7XG4gIGlmIChzcGVjaWZpZXIucHJvdG9jb2wgIT09IFwianNyOlwiKSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGpzciBzcGVjaWZpZXJcIik7XG4gIGNvbnN0IHBhdGggPSBzcGVjaWZpZXIucGF0aG5hbWU7XG4gIGNvbnN0IHN0YXJ0SW5kZXggPSBwYXRoWzBdID09PSBcIi9cIiA/IDEgOiAwO1xuICBpZiAocGF0aFtzdGFydEluZGV4XSAhPT0gXCJAXCIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQganNyIHNwZWNpZmllcjogJHtzcGVjaWZpZXJ9YCk7XG4gIH1cbiAgY29uc3QgZmlyc3RTbGFzaCA9IHBhdGguaW5kZXhPZihcIi9cIiwgc3RhcnRJbmRleCk7XG4gIGlmIChmaXJzdFNsYXNoID09PSAtMSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBqc3Igc3BlY2lmaWVyOiAke3NwZWNpZmllcn1gKTtcbiAgfVxuICBsZXQgcGF0aFN0YXJ0SW5kZXggPSBwYXRoLmluZGV4T2YoXCIvXCIsIGZpcnN0U2xhc2ggKyAxKTtcbiAgbGV0IHZlcnNpb25TdGFydEluZGV4ID0gcGF0aC5pbmRleE9mKFwiQFwiLCBmaXJzdFNsYXNoICsgMSk7XG5cbiAgaWYgKHBhdGhTdGFydEluZGV4ID09PSAtMSkgcGF0aFN0YXJ0SW5kZXggPSBwYXRoLmxlbmd0aDtcbiAgaWYgKHZlcnNpb25TdGFydEluZGV4ID09PSAtMSkgdmVyc2lvblN0YXJ0SW5kZXggPSBwYXRoLmxlbmd0aDtcblxuICBpZiAodmVyc2lvblN0YXJ0SW5kZXggPiBwYXRoU3RhcnRJbmRleCkge1xuICAgIHZlcnNpb25TdGFydEluZGV4ID0gcGF0aFN0YXJ0SW5kZXg7XG4gIH1cblxuICBpZiAoc3RhcnRJbmRleCA9PT0gdmVyc2lvblN0YXJ0SW5kZXgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQganNyIHNwZWNpZmllcjogJHtzcGVjaWZpZXJ9YCk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIG5hbWU6IHBhdGguc2xpY2Uoc3RhcnRJbmRleCwgdmVyc2lvblN0YXJ0SW5kZXgpLFxuICAgIHZlcnNpb246IHZlcnNpb25TdGFydEluZGV4ID09PSBwYXRoU3RhcnRJbmRleFxuICAgICAgPyBudWxsXG4gICAgICA6IHBhdGguc2xpY2UodmVyc2lvblN0YXJ0SW5kZXggKyAxLCBwYXRoU3RhcnRJbmRleCksXG4gICAgcGF0aDogcGF0aFN0YXJ0SW5kZXggPT09IHBhdGgubGVuZ3RoID8gbnVsbCA6IHBhdGguc2xpY2UocGF0aFN0YXJ0SW5kZXgpLFxuICB9O1xufVxuXG5jb25zdCBTTEFTSF9OT0RFX01PRFVMRVNfU0xBU0ggPSBgJHtTRVBBUkFUT1J9bm9kZV9tb2R1bGVzJHtTRVBBUkFUT1J9YDtcbmNvbnN0IFNMQVNIX05PREVfTU9EVUxFUyA9IGAke1NFUEFSQVRPUn1ub2RlX21vZHVsZXNgO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNJbk5vZGVNb2R1bGVzKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gcGF0aC5pbmNsdWRlcyhTTEFTSF9OT0RFX01PRFVMRVNfU0xBU0gpIHx8XG4gICAgcGF0aC5lbmRzV2l0aChTTEFTSF9OT0RFX01PRFVMRVMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOb2RlTW9kdWxlc1Jlc29sdXRpb24oYXJnczogZXNidWlsZC5PblJlc29sdmVBcmdzKSB7XG4gIHJldHVybiAoXG4gICAgKGFyZ3MubmFtZXNwYWNlID09PSBcIlwiIHx8IGFyZ3MubmFtZXNwYWNlID09PSBcImZpbGVcIikgJiZcbiAgICAoaXNJbk5vZGVNb2R1bGVzKGFyZ3MucmVzb2x2ZURpcikgfHwgaXNJbk5vZGVNb2R1bGVzKGFyZ3MucGF0aCkgfHxcbiAgICAgIGlzSW5Ob2RlTW9kdWxlcyhhcmdzLmltcG9ydGVyKSlcbiAgKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLE9BQU8sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxTQUFTLFFBQVEsdUJBQXVCO0FBRzNGLFNBQVMsV0FBVyxFQUFFLGFBQWEsUUFBUSw2QkFBNkI7QUFnQnhFLE9BQU8sU0FBUyxjQUNkLEdBQVcsRUFDWCxXQUF3QyxFQUN4QyxVQUE4QjtFQUU5QixNQUFNLGFBQWEsVUFBVTtFQUM3QixJQUFJLENBQUMsV0FBVyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU07SUFDdEMsV0FBVyxRQUFRLElBQUk7RUFDekI7RUFFQSxJQUFJO0VBQ0osSUFBSSxlQUFlO0VBQ25CLElBQUksZUFBZSxXQUFXO0lBQzVCLGNBQWM7TUFBQztLQUFXO0lBQzFCLGVBQWU7RUFDakIsT0FBTyxJQUFJLE1BQU0sT0FBTyxDQUFDLGNBQWM7SUFDckMsY0FBYyxZQUFZLE9BQU8sQ0FDL0IsQ0FBQztNQUNDLElBQUk7TUFFSixJQUFJLE9BQU8sZUFBZSxVQUFVO1FBQ2xDLFlBQVk7TUFDZCxPQUFPO1FBQ0wsWUFBWSxXQUFXLEVBQUU7TUFDM0I7TUFFQSxNQUFNLE1BQU0sSUFBSSxJQUFJLFdBQVcsV0FBVyxJQUFJO01B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
// denoCacheMetadata=11987818434310827213,10074820523784664485