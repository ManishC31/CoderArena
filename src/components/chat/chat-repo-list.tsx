"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LoaderCircle, Lock } from "lucide-react";
import type { RepositorySummary } from "@/components/github/types";
import { cn } from "@/lib/utils";

type ChatRepo = Pick<RepositorySummary, "id" | "fullName" | "private" | "indexStatus">;

// The repositories you can chat with, highlighted when open. Indexing ones are listed but
// not clickable yet.
export function ChatRepoList({ repos }: { repos: ChatRepo[] }) {
  const pathname = usePathname();

  return (
    <ul className="grid gap-0.5">
      {repos.map((repo) => {
        const href = `/chat/${repo.id}`;
        const active = pathname === href;
        const [owner, name] = repo.fullName.split("/");
        const content = (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">{name}</span>
              <span className="block truncate text-xs text-muted-foreground">{owner}</span>
            </span>
            {repo.indexStatus === "indexing" ? (
              <LoaderCircle className="size-3.5 animate-spin text-muted-foreground" aria-label="Indexing" />
            ) : (
              repo.private && <Lock className="size-3 text-muted-foreground" aria-label="Private" />
            )}
          </>
        );

        return (
          <li key={repo.id}>
            {repo.indexStatus === "indexed" ? (
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-1.5 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
                  active && "bg-muted font-medium",
                )}
              >
                {content}
              </Link>
            ) : (
              <div className="flex items-center gap-2 rounded-md px-2.5 py-1.5 opacity-60" title="Indexing…">
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
