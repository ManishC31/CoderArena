import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { safeCallbackUrl } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Log in",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { callbackUrl, error } = await searchParams;

  return (
    <LoginForm
      callbackUrl={safeCallbackUrl(callbackUrl)}
      oauthError={typeof error === "string" ? error : undefined}
    />
  );
}
