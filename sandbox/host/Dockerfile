# Dev sandbox host: a Docker engine with gVisor, run as a privileged container.
# Docker Desktop's VM can't register extra runtimes, so on macOS and Windows the app
# talks to this engine instead (SANDBOX_DOCKER_HOST). On Linux, install gVisor on the
# Docker host itself (see sandbox/README.md).
FROM docker:29-dind

ARG GVISOR_RELEASE=20260921.0
RUN set -eux; \
  url="https://storage.googleapis.com/gvisor/releases/release/${GVISOR_RELEASE}/$(uname -m)"; \
  cd /tmp; \
  wget -q "$url/gvisor.tar.bz2" "$url/gvisor.tar.bz2.sha512"; \
  sha512sum -c gvisor.tar.bz2.sha512; \
  tar -xjf gvisor.tar.bz2 -C /usr/local/bin; \
  rm gvisor.tar.bz2 gvisor.tar.bz2.sha512; \
  runsc --version

COPY daemon.json /etc/docker/daemon.json
COPY --chmod=755 egress-rules.sh host-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["host-entrypoint.sh"]
