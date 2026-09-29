// A small read-only shell over the playground's files, for the terminal panel.
// Running code (npm, node, ...) needs a runtime and isn't wired up yet.

type Files = Record<string, string>;

type CommandResult = {
  output?: string;
  cwd?: string;
  clear?: boolean;
};

const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD_BLUE = "\x1b[1;34m";

// Shown as the project's location; paths inside the shell are relative to it ("" is the root).
const ROOT = "/project";

const HELP: [usage: string, description: string][] = [
  ["help", "Show this list"],
  ["ls [dir]", "List files"],
  ["cd [dir]", "Change directory"],
  ["pwd", "Print the current directory"],
  ["cat <file>", "Print a file"],
  ["tree [dir]", "Show the folder tree"],
  ["echo <text>", "Print text"],
  ["clear", "Clear the terminal"],
];

const RUNTIME_COMMANDS = new Set(["npm", "npx", "node", "pnpm", "yarn", "bun", "deno", "git"]);

const error = (message: string) => `${RED}${message}${RESET}`;

function displayPath(path: string) {
  return path ? `${ROOT}/${path}` : ROOT;
}

// Resolves what the user typed ("../src", "/project/app", "~") against the current directory.
function resolvePath(cwd: string, input: string) {
  let rest = input;
  let parts = cwd ? cwd.split("/") : [];
  if (rest === "~" || rest.startsWith("~/")) {
    parts = [];
    rest = rest.slice(1);
  } else if (rest === ROOT || rest.startsWith(`${ROOT}/`)) {
    parts = [];
    rest = rest.slice(ROOT.length);
  } else if (rest.startsWith("/")) {
    parts = [];
  }
  for (const segment of rest.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") parts.pop();
    else parts.push(segment);
  }
  return parts.join("/");
}

function isDirectory(files: Files, path: string) {
  return path === "" || Object.keys(files).some((file) => file.startsWith(`${path}/`));
}

function listDirectory(files: Files, dir: string) {
  const prefix = dir ? `${dir}/` : "";
  const dirs = new Set<string>();
  const names: string[] = [];
  for (const path of Object.keys(files)) {
    if (!path.startsWith(prefix)) continue;
    const [name, ...rest] = path.slice(prefix.length).split("/");
    if (rest.length) dirs.add(name);
    else names.push(name);
  }
  return { dirs: [...dirs].sort(), files: names.sort() };
}

function treeLines(files: Files, dir: string, indent = ""): string[] {
  const { dirs, files: names } = listDirectory(files, dir);
  const entries = [
    ...dirs.map((name) => ({ name, isDir: true })),
    ...names.map((name) => ({ name, isDir: false })),
  ];
  return entries.flatMap(({ name, isDir }, index) => {
    const last = index === entries.length - 1;
    const line = `${indent}${last ? "└── " : "├── "}${isDir ? `${BOLD_BLUE}${name}${RESET}` : name}`;
    if (!isDir) return [line];
    const child = dir ? `${dir}/${name}` : name;
    return [line, ...treeLines(files, child, indent + (last ? "    " : "│   "))];
  });
}

// Splits a command line into words, keeping "quoted text" together.
function tokenize(line: string) {
  return [...line.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map((match) => match[1] ?? match[2] ?? match[3]);
}

export function runCommand(line: string, files: Files, cwd: string): CommandResult {
  const [command, ...args] = tokenize(line);
  if (!command) return {};

  switch (command) {
    case "help":
      return {
        output: [
          "Available commands:",
          ...HELP.map(([usage, description]) => `  ${usage.padEnd(12)} ${DIM}${description}${RESET}`),
        ].join("\n"),
      };

    case "pwd":
      return { output: displayPath(cwd) };

    case "echo":
      return { output: args.join(" ") };

    case "clear":
      return { clear: true };

    case "cd": {
      const target = resolvePath(cwd, args[0] ?? "~");
      if (target in files) return { output: error(`cd: not a directory: ${args[0]}`) };
      if (!isDirectory(files, target)) return { output: error(`cd: no such file or directory: ${args[0]}`) };
      return { cwd: target };
    }

    case "ls": {
      const target = resolvePath(cwd, args[0] ?? ".");
      if (target in files) return { output: args[0] };
      if (!isDirectory(files, target)) return { output: error(`ls: ${args[0]}: No such file or directory`) };
      const { dirs, files: names } = listDirectory(files, target);
      return { output: [...dirs.map((dir) => `${BOLD_BLUE}${dir}/${RESET}`), ...names].join("  ") };
    }

    case "cat": {
      if (!args.length) return { output: error("cat: missing file operand") };
      const output = args.map((arg) => {
        const target = resolvePath(cwd, arg);
        if (target in files) return files[target].replace(/\n$/, "");
        return error(
          isDirectory(files, target) ? `cat: ${arg}: Is a directory` : `cat: ${arg}: No such file or directory`,
        );
      });
      return { output: output.join("\n") };
    }

    case "tree": {
      const target = resolvePath(cwd, args[0] ?? ".");
      if (target in files || !isDirectory(files, target)) {
        return { output: error(`tree: ${args[0]}: No such directory`) };
      }
      return { output: [`${BOLD_BLUE}${args[0] ?? "."}${RESET}`, ...treeLines(files, target)].join("\n") };
    }

    default:
      if (RUNTIME_COMMANDS.has(command)) {
        return { output: `${YELLOW}${command}: running code isn't available in this playground yet.${RESET}` };
      }
      return { output: error(`command not found: ${command}`) };
  }
}

type ShellOptions = {
  write: (text: string) => void;
  clear: () => void;
  // Latest file contents, including unsaved edits in the editor.
  getFiles: () => Files;
};

// Line editing on top of runCommand: typing, backspace, history (↑/↓), Ctrl+C and Ctrl+L.
export function createShell({ write, clear, getFiles }: ShellOptions) {
  let cwd = "";
  let line = "";
  const history: string[] = [];
  let historyIndex = 0;

  const prompt = () => `${GREEN}➜${RESET} ${CYAN}${displayPath(cwd)}${RESET} $ `;

  function replaceLine(text: string) {
    line = text;
    write(`\x1b[2K\r${prompt()}${line}`);
  }

  function execute() {
    write("\r\n");
    const input = line.trim();
    line = "";
    if (input) history.push(input);
    historyIndex = history.length;

    const result = runCommand(input, getFiles(), cwd);
    if (result.cwd !== undefined) cwd = result.cwd;
    if (result.clear) clear();
    if (result.output) write(`${result.output.replace(/\n/g, "\r\n")}\r\n`);
    write(prompt());
  }

  return {
    start() {
      write(`${DIM}CoderArena terminal. Type "help" to see the available commands.${RESET}\r\n`);
      write(prompt());
    },

    // Keystrokes and pasted text from the terminal.
    input(data: string) {
      switch (data) {
        case "\x1b[A": // ↑
          if (historyIndex > 0) replaceLine(history[--historyIndex]);
          return;
        case "\x1b[B": // ↓
          if (historyIndex < history.length) replaceLine(history[++historyIndex] ?? "");
          return;
        case "\x03": // Ctrl+C
          line = "";
          write(`^C\r\n${prompt()}`);
          return;
        case "\x0c": // Ctrl+L
          clear();
          return;
      }
      // Other escape sequences (←/→, function keys) aren't supported.
      if (data.startsWith("\x1b")) return;

      for (const char of data) {
        if (char === "\r") {
          execute();
        } else if (char === "\x7f" || char === "\b") {
          if (line) {
            line = line.slice(0, -1);
            write("\b \b");
          }
        } else if (char >= " ") {
          line += char;
          write(char);
        }
      }
    },
  };
}
