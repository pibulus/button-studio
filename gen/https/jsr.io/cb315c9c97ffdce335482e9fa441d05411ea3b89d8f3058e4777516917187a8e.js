// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Helper functions for working with
 * {@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array | Uint8Array}
 * byte slices.
 *
 * ```ts
 * import { concat, indexOfNeedle, endsWith } from "@std/bytes";
 * import { assertEquals } from "@std/assert";
 *
 * const a = new Uint8Array([0, 1, 2]);
 * const b = new Uint8Array([3, 4, 5]);
 *
 * const c = concat([a, b]);
 *
 * assertEquals(c, new Uint8Array([0, 1, 2, 3, 4, 5]));
 *
 * assertEquals(indexOfNeedle(c, new Uint8Array([2, 3])), 2);
 *
 * assertEquals(endsWith(c, b), true);
 * ```
 *
 * @module
 */ export * from "./concat.ts";
export * from "./copy.ts";
export * from "./ends_with.ts";
export * from "./equals.ts";
export * from "./includes_needle.ts";
export * from "./index_of_needle.ts";
export * from "./last_index_of_needle.ts";
export * from "./repeat.ts";
export * from "./starts_with.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYnl0ZXMvMS4wLjYvbW9kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjUgdGhlIERlbm8gYXV0aG9ycy4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9ucyBmb3Igd29ya2luZyB3aXRoXG4gKiB7QGxpbmtjb2RlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1VpbnQ4QXJyYXkgfCBVaW50OEFycmF5fVxuICogYnl0ZSBzbGljZXMuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IGNvbmNhdCwgaW5kZXhPZk5lZWRsZSwgZW5kc1dpdGggfSBmcm9tIFwiQHN0ZC9ieXRlc1wiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3QgYSA9IG5ldyBVaW50OEFycmF5KFswLCAxLCAyXSk7XG4gKiBjb25zdCBiID0gbmV3IFVpbnQ4QXJyYXkoWzMsIDQsIDVdKTtcbiAqXG4gKiBjb25zdCBjID0gY29uY2F0KFthLCBiXSk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGMsIG5ldyBVaW50OEFycmF5KFswLCAxLCAyLCAzLCA0LCA1XSkpO1xuICpcbiAqIGFzc2VydEVxdWFscyhpbmRleE9mTmVlZGxlKGMsIG5ldyBVaW50OEFycmF5KFsyLCAzXSkpLCAyKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoZW5kc1dpdGgoYywgYiksIHRydWUpO1xuICogYGBgXG4gKlxuICogQG1vZHVsZVxuICovXG5leHBvcnQgKiBmcm9tIFwiLi9jb25jYXQudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2NvcHkudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2VuZHNfd2l0aC50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vZXF1YWxzLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9pbmNsdWRlc19uZWVkbGUudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2luZGV4X29mX25lZWRsZS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vbGFzdF9pbmRleF9vZl9uZWVkbGUudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3JlcGVhdC50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vc3RhcnRzX3dpdGgudHNcIjtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxxREFBcUQ7QUFDckQscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBc0JDLEdBQ0QsY0FBYyxjQUFjO0FBQzVCLGNBQWMsWUFBWTtBQUMxQixjQUFjLGlCQUFpQjtBQUMvQixjQUFjLGNBQWM7QUFDNUIsY0FBYyx1QkFBdUI7QUFDckMsY0FBYyx1QkFBdUI7QUFDckMsY0FBYyw0QkFBNEI7QUFDMUMsY0FBYyxjQUFjO0FBQzVCLGNBQWMsbUJBQW1CIn0=
// denoCacheMetadata=18203059769721570919,8349212907730010104