import { CodeLines } from "@/components/landing/mockups/code-lines";
import { EditorTabs } from "@/components/landing/mockups/editor-tabs";
import { MockWindow } from "@/components/landing/mockups/mock-window";
import { SuggestWidget } from "@/components/landing/mockups/suggest-widget";
import { tokens, type Token } from "@/components/landing/mockups/syntax";

// Close-up of the editor with IntelliSense open, completing an array method.

const { k, c, f, v, s, n } = tokens;

const habit = (id: string, name: string, done: string): Token[] => [
  "  { ", v("id"), ": ", n(id), ", ", v("name"), ": ", s(`"${name}"`), ", ", v("done"), ": ", k(done), " },",
];

// The last line ends where the user is typing.
const typed = "export const pending = habits.fi";
const prefix = typed.slice(typed.lastIndexOf(".") + 1);

const code: Token[][] = [
  [c("export"), " ", k("const"), " ", v("habits"), " = ["],
  habit("1", "Review pull requests", "true"),
  habit("2", "Solve a graph problem", "false"),
  habit("3", "Write API tests", "false"),
  ["];"],
  [],
  [c("export"), " ", k("function"), " ", f("progress"), "(", v("list"), ") {"],
  ["  ", k("const"), " ", v("done"), " = ", v("list"), ".", f("filter"), "((", v("habit"), ") ", k("=>"), " ", v("habit"), ".", v("done"), ");"],
  ["  ", c("return"), " ", v("Math"), ".", f("round"), "((", v("done"), ".", v("length"), " / ", v("list"), ".", v("length"), ") * ", n("100"), ");"],
  ["}"],
  [],
  [c("export"), " ", k("const"), " ", v("pending"), " = ", v("habits"), ".", v(prefix)],
];

export function EditorCloseup() {
  return (
    <MockWindow label="The editor suggesting array methods such as filter and find while typing habits.fi">
      <EditorTabs paths={["src/App.jsx", "src/habits.js", "src/index.css"]} active="src/habits.js">
        <span className="hidden shrink-0 items-center px-3 text-xs text-(--ws-muted) sm:flex">All changes saved</span>
      </EditorTabs>

      {/* Overlays are placed in code-row and character units: 0.5rem padding + 1.25rem per row,
          2.5rem gutter + 1ch per character. */}
      <div className="relative h-96 font-mono text-[12.5px]">
        <CodeLines lines={code} current={code.length} />
        <span
          className="absolute h-5 w-0.5 bg-black dark:bg-[#aeafad]"
          style={{ top: `calc(0.5rem + ${code.length - 1} * 1.25rem)`, left: `calc(2.5rem + ${typed.length}ch)` }}
        />
        {/* Opens under the typed letters; on phones it's pinned left so it isn't cut off. */}
        <SuggestWidget
          prefix={prefix}
          suggestions={["fill", "filter", "find", "findIndex", "findLast"]}
          // Preselected because filter was used a few lines up.
          selected="filter"
          detail="(method) Array.filter()"
          className="absolute left-(--suggest-left) max-sm:left-4"
          style={
            {
              top: `calc(0.5rem + ${code.length} * 1.25rem + 2px)`,
              "--suggest-left": `calc(2.5rem + ${typed.length - prefix.length}ch)`,
            } as React.CSSProperties
          }
        />
      </div>
    </MockWindow>
  );
}
