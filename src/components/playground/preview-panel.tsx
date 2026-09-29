"use client";

import { useState } from "react";
import { ExternalLink, Globe, LoaderCircle, Monitor, RotateCw, Smartphone, Square, Tablet, X } from "lucide-react";
import { PreviewPlaceholder } from "@/components/playground/preview-placeholder";
import type { PreviewState } from "@/components/playground/use-preview";
import { cn } from "@/lib/utils";

type Props = {
  state: PreviewState;
  // Changes when the page should reload.
  version: number;
  onRun: () => void;
  onStop: () => void;
  onReload: () => void;
  onClose: () => void;
};

// Widths the preview can be shown at; null fills the panel.
const DEVICES = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: null },
  { id: "tablet", label: "Tablet (768px)", icon: Tablet, width: 768 },
  { id: "phone", label: "Phone (390px)", icon: Smartphone, width: 390 },
] as const;

type DeviceId = (typeof DEVICES)[number]["id"];

const toolbarButtonClass =
  "rounded p-1 text-(--ws-muted) outline-none hover:bg-(--ws-active) hover:text-(--ws-fg) focus-visible:ring-1 focus-visible:ring-(--ws-accent) [&_svg]:size-3.5";

// The preview URL without the scheme, for the address bar.
function displayUrl(url: string) {
  const { host, pathname } = new URL(url, window.location.href);
  return `${host}${pathname}`;
}

// The playground's app, running in its sandbox.
export function PreviewPanel({ state, version, onRun, onStop, onReload, onClose }: Props) {
  const [deviceId, setDeviceId] = useState<DeviceId>("desktop");
  const device = DEVICES.find(({ id }) => id === deviceId) ?? DEVICES[0];
  const busy = state.status === "starting" || (state.status === "running" && state.updating);

  return (
    <div className="flex h-full flex-col bg-(--ws-editor)">
      <div className="flex h-9 shrink-0 items-center gap-1.5 border-b border-(--ws-border) bg-(--ws-sidebar) px-1.5">
        <div role="group" aria-label="Preview size" className="flex items-center gap-0.5">
          {DEVICES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              title={label}
              aria-pressed={deviceId === id}
              onClick={() => setDeviceId(id)}
              className={cn(toolbarButtonClass, deviceId === id && "bg-(--ws-active) text-(--ws-fg)")}
            >
              <Icon />
            </button>
          ))}
        </div>

        <div className="flex h-6 min-w-0 flex-1 items-center gap-1.5 rounded-md border border-(--ws-border) bg-(--ws-editor) px-2 text-[11px] text-(--ws-muted)">
          {busy ? <LoaderCircle aria-label="Updating" className="size-3 shrink-0 animate-spin" /> : <Globe className="size-3 shrink-0" />}
          <span className="truncate font-mono">
            {state.status === "running" ? displayUrl(state.url) : state.status === "starting" ? "Starting…" : "Not running"}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          {state.status === "running" && (
            <>
              <button type="button" aria-label="Reload" title="Reload" onClick={onReload} className={toolbarButtonClass}>
                <RotateCw />
              </button>
              <a
                href={state.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open in a new tab"
                title="Open in a new tab"
                className={toolbarButtonClass}
              >
                <ExternalLink />
              </a>
            </>
          )}
          {(state.status === "running" || state.status === "starting") && (
            <button type="button" aria-label="Stop" title="Stop" onClick={onStop} className={toolbarButtonClass}>
              <Square />
            </button>
          )}
          <button type="button" aria-label="Close preview" title="Close preview" onClick={onClose} className={toolbarButtonClass}>
            <X />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {state.status === "running" ? (
          <div className={cn("flex h-full justify-center", device.width && "overflow-auto bg-(--ws-sidebar) p-3")}>
            <iframe
              key={version}
              src={state.url}
              title="Preview"
              // No allow-same-origin: the page gets an opaque origin, so it can't reach the app.
              // The proxy's CSP header enforces the same when it's opened in its own tab.
              sandbox="allow-scripts allow-forms allow-modals allow-popups allow-downloads"
              style={device.width ? { width: device.width } : undefined}
              className={cn(
                "h-full shrink-0 border-0 bg-white",
                device.width ? "rounded-md shadow-lg ring-1 ring-(--ws-border)" : "w-full",
              )}
            />
          </div>
        ) : (
          <PreviewPlaceholder state={state} onRun={onRun} />
        )}
      </div>
    </div>
  );
}
