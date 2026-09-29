import type { Token } from "@/components/landing/mockups/syntax";
import { cn } from "@/lib/utils";

type Props = {
  lines: Token[][];
  // Line the cursor is on, highlighted like the editor's current line.
  current?: number;
  className?: string;
};

// Syntax-highlighted code with a line-number gutter. Rows are 1.25rem tall after 0.5rem of
// padding, so overlays can line up with them. Long lines are clipped, as in the editor.
export function CodeLines({ lines, current, className }: Props) {
  return (
    <pre className={cn("overflow-hidden py-2 font-mono text-[12.5px] leading-5", className)}>
      {lines.map((line, index) => (
        <div key={index} className={cn("flex", index + 1 === current && "bg-black/4 dark:bg-white/4")}>
          <span className="w-10 shrink-0 pr-4 text-right text-[#237893] dark:text-[#858585]">{index + 1}</span>
          <code className="whitespace-pre text-black dark:text-[#d4d4d4]">
            {line.map((token, tokenIndex) =>
              typeof token === "string" ? (
                token
              ) : (
                <span key={tokenIndex} className={token[1]}>
                  {token[0]}
                </span>
              ),
            )}
          </code>
        </div>
      ))}
    </pre>
  );
}
