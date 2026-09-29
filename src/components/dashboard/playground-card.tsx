import Link from "next/link";
import { Clock } from "lucide-react";
import { BrandIcon } from "@/components/brand-icon";
import { PlaygroundMenu } from "@/components/dashboard/playground-menu";
import { StarButton } from "@/components/dashboard/star-button";
import type { PlaygroundTemplate } from "@/generated/prisma/enums";
import { formatRelativeTime } from "@/lib/relative-time";
import { sandboxTemplates } from "@/lib/sandbox-templates";

export type PlaygroundSummary = {
  id: string;
  title: string;
  description: string | null;
  template: PlaygroundTemplate;
  starred: boolean;
  updatedAt: Date;
};

// The title link stretches over the whole card, so clicking anywhere opens the editor.
export function PlaygroundCard({ playground }: { playground: PlaygroundSummary }) {
  const template = sandboxTemplates.find(({ id }) => id === playground.template);

  return (
    <li className="relative flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-foreground/20 has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
          {template && <BrandIcon icon={template.icon} color={template.color} />}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium">
            <Link
              href={`/playground/${playground.id}`}
              className="outline-none after:absolute after:inset-0 after:rounded-xl"
            >
              {playground.title}
            </Link>
          </h3>
          {template && (
            <p className="text-xs text-muted-foreground">
              {template.name} · {template.category}
            </p>
          )}
        </div>
        <div className="-mt-1 -mr-1 flex items-center">
          <StarButton playgroundId={playground.id} title={playground.title} starred={playground.starred} />
          <PlaygroundMenu playgroundId={playground.id} title={playground.title} />
        </div>
      </div>

      {playground.description && <p className="line-clamp-2 text-sm text-muted-foreground">{playground.description}</p>}

      <p className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="size-3.5" />
        Edited{" "}
        {/* Relative to now, so the browser's render can differ from the server's by a minute. */}
        <time
          dateTime={playground.updatedAt.toISOString()}
          title={playground.updatedAt.toUTCString()}
          suppressHydrationWarning
        >
          {formatRelativeTime(playground.updatedAt)}
        </time>
      </p>
    </li>
  );
}
