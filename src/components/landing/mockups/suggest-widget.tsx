import { Box } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  // Letters typed so far, highlighted at the start of each suggestion.
  prefix: string;
  suggestions: string[];
  selected: string;
  // Signature shown next to the selected suggestion.
  detail: string;
  className?: string;
  style?: React.CSSProperties;
};

// Monaco's IntelliSense list, in the Light+ / Dark+ colors.
export function SuggestWidget({ prefix, suggestions, selected, detail, className, style }: Props) {
  return (
    <div
      style={style}
      className={cn(
        "w-72 overflow-hidden rounded-sm border border-[#c8c8c8] bg-[#f8f8f8] py-0.5 font-mono text-[12.5px] shadow-lg shadow-black/15 dark:border-[#454545] dark:bg-[#252526] dark:shadow-black/50",
        className,
      )}
    >
      {suggestions.map((name) => {
        const active = name === selected;
        return (
          <div
            key={name}
            className={cn(
              "flex h-5.5 items-center gap-2 px-2 leading-none",
              active && "bg-[#0060c0] text-white dark:bg-[#04395e]",
            )}
          >
            <Box className={cn("size-3.5 shrink-0", active ? "text-white dark:text-[#b180d7]" : "text-[#652d90] dark:text-[#b180d7]")} />
            <span>
              <span className={cn("font-semibold", active ? "text-white dark:text-[#18a3ff]" : "text-[#0066bf] dark:text-[#18a3ff]")}>
                {prefix}
              </span>
              {name.slice(prefix.length)}
            </span>
            {active && <span className="ml-auto truncate pl-3 text-[11px] opacity-70">{detail}</span>}
          </div>
        );
      })}
    </div>
  );
}
