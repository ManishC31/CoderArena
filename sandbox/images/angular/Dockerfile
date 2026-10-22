# Sandbox image for Angular playgrounds, run under gVisor by src/lib/sandbox/sandbox.ts.
# Build it with `npm run sandbox:build`.
# Docker Hub has no official Angular image, so this starts from the official Node.js image
# (current LTS, Debian slim), like the Next.js image.
FROM node:24.21.0-bookworm-slim

ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
  NPM_CONFIG_FUND=false \
  NG_CLI_ANALYTICS=false

# Bake in the Angular template's dependencies so a sandbox starts in seconds and only needs
# the network when a playground adds packages. package.json is a copy of the template's
# (src/components/playground/template-files.ts); keep the two in sync.
WORKDIR /workspace
COPY package.json /opt/coderarena/package.json
RUN cp /opt/coderarena/package.json . \
  && npm install --no-audit \
  && npm cache clean --force \
  && chown -R node:node /workspace

COPY --chmod=755 entrypoint.sh wait-for-rebuild.sh /opt/coderarena/
COPY serve.mjs angular.json tsconfig.json /opt/coderarena/

# Playground code never runs as root; the base image's "node" user is uid 1000.
USER node
EXPOSE 4200
ENTRYPOINT ["/opt/coderarena/entrypoint.sh"]
