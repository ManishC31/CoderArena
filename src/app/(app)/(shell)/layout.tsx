import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { MobileHeader } from "@/components/app-shell/mobile-header";
import { requireSession } from "@/lib/session";

// Sidebar layout for the dashboard, the playground list and settings.
export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireSession();
  const menuUser = { name: user.name, email: user.email, image: user.image ?? null };

  return (
    <div className="flex flex-1">
      <AppSidebar user={menuUser} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader user={menuUser} />
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
