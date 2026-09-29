// Builds the sandbox images in sandbox/images/<template> as coderarena/sandbox-<template>,
// on the same Docker engine the app uses (SANDBOX_DOCKER_HOST, or the CLI's default).
// Usage: npm run sandbox:build [-- <template>...]
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const imagesDir = path.join(process.cwd(), "sandbox", "images");
const templates = process.argv.slice(2).length > 0 ? process.argv.slice(2) : readdirSync(imagesDir);
const env = process.env.SANDBOX_DOCKER_HOST
  ? { ...process.env, DOCKER_HOST: process.env.SANDBOX_DOCKER_HOST }
  : process.env;

for (const template of templates) {
  const tag = `coderarena/sandbox-${template}`;
  console.log(`\nBuilding ${tag}...`);
  const result = spawnSync("docker", ["build", "--tag", tag, path.join(imagesDir, template)], {
    stdio: "inherit",
    env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
