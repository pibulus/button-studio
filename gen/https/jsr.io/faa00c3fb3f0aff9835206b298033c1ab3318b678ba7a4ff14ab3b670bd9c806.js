// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { isWindows } from "./_os.ts";
import { join as posixJoin } from "./posix/join.ts";
import { join as windowsJoin } from "./windows/join.ts";
/**
 * Joins a sequence of paths, then normalizes the resulting path.
 *
 * @example Usage
 * ```ts
 * import { join } from "@std/path/join";
 * import { assertEquals } from "@std/assert";
 *
 * if (Deno.build.os === "windows") {
 *   assertEquals(join("C:\\foo", "bar", "baz\\quux", "garply", ".."), "C:\\foo\\bar\\baz\\quux");
 *   assertEquals(join(new URL("file:///C:/foo"), "bar", "baz/asdf", "quux", ".."), "C:\\foo\\bar\\baz\\asdf");
 * } else {
 *   assertEquals(join("/foo", "bar", "baz/quux", "garply", ".."), "/foo/bar/baz/quux");
 *   assertEquals(join(new URL("file:///foo"), "bar", "baz/asdf", "quux", ".."), "/foo/bar/baz/asdf");
 * }
 * ```
 *
 * @param path The path to join. This can be string or file URL.
 * @param paths Paths to be joined and normalized.
 * @returns The joined and normalized path.
 */ export function join(path, ...paths) {
  return isWindows ? windowsJoin(path, ...paths) : posixJoin(path, ...paths);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8xLjEuMC9qb2luLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjUgdGhlIERlbm8gYXV0aG9ycy4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGlzV2luZG93cyB9IGZyb20gXCIuL19vcy50c1wiO1xuaW1wb3J0IHsgam9pbiBhcyBwb3NpeEpvaW4gfSBmcm9tIFwiLi9wb3NpeC9qb2luLnRzXCI7XG5pbXBvcnQgeyBqb2luIGFzIHdpbmRvd3NKb2luIH0gZnJvbSBcIi4vd2luZG93cy9qb2luLnRzXCI7XG5cbi8qKlxuICogSm9pbnMgYSBzZXF1ZW5jZSBvZiBwYXRocywgdGhlbiBub3JtYWxpemVzIHRoZSByZXN1bHRpbmcgcGF0aC5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGpvaW4gfSBmcm9tIFwiQHN0ZC9wYXRoL2pvaW5cIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGlmIChEZW5vLmJ1aWxkLm9zID09PSBcIndpbmRvd3NcIikge1xuICogICBhc3NlcnRFcXVhbHMoam9pbihcIkM6XFxcXGZvb1wiLCBcImJhclwiLCBcImJhelxcXFxxdXV4XCIsIFwiZ2FycGx5XCIsIFwiLi5cIiksIFwiQzpcXFxcZm9vXFxcXGJhclxcXFxiYXpcXFxccXV1eFwiKTtcbiAqICAgYXNzZXJ0RXF1YWxzKGpvaW4obmV3IFVSTChcImZpbGU6Ly8vQzovZm9vXCIpLCBcImJhclwiLCBcImJhei9hc2RmXCIsIFwicXV1eFwiLCBcIi4uXCIpLCBcIkM6XFxcXGZvb1xcXFxiYXJcXFxcYmF6XFxcXGFzZGZcIik7XG4gKiB9IGVsc2Uge1xuICogICBhc3NlcnRFcXVhbHMoam9pbihcIi9mb29cIiwgXCJiYXJcIiwgXCJiYXovcXV1eFwiLCBcImdhcnBseVwiLCBcIi4uXCIpLCBcIi9mb28vYmFyL2Jhei9xdXV4XCIpO1xuICogICBhc3NlcnRFcXVhbHMoam9pbihuZXcgVVJMKFwiZmlsZTovLy9mb29cIiksIFwiYmFyXCIsIFwiYmF6L2FzZGZcIiwgXCJxdXV4XCIsIFwiLi5cIiksIFwiL2Zvby9iYXIvYmF6L2FzZGZcIik7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCB0byBqb2luLiBUaGlzIGNhbiBiZSBzdHJpbmcgb3IgZmlsZSBVUkwuXG4gKiBAcGFyYW0gcGF0aHMgUGF0aHMgdG8gYmUgam9pbmVkIGFuZCBub3JtYWxpemVkLlxuICogQHJldHVybnMgVGhlIGpvaW5lZCBhbmQgbm9ybWFsaXplZCBwYXRoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gam9pbihwYXRoOiBzdHJpbmcgfCBVUkwsIC4uLnBhdGhzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gIHJldHVybiBpc1dpbmRvd3MgPyB3aW5kb3dzSm9pbihwYXRoLCAuLi5wYXRocykgOiBwb3NpeEpvaW4ocGF0aCwgLi4ucGF0aHMpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHFEQUFxRDtBQUNyRCxxQ0FBcUM7QUFFckMsU0FBUyxTQUFTLFFBQVEsV0FBVztBQUNyQyxTQUFTLFFBQVEsU0FBUyxRQUFRLGtCQUFrQjtBQUNwRCxTQUFTLFFBQVEsV0FBVyxRQUFRLG9CQUFvQjtBQUV4RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FvQkMsR0FDRCxPQUFPLFNBQVMsS0FBSyxJQUFrQixFQUFFLEdBQUcsS0FBZTtFQUN6RCxPQUFPLFlBQVksWUFBWSxTQUFTLFNBQVMsVUFBVSxTQUFTO0FBQ3RFIn0=
// denoCacheMetadata=653646278247506337,7538571437608987936