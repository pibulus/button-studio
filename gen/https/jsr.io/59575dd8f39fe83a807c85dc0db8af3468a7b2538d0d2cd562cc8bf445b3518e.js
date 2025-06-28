// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { isWindows } from "./_os.ts";
import { dirname as posixDirname } from "./posix/dirname.ts";
import { dirname as windowsDirname } from "./windows/dirname.ts";
/**
 * Return the directory path of a path.
 *
 * @example Usage
 * ```ts
 * import { dirname } from "@std/path/dirname";
 * import { assertEquals } from "@std/assert";
 *
 * if (Deno.build.os === "windows") {
 *   assertEquals(dirname("C:\\home\\user\\Documents\\image.png"), "C:\\home\\user\\Documents");
 *   assertEquals(dirname(new URL("file:///C:/home/user/Documents/image.png")), "C:\\home\\user\\Documents");
 * } else {
 *   assertEquals(dirname("/home/user/Documents/image.png"), "/home/user/Documents");
 *   assertEquals(dirname(new URL("file:///home/user/Documents/image.png")), "/home/user/Documents");
 * }
 * ```
 *
 * @param path Path to extract the directory from.
 * @returns The directory path.
 */ export function dirname(path) {
  return isWindows ? windowsDirname(path) : posixDirname(path);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvcGF0aC8xLjEuMC9kaXJuYW1lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjUgdGhlIERlbm8gYXV0aG9ycy4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGlzV2luZG93cyB9IGZyb20gXCIuL19vcy50c1wiO1xuaW1wb3J0IHsgZGlybmFtZSBhcyBwb3NpeERpcm5hbWUgfSBmcm9tIFwiLi9wb3NpeC9kaXJuYW1lLnRzXCI7XG5pbXBvcnQgeyBkaXJuYW1lIGFzIHdpbmRvd3NEaXJuYW1lIH0gZnJvbSBcIi4vd2luZG93cy9kaXJuYW1lLnRzXCI7XG5cbi8qKlxuICogUmV0dXJuIHRoZSBkaXJlY3RvcnkgcGF0aCBvZiBhIHBhdGguXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBkaXJuYW1lIH0gZnJvbSBcIkBzdGQvcGF0aC9kaXJuYW1lXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBpZiAoRGVuby5idWlsZC5vcyA9PT0gXCJ3aW5kb3dzXCIpIHtcbiAqICAgYXNzZXJ0RXF1YWxzKGRpcm5hbWUoXCJDOlxcXFxob21lXFxcXHVzZXJcXFxcRG9jdW1lbnRzXFxcXGltYWdlLnBuZ1wiKSwgXCJDOlxcXFxob21lXFxcXHVzZXJcXFxcRG9jdW1lbnRzXCIpO1xuICogICBhc3NlcnRFcXVhbHMoZGlybmFtZShuZXcgVVJMKFwiZmlsZTovLy9DOi9ob21lL3VzZXIvRG9jdW1lbnRzL2ltYWdlLnBuZ1wiKSksIFwiQzpcXFxcaG9tZVxcXFx1c2VyXFxcXERvY3VtZW50c1wiKTtcbiAqIH0gZWxzZSB7XG4gKiAgIGFzc2VydEVxdWFscyhkaXJuYW1lKFwiL2hvbWUvdXNlci9Eb2N1bWVudHMvaW1hZ2UucG5nXCIpLCBcIi9ob21lL3VzZXIvRG9jdW1lbnRzXCIpO1xuICogICBhc3NlcnRFcXVhbHMoZGlybmFtZShuZXcgVVJMKFwiZmlsZTovLy9ob21lL3VzZXIvRG9jdW1lbnRzL2ltYWdlLnBuZ1wiKSksIFwiL2hvbWUvdXNlci9Eb2N1bWVudHNcIik7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gcGF0aCBQYXRoIHRvIGV4dHJhY3QgdGhlIGRpcmVjdG9yeSBmcm9tLlxuICogQHJldHVybnMgVGhlIGRpcmVjdG9yeSBwYXRoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlybmFtZShwYXRoOiBzdHJpbmcgfCBVUkwpOiBzdHJpbmcge1xuICByZXR1cm4gaXNXaW5kb3dzID8gd2luZG93c0Rpcm5hbWUocGF0aCkgOiBwb3NpeERpcm5hbWUocGF0aCk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEscURBQXFEO0FBQ3JELHFDQUFxQztBQUVyQyxTQUFTLFNBQVMsUUFBUSxXQUFXO0FBQ3JDLFNBQVMsV0FBVyxZQUFZLFFBQVEscUJBQXFCO0FBQzdELFNBQVMsV0FBVyxjQUFjLFFBQVEsdUJBQXVCO0FBRWpFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJDLEdBQ0QsT0FBTyxTQUFTLFFBQVEsSUFBa0I7RUFDeEMsT0FBTyxZQUFZLGVBQWUsUUFBUSxhQUFhO0FBQ3pEIn0=
// denoCacheMetadata=11930877774301494454,18343221954866164858