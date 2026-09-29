import { requireSession } from "@/lib/session";

// Signed-in pages (the (app) group doesn't appear in the URL). Pages in (shell) get the sidebar;
// the playground editor has its own header. Pages still call requireSession() themselves:
// layouts don't re-render on every navigation.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireSession();

  return <div className="flex min-h-svh flex-col">{children}</div>;
}
