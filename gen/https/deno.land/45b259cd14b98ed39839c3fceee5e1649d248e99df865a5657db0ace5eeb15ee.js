// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { format } from "./format.ts";
/**
 * Formats the comparator into a string
 * @example >=0.0.0
 * @param comparator
 * @returns A string representation of the comparator
 */ export function comparatorFormat(comparator) {
  const { semver, operator } = comparator;
  return `${operator}${format(semver ?? comparator)}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL3NlbXZlci9fY29tcGFyYXRvcl9mb3JtYXQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbmltcG9ydCB0eXBlIHsgQ29tcGFyYXRvciB9IGZyb20gXCIuL3R5cGVzLnRzXCI7XG5pbXBvcnQgeyBmb3JtYXQgfSBmcm9tIFwiLi9mb3JtYXQudHNcIjtcblxuLyoqXG4gKiBGb3JtYXRzIHRoZSBjb21wYXJhdG9yIGludG8gYSBzdHJpbmdcbiAqIEBleGFtcGxlID49MC4wLjBcbiAqIEBwYXJhbSBjb21wYXJhdG9yXG4gKiBAcmV0dXJucyBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29tcGFyYXRvclxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcGFyYXRvckZvcm1hdChjb21wYXJhdG9yOiBDb21wYXJhdG9yKTogc3RyaW5nIHtcbiAgY29uc3QgeyBzZW12ZXIsIG9wZXJhdG9yIH0gPSBjb21wYXJhdG9yO1xuICByZXR1cm4gYCR7b3BlcmF0b3J9JHtmb3JtYXQoc2VtdmVyID8/IGNvbXBhcmF0b3IpfWA7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFLFNBQVMsTUFBTSxRQUFRLGNBQWM7QUFFckM7Ozs7O0NBS0MsR0FDRCxPQUFPLFNBQVMsaUJBQWlCLFVBQXNCO0VBQ3JELE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUc7RUFDN0IsT0FBTyxHQUFHLFdBQVcsT0FBTyxVQUFVLGFBQWE7QUFDckQifQ==
// denoCacheMetadata=7575366121159959599,330566492840442979