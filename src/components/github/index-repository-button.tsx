"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, RefreshCw, Sparkles } from "lucide-react";
import { startIndexing } from "@/app/(app)/(shell)/github/actions";
import { Button } from "@/components/ui/button";
import type { RepositorySummary } from "@/components/github/types";

// Starts (or restarts) indexing the repository for chat.
export function IndexRepositoryButton({ repositoryId, status }: { repositoryId: string; status: RepositorySummary["indexStatus"] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const indexed = status === "indexed";

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await startIndexing(repositoryId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <>
      <Button
        type="button"
        variant={indexed ? "ghost" : "outline"}
        size="sm"
        onClick={handleClick}
        disabled={pending || status === "indexing"}
        title={indexed ? "Index the latest code again" : "Index the code so you can chat about it"}
      >
        {pending ? <LoaderCircle className="animate-spin" /> : indexed ? <RefreshCw /> : <Sparkles />}
        {indexed ? "Re-index" : status === "failed" ? "Retry indexing" : "Index for chat"}
      </Button>
      {error && (
        <p role="alert" className="basis-full text-xs text-destructive">
          {error}
        </p>
      )}
    </>
  );
}
