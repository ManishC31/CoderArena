import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

// Secret and base URL come from BETTER_AUTH_SECRET / BETTER_AUTH_URL.
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    // Authorized redirect URI in Google Cloud Console: {BETTER_AUTH_URL}/api/auth/callback/google
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    // input: false — clients can't set these on sign-up or profile updates.
    // required: true matches the NOT NULL columns; defaultValue fills them on create.
    additionalFields: {
      role: {
        type: ["admin", "user", "premium_user"],
        required: true,
        defaultValue: "user",
        input: false,
      },
      authType: {
        type: ["email", "google"],
        required: true,
        defaultValue: "email",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Record the sign-up method. Google arrives via the OAuth callback (/callback/:id)
        // or an ID-token sign-in (body.provider); everything else is email & password.
        before: async (user, ctx) => {
          const provider = ctx?.params?.id ?? ctx?.body?.provider;
          return {
            data: { ...user, authType: provider === "google" ? "google" : "email" },
          };
        },
      },
    },
  },
  // Must stay last: lets server actions that call auth.api set cookies.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
