import { exampleTool } from "./lib/handlers.ts";

// The engine finds a handler by the name registerTool is given, among this
// file's globals. Handlers live in lib/ (so tests can import them), so list
// each one here: add every handler you register to this object.
Object.assign(globalThis, { exampleTool });

function init(): void {
  const result = mcpRegistry.registerTool("__SNAKE__", {
    description: "Replace this with what the tool does",
    inputSchema: {
      type: "object",
      properties: { text: { type: "string" } },
      required: ["text"],
    },
    handler: "exampleTool",
  });
  if (!result.ok) console.error("registration refused: " + result.reason);
}
