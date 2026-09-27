import {
  Fira_Code,
  Geist_Mono,
  IBM_Plex_Mono,
  Inconsolata,
  JetBrains_Mono,
  Roboto_Mono,
  Source_Code_Pro,
} from "next/font/google";
import type { EditorFontId } from "@/components/playground/editor-settings";

// Self-hosted by next/font. preload: false, so a font only downloads once it's used.
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], display: "swap", preload: false });
const firaCode = Fira_Code({ subsets: ["latin"], display: "swap", preload: false });
const geistMono = Geist_Mono({ subsets: ["latin"], display: "swap", preload: false });
const sourceCodePro = Source_Code_Pro({ subsets: ["latin"], display: "swap", preload: false });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "700"], display: "swap", preload: false });
const robotoMono = Roboto_Mono({ subsets: ["latin"], display: "swap", preload: false });
const inconsolata = Inconsolata({ subsets: ["latin"], display: "swap", preload: false });

// CSS font-family value for each font choice.
export const FONT_FAMILIES: Record<EditorFontId, string> = {
  "jetbrains-mono": jetbrainsMono.style.fontFamily,
  "fira-code": firaCode.style.fontFamily,
  "geist-mono": geistMono.style.fontFamily,
  "source-code-pro": sourceCodePro.style.fontFamily,
  "ibm-plex-mono": ibmPlexMono.style.fontFamily,
  "roboto-mono": robotoMono.style.fontFamily,
  inconsolata: inconsolata.style.fontFamily,
  system: 'Menlo, Monaco, Consolas, "Courier New", monospace',
};
