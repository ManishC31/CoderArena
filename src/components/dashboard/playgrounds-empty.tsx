import { FolderCode, Plus } from "lucide-react";
import { CreatePlaygroundDialog } from "@/components/dashboard/create-playground-dialog";
import { Button } from "@/components/ui/button";

// Shown when the user has no playgrounds yet.
export function PlaygroundsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center">
      <span className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <FolderCode className="size-5" />
      </span>
      <h3 className="font-medium">Your workspace is empty.</h3>
      <p className="max-w-sm text-sm text-muted-foreground">Create your first playground and start coding in seconds.</p>
      <CreatePlaygroundDialog
        trigger={
          <Button className="mt-2">
            <Plus />
            Create playground
          </Button>
        }
      />
    </div>
  );
}
