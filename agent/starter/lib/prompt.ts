/** The request for one model call: the instructions, then the question. */
export function buildRequest(question: string, instructions: string) {
  return {
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: instructions,
    messages: [{ role: "user", content: question }],
  };
}

/** The text of the model's answer, or an Error when there is none. */
export function readAnswer(response: unknown): string {
  const content = (response as { content?: { type: string; text?: string }[] })
    ?.content;
  const text = content?.find((block) => block.type === "text")?.text;
  if (!text) throw new Error("The model's answer had no text");
  return text;
}
