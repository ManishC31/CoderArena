# Sandbox image for React playgrounds, run under gVisor by src/lib/sandbox/sandbox.ts.
# Build it with `npm run sandbox:build`.
FROM openeuler/react:19.3.0-oe2403sp4

# Playground code never runs as root. (The base image has no useradd.)
RUN echo "sandbox:x:1000:1000::/home/sandbox:/sbin/nologin" >> /etc/passwd \
  && echo "sandbox:x:1000:" >> /etc/group \
  && mkdir -p /home/sandbox \
  && chown sandbox:sandbox /home/sandbox

# The base image points npm at a Huawei Cloud mirror; use the official registry instead.
ENV NPM_CONFIG_REGISTRY=https://registry.npmjs.org/ \
  NPM_CONFIG_UPDATE_NOTIFIER=false

# Bake in the React template's dependencies so a sandbox starts in seconds and only needs
# the network when a playground adds packages. package.json is a copy of the template's
# (src/components/playground/template-files.ts); keep the two in sync.
WORKDIR /workspace
COPY package.json /opt/coderarena/package.json
RUN cp /opt/coderarena/package.json . \
  && npm install --no-audit --no-fund \
  && npm cache clean --force \
  && chown -R sandbox:sandbox /workspace

COPY --chmod=755 entrypoint.sh /opt/coderarena/
COPY serve.mjs /opt/coderarena/
# serve.mjs imports Vite from the project's own node_modules.
RUN ln -s /workspace/node_modules /opt/coderarena/node_modules

USER sandbox
EXPOSE 5173
ENTRYPOINT ["/opt/coderarena/entrypoint.sh"]
