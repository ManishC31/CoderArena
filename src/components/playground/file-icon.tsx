import { File, FileCode, FileJson, FileText, type LucideIcon } from "lucide-react";
import { extensionOf } from "@/components/playground/files";
import { cn } from "@/lib/utils";

// Mid-tone colors (VS Code's Seti icon palette) that read on light and dark themes.
const javascript = { icon: FileCode, className: "text-[#cbcb41]" };
const typescript = { icon: FileCode, className: "text-[#519aba]" };

const ICONS: Record<string, { icon: LucideIcon; className: string }> = {
  js: javascript,
  jsx: javascript,
  mjs: javascript,
  cjs: javascript,
  ts: typescript,
  tsx: typescript,
  json: { icon: FileJson, className: "text-[#cbcb41]" },
  css: { icon: FileCode, className: "text-[#519aba]" },
  html: { icon: FileCode, className: "text-[#e37933]" },
  vue: { icon: FileCode, className: "text-[#8dc149]" },
  md: { icon: FileText, className: "text-[#519aba]" },
};

const fallback = { icon: File, className: "text-(--ws-muted)" };

export function FileIcon({ path, className }: { path: string; className?: string }) {
  const { icon: Icon, className: color } = ICONS[extensionOf(path)] ?? fallback;
  return <Icon className={cn("size-4 shrink-0", color, className)} />;
}
