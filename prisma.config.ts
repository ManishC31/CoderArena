import { loadEnvConfig } from "@next/env";
import { defineConfig, env } from "prisma/config";

// Load .env / .env.local the same way Next.js does, so the CLI and the app share one config.
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
