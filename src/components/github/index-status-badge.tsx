import { CircleAlert, LoaderCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RepositorySummary } from "@/components/github/types";

// Whether a repository is ready for chat. Nothing for repositories that were never indexed.
export function IndexStatusBadge({ status, fileCount }: Pick<RepositorySummary, "fileCount"> & { status: RepositorySummary["indexStatus"] }) {
  if (status === "indexing") {
    return (
      <Badge variant="secondary">
        <LoaderCircle className="animate-spin" />
        Indexing
      </Badge>
    );
  }
  if (status === "indexed") {
    return (
      <Badge variant="brand" title={`${fileCount} files indexed`}>
        <Sparkles />
        Chat ready
      </Badge>
    );
  }
  if (status === "failed") {
    return (
      <Badge variant="destructive">
        <CircleAlert />
        Indexing failed
      </Badge>
    );
  }
  return null;
}
