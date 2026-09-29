"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import type { MenuUser } from "@/components/app-shell/user-avatar";
import { UserMenu } from "@/components/app-shell/user-menu";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

// Top bar on phones: logo, a menu button that slides the sidebar in, and the account menu.
export function MobileHeader({ user }: { user: MenuUser }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-2 backdrop-blur md:hidden">
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Trigger render={<Button variant="ghost" size="icon" aria-label="Open menu" />}>
          <Menu />
        </DialogPrimitive.Trigger>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/30 duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <DialogPrimitive.Popup className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r bg-sidebar text-sidebar-foreground duration-200 outline-none data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left">
            <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
            <div className="flex h-14 shrink-0 items-center px-5">
              <Logo href="/dashboard" />
            </div>
            <SidebarNav onNavigate={() => setOpen(false)} />
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
      <Logo href="/dashboard" />
      <div className="ml-auto">
        <UserMenu user={user} />
      </div>
    </header>
  );
}
