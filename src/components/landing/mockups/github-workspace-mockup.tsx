import { GitBranch, Upload } from "lucide-react";
import { siGithub } from "simple-icons";
import { BrandIcon } from "@/components/brand-icon";
import { CodeLines } from "@/components/landing/mockups/code-lines";
import { ExplorerTree, type TreeItem } from "@/components/landing/mockups/explorer-tree";
import { MockWindow } from "@/components/landing/mockups/mock-window";
import { PanelLabel } from "@/components/landing/mockups/panel-label";
import { tokens, type Token } from "@/components/landing/mockups/syntax";
import { cn } from "@/lib/utils";

// An imported repository open in the workspace, with edits ready to push.

const { c, f, k, t, v, s, tag, b } = tokens;

const files: TreeItem[] = [
  { path: "app", depth: 0, folder: true },
  { path: "app/layout.tsx", depth: 1 },
  { path: "app/page.tsx", depth: 1, active: true, status: "M" },
  { path: "components", depth: 0, folder: true },
  { path: "components/repo-card.tsx", depth: 1 },
  { path: "lib", depth: 0, folder: true },
  { path: "lib/github.ts", depth: 1, status: "M" },
  { path: "package.json", depth: 0 },
  { path: "README.md", depth: 0 },
];

const code: Token[][] = [
  [c("import"), " { ", v("RepoCard"), " } ", c("from"), " ", s('"@/components/repo-card"'), ";"],
  [c("import"), " { ", v("getRepos"), " } ", c("from"), " ", s('"@/lib/github"'), ";"],
  [],
  [c("export"), " ", c("default"), " ", k("async"), " ", k("function"), " ", f("Home"), "() {"],
  ["  ", k("const"), " ", v("repos"), " = ", c("await"), " ", f("getRepos"), "(", s('"mira-dev"'), ");"],
  [],
  ["  ", c("return"), " ("],
  ["    ", b("<"), tag("main"), " ", v("className"), "=", s('"grid gap-4 p-8"'), b(">")],
  ["      ", k("{"), v("repos"), ".", f("map"), "((", v("repo"), ") ", k("=>"), " ("],
  ["        ", b("<"), t("RepoCard"), " ", v("key"), "=", k("{"), v("repo"), ".", v("id"), k("}"), " ", v("repo"), "=", k("{"), v("repo"), k("}"), " ", b("/>")],
  ["      ))", k("}")],
  ["    ", b("</"), tag("main"), b(">")],
  ["  );"],
  ["}"],
];

// Lines edited since the import, marked in the gutter as in VS Code.
const added = "bg-[#48985d] dark:bg-[#487e02]";
const modified = "bg-[#2090d3] dark:bg-[#1b81a8]";
const changedLines = [
  { line: 2, className: added },
  { line: 5, className: modified },
  { line: 9, className: modified },
  { line: 10, className: modified },
  { line: 11, className: modified },
];

export function GitHubWorkspaceMockup() {
  return (
    <MockWindow label="The imported awesome-next-app repository open in the workspace on the main branch, with app/page.tsx modified and ready to push">
      <div className="flex h-10 items-center gap-2.5 border-b border-(--ws-border) bg-(--ws-sidebar) px-4 text-xs">
        <BrandIcon icon={siGithub} className="size-3.5" />
        <span className="truncate font-medium">mira-dev/awesome-next-app</span>
        <span className="hidden items-center gap-1 rounded border border-(--ws-border) px-1.5 py-0.5 text-(--ws-muted) sm:flex">
          <GitBranch className="size-3" />
          main
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-2 py-1 font-medium text-primary-foreground">
          <Upload className="size-3.5" />
          Push to GitHub
        </span>
      </div>
      <div className="flex h-76">
        <div className="hidden w-52 shrink-0 flex-col border-r border-(--ws-border) bg-(--ws-sidebar) sm:flex">
          <div className="flex h-9 shrink-0 items-center justify-between px-4">
            <PanelLabel>Explorer</PanelLabel>
            <span className="text-[11px] text-(--ws-muted)">2 changed</span>
          </div>
          <ExplorerTree items={files} />
        </div>
        <div className="relative min-w-0 flex-1">
          {changedLines.map(({ line, className }) => (
            <span
              key={line}
              className={cn("absolute left-0 h-5 w-0.75", className)}
              style={{ top: `calc(0.5rem + ${line - 1} * 1.25rem)` }}
            />
          ))}
          <CodeLines lines={code} current={10} />
        </div>
      </div>
    </MockWindow>
  );
}
