import { example } from "./lib/example.ts";

// An MCP tool's handler receives its arguments in context.args and returns
// plain data. Throw an Error for a failure the caller should see.
function exampleTool(context: HandlerContext) {
  const args = (context.args ?? {}) as { text?: string };
  return { result: example(String(args.text ?? "")) };
}

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
