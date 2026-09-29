import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { CreatePlaygroundDialog } from "@/components/dashboard/create-playground-dialog";
import { PlaygroundBrowser } from "@/components/dashboard/playground-browser";
import { PlaygroundsEmpty } from "@/components/dashboard/playgrounds-empty";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Playgrounds",
};

export default async function PlaygroundsPage() {
  const { user } = await requireSession();

  // Starred first, then the most recently edited.
  const playgrounds = await prisma.playground.findMany({
    where: { userId: user.id },
    orderBy: [{ starred: "desc" }, { updatedAt: "desc" }],
    select: { id: true, title: true, description: true, template: true, starred: true, updatedAt: true },
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Playgrounds</h1>
          <p className="mt-1 text-muted-foreground">
            {playgrounds.length === 1 ? "1 playground" : `${playgrounds.length} playgrounds`}, starred first.
          </p>
        </div>
        <CreatePlaygroundDialog
          trigger={
            <Button>
              <Plus />
              New playground
            </Button>
          }
        />
      </header>

      <div className="mt-8">
        {playgrounds.length > 0 ? <PlaygroundBrowser playgrounds={playgrounds} /> : <PlaygroundsEmpty />}
      </div>
    </div>
  );
}
