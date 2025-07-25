// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
// Keep this up-to-date with Deno.build.os
export const osType = (()=>{
  // deno-lint-ignore no-explicit-any
  const { Deno } = globalThis;
  if (typeof Deno?.build?.os === "string") {
    return Deno.build.os;
  }
  // deno-lint-ignore no-explicit-any
  const { navigator } = globalThis;
  if (navigator?.appVersion?.includes?.("Win")) {
    return "windows";
  }
  return "linux";
})();
export const isWindows = osType === "windows";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwOC4wL3BhdGgvX29zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8vIEtlZXAgdGhpcyB1cC10by1kYXRlIHdpdGggRGVuby5idWlsZC5vc1xuZXhwb3J0IHR5cGUgT1NUeXBlID1cbiAgfCBcImRhcndpblwiXG4gIHwgXCJsaW51eFwiXG4gIHwgXCJ3aW5kb3dzXCJcbiAgfCBcImZyZWVic2RcIlxuICB8IFwibmV0YnNkXCJcbiAgfCBcImFpeFwiXG4gIHwgXCJzb2xhcmlzXCJcbiAgfCBcImlsbHVtb3NcIjtcblxuZXhwb3J0IGNvbnN0IG9zVHlwZTogT1NUeXBlID0gKCgpID0+IHtcbiAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgY29uc3QgeyBEZW5vIH0gPSBnbG9iYWxUaGlzIGFzIGFueTtcbiAgaWYgKHR5cGVvZiBEZW5vPy5idWlsZD8ub3MgPT09IFwic3RyaW5nXCIpIHtcbiAgICByZXR1cm4gRGVuby5idWlsZC5vcztcbiAgfVxuXG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIGNvbnN0IHsgbmF2aWdhdG9yIH0gPSBnbG9iYWxUaGlzIGFzIGFueTtcbiAgaWYgKG5hdmlnYXRvcj8uYXBwVmVyc2lvbj8uaW5jbHVkZXM/LihcIldpblwiKSkge1xuICAgIHJldHVybiBcIndpbmRvd3NcIjtcbiAgfVxuXG4gIHJldHVybiBcImxpbnV4XCI7XG59KSgpO1xuXG5leHBvcnQgY29uc3QgaXNXaW5kb3dzID0gb3NUeXBlID09PSBcIndpbmRvd3NcIjtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLDBDQUEwQztBQVcxQyxPQUFPLE1BQU0sU0FBaUIsQ0FBQztFQUM3QixtQ0FBbUM7RUFDbkMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHO0VBQ2pCLElBQUksT0FBTyxNQUFNLE9BQU8sT0FBTyxVQUFVO0lBQ3ZDLE9BQU8sS0FBSyxLQUFLLENBQUMsRUFBRTtFQUN0QjtFQUVBLG1DQUFtQztFQUNuQyxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUc7RUFDdEIsSUFBSSxXQUFXLFlBQVksV0FBVyxRQUFRO0lBQzVDLE9BQU87RUFDVDtFQUVBLE9BQU87QUFDVCxDQUFDLElBQUk7QUFFTCxPQUFPLE1BQU0sWUFBWSxXQUFXLFVBQVUifQ==
// denoCacheMetadata=15218259882639329815,9364895823210977635