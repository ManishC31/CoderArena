"use client";

import { useActionState, useState } from "react";
import { Check, LoaderCircle, SquareTerminal } from "lucide-react";
import { createPlayground } from "@/app/(app)/playground/actions";
import { BrandIcon } from "@/components/brand-icon";
import { ActionCard } from "@/components/dashboard/action-card";
import { sandboxTemplates } from "@/lib/sandbox-templates";
import type { PlaygroundTemplate } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function CreatePlaygroundCard() {
  const [templateId, setTemplateId] = useState<PlaygroundTemplate | null>(null);
  // On success the action redirects to the new playground's editor.
  const [state, formAction, pending] = useActionState(createPlayground, null);
  const selectedTemplate = sandboxTemplates.find(({ id }) => id === templateId);

  return (
    // Start each time with nothing selected.
    <Dialog onOpenChange={(open) => open && setTemplateId(null)}>
      <ActionCard
        icon={
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <SquareTerminal className="size-5" />
          </span>
        }
        title="Create a playground"
        description="Start from a ready-made sandbox and code right in your browser."
        actionLabel="Choose a template"
      >
        <div className="flex flex-wrap gap-2">
          {sandboxTemplates.map((template) => (
            <span
              key={template.id}
              title={template.name}
              className="flex size-9 items-center justify-center rounded-lg border bg-background"
            >
              <BrandIcon icon={template.icon} color={template.color} className="size-4.5" />
            </span>
          ))}
        </div>
      </ActionCard>

      <DialogContent className="max-h-[calc(100svh-2rem)] gap-5 overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a playground</DialogTitle>
          <DialogDescription>Pick a sandbox template to start from.</DialogDescription>
        </DialogHeader>

        <form id="create-playground" action={formAction} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="playground-name">Name</Label>
            <Input
              id="playground-name"
              name="title"
              maxLength={100}
              placeholder={selectedTemplate ? `${selectedTemplate.name} playground` : "my-playground"}
              autoComplete="off"
            />
          </div>

          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">Template</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {sandboxTemplates.map((template) => {
                const selected = template.id === templateId;
                return (
                  <label
                    key={template.id}
                    className={cn(
                      "flex cursor-pointer flex-col gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                      selected && "border-primary bg-muted/50",
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
                    <span className="flex items-start justify-between">
                      <span className="flex size-9 items-center justify-center rounded-md border bg-background">
                        <BrandIcon icon={template.icon} color={template.color} />
                      </span>
                      <span
                        className={cn(
                          "flex size-4 items-center justify-center rounded-full border",
                          selected && "border-primary bg-primary text-primary-foreground",
                        )}
                      >
                        {selected && <Check className="size-3" />}
                      </span>
                    </span>
                    <span className="grid gap-0.5">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        {template.name}
                        <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">
                          {template.category}
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground">{template.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
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
