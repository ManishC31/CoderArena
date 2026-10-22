"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderGit2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  list: React.ReactNode;
  // Repositories in the list.
  count: number;
  children: React.ReactNode;
};

// The repository list beside the conversation. On phones only one shows: the list on /chat,
// the conversation once a repository is open.
export function ChatPane({ list, count, children }: Props) {
  const conversationOpen = usePathname() !== "/chat";

  return (
    <>
      <aside
        className={cn(
          "w-full flex-col border-r md:flex md:w-64 md:shrink-0",
          conversationOpen ? "hidden" : "flex",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
          <h1 className="font-semibold">Chat</h1>
          <Link
            href="/github"
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <FolderGit2 className="size-3.5" />
            Manage
          </Link>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {count > 0 ? (
            list
          ) : (
            <p className="px-2.5 py-2 text-sm text-muted-foreground">
              No indexed repositories yet. Index one on the{" "}
              <Link href="/github" className="font-medium text-foreground underline-offset-4 hover:underline">
                GitHub page
              </Link>
              .
            </p>
          )}
        </div>
      </aside>
      <section className={cn("min-w-0 flex-1 flex-col md:flex", conversationOpen ? "flex" : "hidden")}>
        {children}
      </section>
    </>
  );
}
