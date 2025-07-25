// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { AssertionError } from "./assertion_error.ts";
import { format } from "./_format.ts";
/**
 * Make an assertion that `actual` and `expected` are not strictly equal.
 * If the values are strictly equal then throw.
 *
 * @example
 * ```ts
 * import { assertNotStrictEquals } from "https://deno.land/std@$STD_VERSION/assert/assert_not_strict_equals.ts";
 *
 * assertNotStrictEquals(1, 1); // Doesn't throw
 * assertNotStrictEquals(1, 2); // Throws
 * ```
 */ export function assertNotStrictEquals(actual, expected, msg) {
  if (!Object.is(actual, expected)) {
    return;
  }
  const msgSuffix = msg ? `: ${msg}` : ".";
  throw new AssertionError(`Expected "actual" to not be strictly equal to: ${format(actual)}${msgSuffix}\n`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL2Fzc2VydC9hc3NlcnRfbm90X3N0cmljdF9lcXVhbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbmltcG9ydCB7IEFzc2VydGlvbkVycm9yIH0gZnJvbSBcIi4vYXNzZXJ0aW9uX2Vycm9yLnRzXCI7XG5pbXBvcnQgeyBmb3JtYXQgfSBmcm9tIFwiLi9fZm9ybWF0LnRzXCI7XG5cbi8qKlxuICogTWFrZSBhbiBhc3NlcnRpb24gdGhhdCBgYWN0dWFsYCBhbmQgYGV4cGVjdGVkYCBhcmUgbm90IHN0cmljdGx5IGVxdWFsLlxuICogSWYgdGhlIHZhbHVlcyBhcmUgc3RyaWN0bHkgZXF1YWwgdGhlbiB0aHJvdy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGFzc2VydE5vdFN0cmljdEVxdWFscyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2Fzc2VydC9hc3NlcnRfbm90X3N0cmljdF9lcXVhbHMudHNcIjtcbiAqXG4gKiBhc3NlcnROb3RTdHJpY3RFcXVhbHMoMSwgMSk7IC8vIERvZXNuJ3QgdGhyb3dcbiAqIGFzc2VydE5vdFN0cmljdEVxdWFscygxLCAyKTsgLy8gVGhyb3dzXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE5vdFN0cmljdEVxdWFsczxUPihcbiAgYWN0dWFsOiBULFxuICBleHBlY3RlZDogVCxcbiAgbXNnPzogc3RyaW5nLFxuKSB7XG4gIGlmICghT2JqZWN0LmlzKGFjdHVhbCwgZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgbXNnU3VmZml4ID0gbXNnID8gYDogJHttc2d9YCA6IFwiLlwiO1xuICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IoXG4gICAgYEV4cGVjdGVkIFwiYWN0dWFsXCIgdG8gbm90IGJlIHN0cmljdGx5IGVxdWFsIHRvOiAke1xuICAgICAgZm9ybWF0KGFjdHVhbClcbiAgICB9JHttc2dTdWZmaXh9XFxuYCxcbiAgKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsU0FBUyxjQUFjLFFBQVEsdUJBQXVCO0FBQ3RELFNBQVMsTUFBTSxRQUFRLGVBQWU7QUFFdEM7Ozs7Ozs7Ozs7O0NBV0MsR0FDRCxPQUFPLFNBQVMsc0JBQ2QsTUFBUyxFQUNULFFBQVcsRUFDWCxHQUFZO0VBRVosSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsV0FBVztJQUNoQztFQUNGO0VBRUEsTUFBTSxZQUFZLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxHQUFHO0VBQ3JDLE1BQU0sSUFBSSxlQUNSLENBQUMsK0NBQStDLEVBQzlDLE9BQU8sVUFDTixVQUFVLEVBQUUsQ0FBQztBQUVwQiJ9
// denoCacheMetadata=2874705067618514453,18334643343018203773