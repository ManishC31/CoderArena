import { Target } from "lucide-react";
import { ComingSoonBadge } from "@/components/coming-soon-badge";

const tracks = [
  { name: "Algorithms", detail: "JavaScript, TypeScript, Python" },
  { name: "Frontend", detail: "React and Next.js challenges" },
  { name: "Backend", detail: "APIs, middleware, databases" },
];

// Placeholder for interview practice until it exists (design.md, sections 17–21).
export function PracticeTeaser() {
  return (
    <section aria-labelledby="practice-title" className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-md bg-brand/10 text-brand">
          <Target className="size-4" />
        </span>
        <h2 id="practice-title" className="text-sm font-medium">
          Interview practice
        </h2>
        <ComingSoonBadge />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Solve problems and realistic development tasks, checked by automated tests.
      </p>
      <ul className="mt-3 space-y-2">
        {tracks.map(({ name, detail }) => (
          <li key={name} className="flex items-baseline justify-between gap-3 text-sm">
            <span>{name}</span>
            <span className="truncate text-xs text-muted-foreground">{detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
