// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { dirname } from "../path/dirname.ts";
import { resolve } from "../path/resolve.ts";
import { ensureDir, ensureDirSync } from "./ensure_dir.ts";
import { getFileInfoType } from "./_get_file_info_type.ts";
import { toPathString } from "./_to_path_string.ts";
const isWindows = Deno.build.os === "windows";
function resolveSymlinkTarget(target, linkName) {
  if (typeof target !== "string") return target; // URL is always absolute path
  if (typeof linkName === "string") {
    return resolve(dirname(linkName), target);
  } else {
    return new URL(target, linkName);
  }
}
/**
 * Ensures that the link exists, and points to a valid file.
 * If the directory structure does not exist, it is created.
 *
 * @param target the source file path
 * @param linkName the destination link path
 */ export async function ensureSymlink(target, linkName) {
  const targetRealPath = resolveSymlinkTarget(target, linkName);
  const srcStatInfo = await Deno.lstat(targetRealPath);
  const srcFilePathType = getFileInfoType(srcStatInfo);
  await ensureDir(dirname(toPathString(linkName)));
  const options = isWindows ? {
    type: srcFilePathType === "dir" ? "dir" : "file"
  } : undefined;
  try {
    await Deno.symlink(target, linkName, options);
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
  }
}
/**
 * Ensures that the link exists, and points to a valid file.
 * If the directory structure does not exist, it is created.
 *
 * @param target the source file path
 * @param linkName the destination link path
 */ export function ensureSymlinkSync(target, linkName) {
  const targetRealPath = resolveSymlinkTarget(target, linkName);
  const srcStatInfo = Deno.lstatSync(targetRealPath);
  const srcFilePathType = getFileInfoType(srcStatInfo);
  ensureDirSync(dirname(toPathString(linkName)));
  const options = isWindows ? {
    type: srcFilePathType === "dir" ? "dir" : "file"
  } : undefined;
  try {
    Deno.symlinkSync(target, linkName, options);
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL2ZzL2Vuc3VyZV9zeW1saW5rLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5pbXBvcnQgeyBkaXJuYW1lIH0gZnJvbSBcIi4uL3BhdGgvZGlybmFtZS50c1wiO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCIuLi9wYXRoL3Jlc29sdmUudHNcIjtcbmltcG9ydCB7IGVuc3VyZURpciwgZW5zdXJlRGlyU3luYyB9IGZyb20gXCIuL2Vuc3VyZV9kaXIudHNcIjtcbmltcG9ydCB7IGdldEZpbGVJbmZvVHlwZSB9IGZyb20gXCIuL19nZXRfZmlsZV9pbmZvX3R5cGUudHNcIjtcbmltcG9ydCB7IHRvUGF0aFN0cmluZyB9IGZyb20gXCIuL190b19wYXRoX3N0cmluZy50c1wiO1xuXG5jb25zdCBpc1dpbmRvd3MgPSBEZW5vLmJ1aWxkLm9zID09PSBcIndpbmRvd3NcIjtcblxuZnVuY3Rpb24gcmVzb2x2ZVN5bWxpbmtUYXJnZXQodGFyZ2V0OiBzdHJpbmcgfCBVUkwsIGxpbmtOYW1lOiBzdHJpbmcgfCBVUkwpIHtcbiAgaWYgKHR5cGVvZiB0YXJnZXQgIT09IFwic3RyaW5nXCIpIHJldHVybiB0YXJnZXQ7IC8vIFVSTCBpcyBhbHdheXMgYWJzb2x1dGUgcGF0aFxuICBpZiAodHlwZW9mIGxpbmtOYW1lID09PSBcInN0cmluZ1wiKSB7XG4gICAgcmV0dXJuIHJlc29sdmUoZGlybmFtZShsaW5rTmFtZSksIHRhcmdldCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBVUkwodGFyZ2V0LCBsaW5rTmFtZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBFbnN1cmVzIHRoYXQgdGhlIGxpbmsgZXhpc3RzLCBhbmQgcG9pbnRzIHRvIGEgdmFsaWQgZmlsZS5cbiAqIElmIHRoZSBkaXJlY3Rvcnkgc3RydWN0dXJlIGRvZXMgbm90IGV4aXN0LCBpdCBpcyBjcmVhdGVkLlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgdGhlIHNvdXJjZSBmaWxlIHBhdGhcbiAqIEBwYXJhbSBsaW5rTmFtZSB0aGUgZGVzdGluYXRpb24gbGluayBwYXRoXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbnN1cmVTeW1saW5rKFxuICB0YXJnZXQ6IHN0cmluZyB8IFVSTCxcbiAgbGlua05hbWU6IHN0cmluZyB8IFVSTCxcbikge1xuICBjb25zdCB0YXJnZXRSZWFsUGF0aCA9IHJlc29sdmVTeW1saW5rVGFyZ2V0KHRhcmdldCwgbGlua05hbWUpO1xuICBjb25zdCBzcmNTdGF0SW5mbyA9IGF3YWl0IERlbm8ubHN0YXQodGFyZ2V0UmVhbFBhdGgpO1xuICBjb25zdCBzcmNGaWxlUGF0aFR5cGUgPSBnZXRGaWxlSW5mb1R5cGUoc3JjU3RhdEluZm8pO1xuXG4gIGF3YWl0IGVuc3VyZURpcihkaXJuYW1lKHRvUGF0aFN0cmluZyhsaW5rTmFtZSkpKTtcblxuICBjb25zdCBvcHRpb25zOiBEZW5vLlN5bWxpbmtPcHRpb25zIHwgdW5kZWZpbmVkID0gaXNXaW5kb3dzXG4gICAgPyB7XG4gICAgICB0eXBlOiBzcmNGaWxlUGF0aFR5cGUgPT09IFwiZGlyXCIgPyBcImRpclwiIDogXCJmaWxlXCIsXG4gICAgfVxuICAgIDogdW5kZWZpbmVkO1xuXG4gIHRyeSB7XG4gICAgYXdhaXQgRGVuby5zeW1saW5rKHRhcmdldCwgbGlua05hbWUsIG9wdGlvbnMpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmICghKGVycm9yIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuQWxyZWFkeUV4aXN0cykpIHtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEVuc3VyZXMgdGhhdCB0aGUgbGluayBleGlzdHMsIGFuZCBwb2ludHMgdG8gYSB2YWxpZCBmaWxlLlxuICogSWYgdGhlIGRpcmVjdG9yeSBzdHJ1Y3R1cmUgZG9lcyBub3QgZXhpc3QsIGl0IGlzIGNyZWF0ZWQuXG4gKlxuICogQHBhcmFtIHRhcmdldCB0aGUgc291cmNlIGZpbGUgcGF0aFxuICogQHBhcmFtIGxpbmtOYW1lIHRoZSBkZXN0aW5hdGlvbiBsaW5rIHBhdGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZVN5bWxpbmtTeW5jKFxuICB0YXJnZXQ6IHN0cmluZyB8IFVSTCxcbiAgbGlua05hbWU6IHN0cmluZyB8IFVSTCxcbikge1xuICBjb25zdCB0YXJnZXRSZWFsUGF0aCA9IHJlc29sdmVTeW1saW5rVGFyZ2V0KHRhcmdldCwgbGlua05hbWUpO1xuICBjb25zdCBzcmNTdGF0SW5mbyA9IERlbm8ubHN0YXRTeW5jKHRhcmdldFJlYWxQYXRoKTtcbiAgY29uc3Qgc3JjRmlsZVBhdGhUeXBlID0gZ2V0RmlsZUluZm9UeXBlKHNyY1N0YXRJbmZvKTtcblxuICBlbnN1cmVEaXJTeW5jKGRpcm5hbWUodG9QYXRoU3RyaW5nKGxpbmtOYW1lKSkpO1xuXG4gIGNvbnN0IG9wdGlvbnM6IERlbm8uU3ltbGlua09wdGlvbnMgfCB1bmRlZmluZWQgPSBpc1dpbmRvd3NcbiAgICA/IHtcbiAgICAgIHR5cGU6IHNyY0ZpbGVQYXRoVHlwZSA9PT0gXCJkaXJcIiA/IFwiZGlyXCIgOiBcImZpbGVcIixcbiAgICB9XG4gICAgOiB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBEZW5vLnN5bWxpbmtTeW5jKHRhcmdldCwgbGlua05hbWUsIG9wdGlvbnMpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmICghKGVycm9yIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuQWxyZWFkeUV4aXN0cykpIHtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxTQUFTLE9BQU8sUUFBUSxxQkFBcUI7QUFDN0MsU0FBUyxPQUFPLFFBQVEscUJBQXFCO0FBQzdDLFNBQVMsU0FBUyxFQUFFLGFBQWEsUUFBUSxrQkFBa0I7QUFDM0QsU0FBUyxlQUFlLFFBQVEsMkJBQTJCO0FBQzNELFNBQVMsWUFBWSxRQUFRLHVCQUF1QjtBQUVwRCxNQUFNLFlBQVksS0FBSyxLQUFLLENBQUMsRUFBRSxLQUFLO0FBRXBDLFNBQVMscUJBQXFCLE1BQW9CLEVBQUUsUUFBc0I7RUFDeEUsSUFBSSxPQUFPLFdBQVcsVUFBVSxPQUFPLFFBQVEsOEJBQThCO0VBQzdFLElBQUksT0FBTyxhQUFhLFVBQVU7SUFDaEMsT0FBTyxRQUFRLFFBQVEsV0FBVztFQUNwQyxPQUFPO0lBQ0wsT0FBTyxJQUFJLElBQUksUUFBUTtFQUN6QjtBQUNGO0FBRUE7Ozs7OztDQU1DLEdBQ0QsT0FBTyxlQUFlLGNBQ3BCLE1BQW9CLEVBQ3BCLFFBQXNCO0VBRXRCLE1BQU0saUJBQWlCLHFCQUFxQixRQUFRO0VBQ3BELE1BQU0sY0FBYyxNQUFNLEtBQUssS0FBSyxDQUFDO0VBQ3JDLE1BQU0sa0JBQWtCLGdCQUFnQjtFQUV4QyxNQUFNLFVBQVUsUUFBUSxhQUFhO0VBRXJDLE1BQU0sVUFBMkMsWUFDN0M7SUFDQSxNQUFNLG9CQUFvQixRQUFRLFFBQVE7RUFDNUMsSUFDRTtFQUVKLElBQUk7SUFDRixNQUFNLEtBQUssT0FBTyxDQUFDLFFBQVEsVUFBVTtFQUN2QyxFQUFFLE9BQU8sT0FBTztJQUNkLElBQUksQ0FBQyxDQUFDLGlCQUFpQixLQUFLLE1BQU0sQ0FBQyxhQUFhLEdBQUc7TUFDakQsTUFBTTtJQUNSO0VBQ0Y7QUFDRjtBQUVBOzs7Ozs7Q0FNQyxHQUNELE9BQU8sU0FBUyxrQkFDZCxNQUFvQixFQUNwQixRQUFzQjtFQUV0QixNQUFNLGlCQUFpQixxQkFBcUIsUUFBUTtFQUNwRCxNQUFNLGNBQWMsS0FBSyxTQUFTLENBQUM7RUFDbkMsTUFBTSxrQkFBa0IsZ0JBQWdCO0VBRXhDLGNBQWMsUUFBUSxhQUFhO0VBRW5DLE1BQU0sVUFBMkMsWUFDN0M7SUFDQSxNQUFNLG9CQUFvQixRQUFRLFFBQVE7RUFDNUMsSUFDRTtFQUVKLElBQUk7SUFDRixLQUFLLFdBQVcsQ0FBQyxRQUFRLFVBQVU7RUFDckMsRUFBRSxPQUFPLE9BQU87SUFDZCxJQUFJLENBQUMsQ0FBQyxpQkFBaUIsS0FBSyxNQUFNLENBQUMsYUFBYSxHQUFHO01BQ2pELE1BQU07SUFDUjtFQUNGO0FBQ0YifQ==
// denoCacheMetadata=8583101599787760105,2292510247232953534