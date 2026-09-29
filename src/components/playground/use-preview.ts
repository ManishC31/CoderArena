"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { runPlayground, stopPlayground } from "@/app/(app)/playground/actions";
import type { PlaygroundFile } from "@/components/playground/files";

export type PreviewState =
  | { status: "stopped" }
  | { status: "starting" }
  | { status: "running"; url: string; updating: boolean }
  | { status: "error"; message: string; logs?: string };

// How long typing has to pause before the preview updates.
const UPDATE_DELAY_MS = 600;

// Runs the playground in its sandbox and keeps it up to date with the editor.
export function usePreview(playgroundId: string, getFiles: () => PlaygroundFile[]) {
  const [state, setState] = useState<PreviewState>({ status: "stopped" });
  // Changes after each update, so the preview page reloads.
  const [version, setVersion] = useState(0);

  // Started and not stopped since (errors don't count as stopping: the next edit retries).
  const active = useRef(false);
  const inFlight = useRef(false);
  // Edits arrived while a run was in flight.
  const pending = useRef(false);
  const updateTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Starts the sandbox, or uploads the latest files to it.
  const run = useCallback(async () => {
    active.current = true;
    clearTimeout(updateTimer.current);
    if (inFlight.current) {
      pending.current = true;
      return;
    }
    inFlight.current = true;
    try {
      do {
        pending.current = false;
        setState((previous) => (previous.status === "running" ? { ...previous, updating: true } : { status: "starting" }));
        let next: PreviewState;
        try {
          const result = await runPlayground(playgroundId, getFiles());
          next =
            "error" in result
              ? { status: "error", message: result.error, logs: result.logs }
              : { status: "running", url: result.previewUrl, updating: false };
        } catch (error) {
          console.error("Couldn't run the playground", error);
          next = { status: "error", message: "Couldn't reach the server." };
        }
        // Stopped while this ran.
        if (!active.current) return;
        setState(next);
        if (next.status === "running") setVersion((previous) => previous + 1);
      } while (pending.current);
    } finally {
      inFlight.current = false;
    }
  }, [playgroundId, getFiles]);

  // Runs the playground unless it's already running or starting.
  const start = useCallback(() => {
    if (!active.current) run();
  }, [run]);

  const stop = useCallback(() => {
    active.current = false;
    pending.current = false;
    clearTimeout(updateTimer.current);
    setState({ status: "stopped" });
    stopPlayground(playgroundId).catch((error) => console.error("Couldn't stop the preview", error));
  }, [playgroundId]);

  const reload = useCallback(() => setVersion((previous) => previous + 1), []);

  // Call on every edit: the preview updates once typing pauses.
  const scheduleUpdate = useCallback(() => {
    if (!active.current) return;
    clearTimeout(updateTimer.current);
    updateTimer.current = setTimeout(run, UPDATE_DELAY_MS);
  }, [run]);

  // Stop the sandbox when leaving the playground. Deferred, because in development React
  // unmounts and immediately remounts components, and that shouldn't stop it.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      setTimeout(() => {
        if (!mounted.current && active.current) stop();
      });
    };
  }, [stop]);

  return { state, version, run, start, stop, reload, scheduleUpdate };
}
