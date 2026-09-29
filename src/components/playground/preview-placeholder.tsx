import { LoaderCircle, MonitorPlay, Play, RotateCw, TriangleAlert } from "lucide-react";
import type { PreviewState } from "@/components/playground/use-preview";

// Buttons use the editor theme's colors, which can differ from the site theme.
const buttonClass =
  "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-(--ws-accent) [&_svg]:size-3.5";
const primaryButtonClass = `${buttonClass} bg-(--ws-accent) text-white hover:opacity-90`;
const outlineButtonClass = `${buttonClass} border border-(--ws-border) bg-(--ws-sidebar) text-(--ws-fg) hover:bg-(--ws-hover)`;

type Props = {
  state: Exclude<PreviewState, { status: "running" }>;
  onRun: () => void;
};

// What the preview panel shows while the app isn't running: starting, stopped or failed.
export function PreviewPlaceholder({ state, onRun }: Props) {
  if (state.status === "starting") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <LoaderCircle className="size-6 animate-spin text-(--ws-accent)" />
        <div>
          <p className="text-sm font-medium text-(--ws-fg)">Starting sandbox</p>
          <p className="mt-1 text-xs text-(--ws-muted)">
            Creating the container, installing dependencies and starting the dev server.
          </p>
        </div>
        <p className="max-w-xs text-xs text-(--ws-muted)">The first run can take a minute while dependencies install.</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div role="alert" className="flex h-full flex-col items-center justify-center gap-4 overflow-auto p-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <TriangleAlert className="size-6 text-red-500" />
          <p className="text-sm font-medium text-(--ws-fg)">{state.message}</p>
        </div>
        {state.logs && (
          <details open className="w-full max-w-lg">
            <summary className="cursor-pointer text-xs text-(--ws-muted) select-none">Logs</summary>
            <pre className="mt-2 max-h-64 overflow-auto rounded-md border border-(--ws-border) bg-(--ws-sidebar) p-3 text-left font-mono text-xs whitespace-pre-wrap text-(--ws-fg)">
              {state.logs}
            </pre>
          </details>
        )}
        <button type="button" onClick={onRun} className={outlineButtonClass}>
          <RotateCw />
          Restart sandbox
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <MonitorPlay className="size-6 text-(--ws-muted)" />
      <div>
        <p className="text-sm font-medium text-(--ws-fg)">The preview isn&apos;t running</p>
        <p className="mt-1 text-xs text-(--ws-muted)">Run the app in an isolated sandbox to see it here.</p>
      </div>
      <button type="button" onClick={onRun} className={primaryButtonClass}>
        <Play />
        Run
      </button>
    </div>
  );
}
