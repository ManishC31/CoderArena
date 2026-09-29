#!/bin/sh
# Firewall for sandboxes on Docker's default bridge (docker0). They use the default bridge
# because gVisor can't reach the embedded DNS server of user-defined networks
# (https://github.com/google/gvisor/issues/7469); set "icc": false in daemon.json so
# sandboxes can't reach each other either.
#
# Sandboxes can reach the public internet (DNS, the npm registry) but not the Docker host
# itself (its Docker API, databases, the app) or any private network.
# Run as root on the Docker host once dockerd is up; safe to run again.
set -eu

BRIDGE=docker0

# New connections from a sandbox to private and link-local addresses (cloud metadata).
iptables -N CODERARENA-EGRESS 2>/dev/null || iptables -F CODERARENA-EGRESS
iptables -A CODERARENA-EGRESS -m conntrack --ctstate ESTABLISHED,RELATED -j RETURN
for network in 10.0.0.0/8 172.16.0.0/12 192.168.0.0/16 100.64.0.0/10 169.254.0.0/16 127.0.0.0/8; do
  iptables -A CODERARENA-EGRESS -d "$network" -j DROP
done
iptables -C DOCKER-USER -i "$BRIDGE" -j CODERARENA-EGRESS 2>/dev/null ||
  iptables -I DOCKER-USER -i "$BRIDGE" -j CODERARENA-EGRESS

# New connections from a sandbox to the host (e.g. via the bridge's gateway address).
iptables -N CODERARENA-HOST 2>/dev/null || iptables -F CODERARENA-HOST
iptables -A CODERARENA-HOST -m conntrack --ctstate ESTABLISHED,RELATED -j RETURN
iptables -A CODERARENA-HOST -j DROP
iptables -C INPUT -i "$BRIDGE" -j CODERARENA-HOST 2>/dev/null ||
  iptables -I INPUT -i "$BRIDGE" -j CODERARENA-HOST

echo "Sandbox firewall rules applied to $BRIDGE."
