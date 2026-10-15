import { home, runDaily, saveSchedule } from "./lib/handlers.ts";

// The engine finds a handler by name among this file's globals: the route
// handlers by the name registerRoute is given, and the scheduled run by the
// `handler` its schedule names. Handlers live in lib/ (so tests can import
// them), so list each one here, the scheduled run included.
Object.assign(globalThis, { home, saveSchedule, runDaily });

function init(): void {
  const results = [
    routeRegistry.registerRoute("/__NAME__", { handler: "home" }),
    routeRegistry.registerRoute("/__NAME__/schedule", {
      handler: "saveSchedule",
      method: "POST",
    }),
    routeRegistry.registerRoute("/__NAME__/style.css", {
      file: "public/style.css",
    }),
  ];
  for (const result of results) {
    if (!result.ok) console.error("registration refused: " + result.reason);
  }
}
