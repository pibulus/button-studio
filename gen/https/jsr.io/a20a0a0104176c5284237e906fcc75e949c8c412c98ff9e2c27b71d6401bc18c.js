// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Returns `true` if the suffix array appears at the end of the source array,
 * `false` otherwise.
 *
 * The complexity of this function is `O(suffix.length)`.
 *
 * @param source Source array to check.
 * @param suffix Suffix array to check for.
 * @returns `true` if the suffix array appears at the end of the source array,
 * `false` otherwise.
 *
 * @example Basic usage
 * ```ts
 * import { endsWith } from "@std/bytes/ends-with";
 * import { assertEquals } from "@std/assert";
 *
 * const source = new Uint8Array([0, 1, 2, 1, 2, 1, 2, 3]);
 * const suffix = new Uint8Array([1, 2, 3]);
 *
 * assertEquals(endsWith(source, suffix), true);
 * ```
 */ export function endsWith(source, suffix) {
  const diff = source.length - suffix.length;
  if (diff < 0) {
    return false;
  }
  for(let i = suffix.length - 1; i >= 0; i--){
    if (source[diff + i] !== suffix[i]) {
      return false;
    }
  }
  return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYnl0ZXMvMS4wLjYvZW5kc193aXRoLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjUgdGhlIERlbm8gYXV0aG9ycy4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHN1ZmZpeCBhcnJheSBhcHBlYXJzIGF0IHRoZSBlbmQgb2YgdGhlIHNvdXJjZSBhcnJheSxcbiAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICpcbiAqIFRoZSBjb21wbGV4aXR5IG9mIHRoaXMgZnVuY3Rpb24gaXMgYE8oc3VmZml4Lmxlbmd0aClgLlxuICpcbiAqIEBwYXJhbSBzb3VyY2UgU291cmNlIGFycmF5IHRvIGNoZWNrLlxuICogQHBhcmFtIHN1ZmZpeCBTdWZmaXggYXJyYXkgdG8gY2hlY2sgZm9yLlxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBzdWZmaXggYXJyYXkgYXBwZWFycyBhdCB0aGUgZW5kIG9mIHRoZSBzb3VyY2UgYXJyYXksXG4gKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGVuZHNXaXRoIH0gZnJvbSBcIkBzdGQvYnl0ZXMvZW5kcy13aXRoXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBjb25zdCBzb3VyY2UgPSBuZXcgVWludDhBcnJheShbMCwgMSwgMiwgMSwgMiwgMSwgMiwgM10pO1xuICogY29uc3Qgc3VmZml4ID0gbmV3IFVpbnQ4QXJyYXkoWzEsIDIsIDNdKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoZW5kc1dpdGgoc291cmNlLCBzdWZmaXgpLCB0cnVlKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5kc1dpdGgoc291cmNlOiBVaW50OEFycmF5LCBzdWZmaXg6IFVpbnQ4QXJyYXkpOiBib29sZWFuIHtcbiAgY29uc3QgZGlmZiA9IHNvdXJjZS5sZW5ndGggLSBzdWZmaXgubGVuZ3RoO1xuICBpZiAoZGlmZiA8IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZm9yIChsZXQgaSA9IHN1ZmZpeC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGlmIChzb3VyY2VbZGlmZiArIGldICE9PSBzdWZmaXhbaV0pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEscURBQXFEO0FBQ3JELHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBcUJDLEdBQ0QsT0FBTyxTQUFTLFNBQVMsTUFBa0IsRUFBRSxNQUFrQjtFQUM3RCxNQUFNLE9BQU8sT0FBTyxNQUFNLEdBQUcsT0FBTyxNQUFNO0VBQzFDLElBQUksT0FBTyxHQUFHO0lBQ1osT0FBTztFQUNUO0VBQ0EsSUFBSyxJQUFJLElBQUksT0FBTyxNQUFNLEdBQUcsR0FBRyxLQUFLLEdBQUcsSUFBSztJQUMzQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsS0FBSyxNQUFNLENBQUMsRUFBRSxFQUFFO01BQ2xDLE9BQU87SUFDVDtFQUNGO0VBQ0EsT0FBTztBQUNUIn0=
// denoCacheMetadata=3066933791909429392,4089349272424129067