import { ExternalLink, MonitorPlay, RotateCw, Save, Settings, Square, SquareTerminal, X } from "lucide-react";
import { siReact } from "simple-icons";
import { BrandIcon } from "@/components/brand-icon";
import { CodeLines } from "@/components/landing/mockups/code-lines";
import { DevServerOutput } from "@/components/landing/mockups/dev-server-output";
import { EditorTabs } from "@/components/landing/mockups/editor-tabs";
import { ExplorerTree, type TreeItem } from "@/components/landing/mockups/explorer-tree";
import { HabitTrackerPreview } from "@/components/landing/mockups/habit-tracker-preview";
import { MockWindow } from "@/components/landing/mockups/mock-window";
import { PanelLabel } from "@/components/landing/mockups/panel-label";
import { tokens, type Token } from "@/components/landing/mockups/syntax";

// A React playground in the workspace, laid out like PlaygroundWorkspace:
// explorer | editor over terminal | preview.

const { k, c, f, t, v, s, n, tag, b } = tokens;

const files: TreeItem[] = [
  { path: "src", depth: 0, folder: true },
  { path: "src/App.jsx", depth: 1, active: true },
  { path: "src/HabitList.jsx", depth: 1 },
  { path: "src/index.css", depth: 1 },
  { path: "src/main.jsx", depth: 1 },
  { path: "index.html", depth: 0 },
  { path: "package.json", depth: 0 },
  { path: "vite.config.js", depth: 0 },
];

const habit = (id: string, name: string, done: string): Token[] => [
  "  { ", v("id"), ": ", n(id), ", ", v("name"), ": ", s(`"${name}"`), ", ", v("done"), ": ", k(done), " },",
];

const code: Token[][] = [
  [c("import"), " { ", v("useState"), " } ", c("from"), " ", s('"react"'), ";"],
  [c("import"), " ", v("HabitList"), " ", c("from"), " ", s('"./HabitList.jsx"'), ";"],
  [],
  [k("const"), " ", v("today"), " = ["],
  habit("1", "Review pull requests", "true"),
  habit("2", "Solve a graph problem", "false"),
  habit("3", "Write API tests", "false"),
  ["];"],
  [],
  [c("export"), " ", c("default"), " ", k("function"), " ", f("App"), "() {"],
  ["  ", k("const"), " [", v("habits"), ", ", f("setHabits"), "] = ", f("useState"), "(", v("today"), ");"],
  ["  ", k("const"), " ", v("done"), " = ", v("habits"), ".", f("filter"), "((", v("h"), ") ", k("=>"), " ", v("h"), ".", v("done"), ").", v("length"), ";"],
  [],
  ["  ", k("const"), " ", f("toggle"), " = (", v("id"), ") ", k("=>")],
  ["    ", f("setHabits"), "(", v("habits"), ".", f("map"), "((", v("h"), ") ", k("=>")],
  ["      ", v("h"), ".", v("id"), " === ", v("id"), " ? { ...", v("h"), ", ", v("done"), ": !", v("h"), ".", v("done"), " } : ", v("h"), "));"],
  [],
  ["  ", c("return"), " ("],
  ["    ", b("<"), tag("main"), b(">")],
  ["      ", b("<"), tag("h1"), b(">"), "Today", b("</"), tag("h1"), b(">")],
  ["      ", b("<"), tag("p"), b(">"), k("{"), v("done"), k("}"), " of ", k("{"), v("habits"), ".", v("length"), k("}"), " done", b("</"), tag("p"), b(">")],
  ["      ", b("<"), t("HabitList"), " ", v("habits"), "=", k("{"), v("habits"), k("}"), " ", v("onToggle"), "=", k("{"), f("toggle"), k("}"), " ", b("/>")],
  ["    ", b("</"), tag("main"), b(">")],
  ["  );"],
  ["}"],
];

export function IdeMockup() {
  return (
    <MockWindow label="The CoderArena workspace: a React playground with App.jsx open in the editor, the Vite dev server running in the terminal, and the app in the live preview">
      <div className="flex h-10 items-center gap-2.5 border-b border-(--ws-border) bg-(--ws-sidebar) px-4 text-xs">
        <BrandIcon icon={siReact} color="#149ECA" className="size-4" />
        <span className="font-medium">habit-tracker</span>
        <span className="hidden text-(--ws-muted) sm:inline">All changes saved</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-md border border-(--ws-border) bg-(--ws-editor) px-2 py-1">
          <Save className="size-3.5" />
          Save and close
        </span>
      </div>

      <div className="flex h-105 lg:h-120">
        <div className="hidden w-48 shrink-0 flex-col border-r border-(--ws-border) bg-(--ws-sidebar) sm:flex">
          <div className="flex h-9 shrink-0 items-center px-4">
            <PanelLabel>Explorer</PanelLabel>
          </div>
          <ExplorerTree items={files} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <EditorTabs paths={["src/App.jsx", "src/HabitList.jsx"]} active="src/App.jsx">
            <div className="flex shrink-0 items-center gap-3 px-3 text-xs">
              <span className="hidden items-center gap-1.5 md:flex">
                <MonitorPlay className="size-3.5" />
                Preview
              </span>
              <span className="flex items-center gap-1.5">
                <SquareTerminal className="size-3.5" />
                Terminal
              </span>
              <Settings className="size-3.5 text-(--ws-muted)" />
            </div>
          </EditorTabs>
          <CodeLines lines={code} current={21} className="min-h-0 flex-1" />

          <div className="flex h-36 shrink-0 flex-col border-t border-(--ws-border)">
            <div className="flex h-8 shrink-0 items-center justify-between px-3">
              <PanelLabel>Terminal</PanelLabel>
              <X className="size-3.5 text-(--ws-muted)" />
            </div>
            <DevServerOutput />
          </div>
        </div>

        <div className="hidden w-[34%] shrink-0 flex-col border-l border-(--ws-border) md:flex">
          <div className="flex h-9 shrink-0 items-center gap-2 border-b border-(--ws-border) bg-(--ws-sidebar) pr-2 pl-3">
            <PanelLabel>Preview</PanelLabel>
            <div className="ml-auto flex items-center gap-2 text-(--ws-muted) [&_svg]:size-3.5">
              <RotateCw />
              <ExternalLink />
              <Square />
              <X />
            </div>
          </div>
          <div className="min-h-0 flex-1">
            <HabitTrackerPreview />
          </div>
        </div>
      </div>
    </MockWindow>
  );
}
