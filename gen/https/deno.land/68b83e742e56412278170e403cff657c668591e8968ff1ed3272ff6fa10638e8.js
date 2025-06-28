import { colors, join, lessThan, semverParse } from "./deps.ts";
function getHomeDir() {
  switch(Deno.build.os){
    case "linux":
      {
        const xdg = Deno.env.get("XDG_CACHE_HOME");
        if (xdg) return xdg;
        const home = Deno.env.get("HOME");
        if (home) return `${home}/.cache`;
        break;
      }
    case "darwin":
      {
        const home = Deno.env.get("HOME");
        if (home) return `${home}/Library/Caches`;
        break;
      }
    case "windows":
      return Deno.env.get("LOCALAPPDATA") ?? null;
  }
  return null;
}
function getFreshCacheDir() {
  const home = getHomeDir();
  if (home) return join(home, "fresh");
  return null;
}
async function fetchLatestVersion() {
  const res = await fetch("https://dl.deno.land/fresh/release-latest.txt");
  if (res.ok) {
    return (await res.text()).trim().replace(/^v/, "");
  }
  throw new Error(`Could not fetch latest version.`);
}
async function readCurrentVersion() {
  const versions = (await import("../../versions.json", {
    with: {
      type: "json"
    }
  })).default;
  return versions[0];
}
export async function updateCheck(interval, getCacheDir = getFreshCacheDir, getLatestVersion = fetchLatestVersion, getCurrentVersion = readCurrentVersion) {
  // Skip update checks on CI or Deno Deploy
  if (Deno.env.get("CI") === "true" || Deno.env.get("FRESH_NO_UPDATE_CHECK") === "true" || Deno.env.get("DENO_DEPLOYMENT_ID")) {
    return;
  }
  const home = getCacheDir();
  if (!home) return;
  const filePath = join(home, "latest.json");
  try {
    await Deno.mkdir(home, {
      recursive: true
    });
  } catch (err) {
    if (!(err instanceof Deno.errors.AlreadyExists)) {
      throw err;
    }
  }
  const version = await getCurrentVersion();
  let checkFile = {
    current_version: version,
    latest_version: version,
    last_checked: new Date(0).toISOString()
  };
  try {
    const text = await Deno.readTextFile(filePath);
    checkFile = JSON.parse(text);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }
  // Update current version
  checkFile.current_version = version;
  // Only check in the specified interval
  if (Date.now() >= new Date(checkFile.last_checked).getTime() + interval) {
    try {
      checkFile.latest_version = await getLatestVersion();
      checkFile.last_checked = new Date().toISOString();
    } catch (err) {
      // Update check is optional and shouldn't abort the program.
      console.error(colors.red(`    Update check failed: `) + err.message);
      return;
    }
  }
  // Only show update message if current version is smaller than latest
  const currentVersion = semverParse(checkFile.current_version);
  const latestVersion = semverParse(checkFile.latest_version);
  if ((!checkFile.last_shown || Date.now() >= new Date(checkFile.last_shown).getTime() + interval) && lessThan(currentVersion, latestVersion)) {
    checkFile.last_shown = new Date().toISOString();
    const current = colors.bold(colors.rgb8(checkFile.current_version, 208));
    const latest = colors.bold(colors.rgb8(checkFile.latest_version, 121));
    console.log(`    Fresh ${latest} is available. You're on ${current}`);
    console.log(`    To upgrade, run: deno run -A -r https://fresh.deno.dev/update`);
    console.log();
  }
  // Migrate old format to current
  if (!checkFile.last_shown) {
    checkFile.last_shown = new Date().toISOString();
  }
  const raw = JSON.stringify(checkFile, null, 2);
  await Deno.writeTextFile(filePath, raw);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZnJlc2hAMS43LjMvc3JjL2Rldi91cGRhdGVfY2hlY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY29sb3JzLCBqb2luLCBsZXNzVGhhbiwgc2VtdmVyUGFyc2UgfSBmcm9tIFwiLi9kZXBzLnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hlY2tGaWxlIHtcbiAgbGFzdF9jaGVja2VkOiBzdHJpbmc7XG4gIGxhc3Rfc2hvd24/OiBzdHJpbmc7XG4gIGxhdGVzdF92ZXJzaW9uOiBzdHJpbmc7XG4gIGN1cnJlbnRfdmVyc2lvbjogc3RyaW5nO1xufVxuXG5mdW5jdGlvbiBnZXRIb21lRGlyKCk6IHN0cmluZyB8IG51bGwge1xuICBzd2l0Y2ggKERlbm8uYnVpbGQub3MpIHtcbiAgICBjYXNlIFwibGludXhcIjoge1xuICAgICAgY29uc3QgeGRnID0gRGVuby5lbnYuZ2V0KFwiWERHX0NBQ0hFX0hPTUVcIik7XG4gICAgICBpZiAoeGRnKSByZXR1cm4geGRnO1xuXG4gICAgICBjb25zdCBob21lID0gRGVuby5lbnYuZ2V0KFwiSE9NRVwiKTtcbiAgICAgIGlmIChob21lKSByZXR1cm4gYCR7aG9tZX0vLmNhY2hlYDtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNhc2UgXCJkYXJ3aW5cIjoge1xuICAgICAgY29uc3QgaG9tZSA9IERlbm8uZW52LmdldChcIkhPTUVcIik7XG4gICAgICBpZiAoaG9tZSkgcmV0dXJuIGAke2hvbWV9L0xpYnJhcnkvQ2FjaGVzYDtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNhc2UgXCJ3aW5kb3dzXCI6XG4gICAgICByZXR1cm4gRGVuby5lbnYuZ2V0KFwiTE9DQUxBUFBEQVRBXCIpID8/IG51bGw7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZ2V0RnJlc2hDYWNoZURpcigpOiBzdHJpbmcgfCBudWxsIHtcbiAgY29uc3QgaG9tZSA9IGdldEhvbWVEaXIoKTtcbiAgaWYgKGhvbWUpIHJldHVybiBqb2luKGhvbWUsIFwiZnJlc2hcIik7XG4gIHJldHVybiBudWxsO1xufVxuXG5hc3luYyBmdW5jdGlvbiBmZXRjaExhdGVzdFZlcnNpb24oKSB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKFwiaHR0cHM6Ly9kbC5kZW5vLmxhbmQvZnJlc2gvcmVsZWFzZS1sYXRlc3QudHh0XCIpO1xuICBpZiAocmVzLm9rKSB7XG4gICAgcmV0dXJuIChhd2FpdCByZXMudGV4dCgpKS50cmltKCkucmVwbGFjZSgvXnYvLCBcIlwiKTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZldGNoIGxhdGVzdCB2ZXJzaW9uLmApO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZWFkQ3VycmVudFZlcnNpb24oKSB7XG4gIGNvbnN0IHZlcnNpb25zID0gKGF3YWl0IGltcG9ydChcIi4uLy4uL3ZlcnNpb25zLmpzb25cIiwge1xuICAgIHdpdGg6IHsgdHlwZTogXCJqc29uXCIgfSxcbiAgfSkpLmRlZmF1bHQgYXMgc3RyaW5nW107XG4gIHJldHVybiB2ZXJzaW9uc1swXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZUNoZWNrKFxuICBpbnRlcnZhbDogbnVtYmVyLFxuICBnZXRDYWNoZURpciA9IGdldEZyZXNoQ2FjaGVEaXIsXG4gIGdldExhdGVzdFZlcnNpb24gPSBmZXRjaExhdGVzdFZlcnNpb24sXG4gIGdldEN1cnJlbnRWZXJzaW9uID0gcmVhZEN1cnJlbnRWZXJzaW9uLFxuKSB7XG4gIC8vIFNraXAgdXBkYXRlIGNoZWNrcyBvbiBDSSBvciBEZW5vIERlcGxveVxuICBpZiAoXG4gICAgRGVuby5lbnYuZ2V0KFwiQ0lcIikgPT09IFwidHJ1ZVwiIHx8XG4gICAgRGVuby5lbnYuZ2V0KFwiRlJFU0hfTk9fVVBEQVRFX0NIRUNLXCIpID09PSBcInRydWVcIiB8fFxuICAgIERlbm8uZW52LmdldChcIkRFTk9fREVQTE9ZTUVOVF9JRFwiKVxuICApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBob21lID0gZ2V0Q2FjaGVEaXIoKTtcbiAgaWYgKCFob21lKSByZXR1cm47XG4gIGNvbnN0IGZpbGVQYXRoID0gam9pbihob21lLCBcImxhdGVzdC5qc29uXCIpO1xuICB0cnkge1xuICAgIGF3YWl0IERlbm8ubWtkaXIoaG9tZSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmICghKGVyciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLkFscmVhZHlFeGlzdHMpKSB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgdmVyc2lvbiA9IGF3YWl0IGdldEN1cnJlbnRWZXJzaW9uKCk7XG5cbiAgbGV0IGNoZWNrRmlsZTogQ2hlY2tGaWxlID0ge1xuICAgIGN1cnJlbnRfdmVyc2lvbjogdmVyc2lvbixcbiAgICBsYXRlc3RfdmVyc2lvbjogdmVyc2lvbixcbiAgICBsYXN0X2NoZWNrZWQ6IG5ldyBEYXRlKDApLnRvSVNPU3RyaW5nKCksXG4gIH07XG4gIHRyeSB7XG4gICAgY29uc3QgdGV4dCA9IGF3YWl0IERlbm8ucmVhZFRleHRGaWxlKGZpbGVQYXRoKTtcbiAgICBjaGVja0ZpbGUgPSBKU09OLnBhcnNlKHRleHQpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAoIShlcnIgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RGb3VuZCkpIHtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH1cblxuICAvLyBVcGRhdGUgY3VycmVudCB2ZXJzaW9uXG4gIGNoZWNrRmlsZS5jdXJyZW50X3ZlcnNpb24gPSB2ZXJzaW9uO1xuXG4gIC8vIE9ubHkgY2hlY2sgaW4gdGhlIHNwZWNpZmllZCBpbnRlcnZhbFxuICBpZiAoRGF0ZS5ub3coKSA+PSBuZXcgRGF0ZShjaGVja0ZpbGUubGFzdF9jaGVja2VkKS5nZXRUaW1lKCkgKyBpbnRlcnZhbCkge1xuICAgIHRyeSB7XG4gICAgICBjaGVja0ZpbGUubGF0ZXN0X3ZlcnNpb24gPSBhd2FpdCBnZXRMYXRlc3RWZXJzaW9uKCk7XG4gICAgICBjaGVja0ZpbGUubGFzdF9jaGVja2VkID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gVXBkYXRlIGNoZWNrIGlzIG9wdGlvbmFsIGFuZCBzaG91bGRuJ3QgYWJvcnQgdGhlIHByb2dyYW0uXG4gICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICBjb2xvcnMucmVkKGAgICAgVXBkYXRlIGNoZWNrIGZhaWxlZDogYCkgKyBlcnIubWVzc2FnZSxcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgLy8gT25seSBzaG93IHVwZGF0ZSBtZXNzYWdlIGlmIGN1cnJlbnQgdmVyc2lvbiBpcyBzbWFsbGVyIHRoYW4gbGF0ZXN0XG4gIGNvbnN0IGN1cnJlbnRWZXJzaW9uID0gc2VtdmVyUGFyc2UoY2hlY2tGaWxlLmN1cnJlbnRfdmVyc2lvbik7XG4gIGNvbnN0IGxhdGVzdFZlcnNpb24gPSBzZW12ZXJQYXJzZShjaGVja0ZpbGUubGF0ZXN0X3ZlcnNpb24pO1xuICBpZiAoXG4gICAgKCFjaGVja0ZpbGUubGFzdF9zaG93biB8fFxuICAgICAgRGF0ZS5ub3coKSA+PSBuZXcgRGF0ZShjaGVja0ZpbGUubGFzdF9zaG93bikuZ2V0VGltZSgpICsgaW50ZXJ2YWwpICYmXG4gICAgbGVzc1RoYW4oY3VycmVudFZlcnNpb24sIGxhdGVzdFZlcnNpb24pXG4gICkge1xuICAgIGNoZWNrRmlsZS5sYXN0X3Nob3duID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgY29uc3QgY3VycmVudCA9IGNvbG9ycy5ib2xkKGNvbG9ycy5yZ2I4KGNoZWNrRmlsZS5jdXJyZW50X3ZlcnNpb24sIDIwOCkpO1xuICAgIGNvbnN0IGxhdGVzdCA9IGNvbG9ycy5ib2xkKGNvbG9ycy5yZ2I4KGNoZWNrRmlsZS5sYXRlc3RfdmVyc2lvbiwgMTIxKSk7XG4gICAgY29uc29sZS5sb2coXG4gICAgICBgICAgIEZyZXNoICR7bGF0ZXN0fSBpcyBhdmFpbGFibGUuIFlvdSdyZSBvbiAke2N1cnJlbnR9YCxcbiAgICApO1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgYCAgICBUbyB1cGdyYWRlLCBydW46IGRlbm8gcnVuIC1BIC1yIGh0dHBzOi8vZnJlc2guZGVuby5kZXYvdXBkYXRlYCxcbiAgICApO1xuICAgIGNvbnNvbGUubG9nKCk7XG4gIH1cblxuICAvLyBNaWdyYXRlIG9sZCBmb3JtYXQgdG8gY3VycmVudFxuICBpZiAoIWNoZWNrRmlsZS5sYXN0X3Nob3duKSB7XG4gICAgY2hlY2tGaWxlLmxhc3Rfc2hvd24gPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gIH1cblxuICBjb25zdCByYXcgPSBKU09OLnN0cmluZ2lmeShjaGVja0ZpbGUsIG51bGwsIDIpO1xuICBhd2FpdCBEZW5vLndyaXRlVGV4dEZpbGUoZmlsZVBhdGgsIHJhdyk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxXQUFXLFFBQVEsWUFBWTtBQVNoRSxTQUFTO0VBQ1AsT0FBUSxLQUFLLEtBQUssQ0FBQyxFQUFFO0lBQ25CLEtBQUs7TUFBUztRQUNaLE1BQU0sTUFBTSxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDekIsSUFBSSxLQUFLLE9BQU87UUFFaEIsTUFBTSxPQUFPLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUMxQixJQUFJLE1BQU0sT0FBTyxHQUFHLEtBQUssT0FBTyxDQUFDO1FBQ2pDO01BQ0Y7SUFFQSxLQUFLO01BQVU7UUFDYixNQUFNLE9BQU8sS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQzFCLElBQUksTUFBTSxPQUFPLEdBQUcsS0FBSyxlQUFlLENBQUM7UUFDekM7TUFDRjtJQUVBLEtBQUs7TUFDSCxPQUFPLEtBQUssR0FBRyxDQUFDLEdBQUcs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
// denoCacheMetadata=9934269661316984879,11510909925516771773