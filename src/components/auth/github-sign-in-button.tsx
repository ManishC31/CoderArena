"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { siGithub } from "simple-icons";
import { BrandIcon } from "@/components/brand-icon";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import { LOGIN_ROUTE } from "@/lib/routes";

type Props = {
  callbackUrl: string;
  onError: (message: string) => void;
};

// Signing in with GitHub also connects it, so repositories are ready on /github.
export function GithubSignInButton({ callbackUrl, onError }: Props) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    // On success the browser is redirected to GitHub, so there's nothing else to do here.
    const { error } = await signIn.social({
      provider: "github",
      callbackURL: callbackUrl,
      errorCallbackURL: LOGIN_ROUTE,
    });
    if (error) {
      onError(error.message ?? "GitHub sign-in isn't available right now.");
      setPending(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="lg" className="w-full" onClick={handleClick} disabled={pending}>
      {pending ? <LoaderCircle className="animate-spin" /> : <BrandIcon icon={siGithub} className="size-4" />}
      Continue with GitHub
    </Button>
  );
}
