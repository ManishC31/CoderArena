import { ChatPane } from "@/components/chat/chat-pane";
import { ChatRepoList } from "@/components/chat/chat-repo-list";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

// Chat with your repositories: the indexed ones on the left, the open conversation on the right.
// Fills the screen below the mobile header, so the conversation scrolls on its own.
export default async function ChatLayout({ children }: LayoutProps<"/chat">) {
  const { user } = await requireSession();
  const repos = await prisma.githubRepository.findMany({
    where: { userId: user.id, indexStatus: { in: ["indexed", "indexing"] } },
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true, private: true, indexStatus: true },
  });

  return (
    <div className="flex h-[calc(100svh-3.5rem)] min-h-0 md:h-svh">
      <ChatPane list={<ChatRepoList repos={repos} />} count={repos.length}>
        {children}
      </ChatPane>
    </div>
  );
}
