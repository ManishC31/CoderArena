import { X } from "lucide-react";
import { FileIcon } from "@/components/playground/file-icon";
import { cn } from "@/lib/utils";

type Props = {
  paths: string[];
  active: string;
  // Toolbar at the right end of the tab bar.
  children?: React.ReactNode;
};

// The editor's tab bar: open files, the active one in front.
export function EditorTabs({ paths, active, children }: Props) {
  return (
    <div className="flex h-9 shrink-0 border-b border-(--ws-border) bg-(--ws-sidebar)">
      <div className="flex min-w-0 flex-1 overflow-hidden">
        {paths.map((path) => (
          <div
            key={path}
            className={cn(
              "flex shrink-0 items-center gap-2 border-r border-(--ws-border) px-3 text-xs",
              path === active ? "bg-(--ws-editor) text-(--ws-fg)" : "text-(--ws-muted)",
            )}
          >
            <FileIcon path={path} className="size-3.5" />
            {path.split("/").pop()}
            {path === active && <X className="size-3.5" />}
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}
