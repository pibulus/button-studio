import { toFileUrl } from "jsr:@std/path@^1.0.6";
import { findWorkspace, isNodeModulesResolution, urlToEsbuildResolution } from "./shared.ts";
/**
 * The Deno resolver plugin performs relative->absolute specifier resolution
 * and import map resolution.
 *
 * If using the {@link denoLoaderPlugin}, this plugin must be used before the
 * loader plugin.
 */ export function denoResolverPlugin(options = {}) {
  return {
    name: "deno-resolver",
    setup (build) {
      let resolver = null;
      const externalRegexps = (build.initialOptions.external ?? []).map((external)=>{
        const regexp = new RegExp("^" + external.replace(/[-/\\^$+?.()|[\]{}]/g, "\\$&").replace(/\*/g, ".*") + "$");
        return regexp;
      });
      build.onStart(async function onStart() {
        const cwd = build.initialOptions.absWorkingDir ?? Deno.cwd();
        const workspace = findWorkspace(cwd, build.initialOptions.entryPoints, options.configPath);
        try {
          const importMapURL = options.importMapURL;
          let importMapValue;
          if (importMapURL !== undefined) {
            // If we have an import map URL, fetch it and parse it.
            const resp = await fetch(importMapURL);
            importMapValue = await resp.json();
          }
          resolver?.free();
          resolver = null;
          resolver = workspace.resolver(importMapURL, importMapValue);
        } finally{
          workspace.free();
        }
      });
      build.onResolve({
        filter: /.*/
      }, async function onResolve(args) {
        // Pass through any node_modules internal resolution.
        if (isNodeModulesResolution(args)) {
          return undefined;
        }
        // The first pass resolver performs synchronous resolution. This
        // includes relative to absolute specifier resolution and import map
        // resolution.
        // We have to first determine the referrer URL to use when resolving
        // the specifier. This is either the importer URL, or the resolveDir
        // URL if the importer is not specified (ie if the specifier is at the
        // root).
        let referrer;
        if (args.importer !== "") {
          if (args.namespace === "") {
            throw new Error("[assert] namespace is empty");
          }
          referrer = new URL(`${args.namespace}:${args.importer}`);
        } else if (args.resolveDir !== "") {
          referrer = new URL(`${toFileUrl(args.resolveDir).href}/`);
        } else {
          return undefined;
        }
        // We can then resolve the specifier relative to the referrer URL, using
        // the workspace resolver.
        const resolved = new URL(resolver.resolve(args.path, referrer.href));
        for (const externalRegexp of externalRegexps){
          if (externalRegexp.test(resolved.href)) {
            return {
              path: resolved.href,
              external: true
            };
          }
        }
        // Now pass the resolved specifier back into the resolver, for a second
        // pass. Now plugins can perform any resolution they want on the fully
        // resolved specifier.
        const { path, namespace } = urlToEsbuildResolution(resolved);
        const res = await build.resolve(path, {
          namespace,
          kind: args.kind
        });
        return res;
      });
    }
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BsdWNhL2VzYnVpbGQtZGVuby1sb2FkZXIvMC4xMS4wL3NyYy9wbHVnaW5fZGVub19yZXNvbHZlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSAqIGFzIGVzYnVpbGQgZnJvbSBcIi4vZXNidWlsZF90eXBlcy50c1wiO1xuaW1wb3J0IHsgdG9GaWxlVXJsIH0gZnJvbSBcImpzcjpAc3RkL3BhdGhAXjEuMC42XCI7XG5pbXBvcnQge1xuICBmaW5kV29ya3NwYWNlLFxuICBpc05vZGVNb2R1bGVzUmVzb2x1dGlvbixcbiAgdXJsVG9Fc2J1aWxkUmVzb2x1dGlvbixcbn0gZnJvbSBcIi4vc2hhcmVkLnRzXCI7XG5pbXBvcnQgdHlwZSB7IFdhc21Xb3Jrc3BhY2VSZXNvbHZlciB9IGZyb20gXCIuL3dhc20vbG9hZGVyLmdlbmVyYXRlZC5qc1wiO1xuXG4vKiogT3B0aW9ucyBmb3IgdGhlIHtAbGluayBkZW5vUmVzb2x2ZXJQbHVnaW59LiAqL1xuZXhwb3J0IGludGVyZmFjZSBEZW5vUmVzb2x2ZXJQbHVnaW5PcHRpb25zIHtcbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIHBhdGggdG8gYSBkZW5vLmpzb24gY29uZmlnIGZpbGUgdG8gdXNlLiBUaGlzIGlzIGVxdWl2YWxlbnQgdG9cbiAgICogdGhlIGAtLWNvbmZpZ2AgZmxhZyB0byB0aGUgRGVubyBleGVjdXRhYmxlLiBUaGlzIHBhdGggbXVzdCBiZSBhYnNvbHV0ZS5cbiAgICpcbiAgICogSWYgbm90IHNwZWNpZmllZCwgdGhlIHBsdWdpbiB3aWxsIGF0dGVtcHQgdG8gZmluZCB0aGUgbmVhcmVzdCBkZW5vLmpzb24gYW5kXG4gICAqIHVzZSB0aGF0LiBJZiB0aGUgZGVuby5qc29uIGlzIHBhcnQgb2YgYSB3b3Jrc3BhY2UsIHRoZSBwbHVnaW4gd2lsbFxuICAgKiBhdXRvbWF0aWNhbGx5IGZpbmQgdGhlIHdvcmtzcGFjZSByb290LlxuICAgKi9cbiAgY29uZmlnUGF0aD86IHN0cmluZztcbiAgLyoqXG4gICAqIFNwZWNpZnkgYSBVUkwgdG8gYW4gaW1wb3J0IG1hcCBmaWxlIHRvIHVzZSB3aGVuIHJlc29sdmluZyBpbXBvcnRcbiAgICogc3BlY2lmaWVycy4gVGhpcyBpcyBlcXVpdmFsZW50IHRvIHRoZSBgLS1pbXBvcnQtbWFwYCBmbGFnIHRvIHRoZSBEZW5vXG4gICAqIGV4ZWN1dGFibGUuIFRoaXMgVVJMIG1heSBiZSByZW1vdGUgb3IgYSBsb2NhbCBmaWxlIFVSTC5cbiAgICpcbiAgICogSWYgdGhpcyBvcHRpb24gaXMgbm90IHNwZWNpZmllZCwgdGhlIGRlbm8uanNvbiBjb25maWcgZmlsZSBpcyBjb25zdWx0ZWQgdG9cbiAgICogZGV0ZXJtaW5lIHdoYXQgaW1wb3J0IG1hcCB0byB1c2UsIGlmIGFueS5cbiAgICovXG4gIGltcG9ydE1hcFVSTD86IHN0cmluZztcbn1cblxuLyoqXG4gKiBUaGUgRGVubyByZXNvbHZlciBwbHVnaW4gcGVyZm9ybXMgcmVsYXRpdmUtPmFic29sdXRlIHNwZWNpZmllciByZXNvbHV0aW9uXG4gKiBhbmQgaW1wb3J0IG1hcCByZXNvbHV0aW9uLlxuICpcbiAqIElmIHVzaW5nIHRoZSB7QGxpbmsgZGVub0xvYWRlclBsdWdpbn0sIHRoaXMgcGx1Z2luIG11c3QgYmUgdXNlZCBiZWZvcmUgdGhlXG4gKiBsb2FkZXIgcGx1Z2luLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVub1Jlc29sdmVyUGx1Z2luKFxuICBvcHRpb25zOiBEZW5vUmVzb2x2ZXJQbHVnaW5PcHRpb25zID0ge30sXG4pOiBlc2J1aWxkLlBsdWdpbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogXCJkZW5vLXJlc29sdmVyXCIsXG4gICAgc2V0dXAoYnVpbGQpIHtcbiAgICAgIGxldCByZXNvbHZlcjogV2FzbVdvcmtzcGFjZVJlc29sdmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgIGNvbnN0IGV4dGVybmFsUmVnZXhwczogUmVnRXhwW10gPSAoYnVpbGQuaW5pdGlhbE9wdGlvbnMuZXh0ZXJuYWwgPz8gW10pXG4gICAgICAgIC5tYXAoKGV4dGVybmFsKSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVnZXhwID0gbmV3IFJlZ0V4cChcbiAgICAgICAgICAgIFwiXlwiICsgZXh0ZXJuYWwucmVwbGFjZSgvWy0vXFxcXF4kKz8uKCl8W1xcXXt9XS9nLCBcIlxcXFwkJlwiKS5yZXBsYWNlKFxuICAgICAgICAgICAgICAvXFwqL2csXG4gICAgICAgICAgICAgIFwiLipcIixcbiAgICAgICAgICAgICkgKyBcIiRcIixcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiByZWdleHA7XG4gICAgICAgIH0pO1xuXG4gICAgICBidWlsZC5vblN0YXJ0KGFzeW5jIGZ1bmN0aW9uIG9uU3RhcnQoKSB7XG4gICAgICAgIGNvbnN0IGN3ZCA9IGJ1aWxkLmluaXRpYWxPcHRpb25zLmFic1dvcmtpbmdEaXIgPz8gRGVuby5jd2QoKTtcblxuICAgICAgICBjb25zdCB3b3Jrc3BhY2UgPSBmaW5kV29ya3NwYWNlKFxuICAgICAgICAgIGN3ZCxcbiAgICAgICAgICBidWlsZC5pbml0aWFsT3B0aW9ucy5lbnRyeVBvaW50cyxcbiAgICAgICAgICBvcHRpb25zLmNvbmZpZ1BhdGgsXG4gICAgICAgICk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgaW1wb3J0TWFwVVJMOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBvcHRpb25zLmltcG9ydE1hcFVSTDtcbiAgICAgICAgICBsZXQgaW1wb3J0TWFwVmFsdWU6IHVua25vd24gfCB1bmRlZmluZWQ7XG4gICAgICAgICAgaWYgKGltcG9ydE1hcFVSTCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGFuIGltcG9ydCBtYXAgVVJMLCBmZXRjaCBpdCBhbmQgcGFyc2UgaXQuXG4gICAgICAgICAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goaW1wb3J0TWFwVVJMKTtcbiAgICAgICAgICAgIGltcG9ydE1hcFZhbHVlID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzb2x2ZXI/LmZyZWUoKTtcbiAgICAgICAgICByZXNvbHZlciA9IG51bGw7XG4gICAgICAgICAgcmVzb2x2ZXIgPSB3b3Jrc3BhY2UucmVzb2x2ZXIoaW1wb3J0TWFwVVJMLCBpbXBvcnRNYXBWYWx1ZSk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgd29ya3NwYWNlLmZyZWUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGJ1aWxkLm9uUmVzb2x2ZSh7IGZpbHRlcjogLy4qLyB9LCBhc3luYyBmdW5jdGlvbiBvblJlc29sdmUoYXJncykge1xuICAgICAgICAvLyBQYXNzIHRocm91Z2ggYW55IG5vZGVfbW9kdWxlcyBpbnRlcm5hbCByZXNvbHV0aW9uLlxuICAgICAgICBpZiAoaXNOb2RlTW9kdWxlc1Jlc29sdXRpb24oYXJncykpIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIGZpcnN0IHBhc3MgcmVzb2x2ZXIgcGVyZm9ybXMgc3luY2hyb25vdXMgcmVzb2x1dGlvbi4gVGhpc1xuICAgICAgICAvLyBpbmNsdWRlcyByZWxhdGl2ZSB0byBhYnNvbHV0ZSBzcGVjaWZpZXIgcmVzb2x1dGlvbiBhbmQgaW1wb3J0IG1hcFxuICAgICAgICAvLyByZXNvbHV0aW9uLlxuXG4gICAgICAgIC8vIFdlIGhhdmUgdG8gZmlyc3QgZGV0ZXJtaW5lIHRoZSByZWZlcnJlciBVUkwgdG8gdXNlIHdoZW4gcmVzb2x2aW5nXG4gICAgICAgIC8vIHRoZSBzcGVjaWZpZXIuIFRoaXMgaXMgZWl0aGVyIHRoZSBpbXBvcnRlciBVUkwsIG9yIHRoZSByZXNvbHZlRGlyXG4gICAgICAgIC8vIFVSTCBpZiB0aGUgaW1wb3J0ZXIgaXMgbm90IHNwZWNpZmllZCAoaWUgaWYgdGhlIHNwZWNpZmllciBpcyBhdCB0aGVcbiAgICAgICAgLy8gcm9vdCkuXG4gICAgICAgIGxldCByZWZlcnJlcjogVVJMO1xuICAgICAgICBpZiAoYXJncy5pbXBvcnRlciAhPT0gXCJcIikge1xuICAgICAgICAgIGlmIChhcmdzLm5hbWVzcGFjZSA9PT0gXCJcIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiW2Fzc2VydF0gbmFtZXNwYWNlIGlzIGVtcHR5XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZWZlcnJlciA9IG5ldyBVUkwoYCR7YXJncy5uYW1lc3BhY2V9OiR7YXJncy5pbXBvcnRlcn1gKTtcbiAgICAgICAgfSBlbHNlIGlmIChhcmdzLnJlc29sdmVEaXIgIT09IFwiXCIpIHtcbiAgICAgICAgICByZWZlcnJlciA9IG5ldyBVUkwoYCR7dG9GaWxlVXJsKGFyZ3MucmVzb2x2ZURpcikuaHJlZn0vYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdlIGNhbiB0aGVuIHJlc29sdmUgdGhlIHNwZWNpZmllciByZWxhdGl2ZSB0byB0aGUgcmVmZXJyZXIgVVJMLCB1c2luZ1xuICAgICAgICAvLyB0aGUgd29ya3NwYWNlIHJlc29sdmVyLlxuICAgICAgICBjb25zdCByZXNvbHZlZCA9IG5ldyBVUkwoXG4gICAgICAgICAgcmVzb2x2ZXIhLnJlc29sdmUoYXJncy5wYXRoLCByZWZlcnJlci5ocmVmKSxcbiAgICAgICAgKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGV4dGVybmFsUmVnZXhwIG9mIGV4dGVybmFsUmVnZXhwcykge1xuICAgICAgICAgIGlmIChleHRlcm5hbFJlZ2V4cC50ZXN0KHJlc29sdmVkLmhyZWYpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBwYXRoOiByZXNvbHZlZC5ocmVmLFxuICAgICAgICAgICAgICBleHRlcm5hbDogdHJ1ZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm93IHBhc3MgdGhlIHJlc29sdmVkIHNwZWNpZmllciBiYWNrIGludG8gdGhlIHJlc29sdmVyLCBmb3IgYSBzZWNvbmRcbiAgICAgICAgLy8gcGFzcy4gTm93IHBsdWdpbnMgY2FuIHBlcmZvcm0gYW55IHJlc29sdXRpb24gdGhleSB3YW50IG9uIHRoZSBmdWxseVxuICAgICAgICAvLyByZXNvbHZlZCBzcGVjaWZpZXIuXG4gICAgICAgIGNvbnN0IHsgcGF0aCwgbmFtZXNwYWNlIH0gPSB1cmxUb0VzYnVpbGRSZXNvbHV0aW9uKHJlc29sdmVkKTtcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgYnVpbGQucmVzb2x2ZShwYXRoLCB7XG4gICAgICAgICAgbmFtZXNwYWNlLFxuICAgICAgICAgIGtpbmQ6IGFyZ3Mua2luZCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgICB9KTtcbiAgICB9LFxuICB9O1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFNBQVMsU0FBUyxRQUFRLHVCQUF1QjtBQUNqRCxTQUNFLGFBQWEsRUFDYix1QkFBdUIsRUFDdkIsc0JBQXNCLFFBQ2pCLGNBQWM7QUF5QnJCOzs7Ozs7Q0FNQyxHQUNELE9BQU8sU0FBUyxtQkFDZCxVQUFxQyxDQUFDLENBQUM7RUFFdkMsT0FBTztJQUNMLE1BQU07SUFDTixPQUFNLEtBQUs7TUFDVCxJQUFJLFdBQXlDO01BRTdDLE1BQU0sa0JBQTRCLENBQUMsTUFBTSxjQUFjLENBQUMsUUFBUSxJQUFJLEVBQUUsRUFDbkUsR0FBRyxDQUFDLENBQUM7UUFDSixNQUFNLFNBQVMsSUFBSSxPQUNqQixNQUFNLFNBQVMsT0FBTyxDQUFDLHdCQUF3QixRQUFRLE9BQU8sQ0FDNUQsT0FDQSxRQUNFO1FBRU4sT0FBTztNQUNUO01BRUYsTUFBTSxPQUFPLENBQUMsZUFBZTtRQUMzQixNQUFNLE1BQU0sTUFBTSxjQUFjLENBQUMsYUFBYSxJQUFJLEtBQUssR0FBRztRQUUxRCxNQUFNLFlBQVksY0FDaEIsS0FDQSxNQUFNLGNBQWMsQ0FBQyxXQUFXLEVBQ2hDLFFBQVEsVUFBVTtRQUVwQixJQUFJO1VBQ0YsTUFBTSxlQUFtQyxRQUFRLFlBQVk7VUFDN0QsSUFBSTtVQUNKLElBQUksaUJBQWlCLFdBQVc7WUFDOUIsdURBQXVEO1lBQ3ZELE1BQU0sT0FBTyxNQUFNLE1BQU07WUFDekIsaUJBQWlCLE1BQU0sS0FBSyxJQUFJO1VBQ2xDO1VBRUEsVUFBVTtVQUNWLFdBQVc7VUFDWCxXQUFXLFVBQVUsUUFBUSxDQUFDLGNBQWM7UUFDOUMsU0FBVTtVQUNSLFVBQVUsSUFBSTtRQUNoQjtNQUNGO01BRUEsTUFBTSxTQUFTLENBQUM7UUFBRSxRQUFRO01BQUssR0FBRyxlQUFlLFVBQVUsSUFBSTtRQUM3RCxxREFBcUQ7UUFDckQsSUFBSSx3QkFBd0IsT0FBTztVQUNqQyxPQUFPO1FBQ1Q7UUFFQSxnRUFBZ0U7UUFDaEUsb0VBQW9FO1FBQ3BFLGNBQWM7UUFFZCxvRUFBb0U7UUFDcEUsb0VBQW9FO1FBQ3BFLHNFQUFzRTtRQUN0RSxTQUFTO1FBQ1QsSUFBSTtRQUNKLElBQUksS0FBSyxRQUFRLEtBQUssSUFBSTtVQUN4QixJQUFJLEtBQUssU0FBUyxLQUFLLElBQUk7WUFDekIsTUFBTSxJQUFJLE1BQU07VUFDbEI7VUFDQSxXQUFXLElBQUksSUFBSSxHQUFHLEtBQUssU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLFFBQVEsRUFBRTtRQUN6RCxPQUFPLElBQUksS0FBSyxVQUFVLEtBQUssSUFBSTtVQUNqQyxXQUFXLElBQUksSUFBSSxHQUFHLFVBQVUsS0FBSyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMxRCxPQUFPO1VBQ0wsT0FBTztRQUNUO1FBRUEsd0VBQXdFO1FBQ3hFLDBCQUEwQjtRQUMxQixNQUFNLFdBQVcsSUFBSSxJQUNuQixTQUFVLE9BQU8sQ0FBQyxLQUFLLElBQUksRUFBRSxTQUFTLElBQUk7UUFHNUMsS0FBSyxNQUFNLGtCQUFrQixnQkFBaUI7VUFDNUMsSUFBSSxlQUFlLElBQUksQ0FBQyxTQUFTLElBQUksR0FBRztZQUN0QyxPQUFPO2NBQ0wsTUFBTSxTQUFTLElBQUk7Y0FDbkIsVUFBVTtZQUNaO1VBQ0Y7UUFDRjtRQUVBLHVFQUF1RTtRQUN2RSxzRUFBc0U7UUFDdEUsc0JBQXNCO1FBQ3RCLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEdBQUcsdUJBQXVCO1FBQ25ELE1BQU0sTUFBTSxNQUFNLE1BQU0sT0FBTyxDQUFDLE1BQU07VUFDcEM7VUFDQSxNQUFNLEtBQUssSUFBSTtRQUNqQjtRQUNBLE9BQU87TUFDVDtJQUNGO0VBQ0Y7QUFDRiJ9
// denoCacheMetadata=3673154515716684212,9290736615689842628