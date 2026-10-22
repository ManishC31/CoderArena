#!/bin/sh
# Runs its arguments (the app's upload of changed files, see uploadFiles in
# src/lib/sandbox/sandbox.ts), then waits for the rebuild the change starts, so the editor
# doesn't reload the preview into the previous build. Prints the errors if the latest build
# failed. serve.mjs records the builds in /tmp/coderarena-build.
set -eu

read -r before _ < /tmp/coderarena-build
"$@"

# The watcher batches changes for 250 ms before rebuilding, and files outside the build (e.g.
# README.md) start no rebuild: stop waiting when none has started after a second. Give up
# after 45 seconds, before the app's docker exec times out.
waited=0
while :; do
  read -r builds state < /tmp/coderarena-build
  if [ "$builds" -gt "$before" ] && [ "$state" != building ]; then break; fi
  if [ "$state" != building ] && [ "$waited" -ge 10 ]; then break; fi
  if [ "$waited" -ge 450 ]; then break; fi
  sleep 0.1
  waited=$((waited + 1))
done

if [ "$state" = failed ]; then
  cat /tmp/coderarena-build-errors
fi
