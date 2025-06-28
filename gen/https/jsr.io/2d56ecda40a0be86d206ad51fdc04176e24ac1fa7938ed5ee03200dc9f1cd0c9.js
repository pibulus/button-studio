var _computedKey;
import { fromFileUrl } from "jsr:@std/path@^1.0.6";
import { mapContentType, mediaTypeToLoader, parseJsrSpecifier, parseNpmSpecifier } from "./shared.ts";
import { instantiate } from "./wasm/loader.generated.js";
const JSR_URL = Deno.env.get("JSR_URL") ?? "https://jsr.io";
async function readLockfile(path) {
  try {
    const data = await Deno.readTextFile(path);
    const instance = instantiate();
    return new instance.WasmLockfile(path, data);
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return null;
    }
    throw err;
  }
}
_computedKey = Symbol.dispose;
export class PortableLoader {
  #options;
  #fetchOngoing = new Map();
  #lockfile;
  #fetchModules = new Map();
  #fetchRedirects = new Map();
  constructor(options){
    this.#options = options;
  }
  [_computedKey]() {
    if (this.#lockfile != null && "free" in this.#lockfile) {
      this.#lockfile.free();
    }
  }
  async resolve(specifier) {
    switch(specifier.protocol){
      case "file:":
        {
          return {
            kind: "esm",
            specifier
          };
        }
      case "http:":
      case "https:":
      case "data:":
        {
          const module = await this.#loadRemote(specifier.href);
          return {
            kind: "esm",
            specifier: new URL(module.specifier)
          };
        }
      case "npm:":
        {
          const npmSpecifier = parseNpmSpecifier(specifier);
          return {
            kind: "npm",
            packageId: "",
            packageName: npmSpecifier.name,
            path: npmSpecifier.path ?? ""
          };
        }
      case "node:":
        {
          return {
            kind: "node",
            path: specifier.pathname
          };
        }
      case "jsr:":
        {
          const resolvedSpecifier = await this.#resolveJsrSpecifier(specifier);
          return {
            kind: "esm",
            specifier: resolvedSpecifier
          };
        }
      default:
        throw new Error(`Unsupported scheme: '${specifier.protocol}'`);
    }
  }
  async #resolveJsrSpecifier(specifier) {
    // parse the JSR specifier.
    const jsrSpecifier = parseJsrSpecifier(specifier);
    // Attempt to load the lockfile.
    if (this.#lockfile === undefined) {
      this.#lockfile = typeof this.#options.lock === "string" ? readLockfile(this.#options.lock) : null;
    }
    if (this.#lockfile instanceof Promise) {
      this.#lockfile = await this.#lockfile;
    }
    if (this.#lockfile === null) {
      throw new Error("jsr: specifiers are not supported in the portable loader without a lockfile");
    }
    const lockfile = this.#lockfile;
    // Look up the package + constraint in the lockfile.
    const id = `jsr:${jsrSpecifier.name}${jsrSpecifier.version ? `@${jsrSpecifier.version}` : ""}`;
    const resolvedVersion = lockfile.package_version(id);
    if (!resolvedVersion) {
      throw new Error(`Specifier not found in lockfile: ${id}`);
    }
    // Load the JSR manifest to find the export path.
    const manifestUrl = new URL(`./${jsrSpecifier.name}/${resolvedVersion}_meta.json`, JSR_URL);
    const manifest = await this.#loadRemote(manifestUrl.href);
    if (manifest.mediaType !== "Json") {
      throw new Error(`Expected JSON media type for JSR manifest, got: ${manifest.mediaType}`);
    }
    const manifestData = new TextDecoder().decode(manifest.data);
    const manifestJson = JSON.parse(manifestData);
    // Look up the export path in the manifest.
    const exportEntry = `.${jsrSpecifier.path ?? ""}`;
    const exportPath = manifestJson.exports[exportEntry];
    if (!exportPath) {
      throw new Error(`Package 'jsr:${jsrSpecifier.name}@${resolvedVersion}' has no export named '${exportEntry}'`);
    }
    // Return the resolved URL.
    return new URL(`./${jsrSpecifier.name}/${resolvedVersion}/${exportPath}`, JSR_URL);
  }
  async loadEsm(url) {
    let module;
    switch(url.protocol){
      case "file:":
        {
          module = await this.#loadLocal(url);
          break;
        }
      case "http:":
      case "https:":
      case "data:":
        {
          module = await this.#loadRemote(url.href);
          break;
        }
      default:
        throw new Error("[unreachable] unsupported esm scheme " + url.protocol);
    }
    const loader = mediaTypeToLoader(module.mediaType);
    if (loader === null) return undefined;
    const res = {
      contents: module.data,
      loader
    };
    if (url.protocol === "file:") {
      res.watchFiles = [
        fromFileUrl(module.specifier)
      ];
    }
    return res;
  }
  #resolveRemote(specifier) {
    return this.#fetchRedirects.get(specifier) ?? specifier;
  }
  async #loadRemote(specifier) {
    for(let i = 0; i < 10; i++){
      specifier = this.#resolveRemote(specifier);
      const module = this.#fetchModules.get(specifier);
      if (module) return module;
      let promise = this.#fetchOngoing.get(specifier);
      if (!promise) {
        promise = this.#fetch(specifier);
        this.#fetchOngoing.set(specifier, promise);
      }
      await promise;
    }
    throw new Error("Too many redirects. Last one: " + specifier);
  }
  async #fetch(specifier) {
    const resp = await fetch(specifier, {
      redirect: "manual"
    });
    if (resp.status < 200 && resp.status >= 400) {
      throw new Error(`Encountered status code ${resp.status} while fetching ${specifier}.`);
    }
    if (resp.status >= 300 && resp.status < 400) {
      await resp.body?.cancel();
      const location = resp.headers.get("location");
      if (!location) {
        throw new Error(`Redirected without location header while fetching ${specifier}.`);
      }
      const url = new URL(location, specifier);
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        throw new Error(`Redirected to unsupported protocol '${url.protocol}' while fetching ${specifier}.`);
      }
      this.#fetchRedirects.set(specifier, url.href);
      return;
    }
    const contentType = resp.headers.get("content-type");
    const mediaType = mapContentType(new URL(specifier), contentType);
    const data = new Uint8Array(await resp.arrayBuffer());
    this.#fetchModules.set(specifier, {
      specifier,
      mediaType,
      data
    });
  }
  async #loadLocal(specifier) {
    const path = fromFileUrl(specifier);
    const mediaType = mapContentType(specifier, null);
    const data = await Deno.readFile(path);
    return {
      specifier: specifier.href,
      mediaType,
      data
    };
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BsdWNhL2VzYnVpbGQtZGVuby1sb2FkZXIvMC4xMS4wL3NyYy9sb2FkZXJfcG9ydGFibGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgKiBhcyBlc2J1aWxkIGZyb20gXCIuL2VzYnVpbGRfdHlwZXMudHNcIjtcbmltcG9ydCB7IGZyb21GaWxlVXJsIH0gZnJvbSBcImpzcjpAc3RkL3BhdGhAXjEuMC42XCI7XG5pbXBvcnQgdHlwZSAqIGFzIGRlbm8gZnJvbSBcIi4vZGVuby50c1wiO1xuaW1wb3J0IHtcbiAgdHlwZSBMb2FkZXIsXG4gIHR5cGUgTG9hZGVyUmVzb2x1dGlvbixcbiAgbWFwQ29udGVudFR5cGUsXG4gIG1lZGlhVHlwZVRvTG9hZGVyLFxuICBwYXJzZUpzclNwZWNpZmllcixcbiAgcGFyc2VOcG1TcGVjaWZpZXIsXG59IGZyb20gXCIuL3NoYXJlZC50c1wiO1xuaW1wb3J0IHsgaW5zdGFudGlhdGUsIHR5cGUgV2FzbUxvY2tmaWxlIH0gZnJvbSBcIi4vd2FzbS9sb2FkZXIuZ2VuZXJhdGVkLmpzXCI7XG5cbmludGVyZmFjZSBNb2R1bGUge1xuICBzcGVjaWZpZXI6IHN0cmluZztcbiAgbWVkaWFUeXBlOiBkZW5vLk1lZGlhVHlwZTtcbiAgZGF0YTogVWludDhBcnJheTtcbn1cblxuY29uc3QgSlNSX1VSTCA9IERlbm8uZW52LmdldChcIkpTUl9VUkxcIikgPz8gXCJodHRwczovL2pzci5pb1wiO1xuXG5hc3luYyBmdW5jdGlvbiByZWFkTG9ja2ZpbGUocGF0aDogc3RyaW5nKTogUHJvbWlzZTxXYXNtTG9ja2ZpbGUgfCBudWxsPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IERlbm8ucmVhZFRleHRGaWxlKHBhdGgpO1xuICAgIGNvbnN0IGluc3RhbmNlID0gaW5zdGFudGlhdGUoKTtcbiAgICByZXR1cm4gbmV3IGluc3RhbmNlLldhc21Mb2NrZmlsZShwYXRoLCBkYXRhKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLk5vdEZvdW5kKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdGhyb3cgZXJyO1xuICB9XG59XG5cbmludGVyZmFjZSBQb3J0YWJsZUxvYWRlck9wdGlvbnMge1xuICBsb2NrPzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgUG9ydGFibGVMb2FkZXIgaW1wbGVtZW50cyBMb2FkZXIsIERpc3Bvc2FibGUge1xuICAjb3B0aW9uczogUG9ydGFibGVMb2FkZXJPcHRpb25zO1xuICAjZmV0Y2hPbmdvaW5nID0gbmV3IE1hcDxzdHJpbmcsIFByb21pc2U8dm9pZD4+KCk7XG4gICNsb2NrZmlsZTogUHJvbWlzZTxXYXNtTG9ja2ZpbGUgfCBudWxsPiB8IFdhc21Mb2NrZmlsZSB8IG51bGwgfCB1bmRlZmluZWQ7XG5cbiAgI2ZldGNoTW9kdWxlcyA9IG5ldyBNYXA8c3RyaW5nLCBNb2R1bGU+KCk7XG4gICNmZXRjaFJlZGlyZWN0cyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogUG9ydGFibGVMb2FkZXJPcHRpb25zKSB7XG4gICAgdGhpcy4jb3B0aW9ucyA9IG9wdGlvbnM7XG4gIH1cblxuICBbU3ltYm9sLmRpc3Bvc2VdKCkge1xuICAgIGlmICh0aGlzLiNsb2NrZmlsZSAhPSBudWxsICYmIFwiZnJlZVwiIGluIHRoaXMuI2xvY2tmaWxlKSB7XG4gICAgICB0aGlzLiNsb2NrZmlsZS5mcmVlKCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcmVzb2x2ZShzcGVjaWZpZXI6IFVSTCk6IFByb21pc2U8TG9hZGVyUmVzb2x1dGlvbj4ge1xuICAgIHN3aXRjaCAoc3BlY2lmaWVyLnByb3RvY29sKSB7XG4gICAgICBjYXNlIFwiZmlsZTpcIjoge1xuICAgICAgICByZXR1cm4geyBraW5kOiBcImVzbVwiLCBzcGVjaWZpZXIgfTtcbiAgICAgIH1cbiAgICAgIGNhc2UgXCJodHRwOlwiOlxuICAgICAgY2FzZSBcImh0dHBzOlwiOlxuICAgICAgY2FzZSBcImRhdGE6XCI6IHtcbiAgICAgICAgY29uc3QgbW9kdWxlID0gYXdhaXQgdGhpcy4jbG9hZFJlbW90ZShzcGVjaWZpZXIuaHJlZik7XG4gICAgICAgIHJldHVybiB7IGtpbmQ6IFwiZXNtXCIsIHNwZWNpZmllcjogbmV3IFVSTChtb2R1bGUuc3BlY2lmaWVyKSB9O1xuICAgICAgfVxuICAgICAgY2FzZSBcIm5wbTpcIjoge1xuICAgICAgICBjb25zdCBucG1TcGVjaWZpZXIgPSBwYXJzZU5wbVNwZWNpZmllcihzcGVjaWZpZXIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGtpbmQ6IFwibnBtXCIsXG4gICAgICAgICAgcGFja2FnZUlkOiBcIlwiLFxuICAgICAgICAgIHBhY2thZ2VOYW1lOiBucG1TcGVjaWZpZXIubmFtZSxcbiAgICAgICAgICBwYXRoOiBucG1TcGVjaWZpZXIucGF0aCA/PyBcIlwiLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgY2FzZSBcIm5vZGU6XCI6IHtcbiAgICAgICAgcmV0dXJuIHsga2luZDogXCJub2RlXCIsIHBhdGg6IHNwZWNpZmllci5wYXRobmFtZSB9O1xuICAgICAgfVxuICAgICAgY2FzZSBcImpzcjpcIjoge1xuICAgICAgICBjb25zdCByZXNvbHZlZFNwZWNpZmllciA9IGF3YWl0IHRoaXMuI3Jlc29sdmVKc3JTcGVjaWZpZXIoc3BlY2lmaWVyKTtcbiAgICAgICAgcmV0dXJuIHsga2luZDogXCJlc21cIiwgc3BlY2lmaWVyOiByZXNvbHZlZFNwZWNpZmllciB9O1xuICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBzY2hlbWU6ICcke3NwZWNpZmllci5wcm90b2NvbH0nYCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgI3Jlc29sdmVKc3JTcGVjaWZpZXIoc3BlY2lmaWVyOiBVUkwpOiBQcm9taXNlPFVSTD4ge1xuICAgIC8vIHBhcnNlIHRoZSBKU1Igc3BlY2lmaWVyLlxuICAgIGNvbnN0IGpzclNwZWNpZmllciA9IHBhcnNlSnNyU3BlY2lmaWVyKHNwZWNpZmllcik7XG5cbiAgICAvLyBBdHRlbXB0IHRvIGxvYWQgdGhlIGxvY2tmaWxlLlxuICAgIGlmICh0aGlzLiNsb2NrZmlsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLiNsb2NrZmlsZSA9IHR5cGVvZiB0aGlzLiNvcHRpb25zLmxvY2sgPT09IFwic3RyaW5nXCJcbiAgICAgICAgPyByZWFkTG9ja2ZpbGUodGhpcy4jb3B0aW9ucy5sb2NrKVxuICAgICAgICA6IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLiNsb2NrZmlsZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgIHRoaXMuI2xvY2tmaWxlID0gYXdhaXQgdGhpcy4jbG9ja2ZpbGU7XG4gICAgfVxuICAgIGlmICh0aGlzLiNsb2NrZmlsZSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBcImpzcjogc3BlY2lmaWVycyBhcmUgbm90IHN1cHBvcnRlZCBpbiB0aGUgcG9ydGFibGUgbG9hZGVyIHdpdGhvdXQgYSBsb2NrZmlsZVwiLFxuICAgICAgKTtcbiAgICB9XG4gICAgY29uc3QgbG9ja2ZpbGUgPSB0aGlzLiNsb2NrZmlsZTtcbiAgICAvLyBMb29rIHVwIHRoZSBwYWNrYWdlICsgY29uc3RyYWludCBpbiB0aGUgbG9ja2ZpbGUuXG4gICAgY29uc3QgaWQgPSBganNyOiR7anNyU3BlY2lmaWVyLm5hbWV9JHtcbiAgICAgIGpzclNwZWNpZmllci52ZXJzaW9uID8gYEAke2pzclNwZWNpZmllci52ZXJzaW9ufWAgOiBcIlwiXG4gICAgfWA7XG4gICAgY29uc3QgcmVzb2x2ZWRWZXJzaW9uID0gbG9ja2ZpbGUucGFja2FnZV92ZXJzaW9uKGlkKTtcbiAgICBpZiAoIXJlc29sdmVkVmVyc2lvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBTcGVjaWZpZXIgbm90IGZvdW5kIGluIGxvY2tmaWxlOiAke2lkfWApO1xuICAgIH1cblxuICAgIC8vIExvYWQgdGhlIEpTUiBtYW5pZmVzdCB0byBmaW5kIHRoZSBleHBvcnQgcGF0aC5cbiAgICBjb25zdCBtYW5pZmVzdFVybCA9IG5ldyBVUkwoXG4gICAgICBgLi8ke2pzclNwZWNpZmllci5uYW1lfS8ke3Jlc29sdmVkVmVyc2lvbn1fbWV0YS5qc29uYCxcbiAgICAgIEpTUl9VUkwsXG4gICAgKTtcbiAgICBjb25zdCBtYW5pZmVzdCA9IGF3YWl0IHRoaXMuI2xvYWRSZW1vdGUobWFuaWZlc3RVcmwuaHJlZik7XG4gICAgaWYgKG1hbmlmZXN0Lm1lZGlhVHlwZSAhPT0gXCJKc29uXCIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEV4cGVjdGVkIEpTT04gbWVkaWEgdHlwZSBmb3IgSlNSIG1hbmlmZXN0LCBnb3Q6ICR7bWFuaWZlc3QubWVkaWFUeXBlfWAsXG4gICAgICApO1xuICAgIH1cbiAgICBjb25zdCBtYW5pZmVzdERhdGEgPSBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUobWFuaWZlc3QuZGF0YSk7XG4gICAgY29uc3QgbWFuaWZlc3RKc29uID0gSlNPTi5wYXJzZShtYW5pZmVzdERhdGEpO1xuXG4gICAgLy8gTG9vayB1cCB0aGUgZXhwb3J0IHBhdGggaW4gdGhlIG1hbmlmZXN0LlxuICAgIGNvbnN0IGV4cG9ydEVudHJ5ID0gYC4ke2pzclNwZWNpZmllci5wYXRoID8/IFwiXCJ9YDtcbiAgICBjb25zdCBleHBvcnRQYXRoID0gbWFuaWZlc3RKc29uLmV4cG9ydHNbZXhwb3J0RW50cnldO1xuICAgIGlmICghZXhwb3J0UGF0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgUGFja2FnZSAnanNyOiR7anNyU3BlY2lmaWVyLm5hbWV9QCR7cmVzb2x2ZWRWZXJzaW9ufScgaGFzIG5vIGV4cG9ydCBuYW1lZCAnJHtleHBvcnRFbnRyeX0nYCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIHRoZSByZXNvbHZlZCBVUkwuXG4gICAgcmV0dXJuIG5ldyBVUkwoXG4gICAgICBgLi8ke2pzclNwZWNpZmllci5uYW1lfS8ke3Jlc29sdmVkVmVyc2lvbn0vJHtleHBvcnRQYXRofWAsXG4gICAgICBKU1JfVVJMLFxuICAgICk7XG4gIH1cblxuICBhc3luYyBsb2FkRXNtKHVybDogVVJMKTogUHJvbWlzZTxlc2J1aWxkLk9uTG9hZFJlc3VsdCB8IHVuZGVmaW5lZD4ge1xuICAgIGxldCBtb2R1bGU6IE1vZHVsZTtcbiAgICBzd2l0Y2ggKHVybC5wcm90b2NvbCkge1xuICAgICAgY2FzZSBcImZpbGU6XCI6IHtcbiAgICAgICAgbW9kdWxlID0gYXdhaXQgdGhpcy4jbG9hZExvY2FsKHVybCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSBcImh0dHA6XCI6XG4gICAgICBjYXNlIFwiaHR0cHM6XCI6XG4gICAgICBjYXNlIFwiZGF0YTpcIjoge1xuICAgICAgICBtb2R1bGUgPSBhd2FpdCB0aGlzLiNsb2FkUmVtb3RlKHVybC5ocmVmKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJbdW5yZWFjaGFibGVdIHVuc3VwcG9ydGVkIGVzbSBzY2hlbWUgXCIgKyB1cmwucHJvdG9jb2wpO1xuICAgIH1cblxuICAgIGNvbnN0IGxvYWRlciA9IG1lZGlhVHlwZVRvTG9hZGVyKG1vZHVsZS5tZWRpYVR5cGUpO1xuICAgIGlmIChsb2FkZXIgPT09IG51bGwpIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgICBjb25zdCByZXM6IGVzYnVpbGQuT25Mb2FkUmVzdWx0ID0geyBjb250ZW50czogbW9kdWxlLmRhdGEsIGxvYWRlciB9O1xuICAgIGlmICh1cmwucHJvdG9jb2wgPT09IFwiZmlsZTpcIikge1xuICAgICAgcmVzLndhdGNoRmlsZXMgPSBbZnJvbUZpbGVVcmwobW9kdWxlLnNwZWNpZmllcildO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgI3Jlc29sdmVSZW1vdGUoc3BlY2lmaWVyOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLiNmZXRjaFJlZGlyZWN0cy5nZXQoc3BlY2lmaWVyKSA/PyBzcGVjaWZpZXI7XG4gIH1cblxuICBhc3luYyAjbG9hZFJlbW90ZShzcGVjaWZpZXI6IHN0cmluZyk6IFByb21pc2U8TW9kdWxlPiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICBzcGVjaWZpZXIgPSB0aGlzLiNyZXNvbHZlUmVtb3RlKHNwZWNpZmllcik7XG4gICAgICBjb25zdCBtb2R1bGUgPSB0aGlzLiNmZXRjaE1vZHVsZXMuZ2V0KHNwZWNpZmllcik7XG4gICAgICBpZiAobW9kdWxlKSByZXR1cm4gbW9kdWxlO1xuXG4gICAgICBsZXQgcHJvbWlzZSA9IHRoaXMuI2ZldGNoT25nb2luZy5nZXQoc3BlY2lmaWVyKTtcbiAgICAgIGlmICghcHJvbWlzZSkge1xuICAgICAgICBwcm9taXNlID0gdGhpcy4jZmV0Y2goc3BlY2lmaWVyKTtcbiAgICAgICAgdGhpcy4jZmV0Y2hPbmdvaW5nLnNldChzcGVjaWZpZXIsIHByb21pc2UpO1xuICAgICAgfVxuXG4gICAgICBhd2FpdCBwcm9taXNlO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihcIlRvbyBtYW55IHJlZGlyZWN0cy4gTGFzdCBvbmU6IFwiICsgc3BlY2lmaWVyKTtcbiAgfVxuXG4gIGFzeW5jICNmZXRjaChzcGVjaWZpZXI6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChzcGVjaWZpZXIsIHtcbiAgICAgIHJlZGlyZWN0OiBcIm1hbnVhbFwiLFxuICAgIH0pO1xuICAgIGlmIChyZXNwLnN0YXR1cyA8IDIwMCAmJiByZXNwLnN0YXR1cyA+PSA0MDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEVuY291bnRlcmVkIHN0YXR1cyBjb2RlICR7cmVzcC5zdGF0dXN9IHdoaWxlIGZldGNoaW5nICR7c3BlY2lmaWVyfS5gLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAocmVzcC5zdGF0dXMgPj0gMzAwICYmIHJlc3Auc3RhdHVzIDwgNDAwKSB7XG4gICAgICBhd2FpdCByZXNwLmJvZHk/LmNhbmNlbCgpO1xuICAgICAgY29uc3QgbG9jYXRpb24gPSByZXNwLmhlYWRlcnMuZ2V0KFwibG9jYXRpb25cIik7XG4gICAgICBpZiAoIWxvY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgUmVkaXJlY3RlZCB3aXRob3V0IGxvY2F0aW9uIGhlYWRlciB3aGlsZSBmZXRjaGluZyAke3NwZWNpZmllcn0uYCxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChsb2NhdGlvbiwgc3BlY2lmaWVyKTtcbiAgICAgIGlmICh1cmwucHJvdG9jb2wgIT09IFwiaHR0cHM6XCIgJiYgdXJsLnByb3RvY29sICE9PSBcImh0dHA6XCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBSZWRpcmVjdGVkIHRvIHVuc3VwcG9ydGVkIHByb3RvY29sICcke3VybC5wcm90b2NvbH0nIHdoaWxlIGZldGNoaW5nICR7c3BlY2lmaWVyfS5gLFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiNmZXRjaFJlZGlyZWN0cy5zZXQoc3BlY2lmaWVyLCB1cmwuaHJlZik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY29udGVudFR5cGUgPSByZXNwLmhlYWRlcnMuZ2V0KFwiY29udGVudC10eXBlXCIpO1xuICAgIGNvbnN0IG1lZGlhVHlwZSA9IG1hcENvbnRlbnRUeXBlKG5ldyBVUkwoc3BlY2lmaWVyKSwgY29udGVudFR5cGUpO1xuXG4gICAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KGF3YWl0IHJlc3AuYXJyYXlCdWZmZXIoKSk7XG4gICAgdGhpcy4jZmV0Y2hNb2R1bGVzLnNldChzcGVjaWZpZXIsIHtcbiAgICAgIHNwZWNpZmllcixcbiAgICAgIG1lZGlhVHlwZSxcbiAgICAgIGRhdGEsXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyAjbG9hZExvY2FsKHNwZWNpZmllcjogVVJMKTogUHJvbWlzZTxNb2R1bGU+IHtcbiAgICBjb25zdCBwYXRoID0gZnJvbUZpbGVVcmwoc3BlY2lmaWVyKTtcblxuICAgIGNvbnN0IG1lZGlhVHlwZSA9IG1hcENvbnRlbnRUeXBlKHNwZWNpZmllciwgbnVsbCk7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IERlbm8ucmVhZEZpbGUocGF0aCk7XG5cbiAgICByZXR1cm4geyBzcGVjaWZpZXI6IHNwZWNpZmllci5ocmVmLCBtZWRpYVR5cGUsIGRhdGEgfTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxTQUFTLFdBQVcsUUFBUSx1QkFBdUI7QUFFbkQsU0FHRSxjQUFjLEVBQ2QsaUJBQWlCLEVBQ2pCLGlCQUFpQixFQUNqQixpQkFBaUIsUUFDWixjQUFjO0FBQ3JCLFNBQVMsV0FBVyxRQUEyQiw2QkFBNkI7QUFRNUUsTUFBTSxVQUFVLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxjQUFjO0FBRTNDLGVBQWUsYUFBYSxJQUFZO0VBQ3RDLElBQUk7SUFDRixNQUFNLE9BQU8sTUFBTSxLQUFLLFlBQVksQ0FBQztJQUNyQyxNQUFNLFdBQVc7SUFDakIsT0FBTyxJQUFJLFNBQVMsWUFBWSxDQUFDLE1BQU07RUFDekMsRUFBRSxPQUFPLEtBQUs7SUFDWixJQUFJLGVBQWUsS0FBSyxNQUFNLENBQUMsUUFBUSxFQUFFO01BQ3ZDLE9BQU87SUFDVDtJQUNBLE1BQU07RUFDUjtBQUNGO2VBa0JHLE9BQU8sT0FBTztBQVpqQixPQUFPLE1BQU07RUFDWCxDQUFBLE9BQVEsQ0FBd0I7RUFDaEMsQ0FBQSxZQUFhLEdBQUcsSUFBSSxNQUE2QjtFQUNqRCxDQUFBLFFBQVMsQ0FBaUU7RUFFMUUsQ0FBQSxZQUFhLEdBQUcsSUFBSSxNQUFzQjtFQUMxQyxDQUFBLGNBQWUsR0FBRyxJQUFJLE1BQXNCO0VBRTVDLFlBQVksT0FBOEIsQ0FBRTtJQUMxQyxJQUFJLENBQUMsQ0FBQSxPQUFRLEdBQUc7RUFDbEI7RUFFQSxpQkFBbUI7SUFDakIsSUFBSSxJQUFJLENBQUMsQ0FBQSxRQUFTLElBQUksUUFBUSxVQUFVLElBQUksQ0FBQyxDQUFBLFFBQVMsRUFBRTtNQUN0RCxJQUFJLENBQUMsQ0FBQSxRQUFTLENBQUMsSUFBSTtJQUNyQjtFQUNGO0VBRUEsTUFBTSxRQUFRLFNBQWMsRUFBNkI7SUFDdkQsT0FBUSxVQUFVLFFBQVE7TUFDeEIsS0FBSztRQUFTO1VBQ1osT0FBTztZQUFFLE1BQU07WUFBTztVQUFVO1FBQ2xDO01BQ0EsS0FBSztNQUNMLEtBQUs7TUFDTCxLQUFLO1FBQVM7VUFDWixNQUFNLFNBQVMsTUFBTSxJQUFJLENBQUMsQ0FBQSxVQUFXLENBQUMsVUFBVSxJQUFJO1VBQ3BELE9BQU87WUFBRSxNQUFNO1lBQU8sV0FBVyxJQUFJLElBQUksT0FBTyxTQUFTO1VBQUU7UUFDN0Q7TUFDQSxLQUFLO1FBQVE7VUFDWCxNQUFNLGVBQWUsa0JBQWtCO1VBQ3ZDLE9BQU87WUFDTCxNQUFNO1lBQ04sV0FBVztZQUNYLGFBQWEsYUFBYSxJQUFJO1lBQzlCLE1BQU0sYUFBYSxJQUFJLElBQUk7VUFDN0I7UUFDRjtNQUNBLEtBQUs7UUFBUztVQUNaLE9BQU87WUFBRSxNQUFNO1lBQVEsTUFBTSxVQUFVLFFBQVE7VUFBQztRQUNsRDtNQUNBLEtBQUs7UUFBUTtVQUNYLE1BQU0sb0JBQW9CLE1BQU0sSUFBSSxDQUFDLENBQUEsbUJBQW9CLENBQUM7VUFDMUQsT0FBTztZQUFFLE1BQU07WUFBTyxXQUFXO1VBQWtCO1FBQ3JEO01BQ0E7UUFDRSxNQUFNLElBQUksTUFBTSxDQUFDLHFCQUFxQixFQUFFLFVBQVUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUNqRTtFQUNGO0VBRUEsTUFBTSxDQUFBLG1CQUFvQixDQUFDLFNBQWM7SUFDdkMsMkJBQTJCO0lBQzNCLE1BQU0sZUFBZSxrQkFBa0I7SUFFdkMsZ0NBQWdDO0lBQ2hDLElBQUksSUFBSSxDQUFDLENBQUEsUUFBUyxLQUFLLFdBQVc7TUFDaEMsSUFBSSxDQUFDLENBQUEsUUFBUyxHQUFHLE9BQU8sSUFBSSxDQUFDLENBQUEsT0FBUSxDQUFDLElBQUksS0FBSyxXQUMzQyxhQUFhLElBQUksQ0FBQyxDQUFBLE9BQVEsQ0FBQyxJQUFJLElBQy9CO0lBQ047SUFDQSxJQUFJLElBQUksQ0FBQyxDQUFBLFFBQVMsWUFBWSxTQUFTO01BQ3JDLElBQUksQ0FBQyxDQUFBLFFBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxDQUFBLFFBQVM7SUFDdkM7SUFDQSxJQUFJLElBQUksQ0FBQyxDQUFBLFFBQVMsS0FBSyxNQUFNO01BQzNCLE1BQU0sSUFBSSxNQUNSO0lBRUo7SUFDQSxNQUFNLFdBQVcsSUFBSSxDQUFDLENBQUEsUUFBUztJQUMvQixvREFBb0Q7SUFDcEQsTUFBTSxLQUFLLENBQUMsSUFBSSxFQUFFLGFBQWEsSUFBSSxHQUNqQyxhQUFhLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRSxhQUFhLE9BQU8sRUFBRSxHQUFHLElBQ3BEO0lBQ0YsTUFBTSxrQkFBa0IsU0FBUyxlQUFlLENBQUM7SUFDakQsSUFBSSxDQUFDLGlCQUFpQjtNQUNwQixNQUFNLElBQUksTUFBTSxDQUFDLGlDQUFpQyxFQUFFLElBQUk7SUFDMUQ7SUFFQSxpREFBaUQ7SUFDakQsTUFBTSxjQUFjLElBQUksSUFDdEIsQ0FBQyxFQUFFLEVBQUUsYUFBYSxJQUFJLENBQUMsQ0FBQyxFQUFFLGdCQUFnQixVQUFVLENBQUMsRUFDckQ7SUFFRixNQUFNLFdBQVcsTUFBTSxJQUFJLENBQUMsQ0FBQSxVQUFXLENBQUMsWUFBWSxJQUFJO0lBQ3hELElBQUksU0FBUyxTQUFTLEtBQUssUUFBUTtNQUNqQyxNQUFNLElBQUksTUFDUixDQUFDLGdEQUFnRCxFQUFFLFNBQVMsU0FBUyxFQUFFO0lBRTNFO0lBQ0EsTUFBTSxlQUFlLElBQUksY0FBYyxNQUFNLENBQUMsU0FBUyxJQUFJO0lBQzNELE1BQU0sZUFBZSxLQUFLLEtBQUssQ0FBQztJQUVoQywyQ0FBMkM7SUFDM0MsTUFBTSxjQUFjLENBQUMsQ0FBQyxFQUFFLGFBQWEsSUFBSSxJQUFJLElBQUk7SUFDakQsTUFBTSxhQUFhLGFBQWEsT0FBTyxDQUFDLFlBQVk7SUFDcEQsSUFBSSxDQUFDLFlBQVk7TUFDZixNQUFNLElBQUksTUFDUixDQUFDLGFBQWEsRUFBRSxhQUFhLElBQUksQ0FBQyxDQUFDLEVBQUUsZ0JBQWdCLHVCQUF1QixFQUFFLFlBQVksQ0FBQyxDQUFDO0lBRWhHO0lBRUEsMkJBQTJCO0lBQzNCLE9BQU8sSUFBSSxJQUNULENBQUMsRUFBRSxFQUFFLGFBQWEsSUFBSSxDQUFDLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLFlBQVksRUFDekQ7RUFFSjtFQUVBLE1BQU0sUUFBUSxHQUFRLEVBQTZDO0lBQ2pFLElBQUk7SUFDSixPQUFRLElBQUksUUFBUTtNQUNsQixLQUFLO1FBQVM7VUFDWixTQUFTLE1BQU0sSUFBSSxDQUFDLENBQUEsU0FBVSxDQUFDO1VBQy9CO1FBQ0Y7TUFDQSxLQUFLO01BQ0wsS0FBSztNQUNMLEtBQUs7UUFBUztVQUNaLFNBQVMsTUFBTSxJQUFJLENBQUMsQ0FBQSxVQUFXLENBQUMsSUFBSSxJQUFJO1VBQ3hDO1FBQ0Y7TUFDQTtRQUNFLE1BQU0sSUFBSSxNQUFNLDBDQUEwQyxJQUFJLFFBQVE7SUFDMUU7SUFFQSxNQUFNLFNBQVMsa0JBQWtCLE9BQU8sU0FBUztJQUNqRCxJQUFJLFdBQVcsTUFBTSxPQUFPO0lBRTVCLE1BQU0sTUFBNEI7TUFBRSxVQUFVLE9BQU8sSUFBSTtNQUFFO0lBQU87SUFDbEUsSUFBSSxJQUFJLFFBQVEsS0FBSyxTQUFTO01BQzVCLElBQUksVUFBVSxHQUFHO1FBQUMsWUFBWSxPQUFPLFNBQVM7T0FBRTtJQUNsRDtJQUNBLE9BQU87RUFDVDtFQUVBLENBQUEsYUFBYyxDQUFDLFNBQWlCO0lBQzlCLE9BQU8sSUFBSSxDQUFDLENBQUEsY0FBZSxDQUFDLEdBQUcsQ0FBQyxjQUFjO0VBQ2hEO0VBRUEsTUFBTSxDQUFBLFVBQVcsQ0FBQyxTQUFpQjtJQUNqQyxJQUFLLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxJQUFLO01BQzNCLFlBQVksSUFBSSxDQUFDLENBQUEsYUFBYyxDQUFDO01BQ2hDLE1BQU0sU0FBUyxJQUFJLENBQUMsQ0FBQSxZQUFhLENBQUMsR0FBRyxDQUFDO01BQ3RDLElBQUksUUFBUSxPQUFPO01BRW5CLElBQUksVUFBVSxJQUFJLENBQUMsQ0FBQSxZQUFhLENBQUMsR0FBRyxDQUFDO01BQ3JDLElBQUksQ0FBQyxTQUFTO1FBQ1osVUFBVSxJQUFJLENBQUMsQ0FBQSxLQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDLENBQUEsWUFBYSxDQUFDLEdBQUcsQ0FBQyxXQUFXO01BQ3BDO01BRUEsTUFBTTtJQUNSO0lBRUEsTUFBTSxJQUFJLE1BQU0sbUNBQW1DO0VBQ3JEO0VBRUEsTUFBTSxDQUFBLEtBQU0sQ0FBQyxTQUFpQjtJQUM1QixNQUFNLE9BQU8sTUFBTSxNQUFNLFdBQVc7TUFDbEMsVUFBVTtJQUNaO0lBQ0EsSUFBSSxLQUFLLE1BQU0sR0FBRyxPQUFPLEtBQUssTUFBTSxJQUFJLEtBQUs7TUFDM0MsTUFBTSxJQUFJLE1BQ1IsQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUV6RTtJQUVBLElBQUksS0FBSyxNQUFNLElBQUksT0FBTyxLQUFLLE1BQU0sR0FBRyxLQUFLO01BQzNDLE1BQU0sS0FBSyxJQUFJLEVBQUU7TUFDakIsTUFBTSxXQUFXLEtBQUssT0FBTyxDQUFDLEdBQUcsQ0FBQztNQUNsQyxJQUFJLENBQUMsVUFBVTtRQUNiLE1BQU0sSUFBSSxNQUNSLENBQUMsa0RBQWtELEVBQUUsVUFBVSxDQUFDLENBQUM7TUFFckU7TUFFQSxNQUFNLE1BQU0sSUFBSSxJQUFJLFVBQVU7TUFDOUIsSUFBSSxJQUFJLFFBQVEsS0FBSyxZQUFZLElBQUksUUFBUSxLQUFLLFNBQVM7UUFDekQsTUFBTSxJQUFJLE1BQ1IsQ0FBQyxvQ0FBb0MsRUFBRSxJQUFJLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxVQUFVLENBQUMsQ0FBQztNQUV2RjtNQUVBLElBQUksQ0FBQyxDQUFBLGNBQWUsQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLElBQUk7TUFDNUM7SUFDRjtJQUVBLE1BQU0sY0FBYyxLQUFLLE9BQU8sQ0FBQyxHQUFHLENBQUM7SUFDckMsTUFBTSxZQUFZLGVBQWUsSUFBSSxJQUFJLFlBQVk7SUFFckQsTUFBTSxPQUFPLElBQUksV0FBVyxNQUFNLEtBQUssV0FBVztJQUNsRCxJQUFJLENBQUMsQ0FBQSxZQUFhLENBQUMsR0FBRyxDQUFDLFdBQVc7TUFDaEM7TUFDQTtNQUNBO0lBQ0Y7RUFDRjtFQUVBLE1BQU0sQ0FBQSxTQUFVLENBQUMsU0FBYztJQUM3QixNQUFNLE9BQU8sWUFBWTtJQUV6QixNQUFNLFlBQVksZUFBZSxXQUFXO0lBQzVDLE1BQU0sT0FBTyxNQUFNLEtBQUssUUFBUSxDQUFDO0lBRWpDLE9BQU87TUFBRSxXQUFXLFVBQVUsSUFBSTtNQUFFO01BQVc7SUFBSztFQUN0RDtBQUNGIn0=
// denoCacheMetadata=11596256883870462849,11876882799546835814