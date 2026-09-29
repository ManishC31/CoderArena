"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { renamePlayground, type RenamePlaygroundState } from "@/app/(app)/playground/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  playgroundId: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RenamePlaygroundDialog({ playgroundId, title, open, onOpenChange }: Props) {
  // Closes once the rename is saved; errors stay in the dialog.
  const [state, formAction, pending] = useActionState(
    async (previous: RenamePlaygroundState, formData: FormData) => {
      const result = await renamePlayground(previous, formData);
      if (result && "ok" in result) onOpenChange(false);
      return result;
    },
    null,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename playground</DialogTitle>
        </DialogHeader>
        <form id={`rename-${playgroundId}`} action={formAction} className="grid gap-2">
          <input type="hidden" name="playgroundId" value={playgroundId} />
          <Label htmlFor={`rename-${playgroundId}-title`}>Name</Label>
          <Input
            id={`rename-${playgroundId}-title`}
            name="title"
            defaultValue={title}
            maxLength={100}
            autoComplete="off"
            autoFocus
            aria-invalid={state !== null && "error" in state}
          />
          {state && "error" in state && (
            <p role="alert" className="text-xs text-destructive">
              {state.error}
            </p>
          )}
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button type="submit" form={`rename-${playgroundId}`} disabled={pending}>
            {pending && <LoaderCircle className="animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
