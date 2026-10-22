import Link from "next/link";
import { Clock, GitBranch, Lock, MessagesSquare } from "lucide-react";
import { siGithub } from "simple-icons";
import { BrandIcon } from "@/components/brand-icon";
import { IndexRepositoryButton } from "@/components/github/index-repository-button";
import { IndexStatusBadge } from "@/components/github/index-status-badge";
import { OpenInPlaygroundButton } from "@/components/github/open-in-playground-button";
import type { RepositorySummary } from "@/components/github/types";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/relative-time";

export function RepositoryCard({ repo }: { repo: RepositorySummary }) {
  return (
    <li className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
          <BrandIcon icon={siGithub} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-medium">
              <a
                href={`https://github.com/${repo.fullName}`}
                target="_blank"
                rel="noreferrer"
                className="underline-offset-4 hover:underline"
              >
                {repo.fullName}
              </a>
            </h3>
            <IndexStatusBadge status={repo.indexStatus} fileCount={repo.fileCount} />
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {repo.private && <Lock className="size-3" />}
              {repo.private ? "Private" : "Public"}
            </span>
            <span className="flex items-center gap-1">
              <GitBranch className="size-3" />
              {repo.defaultBranch}
            </span>
            {repo.pushedAt && (
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                Updated{" "}
                <time dateTime={repo.pushedAt.toISOString()} suppressHydrationWarning>
                  {formatRelativeTime(repo.pushedAt)}
                </time>
              </span>
            )}
          </p>
        </div>
      </div>

      {repo.description && <p className="line-clamp-2 text-sm text-muted-foreground">{repo.description}</p>}

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <OpenInPlaygroundButton fullName={repo.fullName} branch={repo.defaultBranch} />
        {repo.indexStatus === "indexed" && (
          <Button size="sm" render={<Link href={`/chat/${repo.id}`} />} nativeButton={false}>
            <MessagesSquare />
            Chat
          </Button>
        )}
        <IndexRepositoryButton repositoryId={repo.id} status={repo.indexStatus} />
      </div>
    </li>
  );
}
