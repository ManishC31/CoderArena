import "server-only";
import { PREVIEW_PATH, resolvePreview } from "@/lib/sandbox/sandbox";

// Proxies a playground's preview from the dev server in its sandbox. Used by the app's route
// (src/app/api/sandbox/preview) and, in development, by the separate preview server
// (preview-server.ts). The token in the URL is the credential: requests from the sandboxed
// preview page carry no cookies.

// Only these request headers reach the sandbox. Cookies and credentials never do.
const REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "cache-control",
  "content-type",
  "if-modified-since",
  "if-none-match",
  "range",
  "user-agent",
  // Next.js client navigations and Server Actions.
  "next-action",
  "next-router-prefetch",
  "next-router-segment-prefetch",
  "next-router-state-tree",
  "next-url",
  "rsc",
];

// Only these response headers reach the browser, so the sandbox can't set cookies on the app's origin.
const RESPONSE_HEADERS = ["cache-control", "content-range", "content-type", "etag", "last-modified", "location", "vary"];

const PREVIEW_HEADERS = {
  // Runs the page in an opaque origin, even when opened in its own tab, so its code can't
  // reach the app's cookies, storage or pages.
  "content-security-policy": "sandbox allow-scripts allow-forms allow-modals allow-popups allow-downloads",
  // From an opaque origin, even the page's own module scripts are cross-origin requests.
  "access-control-allow-origin": "*",
  // Keeps the token out of requests the page makes to other sites.
  "referrer-policy": "no-referrer",
};

// /api/sandbox/preview/<token>/...
const TOKEN_IN_PATH = new RegExp(`^${PREVIEW_PATH}/([^/]+)`);

// Forwards any method, so playgrounds' forms, route handlers and Server Actions work.
export async function proxyPreview(request: Request) {
  const { pathname, search } = new URL(request.url);
  const token = TOKEN_IN_PATH.exec(pathname)?.[1];

  const target = token
    ? await resolvePreview(token).catch((error) => {
        console.error("Couldn't look up the preview", error);
        return undefined;
      })
    : undefined;
  if (!target) return notRunning();

  // The app's router strips the base path's trailing slash. A Vite page is at index.html, so
  // send the bare path there; a Next.js playground serves the bare path itself.
  if (`${pathname}/` === target.base && target.entry) {
    return new Response(null, { status: 307, headers: { ...PREVIEW_HEADERS, location: `${target.base}${target.entry}` } });
  }

  const headers = new Headers();
  for (const name of REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  let upstream: Response;
  try {
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    upstream = await fetch(`${target.origin}${pathname}${search}`, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      // Required by Node's fetch to stream a request body.
      ...(hasBody && { duplex: "half" }),
      redirect: "manual",
      cache: "no-store",
      signal: request.signal,
    });
  } catch {
    return notRunning();
  }

  const responseHeaders = new Headers(PREVIEW_HEADERS);
  for (const name of RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

function notRunning() {
  return new Response("This preview isn't running. Start it again from the editor.", {
    status: 404,
    headers: { ...PREVIEW_HEADERS, "content-type": "text/plain; charset=utf-8" },
  });
}
