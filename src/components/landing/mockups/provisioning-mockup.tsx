import { Check } from "lucide-react";
import { MockWindow } from "@/components/landing/mockups/mock-window";
import { PanelLabel } from "@/components/landing/mockups/panel-label";
import { terminal } from "@/components/landing/mockups/syntax";

// The steps a new playground goes through before its dev server is up.

const steps = ["Creating workspace", "Starting container", "Installing dependencies"];

export function ProvisioningMockup() {
  return (
    <MockWindow label="A new React playground starting: workspace created, container started, dependencies installed, development server starting">
      <div className="flex h-9 items-center justify-between border-b border-(--ws-border) bg-(--ws-sidebar) px-4">
        <PanelLabel>Preparing playground</PanelLabel>
        <span className="font-mono text-[11px] text-(--ws-muted)">react · habit-tracker</span>
      </div>
      <ul className="space-y-3 px-4 py-5 font-mono text-[12.5px]">
        {steps.map((step) => (
          <li key={step} className="flex items-center gap-3">
            <Check className={`size-3.5 ${terminal.green}`} />
            {step}
          </li>
        ))}
        <li className="flex items-center gap-3">
          <span className="relative flex size-3.5 items-center justify-center">
            <span className="absolute size-2.5 animate-ping rounded-full bg-brand opacity-60 motion-reduce:hidden" />
            <span className="size-2 rounded-full bg-brand" />
          </span>
          Starting development server
        </li>
      </ul>
      <p className="border-t border-(--ws-border) px-4 py-3 font-mono text-[12px] text-(--ws-muted)">Almost ready…</p>
    </MockWindow>
  );
}
