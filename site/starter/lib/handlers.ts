import { renderPage } from "./page.ts";

// Handlers live here, not in main.ts, so a test can import and call them.
// main.ts registers them; see the note there.

export function home(context: HandlerContext): HttpResponse {
  const name = context.request?.query.name ?? "visitor";
  return ResponseBuilder.html(
    renderPage("__NAME__", `<p>Hello, ${name}. Replace this page.</p>`),
  );
}
