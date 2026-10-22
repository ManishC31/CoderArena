import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

type HistoryMessage = { role: "user" | "assistant"; content: string };

// Messages for the chat model: the rules and retrieved code, the recent conversation (so
// follow-up questions make sense), then the question.
export function buildChatMessages({
  repoName,
  context,
  history,
  question,
}: {
  repoName: string;
  context: string;
  history: HistoryMessage[];
  question: string;
}): ChatCompletionMessageParam[] {
  const systemPrompt = `You are CoderArena's repository assistant for the GitHub repo "${repoName}".

Your job: help a developer understand this codebase quickly and accurately.

Rules:
1. Ground every answer in the RETRIEVED CODE CONTEXT below. Do not invent files or APIs.
2. Cite paths with backticks when you mention code (example: \`src/lib/auth.ts\`).
3. Prefer short, scannable answers: a 1–2 sentence summary, then bullets or a small code block.
4. If context is incomplete, say what you can see and what file or area to check next.
5. Never claim you ran, tested, or deployed anything — you only read indexed snippets.
6. The UI shows a Sources list from retrieved chunks — make sure paths in your answer match those files.

--- RETRIEVED CODE CONTEXT ---
${context || "No matching code chunks were retrieved for this question."}
--- END CONTEXT ---`;

  return [
    { role: "system", content: systemPrompt },
    ...history.map(({ role, content }) => ({ role, content })),
    { role: "user", content: question },
  ];
}
