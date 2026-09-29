import { CircleCheck } from "lucide-react";
import { PanelLabel } from "@/components/landing/mockups/panel-label";
import { terminal } from "@/components/landing/mockups/syntax";

// Verdict for a submitted solution: status, runtime, memory and each test case.

const cases = [
  { input: "[[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]" },
  { input: "[[1,4],[4,5]]", output: "[[1,5]]" },
  { input: "[[4,7],[1,4]]", output: "[[1,7]]" },
];

export function TestResults() {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pt-3">
        <PanelLabel>Test results</PanelLabel>
        <span className={`text-sm font-semibold ${terminal.green}`}>Accepted</span>
        <span className="text-xs text-(--ws-muted)">
          {cases.length} / {cases.length} test cases passed
        </span>
        <span className="flex gap-4 font-mono text-xs sm:ml-auto">
          <span>
            <span className="text-(--ws-muted)">Runtime</span> 7 ms
          </span>
          <span>
            <span className="text-(--ws-muted)">Memory</span> 17.9 MB
          </span>
        </span>
      </div>
      <ul className="space-y-1.5 px-4 py-3 font-mono text-[12px]">
        {cases.map(({ input, output }, index) => (
          <li key={input} className="flex min-w-0 items-center gap-2.5">
            <CircleCheck className={`size-3.5 shrink-0 ${terminal.green}`} />
            <span className="shrink-0 text-(--ws-muted)">Case {index + 1}</span>
            <span className="truncate">
              {input} <span className="text-(--ws-muted)">→</span> {output}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
