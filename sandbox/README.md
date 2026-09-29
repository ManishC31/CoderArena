# Playground sandboxes

Each playground's code runs in its own Docker container under [gVisor](https://gvisor.dev)
(`runsc`), a user-space kernel that stands between the code and the host's Linux kernel.
The editor's **Preview** panel shows the app running inside it.

```
Browser                         Next.js app                          Docker host (runsc)
┌──────────────────────┐        ┌──────────────────────────────┐     ┌──────────────────────────┐
│ Editor ──────────────┼─action─▶ runPlayground()              │     │ coderarena-sandbox-<id>  │
│                      │        │  src/lib/sandbox/sandbox.ts ─┼─CLI─▶  Vite / Next.js dev srv  │
│ Preview <iframe> ────┼─HTTP───▶ /api/sandbox/preview/<token>/┼─HTTP▶  (published host port)   │
└──────────────────────┘        └──────────────────────────────┘     └──────────────────────────┘
```

- **Run**: `runPlayground` (a server action) starts the container if needed. It uploads the
  editor's current files with `docker exec … tar -x`, waits for the dev server and returns
  the preview URL. Later edits upload only the files that changed, then the preview reloads.
  Changing dependencies in `package.json` restarts the sandbox, which runs `npm install`.
- **Preview**: `src/lib/sandbox/preview-proxy.ts` proxies requests to the container's
  published port. The dev server runs under that path: Vite with `base`, Next.js with
  `basePath` (see [Next.js playgrounds](#nextjs-playgrounds)). Production serves previews
  from the app's route, `src/app/api/sandbox/preview/[token]/[[...path]]/route.ts`; in
  development they come from a separate port (see [Development](#development-macos-windows-or-linux-without-gvisor)).
- **Images**: `sandbox/images/<template>/`, built as `coderarena/sandbox-<template>`, with the
  template's dependencies baked in. React uses `openeuler/react`. Docker Hub has no official
  Next.js image, so Next.js uses the official `node` image (current LTS, Debian slim), as
  Next.js's own Docker example does.

## Development (macOS, Windows, or Linux without gVisor)

Docker Desktop can't register extra runtimes, so sandboxes run on a **sandbox host**: a
Docker engine with gVisor inside a privileged container (`sandbox/host/`).

```sh
npm run sandbox:host   # start the sandbox host (Docker API on 127.0.0.1:2375)
npm run sandbox:build  # build the sandbox images on it
```

Then copy the `SANDBOX_*` settings from `.env.example` to `.env.local` and restart `next dev`.
Previews use ports 42000–42019, which `sandbox/compose.yaml` forwards to this machine's
loopback only.

The sandbox host doesn't restart with Docker Desktop; run `npm run sandbox:host` again after
Docker restarts.

In development the editor loads previews from a second port, 3001 by default
(`SANDBOX_PREVIEW_PORT`), served by `src/lib/sandbox/preview-server.ts` inside the app's
process. `next dev` blocks cross-site requests for `/_next` paths unless the `Referer` names an
allowed host, and a sandboxed (opaque-origin) page never sends one, so through the app's own
port a Next.js playground's scripts would never load. `next start` has no such check.

## Production (Linux)

1. Use a Docker host dedicated to sandboxes, not the one running your database.
2. Install gVisor ([docs](https://gvisor.dev/docs/user_guide/install/)), register it with
   `sudo runsc install`, and add `"icc": false` to `/etc/docker/daemon.json`. Then
   `sudo systemctl restart docker`.
3. Run `sandbox/host/egress-rules.sh` as root after every Docker start (e.g. from a systemd
   unit that runs after `docker.service`).
4. Build the images with `npm run sandbox:build`.
5. Leave `SANDBOX_PUBLISH_ADDRESS` (127.0.0.1) and `SANDBOX_PORT_RANGE` unset when Docker
   runs on the app's machine. For a separate sandbox host, set `SANDBOX_DOCKER_HOST` (e.g.
   `ssh://user@sandbox-host`). Also set `SANDBOX_PUBLISH_ADDRESS` to an address that only
   the app can reach.

## Security model

| Layer | What it does |
| --- | --- |
| gVisor (`--runtime runsc`) | The code's system calls go to gVisor's kernel, not the host's. |
| Container limits | Non-root user, all capabilities dropped, `no-new-privileges`, 1 GB memory, 1 CPU, 256 processes. |
| Lifetime | Removed after 15 idle minutes. Stopped after 2 hours regardless (enforced inside the container). At most 2 sandboxes per user and 20 in total. |
| Network | `egress-rules.sh`: public internet only (npm registry, public DNS). Blocks the Docker host, private networks and cloud metadata. `"icc": false` blocks sandbox-to-sandbox traffic. |
| Preview origin | The proxy sends `Content-Security-Policy: sandbox`, and the iframe has `sandbox` without `allow-same-origin`. The page gets an opaque origin, so it can't reach the app's cookies, storage or pages, even when opened in its own tab. |
| Proxy | Authenticated by a random per-sandbox token in the URL. Forwards no cookies or credentials, and passes back no `Set-Cookie`. |

Sandboxes use Docker's default bridge because gVisor can't reach the embedded DNS server of
user-defined networks ([gvisor#7469](https://github.com/google/gvisor/issues/7469)). That's
why `icc` is turned off daemon-wide and the DNS servers are public (`SANDBOX_DNS`).

## Next.js playgrounds

The template's `next.config.ts` sets two things the preview needs; they must stay:

- `basePath: process.env.PREVIEW_BASE_PATH`: the sandbox's entrypoint sets this to the
  preview path. Next.js has no command-line option for it, and a config passed to a custom
  server doesn't reach its router.
- `experimental.reactDebugChannel: false`: in development, Next.js 16.3 streams React debug
  data over the dev server's WebSocket, and the page doesn't hydrate until it arrives. The
  preview has no WebSocket.

A playground without a Next.js config gets `sandbox/images/nextjs/next.config.mjs` with the same
settings. Next.js writes `tsconfig.json` and `next-env.d.ts` inside the sandbox; they don't
appear in the editor.

## Limitations

- No hot module replacement: the proxy only speaks HTTP, so the preview reloads fully after
  each change, which resets the app's state. A Next.js page logs failed WebSocket connections
  to `/_next/hmr`, and a `SecurityError` from a dev-only script that reads `document.cookie`.
- The preview has an opaque origin, so `localStorage`, `sessionStorage` and cookies throw
  inside it.
- The app is served under `/api/sandbox/preview/<token>/`. Absolute URLs written in code
  (e.g. `<img src="/logo.svg">`) need `import.meta.env.BASE_URL` (Vite) or the base path
  (Next.js: `next/link` and `next/image` add it; plain `<img>` and `fetch` don't).
- Sandbox bookkeeping (activity, uploaded files) lives in the Next.js process. Run one app
  instance per sandbox host.
- Only the React and Next.js templates run so far. To add one, create
  `sandbox/images/<template>/` and add it to `IMAGES` in `src/lib/sandbox/sandbox.ts`.
