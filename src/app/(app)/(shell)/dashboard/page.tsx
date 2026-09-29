import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { siGithub } from "simple-icons";
import { BrandIcon } from "@/components/brand-icon";
import { CreatePlaygroundDialog } from "@/components/dashboard/create-playground-dialog";
import { Greeting } from "@/components/dashboard/greeting";
import { OpenRepositoryDialog } from "@/components/dashboard/open-repository-dialog";
import { PlaygroundCard } from "@/components/dashboard/playground-card";
import { PlaygroundsEmpty } from "@/components/dashboard/playgrounds-empty";
import { PracticeTeaser } from "@/components/dashboard/practice-teaser";
import { TemplateQuickStart } from "@/components/dashboard/template-quick-start";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

// How many playgrounds the dashboard shows; the rest are on /playgrounds.
const RECENT_COUNT = 6;

export default async function DashboardPage() {
  const { user } = await requireSession();
  const firstName = user.name.trim().split(/\s+/)[0];

  // Starred first, then the most recently edited.
  const [recent, total] = await Promise.all([
    prisma.playground.findMany({
      where: { userId: user.id },
      orderBy: [{ starred: "desc" }, { updatedAt: "desc" }],
      take: RECENT_COUNT,
      select: { id: true, title: true, description: true, template: true, starred: true, updatedAt: true },
    }),
    prisma.playground.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Greeting name={firstName} />
          <p className="mt-1 text-muted-foreground">Continue where you left off or start something new.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OpenRepositoryDialog
            trigger={
              <Button variant="outline">
                <BrandIcon icon={siGithub} className="size-4" />
                Import from GitHub
              </Button>
            }
          />
          <CreatePlaygroundDialog
            trigger={
              <Button>
                <Plus />
                New playground
              </Button>
            }
          />
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="recent-title">
          <div className="flex items-center justify-between gap-4">
            <h2 id="recent-title" className="text-sm font-medium">
              Recent playgrounds
            </h2>
            {total > recent.length && (
              <Link
                href="/playgrounds"
                className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                View all {total}
                <ArrowRight className="size-3.5" />
              </Link>
            )}
          </div>
          <div className="mt-3">
            {recent.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {recent.map((playground) => (
                  <PlaygroundCard key={playground.id} playground={playground} />
                ))}
              </ul>
            ) : (
              <PlaygroundsEmpty />
            )}
          </div>
        </section>

        <div className="flex flex-col gap-8">
          <TemplateQuickStart />
          <PracticeTeaser />
        </div>
      </div>
    </div>
  );
}
