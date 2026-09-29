#!/bin/sh
# Starts dockerd with the stock dind entrypoint, then applies the sandbox firewall.
set -eu

dockerd-entrypoint.sh "$@" &
dockerd_pid=$!
trap 'kill -TERM "$dockerd_pid" 2>/dev/null' INT TERM

until docker info >/dev/null 2>&1; do
  kill -0 "$dockerd_pid" 2>/dev/null || exit 1
  sleep 0.5
done
egress-rules.sh

# The first wait returns early if a signal arrives; the second waits for dockerd to exit.
wait "$dockerd_pid" || wait "$dockerd_pid"
