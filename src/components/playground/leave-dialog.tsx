"use client";

import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  // Playground name.
  title: string;
  saving: boolean;
  error: string | null;
  onSaveAndClose: () => void;
  onCancel: () => void;
};

// Shown when the user leaves the playground some other way than "Save and close" (the Back
// button, a link) before autosave has caught up.
export function LeaveDialog({ open, title, saving, error, onSaveAndClose, onCancel }: Props) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && !saving && onCancel()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Save changes before closing?</DialogTitle>
          <DialogDescription>Your latest changes to &ldquo;{title}&rdquo; haven&apos;t been saved yet.</DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" disabled={saving} onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={saving} onClick={onSaveAndClose}>
            {saving && <LoaderCircle className="animate-spin" />}
            {saving ? "Saving…" : "Save and close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
