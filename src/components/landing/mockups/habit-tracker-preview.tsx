import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// The hero playground's app as it renders in the preview (an iframe, so always light).

const habits = [
  { name: "Review pull requests", done: true },
  { name: "Solve a graph problem", done: false },
  { name: "Write API tests", done: false },
];

export function HabitTrackerPreview() {
  const done = habits.filter((habit) => habit.done).length;

  return (
    <div className="h-full bg-white p-7 font-sans text-neutral-900">
      <p className="text-2xl font-bold">Today</p>
      <p className="mt-1 text-sm text-neutral-500">
        {done} of {habits.length} done
      </p>
      <ul className="mt-5 space-y-2.5 text-sm">
        {habits.map(({ name, done }) => (
          <li key={name} className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex size-4 items-center justify-center rounded-sm border",
                done ? "border-orange-500 bg-orange-500 text-white" : "border-neutral-400",
              )}
            >
              {done && <Check className="size-3" strokeWidth={3} />}
            </span>
            <span className={cn(done && "text-neutral-400 line-through")}>{name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
