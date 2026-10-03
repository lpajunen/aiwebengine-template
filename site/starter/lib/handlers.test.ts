import { home } from "./handlers.ts";
import { makeContext } from "./testing.ts";

describe("home", () => {
  test("answers 200 with the page", () => {
    const response = home(makeContext({ query: { name: "Ada" } }));
    expect(response.status).toBe(200);
    expect(response.body).toContain("Hello, Ada");
  });
});
