import "server-only";
import { normalizeEditorSettings, type EditorSettings } from "@/components/playground/editor-settings";
import { prisma } from "@/lib/prisma";

// The user's saved editor preferences, or the defaults if they haven't changed any yet.
export async function getEditorSettings(userId: string): Promise<EditorSettings> {
  const config = await prisma.editorConfig.findUnique({
    where: { userId },
    select: { themeId: true, fontId: true, fontSize: true },
  });
  return normalizeEditorSettings(config);
}

export async function saveEditorSettings(userId: string, settings: EditorSettings) {
  await prisma.editorConfig.upsert({
    where: { userId },
    create: { userId, ...settings },
    update: settings,
  });
}
