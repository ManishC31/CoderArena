import { Play } from "lucide-react";
import { CodeLines } from "@/components/landing/mockups/code-lines";
import { LanguageSwitcher } from "@/components/landing/mockups/language-switcher";
import { MockWindow } from "@/components/landing/mockups/mock-window";
import { ProblemDescription } from "@/components/landing/mockups/problem-description";
import { tokens, type Token } from "@/components/landing/mockups/syntax";
import { TestResults } from "@/components/landing/mockups/test-results";

// An algorithm problem: description | editor with a language switcher, then the test results.

const { k, c, f, t, v, n } = tokens;

const listOfInts = (): Token[] => [t("list"), "[", t("list"), "[", t("int"), "]]"];

const code: Token[][] = [
  [k("class"), " ", t("Solution"), ":"],
  ["    ", k("def"), " ", f("merge"), "(", v("self"), ", ", v("intervals"), ": ", ...listOfInts(), ") -> ", ...listOfInts(), ":"],
  ["        ", v("intervals"), ".", f("sort"), "(", v("key"), "=", k("lambda"), " ", v("x"), ": ", v("x"), "[", n("0"), "])"],
  ["        ", v("merged"), " = [", v("intervals"), "[", n("0"), "]]"],
  [],
  ["        ", c("for"), " ", v("start"), ", ", v("end"), " ", c("in"), " ", v("intervals"), "[", n("1"), ":]:"],
  ["            ", c("if"), " ", v("start"), " <= ", v("merged"), "[-", n("1"), "][", n("1"), "]:"],
  ["                ", v("merged"), "[-", n("1"), "][", n("1"), "] = ", f("max"), "(", v("merged"), "[-", n("1"), "][", n("1"), "], ", v("end"), ")"],
  ["            ", c("else"), ":"],
  ["                ", v("merged"), ".", f("append"), "([", v("start"), ", ", v("end"), "])"],
  [],
  ["        ", c("return"), " ", v("merged")],
];

export function ProblemMockup() {
  return (
    <MockWindow label="The Merge Intervals problem solved in Python: all 3 test cases pass and the submission is accepted with a runtime of 7 ms and 17.9 MB of memory">
      <div className="flex flex-col lg:flex-row">
        <div className="border-b border-(--ws-border) lg:w-[40%] lg:border-r lg:border-b-0">
          <ProblemDescription />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-9 shrink-0 items-center justify-between gap-2 border-b border-(--ws-border) bg-(--ws-sidebar) px-2">
            <LanguageSwitcher selected="Python" />
            <span className="hidden font-mono text-[11px] text-(--ws-muted) sm:inline">solution.py</span>
          </div>
          <CodeLines lines={code} current={12} className="flex-1" />
        </div>
      </div>

      <div className="border-t border-(--ws-border)">
        <TestResults />
        <div className="flex justify-end gap-2 border-t border-(--ws-border) bg-(--ws-sidebar) px-4 py-2.5 text-xs">
          <span className="flex items-center gap-1.5 rounded-md border border-(--ws-border) bg-(--ws-editor) px-2.5 py-1">
            <Play className="size-3" />
            Run code
          </span>
          <span className="rounded-md bg-primary px-2.5 py-1 font-medium text-primary-foreground">Submit solution</span>
        </div>
      </div>
    </MockWindow>
  );
}
