import { dirname, fromFileUrl, join } from "jsr:@std/path@^1.0.6";
import { encodeBase32 } from "jsr:/@std/encoding@^1.0.5/base32";
import { lastIndexOfNeedle } from "jsr:@std/bytes@^1.0.2";
import * as deno from "./deno.ts";
import { rootInfo } from "./deno.ts";
import { mapContentType, mediaTypeFromSpecifier, mediaTypeToLoader, parseNpmSpecifier } from "./shared.ts";
let ROOT_INFO_OUTPUT;
export const DENO_CACHE_METADATA = new TextEncoder().encode("\n// denoCacheMetadata=");
export class NativeLoader {
  #nodeModulesDirManual;
  #infoCache;
  #linkDirCache = new Map();
  constructor(options){
    this.#nodeModulesDirManual = options.infoOptions?.nodeModulesDir === "manual";
    this.#infoCache = new deno.InfoCache(options.infoOptions);
  }
  async resolve(specifier) {
    // Workaround for https://github.com/denoland/deno/issues/25903
    if (this.#nodeModulesDirManual && specifier.protocol === "npm:") {
      const npmSpecifier = parseNpmSpecifier(specifier);
      return {
        kind: "npm",
        packageId: "",
        packageName: npmSpecifier.name,
        path: npmSpecifier.path ?? ""
      };
    }
    const entry = await this.#infoCache.get(specifier.href);
    if ("error" in entry) {
      if (specifier.protocol === "file:" && mediaTypeFromSpecifier(specifier) === "Unknown") {
        return {
          kind: "esm",
          specifier: new URL(entry.specifier)
        };
      }
      throw new Error(entry.error);
    }
    if (entry.kind === "npm") {
      // TODO(lucacasonato): remove parsing once https://github.com/denoland/deno/issues/18043 is resolved
      const parsed = parseNpmSpecifier(new URL(entry.specifier));
      return {
        kind: "npm",
        packageId: entry.npmPackage,
        packageName: parsed.name,
        path: parsed.path ?? ""
      };
    } else if (entry.kind === "node") {
      return {
        kind: "node",
        path: entry.specifier
      };
    }
    return {
      kind: "esm",
      specifier: new URL(entry.specifier)
    };
  }
  async loadEsm(specifier) {
    if (specifier.protocol === "data:") {
      const resp = await fetch(specifier);
      const contents = new Uint8Array(await resp.arrayBuffer());
      const contentType = resp.headers.get("content-type");
      const mediaType = mapContentType(specifier, contentType);
      const loader = mediaTypeToLoader(mediaType);
      if (loader === null) return undefined;
      return {
        contents,
        loader
      };
    }
    const entry = await this.#infoCache.get(specifier.href);
    if ("error" in entry && specifier.protocol !== "file:" && mediaTypeFromSpecifier(specifier) !== "Unknown") throw new Error(entry.error);
    if (!("local" in entry)) {
      throw new Error("[unreachable] Not an ESM module.");
    }
    if (!entry.local) throw new Error("Module not downloaded yet.");
    const loader = mediaTypeToLoader(entry.mediaType);
    if (loader === null) return undefined;
    let contents = await Deno.readFile(entry.local);
    const denoCacheMetadata = lastIndexOfNeedle(contents, DENO_CACHE_METADATA);
    if (denoCacheMetadata !== -1) {
      contents = contents.subarray(0, denoCacheMetadata);
    }
    const res = {
      contents,
      loader
    };
    if (specifier.protocol === "file:") {
      res.watchFiles = [
        fromFileUrl(specifier)
      ];
    }
    return res;
  }
  async nodeModulesDirForPackage(npmPackageId) {
    const npmPackage = this.#infoCache.getNpmPackage(npmPackageId);
    if (!npmPackage) throw new Error("NPM package not found.");
    let linkDir = this.#linkDirCache.get(npmPackageId);
    if (!linkDir) {
      linkDir = await this.#nodeModulesDirForPackageInner(npmPackageId, npmPackage);
      this.#linkDirCache.set(npmPackageId, linkDir);
    }
    return linkDir;
  }
  async #nodeModulesDirForPackageInner(npmPackageId, npmPackage) {
    let name = npmPackage.name;
    if (name.toLowerCase() !== name) {
      name = `_${encodeBase32(new TextEncoder().encode(name))}`;
    }
    if (ROOT_INFO_OUTPUT === undefined) {
      ROOT_INFO_OUTPUT = rootInfo();
    }
    if (ROOT_INFO_OUTPUT instanceof Promise) {
      ROOT_INFO_OUTPUT = await ROOT_INFO_OUTPUT;
    }
    const { denoDir, npmCache } = ROOT_INFO_OUTPUT;
    const registryUrl = npmPackage.registryUrl ?? "https://registry.npmjs.org";
    const registry = new URL(registryUrl);
    const packageDir = join(npmCache, registry.hostname, name, npmPackage.version);
    const linkDir = join(denoDir, "deno_esbuild", registry.hostname, npmPackageId, "node_modules", name);
    const linkDirParent = dirname(linkDir);
    const tmpDirParent = join(denoDir, "deno_esbuild_tmp");
    // check if the package is already linked, if so, return the link and skip
    // a bunch of work
    try {
      await Deno.stat(linkDir);
      this.#linkDirCache.set(npmPackageId, linkDir);
      return linkDir;
    } catch  {
    // directory does not yet exist
    }
    // create a temporary directory, recursively hardlink the package contents
    // into it, and then rename it to the final location
    await Deno.mkdir(tmpDirParent, {
      recursive: true
    });
    const tmpDir = await Deno.makeTempDir({
      dir: tmpDirParent
    });
    await linkRecursive(packageDir, tmpDir);
    try {
      await Deno.mkdir(linkDirParent, {
        recursive: true
      });
      await Deno.rename(tmpDir, linkDir);
    } catch (err) {
      // the directory may already have been created by someone else - check if so
      try {
        await Deno.stat(linkDir);
      } catch  {
        throw err;
      }
    }
    return linkDir;
  }
  packageIdFromNameInPackage(name, parentPackageId) {
    const parentPackage = this.#infoCache.getNpmPackage(parentPackageId);
    if (!parentPackage) throw new Error("NPM package not found.");
    if (parentPackage.name === name) return parentPackageId;
    for (const dep of parentPackage.dependencies){
      const depPackage = this.#infoCache.getNpmPackage(dep);
      if (!depPackage) throw new Error("NPM package not found.");
      if (depPackage.name === name) return dep;
    }
    return null;
  }
}
async function linkRecursive(from, to) {
  const fromStat = await Deno.stat(from);
  if (fromStat.isDirectory) {
    await Deno.mkdir(to, {
      recursive: true
    });
    for await (const entry of Deno.readDir(from)){
      await linkRecursive(join(from, entry.name), join(to, entry.name));
    }
  } else {
    await Deno.link(from, to);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BsdWNhL2VzYnVpbGQtZGVuby1sb2FkZXIvMC4xMS4wL3NyYy9sb2FkZXJfbmF0aXZlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlICogYXMgZXNidWlsZCBmcm9tIFwiLi9lc2J1aWxkX3R5cGVzLnRzXCI7XG5pbXBvcnQgeyBkaXJuYW1lLCBmcm9tRmlsZVVybCwgam9pbiB9IGZyb20gXCJqc3I6QHN0ZC9wYXRoQF4xLjAuNlwiO1xuaW1wb3J0IHsgZW5jb2RlQmFzZTMyIH0gZnJvbSBcImpzcjovQHN0ZC9lbmNvZGluZ0BeMS4wLjUvYmFzZTMyXCI7XG5pbXBvcnQgeyBsYXN0SW5kZXhPZk5lZWRsZSB9IGZyb20gXCJqc3I6QHN0ZC9ieXRlc0BeMS4wLjJcIjtcbmltcG9ydCAqIGFzIGRlbm8gZnJvbSBcIi4vZGVuby50c1wiO1xuaW1wb3J0IHsgcm9vdEluZm8sIHR5cGUgUm9vdEluZm9PdXRwdXQgfSBmcm9tIFwiLi9kZW5vLnRzXCI7XG5pbXBvcnQge1xuICB0eXBlIExvYWRlcixcbiAgdHlwZSBMb2FkZXJSZXNvbHV0aW9uLFxuICBtYXBDb250ZW50VHlwZSxcbiAgbWVkaWFUeXBlRnJvbVNwZWNpZmllcixcbiAgbWVkaWFUeXBlVG9Mb2FkZXIsXG4gIHBhcnNlTnBtU3BlY2lmaWVyLFxufSBmcm9tIFwiLi9zaGFyZWQudHNcIjtcblxubGV0IFJPT1RfSU5GT19PVVRQVVQ6IFByb21pc2U8Um9vdEluZm9PdXRwdXQ+IHwgUm9vdEluZm9PdXRwdXQgfCB1bmRlZmluZWQ7XG5cbmV4cG9ydCBjb25zdCBERU5PX0NBQ0hFX01FVEFEQVRBID0gbmV3IFRleHRFbmNvZGVyKClcbiAgLmVuY29kZShcIlxcbi8vIGRlbm9DYWNoZU1ldGFkYXRhPVwiKTtcblxuZXhwb3J0IGludGVyZmFjZSBOYXRpdmVMb2FkZXJPcHRpb25zIHtcbiAgaW5mb09wdGlvbnM/OiBkZW5vLkluZm9PcHRpb25zO1xufVxuXG5leHBvcnQgY2xhc3MgTmF0aXZlTG9hZGVyIGltcGxlbWVudHMgTG9hZGVyIHtcbiAgI25vZGVNb2R1bGVzRGlyTWFudWFsOiBib29sZWFuO1xuICAjaW5mb0NhY2hlOiBkZW5vLkluZm9DYWNoZTtcbiAgI2xpbmtEaXJDYWNoZTogTWFwPHN0cmluZywgc3RyaW5nPiA9IG5ldyBNYXAoKTsgLy8gbWFwcGluZyBmcm9tIHBhY2thZ2UgaWQgLT4gbGluayBkaXJcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBOYXRpdmVMb2FkZXJPcHRpb25zKSB7XG4gICAgdGhpcy4jbm9kZU1vZHVsZXNEaXJNYW51YWwgPVxuICAgICAgb3B0aW9ucy5pbmZvT3B0aW9ucz8ubm9kZU1vZHVsZXNEaXIgPT09IFwibWFudWFsXCI7XG4gICAgdGhpcy4jaW5mb0NhY2hlID0gbmV3IGRlbm8uSW5mb0NhY2hlKG9wdGlvbnMuaW5mb09wdGlvbnMpO1xuICB9XG5cbiAgYXN5bmMgcmVzb2x2ZShzcGVjaWZpZXI6IFVSTCk6IFByb21pc2U8TG9hZGVyUmVzb2x1dGlvbj4ge1xuICAgIC8vIFdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9kZW5vbGFuZC9kZW5vL2lzc3Vlcy8yNTkwM1xuICAgIGlmICh0aGlzLiNub2RlTW9kdWxlc0Rpck1hbnVhbCAmJiBzcGVjaWZpZXIucHJvdG9jb2wgPT09IFwibnBtOlwiKSB7XG4gICAgICBjb25zdCBucG1TcGVjaWZpZXIgPSBwYXJzZU5wbVNwZWNpZmllcihzcGVjaWZpZXIpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAga2luZDogXCJucG1cIixcbiAgICAgICAgcGFja2FnZUlkOiBcIlwiLFxuICAgICAgICBwYWNrYWdlTmFtZTogbnBtU3BlY2lmaWVyLm5hbWUsXG4gICAgICAgIHBhdGg6IG5wbVNwZWNpZmllci5wYXRoID8/IFwiXCIsXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IGVudHJ5ID0gYXdhaXQgdGhpcy4jaW5mb0NhY2hlLmdldChzcGVjaWZpZXIuaHJlZik7XG4gICAgaWYgKFwiZXJyb3JcIiBpbiBlbnRyeSkge1xuICAgICAgaWYgKFxuICAgICAgICBzcGVjaWZpZXIucHJvdG9jb2wgPT09IFwiZmlsZTpcIiAmJlxuICAgICAgICBtZWRpYVR5cGVGcm9tU3BlY2lmaWVyKHNwZWNpZmllcikgPT09IFwiVW5rbm93blwiXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIHsga2luZDogXCJlc21cIiwgc3BlY2lmaWVyOiBuZXcgVVJMKGVudHJ5LnNwZWNpZmllcikgfTtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcihlbnRyeS5lcnJvcik7XG4gICAgfVxuXG4gICAgaWYgKGVudHJ5LmtpbmQgPT09IFwibnBtXCIpIHtcbiAgICAgIC8vIFRPRE8obHVjYWNhc29uYXRvKTogcmVtb3ZlIHBhcnNpbmcgb25jZSBodHRwczovL2dpdGh1Yi5jb20vZGVub2xhbmQvZGVuby9pc3N1ZXMvMTgwNDMgaXMgcmVzb2x2ZWRcbiAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlTnBtU3BlY2lmaWVyKG5ldyBVUkwoZW50cnkuc3BlY2lmaWVyKSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBraW5kOiBcIm5wbVwiLFxuICAgICAgICBwYWNrYWdlSWQ6IGVudHJ5Lm5wbVBhY2thZ2UsXG4gICAgICAgIHBhY2thZ2VOYW1lOiBwYXJzZWQubmFtZSxcbiAgICAgICAgcGF0aDogcGFyc2VkLnBhdGggPz8gXCJcIixcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChlbnRyeS5raW5kID09PSBcIm5vZGVcIikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAga2luZDogXCJub2RlXCIsXG4gICAgICAgIHBhdGg6IGVudHJ5LnNwZWNpZmllcixcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHsga2luZDogXCJlc21cIiwgc3BlY2lmaWVyOiBuZXcgVVJMKGVudHJ5LnNwZWNpZmllcikgfTtcbiAgfVxuXG4gIGFzeW5jIGxvYWRFc20oc3BlY2lmaWVyOiBVUkwpOiBQcm9taXNlPGVzYnVpbGQuT25Mb2FkUmVzdWx0IHwgdW5kZWZpbmVkPiB7XG4gICAgaWYgKHNwZWNpZmllci5wcm90b2NvbCA9PT0gXCJkYXRhOlwiKSB7XG4gICAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goc3BlY2lmaWVyKTtcbiAgICAgIGNvbnN0IGNvbnRlbnRzID0gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgcmVzcC5hcnJheUJ1ZmZlcigpKTtcbiAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gcmVzcC5oZWFkZXJzLmdldChcImNvbnRlbnQtdHlwZVwiKTtcbiAgICAgIGNvbnN0IG1lZGlhVHlwZSA9IG1hcENvbnRlbnRUeXBlKHNwZWNpZmllciwgY29udGVudFR5cGUpO1xuICAgICAgY29uc3QgbG9hZGVyID0gbWVkaWFUeXBlVG9Mb2FkZXIobWVkaWFUeXBlKTtcbiAgICAgIGlmIChsb2FkZXIgPT09IG51bGwpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICByZXR1cm4geyBjb250ZW50cywgbG9hZGVyIH07XG4gICAgfVxuICAgIGNvbnN0IGVudHJ5ID0gYXdhaXQgdGhpcy4jaW5mb0NhY2hlLmdldChzcGVjaWZpZXIuaHJlZik7XG4gICAgaWYgKFxuICAgICAgXCJlcnJvclwiIGluIGVudHJ5ICYmIHNwZWNpZmllci5wcm90b2NvbCAhPT0gXCJmaWxlOlwiICYmXG4gICAgICBtZWRpYVR5cGVGcm9tU3BlY2lmaWVyKHNwZWNpZmllcikgIT09IFwiVW5rbm93blwiXG4gICAgKSB0aHJvdyBuZXcgRXJyb3IoZW50cnkuZXJyb3IpO1xuXG4gICAgaWYgKCEoXCJsb2NhbFwiIGluIGVudHJ5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiW3VucmVhY2hhYmxlXSBOb3QgYW4gRVNNIG1vZHVsZS5cIik7XG4gICAgfVxuICAgIGlmICghZW50cnkubG9jYWwpIHRocm93IG5ldyBFcnJvcihcIk1vZHVsZSBub3QgZG93bmxvYWRlZCB5ZXQuXCIpO1xuICAgIGNvbnN0IGxvYWRlciA9IG1lZGlhVHlwZVRvTG9hZGVyKGVudHJ5Lm1lZGlhVHlwZSk7XG4gICAgaWYgKGxvYWRlciA9PT0gbnVsbCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuICAgIGxldCBjb250ZW50cyA9IGF3YWl0IERlbm8ucmVhZEZpbGUoZW50cnkubG9jYWwpO1xuICAgIGNvbnN0IGRlbm9DYWNoZU1ldGFkYXRhID0gbGFzdEluZGV4T2ZOZWVkbGUoY29udGVudHMsIERFTk9fQ0FDSEVfTUVUQURBVEEpO1xuICAgIGlmIChkZW5vQ2FjaGVNZXRhZGF0YSAhPT0gLTEpIHtcbiAgICAgIGNvbnRlbnRzID0gY29udGVudHMuc3ViYXJyYXkoMCwgZGVub0NhY2hlTWV0YWRhdGEpO1xuICAgIH1cbiAgICBjb25zdCByZXM6IGVzYnVpbGQuT25Mb2FkUmVzdWx0ID0geyBjb250ZW50cywgbG9hZGVyIH07XG4gICAgaWYgKHNwZWNpZmllci5wcm90b2NvbCA9PT0gXCJmaWxlOlwiKSB7XG4gICAgICByZXMud2F0Y2hGaWxlcyA9IFtmcm9tRmlsZVVybChzcGVjaWZpZXIpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIGFzeW5jIG5vZGVNb2R1bGVzRGlyRm9yUGFja2FnZShucG1QYWNrYWdlSWQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgbnBtUGFja2FnZSA9IHRoaXMuI2luZm9DYWNoZS5nZXROcG1QYWNrYWdlKG5wbVBhY2thZ2VJZCk7XG4gICAgaWYgKCFucG1QYWNrYWdlKSB0aHJvdyBuZXcgRXJyb3IoXCJOUE0gcGFja2FnZSBub3QgZm91bmQuXCIpO1xuXG4gICAgbGV0IGxpbmtEaXIgPSB0aGlzLiNsaW5rRGlyQ2FjaGUuZ2V0KG5wbVBhY2thZ2VJZCk7XG4gICAgaWYgKCFsaW5rRGlyKSB7XG4gICAgICBsaW5rRGlyID0gYXdhaXQgdGhpcy4jbm9kZU1vZHVsZXNEaXJGb3JQYWNrYWdlSW5uZXIoXG4gICAgICAgIG5wbVBhY2thZ2VJZCxcbiAgICAgICAgbnBtUGFja2FnZSxcbiAgICAgICk7XG4gICAgICB0aGlzLiNsaW5rRGlyQ2FjaGUuc2V0KG5wbVBhY2thZ2VJZCwgbGlua0Rpcik7XG4gICAgfVxuICAgIHJldHVybiBsaW5rRGlyO1xuICB9XG5cbiAgYXN5bmMgI25vZGVNb2R1bGVzRGlyRm9yUGFja2FnZUlubmVyKFxuICAgIG5wbVBhY2thZ2VJZDogc3RyaW5nLFxuICAgIG5wbVBhY2thZ2U6IGRlbm8uTnBtUGFja2FnZSxcbiAgKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBsZXQgbmFtZSA9IG5wbVBhY2thZ2UubmFtZTtcbiAgICBpZiAobmFtZS50b0xvd2VyQ2FzZSgpICE9PSBuYW1lKSB7XG4gICAgICBuYW1lID0gYF8ke2VuY29kZUJhc2UzMihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUobmFtZSkpfWA7XG4gICAgfVxuICAgIGlmIChST09UX0lORk9fT1VUUFVUID09PSB1bmRlZmluZWQpIHtcbiAgICAgIFJPT1RfSU5GT19PVVRQVVQgPSByb290SW5mbygpO1xuICAgIH1cbiAgICBpZiAoUk9PVF9JTkZPX09VVFBVVCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgIFJPT1RfSU5GT19PVVRQVVQgPSBhd2FpdCBST09UX0lORk9fT1VUUFVUO1xuICAgIH1cbiAgICBjb25zdCB7IGRlbm9EaXIsIG5wbUNhY2hlIH0gPSBST09UX0lORk9fT1VUUFVUO1xuICAgIGNvbnN0IHJlZ2lzdHJ5VXJsID0gbnBtUGFja2FnZS5yZWdpc3RyeVVybCA/PyBcImh0dHBzOi8vcmVnaXN0cnkubnBtanMub3JnXCI7XG4gICAgY29uc3QgcmVnaXN0cnkgPSBuZXcgVVJMKHJlZ2lzdHJ5VXJsKTtcblxuICAgIGNvbnN0IHBhY2thZ2VEaXIgPSBqb2luKFxuICAgICAgbnBtQ2FjaGUsXG4gICAgICByZWdpc3RyeS5ob3N0bmFtZSxcbiAgICAgIG5hbWUsXG4gICAgICBucG1QYWNrYWdlLnZlcnNpb24sXG4gICAgKTtcbiAgICBjb25zdCBsaW5rRGlyID0gam9pbihcbiAgICAgIGRlbm9EaXIsXG4gICAgICBcImRlbm9fZXNidWlsZFwiLFxuICAgICAgcmVnaXN0cnkuaG9zdG5hbWUsXG4gICAgICBucG1QYWNrYWdlSWQsXG4gICAgICBcIm5vZGVfbW9kdWxlc1wiLFxuICAgICAgbmFtZSxcbiAgICApO1xuICAgIGNvbnN0IGxpbmtEaXJQYXJlbnQgPSBkaXJuYW1lKGxpbmtEaXIpO1xuICAgIGNvbnN0IHRtcERpclBhcmVudCA9IGpvaW4oZGVub0RpciwgXCJkZW5vX2VzYnVpbGRfdG1wXCIpO1xuXG4gICAgLy8gY2hlY2sgaWYgdGhlIHBhY2thZ2UgaXMgYWxyZWFkeSBsaW5rZWQsIGlmIHNvLCByZXR1cm4gdGhlIGxpbmsgYW5kIHNraXBcbiAgICAvLyBhIGJ1bmNoIG9mIHdvcmtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgRGVuby5zdGF0KGxpbmtEaXIpO1xuICAgICAgdGhpcy4jbGlua0RpckNhY2hlLnNldChucG1QYWNrYWdlSWQsIGxpbmtEaXIpO1xuICAgICAgcmV0dXJuIGxpbmtEaXI7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBkaXJlY3RvcnkgZG9lcyBub3QgeWV0IGV4aXN0XG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIGEgdGVtcG9yYXJ5IGRpcmVjdG9yeSwgcmVjdXJzaXZlbHkgaGFyZGxpbmsgdGhlIHBhY2thZ2UgY29udGVudHNcbiAgICAvLyBpbnRvIGl0LCBhbmQgdGhlbiByZW5hbWUgaXQgdG8gdGhlIGZpbmFsIGxvY2F0aW9uXG4gICAgYXdhaXQgRGVuby5ta2Rpcih0bXBEaXJQYXJlbnQsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgIGNvbnN0IHRtcERpciA9IGF3YWl0IERlbm8ubWFrZVRlbXBEaXIoeyBkaXI6IHRtcERpclBhcmVudCB9KTtcbiAgICBhd2FpdCBsaW5rUmVjdXJzaXZlKHBhY2thZ2VEaXIsIHRtcERpcik7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IERlbm8ubWtkaXIobGlua0RpclBhcmVudCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICBhd2FpdCBEZW5vLnJlbmFtZSh0bXBEaXIsIGxpbmtEaXIpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gdGhlIGRpcmVjdG9yeSBtYXkgYWxyZWFkeSBoYXZlIGJlZW4gY3JlYXRlZCBieSBzb21lb25lIGVsc2UgLSBjaGVjayBpZiBzb1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgRGVuby5zdGF0KGxpbmtEaXIpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbGlua0RpcjtcbiAgfVxuXG4gIHBhY2thZ2VJZEZyb21OYW1lSW5QYWNrYWdlKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBwYXJlbnRQYWNrYWdlSWQ6IHN0cmluZyxcbiAgKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3QgcGFyZW50UGFja2FnZSA9IHRoaXMuI2luZm9DYWNoZS5nZXROcG1QYWNrYWdlKHBhcmVudFBhY2thZ2VJZCk7XG4gICAgaWYgKCFwYXJlbnRQYWNrYWdlKSB0aHJvdyBuZXcgRXJyb3IoXCJOUE0gcGFja2FnZSBub3QgZm91bmQuXCIpO1xuICAgIGlmIChwYXJlbnRQYWNrYWdlLm5hbWUgPT09IG5hbWUpIHJldHVybiBwYXJlbnRQYWNrYWdlSWQ7XG4gICAgZm9yIChjb25zdCBkZXAgb2YgcGFyZW50UGFja2FnZS5kZXBlbmRlbmNpZXMpIHtcbiAgICAgIGNvbnN0IGRlcFBhY2thZ2UgPSB0aGlzLiNpbmZvQ2FjaGUuZ2V0TnBtUGFja2FnZShkZXApO1xuICAgICAgaWYgKCFkZXBQYWNrYWdlKSB0aHJvdyBuZXcgRXJyb3IoXCJOUE0gcGFja2FnZSBub3QgZm91bmQuXCIpO1xuICAgICAgaWYgKGRlcFBhY2thZ2UubmFtZSA9PT0gbmFtZSkgcmV0dXJuIGRlcDtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gbGlua1JlY3Vyc2l2ZShmcm9tOiBzdHJpbmcsIHRvOiBzdHJpbmcpIHtcbiAgY29uc3QgZnJvbVN0YXQgPSBhd2FpdCBEZW5vLnN0YXQoZnJvbSk7XG4gIGlmIChmcm9tU3RhdC5pc0RpcmVjdG9yeSkge1xuICAgIGF3YWl0IERlbm8ubWtkaXIodG8sIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgIGZvciBhd2FpdCAoY29uc3QgZW50cnkgb2YgRGVuby5yZWFkRGlyKGZyb20pKSB7XG4gICAgICBhd2FpdCBsaW5rUmVjdXJzaXZlKGpvaW4oZnJvbSwgZW50cnkubmFtZSksIGpvaW4odG8sIGVudHJ5Lm5hbWUpKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgYXdhaXQgRGVuby5saW5rKGZyb20sIHRvKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFNBQVMsT0FBTyxFQUFFLFdBQVcsRUFBRSxJQUFJLFFBQVEsdUJBQXVCO0FBQ2xFLFNBQVMsWUFBWSxRQUFRLG1DQUFtQztBQUNoRSxTQUFTLGlCQUFpQixRQUFRLHdCQUF3QjtBQUMxRCxZQUFZLFVBQVUsWUFBWTtBQUNsQyxTQUFTLFFBQVEsUUFBNkIsWUFBWTtBQUMxRCxTQUdFLGNBQWMsRUFDZCxzQkFBc0IsRUFDdEIsaUJBQWlCLEVBQ2pCLGlCQUFpQixRQUNaLGNBQWM7QUFFckIsSUFBSTtBQUVKLE9BQU8sTUFBTSxzQkFBc0IsSUFBSSxjQUNwQyxNQUFNLENBQUMsMkJBQTJCO0FBTXJDLE9BQU8sTUFBTTtFQUNYLENBQUEsb0JBQXFCLENBQVU7RUFDL0IsQ0FBQSxTQUFVLENBQWlCO0VBQzNCLENBQUEsWUFBYSxHQUF3QixJQUFJLE1BQU07RUFFL0MsWUFBWSxPQUE0QixDQUFFO0lBQ3hDLElBQUksQ0FBQyxDQUFBLG9CQUFxQixHQUN4QixRQUFRLFdBQVcsRUFBRSxtQkFBbUI7SUFDMUMsSUFBSSxDQUFDLENBQUEsU0FBVSxHQUFHLElBQUksS0FBSyxTQUFTLENBQUMsUUFBUSxXQUFXO0VBQzFEO0VBRUEsTUFBTSxRQUFRLFNBQWMsRUFBNkI7SUFD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
// denoCacheMetadata=6958987949699212140,5125747454751788138