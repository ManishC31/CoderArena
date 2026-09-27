import { AppNavbar } from "@/components/app-shell/app-navbar";
import { requireSession } from "@/lib/session";

// Shell for signed-in pages (the (app) group doesn't appear in the URL).
// Pages still call requireSession() themselves: layouts don't re-render on every navigation.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireSession();

  return (
    <div className="flex min-h-svh flex-col">
      <AppNavbar user={{ name: user.name, email: user.email, image: user.image ?? null }} />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
