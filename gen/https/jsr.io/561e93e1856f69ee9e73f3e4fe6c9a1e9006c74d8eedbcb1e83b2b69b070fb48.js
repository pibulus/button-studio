// Copyright 2018-2025 the Deno authors. MIT license.
// Copyright (c) 2014 Jameson Little. MIT License.
// This module is browser compatible.
/**
 * Utilities for
 * {@link https://www.rfc-editor.org/rfc/rfc4648.html#section-6 | base32}
 * encoding and decoding.
 *
 * Modified from {@link https://github.com/beatgammit/base64-js}.
 *
 * ```ts
 * import { encodeBase32, decodeBase32 } from "@std/encoding/base32";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(encodeBase32("foobar"), "MZXW6YTBOI======");
 *
 * assertEquals(
 *   decodeBase32("MZXW6YTBOI======"),
 *   new TextEncoder().encode("foobar")
 * );
 * ```
 *
 * @module
 */ import { calcSizeBase32, decode, encode } from "./_common32.ts";
import { detach } from "./_common_detach.ts";
const padding = "=".charCodeAt(0);
const alphabet = new TextEncoder().encode("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567");
const rAlphabet = new Uint8Array(128).fill(32); //alphabet.length
alphabet.forEach((byte, i)=>rAlphabet[byte] = i);
/**
 * Converts data into a base32-encoded string.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc4648.html#section-6}
 *
 * @param data The data to encode.
 * @returns The base32-encoded string.
 *
 * @example Usage
 * ```ts
 * import { encodeBase32 } from "@std/encoding/base32";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(encodeBase32("6c60c0"), "GZRTMMDDGA======");
 * ```
 */ export function encodeBase32(data) {
  if (typeof data === "string") {
    data = new TextEncoder().encode(data);
  } else if (data instanceof ArrayBuffer) data = new Uint8Array(data).slice();
  else data = data.slice();
  const [output, i] = detach(data, calcSizeBase32(data.length));
  encode(output, i, 0, alphabet, padding);
  return new TextDecoder().decode(output);
}
/**
 * Decodes a base32-encoded string.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc4648.html#section-6}
 *
 * @param b32 The base32-encoded string to decode.
 * @returns The decoded data.
 *
 * @example Usage
 * ```ts
 * import { decodeBase32 } from "@std/encoding/base32";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(
 *   decodeBase32("GZRTMMDDGA======"),
 *   new TextEncoder().encode("6c60c0"),
 * );
 * ```
 */ export function decodeBase32(b32) {
  const output = new TextEncoder().encode(b32);
  if (output.length % 8) {
    throw new TypeError(`Invalid base32 string: length (${output.length}) must be a multiple of 8`);
  }
  // deno-lint-ignore no-explicit-any
  return new Uint8Array(output.buffer.transfer(decode(output, 0, 0, rAlphabet, padding)));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZW5jb2RpbmcvMS4wLjEwL2Jhc2UzMi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI1IHRoZSBEZW5vIGF1dGhvcnMuIE1JVCBsaWNlbnNlLlxuLy8gQ29weXJpZ2h0IChjKSAyMDE0IEphbWVzb24gTGl0dGxlLiBNSVQgTGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBVdGlsaXRpZXMgZm9yXG4gKiB7QGxpbmsgaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzQ2NDguaHRtbCNzZWN0aW9uLTYgfCBiYXNlMzJ9XG4gKiBlbmNvZGluZyBhbmQgZGVjb2RpbmcuXG4gKlxuICogTW9kaWZpZWQgZnJvbSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2JlYXRnYW1taXQvYmFzZTY0LWpzfS5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZW5jb2RlQmFzZTMyLCBkZWNvZGVCYXNlMzIgfSBmcm9tIFwiQHN0ZC9lbmNvZGluZy9iYXNlMzJcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGFzc2VydEVxdWFscyhlbmNvZGVCYXNlMzIoXCJmb29iYXJcIiksIFwiTVpYVzZZVEJPST09PT09PVwiKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoXG4gKiAgIGRlY29kZUJhc2UzMihcIk1aWFc2WVRCT0k9PT09PT1cIiksXG4gKiAgIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcImZvb2JhclwiKVxuICogKTtcbiAqIGBgYFxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5pbXBvcnQgeyBjYWxjU2l6ZUJhc2UzMiwgZGVjb2RlLCBlbmNvZGUgfSBmcm9tIFwiLi9fY29tbW9uMzIudHNcIjtcbmltcG9ydCB7IGRldGFjaCB9IGZyb20gXCIuL19jb21tb25fZGV0YWNoLnRzXCI7XG5pbXBvcnQgdHlwZSB7IFVpbnQ4QXJyYXlfIH0gZnJvbSBcIi4vX3R5cGVzLnRzXCI7XG5leHBvcnQgdHlwZSB7IFVpbnQ4QXJyYXlfIH07XG5cbmNvbnN0IHBhZGRpbmcgPSBcIj1cIi5jaGFyQ29kZUF0KDApO1xuY29uc3QgYWxwaGFiZXQgPSBuZXcgVGV4dEVuY29kZXIoKVxuICAuZW5jb2RlKFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVoyMzQ1NjdcIik7XG5jb25zdCByQWxwaGFiZXQgPSBuZXcgVWludDhBcnJheSgxMjgpLmZpbGwoMzIpOyAvL2FscGhhYmV0Lmxlbmd0aFxuYWxwaGFiZXQuZm9yRWFjaCgoYnl0ZSwgaSkgPT4gckFscGhhYmV0W2J5dGVdID0gaSk7XG5cbi8qKlxuICogQ29udmVydHMgZGF0YSBpbnRvIGEgYmFzZTMyLWVuY29kZWQgc3RyaW5nLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vd3d3LnJmYy1lZGl0b3Iub3JnL3JmYy9yZmM0NjQ4Lmh0bWwjc2VjdGlvbi02fVxuICpcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGVuY29kZS5cbiAqIEByZXR1cm5zIFRoZSBiYXNlMzItZW5jb2RlZCBzdHJpbmcuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBlbmNvZGVCYXNlMzIgfSBmcm9tIFwiQHN0ZC9lbmNvZGluZy9iYXNlMzJcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGFzc2VydEVxdWFscyhlbmNvZGVCYXNlMzIoXCI2YzYwYzBcIiksIFwiR1pSVE1NRERHQT09PT09PVwiKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlQmFzZTMyKGRhdGE6IEFycmF5QnVmZmVyIHwgVWludDhBcnJheSB8IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gXCJzdHJpbmdcIikge1xuICAgIGRhdGEgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoZGF0YSkgYXMgVWludDhBcnJheV87XG4gIH0gZWxzZSBpZiAoZGF0YSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSkuc2xpY2UoKTtcbiAgZWxzZSBkYXRhID0gZGF0YS5zbGljZSgpO1xuICBjb25zdCBbb3V0cHV0LCBpXSA9IGRldGFjaChcbiAgICBkYXRhIGFzIFVpbnQ4QXJyYXlfLFxuICAgIGNhbGNTaXplQmFzZTMyKChkYXRhIGFzIFVpbnQ4QXJyYXlfKS5sZW5ndGgpLFxuICApO1xuICBlbmNvZGUob3V0cHV0LCBpLCAwLCBhbHBoYWJldCwgcGFkZGluZyk7XG4gIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUob3V0cHV0KTtcbn1cblxuLyoqXG4gKiBEZWNvZGVzIGEgYmFzZTMyLWVuY29kZWQgc3RyaW5nLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vd3d3LnJmYy1lZGl0b3Iub3JnL3JmYy9yZmM0NjQ4Lmh0bWwjc2VjdGlvbi02fVxuICpcbiAqIEBwYXJhbSBiMzIgVGhlIGJhc2UzMi1lbmNvZGVkIHN0cmluZyB0byBkZWNvZGUuXG4gKiBAcmV0dXJucyBUaGUgZGVjb2RlZCBkYXRhLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZGVjb2RlQmFzZTMyIH0gZnJvbSBcIkBzdGQvZW5jb2RpbmcvYmFzZTMyXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoXG4gKiAgIGRlY29kZUJhc2UzMihcIkdaUlRNTURER0E9PT09PT1cIiksXG4gKiAgIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShcIjZjNjBjMFwiKSxcbiAqICk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZUJhc2UzMihiMzI6IHN0cmluZyk6IFVpbnQ4QXJyYXlfIHtcbiAgY29uc3Qgb3V0cHV0ID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKGIzMikgYXMgVWludDhBcnJheV87XG4gIGlmIChvdXRwdXQubGVuZ3RoICUgOCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICBgSW52YWxpZCBiYXNlMzIgc3RyaW5nOiBsZW5ndGggKCR7b3V0cHV0Lmxlbmd0aH0pIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA4YCxcbiAgICApO1xuICB9XG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIHJldHVybiBuZXcgVWludDhBcnJheSgob3V0cHV0LmJ1ZmZlciBhcyBhbnkpXG4gICAgLnRyYW5zZmVyKGRlY29kZShvdXRwdXQsIDAsIDAsIHJBbHBoYWJldCwgcGFkZGluZykpKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxxREFBcUQ7QUFDckQsa0RBQWtEO0FBQ2xELHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FvQkMsR0FFRCxTQUFTLGNBQWMsRUFBRSxNQUFNLEVBQUUsTUFBTSxRQUFRLGlCQUFpQjtBQUNoRSxTQUFTLE1BQU0sUUFBUSxzQkFBc0I7QUFJN0MsTUFBTSxVQUFVLElBQUksVUFBVSxDQUFDO0FBQy9CLE1BQU0sV0FBVyxJQUFJLGNBQ2xCLE1BQU0sQ0FBQztBQUNWLE1BQU0sWUFBWSxJQUFJLFdBQVcsS0FBSyxJQUFJLENBQUMsS0FBSyxpQkFBaUI7QUFDakUsU0FBUyxPQUFPLENBQUMsQ0FBQyxNQUFNLElBQU0sU0FBUyxDQUFDLEtBQUssR0FBRztBQUVoRDs7Ozs7Ozs7Ozs7Ozs7O0NBZUMsR0FDRCxPQUFPLFNBQVMsYUFBYSxJQUF1QztFQUNsRSxJQUFJLE9BQU8sU0FBUyxVQUFVO0lBQzVCLE9BQU8sSUFBSSxjQUFjLE1BQU0sQ0FBQztFQUNsQyxPQUFPLElBQUksZ0JBQWdCLGFBQWEsT0FBTyxJQUFJLFdBQVcsTUFBTSxLQUFLO09BQ3BFLE9BQU8sS0FBSyxLQUFLO0VBQ3RCLE1BQU0sQ0FBQyxRQUFRLEVBQUUsR0FBRyxPQUNsQixNQUNBLGVBQWUsQUFBQyxLQUFxQixNQUFNO0VBRTdDLE9BQU8sUUFBUSxHQUFHLEdBQUcsVUFBVTtFQUMvQixPQUFPLElBQUksY0FBYyxNQUFNLENBQUM7QUFDbEM7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBa0JDLEdBQ0QsT0FBTyxTQUFTLGFBQWEsR0FBVztFQUN0QyxNQUFNLFNBQVMsSUFBSSxjQUFjLE1BQU0sQ0FBQztFQUN4QyxJQUFJLE9BQU8sTUFBTSxHQUFHLEdBQUc7SUFDckIsTUFBTSxJQUFJLFVBQ1IsQ0FBQywrQkFBK0IsRUFBRSxPQUFPLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQztFQUU5RTtFQUNBLG1DQUFtQztFQUNuQyxPQUFPLElBQUksV0FBVyxBQUFDLE9BQU8sTUFBTSxDQUNqQyxRQUFRLENBQUMsT0FBTyxRQUFRLEdBQUcsR0FBRyxXQUFXO0FBQzlDIn0=
// denoCacheMetadata=11223498518896585443,6800866693447708538