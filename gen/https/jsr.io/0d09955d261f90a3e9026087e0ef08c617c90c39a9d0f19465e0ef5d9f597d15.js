// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Returns `true` if the prefix array appears at the start of the source array,
 * `false` otherwise.
 *
 * The complexity of this function is `O(prefix.length)`.
 *
 * @param source Source array to check.
 * @param prefix Prefix array to check for.
 * @returns `true` if the prefix array appears at the start of the source array,
 * `false` otherwise.
 *
 * @example Basic usage
 * ```ts
 * import { startsWith } from "@std/bytes/starts-with";
 * import { assertEquals } from "@std/assert";
 *
 * const source = new Uint8Array([0, 1, 2, 1, 2, 1, 2, 3]);
 * const prefix = new Uint8Array([0, 1, 2]);
 *
 * assertEquals(startsWith(source, prefix), true);
 * ```
 */ export function startsWith(source, prefix) {
  if (prefix.length > source.length) {
    return false;
  }
  for(let i = 0; i < prefix.length; i++){
    if (source[i] !== prefix[i]) return false;
  }
  return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYnl0ZXMvMS4wLjYvc3RhcnRzX3dpdGgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNSB0aGUgRGVubyBhdXRob3JzLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgcHJlZml4IGFycmF5IGFwcGVhcnMgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzb3VyY2UgYXJyYXksXG4gKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAqXG4gKiBUaGUgY29tcGxleGl0eSBvZiB0aGlzIGZ1bmN0aW9uIGlzIGBPKHByZWZpeC5sZW5ndGgpYC5cbiAqXG4gKiBAcGFyYW0gc291cmNlIFNvdXJjZSBhcnJheSB0byBjaGVjay5cbiAqIEBwYXJhbSBwcmVmaXggUHJlZml4IGFycmF5IHRvIGNoZWNrIGZvci5cbiAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgcHJlZml4IGFycmF5IGFwcGVhcnMgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzb3VyY2UgYXJyYXksXG4gKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHN0YXJ0c1dpdGggfSBmcm9tIFwiQHN0ZC9ieXRlcy9zdGFydHMtd2l0aFwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3Qgc291cmNlID0gbmV3IFVpbnQ4QXJyYXkoWzAsIDEsIDIsIDEsIDIsIDEsIDIsIDNdKTtcbiAqIGNvbnN0IHByZWZpeCA9IG5ldyBVaW50OEFycmF5KFswLCAxLCAyXSk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKHN0YXJ0c1dpdGgoc291cmNlLCBwcmVmaXgpLCB0cnVlKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRzV2l0aChzb3VyY2U6IFVpbnQ4QXJyYXksIHByZWZpeDogVWludDhBcnJheSk6IGJvb2xlYW4ge1xuICBpZiAocHJlZml4Lmxlbmd0aCA+IHNvdXJjZS5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWZpeC5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzb3VyY2VbaV0gIT09IHByZWZpeFtpXSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHFEQUFxRDtBQUNyRCxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXFCQyxHQUNELE9BQU8sU0FBUyxXQUFXLE1BQWtCLEVBQUUsTUFBa0I7RUFDL0QsSUFBSSxPQUFPLE1BQU0sR0FBRyxPQUFPLE1BQU0sRUFBRTtJQUNqQyxPQUFPO0VBQ1Q7RUFFQSxJQUFLLElBQUksSUFBSSxHQUFHLElBQUksT0FBTyxNQUFNLEVBQUUsSUFBSztJQUN0QyxJQUFJLE1BQU0sQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPO0VBQ3RDO0VBQ0EsT0FBTztBQUNUIn0=
// denoCacheMetadata=11762755975675737874,6693639705299142667