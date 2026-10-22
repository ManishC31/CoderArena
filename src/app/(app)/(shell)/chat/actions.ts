"use server";

import { refresh } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

// Deletes the conversation with one of the signed-in user's repositories.
export async function clearChat(repositoryId: string) {
  const { user } = await requireSession();
  if (typeof repositoryId !== "string") throw new Error("Invalid input");
  await prisma.repoChatMessage.deleteMany({ where: { repositoryId, repository: { userId: user.id } } });
  refresh();
}
