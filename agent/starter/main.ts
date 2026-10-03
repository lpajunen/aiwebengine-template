import instructions from "./skills/instructions.md";
import { buildRequest, readAnswer } from "./lib/prompt.ts";

function ask(context: HandlerContext): HttpResponse {
  const req = context.request!;
  let body: { question?: string };
  try {
    body = req.json() as { question?: string };
  } catch {
    return ResponseBuilder.error(400, "Body must be JSON");
  }
  if (!body.question) return ResponseBuilder.error(400, "question is required");

  // One model call. The key never appears here: the engine substitutes
  // {{secret:ANTHROPIC_API_KEY}} for whoever is calling.
  const res = fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": "{{secret:ANTHROPIC_API_KEY}}",
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(buildRequest(body.question, instructions)),
  });
  if (!res.ok)
    return ResponseBuilder.error(502, `Model answered ${res.status}`);
  return ResponseBuilder.json({ answer: readAnswer(res.json()) });
}

function init(): void {
  const result = routeRegistry.registerRoute("/__NAME__/ask", {
    handler: "ask",
    method: "POST",
  });
  if (!result.ok) console.error("registration refused: " + result.reason);
}
