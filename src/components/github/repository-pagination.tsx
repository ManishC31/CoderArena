import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  pageCount: number;
  // The search, kept on every page link.
  query: string;
};

// /github?q=…&page=…, leaving out the defaults.
export function repositoriesHref(page: number, query: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/github?${search}` : "/github";
}

// The first and last pages, and the ones around the current page, with gaps between:
// 1 … 4 5 6 … 12
function visiblePages(page: number, pageCount: number) {
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? (["gap", p] as const) : [p]));
}

export function RepositoryPagination({ page, pageCount, query }: Props) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label="Repository pages" className="flex items-center justify-center gap-1">
      <PageButton href={page > 1 ? repositoriesHref(page - 1, query) : undefined} label="Previous page">
        <ChevronLeft />
        <span className="hidden sm:inline">Previous</span>
      </PageButton>

      {visiblePages(page, pageCount).map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} className="px-1.5 text-sm text-muted-foreground" aria-hidden="true">
            …
          </span>
        ) : (
          <Button
            key={item}
            variant={item === page ? "outline" : "ghost"}
            size="icon"
            className={cn(item === page && "pointer-events-none font-semibold")}
            render={<Link href={repositoriesHref(item, query)} />}
            nativeButton={false}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </Button>
        ),
      )}

      <PageButton href={page < pageCount ? repositoriesHref(page + 1, query) : undefined} label="Next page">
        <span className="hidden sm:inline">Next</span>
        <ChevronRight />
      </PageButton>
    </nav>
  );
}

// Previous / Next: a link, or a disabled button at either end.
function PageButton({ href, label, children }: { href?: string; label: string; children: React.ReactNode }) {
  if (!href) {
    return (
      <Button variant="ghost" disabled aria-label={label}>
        {children}
      </Button>
    );
  }
  return (
    <Button variant="ghost" render={<Link href={href} />} nativeButton={false} aria-label={label}>
      {children}
    </Button>
  );
}
