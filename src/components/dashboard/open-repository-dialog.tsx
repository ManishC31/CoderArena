"use client";

import { useState, type FormEvent } from "react";
import { GitBranch, Lock } from "lucide-react";
import { siGithub } from "simple-icons";
import { BrandIcon } from "@/components/brand-icon";
import { ComingSoonBadge } from "@/components/coming-soon-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// github.com/owner/repo, with or without https://, www. or a trailing .git
const GITHUB_REPO_URL = /^(https?:\/\/)?(www\.)?github\.com\/[\w.-]+\/[\w.-]+?(\.git)?\/?$/i;

// "Import from GitHub": clone a repository into a new playground. Not wired up yet, so
// submitting is disabled.
export function OpenRepositoryDialog({ trigger }: { trigger: React.ReactElement }) {
  const [url, setUrl] = useState("");
  const isValid = GITHUB_REPO_URL.test(url.trim());
  const showError = url.trim() !== "" && !isValid;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: clone the repository into a new playground.
  }

  return (
    <Dialog onOpenChange={(open) => open && setUrl("")}>
      <DialogTrigger render={trigger} />

      <DialogContent className="max-h-[calc(100svh-2rem)] gap-5 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Import from GitHub
            <ComingSoonBadge />
          </DialogTitle>
          <DialogDescription>Paste a repository URL to clone it into a new playground.</DialogDescription>
        </DialogHeader>

        <form id="open-repository" onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="repository-url">Repository URL</Label>
            <div className="relative">
              <BrandIcon
                icon={siGithub}
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="repository-url"
                name="url"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                placeholder="https://github.com/owner/repository"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                aria-invalid={showError}
                aria-describedby="repository-url-hint"
                className="pl-8"
              />
            </div>
            <p
              id="repository-url-hint"
              className={showError ? "text-xs text-destructive" : "text-xs text-muted-foreground"}
            >
              {showError
                ? "Enter a GitHub URL like https://github.com/owner/repository."
                : "Public repositories can be cloned right away."}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="repository-branch">
              Branch <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <div className="relative">
              <GitBranch className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="repository-branch"
                name="branch"
                autoComplete="off"
                spellCheck={false}
                placeholder="main"
                className="pl-8"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
            <Lock className="size-4 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Private repository?</p>
              <p className="text-xs text-muted-foreground">Connect your GitHub account to clone private repositories.</p>
            </div>
            {/* TODO: start the GitHub account connection. */}
            <Button type="button" variant="outline" size="sm" disabled>
              <BrandIcon icon={siGithub} className="size-3.5" />
              Connect
            </Button>
          </div>
        </form>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button type="submit" form="open-repository" disabled>
            Clone repository
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
