import { FileCode } from "lucide-react";
import type { Citation } from "@/components/chat/types";

// The files an answer drew on, linked to the repository on GitHub.
export function ChatCitations({ citations, repoUrl }: { citations: Citation[]; repoUrl: string }) {
  if (citations.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t pt-2">
      <span className="text-xs text-muted-foreground">Sources:</span>
      {citations.map(({ path }) => (
        <a
          key={path}
          href={`${repoUrl}/${path.split("/").map(encodeURIComponent).join("/")}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-full items-center gap-1 rounded-md border bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground hover:text-foreground"
        >
          <FileCode className="size-3 shrink-0" />
          <span className="truncate">{path}</span>
        </a>
      ))}
    </div>
  );
}
