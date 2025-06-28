// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { indexOfNeedle } from "./index_of_needle.ts";
/**
 * Determines whether the source array contains the needle array.
 *
 * The complexity of this function is `O(source.length * needle.length)`.
 *
 * @param source Source array to check.
 * @param needle Needle array to check for.
 * @param start Start index in the source array to begin the search. Defaults to
 * 0.
 * @returns `true` if the source array contains the needle array, `false`
 * otherwise.
 *
 * @example Basic usage
 * ```ts
 * import { includesNeedle } from "@std/bytes/includes-needle";
 * import { assertEquals } from "@std/assert";
 *
 * const source = new Uint8Array([0, 1, 2, 1, 2, 1, 2, 3]);
 * const needle = new Uint8Array([1, 2]);
 *
 * assertEquals(includesNeedle(source, needle), true);
 * ```
 *
 * @example Start index
 * ```ts
 * import { includesNeedle } from "@std/bytes/includes-needle";
 * import { assertEquals } from "@std/assert";
 *
 * const source = new Uint8Array([0, 1, 2, 1, 2, 1, 2, 3]);
 * const needle = new Uint8Array([1, 2]);
 *
 * assertEquals(includesNeedle(source, needle, 3), true);
 * assertEquals(includesNeedle(source, needle, 6), false);
 * ```
 * The search will start at the specified index in the source array.
 */ export function includesNeedle(source, needle, start = 0) {
  return indexOfNeedle(source, needle, start) !== -1;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYnl0ZXMvMS4wLjYvaW5jbHVkZXNfbmVlZGxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjUgdGhlIERlbm8gYXV0aG9ycy4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGluZGV4T2ZOZWVkbGUgfSBmcm9tIFwiLi9pbmRleF9vZl9uZWVkbGUudHNcIjtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNvdXJjZSBhcnJheSBjb250YWlucyB0aGUgbmVlZGxlIGFycmF5LlxuICpcbiAqIFRoZSBjb21wbGV4aXR5IG9mIHRoaXMgZnVuY3Rpb24gaXMgYE8oc291cmNlLmxlbmd0aCAqIG5lZWRsZS5sZW5ndGgpYC5cbiAqXG4gKiBAcGFyYW0gc291cmNlIFNvdXJjZSBhcnJheSB0byBjaGVjay5cbiAqIEBwYXJhbSBuZWVkbGUgTmVlZGxlIGFycmF5IHRvIGNoZWNrIGZvci5cbiAqIEBwYXJhbSBzdGFydCBTdGFydCBpbmRleCBpbiB0aGUgc291cmNlIGFycmF5IHRvIGJlZ2luIHRoZSBzZWFyY2guIERlZmF1bHRzIHRvXG4gKiAwLlxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBzb3VyY2UgYXJyYXkgY29udGFpbnMgdGhlIG5lZWRsZSBhcnJheSwgYGZhbHNlYFxuICogb3RoZXJ3aXNlLlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgaW5jbHVkZXNOZWVkbGUgfSBmcm9tIFwiQHN0ZC9ieXRlcy9pbmNsdWRlcy1uZWVkbGVcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IHNvdXJjZSA9IG5ldyBVaW50OEFycmF5KFswLCAxLCAyLCAxLCAyLCAxLCAyLCAzXSk7XG4gKiBjb25zdCBuZWVkbGUgPSBuZXcgVWludDhBcnJheShbMSwgMl0pO1xuICpcbiAqIGFzc2VydEVxdWFscyhpbmNsdWRlc05lZWRsZShzb3VyY2UsIG5lZWRsZSksIHRydWUpO1xuICogYGBgXG4gKlxuICogQGV4YW1wbGUgU3RhcnQgaW5kZXhcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBpbmNsdWRlc05lZWRsZSB9IGZyb20gXCJAc3RkL2J5dGVzL2luY2x1ZGVzLW5lZWRsZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3Qgc291cmNlID0gbmV3IFVpbnQ4QXJyYXkoWzAsIDEsIDIsIDEsIDIsIDEsIDIsIDNdKTtcbiAqIGNvbnN0IG5lZWRsZSA9IG5ldyBVaW50OEFycmF5KFsxLCAyXSk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGluY2x1ZGVzTmVlZGxlKHNvdXJjZSwgbmVlZGxlLCAzKSwgdHJ1ZSk7XG4gKiBhc3NlcnRFcXVhbHMoaW5jbHVkZXNOZWVkbGUoc291cmNlLCBuZWVkbGUsIDYpLCBmYWxzZSk7XG4gKiBgYGBcbiAqIFRoZSBzZWFyY2ggd2lsbCBzdGFydCBhdCB0aGUgc3BlY2lmaWVkIGluZGV4IGluIHRoZSBzb3VyY2UgYXJyYXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmNsdWRlc05lZWRsZShcbiAgc291cmNlOiBVaW50OEFycmF5LFxuICBuZWVkbGU6IFVpbnQ4QXJyYXksXG4gIHN0YXJ0ID0gMCxcbik6IGJvb2xlYW4ge1xuICByZXR1cm4gaW5kZXhPZk5lZWRsZShzb3VyY2UsIG5lZWRsZSwgc3RhcnQpICE9PSAtMTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxxREFBcUQ7QUFDckQscUNBQXFDO0FBRXJDLFNBQVMsYUFBYSxRQUFRLHVCQUF1QjtBQUVyRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FtQ0MsR0FDRCxPQUFPLFNBQVMsZUFDZCxNQUFrQixFQUNsQixNQUFrQixFQUNsQixRQUFRLENBQUM7RUFFVCxPQUFPLGNBQWMsUUFBUSxRQUFRLFdBQVcsQ0FBQztBQUNuRCJ9
// denoCacheMetadata=1884951853362387523,883111308455931413