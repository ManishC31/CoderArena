// Small monospace label, used as a feature tile's visual.
export function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md border bg-background px-2 py-1 font-mono text-xs text-muted-foreground">{children}</span>;
}
