import { ComingSoonBadge } from "@/components/coming-soon-badge";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  eyebrow: string;
  title: string;
  description: React.ReactNode;
  // Marks a feature that isn't available yet.
  comingSoon?: boolean;
  className?: string;
  children: React.ReactNode;
};

// A landing page section: a heading block, then the section's content.
export function Section({ id, eyebrow, title, description, comingSoon, className, children }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("scroll-mt-14", className)}>
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <p className="font-mono text-xs tracking-wider text-brand uppercase">{eyebrow}</p>
            {comingSoon && <ComingSoonBadge />}
          </div>
          <h2 id={`${id}-title`} className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-base text-pretty text-muted-foreground sm:text-lg">{description}</p>
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
