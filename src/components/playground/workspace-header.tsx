import Link from "next/link";
import { ChevronRight, LoaderCircle, Play, Save, Square } from "lucide-react";
import type { MenuUser } from "@/components/app-shell/user-avatar";
import { UserMenu } from "@/components/app-shell/user-menu";
import { Logo } from "@/components/logo";
import { SaveStatus } from "@/components/playground/save-status";
import type { SaveStatus as Status } from "@/components/playground/use-autosave";
import type { PreviewState } from "@/components/playground/use-preview";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  // Template logo shown before the title.
  icon?: React.ReactNode;
  user: MenuUser;
  saveStatus: Status;
  closing: boolean;
  onSaveAndClose: () => void;
  // Left out for templates that can't run in a sandbox.
  preview?: {
    state: PreviewState;
    onRun: () => void;
    onStop: () => void;
  };
};

// The editor's top bar: where you are, whether it's saved, and Run / Save and close.
export function WorkspaceHeader({ title, icon, user, saveStatus, closing, onSaveAndClose, preview }: Props) {
  const running = preview && (preview.state.status === "running" || preview.state.status === "starting");

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-3">
      <Logo href="/dashboard" iconOnly />
      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex items-center gap-1.5 text-sm">
          <li className="hidden sm:block">
            <Link href="/playgrounds" className="text-muted-foreground transition-colors hover:text-foreground">
              Playgrounds
            </Link>
          </li>
          <li aria-hidden className="hidden text-muted-foreground sm:block">
            <ChevronRight className="size-3.5" />
          </li>
          <li aria-current="page" className="flex min-w-0 items-center gap-2 font-medium">
            {icon}
            <span className="truncate">{title}</span>
          </li>
        </ol>
      </nav>
      <div className="hidden md:block">
        <SaveStatus status={saveStatus} closing={closing} />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {preview &&
          (running ? (
            <Button variant="outline" size="sm" onClick={preview.onStop}>
              {preview.state.status === "starting" ? <LoaderCircle className="animate-spin" /> : <Square />}
              Stop
            </Button>
          ) : (
            <Button size="sm" onClick={preview.onRun}>
              <Play />
              Run
            </Button>
          ))}
        <Button variant="outline" size="sm" disabled={closing} onClick={onSaveAndClose}>
          {closing ? <LoaderCircle className="animate-spin" /> : <Save />}
          <span className="hidden sm:inline">Save and close</span>
        </Button>
        <UserMenu user={user} />
      </div>
    </header>
  );
}
