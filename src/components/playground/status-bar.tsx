import { extensionOf } from "@/components/playground/files";
import type { PreviewState } from "@/components/playground/use-preview";
import { cn } from "@/lib/utils";

const LANGUAGE_NAMES: Record<string, string> = {
  js: "JavaScript",
  jsx: "JavaScript JSX",
  mjs: "JavaScript",
  cjs: "JavaScript",
  ts: "TypeScript",
  tsx: "TypeScript JSX",
  json: "JSON",
  css: "CSS",
  html: "HTML",
  vue: "Vue",
  md: "Markdown",
};

const SANDBOX_STATUS: Record<PreviewState["status"], { label: string; dot: string }> = {
  running: { label: "Sandbox running", dot: "bg-emerald-500" },
  starting: { label: "Starting sandbox…", dot: "bg-amber-500 animate-pulse motion-reduce:animate-none" },
  stopped: { label: "Sandbox stopped", dot: "bg-(--ws-muted)" },
  error: { label: "Sandbox error", dot: "bg-red-500" },
};

type Props = {
  // Null for templates that can't run in a sandbox.
  previewStatus: PreviewState["status"] | null;
  activePath: string | null;
  themeName: string;
};

// VS Code-style status bar along the bottom of the workspace.
export function StatusBar({ previewStatus, activePath, themeName }: Props) {
  const sandbox = previewStatus && SANDBOX_STATUS[previewStatus];

  return (
    <footer className="flex h-6 shrink-0 items-center gap-4 border-t border-(--ws-border) bg-(--ws-sidebar) px-3 text-[11px] text-(--ws-muted)">
      <span aria-live="polite" className="flex items-center gap-1.5">
        {sandbox ? (
          <>
            <span className={cn("size-1.5 rounded-full", sandbox.dot)} />
            {sandbox.label}
          </>
        ) : (
          "Preview isn't available for this template yet"
        )}
      </span>
      <span className="ml-auto hidden sm:inline">
        {activePath ? (LANGUAGE_NAMES[extensionOf(activePath)] ?? "Plain text") : null}
      </span>
      <span className="hidden sm:inline">{themeName}</span>
    </footer>
  );
}
