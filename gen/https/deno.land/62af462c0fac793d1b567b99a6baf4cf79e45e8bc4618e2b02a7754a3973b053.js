import { DENO_DEPLOYMENT_ID } from "./build_id.ts";
import { colors } from "./deps.ts";
const defaultOnListenFor = (getAddress)=>{
  return (params)=>{
    const address = colors.cyan(getAddress(params));
    const localLabel = colors.bold("Local:");
    // Print more concise output for deploy logs
    if (DENO_DEPLOYMENT_ID) {
      console.log(colors.bgRgb8(colors.rgb8(" 🍋 Fresh ready ", 0), 121), `${localLabel} ${address}`);
    } else {
      console.log();
      console.log(colors.bgRgb8(colors.rgb8(" 🍋 Fresh ready ", 0), 121));
      console.log(`    ${localLabel} ${address}\n`);
    }
  };
};
export async function startUnixServer(handler, opts) {
  if (!opts.onListen) {
    opts.onListen = defaultOnListenFor((params)=>{
      return `socket://${params.path}`;
    });
    // @ts-ignore Ignore type error when type checking with Deno versions
    if (typeof Deno.serve === "function") {
      await Deno.serve(opts, handler).finished;
    }
    throw new Error(`unix domain sockets are not supported in your current deno version.`);
  }
}
export async function startServer(handler, opts) {
  if (!opts.onListen) {
    opts.onListen = defaultOnListenFor((params)=>{
      const pathname = opts.basePath + "/";
      const https = !!(opts.key && opts.cert);
      const protocol = https ? "https:" : "http:";
      return `${protocol}//localhost:${params.port}${pathname}`;
    });
  }
  const portEnv = Deno.env.get("PORT");
  if (portEnv !== undefined) {
    opts.port ??= parseInt(portEnv, 10);
  }
  if (opts.port) {
    await bootServer(handler, opts);
  } else {
    // No port specified, check for a free port. Instead of picking just
    // any port we'll check if the next one is free for UX reasons.
    // That way the user only needs to increment a number when running
    // multiple apps vs having to remember completely different ports.
    let firstError;
    for(let port = 8000; port < 8020; port++){
      try {
        await bootServer(handler, {
          ...opts,
          port
        });
        firstError = undefined;
        break;
      } catch (err) {
        if (err instanceof Deno.errors.AddrInUse) {
          // Throw first EADDRINUSE error
          // if no port is free
          if (!firstError) {
            firstError = err;
          }
          continue;
        }
        throw err;
      }
    }
    if (firstError) {
      throw firstError;
    }
  }
}
async function bootServer(handler, opts) {
  // @ts-ignore Ignore type error when type checking with Deno versions
  if (typeof Deno.serve === "function") {
    // @ts-ignore Ignore type error when type checking with Deno versions
    await Deno.serve(opts, (r, info)=>handler(r, {
        ...info,
        remoteAddr: info.remoteAddr,
        localAddr: {
          transport: "tcp",
          hostname: opts.hostname ?? "localhost",
          port: opts.port
        }
      })).finished;
  } else {
    // @ts-ignore Deprecated std serve way
    await serve(handler, opts);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZnJlc2hAMS43LjMvc3JjL3NlcnZlci9ib290LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERFTk9fREVQTE9ZTUVOVF9JRCB9IGZyb20gXCIuL2J1aWxkX2lkLnRzXCI7XG5pbXBvcnQgeyBjb2xvcnMgfSBmcm9tIFwiLi9kZXBzLnRzXCI7XG5pbXBvcnQgeyBTZXJ2ZUhhbmRsZXIgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuXG5jb25zdCBkZWZhdWx0T25MaXN0ZW5Gb3IgPSA8VD4oZ2V0QWRkcmVzczogKHBhcmFtczogVCkgPT4gc3RyaW5nKSA9PiB7XG4gIHJldHVybiAocGFyYW1zOiBUKSA9PiB7XG4gICAgY29uc3QgYWRkcmVzcyA9IGNvbG9ycy5jeWFuKFxuICAgICAgZ2V0QWRkcmVzcyhwYXJhbXMpLFxuICAgICk7XG4gICAgY29uc3QgbG9jYWxMYWJlbCA9IGNvbG9ycy5ib2xkKFwiTG9jYWw6XCIpO1xuXG4gICAgLy8gUHJpbnQgbW9yZSBjb25jaXNlIG91dHB1dCBmb3IgZGVwbG95IGxvZ3NcbiAgICBpZiAoREVOT19ERVBMT1lNRU5UX0lEKSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgY29sb3JzLmJnUmdiOChjb2xvcnMucmdiOChcIiDwn42LIEZyZXNoIHJlYWR5IFwiLCAwKSwgMTIxKSxcbiAgICAgICAgYCR7bG9jYWxMYWJlbH0gJHthZGRyZXNzfWAsXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygpO1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIGNvbG9ycy5iZ1JnYjgoY29sb3JzLnJnYjgoXCIg8J+NiyBGcmVzaCByZWFkeSBcIiwgMCksIDEyMSksXG4gICAgICApO1xuICAgICAgY29uc29sZS5sb2coYCAgICAke2xvY2FsTGFiZWx9ICR7YWRkcmVzc31cXG5gKTtcbiAgICB9XG4gIH07XG59O1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0VW5peFNlcnZlcihcbiAgaGFuZGxlcjogRGVuby5TZXJ2ZVVuaXhIYW5kbGVyLFxuICBvcHRzOiBEZW5vLlNlcnZlVW5peE9wdGlvbnMsXG4pIHtcbiAgaWYgKCFvcHRzLm9uTGlzdGVuKSB7XG4gICAgb3B0cy5vbkxpc3RlbiA9IGRlZmF1bHRPbkxpc3RlbkZvcigocGFyYW1zKSA9PiB7XG4gICAgICByZXR1cm4gYHNvY2tldDovLyR7cGFyYW1zLnBhdGh9YDtcbiAgICB9KTtcbiAgICAvLyBAdHMtaWdub3JlIElnbm9yZSB0eXBlIGVycm9yIHdoZW4gdHlwZSBjaGVja2luZyB3aXRoIERlbm8gdmVyc2lvbnNcbiAgICBpZiAodHlwZW9mIERlbm8uc2VydmUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgYXdhaXQgRGVuby5zZXJ2ZShcbiAgICAgICAgb3B0cyxcbiAgICAgICAgaGFuZGxlcixcbiAgICAgICkuZmluaXNoZWQ7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGB1bml4IGRvbWFpbiBzb2NrZXRzIGFyZSBub3Qgc3VwcG9ydGVkIGluIHlvdXIgY3VycmVudCBkZW5vIHZlcnNpb24uYCxcbiAgICApO1xuICB9XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRTZXJ2ZXIoXG4gIGhhbmRsZXI6IERlbm8uU2VydmVIYW5kbGVyLFxuICBvcHRzOiBQYXJ0aWFsPERlbm8uU2VydmVUbHNPcHRpb25zPiAmIHsgYmFzZVBhdGg6IHN0cmluZyB9LFxuKSB7XG4gIGlmICghb3B0cy5vbkxpc3Rlbikge1xuICAgIG9wdHMub25MaXN0ZW4gPSBkZWZhdWx0T25MaXN0ZW5Gb3IoKHBhcmFtcykgPT4ge1xuICAgICAgY29uc3QgcGF0aG5hbWUgPSBvcHRzLmJhc2VQYXRoICsgXCIvXCI7XG4gICAgICBjb25zdCBodHRwcyA9ICEhKG9wdHMua2V5ICYmIG9wdHMuY2VydCk7XG4gICAgICBjb25zdCBwcm90b2NvbCA9IGh0dHBzID8gXCJodHRwczpcIiA6IFwiaHR0cDpcIjtcbiAgICAgIHJldHVybiBgJHtwcm90b2NvbH0vL2xvY2FsaG9zdDoke3BhcmFtcy5wb3J0fSR7cGF0aG5hbWV9YDtcbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0IHBvcnRFbnYgPSBEZW5vLmVudi5nZXQoXCJQT1JUXCIpO1xuICBpZiAocG9ydEVudiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgb3B0cy5wb3J0ID8/PSBwYXJzZUludChwb3J0RW52LCAxMCk7XG4gIH1cblxuICBpZiAob3B0cy5wb3J0KSB7XG4gICAgYXdhaXQgYm9vdFNlcnZlcihoYW5kbGVyLCBvcHRzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBObyBwb3J0IHNwZWNpZmllZCwgY2hlY2sgZm9yIGEgZnJlZSBwb3J0LiBJbnN0ZWFkIG9mIHBpY2tpbmcganVzdFxuICAgIC8vIGFueSBwb3J0IHdlJ2xsIGNoZWNrIGlmIHRoZSBuZXh0IG9uZSBpcyBmcmVlIGZvciBVWCByZWFzb25zLlxuICAgIC8vIFRoYXQgd2F5IHRoZSB1c2VyIG9ubHkgbmVlZHMgdG8gaW5jcmVtZW50IGEgbnVtYmVyIHdoZW4gcnVubmluZ1xuICAgIC8vIG11bHRpcGxlIGFwcHMgdnMgaGF2aW5nIHRvIHJlbWVtYmVyIGNvbXBsZXRlbHkgZGlmZmVyZW50IHBvcnRzLlxuICAgIGxldCBmaXJzdEVycm9yO1xuICAgIGZvciAobGV0IHBvcnQgPSA4MDAwOyBwb3J0IDwgODAyMDsgcG9ydCsrKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBib290U2VydmVyKGhhbmRsZXIsIHsgLi4ub3B0cywgcG9ydCB9KTtcbiAgICAgICAgZmlyc3RFcnJvciA9IHVuZGVmaW5lZDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLkFkZHJJblVzZSkge1xuICAgICAgICAgIC8vIFRocm93IGZpcnN0IEVBRERSSU5VU0UgZXJyb3JcbiAgICAgICAgICAvLyBpZiBubyBwb3J0IGlzIGZyZWVcbiAgICAgICAgICBpZiAoIWZpcnN0RXJyb3IpIHtcbiAgICAgICAgICAgIGZpcnN0RXJyb3IgPSBlcnI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChmaXJzdEVycm9yKSB7XG4gICAgICB0aHJvdyBmaXJzdEVycm9yO1xuICAgIH1cbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBib290U2VydmVyKFxuICBoYW5kbGVyOiBTZXJ2ZUhhbmRsZXIsXG4gIG9wdHM6IFBhcnRpYWw8RGVuby5TZXJ2ZVRsc09wdGlvbnM+LFxuKSB7XG4gIC8vIEB0cy1pZ25vcmUgSWdub3JlIHR5cGUgZXJyb3Igd2hlbiB0eXBlIGNoZWNraW5nIHdpdGggRGVubyB2ZXJzaW9uc1xuICBpZiAodHlwZW9mIERlbm8uc2VydmUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIC8vIEB0cy1pZ25vcmUgSWdub3JlIHR5cGUgZXJyb3Igd2hlbiB0eXBlIGNoZWNraW5nIHdpdGggRGVubyB2ZXJzaW9uc1xuICAgIGF3YWl0IERlbm8uc2VydmUoXG4gICAgICBvcHRzLFxuICAgICAgKHIsIGluZm8pID0+XG4gICAgICAgIGhhbmRsZXIoXG4gICAgICAgICAgcixcbiAgICAgICAgICB7XG4gICAgICAgICAgICAuLi5pbmZvLFxuICAgICAgICAgICAgcmVtb3RlQWRkcjogaW5mby5yZW1vdGVBZGRyLFxuICAgICAgICAgICAgbG9jYWxBZGRyOiB7XG4gICAgICAgICAgICAgIHRyYW5zcG9ydDogXCJ0Y3BcIixcbiAgICAgICAgICAgICAgaG9zdG5hbWU6IG9wdHMuaG9zdG5hbWUgPz8gXCJsb2NhbGhvc3RcIixcbiAgICAgICAgICAgICAgcG9ydDogb3B0cy5wb3J0LFxuICAgICAgICAgICAgfSBhcyBEZW5vLk5ldEFkZHIsXG4gICAgICAgICAgfSxcbiAgICAgICAgKSxcbiAgICApLmZpbmlzaGVkO1xuICB9IGVsc2Uge1xuICAgIC8vIEB0cy1pZ25vcmUgRGVwcmVjYXRlZCBzdGQgc2VydmUgd2F5XG4gICAgYXdhaXQgc2VydmUoaGFuZGxlciwgb3B0cyk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLGtCQUFrQixRQUFRLGdCQUFnQjtBQUNuRCxTQUFTLE1BQU0sUUFBUSxZQUFZO0FBR25DLE1BQU0scUJBQXFCLENBQUk7RUFDN0IsT0FBTyxDQUFDO0lBQ04sTUFBTSxVQUFVLE9BQU8sSUFBSSxDQUN6QixXQUFXO0lBRWIsTUFBTSxhQUFhLE9BQU8sSUFBSSxDQUFDO0lBRS9CLDRDQUE0QztJQUM1QyxJQUFJLG9CQUFvQjtNQUN0QixRQUFRLEdBQUcsQ0FDVCxPQUFPLE1BQU0sQ0FBQyxPQUFPLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxNQUNsRCxHQUFHLFdBQVcsQ0FBQyxFQUFFLFNBQVM7SUFFOUIsT0FBTztNQUNMLFFBQVEsR0FBRztNQUNYLFFBQVEsR0FBRyxDQUNULE9BQU8sTUFBTSxDQUFDLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixJQUFJO01BRXBELFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDO0lBQzlDO0VBQ0Y7QUFDRjtBQUNBLE9BQU8sZUFBZSxnQkFDcEIsT0FBOEIsRUFDOUIsSUFBMkI7RUFFM0IsSUFBSSxDQUFDLEtBQUssUUFBUSxFQUFFO0lBQ2xCLEtBQUssUUFBUSxHQUFHLG1CQUFtQixDQUFDO01BQ2xDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsT0FBTyxJQUFJLEVBQUU7SUFDbEM7SUFDQSxxRUFBcUU7SUFDckUsSUFBSSxPQUFPLEtBQUssS0FBSyxLQUFLLFlBQVk7TUFDcEMsTUFBTSxLQUFLLEtBQUssQ0FDZCxNQUNBLFNBQ0EsUUFBUTtJQUNaO0lBQ0EsTUFBTSxJQUFJLE1BQ1IsQ0FBQyxtRUFBbUUsQ0FBQztFQUV6RTtBQUNGO0FBQ0EsT0FBTyxlQUFlLFlBQ3BCLE9BQTBCLEVBQzFCLElBQTBEO0VBRTFELElBQUksQ0FBQyxLQUFLLFFBQVEsRUFBRTtJQUNsQixLQUFLLFFBQVEsR0FBRyxtQkFBbUIsQ0FBQztNQUNsQyxNQUFNLFdBQVcsS0FBSyxRQUFRLEdBQUc7TUFDakMsTUFBTSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssSUFBSTtNQUN0QyxNQUFNLFdBQVcsUUFBUSxXQUFXO01BQ3BDLE9BQU8sR0FBRyxTQUFTLFlBQVksRUFBRSxPQUFPLElBQUksR0FBRyxVQUFVO0lBQzNEO0VBQ0Y7RUFFQSxNQUFNLFVBQVUsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDO0VBQzdCLElBQUksWUFBWSxXQUFXO0lBQ3pCLEtBQUssSUFBSSxLQUFLLFNBQVMsU0FBUztFQUNsQztFQUVBLElBQUksS0FBSyxJQUFJLEVBQUU7SUFDYixNQUFNLFdBQVcsU0FBUztFQUM1QixPQUFPO0lBQ0wsb0VBQW9FO0lBQ3BFLCtEQUErRDtJQUMvRCxrRUFBa0U7SUFDbEUsa0VBQWtFO0lBQ2xFLElBQUk7SUFDSixJQUFLLElBQUksT0FBTyxNQUFNLE9BQU8sTUFBTSxPQUFRO01BQ3pDLElBQUk7UUFDRixNQUFNLFdBQVcsU0FBUztVQUFFLEdBQUcsSUFBSTtVQUFFO1FBQUs7UUFDMUMsYUFBYTtRQUNiO01BQ0YsRUFBRSxPQUFPLEtBQUs7UUFDWixJQUFJLGVBQWUsS0FBSyxNQUFNLENBQUMsU0FBUyxFQUFFO1VBQ3hDLCtCQUErQjtVQUMvQixxQkFBcUI7VUFDckIsSUFBSSxDQUFDLFlBQVk7WUFDZixhQUFhO1VBQ2Y7VUFDQTtRQUNGO1FBRUEsTUFBTTtNQUNSO0lBQ0Y7SUFFQSxJQUFJLFlBQVk7TUFDZCxNQUFNO0lBQ1I7RUFDRjtBQUNGO0FBRUEsZUFBZSxXQUNiLE9BQXFCLEVBQ3JCLElBQW1DO0VBRW5DLHFFQUFxRTtFQUNyRSxJQUFJLE9BQU8sS0FBSyxLQUFLLEtBQUssWUFBWTtJQUNwQyxxRUFBcUU7SUFDckUsTUFBTSxLQUFLLEtBQUssQ0FDZCxNQUNBLENBQUMsR0FBRyxPQUNGLFFBQ0UsR0FDQTtRQUNFLEdBQUcsSUFBSTtRQUNQLFlBQVksS0FBSyxVQUFVO1FBQzNCLFdBQVc7VUFDVCxXQUFXO1VBQ1gsVUFBVSxLQUFLLFFBQVEsSUFBSTtVQUMzQixNQUFNLEtBQUssSUFBSTtRQUNqQjtNQUNGLElBRUosUUFBUTtFQUNaLE9BQU87SUFDTCxzQ0FBc0M7SUFDdEMsTUFBTSxNQUFNLFNBQVM7RUFDdkI7QUFDRiJ9
// denoCacheMetadata=17942556154201466176,243759754414072936