"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import { FileIcon } from "@/components/playground/file-icon";
import { cn } from "@/lib/utils";

type TreeNode = {
  name: string;
  path: string;
  // Only set on folders.
  children?: TreeNode[];
};

// Turns ["src/App.jsx", "package.json"] into a folder tree: folders first, then files, A→Z.
function buildTree(paths: string[]): TreeNode[] {
  const root: TreeNode = { name: "", path: "", children: [] };
  for (const path of paths) {
    const parts = path.split("/");
    let node = root;
    parts.forEach((name, index) => {
      const isFile = index === parts.length - 1;
      let child = node.children!.find((candidate) => candidate.name === name);
      if (!child) {
        child = { name, path: parts.slice(0, index + 1).join("/"), children: isFile ? undefined : [] };
        node.children!.push(child);
      }
      node = child;
    });
  }

  const sort = (nodes: TreeNode[]): TreeNode[] =>
    nodes
      .sort((a, b) => Number(!a.children) - Number(!b.children) || a.name.localeCompare(b.name))
      .map((node) => (node.children ? { ...node, children: sort(node.children) } : node));
  return sort(root.children!);
}

type Props = {
  paths: string[];
  activePath: string | null;
  onOpen: (path: string) => void;
};

export function FileExplorer({ paths, activePath, onOpen }: Props) {
  const tree = useMemo(() => buildTree(paths), [paths]);
  // Folders start expanded; this tracks the ones the user closed.
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  function toggleFolder(path: string) {
    setCollapsed((previous) => {
      const next = new Set(previous);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  return (
    <div className="flex h-full flex-col bg-(--ws-sidebar) text-(--ws-fg)">
      <div className="flex h-9 shrink-0 items-center px-4 text-[11px] font-semibold tracking-wider text-(--ws-muted) uppercase">
        Explorer
      </div>
      <nav aria-label="Files" className="min-h-0 flex-1 overflow-auto pb-2">
        <TreeItems
          nodes={tree}
          depth={0}
          collapsed={collapsed}
          activePath={activePath}
          onToggleFolder={toggleFolder}
          onOpen={onOpen}
        />
      </nav>
    </div>
  );
}

type TreeItemsProps = {
  nodes: TreeNode[];
  depth: number;
  collapsed: Set<string>;
  activePath: string | null;
  onToggleFolder: (path: string) => void;
  onOpen: (path: string) => void;
};

function TreeItems({ nodes, depth, collapsed, activePath, onToggleFolder, onOpen }: TreeItemsProps) {
  return (
    <ul>
      {nodes.map((node) => {
        const isFolder = Boolean(node.children);
        const open = isFolder && !collapsed.has(node.path);
        return (
          <li key={node.path}>
            <button
              type="button"
              title={node.path}
              aria-expanded={isFolder ? open : undefined}
              aria-current={node.path === activePath ? "true" : undefined}
              onClick={() => (isFolder ? onToggleFolder(node.path) : onOpen(node.path))}
              style={{ paddingLeft: 8 + depth * 12 }}
              className={cn(
                "flex w-full items-center gap-1.5 py-[3px] pr-2 text-left text-[13px] outline-none hover:bg-(--ws-hover) focus-visible:ring-1 focus-visible:ring-(--ws-accent) focus-visible:ring-inset",
                node.path === activePath && "bg-(--ws-active) hover:bg-(--ws-active)",
              )}
            >
              {isFolder ? (
                <ChevronRight
                  className={cn("size-4 shrink-0 text-(--ws-muted) transition-transform", open && "rotate-90")}
                />
              ) : (
                <span className="w-4 shrink-0" />
              )}
              {isFolder ? (
                open ? (
                  <FolderOpen className="size-4 shrink-0 text-(--ws-muted)" />
                ) : (
                  <Folder className="size-4 shrink-0 text-(--ws-muted)" />
                )
              ) : (
                <FileIcon path={node.path} />
              )}
              <span className="truncate">{node.name}</span>
            </button>
            {open && (
              <TreeItems
                nodes={node.children!}
                depth={depth + 1}
                collapsed={collapsed}
                activePath={activePath}
                onToggleFolder={onToggleFolder}
                onOpen={onOpen}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
