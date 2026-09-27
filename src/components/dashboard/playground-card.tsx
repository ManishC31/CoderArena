import Link from "next/link";
import { BrandIcon } from "@/components/brand-icon";
import { StarButton } from "@/components/dashboard/star-button";
import { Card } from "@/components/ui/card";
import type { PlaygroundTemplate } from "@/generated/prisma/enums";
import { formatRelativeTime } from "@/lib/relative-time";
import { sandboxTemplates } from "@/lib/sandbox-templates";

type Props = {
  playground: {
    id: string;
    title: string;
    description: string | null;
    template: PlaygroundTemplate;
    starred: boolean;
    createdAt: Date;
  };
};

// The title link stretches over the whole card, so clicking anywhere opens the editor.
export function PlaygroundCard({ playground }: Props) {
  const template = sandboxTemplates.find(({ id }) => id === playground.template);

  return (
    <Card className="relative gap-4 p-4 transition-shadow hover:shadow-md hover:ring-foreground/20">
      <div className="flex items-start justify-between">
        <span className="flex size-10 items-center justify-center rounded-lg border bg-background">
          {template && <BrandIcon icon={template.icon} color={template.color} />}
        </span>
        <StarButton playgroundId={playground.id} title={playground.title} starred={playground.starred} />
      </div>

      <div className="min-w-0">
        <h3 className="truncate font-medium">
          <Link
            href={`/playground/${playground.id}`}
            className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
          >
            {playground.title}
          </Link>
        </h3>
        {playground.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{playground.description}</p>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
        {template && <span className="rounded-sm bg-muted px-1.5 py-0.5">{template.name}</span>}
        <time dateTime={playground.createdAt.toISOString()} title={playground.createdAt.toUTCString()}>
          Created {formatRelativeTime(playground.createdAt)}
        </time>
      </div>
    </Card>
  );
}
