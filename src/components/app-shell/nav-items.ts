import {
  FolderCode,
  FolderGit2,
  LayoutDashboard,
  ListChecks,
  MessagesSquare,
  Settings,
  Target,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

// Sections of the app, in the sidebar. Add new pages here.
export const mainNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Playgrounds", href: "/playgrounds", icon: FolderCode },
  { title: "GitHub", href: "/github", icon: FolderGit2 },
  { title: "Chat", href: "/chat", icon: MessagesSquare },
];

// Planned sections (design.md, section 29), shown disabled until they exist.
export const upcomingNavItems: Omit<NavItem, "href">[] = [
  { title: "Practice", icon: Target },
  { title: "Submissions", icon: ListChecks },
];

export const settingsNavItem: NavItem = { title: "Settings", href: "/settings", icon: Settings };
