import { CloudCheck, CodeXml, Files, FolderTree, MonitorPlay, SquareTerminal } from "lucide-react";
import { Chip } from "@/components/landing/chip";
import { FeatureTile } from "@/components/landing/feature-tile";
import { EditorCloseup } from "@/components/landing/mockups/editor-closeup";
import { Section } from "@/components/landing/section";

export function EditorSection() {
  return (
    <Section
      id="editor"
      eyebrow="Editor"
      title="A complete development environment without leaving your browser."
      description="The pieces you use locally, in one tab: a real editor, a file tree, a terminal, and a live preview of your app."
    >
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <FeatureTile
          icon={CodeXml}
          title="Monaco editor"
          description="The editor behind VS Code, with IntelliSense, syntax highlighting, and your choice of theme and font."
          className="md:col-span-2 md:row-span-2"
        >
          <EditorCloseup />
        </FeatureTile>
        <FeatureTile
          icon={MonitorPlay}
          title="Live preview"
          description="Your app runs in an isolated sandbox, and the preview updates as you type."
        >
          <Chip>localhost:5173 → Preview</Chip>
        </FeatureTile>
        <FeatureTile
          icon={SquareTerminal}
          title="Terminal"
          description="A terminal docked under the editor, one shortcut away."
        >
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono">Ctrl</kbd>+
            <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono">`</kbd>
          </span>
        </FeatureTile>
        <FeatureTile icon={FolderTree} title="File explorer" description="Browse the whole project as a folder tree.">
          <Chip>src/components/HabitList.jsx</Chip>
        </FeatureTile>
        <FeatureTile icon={Files} title="Multiple files" description="Keep components, styles, and config open in tabs.">
          <span className="flex flex-wrap gap-1.5">
            <Chip>App.jsx</Chip>
            <Chip>habits.js</Chip>
            <Chip>index.css</Chip>
          </span>
        </FeatureTile>
        <FeatureTile
          icon={CloudCheck}
          title="Persistent workspace"
          description="Every change autosaves. Close the tab and pick up where you left off."
        >
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            All changes saved
          </span>
        </FeatureTile>
      </ul>
    </Section>
  );
}
