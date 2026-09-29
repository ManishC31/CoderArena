import "server-only";
import { spawn } from "node:child_process";

// The docker CLI talks to SANDBOX_DOCKER_HOST when it's set (e.g. the dev sandbox host),
// and to its default engine otherwise.
const env = process.env.SANDBOX_DOCKER_HOST
  ? { ...process.env, DOCKER_HOST: process.env.SANDBOX_DOCKER_HOST }
  : process.env;

export class DockerError extends Error {}

type Options = {
  // Written to the command's stdin.
  input?: Buffer;
  // Include stderr in the result (e.g. for `docker logs`).
  withStderr?: boolean;
  timeoutMs?: number;
};

// Runs `docker <args>` and resolves with its output. Fails with a DockerError on a non-zero exit.
export function docker(args: string[], { input, withStderr = false, timeoutMs = 60_000 }: Options = {}) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn("docker", args, { env, timeout: timeoutMs });
    let output = "";
    let errors = "";
    child.stdout.setEncoding("utf8").on("data", (chunk: string) => (output += chunk));
    child.stderr.setEncoding("utf8").on("data", (chunk: string) => {
      errors += chunk;
      if (withStderr) output += chunk;
    });
    // Covers a missing docker CLI (ENOENT).
    child.on("error", reject);
    child.on("close", (code, signal) => {
      if (code === 0) resolve(output);
      else if (signal) reject(new DockerError(`docker ${args[0]} was stopped (${signal})`));
      else reject(new DockerError(errors.trim() || `docker ${args[0]} exited with code ${code}`));
    });
    // The command may exit before reading all of its input; its exit code reports why.
    child.stdin.on("error", () => {});
    child.stdin.end(input);
  });
}
