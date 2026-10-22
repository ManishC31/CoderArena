"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Search } from "lucide-react";
import { RepositoryCard } from "@/components/github/repository-card";
import { repositoriesHref, RepositoryPagination } from "@/components/github/repository-pagination";
import type { RepositorySummary } from "@/components/github/types";
import { Input } from "@/components/ui/input";

// How often the page reloads while a repository is indexing, to show when it's done.
const POLL_INTERVAL_MS = 5_000;
// Wait for a pause in typing before searching.
const SEARCH_DELAY_MS = 300;

type Props = {
  // The current page's repositories.
  repos: RepositorySummary[];
  query: string;
  page: number;
  pageCount: number;
  pageSize: number;
  // Repositories matching the search, on all pages.
  total: number;
};

// One page of the synced repositories, with a search box. The search and page live in the URL
// (?q=…&page=…), so the server only sends the page being shown.
export function RepositoryBrowser({ repos, query, page, pageCount, pageSize, total }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(query);
  const [searching, startSearch] = useTransition();
  const indexing = repos.some((repo) => repo.indexStatus === "indexing");

  useEffect(() => {
    if (!indexing) return;
    const timer = setInterval(() => router.refresh(), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [indexing, router]);

  // A new search starts from the first page.
  useEffect(() => {
    const terms = search.trim();
    if (terms === query) return;
    const timer = setTimeout(() => {
      startSearch(() => router.replace(repositoriesHref(1, terms), { scroll: false }));
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [search, query, router]);

  const first = (page - 1) * pageSize + 1;
  const last = first + repos.length - 1;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Search repositories"
            placeholder="Search repositories…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pr-8 pl-8"
          />
          {searching && (
            <LoaderCircle className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        {total > 0 && (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {first}–{last} of {total} {total === 1 ? "repository" : "repositories"}
          </p>
        )}
      </div>

      {repos.length > 0 ? (
        <ul className="grid gap-3 lg:grid-cols-2">
          {repos.map((repo) => (
            <RepositoryCard key={repo.id} repo={repo} />
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          No repositories match “{query}”.
        </p>
      )}

      <RepositoryPagination page={page} pageCount={pageCount} query={query} />
    </div>
  );
}
