// Token colors for code in the mockups: VS Code Light+ and Dark+, the editor's default themes.
export const syntax = {
  keyword: "text-[#0000ff] dark:text-[#569cd6]",
  control: "text-[#af00db] dark:text-[#c586c0]",
  function: "text-[#795e26] dark:text-[#dcdcaa]",
  type: "text-[#267f99] dark:text-[#4ec9b0]",
  variable: "text-[#001080] dark:text-[#9cdcfe]",
  string: "text-[#a31515] dark:text-[#ce9178]",
  number: "text-[#098658] dark:text-[#b5cea8]",
  tag: "text-[#800000] dark:text-[#569cd6]",
  bracket: "text-[#800000] dark:text-[#808080]",
};

// Terminal colors, from the editor themes' ANSI palettes.
export const terminal = {
  green: "text-[#116329] dark:text-[#0dbc79]",
  cyan: "text-[#1b7c83] dark:text-[#11a8cd]",
};

// Plain text, or text with a syntax color.
export type Token = string | [text: string, className: string];

const colored = (className: string) => (text: string): Token => [text, className];

// Token makers, e.g. `k("const")`, so code in the mockups stays readable.
export const tokens = {
  k: colored(syntax.keyword),
  c: colored(syntax.control),
  f: colored(syntax.function),
  t: colored(syntax.type),
  v: colored(syntax.variable),
  s: colored(syntax.string),
  n: colored(syntax.number),
  tag: colored(syntax.tag),
  b: colored(syntax.bracket),
};
