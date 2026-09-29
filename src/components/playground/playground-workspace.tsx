"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MonitorPlay, SquareTerminal, X } from "lucide-react";
import type * as Monaco from "monaco-editor";
import type { PanelImperativeHandle, PanelSize } from "react-resizable-panels";
import { updateEditorSettings } from "@/app/(app)/playground/actions";
import type { MenuUser } from "@/components/app-shell/user-avatar";
import { EditorLoading } from "@/components/playground/editor-loading";
import { FONT_FAMILIES } from "@/components/playground/editor-fonts";
import type { EditorSettings } from "@/components/playground/editor-settings";
import { EditorSettingsPopover } from "@/components/playground/editor-settings-popover";
import { getEditorTheme } from "@/components/playground/editor-themes";
import { FileExplorer } from "@/components/playground/file-explorer";
import { FileIcon } from "@/components/playground/file-icon";
import { languageForPath, type PlaygroundFile } from "@/components/playground/files";
import { LeaveDialog } from "@/components/playground/leave-dialog";
import { PreviewPanel } from "@/components/playground/preview-panel";
import { StatusBar } from "@/components/playground/status-bar";
import { latestContents, useAutosave } from "@/components/playground/use-autosave";
import { useLeaveGuard } from "@/components/playground/use-leave-guard";
import { usePreview } from "@/components/playground/use-preview";
import { WorkspaceHeader } from "@/components/playground/workspace-header";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";

// Monaco and xterm can't render on the server, so load them only in the browser.
const MonacoEditor = dynamic(
  () => import("@/components/playground/monaco-editor").then((mod) => mod.MonacoEditor),
  { ssr: false, loading: () => <EditorLoading /> },
);
const TerminalView = dynamic(
  () => import("@/components/playground/terminal-view").then((mod) => mod.TerminalView),
  { ssr: false },
);

const DEFAULT_TERMINAL_SIZE = "30%";
const DEFAULT_PREVIEW_SIZE = "40%";

type Props = {
  playgroundId: string;
  title: string;
  // Template logo shown before the title.
  icon?: React.ReactNode;
  // The signed-in user, for the account menu.
  user: MenuUser;
  // The playground's saved files.
  files: PlaygroundFile[];
  // When they were saved (the playground's updated_at), in ms.
  savedAt: number;
  // File opened on load.
  entry: string;
  // The user's saved preferences from the editor_config table, so the first render already uses them.
  initialSettings: EditorSettings;
  // Whether the template can run in a sandbox, which shows the preview panel.
  canPreview: boolean;
};

// Full-screen VS Code-style workspace: a header, then file explorer | editor tabs + Monaco,
// with a toggleable terminal below | the running app's preview, then a status bar.
export function PlaygroundWorkspace({
  playgroundId,
  title,
  icon,
  user,
  files,
  savedAt,
  entry,
  initialSettings,
  canPreview,
}: Props) {
  // The page's files, or newer ones this tab saved (see latestContents).
  const [initialContents] = useState(() => latestContents(playgroundId, files, savedAt));
  const paths = useMemo(() => [...initialContents.keys()], [initialContents]);

  const [openPaths, setOpenPaths] = useState([entry]);
  const [activePath, setActivePath] = useState<string | null>(entry);

  const [settings, setSettings] = useState(initialSettings);
  const theme = getEditorTheme(settings.themeId);
  const fontFamily = FONT_FAMILIES[settings.fontId];

  // Apply right away, save in the background.
  function changeSettings(next: EditorSettings) {
    setSettings(next);
    updateEditorSettings(next).catch((error) => console.error("Couldn't save editor settings", error));
  }

  // Latest contents including unsaved edits, read by the terminal (e.g. `cat`).
  // A ref, so typing in the editor doesn't re-render the workspace.
  const contents = useRef(new Map(initialContents));
  const getFiles = useCallback(() => Object.fromEntries(contents.current), []);
  const getContents = useCallback(() => contents.current, []);
  const currentFiles = useCallback(
    () => [...contents.current].map(([path, content]) => ({ path, content })),
    [],
  );
  const modelUri = (path: string) => `file:///playgrounds/${playgroundId}/${path}`;

  // Monaco keeps models in memory across page visits. On the first mount, reset any left
  // over from an earlier visit to the loaded contents, so the editor shows what's saved.
  const modelsReset = useRef(false);
  function resetLeftoverModels(monaco: typeof Monaco) {
    if (modelsReset.current) return;
    modelsReset.current = true;
    for (const [path, content] of initialContents) {
      const model = monaco.editor.getModel(monaco.Uri.parse(modelUri(path)));
      if (model && model.getValue() !== content) model.setValue(content);
    }
  }

  const autosave = useAutosave(playgroundId, initialContents, getContents);
  // "Save and close" is saving the last changes before leaving.
  const [closing, setClosing] = useState(false);

  const preview = usePreview(playgroundId, currentFiles);

  // Until autosave catches up, the Back button and links open the leave dialog instead of
  // leaving, and closing the tab asks first. `leaveDestination` is where the user was headed.
  const [leaveDestination, setLeaveDestination] = useState<string | null>(null);
  const leave = useLeaveGuard(autosave.status !== "saved", setLeaveDestination);

  function handleChange(path: string, value: string) {
    contents.current.set(path, value);
    autosave.markChanged();
    preview.scheduleUpdate();
  }

  // Saves whatever autosave hasn't yet, then leaves.
  async function saveAndClose(destination = "/dashboard") {
    setClosing(true);
    try {
      await autosave.saveNow();
      leave(destination);
    } catch {
      // The save status shows the error.
      setClosing(false);
    }
  }

  function openFile(path: string) {
    setOpenPaths((previous) => (previous.includes(path) ? previous : [...previous, path]));
    setActivePath(path);
  }

  function closeFile(path: string) {
    const index = openPaths.indexOf(path);
    const next = openPaths.filter((openPath) => openPath !== path);
    setOpenPaths(next);
    if (activePath === path) setActivePath(next[Math.min(index, next.length - 1)] ?? null);
  }

  // The terminal panel is always rendered and collapses to 0px when hidden.
  const terminalPanel = useRef<PanelImperativeHandle>(null);
  const lastTerminalSize = useRef(DEFAULT_TERMINAL_SIZE);
  const [terminalOpen, setTerminalOpen] = useState(false);
  // xterm starts on first open and then stays alive, so hiding the panel keeps the session.
  const [terminalStarted, setTerminalStarted] = useState(false);

  function handleTerminalResize(size: PanelSize) {
    const open = size.inPixels > 0;
    setTerminalOpen(open);
    if (open) {
      lastTerminalSize.current = `${size.asPercentage}%`;
      setTerminalStarted(true);
    }
  }

  const toggleTerminal = useCallback(() => {
    const panel = terminalPanel.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.resize(lastTerminalSize.current);
    else panel.collapse();
  }, []);

  // The preview panel also collapses to 0px when hidden. Opening it runs the playground.
  const previewPanel = useRef<PanelImperativeHandle>(null);
  const lastPreviewSize = useRef(DEFAULT_PREVIEW_SIZE);
  const [previewOpen, setPreviewOpen] = useState(false);

  function handlePreviewResize(size: PanelSize) {
    const open = size.inPixels > 0;
    if (open && !previewOpen) preview.start();
    setPreviewOpen(open);
    if (open) lastPreviewSize.current = `${size.asPercentage}%`;
  }

  const togglePreview = useCallback(() => {
    const panel = previewPanel.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.resize(lastPreviewSize.current);
    else panel.collapse();
  }, []);

  // The header's Run button: opening the preview panel starts the sandbox; if it's already
  // open (stopped or failed), run it again.
  function runPreview() {
    const panel = previewPanel.current;
    if (panel?.isCollapsed()) panel.resize(lastPreviewSize.current);
    else preview.run();
  }

  // Ctrl+` toggles the terminal, as in VS Code.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey && event.key === "`") {
        event.preventDefault();
        toggleTerminal();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleTerminal]);

  // Workspace colors follow the editor theme; children use them via --ws-* classes.
  const themeStyle = {
    colorScheme: theme.type,
    "--ws-editor": theme.chrome.editor,
    "--ws-sidebar": theme.chrome.sidebar,
    "--ws-border": theme.chrome.border,
    "--ws-fg": theme.chrome.foreground,
    "--ws-muted": theme.chrome.muted,
    "--ws-hover": theme.chrome.hover,
    "--ws-active": theme.chrome.active,
    "--ws-accent": theme.chrome.accent,
  } as React.CSSProperties;

  return (
    // Fills the viewport; signed-in pages outside the editor have the sidebar instead.
    <div className="flex h-svh flex-col">
      <WorkspaceHeader
        title={title}
        icon={icon}
        user={user}
        saveStatus={autosave.status}
        closing={closing}
        onSaveAndClose={() => saveAndClose()}
        preview={canPreview ? { state: preview.state, onRun: runPreview, onStop: preview.stop } : undefined}
      />

      <div style={themeStyle} className="flex min-h-0 flex-1 flex-col bg-(--ws-editor) text-(--ws-fg)">
        <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
          <ResizablePanel defaultSize="20%" minSize="12%" maxSize="45%" collapsible>
            <FileExplorer paths={paths} activePath={activePath} onOpen={openFile} />
          </ResizablePanel>
          <ResizableHandle className="bg-(--ws-border)" />

          <ResizablePanel minSize="30%">
            <ResizablePanelGroup orientation="vertical">
              <ResizablePanel minSize="20%">
                <div className="flex h-full flex-col">
                  <div className="flex h-9 shrink-0 border-b border-(--ws-border) bg-(--ws-sidebar)">
                    <div className="flex min-w-0 flex-1 overflow-x-auto">
                      {openPaths.map((path) => {
                        const name = path.split("/").pop();
                        const active = path === activePath;
                        return (
                          <div
                            key={path}
                            className={cn(
                              "group flex shrink-0 items-center gap-1 border-r border-(--ws-border) pr-1.5 pl-3 text-xs",
                              active ? "bg-(--ws-editor) text-(--ws-fg)" : "text-(--ws-muted) hover:bg-(--ws-hover)",
                            )}
                          >
                            <button
                              type="button"
                              title={path}
                              onClick={() => setActivePath(path)}
                              className="flex h-full items-center gap-2 pr-1 outline-none"
                            >
                              <FileIcon path={path} className="size-3.5" />
                              {name}
                            </button>
                            <button
                              type="button"
                              aria-label={`Close ${name}`}
                              onClick={() => closeFile(path)}
                              className={cn(
                                "rounded p-0.5 outline-none hover:bg-(--ws-active) focus-visible:opacity-100",
                                active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                              )}
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {canPreview && (
                      <button
                        type="button"
                        onClick={togglePreview}
                        aria-pressed={previewOpen}
                        title="Toggle preview"
                        className={cn(
                          "flex shrink-0 items-center gap-1.5 px-2.5 text-xs outline-none hover:text-(--ws-fg) focus-visible:ring-1 focus-visible:ring-(--ws-accent) focus-visible:ring-inset",
                          previewOpen ? "text-(--ws-fg)" : "text-(--ws-muted)",
                        )}
                      >
                        <MonitorPlay className="size-3.5" />
                        Preview
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={toggleTerminal}
                      aria-pressed={terminalOpen}
                      title="Toggle terminal (Ctrl+`)"
                      className={cn(
                        "flex shrink-0 items-center gap-1.5 px-2.5 text-xs outline-none hover:text-(--ws-fg) focus-visible:ring-1 focus-visible:ring-(--ws-accent) focus-visible:ring-inset",
                        terminalOpen ? "text-(--ws-fg)" : "text-(--ws-muted)",
                      )}
                    >
                      <SquareTerminal className="size-3.5" />
                      Terminal
                    </button>
                    <EditorSettingsPopover settings={settings} onChange={changeSettings} />
                  </div>

                  <div className="min-h-0 flex-1">
                    {activePath ? (
                      <MonacoEditor
                        // One Monaco model per playground file; it keeps edits while switching tabs.
                        path={modelUri(activePath)}
                        language={languageForPath(activePath)}
                        defaultValue={initialContents.get(activePath) ?? ""}
                        onChange={(value) => handleChange(activePath, value)}
                        onEditorMount={resetLeftoverModels}
                        themeId={theme.id}
                        fontFamily={fontFamily}
                        fontSize={settings.fontSize}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-(--ws-muted)">
                        Select a file in the explorer to start editing.
                      </div>
                    )}
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle className="bg-(--ws-border)" />

              <ResizablePanel
                panelRef={terminalPanel}
                defaultSize="0%"
                minSize="10%"
                collapsible
                collapsedSize="0%"
                onResize={handleTerminalResize}
              >
                <div className="flex h-full flex-col bg-(--ws-editor)">
                  <div className="flex h-8 shrink-0 items-center justify-between px-3">
                    <span className="text-[11px] font-semibold tracking-wider text-(--ws-muted) uppercase">Terminal</span>
                    <button
                      type="button"
                      aria-label="Close terminal"
                      onClick={toggleTerminal}
                      className="rounded p-0.5 text-(--ws-muted) outline-none hover:bg-(--ws-active) hover:text-(--ws-fg) focus-visible:ring-1 focus-visible:ring-(--ws-accent)"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <div className="min-h-0 flex-1">
                    {terminalStarted && <TerminalView getFiles={getFiles} fontFamily={fontFamily} theme={theme.terminal} />}
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          {canPreview && (
            <>
              <ResizableHandle className="bg-(--ws-border)" />
              <ResizablePanel
                panelRef={previewPanel}
                defaultSize={DEFAULT_PREVIEW_SIZE}
                minSize="20%"
                collapsible
                collapsedSize="0%"
                onResize={handlePreviewResize}
              >
                <PreviewPanel
                  state={preview.state}
                  version={preview.version}
                  onRun={preview.run}
                  onStop={preview.stop}
                  onReload={preview.reload}
                  onClose={togglePreview}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
        <StatusBar
          previewStatus={canPreview ? preview.state.status : null}
          activePath={activePath}
          themeName={theme.name}
        />
      </div>

      <LeaveDialog
        open={leaveDestination !== null}
        title={title}
        saving={closing}
        error={autosave.status === "error" ? "Couldn't save your changes. Try again." : null}
        onSaveAndClose={() => saveAndClose(leaveDestination ?? undefined)}
        onCancel={() => setLeaveDestination(null)}
      />
    </div>
  );
}
