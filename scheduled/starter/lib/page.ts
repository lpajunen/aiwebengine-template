/** Escape text for HTML, so a visitor's words cannot become markup. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** A whole page. `body` is HTML the caller has already made safe. */
export function renderPage(title: string, body: string): string {
  return (
    "<!doctype html><html><head><meta charset=utf-8>" +
    `<meta name=viewport content="width=device-width, initial-scale=1">` +
    `<title>${escapeHtml(title)}</title>` +
    `<link rel=stylesheet href="/__NAME__/style.css"></head>` +
    `<body><h1>${escapeHtml(title)}</h1>${body}</body></html>`
  );
}
