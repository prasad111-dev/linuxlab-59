# LinuxLab Orchestrator

Runs on the Ubuntu lab VPS. Owns the Docker socket and exposes a small,
token-authenticated HTTP + WebSocket API that the Render backend calls to
create, attach to, exec inside, and destroy per-student lab containers.

## Security model

- Every request must carry `Authorization: Bearer <ORCHESTRATOR_TOKEN>`.
- The orchestrator only manages containers it created (verified by the
  `linuxlab.session=true` label) — a container id from another service is rejected.
- The backend holds the token; browsers never see it (the backend proxies the
  terminal WebSocket).
- Containers run with memory / CPU / PID limits and are swept automatically.

## systemd service

Create `/etc/systemd/system/linuxlab-orchestrator.service`:

```ini
[Unit]
Description=LinuxLab Orchestrator
After=docker.service
Requires=docker.service

[Service]
WorkingDirectory=/root/Linux_Lab/orchestrator
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=5
EnvironmentFile=/root/Linux_Lab/orchestrator/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl start linuxlab-orchestrator
sudo systemctl enable linuxlab-orchestrator
curl http://localhost:8080/health
```

## Firewall

Open the orchestrator port (TCP 8080) to the internet from the cloud provider
firewall. For production, terminate TLS in front of it (Caddy / nginx) and set
`ORCHESTRATOR_WS_URL` to `wss://...`.

## Note on privileges

systemd inside a Docker container requires elevated capabilities. This image
runs containers with `--privileged`. That is a convenience/security trade-off
typical for education labs (Katacoda/KodeKloud style). To harden:
- drop `Privileged` and instead mount `/sys/fs/cgroup` read-write, add
  `--cap-add SYS_ADMIN` and `--security-opt seccomp:unconfined`, and remove
  `--cap-drop ALL` constraints; or
- switch tasks away from `systemctl` and run a lightweight init.

## API

| Method | Path | Body | Description |
| --- | --- | --- | --- |
| GET | /health | — | liveness |
| POST | /containers | `{sessionId, image?, memMb?, cpu?, pids?, ttlMinutes?}` | create + start container |
| GET | /containers | — | list running lab containers |
| GET | /containers/:id | — | inspect |
| POST | /containers/:id/activity | — | refresh idle timer |
| POST | /containers/:id/exec | `{command, timeoutMs?}` | run `bash -lc` and return output |
| DELETE | /containers/:id | — | force remove container |
| WS | /terminal?token=&containerId= | — | attach a PTY to the container |

## End-to-end test

```bash
TOKEN=your-token
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"sessionId":"test-session"}' http://localhost:8080/containers
```
