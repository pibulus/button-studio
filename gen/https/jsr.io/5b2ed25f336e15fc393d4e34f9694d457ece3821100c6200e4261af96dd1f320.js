// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Returns the index of the last occurrence of the needle array in the source
 * array, or -1 if it is not present.
 *
 * The complexity of this function is `O(source.length * needle.length)`.
 *
 * @param source Source array to check.
 * @param needle Needle array to check for.
 * @param start Start index in the source array to begin the search. Defaults to
 * `source.length - 1`.
 * @returns Index of the last occurrence of the needle array in the source
 * array, or -1 if it is not present.
 *
 * @example Basic usage
 * ```ts
 * import { lastIndexOfNeedle } from "@std/bytes/last-index-of-needle";
 * import { assertEquals } from "@std/assert";
 *
 * const source = new Uint8Array([0, 1, 2, 1, 2, 1, 2, 3]);
 * const needle = new Uint8Array([1, 2]);
 * const notNeedle = new Uint8Array([5, 0]);
 *
 * assertEquals(lastIndexOfNeedle(source, needle), 5);
 * assertEquals(lastIndexOfNeedle(source, notNeedle), -1);
 * ```
 *
 * @example Start index
 * ```ts
 * import { lastIndexOfNeedle } from "@std/bytes/last-index-of-needle";
 * import { assertEquals } from "@std/assert";
 *
 * const source = new Uint8Array([0, 1, 2, 1, 2, 1, 2, 3]);
 * const needle = new Uint8Array([1, 2]);
 *
 * assertEquals(lastIndexOfNeedle(source, needle, 2), 1);
 * assertEquals(lastIndexOfNeedle(source, needle, 6), 5);
 * ```
 * Defining a start index will begin the search at the specified index in the
 * source array.
 */ export function lastIndexOfNeedle(source, needle, start = source.length - 1) {
  if (start < 0) {
    return -1;
  }
  if (start >= source.length) {
    start = source.length - 1;
  }
  const e = needle[needle.length - 1];
  for(let i = start; i >= 0; i--){
    if (source[i] !== e) continue;
    let matched = 1;
    let j = i;
    while(matched < needle.length && source[--j] === needle[needle.length - 1 - (i - j)]){
      matched++;
    }
    if (matched === needle.length) {
      return i - needle.length + 1;
    }
  }
  return -1;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYnl0ZXMvMS4wLjYvbGFzdF9pbmRleF9vZl9uZWVkbGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNSB0aGUgRGVubyBhdXRob3JzLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgbGFzdCBvY2N1cnJlbmNlIG9mIHRoZSBuZWVkbGUgYXJyYXkgaW4gdGhlIHNvdXJjZVxuICogYXJyYXksIG9yIC0xIGlmIGl0IGlzIG5vdCBwcmVzZW50LlxuICpcbiAqIFRoZSBjb21wbGV4aXR5IG9mIHRoaXMgZnVuY3Rpb24gaXMgYE8oc291cmNlLmxlbmd0aCAqIG5lZWRsZS5sZW5ndGgpYC5cbiAqXG4gKiBAcGFyYW0gc291cmNlIFNvdXJjZSBhcnJheSB0byBjaGVjay5cbiAqIEBwYXJhbSBuZWVkbGUgTmVlZGxlIGFycmF5IHRvIGNoZWNrIGZvci5cbiAqIEBwYXJhbSBzdGFydCBTdGFydCBpbmRleCBpbiB0aGUgc291cmNlIGFycmF5IHRvIGJlZ2luIHRoZSBzZWFyY2guIERlZmF1bHRzIHRvXG4gKiBgc291cmNlLmxlbmd0aCAtIDFgLlxuICogQHJldHVybnMgSW5kZXggb2YgdGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgbmVlZGxlIGFycmF5IGluIHRoZSBzb3VyY2VcbiAqIGFycmF5LCBvciAtMSBpZiBpdCBpcyBub3QgcHJlc2VudC5cbiAqXG4gKiBAZXhhbXBsZSBCYXNpYyB1c2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGxhc3RJbmRleE9mTmVlZGxlIH0gZnJvbSBcIkBzdGQvYnl0ZXMvbGFzdC1pbmRleC1vZi1uZWVkbGVcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IHNvdXJjZSA9IG5ldyBVaW50OEFycmF5KFswLCAxLCAyLCAxLCAyLCAxLCAyLCAzXSk7XG4gKiBjb25zdCBuZWVkbGUgPSBuZXcgVWludDhBcnJheShbMSwgMl0pO1xuICogY29uc3Qgbm90TmVlZGxlID0gbmV3IFVpbnQ4QXJyYXkoWzUsIDBdKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMobGFzdEluZGV4T2ZOZWVkbGUoc291cmNlLCBuZWVkbGUpLCA1KTtcbiAqIGFzc2VydEVxdWFscyhsYXN0SW5kZXhPZk5lZWRsZShzb3VyY2UsIG5vdE5lZWRsZSksIC0xKTtcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIFN0YXJ0IGluZGV4XG4gKiBgYGB0c1xuICogaW1wb3J0IHsgbGFzdEluZGV4T2ZOZWVkbGUgfSBmcm9tIFwiQHN0ZC9ieXRlcy9sYXN0LWluZGV4LW9mLW5lZWRsZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3Qgc291cmNlID0gbmV3IFVpbnQ4QXJyYXkoWzAsIDEsIDIsIDEsIDIsIDEsIDIsIDNdKTtcbiAqIGNvbnN0IG5lZWRsZSA9IG5ldyBVaW50OEFycmF5KFsxLCAyXSk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGxhc3RJbmRleE9mTmVlZGxlKHNvdXJjZSwgbmVlZGxlLCAyKSwgMSk7XG4gKiBhc3NlcnRFcXVhbHMobGFzdEluZGV4T2ZOZWVkbGUoc291cmNlLCBuZWVkbGUsIDYpLCA1KTtcbiAqIGBgYFxuICogRGVmaW5pbmcgYSBzdGFydCBpbmRleCB3aWxsIGJlZ2luIHRoZSBzZWFyY2ggYXQgdGhlIHNwZWNpZmllZCBpbmRleCBpbiB0aGVcbiAqIHNvdXJjZSBhcnJheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxhc3RJbmRleE9mTmVlZGxlKFxuICBzb3VyY2U6IFVpbnQ4QXJyYXksXG4gIG5lZWRsZTogVWludDhBcnJheSxcbiAgc3RhcnQ6IG51bWJlciA9IHNvdXJjZS5sZW5ndGggLSAxLFxuKTogbnVtYmVyIHtcbiAgaWYgKHN0YXJ0IDwgMCkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuICBpZiAoc3RhcnQgPj0gc291cmNlLmxlbmd0aCkge1xuICAgIHN0YXJ0ID0gc291cmNlLmxlbmd0aCAtIDE7XG4gIH1cbiAgY29uc3QgZSA9IG5lZWRsZVtuZWVkbGUubGVuZ3RoIC0gMV07XG4gIGZvciAobGV0IGkgPSBzdGFydDsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoc291cmNlW2ldICE9PSBlKSBjb250aW51ZTtcbiAgICBsZXQgbWF0Y2hlZCA9IDE7XG4gICAgbGV0IGogPSBpO1xuICAgIHdoaWxlIChcbiAgICAgIG1hdGNoZWQgPCBuZWVkbGUubGVuZ3RoICYmXG4gICAgICBzb3VyY2VbLS1qXSA9PT0gbmVlZGxlW25lZWRsZS5sZW5ndGggLSAxIC0gKGkgLSBqKV1cbiAgICApIHtcbiAgICAgIG1hdGNoZWQrKztcbiAgICB9XG4gICAgaWYgKG1hdGNoZWQgPT09IG5lZWRsZS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBpIC0gbmVlZGxlLmxlbmd0aCArIDE7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxxREFBcUQ7QUFDckQscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F1Q0MsR0FDRCxPQUFPLFNBQVMsa0JBQ2QsTUFBa0IsRUFDbEIsTUFBa0IsRUFDbEIsUUFBZ0IsT0FBTyxNQUFNLEdBQUcsQ0FBQztFQUVqQyxJQUFJLFFBQVEsR0FBRztJQUNiLE9BQU8sQ0FBQztFQUNWO0VBQ0EsSUFBSSxTQUFTLE9BQU8sTUFBTSxFQUFFO0lBQzFCLFFBQVEsT0FBTyxNQUFNLEdBQUc7RUFDMUI7RUFDQSxNQUFNLElBQUksTUFBTSxDQUFDLE9BQU8sTUFBTSxHQUFHLEVBQUU7RUFDbkMsSUFBSyxJQUFJLElBQUksT0FBTyxLQUFLLEdBQUcsSUFBSztJQUMvQixJQUFJLE1BQU0sQ0FBQyxFQUFFLEtBQUssR0FBRztJQUNyQixJQUFJLFVBQVU7SUFDZCxJQUFJLElBQUk7SUFDUixNQUNFLFVBQVUsT0FBTyxNQUFNLElBQ3ZCLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxNQUFNLENBQUMsT0FBTyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQ25EO01BQ0E7SUFDRjtJQUNBLElBQUksWUFBWSxPQUFPLE1BQU0sRUFBRTtNQUM3QixPQUFPLElBQUksT0FBTyxNQUFNLEdBQUc7SUFDN0I7RUFDRjtFQUNBLE9BQU8sQ0FBQztBQUNWIn0=
// denoCacheMetadata=8774014790668585788,1284859624877907244