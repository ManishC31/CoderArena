import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import type { MenuUser } from "@/components/app-shell/user-avatar";
import { UserMenu } from "@/components/app-shell/user-menu";
import { Logo } from "@/components/logo";

// Left sidebar on medium screens and up; MobileHeader replaces it on phones.
export function AppSidebar({ user }: { user: MenuUser }) {
  return (
    <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-14 shrink-0 items-center px-5">
        <Logo href="/dashboard" />
      </div>
      <SidebarNav />
      <div className="border-t border-sidebar-border p-2">
        <UserMenu user={user} variant="sidebar" />
      </div>
    </aside>
  );
}
