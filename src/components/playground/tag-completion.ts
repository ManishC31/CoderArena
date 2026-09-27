// Tag helpers for Monaco, which doesn't close or suggest tags in JSX (or close them in HTML) on its own.
// Browser-only: imported by monaco-editor.tsx.

import type * as Monaco from "monaco-editor";

type MonacoApi = typeof Monaco;

// Elements that never get a closing tag.
const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr",
]);

// Suggested after "<" in JSX. HTML files get Monaco's own tag suggestions.
const HTML_TAGS = [
  "a", "abbr", "article", "aside", "audio", "b", "blockquote", "br", "button", "canvas", "code", "details",
  "dialog", "div", "em", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5",
  "h6", "header", "hr", "i", "iframe", "img", "input", "label", "legend", "li", "main", "nav", "ol", "option",
  "p", "pre", "section", "select", "small", "span", "strong", "summary", "table", "tbody", "td", "textarea",
  "th", "thead", "tr", "ul", "video",
];

// "<" only starts a tag when it doesn't follow an identifier; that skips generics like `useState<number>`.
const NOT_AFTER_IDENTIFIER = String.raw`(?:^|[^\w$.])`;
// An opening tag that was just closed with ">", e.g. `<div className="box">` or a fragment `<>`.
// Attributes may span lines, so the text checked covers the last few lines.
const OPENING_TAG = new RegExp(`${NOT_AFTER_IDENTIFIER}<([A-Za-z][\\w.:-]*)?(?:\\s[^<>]*)?>$`);
// A tag name being typed right after "<".
const PARTIAL_TAG = new RegExp(`${NOT_AFTER_IDENTIFIER}<([A-Za-z][\\w-]*)?$`);

// JSX lives in .jsx/.tsx files (and often .js); plain .ts files use "<" for generics only.
function isJsxModel(model: Monaco.editor.ITextModel) {
  return /\.(jsx|tsx|js)$/.test(model.uri.path);
}

function supportsTags(model: Monaco.editor.ITextModel) {
  return model.getLanguageId() === "html" || isJsxModel(model);
}

// Typing ">" to finish an opening tag inserts the matching closing tag after the cursor.
export function enableAutoCloseTags(editor: Monaco.editor.IStandaloneCodeEditor, monaco: MonacoApi) {
  return editor.onDidChangeModelContent((event) => {
    if (event.isUndoing || event.isRedoing || event.changes.length !== 1) return;
    const [change] = event.changes;
    if (change.text !== ">") return;

    const model = editor.getModel();
    if (!model || !supportsTags(model)) return;

    const line = change.range.startLineNumber;
    const column = change.range.startColumn + 1;
    const before = model.getValueInRange(new monaco.Range(Math.max(1, line - 5), 1, line, column));
    if (before.endsWith("/>")) return;

    const match = before.match(OPENING_TAG);
    if (!match) return;
    const tag = match[1] ?? "";
    if (VOID_ELEMENTS.has(tag.toLowerCase())) return;

    const closing = `</${tag}>`;
    const after = model.getValueInRange(new monaco.Range(line, column, line, column + closing.length));
    if (after === closing) return;

    editor.executeEdits("auto-close-tag", [{ range: new monaco.Range(line, column, line, column), text: closing }]);
    editor.setPosition({ lineNumber: line, column });
  });
}

// Suggests HTML element names after "<" in JSX files.
export function registerJsxTagCompletions(monaco: MonacoApi) {
  return monaco.languages.registerCompletionItemProvider(["javascript", "typescript"], {
    triggerCharacters: ["<"],
    provideCompletionItems(model, position) {
      if (!isJsxModel(model)) return { suggestions: [] };

      const before = model.getValueInRange(
        new monaco.Range(position.lineNumber, 1, position.lineNumber, position.column),
      );
      const match = before.match(PARTIAL_TAG);
      if (!match) return { suggestions: [] };

      const typed = match[1] ?? "";
      const range = new monaco.Range(
        position.lineNumber,
        position.column - typed.length,
        position.lineNumber,
        position.column,
      );
      return {
        suggestions: HTML_TAGS.map((tag) => ({
          label: tag,
          kind: monaco.languages.CompletionItemKind.Property,
          detail: "HTML element",
          insertText: tag,
          range,
          sortText: `0${tag}`,
        })),
      };
    },
  });
}
