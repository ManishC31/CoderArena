"use client";

// Browser-only: monaco-editor touches `window` when imported, so load this file
// through next/dynamic with `ssr: false` (see playground-workspace.tsx).

import { useEffect } from "react";
import * as monaco from "monaco-editor";
import Editor, { loader } from "@monaco-editor/react";
import { emmetCSS, emmetHTML, emmetJSX } from "emmet-monaco-es";
import { EditorLoading } from "@/components/playground/editor-loading";
import { EDITOR_THEMES, type EditorThemeId } from "@/components/playground/editor-themes";
import { enableAutoCloseTags, registerJsxTagCompletions } from "@/components/playground/tag-completion";

// Language services run in web workers. Turbopack bundles each worker from the
// npm package via `new Worker(new URL(...))`.
self.MonacoEnvironment = {
  getWorker(_workerId, label) {
    switch (label) {
      case "json":
        return new Worker(new URL("./workers/json.worker.ts", import.meta.url), { type: "module" });
      case "css":
      case "scss":
      case "less":
        return new Worker(new URL("./workers/css.worker.ts", import.meta.url), { type: "module" });
      case "html":
      case "handlebars":
      case "razor":
        return new Worker(new URL("./workers/html.worker.ts", import.meta.url), { type: "module" });
      case "typescript":
      case "javascript":
        return new Worker(new URL("./workers/ts.worker.ts", import.meta.url), { type: "module" });
      default:
        return new Worker(new URL("./workers/editor.worker.ts", import.meta.url), { type: "module" });
    }
  },
};

// Use the npm-installed Monaco instead of @monaco-editor/react's default CDN copy.
loader.config({ monaco });

// Starter files import packages (react, express, ...) that don't exist in the
// browser, so skip type checking ("Cannot find module ...") but keep syntax errors.
for (const defaults of [monaco.typescript.typescriptDefaults, monaco.typescript.javascriptDefaults]) {
  defaults.setCompilerOptions({
    target: monaco.typescript.ScriptTarget.ESNext,
    module: monaco.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.typescript.ModuleResolutionKind.NodeJs,
    jsx: monaco.typescript.JsxEmit.Preserve,
    allowJs: true,
    allowNonTsExtensions: true,
    esModuleInterop: true,
  });
  defaults.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: false });
}

for (const theme of EDITOR_THEMES) {
  monaco.editor.defineTheme(theme.id, theme.monaco);
}

// Tag autocomplete: Emmet abbreviations (e.g. `ul>li*3` + Tab) and HTML tag names after "<" in JSX.
emmetHTML(monaco, ["html"]);
emmetCSS(monaco, ["css"]);
emmetJSX(monaco, ["javascript", "typescript"]);
registerJsxTagCompletions(monaco);

type Props = {
  // Unique per file across playgrounds: Monaco keeps one model per path.
  path: string;
  language: string;
  // Only used the first time a path is opened; after that its model keeps the edits.
  defaultValue: string;
  onChange?: (value: string) => void;
  themeId: EditorThemeId;
  fontFamily: string;
  fontSize: number;
  // Called with the Monaco API each time the editor mounts.
  onEditorMount?: (monacoApi: typeof monaco) => void;
};

export function MonacoEditor({
  path,
  language,
  defaultValue,
  onChange,
  themeId,
  fontFamily,
  fontSize,
  onEditorMount,
}: Props) {
  // Monaco measures character widths once; re-measure after a web font finishes loading
  // so the cursor and selections line up with the text.
  useEffect(() => {
    document.fonts.load(`${fontSize}px ${fontFamily}`).then(() => monaco.editor.remeasureFonts());
  }, [fontFamily, fontSize]);

  return (
    <Editor
      path={path}
      defaultLanguage={language}
      defaultValue={defaultValue}
      onChange={(value) => onChange?.(value ?? "")}
      // Keep models when the editor unmounts (e.g. all tabs closed) so edits survive reopening.
      keepCurrentModel
      theme={themeId}
      loading={<EditorLoading />}
      onMount={(editor) => {
        enableAutoCloseTags(editor, monaco);
        onEditorMount?.(monaco);
      }}
      options={{
        fontFamily,
        fontSize,
        fontLigatures: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        padding: { top: 16 },
      }}
    />
  );
}
