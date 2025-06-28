// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
const RE_KeyValue = /^\s*(?:export\s+)?(?<key>[a-zA-Z_]+[a-zA-Z0-9_]*?)\s*=[\ \t]*('\n?(?<notInterpolated>(.|\n)*?)\n?'|"\n?(?<interpolated>(.|\n)*?)\n?"|(?<unquoted>[^\n#]*)) *#*.*$/gm;
const RE_ExpandValue = /(\${(?<inBrackets>.+?)(\:-(?<inBracketsDefault>.+))?}|(?<!\\)\$(?<notInBrackets>\w+)(\:-(?<notInBracketsDefault>.+))?)/g;
function expandCharacters(str) {
  const charactersMap = {
    "\\n": "\n",
    "\\r": "\r",
    "\\t": "\t"
  };
  return str.replace(/\\([nrt])/g, ($1)=>charactersMap[$1] || "");
}
function expand(str, variablesMap) {
  if (RE_ExpandValue.test(str)) {
    return expand(str.replace(RE_ExpandValue, function(...params) {
      const { inBrackets, inBracketsDefault, notInBrackets, notInBracketsDefault } = params[params.length - 1];
      const expandValue = inBrackets || notInBrackets;
      const defaultValue = inBracketsDefault || notInBracketsDefault;
      let value = variablesMap[expandValue];
      if (value === undefined) {
        value = Deno.env.get(expandValue);
      }
      return value === undefined ? expand(defaultValue, variablesMap) : value;
    }), variablesMap);
  } else {
    return str;
  }
}
/**
 * Parse `.env` file output in an object.
 *
 * @example
 * ```ts
 * import { parse } from "https://deno.land/std@$STD_VERSION/dotenv/parse.ts";
 *
 * const env = parse("GREETING=hello world");
 * env.GREETING; // "hello world"
 * ```
 */ export function parse(rawDotenv) {
  const env = {};
  let match;
  const keysForExpandCheck = [];
  while((match = RE_KeyValue.exec(rawDotenv)) !== null){
    const { key, interpolated, notInterpolated, unquoted } = match?.groups;
    if (unquoted) {
      keysForExpandCheck.push(key);
    }
    env[key] = typeof notInterpolated === "string" ? notInterpolated : typeof interpolated === "string" ? expandCharacters(interpolated) : unquoted.trim();
  }
  //https://github.com/motdotla/dotenv-expand/blob/ed5fea5bf517a09fd743ce2c63150e88c8a5f6d1/lib/main.js#L23
  const variablesMap = {
    ...env
  };
  keysForExpandCheck.forEach((key)=>{
    env[key] = expand(env[key], variablesMap);
  });
  return env;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL2RvdGVudi9wYXJzZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG50eXBlIExpbmVQYXJzZVJlc3VsdCA9IHtcbiAga2V5OiBzdHJpbmc7XG4gIHVucXVvdGVkOiBzdHJpbmc7XG4gIGludGVycG9sYXRlZDogc3RyaW5nO1xuICBub3RJbnRlcnBvbGF0ZWQ6IHN0cmluZztcbn07XG5cbnR5cGUgQ2hhcmFjdGVyc01hcCA9IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG5cbmNvbnN0IFJFX0tleVZhbHVlID1cbiAgL15cXHMqKD86ZXhwb3J0XFxzKyk/KD88a2V5PlthLXpBLVpfXStbYS16QS1aMC05X10qPylcXHMqPVtcXCBcXHRdKignXFxuPyg/PG5vdEludGVycG9sYXRlZD4oLnxcXG4pKj8pXFxuPyd8XCJcXG4/KD88aW50ZXJwb2xhdGVkPigufFxcbikqPylcXG4/XCJ8KD88dW5xdW90ZWQ+W15cXG4jXSopKSAqIyouKiQvZ207XG5cbmNvbnN0IFJFX0V4cGFuZFZhbHVlID1cbiAgLyhcXCR7KD88aW5CcmFja2V0cz4uKz8pKFxcOi0oPzxpbkJyYWNrZXRzRGVmYXVsdD4uKykpP318KD88IVxcXFwpXFwkKD88bm90SW5CcmFja2V0cz5cXHcrKShcXDotKD88bm90SW5CcmFja2V0c0RlZmF1bHQ+LispKT8pL2c7XG5cbmZ1bmN0aW9uIGV4cGFuZENoYXJhY3RlcnMoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBjaGFyYWN0ZXJzTWFwOiBDaGFyYWN0ZXJzTWFwID0ge1xuICAgIFwiXFxcXG5cIjogXCJcXG5cIixcbiAgICBcIlxcXFxyXCI6IFwiXFxyXCIsXG4gICAgXCJcXFxcdFwiOiBcIlxcdFwiLFxuICB9O1xuXG4gIHJldHVybiBzdHIucmVwbGFjZShcbiAgICAvXFxcXChbbnJ0XSkvZyxcbiAgICAoJDE6IGtleW9mIENoYXJhY3RlcnNNYXApOiBzdHJpbmcgPT4gY2hhcmFjdGVyc01hcFskMV0gfHwgXCJcIixcbiAgKTtcbn1cblxuZnVuY3Rpb24gZXhwYW5kKHN0cjogc3RyaW5nLCB2YXJpYWJsZXNNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0pOiBzdHJpbmcge1xuICBpZiAoUkVfRXhwYW5kVmFsdWUudGVzdChzdHIpKSB7XG4gICAgcmV0dXJuIGV4cGFuZChcbiAgICAgIHN0ci5yZXBsYWNlKFJFX0V4cGFuZFZhbHVlLCBmdW5jdGlvbiAoLi4ucGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBpbkJyYWNrZXRzLFxuICAgICAgICAgIGluQnJhY2tldHNEZWZhdWx0LFxuICAgICAgICAgIG5vdEluQnJhY2tldHMsXG4gICAgICAgICAgbm90SW5CcmFja2V0c0RlZmF1bHQsXG4gICAgICAgIH0gPSBwYXJhbXNbcGFyYW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICBjb25zdCBleHBhbmRWYWx1ZSA9IGluQnJhY2tldHMgfHwgbm90SW5CcmFja2V0cztcbiAgICAgICAgY29uc3QgZGVmYXVsdFZhbHVlID0gaW5CcmFja2V0c0RlZmF1bHQgfHwgbm90SW5CcmFja2V0c0RlZmF1bHQ7XG5cbiAgICAgICAgbGV0IHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB2YXJpYWJsZXNNYXBbZXhwYW5kVmFsdWVdO1xuICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHZhbHVlID0gRGVuby5lbnYuZ2V0KGV4cGFuZFZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCA/IGV4cGFuZChkZWZhdWx0VmFsdWUsIHZhcmlhYmxlc01hcCkgOiB2YWx1ZTtcbiAgICAgIH0pLFxuICAgICAgdmFyaWFibGVzTWFwLFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG4vKipcbiAqIFBhcnNlIGAuZW52YCBmaWxlIG91dHB1dCBpbiBhbiBvYmplY3QuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwYXJzZSB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2RvdGVudi9wYXJzZS50c1wiO1xuICpcbiAqIGNvbnN0IGVudiA9IHBhcnNlKFwiR1JFRVRJTkc9aGVsbG8gd29ybGRcIik7XG4gKiBlbnYuR1JFRVRJTkc7IC8vIFwiaGVsbG8gd29ybGRcIlxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShyYXdEb3RlbnY6IHN0cmluZyk6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xuICBjb25zdCBlbnY6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcblxuICBsZXQgbWF0Y2g7XG4gIGNvbnN0IGtleXNGb3JFeHBhbmRDaGVjayA9IFtdO1xuXG4gIHdoaWxlICgobWF0Y2ggPSBSRV9LZXlWYWx1ZS5leGVjKHJhd0RvdGVudikpICE9PSBudWxsKSB7XG4gICAgY29uc3QgeyBrZXksIGludGVycG9sYXRlZCwgbm90SW50ZXJwb2xhdGVkLCB1bnF1b3RlZCB9ID0gbWF0Y2hcbiAgICAgID8uZ3JvdXBzIGFzIExpbmVQYXJzZVJlc3VsdDtcblxuICAgIGlmICh1bnF1b3RlZCkge1xuICAgICAga2V5c0ZvckV4cGFuZENoZWNrLnB1c2goa2V5KTtcbiAgICB9XG5cbiAgICBlbnZba2V5XSA9IHR5cGVvZiBub3RJbnRlcnBvbGF0ZWQgPT09IFwic3RyaW5nXCJcbiAgICAgID8gbm90SW50ZXJwb2xhdGVkXG4gICAgICA6IHR5cGVvZiBpbnRlcnBvbGF0ZWQgPT09IFwic3RyaW5nXCJcbiAgICAgID8gZXhwYW5kQ2hhcmFjdGVycyhpbnRlcnBvbGF0ZWQpXG4gICAgICA6IHVucXVvdGVkLnRyaW0oKTtcbiAgfVxuXG4gIC8vaHR0cHM6Ly9naXRodWIuY29tL21vdGRvdGxhL2RvdGVudi1leHBhbmQvYmxvYi9lZDVmZWE1YmY1MTdhMDlmZDc0M2NlMmM2MzE1MGU4OGM4YTVmNmQxL2xpYi9tYWluLmpzI0wyM1xuICBjb25zdCB2YXJpYWJsZXNNYXAgPSB7IC4uLmVudiB9O1xuICBrZXlzRm9yRXhwYW5kQ2hlY2suZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgZW52W2tleV0gPSBleHBhbmQoZW52W2tleV0hLCB2YXJpYWJsZXNNYXApO1xuICB9KTtcblxuICByZXR1cm4gZW52O1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQVcxRSxNQUFNLGNBQ0o7QUFFRixNQUFNLGlCQUNKO0FBRUYsU0FBUyxpQkFBaUIsR0FBVztFQUNuQyxNQUFNLGdCQUErQjtJQUNuQyxPQUFPO0lBQ1AsT0FBTztJQUNQLE9BQU87RUFDVDtFQUVBLE9BQU8sSUFBSSxPQUFPLENBQ2hCLGNBQ0EsQ0FBQyxLQUFvQyxhQUFhLENBQUMsR0FBRyxJQUFJO0FBRTlEO0FBRUEsU0FBUyxPQUFPLEdBQVcsRUFBRSxZQUF1QztFQUNsRSxJQUFJLGVBQWUsSUFBSSxDQUFDLE1BQU07SUFDNUIsT0FBTyxPQUNMLElBQUksT0FBTyxDQUFDLGdCQUFnQixTQUFVLEdBQUcsTUFBTTtNQUM3QyxNQUFNLEVBQ0osVUFBVSxFQUNWLGlCQUFpQixFQUNqQixhQUFhLEVBQ2Isb0JBQW9CLEVBQ3JCLEdBQUcsTUFBTSxDQUFDLE9BQU8sTUFBTSxHQUFHLEVBQUU7TUFDN0IsTUFBTSxjQUFjLGNBQWM7TUFDbEMsTUFBTSxlQUFlLHFCQUFxQjtNQUUxQyxJQUFJLFFBQTRCLFlBQVksQ0FBQyxZQUFZO01BQ3pELElBQUksVUFBVSxXQUFXO1FBQ3ZCLFFBQVEsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDO01BQ3ZCO01BQ0EsT0FBTyxVQUFVLFlBQVksT0FBTyxjQUFjLGdCQUFnQjtJQUNwRSxJQUNBO0VBRUosT0FBTztJQUNMLE9BQU87RUFDVDtBQUNGO0FBRUE7Ozs7Ozs7Ozs7Q0FVQyxHQUNELE9BQU8sU0FBUyxNQUFNLFNBQWlCO0VBQ3JDLE1BQU0sTUFBOEIsQ0FBQztFQUVyQyxJQUFJO0VBQ0osTUFBTSxxQkFBcUIsRUFBRTtFQUU3QixNQUFPLENBQUMsUUFBUSxZQUFZLElBQUksQ0FBQyxVQUFVLE1BQU0sS0FBTTtJQUNyRCxNQUFNLEVBQUUsR0FBRyxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLEdBQUcsT0FDckQ7SUFFSixJQUFJLFVBQVU7TUFDWixtQkFBbUIsSUFBSSxDQUFDO0lBQzFCO0lBRUEsR0FBRyxDQUFDLElBQUksR0FBRyxPQUFPLG9CQUFvQixXQUNsQyxrQkFDQSxPQUFPLGlCQUFpQixXQUN4QixpQkFBaUIsZ0JBQ2pCLFNBQVMsSUFBSTtFQUNuQjtFQUVBLHlHQUF5RztFQUN6RyxNQUFNLGVBQWU7SUFBRSxHQUFHLEdBQUc7RUFBQztFQUM5QixtQkFBbUIsT0FBTyxDQUFDLENBQUM7SUFDMUIsR0FBRyxDQUFDLElBQUksR0FBRyxPQUFPLEdBQUcsQ0FBQyxJQUFJLEVBQUc7RUFDL0I7RUFFQSxPQUFPO0FBQ1QifQ==
// denoCacheMetadata=16619570122291672032,5757626106976047685