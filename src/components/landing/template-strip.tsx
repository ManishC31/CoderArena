import { BrandIcon } from "@/components/brand-icon";
import { sandboxTemplates } from "@/lib/sandbox-templates";

// The playground templates as a row of monochrome logos.
export function TemplateStrip() {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="font-mono text-xs text-muted-foreground">Start from a template</p>
      <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-muted-foreground">
        {sandboxTemplates.map(({ id, name, icon }) => (
          <li key={id} className="flex items-center gap-2 text-sm">
            <BrandIcon icon={icon} className="size-4" />
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
