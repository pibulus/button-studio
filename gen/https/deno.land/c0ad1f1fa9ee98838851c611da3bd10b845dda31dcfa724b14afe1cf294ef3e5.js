import { checkAsyncComponent } from "./render.ts";
export function defineConfig(config) {
  return config;
}
// Route creation helpers
export function defineRoute(fn) {
  // deno-lint-ignore no-explicit-any
  if (checkAsyncComponent(fn)) return fn;
  // deno-lint-ignore require-await
  return async (req, ctx)=>fn(req, ctx);
}
// Layout creation helper
export function defineLayout(fn) {
  // deno-lint-ignore no-explicit-any
  if (checkAsyncComponent(fn)) return fn;
  // deno-lint-ignore require-await
  return async (req, ctx)=>fn(req, ctx);
}
// App creation helper
export function defineApp(fn) {
  // deno-lint-ignore no-explicit-any
  if (checkAsyncComponent(fn)) return fn;
  // deno-lint-ignore require-await
  return async (req, ctx)=>fn(req, ctx);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZnJlc2hAMS43LjMvc3JjL3NlcnZlci9kZWZpbmVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudENoaWxkcmVuIH0gZnJvbSBcInByZWFjdFwiO1xuaW1wb3J0IHsgQXN5bmNMYXlvdXQsIEFzeW5jUm91dGUsIEZyZXNoQ29uZmlnLCBSb3V0ZUNvbnRleHQgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuaW1wb3J0IHsgY2hlY2tBc3luY0NvbXBvbmVudCB9IGZyb20gXCIuL3JlbmRlci50c1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lQ29uZmlnKGNvbmZpZzogRnJlc2hDb25maWcpOiBGcmVzaENvbmZpZyB7XG4gIHJldHVybiBjb25maWc7XG59XG5cbi8vIFJvdXRlIGNyZWF0aW9uIGhlbHBlcnNcbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVSb3V0ZTxcbiAgVCxcbj4oXG4gIGZuOiAoXG4gICAgcmVxOiBSZXF1ZXN0LFxuICAgIGN0eDogUm91dGVDb250ZXh0PHZvaWQsIFQ+LFxuICApID0+IENvbXBvbmVudENoaWxkcmVuIHwgUmVzcG9uc2UgfCBQcm9taXNlPENvbXBvbmVudENoaWxkcmVuIHwgUmVzcG9uc2U+LFxuKTogQXN5bmNSb3V0ZTx2b2lkLCBUPiB7XG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIGlmIChjaGVja0FzeW5jQ29tcG9uZW50KGZuKSkgcmV0dXJuIGZuIGFzIGFueTtcbiAgLy8gZGVuby1saW50LWlnbm9yZSByZXF1aXJlLWF3YWl0XG4gIHJldHVybiBhc3luYyAocmVxLCBjdHgpID0+IGZuKHJlcSwgY3R4KTtcbn1cblxuLy8gTGF5b3V0IGNyZWF0aW9uIGhlbHBlclxuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZUxheW91dDxUPihcbiAgZm46IChcbiAgICByZXE6IFJlcXVlc3QsXG4gICAgY3R4OiBSb3V0ZUNvbnRleHQ8dm9pZCwgVD4sXG4gICkgPT4gQ29tcG9uZW50Q2hpbGRyZW4gfCBSZXNwb25zZSB8IFByb21pc2U8Q29tcG9uZW50Q2hpbGRyZW4gfCBSZXNwb25zZT4sXG4pOiBBc3luY0xheW91dDx2b2lkLCBUPiB7XG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIGlmIChjaGVja0FzeW5jQ29tcG9uZW50KGZuKSkgcmV0dXJuIGZuIGFzIGFueTtcbiAgLy8gZGVuby1saW50LWlnbm9yZSByZXF1aXJlLWF3YWl0XG4gIHJldHVybiBhc3luYyAocmVxLCBjdHgpID0+IGZuKHJlcSwgY3R4KTtcbn1cblxuLy8gQXBwIGNyZWF0aW9uIGhlbHBlclxuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZUFwcDxUPihcbiAgZm46IChcbiAgICByZXE6IFJlcXVlc3QsXG4gICAgY3R4OiBSb3V0ZUNvbnRleHQ8dm9pZCwgVD4sXG4gICkgPT4gQ29tcG9uZW50Q2hpbGRyZW4gfCBSZXNwb25zZSB8IFByb21pc2U8Q29tcG9uZW50Q2hpbGRyZW4gfCBSZXNwb25zZT4sXG4pOiBBc3luY0xheW91dDx2b2lkLCBUPiB7XG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIGlmIChjaGVja0FzeW5jQ29tcG9uZW50KGZuKSkgcmV0dXJuIGZuIGFzIGFueTtcbiAgLy8gZGVuby1saW50LWlnbm9yZSByZXF1aXJlLWF3YWl0XG4gIHJldHVybiBhc3luYyAocmVxLCBjdHgpID0+IGZuKHJlcSwgY3R4KTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxTQUFTLG1CQUFtQixRQUFRLGNBQWM7QUFFbEQsT0FBTyxTQUFTLGFBQWEsTUFBbUI7RUFDOUMsT0FBTztBQUNUO0FBRUEseUJBQXlCO0FBQ3pCLE9BQU8sU0FBUyxZQUdkLEVBR3lFO0VBRXpFLG1DQUFtQztFQUNuQyxJQUFJLG9CQUFvQixLQUFLLE9BQU87RUFDcEMsaUNBQWlDO0VBQ2pDLE9BQU8sT0FBTyxLQUFLLE1BQVEsR0FBRyxLQUFLO0FBQ3JDO0FBRUEseUJBQXlCO0FBQ3pCLE9BQU8sU0FBUyxhQUNkLEVBR3lFO0VBRXpFLG1DQUFtQztFQUNuQyxJQUFJLG9CQUFvQixLQUFLLE9BQU87RUFDcEMsaUNBQWlDO0VBQ2pDLE9BQU8sT0FBTyxLQUFLLE1BQVEsR0FBRyxLQUFLO0FBQ3JDO0FBRUEsc0JBQXNCO0FBQ3RCLE9BQU8sU0FBUyxVQUNkLEVBR3lFO0VBRXpFLG1DQUFtQztFQUNuQyxJQUFJLG9CQUFvQixLQUFLLE9BQU87RUFDcEMsaUNBQWlDO0VBQ2pDLE9BQU8sT0FBTyxLQUFLLE1BQVEsR0FBRyxLQUFLO0FBQ3JDIn0=
// denoCacheMetadata=4907099765609178617,17353609065002017184