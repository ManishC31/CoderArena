import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Chat",
};

// Shown beside the repository list (desktop) until a repository is picked.
export default function ChatPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <MessagesSquare className="size-5" />
      </span>
      <h2 className="font-medium">Chat with your repositories</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Pick an indexed repository to ask how its code works. Answers cite the files they come from.
      </p>
    </div>
  );
}
