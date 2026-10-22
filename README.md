# CoderArena

Browser-based playgrounds that run in isolated sandboxes, your GitHub repositories, and an AI chat that answers questions about your code.

- **Playgrounds**: pick a template (React, Next.js, Vue, Angular, TypeScript, …), edit in the browser and preview it running in a Docker + gVisor sandbox.
- **GitHub** (`/github`): connect your account, sync your repositories, open any of them in a playground. Public repositories can also be imported by URL from the dashboard without connecting.
- **Chat** (`/chat`): index a repository, then ask how its code works. Answers cite the files they come from.

## Stack

- Next.js (App Router), Tailwind CSS, shadcn/ui (Base UI)
- Better Auth: email & password or GitHub (an email account can link GitHub later)
- PostgreSQL with Prisma for everything: users, playgrounds, synced repositories, chat history
- Inngest for background indexing; OpenAI embeddings and answers; Pinecone for vectors
- Docker + gVisor sandboxes (see `sandbox/README.md`)

## Setup

1. Copy `.env.example` to `.env` and fill it in. You need:
   - `DATABASE_URL`: a PostgreSQL database
   - `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL`
   - `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: a GitHub OAuth app whose callback URL is `{BETTER_AUTH_URL}/api/auth/callback/github`
   - `OPENAI_API_KEY`, `PINECONE_API_KEY`, `PINECONE_INDEX`: the Pinecone index must use **512 dimensions**
2. Install and migrate:

   ```bash
   npm install
   npm run db:migrate
   ```

3. For playground previews, start the sandbox host and build its images (see `sandbox/README.md`):

   ```bash
   npm run sandbox:host
   npm run sandbox:build
   ```

## Run

```bash
npm run dev
npx inngest-cli@latest dev   # in a second terminal, for repository indexing
```

Open http://localhost:3000.

## How the GitHub pieces fit

| What | Where |
| --- | --- |
| GitHub token lookup, repository listing | `src/lib/github.ts` |
| Repository → playground import (tarball download, template detection) | `src/lib/github-import.ts`, `importRepository` in `src/app/(app)/playground/actions.ts` |
| Sync and indexing actions | `src/app/(app)/(shell)/github/actions.ts` |
| Indexing job (GitHub → chunks → OpenAI embeddings → Pinecone) | `src/lib/inngest/functions.ts` |
| Chat endpoint (retrieval + streamed answer) | `src/app/api/chat/route.ts`, prompt in `src/lib/ai/prompt.ts` |

Imported playgrounds hold up to 200 text files (lockfiles, binaries and build output are left out), and the sandbox picks its template from the repository's `package.json`.
