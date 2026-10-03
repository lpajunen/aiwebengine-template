import { home } from "./lib/handlers.ts";

// The engine finds a handler by the name registerRoute is given, among this
// file's globals. Handlers live in lib/ (so tests can import them), so list
// each one here: add every handler you register to this object.
Object.assign(globalThis, { home });

function init(): void {
  const results = [
    routeRegistry.registerRoute("/__NAME__", { handler: "home" }),
    routeRegistry.registerRoute("/__NAME__/style.css", {
      file: "public/style.css",
    }),
  ];
  for (const result of results) {
    if (!result.ok) console.error("registration refused: " + result.reason);
  }
}
