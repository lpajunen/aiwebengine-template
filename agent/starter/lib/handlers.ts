import instructions from "../skills/instructions.md";
import { buildRequest, readAnswer } from "./prompt.ts";

/** One model call. The key is never here: the engine fills in the secret. */
export function callAnthropic(request: unknown): unknown {
  const res = fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": "{{secret:ANTHROPIC_API_KEY}}",
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error(`Model answered ${res.status}`);
  return res.json();
}

/**
 * The route handler. `callModel` is a parameter so a test can pass a fake and
 * never reach the network; the engine calls it with the context alone.
 */
export function ask(
  context: HandlerContext,
  callModel: (request: unknown) => unknown = callAnthropic,
): HttpResponse {
  const req = context.request!;
  let body: { question?: string };
  try {
    body = req.json() as { question?: string };
  } catch {
    return ResponseBuilder.error(400, "Body must be JSON");
  }
  if (!body.question) return ResponseBuilder.error(400, "question is required");

  try {
    const answer = readAnswer(
      callModel(buildRequest(body.question, instructions)),
    );
    return ResponseBuilder.json({ answer });
  } catch (e) {
    return ResponseBuilder.error(
      502,
      e instanceof Error ? e.message : String(e),
    );
  }
}
