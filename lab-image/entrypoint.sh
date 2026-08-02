#!/bin/bash
# LinuxLab lab container entrypoint.
# Regenerates SSH host keys (each fresh container gets unique keys) then
# hands control to systemd so services can run.

set -e

# Fresh host keys
rm -f /etc/ssh/ssh_host_*_key /etc/ssh/ssh_host_*_key.pub
ssh-keygen -A >/dev/null 2>&1 || true

mkdir -p /run/sshd /run/dbus

# Start machine-id consistent
[ -f /etc/machine-id ] || systemd-machine-id-setup >/dev/null 2>&1 || true

exec /sbin/init "$@"
