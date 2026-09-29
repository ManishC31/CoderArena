import { BrandIcon } from "@/components/brand-icon";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import type { SandboxTemplate } from "@/lib/sandbox-templates";

// A playground template: logo, name, category and what it's for.
export function TemplateCard({ template }: { template: SandboxTemplate }) {
  const { name, category, description, icon, color } = template;

  return (
    <li className="relative rounded-xl border bg-card p-4">
      <GlowingEffect />
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg border bg-background">
          <BrandIcon icon={icon} color={color} />
        </span>
        <div>
          <p className="font-medium">{name}</p>
          <p className="font-mono text-xs text-muted-foreground">{category}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
    </li>
  );
}
