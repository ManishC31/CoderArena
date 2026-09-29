// Starts the playground's Vite dev server behind the app's preview proxy.
// The project's own vite.config.js is still loaded; these settings take precedence.
import { createServer } from "vite";

const server = await createServer({
  root: "/workspace",
  // The proxy serves the preview under /api/sandbox/preview/<token>/.
  base: process.env.PREVIEW_BASE,
  clearScreen: false,
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    // The proxy only speaks HTTP, so there's no WebSocket for HMR.
    // The editor reloads the preview after each change instead.
    hmr: false,
    ws: false,
  },
});

await server.listen();
server.printUrls();
