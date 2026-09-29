import { cn } from "@/lib/utils";

// Languages algorithm problems can be solved in (design.md, section 19).
export const PROBLEM_LANGUAGES = ["JavaScript", "TypeScript", "Python"] as const;

type Props = {
  selected: (typeof PROBLEM_LANGUAGES)[number];
};

// The editor header's language tabs.
export function LanguageSwitcher({ selected }: Props) {
  return (
    <div className="flex gap-0.5 text-xs">
      {PROBLEM_LANGUAGES.map((language) => (
        <span
          key={language}
          className={cn("rounded px-2 py-1", language === selected ? "bg-(--ws-active) text-(--ws-fg)" : "text-(--ws-muted)")}
        >
          {language}
        </span>
      ))}
    </div>
  );
}
