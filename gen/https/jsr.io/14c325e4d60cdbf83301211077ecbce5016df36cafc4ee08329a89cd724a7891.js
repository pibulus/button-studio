// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
/**
 * Check whether byte slices are equal to each other using 8-bit comparisons.
 *
 * @param a First array to check equality
 * @param b Second array to check equality
 * @returns `true` if the arrays are equal, `false` otherwise
 *
 * @private
 */ function equalsNaive(a, b) {
  for(let i = 0; i < b.length; i++){
    if (a[i] !== b[i]) return false;
  }
  return true;
}
/** Check whether byte slices are equal to each other using 32-bit comparisons.
 *
 * @param a First array to check equality.
 * @param b Second array to check equality.
 * @returns `true` if the arrays are equal, `false` otherwise.
 *
 * @private
 */ function equals32Bit(a, b) {
  const len = a.length;
  const compactOffset = 3 - (a.byteOffset + 3) % 4;
  const compactLen = Math.floor((len - compactOffset) / 4);
  const compactA = new Uint32Array(a.buffer, a.byteOffset + compactOffset, compactLen);
  const compactB = new Uint32Array(b.buffer, b.byteOffset + compactOffset, compactLen);
  for(let i = 0; i < compactOffset; i++){
    if (a[i] !== b[i]) return false;
  }
  for(let i = 0; i < compactA.length; i++){
    if (compactA[i] !== compactB[i]) return false;
  }
  for(let i = compactOffset + compactLen * 4; i < len; i++){
    if (a[i] !== b[i]) return false;
  }
  return true;
}
/**
 * Byte length threshold for when to use 32-bit comparisons, based on
 * benchmarks.
 *
 * @see {@link https://github.com/denoland/std/pull/4635}
 */ const THRESHOLD_32_BIT = 160;
/**
 * Check whether byte slices are equal to each other.
 *
 * @param a First array to check equality.
 * @param b Second array to check equality.
 * @returns `true` if the arrays are equal, `false` otherwise.
 *
 * @example Basic usage
 * ```ts
 * import { equals } from "@std/bytes/equals";
 * import { assertEquals } from "@std/assert";
 *
 * const a = new Uint8Array([1, 2, 3]);
 * const b = new Uint8Array([1, 2, 3]);
 * const c = new Uint8Array([4, 5, 6]);
 *
 * assertEquals(equals(a, b), true);
 * assertEquals(equals(a, c), false);
 * ```
 */ export function equals(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  return a.length >= THRESHOLD_32_BIT && a.byteOffset % 4 === b.byteOffset % 4 ? equals32Bit(a, b) : equalsNaive(a, b);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYnl0ZXMvMS4wLjYvZXF1YWxzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjUgdGhlIERlbm8gYXV0aG9ycy4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBieXRlIHNsaWNlcyBhcmUgZXF1YWwgdG8gZWFjaCBvdGhlciB1c2luZyA4LWJpdCBjb21wYXJpc29ucy5cbiAqXG4gKiBAcGFyYW0gYSBGaXJzdCBhcnJheSB0byBjaGVjayBlcXVhbGl0eVxuICogQHBhcmFtIGIgU2Vjb25kIGFycmF5IHRvIGNoZWNrIGVxdWFsaXR5XG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGFycmF5cyBhcmUgZXF1YWwsIGBmYWxzZWAgb3RoZXJ3aXNlXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gZXF1YWxzTmFpdmUoYTogVWludDhBcnJheSwgYjogVWludDhBcnJheSk6IGJvb2xlYW4ge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGIubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYVtpXSAhPT0gYltpXSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKiogQ2hlY2sgd2hldGhlciBieXRlIHNsaWNlcyBhcmUgZXF1YWwgdG8gZWFjaCBvdGhlciB1c2luZyAzMi1iaXQgY29tcGFyaXNvbnMuXG4gKlxuICogQHBhcmFtIGEgRmlyc3QgYXJyYXkgdG8gY2hlY2sgZXF1YWxpdHkuXG4gKiBAcGFyYW0gYiBTZWNvbmQgYXJyYXkgdG8gY2hlY2sgZXF1YWxpdHkuXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGFycmF5cyBhcmUgZXF1YWwsIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGVxdWFsczMyQml0KGE6IFVpbnQ4QXJyYXksIGI6IFVpbnQ4QXJyYXkpOiBib29sZWFuIHtcbiAgY29uc3QgbGVuID0gYS5sZW5ndGg7XG4gIGNvbnN0IGNvbXBhY3RPZmZzZXQgPSAzIC0gKChhLmJ5dGVPZmZzZXQgKyAzKSAlIDQpO1xuICBjb25zdCBjb21wYWN0TGVuID0gTWF0aC5mbG9vcigobGVuIC0gY29tcGFjdE9mZnNldCkgLyA0KTtcbiAgY29uc3QgY29tcGFjdEEgPSBuZXcgVWludDMyQXJyYXkoXG4gICAgYS5idWZmZXIsXG4gICAgYS5ieXRlT2Zmc2V0ICsgY29tcGFjdE9mZnNldCxcbiAgICBjb21wYWN0TGVuLFxuICApO1xuICBjb25zdCBjb21wYWN0QiA9IG5ldyBVaW50MzJBcnJheShcbiAgICBiLmJ1ZmZlcixcbiAgICBiLmJ5dGVPZmZzZXQgKyBjb21wYWN0T2Zmc2V0LFxuICAgIGNvbXBhY3RMZW4sXG4gICk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY29tcGFjdE9mZnNldDsgaSsrKSB7XG4gICAgaWYgKGFbaV0gIT09IGJbaV0pIHJldHVybiBmYWxzZTtcbiAgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbXBhY3RBLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGNvbXBhY3RBW2ldICE9PSBjb21wYWN0QltpXSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGZvciAobGV0IGkgPSBjb21wYWN0T2Zmc2V0ICsgY29tcGFjdExlbiAqIDQ7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChhW2ldICE9PSBiW2ldKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQnl0ZSBsZW5ndGggdGhyZXNob2xkIGZvciB3aGVuIHRvIHVzZSAzMi1iaXQgY29tcGFyaXNvbnMsIGJhc2VkIG9uXG4gKiBiZW5jaG1hcmtzLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9kZW5vbGFuZC9zdGQvcHVsbC80NjM1fVxuICovXG5jb25zdCBUSFJFU0hPTERfMzJfQklUID0gMTYwO1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYnl0ZSBzbGljZXMgYXJlIGVxdWFsIHRvIGVhY2ggb3RoZXIuXG4gKlxuICogQHBhcmFtIGEgRmlyc3QgYXJyYXkgdG8gY2hlY2sgZXF1YWxpdHkuXG4gKiBAcGFyYW0gYiBTZWNvbmQgYXJyYXkgdG8gY2hlY2sgZXF1YWxpdHkuXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGFycmF5cyBhcmUgZXF1YWwsIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICpcbiAqIEBleGFtcGxlIEJhc2ljIHVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZXF1YWxzIH0gZnJvbSBcIkBzdGQvYnl0ZXMvZXF1YWxzXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBjb25zdCBhID0gbmV3IFVpbnQ4QXJyYXkoWzEsIDIsIDNdKTtcbiAqIGNvbnN0IGIgPSBuZXcgVWludDhBcnJheShbMSwgMiwgM10pO1xuICogY29uc3QgYyA9IG5ldyBVaW50OEFycmF5KFs0LCA1LCA2XSk7XG4gKlxuICogYXNzZXJ0RXF1YWxzKGVxdWFscyhhLCBiKSwgdHJ1ZSk7XG4gKiBhc3NlcnRFcXVhbHMoZXF1YWxzKGEsIGMpLCBmYWxzZSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhOiBVaW50OEFycmF5LCBiOiBVaW50OEFycmF5KTogYm9vbGVhbiB7XG4gIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGEubGVuZ3RoID49IFRIUkVTSE9MRF8zMl9CSVQgJiZcbiAgICAgIChhLmJ5dGVPZmZzZXQgJSA0KSA9PT0gKGIuYnl0ZU9mZnNldCAlIDQpXG4gICAgPyBlcXVhbHMzMkJpdChhLCBiKVxuICAgIDogZXF1YWxzTmFpdmUoYSwgYik7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEscURBQXFEO0FBQ3JELHFDQUFxQztBQUVyQzs7Ozs7Ozs7Q0FRQyxHQUNELFNBQVMsWUFBWSxDQUFhLEVBQUUsQ0FBYTtFQUMvQyxJQUFLLElBQUksSUFBSSxHQUFHLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSztJQUNqQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxPQUFPO0VBQzVCO0VBQ0EsT0FBTztBQUNUO0FBRUE7Ozs7Ozs7Q0FPQyxHQUNELFNBQVMsWUFBWSxDQUFhLEVBQUUsQ0FBYTtFQUMvQyxNQUFNLE1BQU0sRUFBRSxNQUFNO0VBQ3BCLE1BQU0sZ0JBQWdCLElBQUssQ0FBQyxFQUFFLFVBQVUsR0FBRyxDQUFDLElBQUk7RUFDaEQsTUFBTSxhQUFhLEtBQUssS0FBSyxDQUFDLENBQUMsTUFBTSxhQUFhLElBQUk7RUFDdEQsTUFBTSxXQUFXLElBQUksWUFDbkIsRUFBRSxNQUFNLEVBQ1IsRUFBRSxVQUFVLEdBQUcsZUFDZjtFQUVGLE1BQU0sV0FBVyxJQUFJLFlBQ25CLEVBQUUsTUFBTSxFQUNSLEVBQUUsVUFBVSxHQUFHLGVBQ2Y7RUFFRixJQUFLLElBQUksSUFBSSxHQUFHLElBQUksZUFBZSxJQUFLO0lBQ3RDLElBQUksQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLE9BQU87RUFDNUI7RUFDQSxJQUFLLElBQUksSUFBSSxHQUFHLElBQUksU0FBUyxNQUFNLEVBQUUsSUFBSztJQUN4QyxJQUFJLFFBQVEsQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLEVBQUUsRUFBRSxPQUFPO0VBQzFDO0VBQ0EsSUFBSyxJQUFJLElBQUksZ0JBQWdCLGFBQWEsR0FBRyxJQUFJLEtBQUssSUFBSztJQUN6RCxJQUFJLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxPQUFPO0VBQzVCO0VBQ0EsT0FBTztBQUNUO0FBRUE7Ozs7O0NBS0MsR0FDRCxNQUFNLG1CQUFtQjtBQUV6Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CQyxHQUNELE9BQU8sU0FBUyxPQUFPLENBQWEsRUFBRSxDQUFhO0VBQ2pELElBQUksRUFBRSxNQUFNLEtBQUssRUFBRSxNQUFNLEVBQUU7SUFDekIsT0FBTztFQUNUO0VBQ0EsT0FBTyxFQUFFLE1BQU0sSUFBSSxvQkFDZixBQUFDLEVBQUUsVUFBVSxHQUFHLE1BQVEsRUFBRSxVQUFVLEdBQUcsSUFDdkMsWUFBWSxHQUFHLEtBQ2YsWUFBWSxHQUFHO0FBQ3JCIn0=
// denoCacheMetadata=5390305320774600427,13084003288872948909