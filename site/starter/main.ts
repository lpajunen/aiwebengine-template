import { renderPage } from "./lib/page.ts";

// Handlers are top-level functions, named by string in init().
function home(context: HandlerContext): HttpResponse {
  const name = context.request?.query.name ?? "visitor";
  return ResponseBuilder.html(
    renderPage("__NAME__", `<p>Hello, ${name}. Replace this page.</p>`),
  );
}

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
