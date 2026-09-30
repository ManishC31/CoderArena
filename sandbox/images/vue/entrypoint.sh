#!/bin/sh
# Main process of a Vue sandbox. The app uploads the playground's files into /workspace,
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

# Hard cap on the sandbox's lifetime, in case the app isn't around to stop it.
exec timeout "${SANDBOX_TIMEOUT:-7200}" node /opt/coderarena/serve.mjs
