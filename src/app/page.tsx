import Link from "next/link";
import { ArrowRight, ChartLine, CodeXml, Trophy } from "lucide-react";
import { EditorPreview } from "@/components/landing/editor-preview";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/session";

const features = [
  {
    icon: CodeXml,
    title: "Editor in your browser",
    description: "Write and run code without installing anything. Open a tab and start solving.",
  },
  {
    icon: Trophy,
    title: "Coding challenges",
    description: "Work through problems from warm-ups to interview-level puzzles, checked by real tests.",
  },
  {
    icon: ChartLine,
    title: "Track your progress",
    description: "See what you've solved and where to focus next, all in one place.",
  },
];

export default async function Home() {
  const session = await getSession();
  const user = session?.user ?? null;

  return (
    <>
      <SiteHeader user={user} />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] bg-size-[20px_20px] mask-[radial-gradient(ellipse_at_top,black,transparent_70%)]"
          />
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2">
            <div className="flex flex-col items-start gap-6">
              <span className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                Write · Run · Compete
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Sharpen your coding skills in the arena
              </h1>
              <p className="max-w-lg text-lg text-pretty text-muted-foreground">
                Solve challenges in a fast in-browser editor, run your code against tests and track
                your progress. No setup required.
              </p>
              {user ? (
                <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
                  Go to dashboard
                  <ArrowRight />
                </Link>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <Link href="/signup" className={buttonVariants({ size: "lg" })}>
                    Get started
                    <ArrowRight />
                  </Link>
                  <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg" })}>
                    Log in
                  </Link>
                </div>
              )}
            </div>

            <EditorPreview />
          </div>
        </section>

        <section className="border-t bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <h2 className="text-2xl font-semibold tracking-tight">Everything you need to practice</h2>
            <p className="mt-2 text-muted-foreground">One place to write code, test it and get better.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <Card key={title}>
                  <CardHeader>
                    <span className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Icon className="size-4" />
                    </span>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {!user && (
          <section className="border-t">
            <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Ready to step into the arena?</h2>
                <p className="mt-2 text-muted-foreground">Create a free account and solve your first challenge.</p>
              </div>
              <Link href="/signup" className={buttonVariants({ size: "lg" })}>
                Create your account
                <ArrowRight />
              </Link>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-sm text-muted-foreground sm:px-6">
          <span>© {new Date().getFullYear()} CodeArena</span>
        </div>
      </footer>
    </>
  );
}
