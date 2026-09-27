import { CircleCheck, Play } from "lucide-react";

// Static, decorative mock of the editor for the landing page hero.

const kw = "text-violet-400";
const fn = "text-sky-400";
const ty = "text-amber-300";
const num = "text-emerald-300";

type Token = [text: string, className?: string];

const code: Token[][] = [
  [["function ", kw], ["twoSum", fn], ["(nums: "], ["number", ty], ["[], target: "], ["number", ty], [") {"]],
  [["  "], ["const ", kw], ["seen = "], ["new ", kw], ["Map", ty], ["<"], ["number", ty], [", "], ["number", ty], [">();"]],
  [["  "], ["for ", kw], ["("], ["let ", kw], ["i = "], ["0", num], ["; i < nums.length; i++) {"]],
  [["    "], ["const ", kw], ["need = target - nums[i];"]],
  [["    "], ["if ", kw], ["(seen."], ["has", fn], ["(need)) "], ["return ", kw], ["[seen."], ["get", fn], ["(need)!, i];"]],
  [["    seen."], ["set", fn], ["(nums[i], i);"]],
  [["  }"]],
  [["  "], ["return ", kw], ["[];"]],
  [["}"]],
];

const tests = [
  "twoSum([2, 7, 11, 15], 9) → [0, 1]",
  "twoSum([3, 2, 4], 6) → [1, 2]",
  "twoSum([3, 3], 6) → [0, 1]",
];

export function EditorPreview() {
  return (
    <div
      role="img"
      aria-label="The CodeArena editor with a Two Sum solution and all tests passing"
      className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 font-mono text-[13px] text-zinc-300 shadow-2xl shadow-zinc-950/20"
    >
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="size-3 rounded-full bg-zinc-700" />
            <span className="size-3 rounded-full bg-zinc-700" />
            <span className="size-3 rounded-full bg-zinc-700" />
          </div>
          <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-300">two-sum.ts</span>
        </div>
        <span className="flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">
          <Play className="size-3" />
          Run
        </span>
      </div>

      <pre className="overflow-x-auto px-4 py-4 leading-6">
        {code.map((line, i) => (
          <div key={i} className="flex">
            <span className="w-6 shrink-0 text-right text-zinc-600 select-none">{i + 1}</span>
            <code className="pl-4">
              {line.map(([text, className], j) => (
                <span key={j} className={className}>
                  {text}
                </span>
              ))}
            </code>
          </div>
        ))}
      </pre>

      <div className="border-t border-zinc-800 bg-zinc-900/60 px-4 py-3">
        <p className="mb-2 text-xs font-medium text-zinc-400">Tests · 3/3 passed</p>
        <ul className="space-y-1">
          {tests.map((test) => (
            <li key={test} className="flex items-center gap-2 text-xs text-zinc-300">
              <CircleCheck className="size-3.5 shrink-0 text-emerald-400" />
              {test}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
