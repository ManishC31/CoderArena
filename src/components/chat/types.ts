// A file an answer drew on, from the retrieved code chunks.
export type Citation = { path: string; chunk: number };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations: Citation[];
};
