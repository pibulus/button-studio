// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Returns the index of the first occurrence of the needle array in the source
 * array, or -1 if it is not present.
 *
 * A start index can be specified as the third argument that begins the search
 * at that given index. The start index defaults to the start of the array.
 *
 * The complexity of this function is `O(source.length * needle.length)`.
 *
 * @param source Source array to check.
 * @param needle Needle array to check for.
 * @param start Start index in the source array to begin the search. Defaults to
 * 0.
 * @returns Index of the first occurrence of the needle array in the source
 * array, or -1 if it is not present.
 *
 * @example Basic usage
 * ```ts
 * import { indexOfNeedle } from "@std/bytes/index-of-needle";
 * import { assertEquals } from "@std/assert";
 *
 * const source = new Uint8Array([0, 1, 2, 1, 2, 1, 2, 3]);
 * const needle = new Uint8Array([1, 2]);
 * const notNeedle = new Uint8Array([5, 0]);
 *
 * assertEquals(indexOfNeedle(source, needle), 1);
 * assertEquals(indexOfNeedle(source, notNeedle), -1);
 * ```
 *
 * @example Start index
 * ```ts
 * import { indexOfNeedle } from "@std/bytes/index-of-needle";
 * import { assertEquals } from "@std/assert";
 *
 * const source = new Uint8Array([0, 1, 2, 1, 2, 1, 2, 3]);
 * const needle = new Uint8Array([1, 2]);
 *
 * assertEquals(indexOfNeedle(source, needle, 2), 3);
 * assertEquals(indexOfNeedle(source, needle, 6), -1);
 * ```
 * Defining a start index will begin the search at the specified index in the
 * source array.
 */ export function indexOfNeedle(source, needle, start = 0) {
  if (start < 0) {
    start = Math.max(0, source.length + start);
  }
  if (needle.length > source.length - start) {
    return -1;
  }
  const s = needle[0];
  for(let i = start; i < source.length; i++){
    if (source[i] !== s) continue;
    let matched = 1;
    let j = i + 1;
    while(matched < needle.length && source[j] === needle[j - i]){
      matched++;
      j++;
    }
    if (matched === needle.length) {
      return i;
    }
  }
  return -1;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYnl0ZXMvMS4wLjYvaW5kZXhfb2ZfbmVlZGxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjUgdGhlIERlbm8gYXV0aG9ycy4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIG5lZWRsZSBhcnJheSBpbiB0aGUgc291cmNlXG4gKiBhcnJheSwgb3IgLTEgaWYgaXQgaXMgbm90IHByZXNlbnQuXG4gKlxuICogQSBzdGFydCBpbmRleCBjYW4gYmUgc3BlY2lmaWVkIGFzIHRoZSB0aGlyZCBhcmd1bWVudCB0aGF0IGJlZ2lucyB0aGUgc2VhcmNoXG4gKiBhdCB0aGF0IGdpdmVuIGluZGV4LiBUaGUgc3RhcnQgaW5kZXggZGVmYXVsdHMgdG8gdGhlIHN0YXJ0IG9mIHRoZSBhcnJheS5cbiAqXG4gKiBUaGUgY29tcGxleGl0eSBvZiB0aGlzIGZ1bmN0aW9uIGlzIGBPKHNvdXJjZS5sZW5ndGggKiBuZWVkbGUubGVuZ3RoKWAuXG4gKlxuICogQHBhcmFtIHNvdXJjZSBTb3VyY2UgYXJyYXkgdG8gY2hlY2suXG4gKiBAcGFyYW0gbmVlZGxlIE5lZWRsZSBhcnJheSB0byBjaGVjayBmb3IuXG4gKiBAcGFyYW0gc3RhcnQgU3RhcnQgaW5kZXggaW4gdGhlIHNvdXJjZSBhcnJheSB0byBiZWdpbiB0aGUgc2VhcmNoLiBEZWZhdWx0cyB0b1xuICogMC5cbiAqIEByZXR1cm5zIEluZGV4IG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSBuZWVkbGUgYXJyYXkgaW4gdGhlIHNvdXJjZVxuICogYXJyYXksIG9yIC0xIGlmIGl0IGlzIG5vdCBwcmVzZW50LlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgaW5kZXhPZk5lZWRsZSB9IGZyb20gXCJAc3RkL2J5dGVzL2luZGV4LW9mLW5lZWRsZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3Qgc291cmNlID0gbmV3IFVpbnQ4QXJyYXkoWzAsIDEsIDIsIDEsIDIsIDEsIDIsIDNdKTtcbiAqIGNvbnN0IG5lZWRsZSA9IG5ldyBVaW50OEFycmF5KFsxLCAyXSk7XG4gKiBjb25zdCBub3ROZWVkbGUgPSBuZXcgVWludDhBcnJheShbNSwgMF0pO1xuICpcbiAqIGFzc2VydEVxdWFscyhpbmRleE9mTmVlZGxlKHNvdXJjZSwgbmVlZGxlKSwgMSk7XG4gKiBhc3NlcnRFcXVhbHMoaW5kZXhPZk5lZWRsZShzb3VyY2UsIG5vdE5lZWRsZSksIC0xKTtcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIFN0YXJ0IGluZGV4XG4gKiBgYGB0c1xuICogaW1wb3J0IHsgaW5kZXhPZk5lZWRsZSB9IGZyb20gXCJAc3RkL2J5dGVzL2luZGV4LW9mLW5lZWRsZVwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3Qgc291cmNlID0gbmV3IFVpbnQ4QXJyYXkoWzAsIDEsIDIsIDEsIDIsIDEsIDIsIDNdKTtcbiAqIGNvbnN0IG5lZWRsZSA9IG5ldyBVaW50OEFycmF5KFsxLCAyXSk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGluZGV4T2ZOZWVkbGUoc291cmNlLCBuZWVkbGUsIDIpLCAzKTtcbiAqIGFzc2VydEVxdWFscyhpbmRleE9mTmVlZGxlKHNvdXJjZSwgbmVlZGxlLCA2KSwgLTEpO1xuICogYGBgXG4gKiBEZWZpbmluZyBhIHN0YXJ0IGluZGV4IHdpbGwgYmVnaW4gdGhlIHNlYXJjaCBhdCB0aGUgc3BlY2lmaWVkIGluZGV4IGluIHRoZVxuICogc291cmNlIGFycmF5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5kZXhPZk5lZWRsZShcbiAgc291cmNlOiBVaW50OEFycmF5LFxuICBuZWVkbGU6IFVpbnQ4QXJyYXksXG4gIHN0YXJ0ID0gMCxcbik6IG51bWJlciB7XG4gIGlmIChzdGFydCA8IDApIHtcbiAgICBzdGFydCA9IE1hdGgubWF4KDAsIHNvdXJjZS5sZW5ndGggKyBzdGFydCk7XG4gIH1cbiAgaWYgKG5lZWRsZS5sZW5ndGggPiBzb3VyY2UubGVuZ3RoIC0gc3RhcnQpIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cbiAgY29uc3QgcyA9IG5lZWRsZVswXTtcbiAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgc291cmNlLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHNvdXJjZVtpXSAhPT0gcykgY29udGludWU7XG4gICAgbGV0IG1hdGNoZWQgPSAxO1xuICAgIGxldCBqID0gaSArIDE7XG4gICAgd2hpbGUgKG1hdGNoZWQgPCBuZWVkbGUubGVuZ3RoICYmIHNvdXJjZVtqXSA9PT0gbmVlZGxlW2ogLSBpXSkge1xuICAgICAgbWF0Y2hlZCsrO1xuICAgICAgaisrO1xuICAgIH1cbiAgICBpZiAobWF0Y2hlZCA9PT0gbmVlZGxlLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxxREFBcUQ7QUFDckQscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0EwQ0MsR0FDRCxPQUFPLFNBQVMsY0FDZCxNQUFrQixFQUNsQixNQUFrQixFQUNsQixRQUFRLENBQUM7RUFFVCxJQUFJLFFBQVEsR0FBRztJQUNiLFFBQVEsS0FBSyxHQUFHLENBQUMsR0FBRyxPQUFPLE1BQU0sR0FBRztFQUN0QztFQUNBLElBQUksT0FBTyxNQUFNLEdBQUcsT0FBTyxNQUFNLEdBQUcsT0FBTztJQUN6QyxPQUFPLENBQUM7RUFDVjtFQUNBLE1BQU0sSUFBSSxNQUFNLENBQUMsRUFBRTtFQUNuQixJQUFLLElBQUksSUFBSSxPQUFPLElBQUksT0FBTyxNQUFNLEVBQUUsSUFBSztJQUMxQyxJQUFJLE1BQU0sQ0FBQyxFQUFFLEtBQUssR0FBRztJQUNyQixJQUFJLFVBQVU7SUFDZCxJQUFJLElBQUksSUFBSTtJQUNaLE1BQU8sVUFBVSxPQUFPLE1BQU0sSUFBSSxNQUFNLENBQUMsRUFBRSxLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBRTtNQUM3RDtNQUNBO0lBQ0Y7SUFDQSxJQUFJLFlBQVksT0FBTyxNQUFNLEVBQUU7TUFDN0IsT0FBTztJQUNUO0VBQ0Y7RUFDQSxPQUFPLENBQUM7QUFDViJ9
// denoCacheMetadata=17314705316291066561,3519214986867644070