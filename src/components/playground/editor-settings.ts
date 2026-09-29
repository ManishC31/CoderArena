import { EDITOR_THEMES, type EditorThemeId } from "@/components/playground/editor-themes";

// Font choices. The font files themselves are set up in editor-fonts.ts (next/font).
export const EDITOR_FONTS = [
  { id: "jetbrains-mono", name: "JetBrains Mono" },
  { id: "fira-code", name: "Fira Code" },
  { id: "geist-mono", name: "Geist Mono" },
  { id: "source-code-pro", name: "Source Code Pro" },
  { id: "ibm-plex-mono", name: "IBM Plex Mono" },
  { id: "roboto-mono", name: "Roboto Mono" },
  { id: "inconsolata", name: "Inconsolata" },
  { id: "system", name: "System (Menlo / Consolas)" },
] as const;

export type EditorFontId = (typeof EDITOR_FONTS)[number]["id"];

export type EditorSettings = {
  themeId: EditorThemeId;
  fontId: EditorFontId;
  fontSize: number;
};

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  themeId: "vs-dark-plus",
  fontId: "jetbrains-mono",
  fontSize: 14,
};

export const FONT_SIZE = { min: 10, max: 28 } as const;

type SettingsInput = Partial<Record<keyof EditorSettings, unknown>>;

function isThemeId(value: unknown): value is EditorThemeId {
  return EDITOR_THEMES.some(({ id }) => id === value);
}

function isFontId(value: unknown): value is EditorFontId {
  return EDITOR_FONTS.some(({ id }) => id === value);
}

function isFontSize(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= FONT_SIZE.min && (value as number) <= FONT_SIZE.max;
}

// For reading saved settings: anything missing or no longer valid (e.g. a removed theme)
// falls back to its default.
export function normalizeEditorSettings(value: SettingsInput | null | undefined): EditorSettings {
  const { themeId, fontId, fontSize } = value ?? {};
  return {
    themeId: isThemeId(themeId) ? themeId : DEFAULT_EDITOR_SETTINGS.themeId,
    fontId: isFontId(fontId) ? fontId : DEFAULT_EDITOR_SETTINGS.fontId,
    fontSize: isFontSize(fontSize) ? fontSize : DEFAULT_EDITOR_SETTINGS.fontSize,
  };
}

// For saving: returns the settings only if every field is valid, otherwise null.
export function validateEditorSettings(value: unknown): EditorSettings | null {
  if (typeof value !== "object" || value === null) return null;
  const { themeId, fontId, fontSize } = value as SettingsInput;
  if (!isThemeId(themeId) || !isFontId(fontId) || !isFontSize(fontSize)) return null;
  return { themeId, fontId, fontSize };
}
