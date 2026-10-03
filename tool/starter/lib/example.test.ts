import { example } from "./example.ts";

describe("example", () => {
  test("trims", () => {
    expect(example("  x ")).toBe("x");
  });
});
