"use client";

import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import "streamdown/styles.css";

// An assistant answer, rendered as Markdown as it streams in.
export function ChatMarkdown({ content, isAnimating = false }: { content: string; isAnimating?: boolean }) {
  return (
    <Streamdown
      mode={isAnimating ? undefined : "static"}
      plugins={{ code }}
      isAnimating={isAnimating}
      className="text-sm leading-relaxed [&_p]:my-2 [&_pre]:my-3 [&_pre]:overflow-x-auto"
    >
      {content}
    </Streamdown>
  );
}
