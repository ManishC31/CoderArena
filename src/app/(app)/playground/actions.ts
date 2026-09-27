"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { templateFiles } from "@/components/playground/template-files";
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
