import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";
import { safeCallbackUrl } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Sign up",
};

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { callbackUrl } = await searchParams;

  return <SignupForm callbackUrl={safeCallbackUrl(callbackUrl)} />;
}
