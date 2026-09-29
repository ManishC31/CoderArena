"use client";

// Browser-only: load through next/dynamic with `ssr: false` (see playground-workspace.tsx).

import { useEffect, useRef } from "react";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal, type ITheme } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { createShell } from "@/components/playground/shell";

type Props = {
  // Must be stable (useCallback): the terminal session restarts when it changes.
  getFiles: () => Record<string, string>;
  fontFamily: string;
  theme: ITheme;
};

const FONT_SIZE = 13;

export function TerminalView({ getFiles, fontFamily, theme }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Font and colors are applied by the effect below.
    const terminal = new Terminal({ cursorBlink: true, fontSize: FONT_SIZE });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(container);

    // Refit whenever the panel is resized; skip while it's collapsed to 0px.
    const fit = () => {
      if (container.clientWidth > 0 && container.clientHeight > 0) fitAddon.fit();
    };
    fit();
    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(container);
    terminalRef.current = terminal;
    fitRef.current = fit;

    // Let Ctrl+` reach the workspace, which toggles the panel.
    terminal.attachCustomKeyEventHandler((event) => !(event.ctrlKey && event.key === "`"));

    const shell = createShell({
      write: (text) => terminal.write(text),
      clear: () => terminal.clear(),
      getFiles,
    });
    shell.start();
    const input = terminal.onData((data) => shell.input(data));
    terminal.focus();

    return () => {
      input.dispose();
      resizeObserver.disconnect();
      terminal.dispose();
      terminalRef.current = null;
      fitRef.current = null;
    };
  }, [getFiles]);

  // Follow the editor theme and font. xterm measures glyphs when the font changes,
  // so wait for the web font before switching.
  useEffect(() => {
    const terminal = terminalRef.current;
    if (!terminal) return;
    terminal.options.theme = theme;
    let cancelled = false;
    document.fonts.load(`${FONT_SIZE}px ${fontFamily}`).then(() => {
      if (cancelled || terminalRef.current !== terminal) return;
      terminal.options.fontFamily = fontFamily;
      fitRef.current?.();
    });
    return () => {
      cancelled = true;
    };
  }, [fontFamily, theme, getFiles]);

  // The fit addon measures this element, so padding goes on the wrapper.
  return (
    <div className="h-full px-3 pb-1">
      <div ref={containerRef} className="h-full" />
    </div>
  );
}
