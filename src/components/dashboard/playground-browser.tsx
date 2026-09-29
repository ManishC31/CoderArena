"use client";

import { useDeferredValue, useState } from "react";
import { Search } from "lucide-react";
import { BrandIcon } from "@/components/brand-icon";
import { PlaygroundCard, type PlaygroundSummary } from "@/components/dashboard/playground-card";
import { Input } from "@/components/ui/input";
import type { PlaygroundTemplate } from "@/generated/prisma/enums";
import { sandboxTemplates } from "@/lib/sandbox-templates";
import { cn } from "@/lib/utils";

// All of the user's playgrounds, with a search box and a template filter.
export function PlaygroundBrowser({ playgrounds }: { playgrounds: PlaygroundSummary[] }) {
  const [query, setQuery] = useState("");
  const [template, setTemplate] = useState<PlaygroundTemplate | null>(null);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const visible = playgrounds.filter(
    (playground) =>
      (!template || playground.template === template) &&
      (!deferredQuery ||
        playground.title.toLowerCase().includes(deferredQuery) ||
        playground.description?.toLowerCase().includes(deferredQuery)),
  );
  // Only offer templates the user has playgrounds for.
  const usedTemplates = sandboxTemplates.filter(({ id }) => playgrounds.some((playground) => playground.template === id));

  const filterClass = (active: boolean) =>
    cn(
      "flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
      active ? "border-foreground/20 bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Search playgrounds"
            placeholder="Search playgrounds…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-8"
          />
        </div>
        {usedTemplates.length > 1 && (
          <div role="group" aria-label="Filter by template" className="flex flex-wrap gap-1.5">
            <button type="button" aria-pressed={!template} onClick={() => setTemplate(null)} className={filterClass(!template)}>
              All
            </button>
            {usedTemplates.map(({ id, name, icon, color }) => (
              <button
                key={id}
                type="button"
                aria-pressed={template === id}
                onClick={() => setTemplate(template === id ? null : id)}
                className={filterClass(template === id)}
              >
                <BrandIcon icon={icon} color={color} className="size-3.5" />
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {visible.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((playground) => (
            <PlaygroundCard key={playground.id} playground={playground} />
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          No playgrounds match your search.
        </p>
      )}
    </div>
  );
}
