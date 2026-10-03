import { exampleTool } from "./handlers.ts";
import { makeContext } from "./testing.ts";

describe("exampleTool", () => {
  test("answers with the result", () => {
    const answer = exampleTool(makeContext({}, { text: "  x " }));
    expect(answer).toEqual({ result: "x" });
  });
});
