"use server";

import { refresh } from "next/cache";
import { getGithubToken, listUserRepos } from "@/lib/github";
import { inngest } from "@/lib/inngest/client";
import type { IndexRepositoryEvent } from "@/lib/inngest/functions";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export type GithubActionResult = { error: string } | null;

// Saves every repository the signed-in user's GitHub account can reach, then re-renders the page.
export async function syncGithubRepositories(): Promise<GithubActionResult> {
  const { user } = await requireSession();
  const token = await getGithubToken(user.id).catch(() => null);
  if (!token) return { error: "Connect your GitHub account first." };

  let repos;
  try {
    repos = await listUserRepos(token);
  } catch (error) {
    console.error("Couldn't list GitHub repositories", error);
    return { error: "Couldn't reach GitHub. Reconnect your account if this keeps happening." };
  }

  await prisma.$transaction(
    repos.map((repo) => {
      const details = {
        fullName: repo.full_name,
        name: repo.name,
        owner: repo.owner.login,
        description: repo.description,
        defaultBranch: repo.default_branch,
        private: repo.private,
        pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
      };
      return prisma.githubRepository.upsert({
        where: { userId_githubId: { userId: user.id, githubId: repo.id } },
        create: { userId: user.id, githubId: repo.id, ...details },
        update: details,
      });
    }),
  );
  refresh();
  return null;
}

// Starts indexing one of the signed-in user's repositories for chat, in the background.
export async function startIndexing(repositoryId: string): Promise<GithubActionResult> {
  const { user } = await requireSession();
  if (typeof repositoryId !== "string") throw new Error("Invalid input");

  const repo = await prisma.githubRepository.findFirst({
    where: { id: repositoryId, userId: user.id },
    select: { indexStatus: true },
  });
  if (!repo) throw new Error("Repository not found");
  if (repo.indexStatus === "indexing") return null;
  if (!(await getGithubToken(user.id).catch(() => null))) return { error: "Connect your GitHub account first." };

  await prisma.githubRepository.update({ where: { id: repositoryId }, data: { indexStatus: "indexing" } });
  try {
    const data: IndexRepositoryEvent = { repositoryId, userId: user.id };
    await inngest.send({ name: "repo/index", data });
  } catch (error) {
    console.error("Couldn't queue indexing", error);
    await prisma.githubRepository.update({ where: { id: repositoryId }, data: { indexStatus: repo.indexStatus } });
    refresh();
    return { error: "Couldn't start indexing. Is the Inngest dev server running?" };
  }
  refresh();
  return null;
}

