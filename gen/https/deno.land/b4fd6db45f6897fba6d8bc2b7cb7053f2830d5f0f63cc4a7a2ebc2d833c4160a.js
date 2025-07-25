// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { loadSync } from "./mod.ts";
if (!(Deno.readTextFileSync instanceof Function)) {
  // Avoid errors that occur in deno deploy: https://github.com/denoland/deno_std/issues/1957
  console.warn(`Deno.readTextFileSync is not a function: No .env data was read.`);
} else {
  loadSync({
    export: true
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL2RvdGVudi9sb2FkLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB7IGxvYWRTeW5jIH0gZnJvbSBcIi4vbW9kLnRzXCI7XG5cbmlmICghKERlbm8ucmVhZFRleHRGaWxlU3luYyBpbnN0YW5jZW9mIEZ1bmN0aW9uKSkge1xuICAvLyBBdm9pZCBlcnJvcnMgdGhhdCBvY2N1ciBpbiBkZW5vIGRlcGxveTogaHR0cHM6Ly9naXRodWIuY29tL2Rlbm9sYW5kL2Rlbm9fc3RkL2lzc3Vlcy8xOTU3XG4gIGNvbnNvbGUud2FybihcbiAgICBgRGVuby5yZWFkVGV4dEZpbGVTeW5jIGlzIG5vdCBhIGZ1bmN0aW9uOiBObyAuZW52IGRhdGEgd2FzIHJlYWQuYCxcbiAgKTtcbn0gZWxzZSB7XG4gIGxvYWRTeW5jKHsgZXhwb3J0OiB0cnVlIH0pO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUUxRSxTQUFTLFFBQVEsUUFBUSxXQUFXO0FBRXBDLElBQUksQ0FBQyxDQUFDLEtBQUssZ0JBQWdCLFlBQVksUUFBUSxHQUFHO0VBQ2hELDJGQUEyRjtFQUMzRixRQUFRLElBQUksQ0FDVixDQUFDLCtEQUErRCxDQUFDO0FBRXJFLE9BQU87RUFDTCxTQUFTO0lBQUUsUUFBUTtFQUFLO0FBQzFCIn0=
// denoCacheMetadata=11837186409161845548,18264187694843443719