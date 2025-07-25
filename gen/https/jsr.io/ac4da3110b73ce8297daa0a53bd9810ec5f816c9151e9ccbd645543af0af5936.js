// Copyright 2018-2025 the Deno authors. MIT license.
export function detach(buffer, maxSize) {
  const originalSize = buffer.length;
  if (buffer.byteOffset) {
    const b = new Uint8Array(buffer.buffer);
    b.set(buffer);
    buffer = b.subarray(0, originalSize);
  }
  // deno-lint-ignore no-explicit-any
  buffer = new Uint8Array(buffer.buffer.transfer(maxSize));
  buffer.set(buffer.subarray(0, originalSize), maxSize - originalSize);
  return [
    buffer,
    maxSize - originalSize
  ];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvZW5jb2RpbmcvMS4wLjEwL19jb21tb25fZGV0YWNoLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjUgdGhlIERlbm8gYXV0aG9ycy4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB0eXBlIHsgVWludDhBcnJheV8gfSBmcm9tIFwiLi9fdHlwZXMudHNcIjtcbmV4cG9ydCB0eXBlIHsgVWludDhBcnJheV8gfTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRldGFjaChcbiAgYnVmZmVyOiBVaW50OEFycmF5XyxcbiAgbWF4U2l6ZTogbnVtYmVyLFxuKTogW1VpbnQ4QXJyYXlfLCBudW1iZXJdIHtcbiAgY29uc3Qgb3JpZ2luYWxTaXplID0gYnVmZmVyLmxlbmd0aDtcbiAgaWYgKGJ1ZmZlci5ieXRlT2Zmc2V0KSB7XG4gICAgY29uc3QgYiA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlci5idWZmZXIpO1xuICAgIGIuc2V0KGJ1ZmZlcik7XG4gICAgYnVmZmVyID0gYi5zdWJhcnJheSgwLCBvcmlnaW5hbFNpemUpO1xuICB9XG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KChidWZmZXIuYnVmZmVyIGFzIGFueSkudHJhbnNmZXIobWF4U2l6ZSkpO1xuICBidWZmZXIuc2V0KGJ1ZmZlci5zdWJhcnJheSgwLCBvcmlnaW5hbFNpemUpLCBtYXhTaXplIC0gb3JpZ2luYWxTaXplKTtcbiAgcmV0dXJuIFtidWZmZXIsIG1heFNpemUgLSBvcmlnaW5hbFNpemVdO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHFEQUFxRDtBQUtyRCxPQUFPLFNBQVMsT0FDZCxNQUFtQixFQUNuQixPQUFlO0VBRWYsTUFBTSxlQUFlLE9BQU8sTUFBTTtFQUNsQyxJQUFJLE9BQU8sVUFBVSxFQUFFO0lBQ3JCLE1BQU0sSUFBSSxJQUFJLFdBQVcsT0FBTyxNQUFNO0lBQ3RDLEVBQUUsR0FBRyxDQUFDO0lBQ04sU0FBUyxFQUFFLFFBQVEsQ0FBQyxHQUFHO0VBQ3pCO0VBQ0EsbUNBQW1DO0VBQ25DLFNBQVMsSUFBSSxXQUFXLEFBQUMsT0FBTyxNQUFNLENBQVMsUUFBUSxDQUFDO0VBQ3hELE9BQU8sR0FBRyxDQUFDLE9BQU8sUUFBUSxDQUFDLEdBQUcsZUFBZSxVQUFVO0VBQ3ZELE9BQU87SUFBQztJQUFRLFVBQVU7R0FBYTtBQUN6QyJ9
// denoCacheMetadata=12364166779411009045,3341206698908279584