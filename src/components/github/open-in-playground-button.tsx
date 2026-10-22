"use client";

import { useActionState } from "react";
import { FolderCode, LoaderCircle } from "lucide-react";
import { importRepository } from "@/app/(app)/playground/actions";
import { Button } from "@/components/ui/button";

type Props = {
  fullName: string;
  branch: string;
};

// Copies the repository into a new playground and opens it in the editor (the action redirects).
export function OpenInPlaygroundButton({ fullName, branch }: Props) {
  const [state, formAction, pending] = useActionState(importRepository, null);

  return (
    <form action={formAction} className="contents">
      <input type="hidden" name="repository" value={fullName} />
      <input type="hidden" name="branch" value={branch} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? <LoaderCircle className="animate-spin" /> : <FolderCode />}
        {pending ? "Preparing…" : "Open in playground"}
      </Button>
      {state?.error && (
        <p role="alert" className="basis-full text-xs text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
