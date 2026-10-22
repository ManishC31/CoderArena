import { prisma } from "@/lib/prisma";
import { embedTexts } from "@/lib/ai/openai";
import { getCodeIndex, pineconeNamespace } from "@/lib/ai/pinecone";
import { getGithubToken, githubClient } from "@/lib/github";
import { inngest } from "./client";

// Indexes a repository for chat: reads its code from GitHub, splits it into chunks, embeds
// them with OpenAI and stores them in Pinecone. Sent by startIndexing() in
// src/app/(app)/(shell)/github/actions.ts.

const CODE_EXTENSIONS = [
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".vue", ".py", ".go", ".rs", ".java", ".rb", ".php",
  ".md", ".json", ".css", ".scss", ".html", ".prisma", ".sql", ".yml", ".yaml", ".sh",
];
const SKIP_DIRS = ["node_modules", ".next", "dist", "build", ".git", "coverage", "vendor"];
const SKIP_FILES = ["package-lock.json", "npm-shrinkwrap.json", "pnpm-lock.yaml", "yarn.lock"];
const MAX_FILE_SIZE = 100_000;
const CHUNK_SIZE = 2_000;
// Files fetched per step, and chunks per OpenAI / Pinecone request.
const FILES_PER_STEP = 20;
const CHUNKS_PER_REQUEST = 100;

export type IndexRepositoryEvent = { repositoryId: string; userId: string };

function chunkText(text: string) {
  const chunks = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE) chunks.push(text.slice(i, i + CHUNK_SIZE));
  return chunks;
}

function shouldIndex(path: string, size: number) {
  const name = path.split("/").pop() ?? "";
  return (
    size < MAX_FILE_SIZE &&
    CODE_EXTENSIONS.some((ext) => name.endsWith(ext)) &&
    !SKIP_FILES.includes(name) &&
    !SKIP_DIRS.some((dir) => path.startsWith(`${dir}/`) || path.includes(`/${dir}/`))
  );
}

// The token is looked up in each step rather than passed along, so it never ends up in
// Inngest's event or step history.
async function requireToken(userId: string) {
  const token = await getGithubToken(userId);
  if (!token) throw new Error("GitHub isn't connected");
  return token;
}

export const indexRepository = inngest.createFunction(
  {
    id: "index-repository",
    triggers: { event: "repo/index" },
    onFailure: async ({ event }) => {
      const { repositoryId } = event.data.event.data as IndexRepositoryEvent;
      await prisma.githubRepository.updateMany({ where: { id: repositoryId }, data: { indexStatus: "failed" } });
    },
  },
  async ({ event, step }) => {
    const { repositoryId, userId } = event.data as IndexRepositoryEvent;

    const repo = await step.run("load-repository", () =>
      prisma.githubRepository.findFirst({
        where: { id: repositoryId, userId },
        select: { owner: true, name: true, fullName: true, defaultBranch: true },
      }),
    );
    if (!repo) return { error: "Repository not found" };

    const files = await step.run("fetch-file-list", async () => {
      const octokit = githubClient(await requireToken(userId));
      const { data: tree } = await octokit.rest.git.getTree({
        owner: repo.owner,
        repo: repo.name,
        tree_sha: repo.defaultBranch,
        recursive: "true",
      });
      return tree.tree
        .filter((item) => item.type === "blob" && item.path && item.sha && shouldIndex(item.path, item.size ?? 0))
        .map((item) => ({ path: item.path!, sha: item.sha! }));
    });

    // Re-indexing starts clean, so deleted files don't keep answering questions.
    await step.run("clear-previous-index", async () => {
      try {
        await getCodeIndex().deleteAll({ namespace: pineconeNamespace(repositoryId) });
      } catch (error) {
        // A repository that was never indexed has no namespace yet.
        if (!/not ?found|404/i.test(String(error))) throw error;
      }
    });

    let indexedChunks = 0;
    for (let i = 0; i < files.length; i += FILES_PER_STEP) {
      const batch = files.slice(i, i + FILES_PER_STEP);

      indexedChunks += await step.run(`index-batch-${i}`, async () => {
        const octokit = githubClient(await requireToken(userId));
        const contents = await Promise.all(
          batch.map(async ({ path, sha }) => {
            const { data } = await octokit.rest.git.getBlob({ owner: repo.owner, repo: repo.name, file_sha: sha });
            return { path, content: Buffer.from(data.content, "base64").toString("utf8") };
          }),
        );

        const chunks = contents.flatMap(({ path, content }) =>
          chunkText(content).map((text, chunk) => ({ path, chunk, text })),
        );

        for (let start = 0; start < chunks.length; start += CHUNKS_PER_REQUEST) {
          const group = chunks.slice(start, start + CHUNKS_PER_REQUEST);
          const embeddings = await embedTexts(group.map(({ text }) => text));
          await getCodeIndex().upsert({
            namespace: pineconeNamespace(repositoryId),
            records: group.map(({ path, chunk, text }, j) => ({
              id: `${path}#${chunk}`,
              values: embeddings[j],
              metadata: { path, chunk, content: text.slice(0, 1_000) },
            })),
          });
        }
        return chunks.length;
      });
    }

    await step.run("mark-indexed", () =>
      prisma.githubRepository.updateMany({
        where: { id: repositoryId },
        data: { indexStatus: "indexed", indexedAt: new Date(), fileCount: files.length },
      }),
    );

    return { repositoryId, fullName: repo.fullName, files: files.length, chunks: indexedChunks };
  },
);
