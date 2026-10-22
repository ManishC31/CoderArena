import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConnectGithubButton } from "@/components/github/connect-github-button";
import { getGithubAccount, getGithubLogin, getGithubToken } from "@/lib/github";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Settings",
};

const signInMethodLabels = { email: "Email & password", github: "GitHub" } as const;
const roleLabels = { admin: "Admin", user: "User", premium_user: "Premium" } as const;

export default async function SettingsPage() {
  const { user } = await requireSession();
  const githubAccount = await getGithubAccount(user.id);
  const githubToken = githubAccount ? await getGithubToken(user.id).catch(() => null) : null;
  const githubLogin = githubToken ? await getGithubLogin(githubToken) : null;

  const details = [
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Signed up with", value: signInMethodLabels[user.authType] },
    { label: "Plan", value: roleLabels[user.role] },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your CoderArena account details.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            {details.map(({ label, value }) => (
              <div key={label} className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-3">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="text-sm font-medium sm:col-span-2">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>GitHub</CardTitle>
          <CardDescription>Import private repositories into playgrounds and chat about your code.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            {githubLogin ? (
              <>
                Connected as <span className="font-medium">@{githubLogin}</span>
              </>
            ) : githubAccount ? (
              <span className="text-muted-foreground">The connection stopped working. Reconnect to keep syncing.</span>
            ) : (
              <span className="text-muted-foreground">Not connected.</span>
            )}
          </p>
          {!githubLogin && (
            <div className="flex flex-col items-end gap-1">
              <ConnectGithubButton
                variant="outline"
                callbackUrl="/settings"
                label={githubAccount ? "Reconnect GitHub" : "Connect GitHub"}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
