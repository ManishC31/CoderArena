import { Plus } from "lucide-react";
import { BrandIcon } from "@/components/brand-icon";
import { CreatePlaygroundDialog } from "@/components/dashboard/create-playground-dialog";
import { sandboxTemplates } from "@/lib/sandbox-templates";

// Every template as a row; clicking one opens the create dialog with it selected.
export function TemplateQuickStart() {
  return (
    <section aria-labelledby="quick-start-title">
      <h2 id="quick-start-title" className="text-sm font-medium">
        Quick start
      </h2>
      <ul className="mt-3 divide-y overflow-hidden rounded-xl border bg-card">
        {sandboxTemplates.map((template) => (
          <li key={template.id}>
            <CreatePlaygroundDialog
              defaultTemplate={template.id}
              trigger={
                <button
                  type="button"
                  className="group flex w-full items-center gap-3 px-3 py-2.5 text-left outline-none hover:bg-muted/50 focus-visible:bg-muted/50"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background">
                    <BrandIcon icon={template.icon} color={template.color} className="size-4" />
                  </span>
                  <span className="grid min-w-0 flex-1">
                    <span className="text-sm font-medium">{template.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{template.description}</span>
                  </span>
                  <Plus
                    aria-hidden
                    className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-brand"
                  />
                </button>
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
