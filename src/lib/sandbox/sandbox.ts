import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { PlaygroundFile } from "@/components/playground/files";
import type { PlaygroundTemplate } from "@/generated/prisma/enums";
import { docker, DockerError } from "@/lib/sandbox/docker";
import { createTar } from "@/lib/sandbox/tar";

// Runs each playground in its own Docker container under gVisor (runsc). The playground's
// dev server runs inside, and the app proxies its page into the editor's preview
// (src/app/api/sandbox/preview). Setup and security model: sandbox/README.md.

type SandboxImage = {
  // Built from sandbox/images/<template> by `npm run sandbox:build`.
  image: string;
  // Port the dev server listens on inside the container.
  port: number;
  // The preview page, relative to the preview base. Vite serves index.html there; Next.js
  // serves the base path itself ("").
  entry: string;
};

// Templates that can run in a sandbox.
const IMAGES: Partial<Record<PlaygroundTemplate, SandboxImage>> = {
  react: { image: "coderarena/sandbox-react", port: 5173, entry: "index.html" },
  nextjs: { image: "coderarena/sandbox-nextjs", port: 3000, entry: "" },
};

// Previews are served under PREVIEW_PATH/<token>/; the unguessable token is the only credential.
export const PREVIEW_PATH = "/api/sandbox/preview";

const RUNTIME = process.env.SANDBOX_RUNTIME || "runsc";
// Address the Docker host publishes preview ports on, and the ports it may use (any if unset).
const PUBLISH_ADDRESS = process.env.SANDBOX_PUBLISH_ADDRESS || "127.0.0.1";
const PORT_RANGE = parsePortRange(process.env.SANDBOX_PORT_RANGE);
// Published ports are on the Docker host.
const PREVIEW_HOST = dockerHostName(process.env.SANDBOX_DOCKER_HOST) || "127.0.0.1";
// Public resolvers, since sandboxes can't reach private networks (where the host's often are).
const DNS_SERVERS = (process.env.SANDBOX_DNS || "1.1.1.1,8.8.8.8")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);

const MEMORY = "1g";
const CPUS = "1";
const MAX_PROCESSES = "256";
const MAX_PER_USER = 2;
const MAX_SANDBOXES = Math.min(20, PORT_RANGE ? PORT_RANGE.end - PORT_RANGE.start + 1 : Infinity);
const IDLE_TIMEOUT_MS = 15 * 60_000;
// Enforced inside the container, so it holds even if the app isn't around to stop it.
const MAX_LIFETIME_SECONDS = 2 * 60 * 60;
// Long enough for an npm install when a playground changes its dependencies.
const START_TIMEOUT_MS = 3 * 60_000;
const CLEANUP_INTERVAL_MS = 60_000;

// A failure to show the user, with the sandbox's output when it helps.
export class SandboxError extends Error {
  logs?: string;

  constructor(message: string, logs?: string) {
    super(message);
    this.logs = logs;
  }
}

type Sandbox = {
  // Container name.
  name: string;
  playgroundId: string;
  userId: string;
  // Missing on containers started before templates were labeled (all React).
  template?: PlaygroundTemplate;
  token: string;
  running: boolean;
  startedAt: number;
  hostPort?: number;
};

type Upload = {
  // Content hash of each file in the sandbox, by path.
  hashes: Map<string, string>;
  // The dependencies it was started with, from dependencies().
  dependencies?: string;
};

type State = {
  // Running sandboxes by preview token, for the proxy. Rebuilt from Docker after a restart.
  previews: Map<string, Sandbox>;
  previewsRefreshedAt: number;
  // When each sandbox (by name) last served a request or got an update.
  lastActive: Map<string, number>;
  uploads: Map<string, Upload>;
  // Work queued per playground, so runs, stops and cleanup don't interleave.
  locks: Map<string, Promise<unknown>>;
  // Images whose Docker host passed checkHost().
  checkedImages: Set<string>;
  cleanup?: NodeJS.Timeout;
};

// Kept on globalThis so it survives hot reloads in dev.
const globalForSandboxes = globalThis as unknown as { sandboxes?: State };
const state: State = (globalForSandboxes.sandboxes ??= {
  previews: new Map(),
  previewsRefreshedAt: 0,
  lastActive: new Map(),
  uploads: new Map(),
  locks: new Map(),
  checkedImages: new Set(),
});

// A hot reload in development leaves the previous version's cleanup timer running, with
// that version's code. Stop it; the next run starts one with this code.
if (state.cleanup) {
  clearInterval(state.cleanup);
  state.cleanup = undefined;
}

export function canRunInSandbox(template: PlaygroundTemplate) {
  return template in IMAGES;
}

type RunOptions = {
  playgroundId: string;
  userId: string;
  template: PlaygroundTemplate;
  files: PlaygroundFile[];
};

// Starts the playground's sandbox unless it's running, uploads the files that changed since
// the last run, and returns the preview URL.
export function runSandbox(options: RunOptions) {
  startCleanup();
  return withLock(options.playgroundId, async () => {
    const image = IMAGES[options.template];
    if (!image) throw new SandboxError("This template can't run in a sandbox yet.");

    try {
      // First, so an unreachable host or a missing image gets a setup hint rather than the
      // raw error of the first docker command.
      await checkHost(image.image);
      let sandbox = await findSandbox(options.playgroundId);
      // Dependencies are installed as a sandbox starts, so changing them needs a new one.
      if (sandbox && (!sandbox.running || dependenciesChanged(sandbox, options.files))) {
        await removeSandbox(sandbox.name);
        sandbox = undefined;
      }
      if (sandbox) await uploadFiles(sandbox, options.files);
      else sandbox = await createSandbox(options, image);

      state.lastActive.set(sandbox.name, Date.now());
      return { previewUrl: previewUrl(sandbox.token, image) };
    } catch (error) {
      // Check the host again next time, so a setup problem gets a clear message.
      if (error instanceof DockerError) state.checkedImages.clear();
      throw error;
    }
  });
}

export function stopSandbox(playgroundId: string) {
  return withLock(playgroundId, () => removeSandbox(containerName(playgroundId)));
}

// Where the preview proxy sends a request for `token`, or undefined if no running sandbox has it.
export async function resolvePreview(token: string) {
  startCleanup();
  if (!/^[\w-]{32}$/.test(token)) return undefined;
  // The map starts empty after a restart: rebuild it from Docker, at most every few seconds.
  if (!state.previews.has(token) && Date.now() - state.previewsRefreshedAt > 5_000) {
    refreshPreviews(await listSandboxes());
  }
  const sandbox = state.previews.get(token);
  if (!sandbox?.hostPort) return undefined;
  state.lastActive.set(sandbox.name, Date.now());
  return {
    origin: `http://${PREVIEW_HOST}:${sandbox.hostPort}`,
    base: previewBase(sandbox.token),
    entry: IMAGES[sandbox.template ?? "react"]?.entry ?? "",
  };
}

async function createSandbox({ playgroundId, userId, template, files }: RunOptions, { image, port }: SandboxImage) {
  await checkHost(image);
  const others = await makeRoom(userId);

  const sandbox: Sandbox = {
    name: containerName(playgroundId),
    playgroundId,
    userId,
    template,
    token: randomBytes(24).toString("base64url"),
    running: true,
    startedAt: Date.now(),
  };
  const hostPort = await startContainer(sandbox, image, port, others);
  sandbox.hostPort = hostPort;
  // The port may have belonged to a sandbox that stopped on its own: forget that one's token.
  for (const [token, other] of state.previews) {
    if (other.hostPort === hostPort) state.previews.delete(token);
  }

  try {
    await uploadFiles(sandbox, files, { first: true });
    await waitUntilReady(sandbox);
  } catch (error) {
    await removeSandbox(sandbox.name);
    throw error;
  }
  state.previews.set(sandbox.token, sandbox);
  return sandbox;
}

// Starts the container and returns the host port its dev server is published on.
async function startContainer(sandbox: Sandbox, image: string, port: number, others: Sandbox[]) {
  const args = (hostPort = "") => [
    "run",
    "--detach",
    "--pull",
    "never",
    "--name",
    sandbox.name,
    "--runtime",
    RUNTIME,
    // Reaps zombie processes (npm, esbuild) and forwards signals.
    "--init",
    "--label",
    "coderarena.sandbox=true",
    "--label",
    `coderarena.playground=${sandbox.playgroundId}`,
    "--label",
    `coderarena.user=${sandbox.userId}`,
    "--label",
    `coderarena.template=${sandbox.template}`,
    "--label",
    `coderarena.token=${sandbox.token}`,
    "--label",
    `coderarena.started=${sandbox.startedAt}`,
    "--publish",
    `${PUBLISH_ADDRESS}:${hostPort}:${port}`,
    ...DNS_SERVERS.flatMap((server) => ["--dns", server]),
    "--memory",
    MEMORY,
    "--memory-swap",
    MEMORY,
    "--cpus",
    CPUS,
    "--pids-limit",
    MAX_PROCESSES,
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges",
    "--env",
    `PREVIEW_BASE=${previewBase(sandbox.token)}`,
    "--env",
    `SANDBOX_TIMEOUT=${MAX_LIFETIME_SECONDS}`,
    image,
  ];

  // A failed `docker run` can leave the container behind in the "created" state.
  const run = (hostPort?: number) =>
    docker(args(hostPort?.toString())).catch(async (error) => {
      await docker(["rm", "--force", sandbox.name]).catch(() => {});
      throw error;
    });

  if (!PORT_RANGE) {
    await run();
    // e.g. "127.0.0.1:32768"
    const output = await docker(["port", sandbox.name, `${port}/tcp`]);
    return Number(/:(\d+)$/m.exec(output)?.[1]);
  }

  const used = new Set(others.map((other) => other.hostPort));
  const free = [];
  for (let hostPort = PORT_RANGE.start; hostPort <= PORT_RANGE.end; hostPort++) {
    if (!used.has(hostPort)) free.push(hostPort);
  }
  // Random order, so concurrent starts rarely pick the same port; retry when they do.
  for (const hostPort of free.sort(() => Math.random() - 0.5).slice(0, 5)) {
    try {
      await run(hostPort);
      return hostPort;
    } catch (error) {
      if (!(error instanceof DockerError && /already allocated|address already in use/i.test(error.message))) {
        throw error;
      }
    }
  }
  throw new SandboxError("All sandboxes are busy. Try again in a few minutes.");
}

// Stops the user's least recently used sandbox when they're at their limit, and fails when
// the host is full. Returns the sandboxes that keep running.
async function makeRoom(userId: string) {
  const running = (await listSandboxes()).filter((sandbox) => sandbox.running);
  const mine = running.filter((sandbox) => sandbox.userId === userId).sort((a, b) => lastActive(a) - lastActive(b));
  const evicted = mine.slice(0, Math.max(0, mine.length - MAX_PER_USER + 1));
  for (const sandbox of evicted) await removeSandbox(sandbox.name);

  const others = running.filter((sandbox) => !evicted.includes(sandbox));
  if (others.length >= MAX_SANDBOXES) throw new SandboxError("All sandboxes are busy. Try again in a few minutes.");
  return others;
}

// Uploads the files that changed since the last upload and deletes the ones that are gone.
// The first upload also tells the container to start its dev server.
async function uploadFiles(sandbox: Sandbox, files: PlaygroundFile[], { first = false } = {}) {
  const hashes = new Map(files.map((file) => [file.path, hash(file.content)]));
  const previous = first ? undefined : state.uploads.get(sandbox.name);
  const changed = previous ? files.filter((file) => previous.hashes.get(file.path) !== hashes.get(file.path)) : files;
  const deleted = previous ? [...previous.hashes.keys()].filter((path) => !hashes.has(path)) : [];

  if (first || changed.length > 0 || deleted.length > 0) {
    // --touch gives each file a new mtime. tar would restore the old one (to the second),
    // and Vite's watcher ignores changes that keep it.
    const script = `cd /workspace && rm -f -- "$@" && tar --touch -x -f -${first ? " && touch /tmp/coderarena-ready" : ""}`;
    await docker(["exec", "--interactive", sandbox.name, "sh", "-c", script, "sh", ...deleted], {
      input: createTar(changed),
    });
  }
  state.uploads.set(sandbox.name, { hashes, dependencies: previous?.dependencies ?? dependencies(files) });
}

// Waits until the dev server answers. Fails with the container's output if it stops first
// (e.g. an npm install failed) or takes too long.
async function waitUntilReady(sandbox: Sandbox) {
  const url = `http://${PREVIEW_HOST}:${sandbox.hostPort}${previewBase(sandbox.token)}`;
  const deadline = Date.now() + START_TIMEOUT_MS;
  for (let attempt = 1; Date.now() < deadline; attempt++) {
    try {
      const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(2_000) });
      await response.body?.cancel();
      return;
    } catch {
      // Not listening yet.
    }
    if (attempt % 5 === 0 && !(await isRunning(sandbox.name))) {
      throw new SandboxError("The dev server stopped while starting.", await readLogs(sandbox.name));
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new SandboxError("The dev server didn't start in time.", await readLogs(sandbox.name));
}

async function removeSandbox(name: string) {
  try {
    await docker(["rm", "--force", name]);
  } catch (error) {
    if (!(error instanceof DockerError && /no such container/i.test(error.message))) throw error;
  }
  state.lastActive.delete(name);
  state.uploads.delete(name);
  for (const [token, sandbox] of state.previews) {
    if (sandbox.name === name) state.previews.delete(token);
  }
}

// Fails with a setup hint when the Docker engine, the runtime or the image is missing.
async function checkHost(image: string) {
  if (state.checkedImages.has(image)) return;
  if (PORT_RANGE === null) throw new SandboxError('SANDBOX_PORT_RANGE should look like "42000-42019".');

  let runtimes: Record<string, unknown>;
  try {
    runtimes = JSON.parse(await docker(["info", "--format", "{{json .Runtimes}}"]));
  } catch (error) {
    console.error("Couldn't reach the sandbox host", error);
    throw new SandboxError("Can't reach the sandbox host's Docker engine. Is it running? See sandbox/README.md.");
  }
  if (!(RUNTIME in runtimes)) {
    throw new SandboxError(`The sandbox host has no "${RUNTIME}" runtime. Set up gVisor as described in sandbox/README.md.`);
  }
  if (RUNTIME !== "runsc") console.warn(`Sandboxes use the "${RUNTIME}" runtime, without gVisor's isolation.`);

  try {
    await docker(["image", "inspect", "--format", "{{.Id}}", image]);
  } catch {
    throw new SandboxError(`The sandbox image ${image} is missing. Build it with \`npm run sandbox:build\`.`);
  }
  state.checkedImages.add(image);
}

const LIST_FORMAT = [
  ".Names",
  ".State",
  '.Label "coderarena.playground"',
  '.Label "coderarena.user"',
  '.Label "coderarena.template"',
  '.Label "coderarena.token"',
  '.Label "coderarena.started"',
  ".Ports",
]
  .map((field) => `{{${field}}}`)
  .join("\t");

// Sandbox containers, running or not, optionally filtered by a label ("key=value").
async function listSandboxes(label?: string): Promise<Sandbox[]> {
  const filters = ["--filter", "label=coderarena.sandbox", ...(label ? ["--filter", `label=${label}`] : [])];
  const output = await docker(["ps", "--all", ...filters, "--format", LIST_FORMAT]);
  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [name, status, playgroundId, userId, template, token, startedAt, ports] = line.split("\t");
      // e.g. "0.0.0.0:42000->5173/tcp"
      const hostPort = /:(\d+)->/.exec(ports)?.[1];
      return {
        name,
        playgroundId,
        userId,
        template: template && template in IMAGES ? (template as PlaygroundTemplate) : undefined,
        token,
        running: status === "running",
        startedAt: Number(startedAt),
        hostPort: hostPort ? Number(hostPort) : undefined,
      };
    });
}

async function findSandbox(playgroundId: string): Promise<Sandbox | undefined> {
  const [sandbox] = await listSandboxes(`coderarena.playground=${playgroundId}`);
  return sandbox;
}

function refreshPreviews(sandboxes: Sandbox[]) {
  state.previews = new Map(
    sandboxes.filter((sandbox) => sandbox.running && sandbox.hostPort).map((sandbox) => [sandbox.token, sandbox]),
  );
  state.previewsRefreshedAt = Date.now();
}

async function isRunning(name: string) {
  try {
    return (await docker(["inspect", "--format", "{{.State.Running}}", name])).trim() === "true";
  } catch {
    return false;
  }
}

// The container's last lines of output, without terminal colors.
async function readLogs(name: string) {
  const logs = await docker(["logs", "--tail", "40", name], { withStderr: true }).catch(() => "");
  return logs.replace(/\u001b\[[\d;]*m/g, "").trim() || undefined;
}

function startCleanup() {
  if (state.cleanup) return;
  state.cleanup = setInterval(() => {
    cleanUp().catch((error) => console.error("Sandbox cleanup failed", error));
  }, CLEANUP_INTERVAL_MS);
  state.cleanup.unref();
}

// Removes sandboxes that stopped on their own or that nobody has used for IDLE_TIMEOUT_MS.
async function cleanUp() {
  const sandboxes = await listSandboxes();
  refreshPreviews(sandboxes);
  for (const { playgroundId } of sandboxes) {
    await withLock(playgroundId, async () => {
      // Look again: a run may have replaced the sandbox while this waited.
      const sandbox = await findSandbox(playgroundId);
      if (sandbox && (!sandbox.running || Date.now() - lastActive(sandbox) > IDLE_TIMEOUT_MS)) {
        await removeSandbox(sandbox.name);
      }
    });
  }
}

// Runs `task` once the earlier tasks for the same playground have settled.
function withLock<T>(playgroundId: string, task: () => Promise<T>) {
  const result = (state.locks.get(playgroundId) ?? Promise.resolve()).then(task);
  const settled = result.catch(() => {});
  state.locks.set(playgroundId, settled);
  settled.then(() => {
    if (state.locks.get(playgroundId) === settled) state.locks.delete(playgroundId);
  });
  return result;
}

// The dependencies package.json asks for, or undefined while it isn't valid JSON.
function dependencies(files: PlaygroundFile[]) {
  const packageJson = files.find((file) => file.path === "package.json");
  try {
    const { dependencies, devDependencies } = JSON.parse(packageJson?.content ?? "{}");
    return JSON.stringify([dependencies, devDependencies]);
  } catch {
    return undefined;
  }
}

function dependenciesChanged(sandbox: Sandbox, files: PlaygroundFile[]) {
  const before = state.uploads.get(sandbox.name)?.dependencies;
  const now = dependencies(files);
  return before !== undefined && now !== undefined && before !== now;
}

function lastActive(sandbox: Sandbox) {
  return state.lastActive.get(sandbox.name) ?? sandbox.startedAt;
}

function containerName(playgroundId: string) {
  return `coderarena-sandbox-${playgroundId}`;
}

function previewBase(token: string) {
  return `${PREVIEW_PATH}/${token}/`;
}

// The URL the editor loads in the preview. Next.js (the app's and the sandbox's) drops a
// trailing slash from the bare base path, so Vite's page is addressed as index.html, which
// keeps relative URLs working; a Next.js playground serves the base path itself.
function previewUrl(token: string, { entry }: SandboxImage) {
  const base = previewBase(token);
  return entry ? `${base}${entry}` : base.slice(0, -1);
}

function hash(content: string) {
  return createHash("sha256").update(content).digest("base64");
}

// "42000-42019" → { start: 42000, end: 42019 }; undefined when unset, null when invalid.
function parsePortRange(value?: string) {
  if (!value) return undefined;
  const [start, end] = value.split("-").map(Number);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end > 65535 || start > end) return null;
  return { start, end };
}

// "tcp://sandbox-host:2375" → "sandbox-host". Unix sockets are on this machine.
function dockerHostName(dockerHost?: string) {
  if (!dockerHost) return undefined;
  try {
    return new URL(dockerHost).hostname || undefined;
  } catch {
    return undefined;
  }
}
