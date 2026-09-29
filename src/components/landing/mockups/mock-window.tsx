import { getEditorTheme } from "@/components/playground/editor-themes";
import { cn } from "@/lib/utils";

// Workspace colors from the editor's VS Code Light and Dark themes. light-dark() picks one
// from the page's color-scheme, so the mockups follow the site theme.
const light = getEditorTheme("vs-light-plus").chrome;
const dark = getEditorTheme("vs-dark-plus").chrome;
const pick = (key: keyof typeof light) => `light-dark(${light[key]}, ${dark[key]})`;

// Same --ws-* variables PlaygroundWorkspace sets, so mockups share its classes.
const workspaceStyle = {
  "--ws-editor": pick("editor"),
  "--ws-sidebar": pick("sidebar"),
  "--ws-border": pick("border"),
  "--ws-fg": pick("foreground"),
  "--ws-muted": pick("muted"),
  "--ws-hover": pick("hover"),
  "--ws-active": pick("active"),
  "--ws-accent": pick("accent"),
} as React.CSSProperties;

type Props = {
  // Describes the picture for screen readers; the contents are decorative.
  label: string;
  className?: string;
  children: React.ReactNode;
};

// Frame for a static picture of the product, styled like the workspace.
export function MockWindow({ label, className, children }: Props) {
  return (
    <div
      role="img"
      aria-label={label}
      style={workspaceStyle}
      className={cn(
        "overflow-hidden rounded-xl border border-(--ws-border) bg-(--ws-editor) text-(--ws-fg) shadow-xl shadow-black/5 select-none dark:shadow-black/40",
        className,
      )}
    >
      {children}
    </div>
  );
}
