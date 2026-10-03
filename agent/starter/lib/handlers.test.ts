import { ask } from "./handlers.ts";
import { makeContext, readJson } from "./testing.ts";

const fakeModel = () => ({ content: [{ type: "text", text: "Because." }] });

describe("ask", () => {
  test("a question gets the model's answer", () => {
    const response = ask(
      makeContext({ method: "POST", json: { question: "Why?" } }),
      fakeModel,
    );
    expect(readJson(response)).toEqual({
      status: 200,
      body: { answer: "Because." },
    });
  });
  test("a body with no question is a 400", () => {
    const response = ask(makeContext({ method: "POST", json: {} }), fakeModel);
    expect(response.status).toBe(400);
  });
  test("a body that is not JSON is a 400", () => {
    const context = makeContext({ method: "POST" });
    context.request.json = () => {
      throw new Error("not json");
    };
    expect(ask(context, fakeModel).status).toBe(400);
  });
  test("a model failure is a 502, not a crash", () => {
    const response = ask(makeContext({ json: { question: "Why?" } }), () => {
      throw new Error("down");
    });
    expect(response.status).toBe(502);
  });
});
