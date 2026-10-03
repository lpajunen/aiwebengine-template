import { buildRequest, readAnswer } from "./prompt.ts";

describe("prompt", () => {
  test("the question is the user's message and the instructions are the system prompt", () => {
    const request = buildRequest("Why?", "Be brief.");
    expect(request.system).toBe("Be brief.");
    expect(request.messages[0].content).toBe("Why?");
  });
  test("reads the first text block", () => {
    expect(readAnswer({ content: [{ type: "text", text: "Because." }] })).toBe(
      "Because.",
    );
  });
  test("an answer with no text is an error", () => {
    expect(() => readAnswer({ content: [] })).toThrow();
  });
});
