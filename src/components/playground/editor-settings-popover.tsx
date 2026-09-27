"use client";

import { Minus, Plus, Settings } from "lucide-react";
import { FONT_FAMILIES } from "@/components/playground/editor-fonts";
import {
  DEFAULT_EDITOR_SETTINGS,
  EDITOR_FONTS,
  FONT_SIZE,
  type EditorFontId,
  type EditorSettings,
} from "@/components/playground/editor-settings";
import { EDITOR_THEMES, type EditorThemeId } from "@/components/playground/editor-themes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Labels for the selects: each theme with its color swatch, each font set in itself.
const themeItems = Object.fromEntries(
  EDITOR_THEMES.map((theme) => [
    theme.id,
    <span key={theme.id} className="flex items-center gap-2">
      <span className="flex overflow-hidden rounded-sm ring-1 ring-foreground/15">
        {theme.swatch.map((color) => (
          <span key={color} className="size-3" style={{ backgroundColor: color }} />
        ))}
      </span>
      {theme.name}
    </span>,
  ]),
);

const fontItems = Object.fromEntries(
  EDITOR_FONTS.map((font) => [
    font.id,
    <span key={font.id} style={{ fontFamily: FONT_FAMILIES[font.id] }}>
      {font.name}
    </span>,
  ]),
);

type Props = {
  settings: EditorSettings;
  onChange: (settings: EditorSettings) => void;
};

export function EditorSettingsPopover({ settings, onChange }: Props) {
  const update = (changes: Partial<EditorSettings>) => onChange({ ...settings, ...changes });

  return (
    <Popover>
      <PopoverTrigger
        aria-label="Editor settings"
        title="Editor settings"
        className="flex shrink-0 items-center px-2.5 text-(--ws-muted) outline-none hover:text-(--ws-fg) focus-visible:ring-1 focus-visible:ring-(--ws-accent) focus-visible:ring-inset data-popup-open:text-(--ws-fg)"
      >
        <Settings className="size-4" />
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 gap-4 p-4">
        <PopoverTitle className="text-sm font-medium">Editor settings</PopoverTitle>

        <div className="grid gap-2">
          <Label>Theme</Label>
          <Select
            items={themeItems}
            value={settings.themeId}
            onValueChange={(themeId) => themeId && update({ themeId: themeId as EditorThemeId })}
          >
            <SelectTrigger aria-label="Theme" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EDITOR_THEMES.map((theme) => (
                <SelectItem key={theme.id} value={theme.id}>
                  {themeItems[theme.id]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Font family</Label>
          <Select
            items={fontItems}
            value={settings.fontId}
            onValueChange={(fontId) => fontId && update({ fontId: fontId as EditorFontId })}
          >
            <SelectTrigger aria-label="Font family" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EDITOR_FONTS.map((font) => (
                <SelectItem key={font.id} value={font.id}>
                  {fontItems[font.id]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label id="font-size-label">Font size</Label>
          <div role="group" aria-labelledby="font-size-label" className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Decrease font size"
              disabled={settings.fontSize <= FONT_SIZE.min}
              onClick={() => update({ fontSize: settings.fontSize - 1 })}
            >
              <Minus />
            </Button>
            <span aria-live="polite" className="w-12 text-center text-sm tabular-nums">
              {settings.fontSize}px
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Increase font size"
              disabled={settings.fontSize >= FONT_SIZE.max}
              onClick={() => update({ fontSize: settings.fontSize + 1 })}
            >
              <Plus />
            </Button>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start text-muted-foreground"
          onClick={() => onChange(DEFAULT_EDITOR_SETTINGS)}
        >
          Reset to defaults
        </Button>
      </PopoverContent>
    </Popover>
  );
}
