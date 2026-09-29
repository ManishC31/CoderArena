#!/bin/sh
# Main process of a Next.js sandbox. The app uploads the playground's files into /workspace,
# then creates /tmp/coderarena-ready.
set -eu

waited=0
until [ -e /tmp/coderarena-ready ]; do
  if [ "$waited" -ge 600 ]; then
    echo "No project files were received." >&2
    exit 1
  fi
  sleep 0.1
  waited=$((waited + 1))
done

# Install only when package.json asks for packages the image doesn't already have.
if ! node -e '
  const read = (file) => {
    const { dependencies = {}, devDependencies = {} } = JSON.parse(require("fs").readFileSync(file, "utf8"));
    return JSON.stringify([dependencies, devDependencies]);
  };
  process.exit(read("/workspace/package.json") === read("/opt/coderarena/package.json") ? 0 : 1);
' 2>/dev/null; then
  echo "Installing dependencies..."
  npm install --no-audit
fi

# The proxy serves the preview under PREVIEW_BASE (/api/sandbox/preview/<token>/). Next.js
# takes it from basePath in next.config, which reads this variable; basePath has no trailing slash.
export PREVIEW_BASE_PATH="${PREVIEW_BASE%/}"
if ! ls next.config.* >/dev/null 2>&1; then
  cp /opt/coderarena/next.config.mjs .
fi

# Hard cap on the sandbox's lifetime, in case the app isn't around to stop it.
# No HMR: the proxy only speaks HTTP, so the editor reloads the preview after each change.
exec timeout "${SANDBOX_TIMEOUT:-7200}" ./node_modules/.bin/next dev --hostname 0.0.0.0 --port 3000
