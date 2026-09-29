import { Check, GitBranch, Search } from "lucide-react";
import { siGithub } from "simple-icons";
import { BrandIcon } from "@/components/brand-icon";
import { cn } from "@/lib/utils";

// The "Import from GitHub" dialog with a repository picked.

const repositories = [
  { name: "awesome-next-app", visibility: "Public", branch: "main", updated: "2 hours ago", selected: true },
  { name: "interview-prep", visibility: "Private", branch: "main", updated: "yesterday" },
  { name: "portfolio", visibility: "Public", branch: "main", updated: "3 days ago" },
  { name: "my-project", visibility: "Private", branch: "develop", updated: "last week" },
];

export function GitHubImportDialog() {
  return (
    <div
      role="img"
      aria-label="Import from GitHub dialog with the awesome-next-app repository selected"
      className="overflow-hidden rounded-xl border bg-card text-sm shadow-xl shadow-black/5 select-none dark:shadow-black/40"
    >
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <BrandIcon icon={siGithub} className="size-4" />
        <span className="font-medium">Import from GitHub</span>
        <span className="ml-auto font-mono text-xs text-muted-foreground">mira-dev</span>
      </div>
      <div className="p-3">
        <div className="flex h-8 items-center gap-2 rounded-md border bg-background px-2.5 text-muted-foreground dark:bg-input/30">
          <Search className="size-3.5" />
          <span className="text-xs">Search repositories…</span>
        </div>
        <ul className="mt-2 space-y-1">
          {repositories.map(({ name, visibility, branch, updated, selected }) => (
            <li
              key={name}
              className={cn(
                "flex items-center gap-3 rounded-md border px-3 py-2",
                selected ? "border-brand/40 bg-brand/10" : "border-transparent",
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate font-mono text-[13px] font-medium">{name}</span>
                  <span className="rounded-full border px-1.5 text-[10px] text-muted-foreground">{visibility}</span>
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <GitBranch className="size-3" />
                  {branch} · Updated {updated}
                </span>
              </span>
              {selected && <Check className="size-4 text-brand" />}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-end gap-2 border-t px-4 py-3 text-xs">
        <span className="rounded-md border px-2.5 py-1">Cancel</span>
        <span className="rounded-md bg-primary px-2.5 py-1 font-medium text-primary-foreground">Import</span>
      </div>
    </div>
  );
}
