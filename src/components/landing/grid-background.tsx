import { cn } from "@/lib/utils";

// Faint grid that fades out from the top center. Based on Aceternity UI's grid background.
// Put it in a `relative isolate` element.
export function GridBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[48px_48px] mask-[radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]",
        className,
      )}
    />
  );
}
