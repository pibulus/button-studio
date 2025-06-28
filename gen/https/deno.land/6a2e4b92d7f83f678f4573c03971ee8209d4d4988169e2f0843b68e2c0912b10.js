// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/**
 * Stringify an object into a valid `.env` file format.
 *
 * @example
 * ```ts
 * import { stringify } from "https://deno.land/std@$STD_VERSION/dotenv/stringify.ts";
 *
 * const object = { GREETING: "hello world" };
 * const string = stringify(object); // GREETING='hello world'
 * ```
 *
 * @param object object to be stringified
 * @returns string of object
 */ export function stringify(object) {
  const lines = [];
  for (const [key, value] of Object.entries(object)){
    let quote;
    let escapedValue = value ?? "";
    if (key.startsWith("#")) {
      console.warn(`key starts with a '#' indicates a comment and is ignored: '${key}'`);
      continue;
    } else if (escapedValue.includes("\n")) {
      // escape inner new lines
      escapedValue = escapedValue.replaceAll("\n", "\\n");
      quote = `"`;
    } else if (escapedValue.match(/\W/)) {
      quote = "'";
    }
    if (quote) {
      // escape inner quotes
      escapedValue = escapedValue.replaceAll(quote, `\\${quote}`);
      escapedValue = `${quote}${escapedValue}${quote}`;
    }
    const line = `${key}=${escapedValue}`;
    lines.push(line);
  }
  return lines.join("\n");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL2RvdGVudi9zdHJpbmdpZnkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuLyoqXG4gKiBTdHJpbmdpZnkgYW4gb2JqZWN0IGludG8gYSB2YWxpZCBgLmVudmAgZmlsZSBmb3JtYXQuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBzdHJpbmdpZnkgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9kb3RlbnYvc3RyaW5naWZ5LnRzXCI7XG4gKlxuICogY29uc3Qgb2JqZWN0ID0geyBHUkVFVElORzogXCJoZWxsbyB3b3JsZFwiIH07XG4gKiBjb25zdCBzdHJpbmcgPSBzdHJpbmdpZnkob2JqZWN0KTsgLy8gR1JFRVRJTkc9J2hlbGxvIHdvcmxkJ1xuICogYGBgXG4gKlxuICogQHBhcmFtIG9iamVjdCBvYmplY3QgdG8gYmUgc3RyaW5naWZpZWRcbiAqIEByZXR1cm5zIHN0cmluZyBvZiBvYmplY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ2lmeShvYmplY3Q6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBzdHJpbmcge1xuICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXTtcbiAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMob2JqZWN0KSkge1xuICAgIGxldCBxdW90ZTtcblxuICAgIGxldCBlc2NhcGVkVmFsdWUgPSB2YWx1ZSA/PyBcIlwiO1xuICAgIGlmIChrZXkuc3RhcnRzV2l0aChcIiNcIikpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgYGtleSBzdGFydHMgd2l0aCBhICcjJyBpbmRpY2F0ZXMgYSBjb21tZW50IGFuZCBpcyBpZ25vcmVkOiAnJHtrZXl9J2AsXG4gICAgICApO1xuICAgICAgY29udGludWU7XG4gICAgfSBlbHNlIGlmIChlc2NhcGVkVmFsdWUuaW5jbHVkZXMoXCJcXG5cIikpIHtcbiAgICAgIC8vIGVzY2FwZSBpbm5lciBuZXcgbGluZXNcbiAgICAgIGVzY2FwZWRWYWx1ZSA9IGVzY2FwZWRWYWx1ZS5yZXBsYWNlQWxsKFwiXFxuXCIsIFwiXFxcXG5cIik7XG4gICAgICBxdW90ZSA9IGBcImA7XG4gICAgfSBlbHNlIGlmIChlc2NhcGVkVmFsdWUubWF0Y2goL1xcVy8pKSB7XG4gICAgICBxdW90ZSA9IFwiJ1wiO1xuICAgIH1cblxuICAgIGlmIChxdW90ZSkge1xuICAgICAgLy8gZXNjYXBlIGlubmVyIHF1b3Rlc1xuICAgICAgZXNjYXBlZFZhbHVlID0gZXNjYXBlZFZhbHVlLnJlcGxhY2VBbGwocXVvdGUsIGBcXFxcJHtxdW90ZX1gKTtcbiAgICAgIGVzY2FwZWRWYWx1ZSA9IGAke3F1b3RlfSR7ZXNjYXBlZFZhbHVlfSR7cXVvdGV9YDtcbiAgICB9XG4gICAgY29uc3QgbGluZSA9IGAke2tleX09JHtlc2NhcGVkVmFsdWV9YDtcbiAgICBsaW5lcy5wdXNoKGxpbmUpO1xuICB9XG4gIHJldHVybiBsaW5lcy5qb2luKFwiXFxuXCIpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUUxRTs7Ozs7Ozs7Ozs7OztDQWFDLEdBQ0QsT0FBTyxTQUFTLFVBQVUsTUFBOEI7RUFDdEQsTUFBTSxRQUFrQixFQUFFO0VBQzFCLEtBQUssTUFBTSxDQUFDLEtBQUssTUFBTSxJQUFJLE9BQU8sT0FBTyxDQUFDLFFBQVM7SUFDakQsSUFBSTtJQUVKLElBQUksZUFBZSxTQUFTO0lBQzVCLElBQUksSUFBSSxVQUFVLENBQUMsTUFBTTtNQUN2QixRQUFRLElBQUksQ0FDVixDQUFDLDJEQUEyRCxFQUFFLElBQUksQ0FBQyxDQUFDO01BRXRFO0lBQ0YsT0FBTyxJQUFJLGFBQWEsUUFBUSxDQUFDLE9BQU87TUFDdEMseUJBQXlCO01BQ3pCLGVBQWUsYUFBYSxVQUFVLENBQUMsTUFBTTtNQUM3QyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ2IsT0FBTyxJQUFJLGFBQWEsS0FBSyxDQUFDLE9BQU87TUFDbkMsUUFBUTtJQUNWO0lBRUEsSUFBSSxPQUFPO01BQ1Qsc0JBQXNCO01BQ3RCLGVBQWUsYUFBYSxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxPQUFPO01BQzFELGVBQWUsR0FBRyxRQUFRLGVBQWUsT0FBTztJQUNsRDtJQUNBLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxFQUFFLGNBQWM7SUFDckMsTUFBTSxJQUFJLENBQUM7RUFDYjtFQUNBLE9BQU8sTUFBTSxJQUFJLENBQUM7QUFDcEIifQ==
// denoCacheMetadata=3895759310311092337,13212235282370891187