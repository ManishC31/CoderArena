// The problem statement pane of an algorithm problem.
export function ProblemDescription() {
  return (
    <div className="bg-(--ws-sidebar) p-5 text-[13px] leading-relaxed">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold">Merge Intervals</span>
        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
          Medium
        </span>
      </div>
      <p className="mt-1 text-xs text-(--ws-muted)">Arrays · Sorting</p>
      <p className="mt-4">
        Given a list of intervals, where each interval is <code className="font-mono text-[12px]">[start, end]</code>,
        merge every pair that overlaps and return the non-overlapping intervals that cover the same ranges.
      </p>
      <p className="mt-4 font-medium">Example</p>
      <pre className="mt-2 overflow-hidden rounded-md border border-(--ws-border) bg-(--ws-editor) p-3 font-mono text-[12px] leading-5">
        <span className="text-(--ws-muted)">Input:</span> intervals = [[1,3],[2,6],[8,10]]
        {"\n"}
        <span className="text-(--ws-muted)">Output:</span> [[1,6],[8,10]]
      </pre>
      <p className="mt-4 font-medium">Constraints</p>
      <ul className="mt-2 space-y-1 font-mono text-[12px] text-(--ws-muted)">
        <li>1 ≤ intervals.length ≤ 10⁴</li>
        <li>intervals[i].length == 2</li>
        <li>0 ≤ start ≤ end ≤ 10⁴</li>
      </ul>
    </div>
  );
}
