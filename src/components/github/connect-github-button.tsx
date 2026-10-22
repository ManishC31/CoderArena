"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { siGithub } from "simple-icons";
import { BrandIcon } from "@/components/brand-icon";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type Props = Omit<React.ComponentProps<typeof Button>, "onClick"> & {
  // Where GitHub sends the user back to.
  callbackUrl?: string;
  label?: string;
};

// Links a GitHub account to the signed-in user (OAuth with the "repo" scope), for private
// repositories, syncing and indexing.
export function ConnectGithubButton({ callbackUrl = "/github", label = "Connect GitHub", disabled, ...props }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    // On success the browser is redirected to GitHub.
    const { error } = await authClient.linkSocial({ provider: "github", callbackURL: callbackUrl });
    if (error) {
      setError(error.message ?? "GitHub isn't available right now.");
      setPending(false);
    }
  }

  return (
    <>
      <Button type="button" {...props} onClick={handleClick} disabled={disabled || pending}>
        {pending ? <LoaderCircle className="animate-spin" /> : <BrandIcon icon={siGithub} className="size-4" />}
        {label}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </>
  );
}
