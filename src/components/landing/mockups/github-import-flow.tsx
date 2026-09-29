import { ArrowDown, LoaderCircle } from "lucide-react";
import { GitHubImportDialog } from "@/components/landing/mockups/github-import-dialog";
import { GitHubWorkspaceMockup } from "@/components/landing/mockups/github-workspace-mockup";

// Importing a repository: pick it, wait for the environment, then edit it in the workspace.
export function GitHubImportFlow() {
  return (
    <div className="flex flex-col">
      <div className="w-full max-w-md self-center lg:self-start">
        <GitHubImportDialog />
      </div>
      <p className="flex items-center gap-2.5 self-center py-5 font-mono text-xs text-muted-foreground">
        <ArrowDown className="size-3.5" />
        <LoaderCircle className="size-3.5 animate-spin text-brand motion-reduce:animate-none" />
        Preparing your development environment…
      </p>
      <GitHubWorkspaceMockup />
    </div>
  );
}
