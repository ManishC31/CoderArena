// Starts the playground's Angular dev server behind the app's preview proxy and records its
// builds, so wait-for-rebuild.sh can hold an update until the rebuild it starts is done.
// Unlike Vite, Angular builds when files change rather than when they're requested, and
// serves the previous build until the new one is ready.
//
// /tmp/coderarena-build: "<builds> <building|complete|failed>". A build counts as soon as it
// has compiled, and stays "building" until its errors have printed.
// /tmp/coderarena-build-errors: the latest build's errors, empty when it succeeded
import { spawn } from "node:child_process";
import { renameSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";

const STATE_FILE = "/tmp/coderarena-build";
const ERRORS_FILE = "/tmp/coderarena-build-errors";
// A build's errors are printed after its "generation failed" line; wait until they stop.
const SETTLE_MS = 200;
// Exit code when the first build fails; see waitUntilReady in src/lib/sandbox/sandbox.ts.
const FIRST_BUILD_FAILED = 3;

const ng = spawn(
  "sh",
  [
    "-c",
    // One stream, so errors stay in order with the build messages around them.
    'exec ./node_modules/.bin/ng serve "$@" 2>&1',
    "sh",
    "--host",
    "0.0.0.0",
    "--port",
    "4200",
    // The proxy serves the preview under /api/sandbox/preview/<token>/.
    "--serve-path",
    process.env.PREVIEW_BASE ?? "/",
    // The proxy only speaks HTTP, so there's no WebSocket for live reload or HMR.
    // The editor reloads the preview after each change instead.
    "--live-reload=false",
    "--hmr=false",
  ],
  { cwd: "/workspace", stdio: ["ignore", "pipe", "inherit"], env: { ...process.env, NO_COLOR: "1" } },
);
let exitCode;
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => ng.kill(signal));
ng.on("exit", (code) => process.exit(exitCode ?? code ?? 1));

let builds = 0;
let building = false;
// Set from a build's last line until its output settles.
let finished;
let settleTimer;
// Inside ng serve's warning about listening on 0.0.0.0, which it must for Docker to publish
// the port. Only the app's proxy can reach it, and the warning would push a failed first
// build's errors down the logs the editor shows.
let inHostWarning = false;

createInterface({ input: ng.stdout }).on("line", (line) => {
  if (line.startsWith("Warning: This is a simple server")) inHostWarning = true;
  if (inHostWarning) {
    if (line.endsWith("websocket connection issues.")) inHostWarning = false;
    return;
  }
  console.log(line);

  // A spinner line when a build starts, and again when it ends:
  // "⠋ Building...", then "⠋ Changes detected. Rebuilding..." for each later build.
  if (/(Building|Rebuilding)\.\.\.$/.test(line)) {
    if (finished) finish();
    if (!building) {
      building = true;
      save("building");
    }
    return;
  }

  const result = /Application bundle generation (complete|failed)/.exec(line)?.[1];
  if (result) {
    // Counted now: the dev server answers as soon as it has the build, and an upload then
    // reads this count to tell its own rebuild apart.
    builds += 1;
    save("building");
    finished = { result, lines: [line] };
  } else if (finished) {
    finished.lines.push(line);
  }
  if (finished) {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(finish, SETTLE_MS);
  }
});

function finish() {
  clearTimeout(settleTimer);
  const { result, lines } = finished;
  finished = undefined;
  building = false;
  writeFileSync(ERRORS_FILE, result === "failed" ? `${lines.join("\n").trim()}\n` : "");
  save(result);

  // The dev server only starts listening after a build succeeds. Stop, so the app reports the
  // errors instead of waiting for a server that isn't coming.
  if (result === "failed" && builds === 1) {
    exitCode = FIRST_BUILD_FAILED;
    ng.kill();
  }
}

// Replaced in one step, so wait-for-rebuild.sh never reads half a line.
function save(state) {
  writeFileSync(`${STATE_FILE}.tmp`, `${builds} ${state}\n`);
  renameSync(`${STATE_FILE}.tmp`, STATE_FILE);
}
