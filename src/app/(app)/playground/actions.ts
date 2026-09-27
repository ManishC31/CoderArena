"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { validateEditorSettings } from "@/components/playground/editor-settings";
import { isValidFilePath, type PlaygroundFile } from "@/components/playground/files";
import { templateFiles } from "@/components/playground/template-files";
import { saveEditorSettings } from "@/lib/editor-config";
import { prisma } from "@/lib/prisma";
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
