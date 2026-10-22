"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { syncGithubRepositories } from "@/app/(app)/(shell)/github/actions";
import { Button } from "@/components/ui/button";

// Pulls the user's repository list from GitHub.
export function SyncButton({ variant = "outline" }: { variant?: "default" | "outline" }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await syncGithubRepositories();
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant={variant} onClick={handleClick} disabled={pending}>
        {pending ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}
        {pending ? "Syncing…" : "Sync from GitHub"}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
