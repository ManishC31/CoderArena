import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GridBackground } from "@/components/landing/grid-background";
import { IdeMockup } from "@/components/landing/mockups/ide-mockup";
import { TemplateStrip } from "@/components/landing/template-strip";
import { buttonVariants } from "@/components/ui/button";
import { ScrollTilt } from "@/components/ui/scroll-tilt";
import { cn } from "@/lib/utils";

export function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <GridBackground />
      <div className="mx-auto max-w-6xl px-4 pt-20 pb-12 sm:px-6 md:pt-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 font-mono text-xs text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-brand" />
            Build · Practice · Ship
          </p>
          <h1
            id="hero-title"
            className="mt-6 bg-linear-to-b from-foreground to-foreground/60 bg-clip-text pb-1 text-5xl font-semibold tracking-tighter text-balance text-transparent sm:text-6xl md:text-7xl"
          >
            Code. Build. Practice.{" "}
            <span className="bg-linear-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent dark:from-orange-500 dark:to-amber-300">
              Anywhere.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
            Create isolated development environments, build with your favorite frameworks, connect GitHub repositories,
            and prepare for technical interviews, all from one browser-based workspace.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={signedIn ? "/dashboard" : "/signup"} className={cn(buttonVariants({ size: "lg" }), "h-10 px-4")}>
              Start coding
              <ArrowRight />
            </Link>
            <a href="#editor" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 border-foreground/15 px-4")}>
              Explore playground
            </a>
          </div>
          <div className="mt-12">
            <TemplateStrip />
          </div>
        </div>

        <div className="relative mt-14 md:mt-16">
          <div aria-hidden className="absolute inset-x-12 top-0 -z-10 h-64 rounded-full bg-linear-to-r from-orange-500/25 via-amber-400/20 to-rose-500/20 blur-3xl dark:from-orange-500/20 dark:via-amber-400/10 dark:to-rose-500/15" />
          <ScrollTilt>
            <IdeMockup />
          </ScrollTilt>
        </div>
      </div>
    </section>
  );
}
