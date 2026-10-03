import { escapeHtml, renderPage } from "./page.ts";

describe("page", () => {
  test("escapes markup in text", () => {
    expect(escapeHtml("<b>&</b>")).toBe("&lt;b&gt;&amp;&lt;/b&gt;");
  });
  test("a page carries its title and body", () => {
    const html = renderPage("Hi <you>", "<p>x</p>");
    expect(html).toContain("<title>Hi &lt;you&gt;</title>");
    expect(html).toContain("<p>x</p>");
  });
});
