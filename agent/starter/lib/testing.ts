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
  const user =
    request.userId === undefined
      ? null
      : {
          id: request.userId,
          email: null,
          name: null,
          provider: null,
          isAuthenticated: true,
        };
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
      searchParams: new URLSearchParams(request.query ?? {}),
      params: request.params ?? {},
      headers: Object.assign(new Headers(headers), headers),
      form: request.form ?? {},
      files: [],
      body: body,
      text: () => body,
      // Throws on a body that is not JSON, as the engine's does.
      json: () => JSON.parse(body),
      auth: {
        isAuthenticated: user !== null,
        isAdmin: false,
        isEditor: false,
        userId: user?.id ?? null,
        userEmail: null,
        userName: null,
        provider: null,
        user,
        requireAuth() {
          if (user === null) {
            throw new Error(
              "Authentication required. Please login to access this resource.",
            );
          }
          return user;
        },
      },
    },
  };
}

/** A handler's JSON answer, read back: the status and the parsed body. */
export function readJson(response: { status: number; body?: string }) {
  return { status: response.status, body: JSON.parse(response.body ?? "null") };
}
