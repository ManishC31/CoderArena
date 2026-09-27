"use client";

import { useOptimistic, useTransition } from "react";
import { Star } from "lucide-react";
import { setPlaygroundStarred } from "@/app/(app)/playground/actions";
import { cn } from "@/lib/utils";

type Props = {
  playgroundId: string;
  title: string;
  starred: boolean;
};

export function StarButton({ playgroundId, title, starred }: Props) {
  // Flips immediately; the page re-renders (and re-sorts) once the save finishes.
  // If the save fails, it falls back to the saved value.
  const [optimisticStarred, setOptimisticStarred] = useOptimistic(starred);
  const [, startTransition] = useTransition();

  function toggle() {
    const next = !optimisticStarred;
    startTransition(async () => {
      setOptimisticStarred(next);
      try {
        await setPlaygroundStarred(playgroundId, next);
      } catch (error) {
        console.error("Couldn't update the star", error);
      }
    });
  }

  const label = `${optimisticStarred ? "Unstar" : "Star"} ${title}`;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={optimisticStarred}
      aria-label={label}
      title={optimisticStarred ? "Unstar" : "Star"}
      // Sits above the card's full-size link so it gets its own clicks.
      className="relative z-10 rounded-md p-1.5 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Star className={cn("size-4", optimisticStarred && "fill-amber-400 text-amber-400")} />
    </button>
  );
}
