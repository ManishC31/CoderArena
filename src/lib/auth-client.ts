import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

// Same-origin as the app, so no baseURL is needed.
export const authClient = createAuthClient({
  // Types session.user.role / authType from the server config (type-only import).
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
