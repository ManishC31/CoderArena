import "server-only";
import { createServer, type IncomingHttpHeaders, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { headers } from "next/headers";
import { proxyPreview } from "@/lib/sandbox/preview-proxy";

// In development, previews are served from their own port instead of the app's route
// (src/app/api/sandbox/preview). `next dev` blocks cross-site requests for /_next paths unless
// the Referer names an allowed host, and a sandboxed (opaque-origin) preview never sends one,
// so a Next.js playground's scripts would never load. `next start` has no such check, so
// production uses the route. SANDBOX_PREVIEW_PORT picks the port; "off" uses the route.
const setting = process.env.SANDBOX_PREVIEW_PORT ?? (process.env.NODE_ENV === "development" ? "3001" : "off");
const PREVIEW_PORT = setting === "off" ? undefined : Number(setting);

// Kept on globalThis so the server survives hot reloads in dev. It calls `handle`, which each
// reload replaces, so requests always run the current code.
const globalForPreview = globalThis as unknown as {
  previewServer?: Server;
  handlePreview?: (req: IncomingMessage, res: ServerResponse) => void;
};
globalForPreview.handlePreview = handle;

// Where the browser loads previews from: the preview server, on the host the app was opened
// with (starting the server if needed), or undefined for the app's own origin.
export async function previewOrigin() {
  if (!PREVIEW_PORT) return undefined;
  startPreviewServer(PREVIEW_PORT);
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${new URL(`http://${host}`).hostname}:${PREVIEW_PORT}`;
}

function startPreviewServer(port: number) {
  if (globalForPreview.previewServer) return;
  const server = createServer((req, res) => globalForPreview.handlePreview?.(req, res));
  server.on("error", (error) => console.error(`Couldn't start the preview server on port ${port}`, error));
  server.listen(port);
  globalForPreview.previewServer = server;
}

async function handle(req: IncomingMessage, res: ServerResponse) {
  const controller = new AbortController();
  res.on("close", () => controller.abort());
  try {
    const hasBody = req.method !== "GET" && req.method !== "HEAD";
    const init: RequestInit & { duplex?: "half" } = {
      method: req.method,
      headers: toHeaders(req.headers),
      body: hasBody ? (Readable.toWeb(req) as ReadableStream) : undefined,
      // Required by Node's fetch to stream a request body.
      duplex: hasBody ? "half" : undefined,
      signal: controller.signal,
    };
    const response = await proxyPreview(new Request(new URL(req.url ?? "/", `http://${req.headers.host}`), init));

    res.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body && req.method !== "HEAD") {
      // pipeline, not pipe: a stream error (e.g. the page reloading mid-response) must be
      // handled here, or it would crash the app's whole process.
      await pipeline(Readable.fromWeb(response.body as NodeReadableStream), res);
    } else {
      res.end();
    }
  } catch (error) {
    if (!controller.signal.aborted) console.error("Couldn't serve the preview", error);
    if (!res.headersSent) res.writeHead(502);
    if (!res.writableEnded) res.end();
  }
}

function toHeaders(incoming: IncomingHttpHeaders) {
  const result = new Headers();
  for (const [name, value] of Object.entries(incoming)) {
    for (const item of Array.isArray(value) ? value : value === undefined ? [] : [value]) result.append(name, item);
  }
  return result;
}
