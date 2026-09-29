"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/components/app-shell/nav-items";
import { cn } from "@/lib/utils";

type Props = NavItem & {
  // Called after a click, e.g. to close the mobile menu.
  onNavigate?: () => void;
};

// A sidebar link, highlighted when its page (or one under it) is open.
export function NavLink({ title, href, icon: Icon, onNavigate }: Props) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        active ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "text-muted-foreground",
      )}
    >
      <Icon className={cn("size-4", active && "text-brand")} />
      {title}
    </Link>
  );
}
