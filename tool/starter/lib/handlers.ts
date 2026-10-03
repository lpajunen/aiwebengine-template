import { example } from "./example.ts";

// An MCP tool's handler receives its arguments in context.args and returns
// plain data. Throw an Error for a failure the caller should see. It lives
// here so a test can import it; main.ts registers it.
export function exampleTool(context: HandlerContext) {
  const args = (context.args ?? {}) as { text?: string };
  return { result: example(String(args.text ?? "")) };
}
