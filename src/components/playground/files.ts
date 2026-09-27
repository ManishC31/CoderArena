export type PlaygroundFile = {
  // Relative to the project root, e.g. "src/App.jsx".
  path: string;
  content: string;
};

const LANGUAGES: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  json: "json",
  css: "css",
  html: "html",
  // Monaco has no Vue mode; HTML highlights single-file components well enough.
  vue: "html",
  md: "markdown",
};

export function extensionOf(path: string) {
  const name = path.split("/").pop() ?? "";
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}

// Monaco language id for a file.
export function languageForPath(path: string) {
  return LANGUAGES[extensionOf(path)] ?? "plaintext";
}

// Safe relative paths only: no leading "/", no ".." or empty segments, no backslashes.
export function isValidFilePath(path: string) {
  if (!path || path.length > 255 || path.includes("\\")) return false;
  return path.split("/").every((segment) => segment !== "" && segment !== "." && segment !== "..");
}
