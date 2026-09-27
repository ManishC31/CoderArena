import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LOGIN_ROUTE } from "@/lib/routes";

// Validates the session against the database. Cached so it runs once per request.
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

// Use in private pages, layouts and server actions: returns the session or redirects to login.
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect(LOGIN_ROUTE);
  return session;
}
