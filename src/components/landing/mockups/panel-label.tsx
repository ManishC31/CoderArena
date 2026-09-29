// Uppercase panel title, as in the workspace's explorer, terminal and preview headers.
export function PanelLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-semibold tracking-wider text-(--ws-muted) uppercase">{children}</span>;
}
