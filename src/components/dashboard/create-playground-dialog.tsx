"use client";

import { useActionState, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { createPlayground } from "@/app/(app)/playground/actions";
import { BrandIcon } from "@/components/brand-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PlaygroundTemplate } from "@/generated/prisma/enums";
import { sandboxTemplates, type SandboxTemplate } from "@/lib/sandbox-templates";
import { cn } from "@/lib/utils";

const categories: SandboxTemplate["category"][] = ["Frontend", "Full-stack", "Backend"];

type Props = {
  // Element that opens the dialog, e.g. a button.
  trigger: React.ReactElement;
  // Template selected when the dialog opens.
  defaultTemplate?: PlaygroundTemplate;
};

// "Create a new playground": pick a template, optionally name it, then open it in the editor.
export function CreatePlaygroundDialog({ trigger, defaultTemplate }: Props) {
  const [templateId, setTemplateId] = useState<PlaygroundTemplate | null>(defaultTemplate ?? null);
  // On success the action redirects to the new playground's editor.
  const [state, formAction, pending] = useActionState(createPlayground, null);
  const selectedTemplate = sandboxTemplates.find(({ id }) => id === templateId);

  return (
    // Start each time from the default selection.
    <Dialog onOpenChange={(open) => open && setTemplateId(defaultTemplate ?? null)}>
      <DialogTrigger render={trigger} />

      <DialogContent className="max-h-[calc(100svh-2rem)] gap-5 overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a new playground</DialogTitle>
          <DialogDescription>Pick a template. It opens in the editor, ready to run.</DialogDescription>
        </DialogHeader>

        <form id="create-playground" action={formAction} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="playground-name">
              Name <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="playground-name"
              name="title"
              maxLength={100}
              placeholder={selectedTemplate ? `${selectedTemplate.name} playground` : "my-playground"}
              autoComplete="off"
            />
          </div>

          {categories.map((category) => (
            <fieldset key={category} className="grid gap-2">
              <legend className="mb-2 font-mono text-xs tracking-wider text-muted-foreground uppercase">{category}</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {sandboxTemplates
                  .filter((template) => template.category === category)
                  .map((template) => {
                    const selected = template.id === templateId;
                    return (
                      <label
                        key={template.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                          selected && "border-brand bg-brand/5 hover:bg-brand/5",
                        )}
                      >
                        <input
                          type="radio"
                          name="template"
                          value={template.id}
                          checked={selected}
                          onChange={() => setTemplateId(template.id)}
                          className="sr-only"
                        />
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background">
                          <BrandIcon icon={template.icon} color={template.color} />
                        </span>
                        <span className="grid min-w-0 flex-1 gap-0.5">
                          <span className="text-sm font-medium">{template.name}</span>
                          <span className="text-xs text-muted-foreground">{template.description}</span>
                        </span>
                        <span
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-full border",
                            selected && "border-brand bg-brand text-white",
                          )}
                        >
                          {selected && <Check className="size-3" />}
                        </span>
                      </label>
                    );
                  })}
              </div>
            </fieldset>
          ))}

          {state?.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
        </form>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button type="submit" form="create-playground" disabled={!templateId || pending}>
            {pending && <LoaderCircle className="animate-spin" />}
            Create playground
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
