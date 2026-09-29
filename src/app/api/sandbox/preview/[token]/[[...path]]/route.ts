import { proxyPreview } from "@/lib/sandbox/preview-proxy";

// Serves playground previews from the app's own origin. In development they come from the
// separate preview server instead (src/lib/sandbox/preview-server.ts).
async function proxy(request: Request) {
  return proxyPreview(request);
}

export { proxy as DELETE, proxy as GET, proxy as HEAD, proxy as PATCH, proxy as POST, proxy as PUT };
