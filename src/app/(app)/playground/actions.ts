"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { validateEditorSettings } from "@/components/playground/editor-settings";
import { isValidFilePath, type PlaygroundFile } from "@/components/playground/files";
import { templateFiles } from "@/components/playground/template-files";
import { saveEditorSettings } from "@/lib/editor-config";
import { prisma } from "@/lib/prisma";
import { previewOrigin } from "@/lib/sandbox/preview-server";
import { runSandbox, SandboxError, stopSandbox } from "@/lib/sandbox/sandbox";
import { sandboxTemplates } from "@/lib/sandbox-templates";
import { requireSession } from "@/lib/session";

export type CreatePlaygroundState = { error: string } | null;

const MAX_TITLE_LENGTH = 100;

// Creates a playground for the signed-in user and opens it in the editor.
export async function createPlayground(
  _previousState: CreatePlaygroundState,
  formData: FormData,
): Promise<CreatePlaygroundState> {
  const { user } = await requireSession();

  const template = sandboxTemplates.find(({ id }) => id === formData.get("template"));
  if (!template) {
    return { error: "Choose a template to continue." };
  }

  const title =
    String(formData.get("title") ?? "").trim().slice(0, MAX_TITLE_LENGTH) ||
    `${template.name} playground`;

  // Saved with the template's starter files, so its files are in the database from the start.
  const playground = await prisma.playground.create({
    data: { title, template: template.id, userId: user.id, files: { create: templateFiles[template.id].files } },
    select: { id: true },
  });

  redirect(`/playground/${playground.id}`);
}

// Saves the signed-in user's editor preferences (theme, font, font size).
export async function updateEditorSettings(input: unknown) {
  const { user } = await requireSession();
  const settings = validateEditorSettings(input);
  if (!settings) throw new Error("Invalid editor settings");
  await saveEditorSettings(user.id, settings);
}

// Stars or unstars one of the signed-in user's playgrounds, then re-renders the page.
export async function setPlaygroundStarred(playgroundId: string, starred: boolean) {
  const { user } = await requireSession();
  if (typeof playgroundId !== "string" || typeof starred !== "boolean") {
    throw new Error("Invalid input");
  }
  // updateMany so the userId check is part of the query: other users' playgrounds are never touched.
  await prisma.playground.updateMany({
    where: { id: playgroundId, userId: user.id },
    data: { starred },
  });
  refresh();
}

export type RenamePlaygroundState = { error: string } | { ok: true } | null;

// Renames one of the signed-in user's playgrounds, then re-renders the page.
export async function renamePlayground(
  _previousState: RenamePlaygroundState,
  formData: FormData,
): Promise<RenamePlaygroundState> {
  const { user } = await requireSession();
  const playgroundId = formData.get("playgroundId");
  const title = String(formData.get("title") ?? "").trim().slice(0, MAX_TITLE_LENGTH);
  if (typeof playgroundId !== "string") throw new Error("Invalid input");
  if (!title) return { error: "Enter a name." };

  await prisma.playground.updateMany({ where: { id: playgroundId, userId: user.id }, data: { title } });
  refresh();
  return { ok: true };
}

// Deletes one of the signed-in user's playgrounds and its files, and stops its sandbox.
export async function deletePlayground(playgroundId: string) {
  const { user } = await requireSession();
  if (typeof playgroundId !== "string") throw new Error("Invalid input");

  // deleteMany so the userId check is part of the query; files go with it (onDelete: Cascade).
  const { count } = await prisma.playground.deleteMany({ where: { id: playgroundId, userId: user.id } });
  if (count > 0) {
    await stopSandbox(playgroundId).catch((error) => console.error("Couldn't stop the sandbox", error));
  }
  refresh();
}

const MAX_FILES = 200;
const MAX_FILE_LENGTH = 500_000;

function isValidFileList(files: PlaygroundFile[]) {
  return (
    Array.isArray(files) &&
    files.length <= MAX_FILES &&
    files.every(
      (file) =>
        typeof file?.path === "string" &&
        isValidFilePath(file.path) &&
        typeof file.content === "string" &&
        file.content.length <= MAX_FILE_LENGTH,
    ) &&
    new Set(files.map((file) => file.path)).size === files.length
  );
}

// Saves files of one of the signed-in user's playgrounds: autosave and "Save and close" send
// only the files that changed. Returns when it was saved (the playground's updated_at, in ms).
export async function savePlaygroundFiles(playgroundId: string, files: PlaygroundFile[]) {
  const { user } = await requireSession();
  if (typeof playgroundId !== "string" || !isValidFileList(files) || files.length === 0) {
    throw new Error("Invalid files");
  }

  // One transaction, with the ownership check built in: the update fails (and rolls back the
  // whole save) unless the playground belongs to the user.
  const savedAt = new Date();
  await prisma.$transaction([
    prisma.playground.update({ where: { id: playgroundId, userId: user.id }, data: { updatedAt: savedAt } }),
    ...files.map(({ path, content }) =>
      prisma.playgroundFile.upsert({
        where: { playgroundId_path: { playgroundId, path } },
        create: { playgroundId, path, content },
        update: { content },
      }),
    ),
  ]);
  return { savedAt: savedAt.getTime() };
}

export type RunPlaygroundResult = { previewUrl: string } | { error: string; logs?: string };

// Runs one of the signed-in user's playgrounds in its sandbox with the editor's current files
// (saved or not), and returns the URL of its preview.
export async function runPlayground(playgroundId: string, files: PlaygroundFile[]): Promise<RunPlaygroundResult> {
  const { user } = await requireSession();
  if (typeof playgroundId !== "string" || !isValidFileList(files)) throw new Error("Invalid files");

  const playground = await prisma.playground.findFirst({
    where: { id: playgroundId, userId: user.id },
    select: { template: true },
  });
  if (!playground) throw new Error("Playground not found");

  try {
    const { previewUrl } = await runSandbox({ playgroundId, userId: user.id, template: playground.template, files });
    // In development the preview comes from its own port (see preview-server.ts).
    return { previewUrl: `${(await previewOrigin()) ?? ""}${previewUrl}` };
  } catch (error) {
    if (error instanceof SandboxError) return { error: error.message, logs: error.logs };
    console.error("Couldn't run the playground", error);
    return { error: "Couldn't start the preview." };
  }
}

// Stops the sandbox of one of the signed-in user's playgrounds.
export async function stopPlayground(playgroundId: string) {
  const { user } = await requireSession();
  if (typeof playgroundId !== "string") throw new Error("Invalid input");

  const playground = await prisma.playground.findFirst({
    where: { id: playgroundId, userId: user.id },
    select: { id: true },
  });
  if (!playground) throw new Error("Playground not found");

  await stopSandbox(playgroundId);
}
