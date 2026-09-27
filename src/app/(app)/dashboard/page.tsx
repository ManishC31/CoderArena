import type { Metadata } from "next";
import { FolderCode } from "lucide-react";
import { CreatePlaygroundCard } from "@/components/dashboard/create-playground-card";
import { OpenRepositoryCard } from "@/components/dashboard/open-repository-card";
import { PlaygroundCard } from "@/components/dashboard/playground-card";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { user } = await requireSession();
  const firstName = user.name.trim().split(/\s+/)[0];

  // Starred first, then newest.
  const playgrounds = await prisma.playground.findMany({
    where: { userId: user.id },
    orderBy: [{ starred: "desc" }, { createdAt: "desc" }],
    select: { id: true, title: true, description: true, template: true, starred: true, createdAt: true },
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {firstName}</h1>
        <p className="mt-1 text-muted-foreground">
          Start something new or pick up where you left off.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CreatePlaygroundCard />
        <OpenRepositoryCard />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Your playgrounds
          {playgrounds.length > 0 && <span className="ml-1.5 tabular-nums">({playgrounds.length})</span>}
        </h2>
        {playgrounds.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {playgrounds.map((playground) => (
              <PlaygroundCard key={playground.id} playground={playground} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center">
            <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <FolderCode className="size-5 text-muted-foreground" />
            </span>
            <h3 className="font-medium">No playgrounds yet</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Create one from a template or open a GitHub repository to get started.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
