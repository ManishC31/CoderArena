"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { deletePlayground } from "@/app/(app)/playground/actions";
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

type Props = {
  playgroundId: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeletePlaygroundDialog({ playgroundId, title, open, onOpenChange }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  function handleDelete() {
    setError(false);
    startTransition(async () => {
      try {
        await deletePlayground(playgroundId);
        onOpenChange(false);
      } catch (cause) {
        console.error("Couldn't delete the playground", cause);
        setError(true);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {title}?</DialogTitle>
          <DialogDescription>
            This deletes the playground and all of its files, and stops its sandbox. It can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            Couldn&apos;t delete the playground. Try again.
          </p>
        )}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={pending}>
            {pending && <LoaderCircle className="animate-spin" />}
            Delete playground
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
