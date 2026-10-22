import "server-only";
import { gunzipSync } from "node:zlib";
import { isValidFilePath, MAX_FILE_LENGTH, MAX_FILES, type PlaygroundFile } from "@/components/playground/files";
import type { PlaygroundTemplate } from "@/generated/prisma/enums";
import { githubClient } from "@/lib/github";

// Copies a GitHub repository's text files into a playground: one tarball download (so public
// repositories import without a GitHub account, within GitHub's anonymous rate limit), then
// only the files the editor can open.

// A failure to show the user.
export class ImportError extends Error {}

// Folders that are generated or installed, never edited.
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".nuxt",
  ".angular",
  ".turbo",
  ".vercel",
  ".cache",
  "dist",
  "build",
  "out",
  "coverage",
]);
// Lockfiles are often larger than a playground file may be; the sandbox installs without them.
const SKIP_FILES = new Set(["package-lock.json", "npm-shrinkwrap.json", "yarn.lock", "pnpm-lock.yaml", "bun.lock", "bun.lockb"]);

// GitHub reports a repository's size in KB.
const MAX_REPO_SIZE_KB = 200_000;
const MAX_ARCHIVE_BYTES = 50 * 1024 * 1024;
const MAX_EXTRACTED_BYTES = 200 * 1024 * 1024;

type ImportOptions = {
  owner: string;
  repo: string;
  // The default branch when empty.
  branch?: string;
  // The user's GitHub token, for private repositories and a higher rate limit.
  token?: string | null;
};

export async function fetchRepository({ owner, repo, branch, token }: ImportOptions) {
  const info = await getRepositoryInfo(owner, repo, token);
  if (info.size > MAX_REPO_SIZE_KB) {
    throw new ImportError("This repository is too large to open in a playground.");
  }
  const ref = branch?.trim() || info.default_branch;

  const archive = await downloadTarball(info.full_name, ref, token);
  const files: PlaygroundFile[] = [];
  for (const entry of readTar(archive)) {
    // GitHub puts everything in a top-level "<owner>-<repo>-<sha>/" folder.
    const path = entry.path.slice(entry.path.indexOf("/") + 1);
    const content = path && isEditable(path, entry.data) ? decodeText(entry.data) : undefined;
    if (content !== undefined) files.push({ path, content });
  }

  if (files.length === 0) throw new ImportError("This repository has no text files to edit.");
  if (files.length > MAX_FILES) {
    throw new ImportError(
      `This repository has ${files.length} files to edit; a playground holds up to ${MAX_FILES}.`,
    );
  }
  return { fullName: info.full_name, branch: ref, template: detectTemplate(files), files };
}

async function getRepositoryInfo(owner: string, repo: string, token?: string | null) {
  try {
    const { data } = await githubClient(token).rest.repos.get({ owner, repo });
    return data;
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status === 404) {
      throw new ImportError(
        token
          ? "Repository not found, or your GitHub account can't access it."
          : "Repository not found. If it's private, connect your GitHub account first.",
      );
    }
    if (status === 403 || status === 429) {
      throw new ImportError(
        token
          ? "GitHub's rate limit was reached. Try again in a few minutes."
          : "GitHub's rate limit was reached. Connect your GitHub account for a higher limit.",
      );
    }
    throw error;
  }
}

async function downloadTarball(fullName: string, ref: string, token?: string | null) {
  // Branch names can contain "/", which stays a path separator here.
  const refPath = ref.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(`https://api.github.com/repos/${fullName}/tarball/${refPath}`, {
    headers: {
      "User-Agent": "CoderArena",
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  if (response.status === 404) throw new ImportError(`Branch "${ref}" not found.`);
  if (!response.ok) throw new ImportError("Couldn't download the repository from GitHub.");
  if (Number(response.headers.get("content-length")) > MAX_ARCHIVE_BYTES) {
    await response.body?.cancel();
    throw new ImportError("This repository is too large to open in a playground.");
  }

  const gzipped = Buffer.from(await response.arrayBuffer());
  if (gzipped.length > MAX_ARCHIVE_BYTES) throw new ImportError("This repository is too large to open in a playground.");
  try {
    return gunzipSync(gzipped, { maxOutputLength: MAX_EXTRACTED_BYTES });
  } catch {
    throw new ImportError("This repository is too large to open in a playground.");
  }
}

// The regular files in a tar archive. Handles the ustar prefix field and pax / GNU long
// names, which git archives use for paths over 100 characters.
function* readTar(archive: Buffer) {
  let offset = 0;
  let longPath: string | undefined;
  while (offset + 512 <= archive.length) {
    const header = archive.subarray(offset, offset + 512);
    // The archive ends with zero-filled blocks.
    if (header.every((byte) => byte === 0)) return;

    const size = parseInt(readField(header, 124, 12) || "0", 8);
    if (!Number.isSafeInteger(size)) throw new ImportError("Couldn't read the repository archive.");
    const type = String.fromCharCode(header[156]);
    const data = archive.subarray(offset + 512, offset + 512 + size);
    offset += 512 + Math.ceil(size / 512) * 512;

    if (type === "x") {
      longPath = paxPath(data) ?? longPath;
    } else if (type === "L") {
      longPath = data.toString("utf8").replace(/\0[\s\S]*$/, "");
    } else if (type !== "g") {
      const prefix = readField(header, 345, 155);
      const name = readField(header, 0, 100);
      const path = longPath ?? (prefix ? `${prefix}/${name}` : name);
      longPath = undefined;
      // "0" (or NUL in old archives) is a regular file; skip folders, links and the rest.
      if (type === "0" || type === "\0") yield { path, data };
    }
  }
}

function readField(header: Buffer, start: number, length: number) {
  return header.toString("utf8", start, start + length).replace(/\0[\s\S]*$/, "").trim();
}

// The "path" record of a pax extended header: records look like "<length> <key>=<value>\n",
// with the length in bytes.
function paxPath(data: Buffer) {
  let offset = 0;
  while (offset < data.length) {
    const space = data.indexOf(0x20, offset);
    const length = Number(data.toString("utf8", offset, space));
    if (space === -1 || !length) return undefined;
    const record = data.toString("utf8", space + 1, offset + length - 1);
    const equals = record.indexOf("=");
    if (record.slice(0, equals) === "path") return record.slice(equals + 1);
    offset += length;
  }
  return undefined;
}

function isEditable(path: string, data: Buffer) {
  const segments = path.split("/");
  return (
    isValidFilePath(path) &&
    !segments.slice(0, -1).some((segment) => SKIP_DIRS.has(segment)) &&
    !SKIP_FILES.has(segments[segments.length - 1]) &&
    data.length <= MAX_FILE_LENGTH &&
    // A NUL byte means binary (images, fonts, archives).
    !data.includes(0)
  );
}

// The file as text, or undefined if it isn't valid UTF-8.
function decodeText(data: Buffer) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(data);
  } catch {
    return undefined;
  }
}

// The sandbox template whose dev server fits the project, from its root package.json.
// Projects without one get the plain TypeScript (Vite) template.
export function detectTemplate(files: PlaygroundFile[]): PlaygroundTemplate {
  const packageJson = files.find((file) => file.path === "package.json");
  let packages: Record<string, unknown> = {};
  try {
    const { dependencies, devDependencies } = JSON.parse(packageJson?.content ?? "{}");
    packages = { ...devDependencies, ...dependencies };
  } catch {
    // Invalid JSON: fall through to the default.
  }
  if ("next" in packages) return "nextjs";
  if ("@angular/core" in packages) return "angular";
  if ("vue" in packages) return "vue";
  if ("react" in packages) return "react";
  if ("hono" in packages) return "hono";
  if ("express" in packages) return "express";
  return "typescript";
}
