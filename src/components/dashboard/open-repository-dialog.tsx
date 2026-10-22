"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { GitBranch, LoaderCircle, Lock } from "lucide-react";
import { siGithub } from "simple-icons";
import { importRepository } from "@/app/(app)/playground/actions";
import { BrandIcon } from "@/components/brand-icon";
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

// "Import from GitHub": copy a repository into a new playground and open it in the editor
// (the action redirects). Private repositories need a connected GitHub account (/github).
export function OpenRepositoryDialog({ trigger }: { trigger: React.ReactElement }) {
  const [url, setUrl] = useState("");
  const [state, formAction, pending] = useActionState(importRepository, null);
  const isValid = GITHUB_REPO_URL.test(url.trim());
  const showError = url.trim() !== "" && !isValid;

  return (
    <Dialog onOpenChange={(open) => open && setUrl("")}>
      <DialogTrigger render={trigger} />

      <DialogContent className="max-h-[calc(100svh-2rem)] gap-5 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import from GitHub</DialogTitle>
          <DialogDescription>Paste a repository URL to open it in a new playground.</DialogDescription>
        </DialogHeader>

        <form id="open-repository" action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="repository-url">Repository URL</Label>
            <div className="relative">
              <BrandIcon
                icon={siGithub}
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="repository-url"
                name="repository"
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
                : "Public repositories can be imported right away. Up to 200 text files."}
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
                placeholder="Default branch"
                className="pl-8"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
            <Lock className="size-4 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Private repository?</p>
              <p className="text-xs text-muted-foreground">Connect your GitHub account to import private repositories.</p>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/github" />} nativeButton={false}>
              <BrandIcon icon={siGithub} className="size-3.5" />
              GitHub
            </Button>
          </div>

          {state?.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
        </form>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button type="submit" form="open-repository" disabled={!isValid || pending}>
            {pending && <LoaderCircle className="animate-spin" />}
            {pending ? "Preparing your environment…" : "Import repository"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
