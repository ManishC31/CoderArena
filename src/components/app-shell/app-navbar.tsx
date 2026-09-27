"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { UserMenu, type NavbarUser } from "@/components/app-shell/user-menu";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

// Add new sections of the app here.
const navItems = [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }];

// Top bar for signed-in pages: logo and sections on the left, account menu at the right end.
export function AppNavbar({ user }: { user: NavbarUser }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-6 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <Logo href="/dashboard" />
      <nav aria-label="Main" className="flex items-center gap-1">
        {navItems.map(({ title, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                active ? "bg-muted text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
              {title}
            </Link>
          );
        })}
      </nav>
      <div className="ml-auto">
        <UserMenu user={user} />
      </div>
    </header>
  );
}
