import type { Metadata } from "next";
import { FolderGit2, MessagesSquare, Plus } from "lucide-react";
import { siGithub } from "simple-icons";
import { BrandIcon } from "@/components/brand-icon";
import { OpenRepositoryDialog } from "@/components/dashboard/open-repository-dialog";
import { ConnectGithubButton } from "@/components/github/connect-github-button";
import { RepositoryBrowser } from "@/components/github/repository-browser";
import { SyncButton } from "@/components/github/sync-button";
import { repositorySummarySelect } from "@/components/github/types";
import { Button } from "@/components/ui/button";
import type { Prisma } from "@/generated/prisma/client";
import { getGithubAccount, getGithubLogin, getGithubToken } from "@/lib/github";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "GitHub",
};

// Repository cards per page.
const PAGE_SIZE = 12;

export default async function GithubPage({ searchParams }: PageProps<"/github">) {
  const { user } = await requireSession();
  const account = await getGithubAccount(user.id);

  if (!account) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold tracking-tight">GitHub</h1>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center">
          <span className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <BrandIcon icon={siGithub} className="size-5" />
          </span>
          <h2 className="font-medium">Connect GitHub to work with your repositories.</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Open any of your repositories, private ones included, in a sandboxed playground, and index them to ask
            questions about the code in Chat.
          </p>
          <div className="mt-2 flex flex-col items-center gap-1">
            <ConnectGithubButton />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Public repositories can be imported without connecting.</p>
        </div>
      </div>
    );
  }

  const { q, page: pageParam } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 100) : "";
  // Matches the name ("owner/name") or the description, ignoring case.
  const where: Prisma.GithubRepositoryWhereInput = {
    userId: user.id,
    ...(query && {
      OR: [
        { fullName: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    }),
  };

  const token = await getGithubToken(user.id).catch(() => null);
  const [login, total] = await Promise.all([
    token ? getGithubLogin(token) : null,
    prisma.githubRepository.count({ where }),
  ]);
  // Out-of-range pages (e.g. after a sync shrank the list) show the nearest one.
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(Number.parseInt(String(pageParam), 10) || 1, 1), pageCount);
  const repos = await prisma.githubRepository.findMany({
    where,
    orderBy: [{ pushedAt: { sort: "desc", nulls: "last" } }, { fullName: "asc" }, { id: "asc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: repositorySummarySelect,
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">GitHub</h1>
          <p className="mt-1 text-muted-foreground">
            {login ? (
              <>
                Connected as <span className="font-medium text-foreground">@{login}</span>
              </>
            ) : (
              "Your GitHub connection stopped working. Reconnect to keep syncing."
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-2">
          {!login && <ConnectGithubButton label="Reconnect GitHub" variant="outline" />}
          <OpenRepositoryDialog
            trigger={
              <Button variant="outline">
                <Plus />
                Import by URL
              </Button>
            }
          />
          {login && <SyncButton variant={total > 0 || query ? "outline" : "default"} />}
        </div>
      </header>

      <div className="mt-8">
        {total > 0 || query ? (
          <RepositoryBrowser
            repos={repos}
            query={query}
            page={page}
            pageCount={pageCount}
            pageSize={PAGE_SIZE}
            total={total}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center">
            <span className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <FolderGit2 className="size-5" />
            </span>
            <h2 className="font-medium">No repositories yet.</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Sync to list your repositories. Then open one in a playground, or index it and ask about it in{" "}
              <MessagesSquare className="inline size-3.5" /> Chat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
