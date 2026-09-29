import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GridBackground } from "@/components/landing/grid-background";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Closing call to action.
export function CtaSection({ signedIn }: { signedIn: boolean }) {
  return (
    <section aria-labelledby="cta-title" className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
      <div className="relative isolate overflow-hidden rounded-2xl border bg-card px-6 py-16 text-center sm:py-20">
        <GridBackground />
        <div aria-hidden className="absolute inset-x-1/4 -top-24 -z-10 h-48 rounded-full bg-linear-to-r from-orange-500/30 via-amber-400/25 to-rose-500/25 blur-3xl dark:from-orange-500/20 dark:via-amber-400/10 dark:to-rose-500/15" />
        <h2 id="cta-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Build. Practice. Ship.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Start a playground in your browser. There&apos;s nothing to install.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={signedIn ? "/dashboard" : "/signup"} className={cn(buttonVariants({ size: "lg" }), "h-10 px-4")}>
            Start coding
            <ArrowRight />
          </Link>
          {!signedIn && (
            <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 border-foreground/15 px-4")}>
              Log in
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
