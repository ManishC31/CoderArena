import type { editor } from "monaco-editor";
import type { ITheme } from "@xterm/xterm";

// Colors for the workspace around the editor (explorer, tabs, terminal header),
// exposed as --ws-* CSS variables by PlaygroundWorkspace.
type ChromeColors = {
  editor: string;
  sidebar: string;
  border: string;
  foreground: string;
  muted: string;
  hover: string;
  active: string;
  accent: string;
};

export type EditorTheme = {
  // Also the Monaco theme name, so letters, digits and dashes only.
  id: string;
  name: string;
  type: "dark" | "light";
  monaco: editor.IStandaloneThemeData;
  chrome: ChromeColors;
  terminal: ITheme;
  // Swatch shown in the settings menu: background + two accent colors.
  swatch: [string, string, string];
};

type SyntaxColors = {
  comment: string;
  keyword: string;
  string: string;
  number: string;
  regexp: string;
  type: string;
  tag: string;
  attribute: string;
  jsonKey: string;
  delimiter: string;
  italicComments?: boolean;
};

// Monarch token rules shared by all custom themes (JS/TS, HTML, CSS, JSON).
function syntaxRules(colors: SyntaxColors): editor.ITokenThemeRule[] {
  const hex = (color: string) => color.replace("#", "");
  return [
    { token: "comment", foreground: hex(colors.comment), fontStyle: colors.italicComments ? "italic" : "" },
    { token: "keyword", foreground: hex(colors.keyword) },
    { token: "string", foreground: hex(colors.string) },
    { token: "string.key.json", foreground: hex(colors.jsonKey) },
    { token: "number", foreground: hex(colors.number) },
    { token: "regexp", foreground: hex(colors.regexp) },
    { token: "type", foreground: hex(colors.type) },
    { token: "tag", foreground: hex(colors.tag) },
    { token: "metatag", foreground: hex(colors.tag) },
    { token: "attribute.name", foreground: hex(colors.attribute) },
    { token: "attribute.value", foreground: hex(colors.string) },
    { token: "delimiter", foreground: hex(colors.delimiter) },
  ];
}

type EditorColors = {
  background: string;
  foreground: string;
  lineHighlight: string;
  selection: string;
  cursor: string;
  lineNumber: string;
  activeLineNumber: string;
  widget: string;
  widgetBorder: string;
};

function editorColors(colors: EditorColors): editor.IColors {
  return {
    "editor.background": colors.background,
    "editor.foreground": colors.foreground,
    "editor.lineHighlightBackground": colors.lineHighlight,
    "editor.selectionBackground": colors.selection,
    "editorCursor.foreground": colors.cursor,
    "editorLineNumber.foreground": colors.lineNumber,
    "editorLineNumber.activeForeground": colors.activeLineNumber,
    "editorWidget.background": colors.widget,
    "editorWidget.border": colors.widgetBorder,
    "editorSuggestWidget.background": colors.widget,
    "editorSuggestWidget.border": colors.widgetBorder,
  };
}

// xterm's default ANSI colors suit dark backgrounds; light themes need darker ones.
const lightAnsi: ITheme = {
  black: "#24292f",
  red: "#cf222e",
  green: "#116329",
  yellow: "#9a6700",
  blue: "#0969da",
  magenta: "#8250df",
  cyan: "#1b7c83",
  white: "#6e7781",
  brightBlack: "#57606a",
  brightRed: "#a40e26",
  brightGreen: "#1a7f37",
  brightYellow: "#633c01",
  brightBlue: "#218bff",
  brightMagenta: "#a475f9",
  brightCyan: "#3192aa",
  brightWhite: "#8c959f",
};

export const EDITOR_THEMES = [
  {
    id: "vs-dark-plus",
    name: "VS Code Dark",
    type: "dark",
    monaco: { base: "vs-dark", inherit: true, rules: [], colors: {} },
    chrome: {
      editor: "#1e1e1e",
      sidebar: "#252526",
      border: "#2b2b2b",
      foreground: "#cccccc",
      muted: "#8b8b8b",
      hover: "#2a2d2e",
      active: "#37373d",
      accent: "#007fd4",
    },
    terminal: { background: "#1e1e1e", foreground: "#cccccc", cursor: "#aeafad", selectionBackground: "#264f78" },
    swatch: ["#1e1e1e", "#569cd6", "#ce9178"],
  },
  {
    id: "vs-light-plus",
    name: "VS Code Light",
    type: "light",
    monaco: { base: "vs", inherit: true, rules: [], colors: {} },
    chrome: {
      editor: "#ffffff",
      sidebar: "#f3f3f3",
      border: "#e5e5e5",
      foreground: "#333333",
      muted: "#6f6f6f",
      hover: "#e8e8e8",
      active: "#e4e6f1",
      accent: "#005fb8",
    },
    terminal: {
      background: "#ffffff",
      foreground: "#333333",
      cursor: "#005fb8",
      selectionBackground: "#add6ff",
      ...lightAnsi,
    },
    swatch: ["#ffffff", "#0000ff", "#a31515"],
  },
  {
    id: "one-dark",
    name: "One Dark",
    type: "dark",
    monaco: {
      base: "vs-dark",
      inherit: true,
      rules: syntaxRules({
        comment: "#5c6370",
        keyword: "#c678dd",
        string: "#98c379",
        number: "#d19a66",
        regexp: "#56b6c2",
        type: "#e5c07b",
        tag: "#e06c75",
        attribute: "#d19a66",
        jsonKey: "#e06c75",
        delimiter: "#abb2bf",
        italicComments: true,
      }),
      colors: editorColors({
        background: "#282c34",
        foreground: "#abb2bf",
        lineHighlight: "#2c313c",
        selection: "#3e4451",
        cursor: "#528bff",
        lineNumber: "#495162",
        activeLineNumber: "#abb2bf",
        widget: "#21252b",
        widgetBorder: "#181a1f",
      }),
    },
    chrome: {
      editor: "#282c34",
      sidebar: "#21252b",
      border: "#181a1f",
      foreground: "#abb2bf",
      muted: "#7f848e",
      hover: "#2c313a",
      active: "#323842",
      accent: "#528bff",
    },
    terminal: { background: "#282c34", foreground: "#abb2bf", cursor: "#528bff", selectionBackground: "#3e4451" },
    swatch: ["#282c34", "#c678dd", "#98c379"],
  },
  {
    id: "dracula",
    name: "Dracula",
    type: "dark",
    monaco: {
      base: "vs-dark",
      inherit: true,
      rules: syntaxRules({
        comment: "#6272a4",
        keyword: "#ff79c6",
        string: "#f1fa8c",
        number: "#bd93f9",
        regexp: "#ff5555",
        type: "#8be9fd",
        tag: "#ff79c6",
        attribute: "#50fa7b",
        jsonKey: "#8be9fd",
        delimiter: "#f8f8f2",
        italicComments: true,
      }),
      colors: editorColors({
        background: "#282a36",
        foreground: "#f8f8f2",
        lineHighlight: "#44475a80",
        selection: "#44475a",
        cursor: "#f8f8f0",
        lineNumber: "#6272a4",
        activeLineNumber: "#f8f8f2",
        widget: "#21222c",
        widgetBorder: "#191a21",
      }),
    },
    chrome: {
      editor: "#282a36",
      sidebar: "#21222c",
      border: "#191a21",
      foreground: "#f8f8f2",
      muted: "#6272a4",
      hover: "#343746",
      active: "#44475a",
      accent: "#bd93f9",
    },
    terminal: { background: "#282a36", foreground: "#f8f8f2", cursor: "#f8f8f0", selectionBackground: "#44475a" },
    swatch: ["#282a36", "#ff79c6", "#50fa7b"],
  },
  {
    id: "monokai",
    name: "Monokai",
    type: "dark",
    monaco: {
      base: "vs-dark",
      inherit: true,
      rules: syntaxRules({
        comment: "#75715e",
        keyword: "#f92672",
        string: "#e6db74",
        number: "#ae81ff",
        regexp: "#e6db74",
        type: "#66d9ef",
        tag: "#f92672",
        attribute: "#a6e22e",
        jsonKey: "#66d9ef",
        delimiter: "#f8f8f2",
      }),
      colors: editorColors({
        background: "#272822",
        foreground: "#f8f8f2",
        lineHighlight: "#3e3d32",
        selection: "#49483e",
        cursor: "#f8f8f0",
        lineNumber: "#90908a",
        activeLineNumber: "#c2c2bf",
        widget: "#1e1f1c",
        widgetBorder: "#414339",
      }),
    },
    chrome: {
      editor: "#272822",
      sidebar: "#1e1f1c",
      border: "#3b3c35",
      foreground: "#f8f8f2",
      muted: "#90908a",
      hover: "#3e3d32",
      active: "#414339",
      accent: "#a6e22e",
    },
    terminal: { background: "#272822", foreground: "#f8f8f2", cursor: "#f8f8f0", selectionBackground: "#49483e" },
    swatch: ["#272822", "#f92672", "#a6e22e"],
  },
  {
    id: "nord",
    name: "Nord",
    type: "dark",
    monaco: {
      base: "vs-dark",
      inherit: true,
      rules: syntaxRules({
        comment: "#616e88",
        keyword: "#81a1c1",
        string: "#a3be8c",
        number: "#b48ead",
        regexp: "#ebcb8b",
        type: "#8fbcbb",
        tag: "#81a1c1",
        attribute: "#8fbcbb",
        jsonKey: "#8fbcbb",
        delimiter: "#eceff4",
        italicComments: true,
      }),
      colors: editorColors({
        background: "#2e3440",
        foreground: "#d8dee9",
        lineHighlight: "#3b4252",
        selection: "#434c5e",
        cursor: "#d8dee9",
        lineNumber: "#4c566a",
        activeLineNumber: "#d8dee9",
        widget: "#2e3440",
        widgetBorder: "#3b4252",
      }),
    },
    chrome: {
      editor: "#2e3440",
      sidebar: "#2b303b",
      border: "#3b4252",
      foreground: "#d8dee9",
      muted: "#7b88a1",
      hover: "#3b4252",
      active: "#434c5e",
      accent: "#88c0d0",
    },
    terminal: { background: "#2e3440", foreground: "#d8dee9", cursor: "#d8dee9", selectionBackground: "#434c5e" },
    swatch: ["#2e3440", "#81a1c1", "#a3be8c"],
  },
  {
    id: "github-dark",
    name: "GitHub Dark",
    type: "dark",
    monaco: {
      base: "vs-dark",
      inherit: true,
      rules: syntaxRules({
        comment: "#8b949e",
        keyword: "#ff7b72",
        string: "#a5d6ff",
        number: "#79c0ff",
        regexp: "#7ee787",
        type: "#ffa657",
        tag: "#7ee787",
        attribute: "#79c0ff",
        jsonKey: "#7ee787",
        delimiter: "#e6edf3",
      }),
      colors: editorColors({
        background: "#0d1117",
        foreground: "#e6edf3",
        lineHighlight: "#161b22",
        selection: "#264f78",
        cursor: "#2f81f7",
        lineNumber: "#6e7681",
        activeLineNumber: "#e6edf3",
        widget: "#161b22",
        widgetBorder: "#30363d",
      }),
    },
    chrome: {
      editor: "#0d1117",
      sidebar: "#010409",
      border: "#30363d",
      foreground: "#e6edf3",
      muted: "#8b949e",
      hover: "#161b22",
      active: "#1f242c",
      accent: "#1f6feb",
    },
    terminal: { background: "#0d1117", foreground: "#e6edf3", cursor: "#2f81f7", selectionBackground: "#264f78" },
    swatch: ["#0d1117", "#ff7b72", "#a5d6ff"],
  },
  {
    id: "github-light",
    name: "GitHub Light",
    type: "light",
    monaco: {
      base: "vs",
      inherit: true,
      rules: syntaxRules({
        comment: "#6e7781",
        keyword: "#cf222e",
        string: "#0a3069",
        number: "#0550ae",
        regexp: "#116329",
        type: "#953800",
        tag: "#116329",
        attribute: "#0550ae",
        jsonKey: "#0550ae",
        delimiter: "#1f2328",
      }),
      colors: editorColors({
        background: "#ffffff",
        foreground: "#1f2328",
        lineHighlight: "#f6f8fa",
        selection: "#0969da33",
        cursor: "#0969da",
        lineNumber: "#8c959f",
        activeLineNumber: "#1f2328",
        widget: "#ffffff",
        widgetBorder: "#d0d7de",
      }),
    },
    chrome: {
      editor: "#ffffff",
      sidebar: "#f6f8fa",
      border: "#d0d7de",
      foreground: "#1f2328",
      muted: "#656d76",
      hover: "#eaeef2",
      active: "#dde3ea",
      accent: "#0969da",
    },
    terminal: {
      background: "#ffffff",
      foreground: "#1f2328",
      cursor: "#0969da",
      selectionBackground: "#0969da33",
      ...lightAnsi,
    },
    swatch: ["#ffffff", "#cf222e", "#0a3069"],
  },
] as const satisfies readonly EditorTheme[];

export type EditorThemeId = (typeof EDITOR_THEMES)[number]["id"];

export function getEditorTheme(id: EditorThemeId): (typeof EDITOR_THEMES)[number] {
  return EDITOR_THEMES.find((theme) => theme.id === id) ?? EDITOR_THEMES[0];
}
