import { CircleAlert, CloudCheck, LoaderCircle } from "lucide-react";
import type { SaveStatus as Status } from "@/components/playground/use-autosave";

type Props = {
  status: Status;
  // "Save and close" is saving the last changes.
  closing: boolean;
};

// Autosave state for the workspace header: saved, unsaved, saving, or failed.
export function SaveStatus({ status, closing }: Props) {
  if (status === "error") {
    return (
      <p role="alert" className="flex items-center gap-1.5 text-xs text-destructive">
        <CircleAlert className="size-3.5" />
        Couldn&apos;t save. Retrying…
      </p>
    );
  }

  return (
    <p aria-live="polite" className="flex items-center gap-1.5 text-xs whitespace-nowrap text-muted-foreground">
      {status === "saving" || closing ? (
        <>
          <LoaderCircle className="size-3.5 animate-spin" />
          Saving…
        </>
      ) : status === "unsaved" ? (
        <>
          <span className="mx-1 size-1.5 rounded-full bg-amber-500" />
          Unsaved changes
        </>
      ) : (
        <>
          <CloudCheck className="size-3.5" />
          All changes saved
        </>
      )}
    </p>
  );
}
