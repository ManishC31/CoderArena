import { FolderCode, FolderGit2, LayoutDashboard, ListChecks, Settings, Target, type LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

// Sections of the app, in the sidebar. Add new pages here.
export const mainNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Playgrounds", href: "/playgrounds", icon: FolderCode },
];

// Planned sections (design.md, section 29), shown disabled until they exist.
export const upcomingNavItems: Omit<NavItem, "href">[] = [
  { title: "GitHub", icon: FolderGit2 },
  { title: "Practice", icon: Target },
  { title: "Submissions", icon: ListChecks },
];

export const settingsNavItem: NavItem = { title: "Settings", href: "/settings", icon: Settings };
