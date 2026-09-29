import type { LucideIcon } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  // Small visual under the text, e.g. a mockup or a keyboard shortcut.
  children?: React.ReactNode;
};

// A bento-grid tile describing one feature.
export function FeatureTile({ icon: Icon, title, description, className, children }: Props) {
  return (
    <li className={cn("relative flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-5", className)}>
      <GlowingEffect />
      <div>
        <span className="flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Icon className="size-4.5" />
        </span>
        <h3 className="mt-3 font-medium">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children && <div className="mt-auto">{children}</div>}
    </li>
  );
}
