"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { savePlaygroundFiles } from "@/app/(app)/playground/actions";
import type { PlaygroundFile } from "@/components/playground/files";

// How often unsaved changes are saved. To keep the load low, nothing is sent while there
// are no changes, each save sends only the files that changed, and saves never overlap.
const AUTOSAVE_INTERVAL_MS = 5_000;

export type SaveStatus = "saved" | "unsaved" | "saving" | "error";

// The files this tab last saved for each playground, and when. Back/forward navigation
// re-renders a playground from Next.js's client cache, with the files it had when the page
// first loaded; these can be newer.
const savedCopies = new Map<string, { savedAt: number; contents: Map<string, string> }>();

// The files to open a playground with: the page's (saved at `savedAt`), or this tab's newer copy.
export function latestContents(playgroundId: string, files: PlaygroundFile[], savedAt: number) {
  const copy = savedCopies.get(playgroundId);
  if (copy && copy.savedAt > savedAt) return new Map(copy.contents);
  return new Map(files.map((file) => [file.path, file.content]));
}

// Saves the playground's changed files every AUTOSAVE_INTERVAL_MS while any are unsaved.
// `getContents` returns the editor's current files; call markChanged() on every edit.
export function useAutosave(
  playgroundId: string,
  initialContents: Map<string, string>,
  getContents: () => Map<string, string>,
) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  // The files as the database has them, as far as this tab knows.
  const saved = useRef(new Map(initialContents));
  const running = useRef<Promise<void> | null>(null);

  const saveChanges = useCallback(async () => {
    const changes = [...getContents()]
      .filter(([path, content]) => saved.current.get(path) !== content)
      .map(([path, content]) => ({ path, content }));
    if (changes.length === 0) {
      setStatus("saved");
      return;
    }

    setStatus("saving");
    try {
      const { savedAt } = await savePlaygroundFiles(playgroundId, changes);
      for (const { path, content } of changes) saved.current.set(path, content);
      savedCopies.set(playgroundId, { savedAt, contents: new Map(saved.current) });
      // Edits made while this ran go out with the next save.
      const unsaved = [...getContents()].some(([path, content]) => saved.current.get(path) !== content);
      setStatus(unsaved ? "unsaved" : "saved");
    } catch (error) {
      console.error("Couldn't save the playground", error);
      setStatus("error");
      throw error;
    }
  }, [playgroundId, getContents]);

  // Saves now, once any running save has finished. Rejects if saving fails.
  const saveNow = useCallback(async () => {
    while (running.current) await running.current.catch(() => {});
    const save = saveChanges();
    running.current = save;
    try {
      await save;
    } finally {
      running.current = null;
    }
  }, [saveChanges]);

  // While anything is unsaved (or a save failed), save on the interval. A tick is skipped
  // while a save is still running.
  const pending = status !== "saved";
  useEffect(() => {
    if (!pending) return;
    const interval = setInterval(() => {
      if (!running.current) saveNow().catch(() => {});
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [pending, saveNow]);

  // Leaving the page some way the leave guard doesn't catch: save what's left.
  useEffect(() => () => void saveNow().catch(() => {}), [saveNow]);

  const markChanged = useCallback(() => {
    setStatus((previous) => (previous === "saved" ? "unsaved" : previous));
  }, []);

  return { status, saveNow, markChanged };
}
