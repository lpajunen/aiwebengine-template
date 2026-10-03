/**
 * A request context a test can hand to a handler.
 *
 * Handlers live in lib/handlers.ts so a test can import them; this builds the
 * `context` the engine would have passed. Every field is optional.
 *
 *   const response = home(makeContext({ query: { name: "Ada" } }));
 *   expect(response.status).toBe(200);
 */
export function makeContext(
  request: {
    method?: string;
    path?: string;
    query?: Record<string, string>;
    params?: Record<string, string>;
    headers?: Record<string, string>;
    json?: unknown;
    form?: Record<string, string>;
    userId?: string;
  } = {},
  args?: Record<string, unknown>,
) {
  const body = request.json === undefined ? "" : JSON.stringify(request.json);
  const headers: Record<string, string> = {};
  for (const key of Object.keys(request.headers ?? {})) {
    headers[key.toLowerCase()] = (request.headers ?? {})[key];
  }
  return {
    args: args ?? {},
    request: {
      method: request.method ?? "GET",
      path: request.path ?? "/",
      query: request.query ?? {},
      params: request.params ?? {},
      headers: Object.assign({}, headers, {
        get: (name: string) => headers[name.toLowerCase()] ?? null,
      }),
      form: request.form ?? {},
      body: body,
      text: () => body,
      // Throws on a body that is not JSON, as the engine's does.
      json: () => JSON.parse(body),
      auth: {
        isAuthenticated: request.userId !== undefined,
        userId: request.userId ?? null,
      },
    },
  };
}

/** A handler's JSON answer, read back: the status and the parsed body. */
export function readJson(response: { status: number; body?: string }) {
  return { status: response.status, body: JSON.parse(response.body ?? "null") };
}
