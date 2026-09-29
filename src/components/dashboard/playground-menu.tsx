"use client";

import { useState } from "react";
import Link from "next/link";
import { Ellipsis, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { DeletePlaygroundDialog } from "@/components/dashboard/delete-playground-dialog";
import { RenamePlaygroundDialog } from "@/components/dashboard/rename-playground-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  playgroundId: string;
  title: string;
};

// A playground card's "…" menu: open, rename, delete.
export function PlaygroundMenu({ playgroundId, title }: Props) {
  const [dialog, setDialog] = useState<"rename" | "delete" | null>(null);
  const closeDialog = (open: boolean) => !open && setDialog(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`More actions for ${title}`}
          // Sits above the card's full-size link so it gets its own clicks.
          className="relative z-10 rounded-md p-1.5 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:bg-muted"
        >
          <Ellipsis className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto min-w-40">
          <DropdownMenuItem render={<Link href={`/playground/${playgroundId}`} />}>
            <ExternalLink />
            Open
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialog("rename")}>
            <Pencil />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDialog("delete")}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenamePlaygroundDialog
        playgroundId={playgroundId}
        title={title}
        open={dialog === "rename"}
        onOpenChange={closeDialog}
      />
      <DeletePlaygroundDialog
        playgroundId={playgroundId}
        title={title}
        open={dialog === "delete"}
        onOpenChange={closeDialog}
      />
    </>
  );
}
