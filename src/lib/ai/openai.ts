import "server-only";
import OpenAI from "openai";

// Model that answers repository chat questions.
export const CHAT_MODEL = "gpt-4o-mini";

// The Pinecone index must use this many dimensions.
const EMBEDDING_DIMENSIONS = 512;

let client: OpenAI | undefined;

// Created on first use, so a missing OPENAI_API_KEY only fails the features that need it.
export function getOpenAI() {
  return (client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));
}

export async function embedTexts(texts: string[]) {
  const response = await getOpenAI().embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
    dimensions: EMBEDDING_DIMENSIONS,
  });
  return response.data.map((item) => item.embedding);
}
