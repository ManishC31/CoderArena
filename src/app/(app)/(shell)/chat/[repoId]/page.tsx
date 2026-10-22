import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { siGithub } from "simple-icons";
import { BrandIcon } from "@/components/brand-icon";
import { ChatView } from "@/components/chat/chat-view";
import type { Citation } from "@/components/chat/types";
import { OpenInPlaygroundButton } from "@/components/github/open-in-playground-button";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

// Only the owner can open a repository's chat; anyone else gets a 404.
// Cached so generateMetadata and the page share one query per request.
const getRepository = cache(async (id: string) => {
  const { user } = await requireSession();
  return prisma.githubRepository.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      fullName: true,
      defaultBranch: true,
      indexStatus: true,
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true, citations: true },
      },
    },
  });
});

export async function generateMetadata({ params }: PageProps<"/chat/[repoId]">): Promise<Metadata> {
  const repo = await getRepository((await params).repoId);
  return { title: repo ? `Chat · ${repo.fullName}` : "Chat" };
}

export default async function RepositoryChatPage({ params }: PageProps<"/chat/[repoId]">) {
  const repo = await getRepository((await params).repoId);
  if (!repo) notFound();

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-4">
        <Button variant="ghost" size="icon" className="md:hidden" render={<Link href="/chat" />} nativeButton={false} aria-label="All chats">
          <ArrowLeft />
        </Button>
        <a
          href={`https://github.com/${repo.fullName}`}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 items-center gap-2 font-medium underline-offset-4 hover:underline"
        >
          <BrandIcon icon={siGithub} className="size-4" />
          <span className="truncate">{repo.fullName}</span>
        </a>
        <div className="ml-auto flex items-center gap-2">
          <OpenInPlaygroundButton fullName={repo.fullName} branch={repo.defaultBranch} />
        </div>
      </header>

      {repo.indexStatus === "indexed" ? (
        <ChatView
          key={repo.id}
          repositoryId={repo.id}
          repoName={repo.fullName}
          repoUrl={`https://github.com/${repo.fullName}/blob/${repo.defaultBranch}`}
          initialMessages={repo.messages.map((message) => ({
            ...message,
            citations: (message.citations ?? []) as Citation[],
          }))}
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <h2 className="font-medium">This repository isn&apos;t indexed yet.</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            {repo.indexStatus === "indexing"
              ? "Indexing is in progress. This page is ready once it finishes."
              : "Index it on the GitHub page, then come back to chat."}
          </p>
          <Button variant="outline" render={<Link href="/github" />} nativeButton={false}>
            Go to GitHub
          </Button>
        </div>
      )}
    </>
  );
}
