// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { isWindows } from "./_os.ts";
import { extname as posixExtname } from "./posix/extname.ts";
import { extname as windowsExtname } from "./windows/extname.ts";
/**
 * Return the extension of the path with leading period (".").
 *
 * @example Usage
 * ```ts
 * import { extname } from "@std/path/extname";
 * import { assertEquals } from "@std/assert";
 *
 * if (Deno.build.os === "windows") {
 *   assertEquals(extname("C:\\home\\user\\Documents\\image.png"), ".png");
 *   assertEquals(extname(new URL("file:///C:/home/user/Documents/image.png")), ".png");
 * } else {
 *   assertEquals(extname("/home/user/Documents/image.png"), ".png");
 *   assertEquals(extname(new URL("file:///home/user/Documents/image.png")), ".png");
 * }
 * ```
 *
 * @param path Path with extension.
 * @returns The file extension. E.g. returns `.ts` for `file.ts`.
 */ export function extname(path) {
  return isWindows ? windowsExtname(path) : posixExtname(path);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8xLjEuMC9leHRuYW1lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjUgdGhlIERlbm8gYXV0aG9ycy4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGlzV2luZG93cyB9IGZyb20gXCIuL19vcy50c1wiO1xuaW1wb3J0IHsgZXh0bmFtZSBhcyBwb3NpeEV4dG5hbWUgfSBmcm9tIFwiLi9wb3NpeC9leHRuYW1lLnRzXCI7XG5pbXBvcnQgeyBleHRuYW1lIGFzIHdpbmRvd3NFeHRuYW1lIH0gZnJvbSBcIi4vd2luZG93cy9leHRuYW1lLnRzXCI7XG4vKipcbiAqIFJldHVybiB0aGUgZXh0ZW5zaW9uIG9mIHRoZSBwYXRoIHdpdGggbGVhZGluZyBwZXJpb2QgKFwiLlwiKS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGV4dG5hbWUgfSBmcm9tIFwiQHN0ZC9wYXRoL2V4dG5hbWVcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGlmIChEZW5vLmJ1aWxkLm9zID09PSBcIndpbmRvd3NcIikge1xuICogICBhc3NlcnRFcXVhbHMoZXh0bmFtZShcIkM6XFxcXGhvbWVcXFxcdXNlclxcXFxEb2N1bWVudHNcXFxcaW1hZ2UucG5nXCIpLCBcIi5wbmdcIik7XG4gKiAgIGFzc2VydEVxdWFscyhleHRuYW1lKG5ldyBVUkwoXCJmaWxlOi8vL0M6L2hvbWUvdXNlci9Eb2N1bWVudHMvaW1hZ2UucG5nXCIpKSwgXCIucG5nXCIpO1xuICogfSBlbHNlIHtcbiAqICAgYXNzZXJ0RXF1YWxzKGV4dG5hbWUoXCIvaG9tZS91c2VyL0RvY3VtZW50cy9pbWFnZS5wbmdcIiksIFwiLnBuZ1wiKTtcbiAqICAgYXNzZXJ0RXF1YWxzKGV4dG5hbWUobmV3IFVSTChcImZpbGU6Ly8vaG9tZS91c2VyL0RvY3VtZW50cy9pbWFnZS5wbmdcIikpLCBcIi5wbmdcIik7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gcGF0aCBQYXRoIHdpdGggZXh0ZW5zaW9uLlxuICogQHJldHVybnMgVGhlIGZpbGUgZXh0ZW5zaW9uLiBFLmcuIHJldHVybnMgYC50c2AgZm9yIGBmaWxlLnRzYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dG5hbWUocGF0aDogc3RyaW5nIHwgVVJMKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlzV2luZG93cyA/IHdpbmRvd3NFeHRuYW1lKHBhdGgpIDogcG9zaXhFeHRuYW1lKHBhdGgpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHFEQUFxRDtBQUNyRCxxQ0FBcUM7QUFFckMsU0FBUyxTQUFTLFFBQVEsV0FBVztBQUNyQyxTQUFTLFdBQVcsWUFBWSxRQUFRLHFCQUFxQjtBQUM3RCxTQUFTLFdBQVcsY0FBYyxRQUFRLHVCQUF1QjtBQUNqRTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CQyxHQUNELE9BQU8sU0FBUyxRQUFRLElBQWtCO0VBQ3hDLE9BQU8sWUFBWSxlQUFlLFFBQVEsYUFBYTtBQUN6RCJ9
// denoCacheMetadata=10823575485714993911,1170717594774144584