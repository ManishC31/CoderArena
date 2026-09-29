import { ChevronRight, FolderOpen } from "lucide-react";
import { FileIcon } from "@/components/playground/file-icon";
import { cn } from "@/lib/utils";

export type TreeItem = {
  path: string;
  depth: number;
  folder?: boolean;
  active?: boolean;
  // Git status letter shown on the right, e.g. "M" for modified.
  status?: string;
};

// The workspace's file explorer, with every folder open.
export function ExplorerTree({ items }: { items: TreeItem[] }) {
  return (
    <ul className="pb-2 text-[13px]">
      {items.map(({ path, depth, folder, active, status }) => (
        <li
          key={path}
          style={{ paddingLeft: 8 + depth * 12 }}
          className={cn("flex items-center gap-1.5 py-0.75 pr-3", active && "bg-(--ws-active)")}
        >
          {folder ? (
            <>
              <ChevronRight className="size-4 shrink-0 rotate-90 text-(--ws-muted)" />
              <FolderOpen className="size-4 shrink-0 text-(--ws-muted)" />
            </>
          ) : (
            <>
              <span className="w-4 shrink-0" />
              <FileIcon path={path} />
            </>
          )}
          <span className={cn("truncate", status && "text-[#895503] dark:text-[#e2c08d]")}>{path.split("/").pop()}</span>
          {status && <span className="ml-auto pl-2 text-[11px] text-[#895503] dark:text-[#e2c08d]">{status}</span>}
        </li>
      ))}
    </ul>
  );
}
