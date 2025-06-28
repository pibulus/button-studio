// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
import { copy } from "./copy.ts";
/**
 * Returns a new byte slice composed of `count` repetitions of the `source`
 * array.
 *
 * @param source Source array to repeat.
 * @param count Number of times to repeat the source array.
 * @returns A new byte slice composed of `count` repetitions of the `source`
 * array.
 *
 * @example Basic usage
 * ```ts
 * import { repeat } from "@std/bytes/repeat";
 * import { assertEquals } from "@std/assert";
 *
 * const source = new Uint8Array([0, 1, 2]);
 *
 * assertEquals(repeat(source, 3), new Uint8Array([0, 1, 2, 0, 1, 2, 0, 1, 2]));
 * ```
 *
 * @example Zero count
 * ```ts
 * import { repeat } from "@std/bytes/repeat";
 * import { assertEquals } from "@std/assert";
 *
 * const source = new Uint8Array([0, 1, 2]);
 *
 * assertEquals(repeat(source, 0), new Uint8Array());
 * ```
 */ export function repeat(source, count) {
  if (count < 0 || !Number.isInteger(count)) {
    throw new RangeError("Count must be a non-negative integer");
  }
  const repeated = new Uint8Array(source.length * count);
  let offset = 0;
  while(offset < repeated.length){
    offset += copy(source, repeated, offset);
  }
  return repeated;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYnl0ZXMvMS4wLjYvcmVwZWF0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjUgdGhlIERlbm8gYXV0aG9ycy4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5pbXBvcnQgeyBjb3B5IH0gZnJvbSBcIi4vY29weS50c1wiO1xuaW1wb3J0IHR5cGUgeyBVaW50OEFycmF5XyB9IGZyb20gXCIuL190eXBlcy50c1wiO1xuZXhwb3J0IHR5cGUgeyBVaW50OEFycmF5XyB9O1xuXG4vKipcbiAqIFJldHVybnMgYSBuZXcgYnl0ZSBzbGljZSBjb21wb3NlZCBvZiBgY291bnRgIHJlcGV0aXRpb25zIG9mIHRoZSBgc291cmNlYFxuICogYXJyYXkuXG4gKlxuICogQHBhcmFtIHNvdXJjZSBTb3VyY2UgYXJyYXkgdG8gcmVwZWF0LlxuICogQHBhcmFtIGNvdW50IE51bWJlciBvZiB0aW1lcyB0byByZXBlYXQgdGhlIHNvdXJjZSBhcnJheS5cbiAqIEByZXR1cm5zIEEgbmV3IGJ5dGUgc2xpY2UgY29tcG9zZWQgb2YgYGNvdW50YCByZXBldGl0aW9ucyBvZiB0aGUgYHNvdXJjZWBcbiAqIGFycmF5LlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcmVwZWF0IH0gZnJvbSBcIkBzdGQvYnl0ZXMvcmVwZWF0XCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBjb25zdCBzb3VyY2UgPSBuZXcgVWludDhBcnJheShbMCwgMSwgMl0pO1xuICpcbiAqIGFzc2VydEVxdWFscyhyZXBlYXQoc291cmNlLCAzKSwgbmV3IFVpbnQ4QXJyYXkoWzAsIDEsIDIsIDAsIDEsIDIsIDAsIDEsIDJdKSk7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBaZXJvIGNvdW50XG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcmVwZWF0IH0gZnJvbSBcIkBzdGQvYnl0ZXMvcmVwZWF0XCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBjb25zdCBzb3VyY2UgPSBuZXcgVWludDhBcnJheShbMCwgMSwgMl0pO1xuICpcbiAqIGFzc2VydEVxdWFscyhyZXBlYXQoc291cmNlLCAwKSwgbmV3IFVpbnQ4QXJyYXkoKSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlcGVhdChzb3VyY2U6IFVpbnQ4QXJyYXksIGNvdW50OiBudW1iZXIpOiBVaW50OEFycmF5XyB7XG4gIGlmIChjb3VudCA8IDAgfHwgIU51bWJlci5pc0ludGVnZXIoY291bnQpKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJDb3VudCBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXJcIik7XG4gIH1cblxuICBjb25zdCByZXBlYXRlZCA9IG5ldyBVaW50OEFycmF5KHNvdXJjZS5sZW5ndGggKiBjb3VudCk7XG4gIGxldCBvZmZzZXQgPSAwO1xuXG4gIHdoaWxlIChvZmZzZXQgPCByZXBlYXRlZC5sZW5ndGgpIHtcbiAgICBvZmZzZXQgKz0gY29weShzb3VyY2UsIHJlcGVhdGVkLCBvZmZzZXQpO1xuICB9XG5cbiAgcmV0dXJuIHJlcGVhdGVkO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHFEQUFxRDtBQUNyRCxxQ0FBcUM7QUFDckMsU0FBUyxJQUFJLFFBQVEsWUFBWTtBQUlqQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTRCQyxHQUNELE9BQU8sU0FBUyxPQUFPLE1BQWtCLEVBQUUsS0FBYTtFQUN0RCxJQUFJLFFBQVEsS0FBSyxDQUFDLE9BQU8sU0FBUyxDQUFDLFFBQVE7SUFDekMsTUFBTSxJQUFJLFdBQVc7RUFDdkI7RUFFQSxNQUFNLFdBQVcsSUFBSSxXQUFXLE9BQU8sTUFBTSxHQUFHO0VBQ2hELElBQUksU0FBUztFQUViLE1BQU8sU0FBUyxTQUFTLE1BQU0sQ0FBRTtJQUMvQixVQUFVLEtBQUssUUFBUSxVQUFVO0VBQ25DO0VBRUEsT0FBTztBQUNUIn0=
// denoCacheMetadata=14035842092791579877,578920285789952304