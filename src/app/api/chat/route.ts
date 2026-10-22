import type { NextRequest } from "next/server";
import type { Citation } from "@/components/chat/types";
import { auth } from "@/lib/auth";
import { buildChatMessages } from "@/lib/ai/prompt";
import { CHAT_MODEL, embedTexts, getOpenAI } from "@/lib/ai/openai";
import { getCodeIndex, pineconeNamespace } from "@/lib/ai/pinecone";
import { prisma } from "@/lib/prisma";

const MAX_MESSAGE_LENGTH = 4_000;
// Earlier messages sent with each question, so follow-ups make sense.
const HISTORY_MESSAGES = 6;
const TOP_K = 8;

// Answers a question about one of the signed-in user's indexed repositories. Streams the
// answer as plain text; the files it drew on come in the X-Citations header.
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const body = await request.json().catch(() => null);
  const repositoryId = body?.repositoryId;
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (typeof repositoryId !== "string" || !message || message.length > MAX_MESSAGE_LENGTH) {
    return new Response("Invalid request", { status: 400 });
  }

  const repo = await prisma.githubRepository.findFirst({
    where: { id: repositoryId, userId: session.user.id },
    select: { fullName: true, indexStatus: true },
  });
  if (!repo) return new Response("Repository not found", { status: 404 });
  if (repo.indexStatus !== "indexed") return new Response("Repository isn't indexed", { status: 400 });

  const history = await prisma.repoChatMessage.findMany({
    where: { repositoryId },
    orderBy: { createdAt: "desc" },
    take: HISTORY_MESSAGES,
    select: { role: true, content: true },
  });
  await prisma.repoChatMessage.create({ data: { repositoryId, role: "user", content: message } });

  const [queryEmbedding] = await embedTexts([message]);
  const results = await getCodeIndex().query({
    namespace: pineconeNamespace(repositoryId),
    vector: queryEmbedding,
    topK: TOP_K,
    includeMetadata: true,
  });
  const matches = results.matches.filter((match) => match.metadata);
  const citations = getCitations(matches.map((match) => match.metadata!));
  const context = matches.map(({ metadata }) => `[${metadata!.path}]\n${metadata!.content}`).join("\n\n");

  const stream = await getOpenAI().chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0.2,
    stream: true,
    messages: buildChatMessages({ repoName: repo.fullName, context, history: history.reverse(), question: message }),
  });

  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      async start(controller) {
        let reply = "";
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) {
              reply += text;
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (error) {
          console.error("Repository chat stream failed", error);
        }
        // Saved even when the stream broke off, so the conversation shows what was said.
        if (reply) {
          await prisma.repoChatMessage.create({ data: { repositoryId, role: "assistant", content: reply, citations } });
        }
        controller.close();
      },
      cancel() {
        stream.controller.abort();
      },
    }),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Citations": encodeURIComponent(JSON.stringify(citations)),
      },
    },
  );
}

// One citation per file, in the order retrieval ranked them.
function getCitations(matches: { path: string; chunk: number }[]): Citation[] {
  const seen = new Set<string>();
  return matches.flatMap(({ path, chunk }) => {
    if (seen.has(path)) return [];
    seen.add(path);
    return [{ path, chunk: Number(chunk) }];
  });
}
