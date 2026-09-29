"use client";

// A client component, so the icon components in nav-items can be passed to NavLink.
import { mainNavItems, settingsNavItem, upcomingNavItems } from "@/components/app-shell/nav-items";
import { NavLink } from "@/components/app-shell/nav-link";

// The app's sections: main pages, planned ones (disabled), and settings at the bottom.
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="flex flex-1 flex-col gap-6 p-3">
      <ul className="grid gap-0.5">
        {mainNavItems.map((item) => (
          <li key={item.href}>
            <NavLink {...item} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>

      <div>
        <p className="px-2.5 pb-1.5 text-xs font-medium text-muted-foreground">Coming soon</p>
        <ul className="grid gap-0.5">
          {upcomingNavItems.map(({ title, icon: Icon }) => (
            <li
              key={title}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground/70"
            >
              <Icon className="size-4" />
              {title}
              <span className="ml-auto rounded-full border px-1.5 font-mono text-[10px]">Soon</span>
            </li>
          ))}
        </ul>
      </div>

      <ul className="mt-auto grid gap-0.5">
        <li>
          <NavLink {...settingsNavItem} onNavigate={onNavigate} />
        </li>
      </ul>
    </nav>
  );
}
