// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/**
 * Parses and loads environment variables from a `.env` file into the current
 * process, or stringify data into a `.env` file format.
 *
 * @module
 */ import { parse } from "./parse.ts";
export * from "./stringify.ts";
export * from "./parse.ts";
/** Works identically to {@linkcode load}, but synchronously. */ export function loadSync({ envPath = ".env", examplePath = ".env.example", defaultsPath = ".env.defaults", export: _export = false, allowEmptyValues = false } = {}) {
  const conf = envPath ? parseFileSync(envPath) : {};
  if (defaultsPath) {
    const confDefaults = parseFileSync(defaultsPath);
    for (const [key, value] of Object.entries(confDefaults)){
      if (!(key in conf)) {
        conf[key] = value;
      }
    }
  }
  if (examplePath) {
    const confExample = parseFileSync(examplePath);
    assertSafe(conf, confExample, allowEmptyValues);
  }
  if (_export) {
    for (const [key, value] of Object.entries(conf)){
      if (Deno.env.get(key) !== undefined) continue;
      Deno.env.set(key, value);
    }
  }
  return conf;
}
/**
 * Load environment variables from a `.env` file.  Loaded variables are accessible
 * in a configuration object returned by the `load()` function, as well as optionally
 * exporting them to the process environment using the `export` option.
 *
 * Inspired by the node modules {@linkcode https://github.com/motdotla/dotenv | dotenv}
 * and {@linkcode https://github.com/motdotla/dotenv-expand | dotenv-expand}.
 *
 * ## Basic usage
 * ```sh
 * # .env
 * GREETING=hello world
 * ```
 *
 * Then import the environment variables using the `load` function.
 *
 * ```ts
 * // app.ts
 * import { load } from "https://deno.land/std@$STD_VERSION/dotenv/mod.ts";
 *
 * console.log(await load({export: true})); // { GREETING: "hello world" }
 * console.log(Deno.env.get("GREETING")); // hello world
 * ```
 *
 * Run this with `deno run --allow-read --allow-env app.ts`.
 *
 * .env files support blank lines, comments, multi-line values and more.
 * See Parsing Rules below for more detail.
 *
 * ## Auto loading
 * Import the `load.ts` module to auto-import from the `.env` file and into
 * the process environment.
 *
 * ```ts
 * // app.ts
 * import "https://deno.land/std@$STD_VERSION/dotenv/load.ts";
 *
 * console.log(Deno.env.get("GREETING")); // hello world
 * ```
 *
 * Run this with `deno run --allow-read --allow-env app.ts`.
 *
 * ## Files
 * Dotenv supports a number of different files, all of which are optional.
 * File names and paths are configurable.
 *
 * |File|Purpose|
 * |----|-------|
 * |.env|primary file for storing key-value environment entries
 * |.env.example|this file does not set any values, but specifies env variables which must be present in the configuration object or process environment after loading dotenv
 * |.env.defaults|specify default values for env variables to be used when there is no entry in the `.env` file
 *
 * ### Example file
 *
 * The purpose of the example file is to provide a list of environment
 * variables which must be set or already present in the process environment
 * or an exception will be thrown.  These
 * variables may be set externally or loaded via the `.env` or
 * `.env.defaults` files.  A description may also be provided to help
 * understand the purpose of the env variable. The values in this file
 * are for documentation only and are not set in the environment. Example:
 *
 * ```sh
 * # .env.example
 *
 * # With optional description (this is not set in the environment)
 * DATA_KEY=API key for the api.data.com service.
 *
 * # Without description
 * DATA_URL=
 * ```
 *
 * When the above file is present, after dotenv is loaded, if either
 * DATA_KEY or DATA_URL is not present in the environment an exception
 * is thrown.
 *
 * ### Defaults
 *
 * This file is used to provide a list of default environment variables
 * which will be used if there is no overriding variable in the `.env`
 * file.
 *
 * ```sh
 * # .env.defaults
 * KEY_1=DEFAULT_VALUE
 * KEY_2=ANOTHER_DEFAULT_VALUE
 * ```
 * ```sh
 * # .env
 * KEY_1=ABCD
 * ```
 * The environment variables set after dotenv loads are:
 * ```sh
 * KEY_1=ABCD
 * KEY_2=ANOTHER_DEFAULT_VALUE
 * ```
 *
 * ## Configuration
 *
 * Loading environment files comes with a number of options passed into
 * the `load()` function, all of which are optional.
 *
 * |Option|Default|Description
 * |------|-------|-----------
 * |envPath|./.env|Path and filename of the `.env` file.  Use null to prevent the .env file from being loaded.
 * |defaultsPath|./.env.defaults|Path and filename of the `.env.defaults` file. Use null to prevent the .env.defaults file from being loaded.
 * |examplePath|./.env.example|Path and filename of the `.env.example` file. Use null to prevent the .env.example file from being loaded.
 * |export|false|When true, this will export all environment variables in the `.env` and `.env.default` files to the process environment (e.g. for use by `Deno.env.get()`) but only if they are not already set.  If a variable is already in the process, the `.env` value is ignored.
 * |allowEmptyValues|false|Allows empty values for specified env variables (throws otherwise)
 *
 * ### Example configuration
 * ```ts
 * import { load } from "https://deno.land/std@$STD_VERSION/dotenv/mod.ts";
 *
 * const conf = await load({
 *     envPath: "./.env_prod",
 *     examplePath: "./.env_required",
 *     export: true,
 *     allowEmptyValues: true,
 *   });
 * ```
 *
 * ## Permissions
 *
 * At a minimum, loading the `.env` related files requires the `--allow-read` permission.  Additionally, if
 * you access the process environment, either through exporting your configuration or expanding variables
 * in your `.env` file, you will need the `--allow-env` permission.  E.g.
 *
 * ```sh
 * deno run --allow-read=.env,.env.defaults,.env.example --allow-env=ENV1,ENV2 app.ts
 * ```
 *
 * ## Parsing Rules
 *
 * The parsing engine currently supports the following rules:
 *
 * - Variables that already exist in the environment are not overridden with
 *   `export: true`
 * - `BASIC=basic` becomes `{ BASIC: "basic" }`
 * - empty lines are skipped
 * - lines beginning with `#` are treated as comments
 * - empty values become empty strings (`EMPTY=` becomes `{ EMPTY: "" }`)
 * - single and double quoted values are escaped (`SINGLE_QUOTE='quoted'` becomes
 *   `{ SINGLE_QUOTE: "quoted" }`)
 * - new lines are expanded in double quoted values (`MULTILINE="new\nline"`
 *   becomes
 *
 * ```
 * { MULTILINE: "new\nline" }
 * ```
 *
 * - inner quotes are maintained (think JSON) (`JSON={"foo": "bar"}` becomes
 *   `{ JSON: "{\"foo\": \"bar\"}" }`)
 * - whitespace is removed from both ends of unquoted values (see more on
 *   {@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim | trim})
 *   (`FOO= some value` becomes `{ FOO: "some value" }`)
 * - whitespace is preserved on both ends of quoted values (`FOO=" some value "`
 *   becomes `{ FOO: " some value " }`)
 * - dollar sign with an environment key in or without curly braces in unquoted
 *   values will expand the environment key (`KEY=$KEY` or `KEY=${KEY}` becomes
 *   `{ KEY: "<KEY_VALUE_FROM_ENV>" }`)
 * - escaped dollar sign with an environment key in unquoted values will escape the
 *   environment key rather than expand (`KEY=\$KEY` becomes `{ KEY: "\\$KEY" }`)
 * - colon and a minus sign with a default value(which can also be another expand
 *   value) in expanding construction in unquoted values will first attempt to
 *   expand the environment key. If it’s not found, then it will return the default
 *   value (`KEY=${KEY:-default}` If KEY exists it becomes
 *   `{ KEY: "<KEY_VALUE_FROM_ENV>" }` If not, then it becomes
 *   `{ KEY: "default" }`. Also there is possible to do this case
 *   `KEY=${NO_SUCH_KEY:-${EXISTING_KEY:-default}}` which becomes
 *   `{ KEY: "<EXISTING_KEY_VALUE_FROM_ENV>" }`)
 */ export async function load({ envPath = ".env", examplePath = ".env.example", defaultsPath = ".env.defaults", export: _export = false, allowEmptyValues = false } = {}) {
  const conf = envPath ? await parseFile(envPath) : {};
  if (defaultsPath) {
    const confDefaults = await parseFile(defaultsPath);
    for (const [key, value] of Object.entries(confDefaults)){
      if (!(key in conf)) {
        conf[key] = value;
      }
    }
  }
  if (examplePath) {
    const confExample = await parseFile(examplePath);
    assertSafe(conf, confExample, allowEmptyValues);
  }
  if (_export) {
    for (const [key, value] of Object.entries(conf)){
      if (Deno.env.get(key) !== undefined) continue;
      Deno.env.set(key, value);
    }
  }
  return conf;
}
function parseFileSync(filepath) {
  try {
    return parse(Deno.readTextFileSync(filepath));
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) return {};
    throw e;
  }
}
async function parseFile(filepath) {
  try {
    return parse(await Deno.readTextFile(filepath));
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) return {};
    throw e;
  }
}
function assertSafe(conf, confExample, allowEmptyValues) {
  const missingEnvVars = [];
  for(const key in confExample){
    if (key in conf) {
      if (!allowEmptyValues && conf[key] === "") {
        missingEnvVars.push(key);
      }
    } else if (Deno.env.get(key) !== undefined) {
      if (!allowEmptyValues && Deno.env.get(key) === "") {
        missingEnvVars.push(key);
      }
    } else {
      missingEnvVars.push(key);
    }
  }
  if (missingEnvVars.length > 0) {
    const errorMessages = [
      `The following variables were defined in the example file but are not present in the environment:\n  ${missingEnvVars.join(", ")}`,
      `Make sure to add them to your env file.`,
      !allowEmptyValues && `If you expect any of these variables to be empty, you can set the allowEmptyValues option to true.`
    ];
    throw new MissingEnvVarsError(errorMessages.filter(Boolean).join("\n\n"), missingEnvVars);
  }
}
/**
 * Error thrown in {@linkcode load} and {@linkcode loadSync} when required
 * environment variables are missing.
 */ export class MissingEnvVarsError extends Error {
  /** The keys of the missing environment variables. */ missing;
  /** Constructs a new instance. */ constructor(message, missing){
    super(message);
    this.name = "MissingEnvVarsError";
    this.missing = missing;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL2RvdGVudi9tb2QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuLyoqXG4gKiBQYXJzZXMgYW5kIGxvYWRzIGVudmlyb25tZW50IHZhcmlhYmxlcyBmcm9tIGEgYC5lbnZgIGZpbGUgaW50byB0aGUgY3VycmVudFxuICogcHJvY2Vzcywgb3Igc3RyaW5naWZ5IGRhdGEgaW50byBhIGAuZW52YCBmaWxlIGZvcm1hdC5cbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuaW1wb3J0IHsgcGFyc2UgfSBmcm9tIFwiLi9wYXJzZS50c1wiO1xuXG5leHBvcnQgKiBmcm9tIFwiLi9zdHJpbmdpZnkudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3BhcnNlLnRzXCI7XG5cbi8qKiBPcHRpb25zIGZvciB7QGxpbmtjb2RlIGxvYWR9IGFuZCB7QGxpbmtjb2RlIGxvYWRTeW5jfS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9hZE9wdGlvbnMge1xuICAvKipcbiAgICogT3B0aW9uYWwgcGF0aCB0byBgLmVudmAgZmlsZS4gVG8gcHJldmVudCB0aGUgZGVmYXVsdCB2YWx1ZSBmcm9tIGJlaW5nXG4gICAqIHVzZWQsIHNldCB0byBgbnVsbGAuXG4gICAqXG4gICAqIEBkZWZhdWx0IHtcIi4vLmVudlwifVxuICAgKi9cbiAgZW52UGF0aD86IHN0cmluZyB8IG51bGw7XG5cbiAgLyoqXG4gICAqIFNldCB0byBgdHJ1ZWAgdG8gZXhwb3J0IGFsbCBgLmVudmAgdmFyaWFibGVzIHRvIHRoZSBjdXJyZW50IHByb2Nlc3Nlc1xuICAgKiBlbnZpcm9ubWVudC4gVmFyaWFibGVzIGFyZSB0aGVuIGFjY2Vzc2libGUgdmlhIGBEZW5vLmVudi5nZXQoPGtleT4pYC5cbiAgICpcbiAgICogQGRlZmF1bHQge2ZhbHNlfVxuICAgKi9cbiAgZXhwb3J0PzogYm9vbGVhbjtcblxuICAvKipcbiAgICogT3B0aW9uYWwgcGF0aCB0byBgLmVudi5leGFtcGxlYCBmaWxlIHdoaWNoIGlzIHVzZWQgZm9yIHZhbGlkYXRpb24uXG4gICAqIFRvIHByZXZlbnQgdGhlIGRlZmF1bHQgdmFsdWUgZnJvbSBiZWluZyB1c2VkLCBzZXQgdG8gYG51bGxgLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7XCIuLy5lbnYuZXhhbXBsZVwifVxuICAgKi9cbiAgZXhhbXBsZVBhdGg/OiBzdHJpbmcgfCBudWxsO1xuXG4gIC8qKlxuICAgKiBTZXQgdG8gYHRydWVgIHRvIGFsbG93IHJlcXVpcmVkIGVudiB2YXJpYWJsZXMgdG8gYmUgZW1wdHkuIE90aGVyd2lzZSwgaXRcbiAgICogd2lsbCB0aHJvdyBhbiBlcnJvciBpZiBhbnkgdmFyaWFibGUgaXMgZW1wdHkuXG4gICAqXG4gICAqIEBkZWZhdWx0IHtmYWxzZX1cbiAgICovXG4gIGFsbG93RW1wdHlWYWx1ZXM/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBPcHRpb25hbCBwYXRoIHRvIGAuZW52LmRlZmF1bHRzYCBmaWxlIHdoaWNoIGlzIHVzZWQgdG8gZGVmaW5lIGRlZmF1bHRcbiAgICogKGZhbGxiYWNrKSB2YWx1ZXMuIFRvIHByZXZlbnQgdGhlIGRlZmF1bHQgdmFsdWUgZnJvbSBiZWluZyB1c2VkLFxuICAgKiBzZXQgdG8gYG51bGxgLlxuICAgKlxuICAgKiBgYGBzaFxuICAgKiAjIC5lbnYuZGVmYXVsdHNcbiAgICogIyBXaWxsIG5vdCBiZSBzZXQgaWYgR1JFRVRJTkcgaXMgc2V0IGluIGJhc2UgLmVudiBmaWxlXG4gICAqIEdSRUVUSU5HPVwiYSBzZWNyZXQgdG8gZXZlcnlib2R5XCJcbiAgICogYGBgXG4gICAqXG4gICAqIEBkZWZhdWx0IHtcIi4vLmVudi5kZWZhdWx0c1wifVxuICAgKi9cbiAgZGVmYXVsdHNQYXRoPzogc3RyaW5nIHwgbnVsbDtcbn1cblxuLyoqIFdvcmtzIGlkZW50aWNhbGx5IHRvIHtAbGlua2NvZGUgbG9hZH0sIGJ1dCBzeW5jaHJvbm91c2x5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRTeW5jKFxuICB7XG4gICAgZW52UGF0aCA9IFwiLmVudlwiLFxuICAgIGV4YW1wbGVQYXRoID0gXCIuZW52LmV4YW1wbGVcIixcbiAgICBkZWZhdWx0c1BhdGggPSBcIi5lbnYuZGVmYXVsdHNcIixcbiAgICBleHBvcnQ6IF9leHBvcnQgPSBmYWxzZSxcbiAgICBhbGxvd0VtcHR5VmFsdWVzID0gZmFsc2UsXG4gIH06IExvYWRPcHRpb25zID0ge30sXG4pOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcbiAgY29uc3QgY29uZiA9IGVudlBhdGggPyBwYXJzZUZpbGVTeW5jKGVudlBhdGgpIDoge307XG5cbiAgaWYgKGRlZmF1bHRzUGF0aCkge1xuICAgIGNvbnN0IGNvbmZEZWZhdWx0cyA9IHBhcnNlRmlsZVN5bmMoZGVmYXVsdHNQYXRoKTtcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhjb25mRGVmYXVsdHMpKSB7XG4gICAgICBpZiAoIShrZXkgaW4gY29uZikpIHtcbiAgICAgICAgY29uZltrZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKGV4YW1wbGVQYXRoKSB7XG4gICAgY29uc3QgY29uZkV4YW1wbGUgPSBwYXJzZUZpbGVTeW5jKGV4YW1wbGVQYXRoKTtcbiAgICBhc3NlcnRTYWZlKGNvbmYsIGNvbmZFeGFtcGxlLCBhbGxvd0VtcHR5VmFsdWVzKTtcbiAgfVxuXG4gIGlmIChfZXhwb3J0KSB7XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoY29uZikpIHtcbiAgICAgIGlmIChEZW5vLmVudi5nZXQoa2V5KSAhPT0gdW5kZWZpbmVkKSBjb250aW51ZTtcbiAgICAgIERlbm8uZW52LnNldChrZXksIHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29uZjtcbn1cblxuLyoqXG4gKiBMb2FkIGVudmlyb25tZW50IHZhcmlhYmxlcyBmcm9tIGEgYC5lbnZgIGZpbGUuICBMb2FkZWQgdmFyaWFibGVzIGFyZSBhY2Nlc3NpYmxlXG4gKiBpbiBhIGNvbmZpZ3VyYXRpb24gb2JqZWN0IHJldHVybmVkIGJ5IHRoZSBgbG9hZCgpYCBmdW5jdGlvbiwgYXMgd2VsbCBhcyBvcHRpb25hbGx5XG4gKiBleHBvcnRpbmcgdGhlbSB0byB0aGUgcHJvY2VzcyBlbnZpcm9ubWVudCB1c2luZyB0aGUgYGV4cG9ydGAgb3B0aW9uLlxuICpcbiAqIEluc3BpcmVkIGJ5IHRoZSBub2RlIG1vZHVsZXMge0BsaW5rY29kZSBodHRwczovL2dpdGh1Yi5jb20vbW90ZG90bGEvZG90ZW52IHwgZG90ZW52fVxuICogYW5kIHtAbGlua2NvZGUgaHR0cHM6Ly9naXRodWIuY29tL21vdGRvdGxhL2RvdGVudi1leHBhbmQgfCBkb3RlbnYtZXhwYW5kfS5cbiAqXG4gKiAjIyBCYXNpYyB1c2FnZVxuICogYGBgc2hcbiAqICMgLmVudlxuICogR1JFRVRJTkc9aGVsbG8gd29ybGRcbiAqIGBgYFxuICpcbiAqIFRoZW4gaW1wb3J0IHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMgdXNpbmcgdGhlIGBsb2FkYCBmdW5jdGlvbi5cbiAqXG4gKiBgYGB0c1xuICogLy8gYXBwLnRzXG4gKiBpbXBvcnQgeyBsb2FkIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZG90ZW52L21vZC50c1wiO1xuICpcbiAqIGNvbnNvbGUubG9nKGF3YWl0IGxvYWQoe2V4cG9ydDogdHJ1ZX0pKTsgLy8geyBHUkVFVElORzogXCJoZWxsbyB3b3JsZFwiIH1cbiAqIGNvbnNvbGUubG9nKERlbm8uZW52LmdldChcIkdSRUVUSU5HXCIpKTsgLy8gaGVsbG8gd29ybGRcbiAqIGBgYFxuICpcbiAqIFJ1biB0aGlzIHdpdGggYGRlbm8gcnVuIC0tYWxsb3ctcmVhZCAtLWFsbG93LWVudiBhcHAudHNgLlxuICpcbiAqIC5lbnYgZmlsZXMgc3VwcG9ydCBibGFuayBsaW5lcywgY29tbWVudHMsIG11bHRpLWxpbmUgdmFsdWVzIGFuZCBtb3JlLlxuICogU2VlIFBhcnNpbmcgUnVsZXMgYmVsb3cgZm9yIG1vcmUgZGV0YWlsLlxuICpcbiAqICMjIEF1dG8gbG9hZGluZ1xuICogSW1wb3J0IHRoZSBgbG9hZC50c2AgbW9kdWxlIHRvIGF1dG8taW1wb3J0IGZyb20gdGhlIGAuZW52YCBmaWxlIGFuZCBpbnRvXG4gKiB0aGUgcHJvY2VzcyBlbnZpcm9ubWVudC5cbiAqXG4gKiBgYGB0c1xuICogLy8gYXBwLnRzXG4gKiBpbXBvcnQgXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2RvdGVudi9sb2FkLnRzXCI7XG4gKlxuICogY29uc29sZS5sb2coRGVuby5lbnYuZ2V0KFwiR1JFRVRJTkdcIikpOyAvLyBoZWxsbyB3b3JsZFxuICogYGBgXG4gKlxuICogUnVuIHRoaXMgd2l0aCBgZGVubyBydW4gLS1hbGxvdy1yZWFkIC0tYWxsb3ctZW52IGFwcC50c2AuXG4gKlxuICogIyMgRmlsZXNcbiAqIERvdGVudiBzdXBwb3J0cyBhIG51bWJlciBvZiBkaWZmZXJlbnQgZmlsZXMsIGFsbCBvZiB3aGljaCBhcmUgb3B0aW9uYWwuXG4gKiBGaWxlIG5hbWVzIGFuZCBwYXRocyBhcmUgY29uZmlndXJhYmxlLlxuICpcbiAqIHxGaWxlfFB1cnBvc2V8XG4gKiB8LS0tLXwtLS0tLS0tfFxuICogfC5lbnZ8cHJpbWFyeSBmaWxlIGZvciBzdG9yaW5nIGtleS12YWx1ZSBlbnZpcm9ubWVudCBlbnRyaWVzXG4gKiB8LmVudi5leGFtcGxlfHRoaXMgZmlsZSBkb2VzIG5vdCBzZXQgYW55IHZhbHVlcywgYnV0IHNwZWNpZmllcyBlbnYgdmFyaWFibGVzIHdoaWNoIG11c3QgYmUgcHJlc2VudCBpbiB0aGUgY29uZmlndXJhdGlvbiBvYmplY3Qgb3IgcHJvY2VzcyBlbnZpcm9ubWVudCBhZnRlciBsb2FkaW5nIGRvdGVudlxuICogfC5lbnYuZGVmYXVsdHN8c3BlY2lmeSBkZWZhdWx0IHZhbHVlcyBmb3IgZW52IHZhcmlhYmxlcyB0byBiZSB1c2VkIHdoZW4gdGhlcmUgaXMgbm8gZW50cnkgaW4gdGhlIGAuZW52YCBmaWxlXG4gKlxuICogIyMjIEV4YW1wbGUgZmlsZVxuICpcbiAqIFRoZSBwdXJwb3NlIG9mIHRoZSBleGFtcGxlIGZpbGUgaXMgdG8gcHJvdmlkZSBhIGxpc3Qgb2YgZW52aXJvbm1lbnRcbiAqIHZhcmlhYmxlcyB3aGljaCBtdXN0IGJlIHNldCBvciBhbHJlYWR5IHByZXNlbnQgaW4gdGhlIHByb2Nlc3MgZW52aXJvbm1lbnRcbiAqIG9yIGFuIGV4Y2VwdGlvbiB3aWxsIGJlIHRocm93bi4gIFRoZXNlXG4gKiB2YXJpYWJsZXMgbWF5IGJlIHNldCBleHRlcm5hbGx5IG9yIGxvYWRlZCB2aWEgdGhlIGAuZW52YCBvclxuICogYC5lbnYuZGVmYXVsdHNgIGZpbGVzLiAgQSBkZXNjcmlwdGlvbiBtYXkgYWxzbyBiZSBwcm92aWRlZCB0byBoZWxwXG4gKiB1bmRlcnN0YW5kIHRoZSBwdXJwb3NlIG9mIHRoZSBlbnYgdmFyaWFibGUuIFRoZSB2YWx1ZXMgaW4gdGhpcyBmaWxlXG4gKiBhcmUgZm9yIGRvY3VtZW50YXRpb24gb25seSBhbmQgYXJlIG5vdCBzZXQgaW4gdGhlIGVudmlyb25tZW50LiBFeGFtcGxlOlxuICpcbiAqIGBgYHNoXG4gKiAjIC5lbnYuZXhhbXBsZVxuICpcbiAqICMgV2l0aCBvcHRpb25hbCBkZXNjcmlwdGlvbiAodGhpcyBpcyBub3Qgc2V0IGluIHRoZSBlbnZpcm9ubWVudClcbiAqIERBVEFfS0VZPUFQSSBrZXkgZm9yIHRoZSBhcGkuZGF0YS5jb20gc2VydmljZS5cbiAqXG4gKiAjIFdpdGhvdXQgZGVzY3JpcHRpb25cbiAqIERBVEFfVVJMPVxuICogYGBgXG4gKlxuICogV2hlbiB0aGUgYWJvdmUgZmlsZSBpcyBwcmVzZW50LCBhZnRlciBkb3RlbnYgaXMgbG9hZGVkLCBpZiBlaXRoZXJcbiAqIERBVEFfS0VZIG9yIERBVEFfVVJMIGlzIG5vdCBwcmVzZW50IGluIHRoZSBlbnZpcm9ubWVudCBhbiBleGNlcHRpb25cbiAqIGlzIHRocm93bi5cbiAqXG4gKiAjIyMgRGVmYXVsdHNcbiAqXG4gKiBUaGlzIGZpbGUgaXMgdXNlZCB0byBwcm92aWRlIGEgbGlzdCBvZiBkZWZhdWx0IGVudmlyb25tZW50IHZhcmlhYmxlc1xuICogd2hpY2ggd2lsbCBiZSB1c2VkIGlmIHRoZXJlIGlzIG5vIG92ZXJyaWRpbmcgdmFyaWFibGUgaW4gdGhlIGAuZW52YFxuICogZmlsZS5cbiAqXG4gKiBgYGBzaFxuICogIyAuZW52LmRlZmF1bHRzXG4gKiBLRVlfMT1ERUZBVUxUX1ZBTFVFXG4gKiBLRVlfMj1BTk9USEVSX0RFRkFVTFRfVkFMVUVcbiAqIGBgYFxuICogYGBgc2hcbiAqICMgLmVudlxuICogS0VZXzE9QUJDRFxuICogYGBgXG4gKiBUaGUgZW52aXJvbm1lbnQgdmFyaWFibGVzIHNldCBhZnRlciBkb3RlbnYgbG9hZHMgYXJlOlxuICogYGBgc2hcbiAqIEtFWV8xPUFCQ0RcbiAqIEtFWV8yPUFOT1RIRVJfREVGQVVMVF9WQUxVRVxuICogYGBgXG4gKlxuICogIyMgQ29uZmlndXJhdGlvblxuICpcbiAqIExvYWRpbmcgZW52aXJvbm1lbnQgZmlsZXMgY29tZXMgd2l0aCBhIG51bWJlciBvZiBvcHRpb25zIHBhc3NlZCBpbnRvXG4gKiB0aGUgYGxvYWQoKWAgZnVuY3Rpb24sIGFsbCBvZiB3aGljaCBhcmUgb3B0aW9uYWwuXG4gKlxuICogfE9wdGlvbnxEZWZhdWx0fERlc2NyaXB0aW9uXG4gKiB8LS0tLS0tfC0tLS0tLS18LS0tLS0tLS0tLS1cbiAqIHxlbnZQYXRofC4vLmVudnxQYXRoIGFuZCBmaWxlbmFtZSBvZiB0aGUgYC5lbnZgIGZpbGUuICBVc2UgbnVsbCB0byBwcmV2ZW50IHRoZSAuZW52IGZpbGUgZnJvbSBiZWluZyBsb2FkZWQuXG4gKiB8ZGVmYXVsdHNQYXRofC4vLmVudi5kZWZhdWx0c3xQYXRoIGFuZCBmaWxlbmFtZSBvZiB0aGUgYC5lbnYuZGVmYXVsdHNgIGZpbGUuIFVzZSBudWxsIHRvIHByZXZlbnQgdGhlIC5lbnYuZGVmYXVsdHMgZmlsZSBmcm9tIGJlaW5nIGxvYWRlZC5cbiAqIHxleGFtcGxlUGF0aHwuLy5lbnYuZXhhbXBsZXxQYXRoIGFuZCBmaWxlbmFtZSBvZiB0aGUgYC5lbnYuZXhhbXBsZWAgZmlsZS4gVXNlIG51bGwgdG8gcHJldmVudCB0aGUgLmVudi5leGFtcGxlIGZpbGUgZnJvbSBiZWluZyBsb2FkZWQuXG4gKiB8ZXhwb3J0fGZhbHNlfFdoZW4gdHJ1ZSwgdGhpcyB3aWxsIGV4cG9ydCBhbGwgZW52aXJvbm1lbnQgdmFyaWFibGVzIGluIHRoZSBgLmVudmAgYW5kIGAuZW52LmRlZmF1bHRgIGZpbGVzIHRvIHRoZSBwcm9jZXNzIGVudmlyb25tZW50IChlLmcuIGZvciB1c2UgYnkgYERlbm8uZW52LmdldCgpYCkgYnV0IG9ubHkgaWYgdGhleSBhcmUgbm90IGFscmVhZHkgc2V0LiAgSWYgYSB2YXJpYWJsZSBpcyBhbHJlYWR5IGluIHRoZSBwcm9jZXNzLCB0aGUgYC5lbnZgIHZhbHVlIGlzIGlnbm9yZWQuXG4gKiB8YWxsb3dFbXB0eVZhbHVlc3xmYWxzZXxBbGxvd3MgZW1wdHkgdmFsdWVzIGZvciBzcGVjaWZpZWQgZW52IHZhcmlhYmxlcyAodGhyb3dzIG90aGVyd2lzZSlcbiAqXG4gKiAjIyMgRXhhbXBsZSBjb25maWd1cmF0aW9uXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgbG9hZCB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2RvdGVudi9tb2QudHNcIjtcbiAqXG4gKiBjb25zdCBjb25mID0gYXdhaXQgbG9hZCh7XG4gKiAgICAgZW52UGF0aDogXCIuLy5lbnZfcHJvZFwiLFxuICogICAgIGV4YW1wbGVQYXRoOiBcIi4vLmVudl9yZXF1aXJlZFwiLFxuICogICAgIGV4cG9ydDogdHJ1ZSxcbiAqICAgICBhbGxvd0VtcHR5VmFsdWVzOiB0cnVlLFxuICogICB9KTtcbiAqIGBgYFxuICpcbiAqICMjIFBlcm1pc3Npb25zXG4gKlxuICogQXQgYSBtaW5pbXVtLCBsb2FkaW5nIHRoZSBgLmVudmAgcmVsYXRlZCBmaWxlcyByZXF1aXJlcyB0aGUgYC0tYWxsb3ctcmVhZGAgcGVybWlzc2lvbi4gIEFkZGl0aW9uYWxseSwgaWZcbiAqIHlvdSBhY2Nlc3MgdGhlIHByb2Nlc3MgZW52aXJvbm1lbnQsIGVpdGhlciB0aHJvdWdoIGV4cG9ydGluZyB5b3VyIGNvbmZpZ3VyYXRpb24gb3IgZXhwYW5kaW5nIHZhcmlhYmxlc1xuICogaW4geW91ciBgLmVudmAgZmlsZSwgeW91IHdpbGwgbmVlZCB0aGUgYC0tYWxsb3ctZW52YCBwZXJtaXNzaW9uLiAgRS5nLlxuICpcbiAqIGBgYHNoXG4gKiBkZW5vIHJ1biAtLWFsbG93LXJlYWQ9LmVudiwuZW52LmRlZmF1bHRzLC5lbnYuZXhhbXBsZSAtLWFsbG93LWVudj1FTlYxLEVOVjIgYXBwLnRzXG4gKiBgYGBcbiAqXG4gKiAjIyBQYXJzaW5nIFJ1bGVzXG4gKlxuICogVGhlIHBhcnNpbmcgZW5naW5lIGN1cnJlbnRseSBzdXBwb3J0cyB0aGUgZm9sbG93aW5nIHJ1bGVzOlxuICpcbiAqIC0gVmFyaWFibGVzIHRoYXQgYWxyZWFkeSBleGlzdCBpbiB0aGUgZW52aXJvbm1lbnQgYXJlIG5vdCBvdmVycmlkZGVuIHdpdGhcbiAqICAgYGV4cG9ydDogdHJ1ZWBcbiAqIC0gYEJBU0lDPWJhc2ljYCBiZWNvbWVzIGB7IEJBU0lDOiBcImJhc2ljXCIgfWBcbiAqIC0gZW1wdHkgbGluZXMgYXJlIHNraXBwZWRcbiAqIC0gbGluZXMgYmVnaW5uaW5nIHdpdGggYCNgIGFyZSB0cmVhdGVkIGFzIGNvbW1lbnRzXG4gKiAtIGVtcHR5IHZhbHVlcyBiZWNvbWUgZW1wdHkgc3RyaW5ncyAoYEVNUFRZPWAgYmVjb21lcyBgeyBFTVBUWTogXCJcIiB9YClcbiAqIC0gc2luZ2xlIGFuZCBkb3VibGUgcXVvdGVkIHZhbHVlcyBhcmUgZXNjYXBlZCAoYFNJTkdMRV9RVU9URT0ncXVvdGVkJ2AgYmVjb21lc1xuICogICBgeyBTSU5HTEVfUVVPVEU6IFwicXVvdGVkXCIgfWApXG4gKiAtIG5ldyBsaW5lcyBhcmUgZXhwYW5kZWQgaW4gZG91YmxlIHF1b3RlZCB2YWx1ZXMgKGBNVUxUSUxJTkU9XCJuZXdcXG5saW5lXCJgXG4gKiAgIGJlY29tZXNcbiAqXG4gKiBgYGBcbiAqIHsgTVVMVElMSU5FOiBcIm5ld1xcbmxpbmVcIiB9XG4gKiBgYGBcbiAqXG4gKiAtIGlubmVyIHF1b3RlcyBhcmUgbWFpbnRhaW5lZCAodGhpbmsgSlNPTikgKGBKU09OPXtcImZvb1wiOiBcImJhclwifWAgYmVjb21lc1xuICogICBgeyBKU09OOiBcIntcXFwiZm9vXFxcIjogXFxcImJhclxcXCJ9XCIgfWApXG4gKiAtIHdoaXRlc3BhY2UgaXMgcmVtb3ZlZCBmcm9tIGJvdGggZW5kcyBvZiB1bnF1b3RlZCB2YWx1ZXMgKHNlZSBtb3JlIG9uXG4gKiAgIHtAbGlua2NvZGUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvU3RyaW5nL1RyaW0gfCB0cmltfSlcbiAqICAgKGBGT089IHNvbWUgdmFsdWVgIGJlY29tZXMgYHsgRk9POiBcInNvbWUgdmFsdWVcIiB9YClcbiAqIC0gd2hpdGVzcGFjZSBpcyBwcmVzZXJ2ZWQgb24gYm90aCBlbmRzIG9mIHF1b3RlZCB2YWx1ZXMgKGBGT089XCIgc29tZSB2YWx1ZSBcImBcbiAqICAgYmVjb21lcyBgeyBGT086IFwiIHNvbWUgdmFsdWUgXCIgfWApXG4gKiAtIGRvbGxhciBzaWduIHdpdGggYW4gZW52aXJvbm1lbnQga2V5IGluIG9yIHdpdGhvdXQgY3VybHkgYnJhY2VzIGluIHVucXVvdGVkXG4gKiAgIHZhbHVlcyB3aWxsIGV4cGFuZCB0aGUgZW52aXJvbm1lbnQga2V5IChgS0VZPSRLRVlgIG9yIGBLRVk9JHtLRVl9YCBiZWNvbWVzXG4gKiAgIGB7IEtFWTogXCI8S0VZX1ZBTFVFX0ZST01fRU5WPlwiIH1gKVxuICogLSBlc2NhcGVkIGRvbGxhciBzaWduIHdpdGggYW4gZW52aXJvbm1lbnQga2V5IGluIHVucXVvdGVkIHZhbHVlcyB3aWxsIGVzY2FwZSB0aGVcbiAqICAgZW52aXJvbm1lbnQga2V5IHJhdGhlciB0aGFuIGV4cGFuZCAoYEtFWT1cXCRLRVlgIGJlY29tZXMgYHsgS0VZOiBcIlxcXFwkS0VZXCIgfWApXG4gKiAtIGNvbG9uIGFuZCBhIG1pbnVzIHNpZ24gd2l0aCBhIGRlZmF1bHQgdmFsdWUod2hpY2ggY2FuIGFsc28gYmUgYW5vdGhlciBleHBhbmRcbiAqICAgdmFsdWUpIGluIGV4cGFuZGluZyBjb25zdHJ1Y3Rpb24gaW4gdW5xdW90ZWQgdmFsdWVzIHdpbGwgZmlyc3QgYXR0ZW1wdCB0b1xuICogICBleHBhbmQgdGhlIGVudmlyb25tZW50IGtleS4gSWYgaXTigJlzIG5vdCBmb3VuZCwgdGhlbiBpdCB3aWxsIHJldHVybiB0aGUgZGVmYXVsdFxuICogICB2YWx1ZSAoYEtFWT0ke0tFWTotZGVmYXVsdH1gIElmIEtFWSBleGlzdHMgaXQgYmVjb21lc1xuICogICBgeyBLRVk6IFwiPEtFWV9WQUxVRV9GUk9NX0VOVj5cIiB9YCBJZiBub3QsIHRoZW4gaXQgYmVjb21lc1xuICogICBgeyBLRVk6IFwiZGVmYXVsdFwiIH1gLiBBbHNvIHRoZXJlIGlzIHBvc3NpYmxlIHRvIGRvIHRoaXMgY2FzZVxuICogICBgS0VZPSR7Tk9fU1VDSF9LRVk6LSR7RVhJU1RJTkdfS0VZOi1kZWZhdWx0fX1gIHdoaWNoIGJlY29tZXNcbiAqICAgYHsgS0VZOiBcIjxFWElTVElOR19LRVlfVkFMVUVfRlJPTV9FTlY+XCIgfWApXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkKFxuICB7XG4gICAgZW52UGF0aCA9IFwiLmVudlwiLFxuICAgIGV4YW1wbGVQYXRoID0gXCIuZW52LmV4YW1wbGVcIixcbiAgICBkZWZhdWx0c1BhdGggPSBcIi5lbnYuZGVmYXVsdHNcIixcbiAgICBleHBvcnQ6IF9leHBvcnQgPSBmYWxzZSxcbiAgICBhbGxvd0VtcHR5VmFsdWVzID0gZmFsc2UsXG4gIH06IExvYWRPcHRpb25zID0ge30sXG4pOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIHN0cmluZz4+IHtcbiAgY29uc3QgY29uZiA9IGVudlBhdGggPyBhd2FpdCBwYXJzZUZpbGUoZW52UGF0aCkgOiB7fTtcblxuICBpZiAoZGVmYXVsdHNQYXRoKSB7XG4gICAgY29uc3QgY29uZkRlZmF1bHRzID0gYXdhaXQgcGFyc2VGaWxlKGRlZmF1bHRzUGF0aCk7XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoY29uZkRlZmF1bHRzKSkge1xuICAgICAgaWYgKCEoa2V5IGluIGNvbmYpKSB7XG4gICAgICAgIGNvbmZba2V5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChleGFtcGxlUGF0aCkge1xuICAgIGNvbnN0IGNvbmZFeGFtcGxlID0gYXdhaXQgcGFyc2VGaWxlKGV4YW1wbGVQYXRoKTtcbiAgICBhc3NlcnRTYWZlKGNvbmYsIGNvbmZFeGFtcGxlLCBhbGxvd0VtcHR5VmFsdWVzKTtcbiAgfVxuXG4gIGlmIChfZXhwb3J0KSB7XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoY29uZikpIHtcbiAgICAgIGlmIChEZW5vLmVudi5nZXQoa2V5KSAhPT0gdW5kZWZpbmVkKSBjb250aW51ZTtcbiAgICAgIERlbm8uZW52LnNldChrZXksIHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29uZjtcbn1cblxuZnVuY3Rpb24gcGFyc2VGaWxlU3luYyhcbiAgZmlsZXBhdGg6IHN0cmluZyxcbik6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xuICB0cnkge1xuICAgIHJldHVybiBwYXJzZShEZW5vLnJlYWRUZXh0RmlsZVN5bmMoZmlsZXBhdGgpKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChlIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuTm90Rm91bmQpIHJldHVybiB7fTtcbiAgICB0aHJvdyBlO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHBhcnNlRmlsZShcbiAgZmlsZXBhdGg6IHN0cmluZyxcbik6IFByb21pc2U8UmVjb3JkPHN0cmluZywgc3RyaW5nPj4ge1xuICB0cnkge1xuICAgIHJldHVybiBwYXJzZShhd2FpdCBEZW5vLnJlYWRUZXh0RmlsZShmaWxlcGF0aCkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RGb3VuZCkgcmV0dXJuIHt9O1xuICAgIHRocm93IGU7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0U2FmZShcbiAgY29uZjogUmVjb3JkPHN0cmluZywgc3RyaW5nPixcbiAgY29uZkV4YW1wbGU6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4sXG4gIGFsbG93RW1wdHlWYWx1ZXM6IGJvb2xlYW4sXG4pIHtcbiAgY29uc3QgbWlzc2luZ0VudlZhcnM6IHN0cmluZ1tdID0gW107XG5cbiAgZm9yIChjb25zdCBrZXkgaW4gY29uZkV4YW1wbGUpIHtcbiAgICBpZiAoa2V5IGluIGNvbmYpIHtcbiAgICAgIGlmICghYWxsb3dFbXB0eVZhbHVlcyAmJiBjb25mW2tleV0gPT09IFwiXCIpIHtcbiAgICAgICAgbWlzc2luZ0VudlZhcnMucHVzaChrZXkpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoRGVuby5lbnYuZ2V0KGtleSkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKCFhbGxvd0VtcHR5VmFsdWVzICYmIERlbm8uZW52LmdldChrZXkpID09PSBcIlwiKSB7XG4gICAgICAgIG1pc3NpbmdFbnZWYXJzLnB1c2goa2V5KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbWlzc2luZ0VudlZhcnMucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChtaXNzaW5nRW52VmFycy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlcyA9IFtcbiAgICAgIGBUaGUgZm9sbG93aW5nIHZhcmlhYmxlcyB3ZXJlIGRlZmluZWQgaW4gdGhlIGV4YW1wbGUgZmlsZSBidXQgYXJlIG5vdCBwcmVzZW50IGluIHRoZSBlbnZpcm9ubWVudDpcXG4gICR7XG4gICAgICAgIG1pc3NpbmdFbnZWYXJzLmpvaW4oXG4gICAgICAgICAgXCIsIFwiLFxuICAgICAgICApXG4gICAgICB9YCxcbiAgICAgIGBNYWtlIHN1cmUgdG8gYWRkIHRoZW0gdG8geW91ciBlbnYgZmlsZS5gLFxuICAgICAgIWFsbG93RW1wdHlWYWx1ZXMgJiZcbiAgICAgIGBJZiB5b3UgZXhwZWN0IGFueSBvZiB0aGVzZSB2YXJpYWJsZXMgdG8gYmUgZW1wdHksIHlvdSBjYW4gc2V0IHRoZSBhbGxvd0VtcHR5VmFsdWVzIG9wdGlvbiB0byB0cnVlLmAsXG4gICAgXTtcblxuICAgIHRocm93IG5ldyBNaXNzaW5nRW52VmFyc0Vycm9yKFxuICAgICAgZXJyb3JNZXNzYWdlcy5maWx0ZXIoQm9vbGVhbikuam9pbihcIlxcblxcblwiKSxcbiAgICAgIG1pc3NpbmdFbnZWYXJzLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBFcnJvciB0aHJvd24gaW4ge0BsaW5rY29kZSBsb2FkfSBhbmQge0BsaW5rY29kZSBsb2FkU3luY30gd2hlbiByZXF1aXJlZFxuICogZW52aXJvbm1lbnQgdmFyaWFibGVzIGFyZSBtaXNzaW5nLlxuICovXG5leHBvcnQgY2xhc3MgTWlzc2luZ0VudlZhcnNFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgLyoqIFRoZSBrZXlzIG9mIHRoZSBtaXNzaW5nIGVudmlyb25tZW50IHZhcmlhYmxlcy4gKi9cbiAgbWlzc2luZzogc3RyaW5nW107XG4gIC8qKiBDb25zdHJ1Y3RzIGEgbmV3IGluc3RhbmNlLiAqL1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIG1pc3Npbmc6IHN0cmluZ1tdKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJNaXNzaW5nRW52VmFyc0Vycm9yXCI7XG4gICAgdGhpcy5taXNzaW5nID0gbWlzc2luZztcbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgbmV3LnRhcmdldC5wcm90b3R5cGUpO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFOzs7OztDQUtDLEdBRUQsU0FBUyxLQUFLLFFBQVEsYUFBYTtBQUVuQyxjQUFjLGlCQUFpQjtBQUMvQixjQUFjLGFBQWE7QUFvRDNCLDhEQUE4RCxHQUM5RCxPQUFPLFNBQVMsU0FDZCxFQUNFLFVBQVUsTUFBTSxFQUNoQixjQUFjLGNBQWMsRUFDNUIsZUFBZSxlQUFlLEVBQzlCLFFBQVEsVUFBVSxLQUFLLEVBQ3ZCLG1CQUFtQixLQUFLLEVBQ1osR0FBRyxDQUFDLENBQUM7RUFFbkIsTUFBTSxPQUFPLFVBQVUsY0FBYyxXQUFXLENBQUM7RUFFakQsSUFBSSxjQUFjO0lBQ2hCLE1BQU0sZUFBZSxjQUFjO0lBQ25DLEtBQUssTUFBTSxDQUFDLEtBQUssTUFBTSxJQUFJLE9BQU8sT0FBTyxDQUFDLGNBQWU7TUFDdkQsSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLEdBQUc7UUFDbEIsSUFBSSxDQUFDLElBQUksR0FBRztNQUNkO0lBQ0Y7RUFDRjtFQUVBLElBQUksYUFBYTtJQUNmLE1BQU0sY0FBYyxjQUFjO0lBQ2xDLFdBQVcsTUFBTSxhQUFhO0VBQ2hDO0VBRUEsSUFBSSxTQUFTO0lBQ1gsS0FBSyxNQUFNLENBQUMsS0FBSyxNQUFNLElBQUksT0FBTyxPQUFPLENBQUMsTUFBTztNQUMvQyxJQUFJLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLFdBQVc7TUFDckMsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUs7SUFDcEI7RUFDRjtFQUVBLE9BQU87QUFDVDtBQUVBOzs7Ozs7Ozs7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
// denoCacheMetadata=7926747121543578937,6954163039509046294