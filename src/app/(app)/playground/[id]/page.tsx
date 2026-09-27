import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandIcon } from "@/components/brand-icon";
import { PlaygroundWorkspace } from "@/components/playground/playground-workspace";
import { templateFiles } from "@/components/playground/template-files";
import { getEditorSettings } from "@/lib/editor-config";
import { prisma } from "@/lib/prisma";
import { sandboxTemplates } from "@/lib/sandbox-templates";
import { requireSession } from "@/lib/session";

// Only the owner can open a playground; anyone else gets a 404.
// Cached so generateMetadata and the page share one query per request.
const getPlayground = cache(async (id: string) => {
  const { user } = await requireSession();
  return prisma.playground.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      title: true,
      template: true,
      updatedAt: true,
      files: { select: { path: true, content: true }, orderBy: { path: "asc" } },
    },
  });
});

export async function generateMetadata({ params }: PageProps<"/playground/[id]">): Promise<Metadata> {
  const playground = await getPlayground((await params).id);
  return { title: playground?.title ?? "Playground" };
}

export default async function PlaygroundPage({ params }: PageProps<"/playground/[id]">) {
  const { user } = await requireSession();
  const [playground, editorSettings] = await Promise.all([
    getPlayground((await params).id),
    getEditorSettings(user.id),
  ]);
  if (!playground) notFound();

  const template = sandboxTemplates.find(({ id }) => id === playground.template);
  const starter = templateFiles[playground.template];
  let files = playground.files;
  if (files.length === 0) {
    // Playgrounds created before their files were saved on creation have none: save the
    // template's starter files now.
    await prisma.playgroundFile.createMany({
      data: starter.files.map((file) => ({ playgroundId: playground.id, ...file })),
      skipDuplicates: true,
    });
    files = starter.files;
  }
  const entry = files.some(({ path }) => path === starter.entry) ? starter.entry : files[0].path;

  return (
    <PlaygroundWorkspace
      playgroundId={playground.id}
      title={playground.title}
      icon={template && <BrandIcon icon={template.icon} color={template.color} className="size-4" />}
      files={files}
      savedAt={playground.updatedAt.getTime()}
      entry={entry}
      initialSettings={editorSettings}
    />
  );
}
