// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { isWindows } from "./_os.ts";
import { normalize as posixNormalize } from "./posix/normalize.ts";
import { normalize as windowsNormalize } from "./windows/normalize.ts";
/**
 * Normalize the path, resolving `'..'` and `'.'` segments.
 *
 * Note: Resolving these segments does not necessarily mean that all will be
 * eliminated. A `'..'` at the top-level will be preserved, and an empty path is
 * canonically `'.'`.
 *
 * @example Usage
 * ```ts
 * import { normalize } from "@std/path/normalize";
 * import { assertEquals } from "@std/assert";
 *
 * if (Deno.build.os === "windows") {
 *   assertEquals(normalize("C:\\foo\\bar\\..\\baz\\quux"), "C:\\foo\\baz\\quux");
 *   assertEquals(normalize(new URL("file:///C:/foo/bar/../baz/quux")), "C:\\foo\\baz\\quux");
 * } else {
 *   assertEquals(normalize("/foo/bar/../baz/quux"), "/foo/baz/quux");
 *   assertEquals(normalize(new URL("file:///foo/bar/../baz/quux")), "/foo/baz/quux");
 * }
 * ```
 *
 * @param path Path to be normalized
 * @returns The normalized path.
 */ export function normalize(path) {
  return isWindows ? windowsNormalize(path) : posixNormalize(path);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8xLjEuMC9ub3JtYWxpemUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNSB0aGUgRGVubyBhdXRob3JzLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgaXNXaW5kb3dzIH0gZnJvbSBcIi4vX29zLnRzXCI7XG5pbXBvcnQgeyBub3JtYWxpemUgYXMgcG9zaXhOb3JtYWxpemUgfSBmcm9tIFwiLi9wb3NpeC9ub3JtYWxpemUudHNcIjtcbmltcG9ydCB7IG5vcm1hbGl6ZSBhcyB3aW5kb3dzTm9ybWFsaXplIH0gZnJvbSBcIi4vd2luZG93cy9ub3JtYWxpemUudHNcIjtcbi8qKlxuICogTm9ybWFsaXplIHRoZSBwYXRoLCByZXNvbHZpbmcgYCcuLidgIGFuZCBgJy4nYCBzZWdtZW50cy5cbiAqXG4gKiBOb3RlOiBSZXNvbHZpbmcgdGhlc2Ugc2VnbWVudHMgZG9lcyBub3QgbmVjZXNzYXJpbHkgbWVhbiB0aGF0IGFsbCB3aWxsIGJlXG4gKiBlbGltaW5hdGVkLiBBIGAnLi4nYCBhdCB0aGUgdG9wLWxldmVsIHdpbGwgYmUgcHJlc2VydmVkLCBhbmQgYW4gZW1wdHkgcGF0aCBpc1xuICogY2Fub25pY2FsbHkgYCcuJ2AuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBub3JtYWxpemUgfSBmcm9tIFwiQHN0ZC9wYXRoL25vcm1hbGl6ZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogaWYgKERlbm8uYnVpbGQub3MgPT09IFwid2luZG93c1wiKSB7XG4gKiAgIGFzc2VydEVxdWFscyhub3JtYWxpemUoXCJDOlxcXFxmb29cXFxcYmFyXFxcXC4uXFxcXGJhelxcXFxxdXV4XCIpLCBcIkM6XFxcXGZvb1xcXFxiYXpcXFxccXV1eFwiKTtcbiAqICAgYXNzZXJ0RXF1YWxzKG5vcm1hbGl6ZShuZXcgVVJMKFwiZmlsZTovLy9DOi9mb28vYmFyLy4uL2Jhei9xdXV4XCIpKSwgXCJDOlxcXFxmb29cXFxcYmF6XFxcXHF1dXhcIik7XG4gKiB9IGVsc2Uge1xuICogICBhc3NlcnRFcXVhbHMobm9ybWFsaXplKFwiL2Zvby9iYXIvLi4vYmF6L3F1dXhcIiksIFwiL2Zvby9iYXovcXV1eFwiKTtcbiAqICAgYXNzZXJ0RXF1YWxzKG5vcm1hbGl6ZShuZXcgVVJMKFwiZmlsZTovLy9mb28vYmFyLy4uL2Jhei9xdXV4XCIpKSwgXCIvZm9vL2Jhei9xdXV4XCIpO1xuICogfVxuICogYGBgXG4gKlxuICogQHBhcmFtIHBhdGggUGF0aCB0byBiZSBub3JtYWxpemVkXG4gKiBAcmV0dXJucyBUaGUgbm9ybWFsaXplZCBwYXRoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKHBhdGg6IHN0cmluZyB8IFVSTCk6IHN0cmluZyB7XG4gIHJldHVybiBpc1dpbmRvd3MgPyB3aW5kb3dzTm9ybWFsaXplKHBhdGgpIDogcG9zaXhOb3JtYWxpemUocGF0aCk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEscURBQXFEO0FBQ3JELHFDQUFxQztBQUVyQyxTQUFTLFNBQVMsUUFBUSxXQUFXO0FBQ3JDLFNBQVMsYUFBYSxjQUFjLFFBQVEsdUJBQXVCO0FBQ25FLFNBQVMsYUFBYSxnQkFBZ0IsUUFBUSx5QkFBeUI7QUFDdkU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBdUJDLEdBQ0QsT0FBTyxTQUFTLFVBQVUsSUFBa0I7RUFDMUMsT0FBTyxZQUFZLGlCQUFpQixRQUFRLGVBQWU7QUFDN0QifQ==
// denoCacheMetadata=17898404163855951779,3043741878463269612