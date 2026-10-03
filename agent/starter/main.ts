import { ask } from "./lib/handlers.ts";

// The engine finds a handler by the name registerRoute is given, among this
// file's globals, and calls it with the context alone. Handlers live in lib/
// (so tests can import them), so list each one here.
Object.assign(globalThis, { ask });

function init(): void {
  const result = routeRegistry.registerRoute("/__NAME__/ask", {
    handler: "ask",
    method: "POST",
  });
  if (!result.ok) console.error("registration refused: " + result.reason);
}
