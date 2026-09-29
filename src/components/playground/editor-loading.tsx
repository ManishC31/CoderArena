import { LoaderCircle } from "lucide-react";

// Shown while Monaco downloads and boots. Kept out of monaco-editor.tsx so it
// can render on the server without importing Monaco.
export function EditorLoading() {
  return (
    <div className="flex h-full items-center justify-center gap-2 bg-(--ws-editor) text-sm text-(--ws-muted)">
      <LoaderCircle className="size-4 animate-spin" />
      Loading editor…
    </div>
  );
}
