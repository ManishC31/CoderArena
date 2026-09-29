import { FlaskConical, FolderGit2 } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

export type Challenge = {
  area: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  // How the submission is checked, e.g. "API tests".
  checks: string;
};

const difficultyClass: Record<Challenge["difficulty"], string> = {
  Easy: "text-emerald-700 dark:text-emerald-400",
  Medium: "text-amber-700 dark:text-amber-300",
  Hard: "text-rose-700 dark:text-rose-400",
};

// A development challenge: a realistic task on a starter repository, checked by tests.
export function ChallengeCard({ area, title, difficulty, checks }: Challenge) {
  return (
    <li className="relative flex flex-col rounded-xl border bg-card p-5">
      <GlowingEffect />
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-muted-foreground">{area}</span>
        <span className={cn("font-medium", difficultyClass[difficulty])}>{difficulty}</span>
      </div>
      <h3 className="mt-3 font-medium text-pretty">{title}</h3>
      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <FolderGit2 className="size-3.5" />
          Starter repository
        </span>
        <span className="flex items-center gap-1.5">
          <FlaskConical className="size-3.5" />
          {checks}
        </span>
      </div>
    </li>
  );
}
