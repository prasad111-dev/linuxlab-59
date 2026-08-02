# LinuxLab

A production-ready **Linux Administration & DevOps Cloud Lab** — students practice real Linux
Administration on real, isolated Linux containers inside their browser, get AI hints, automatic
evaluation, and a permanent learning history.

```
Browser (React SPA)
   │  REST (JWT) + WebSocket (terminal)
   ▼
Render Static Site (frontend)          ← free
   │
   ▼
Render Web Service (backend API)       ← free
   ├──► MongoDB Atlas M0 (permanent data: users, tasks, attempts)
   └──► Ubuntu VPS (Docker orchestrator)
             └── per-student isolated container (ephemeral, auto-destroyed)
```

AI help (Hint / Explain / task generator / optimization) uses the **Gemini API** (free tier).

---

## Repository layout

```
frontend/        React + Vite + Tailwind SPA (landing, dashboard, lab runner, admin)
backend/         Fastify API (auth, tasks, evaluation, Gemini, WebSocket proxy)
orchestrator/    VPS-side Docker manager (creates/destroys/attaches containers)
lab-image/       Dockerfile + entrypoint for the student lab container
render.yaml      Render blueprint (frontend static site + backend web service)
```

---

## 1. Prerequisites (all free)

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — create an **M0 (free)** cluster.
  - Create a database user, set **IP access list → `0.0.0.0/0`** (required because Render egress IPs are dynamic).
  - Copy the `mongodb+srv://...` connection string.
- [Oracle Cloud Always Free](https://www.oracle.com/cloud/free/) — an Ubuntu 22.04/24.04 VM with Docker
  (the **lab VPS**). 4 OCPU / 24 GB ARM instance is plenty. Fallback: any cheap VPS.
- [Gemini API key](https://aistudio.google.com/apikey) (free tier).
- [Google OAuth](https://console.cloud.google.com/apis/credentials) — create an **OAuth 2.0 Client ID**
  (Web application). Authorized redirect URI: `https://linuxlab-backend.onrender.com/api/auth/google/callback`
  (for local dev: `http://localhost:4000/api/auth/google/callback`).
- [Render](https://render.com) account.

---

## 2. Lab VPS setup (Docker orchestrator)

```bash
# On the VPS
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker

# Clone the repo, copy config, build the lab image
cd Linux_Lab
cp orchestrator/.env.example orchestrator/.env
nano orchestrator/.env        # set ORCHESTRATOR_TOKEN (long random string), PORT=8080
docker build -t linuxlab:latest lab-image/

# Run the orchestrator with systemd (see orchestrator/README.md for the unit file)
sudo systemctl start linuxlab-orchestrator
sudo systemctl enable linuxlab-orchestrator

# Open the orchestrator port in the cloud firewall (TCP 8080) and set up TLS later if needed.
```

Verify: `curl http://localhost:8080/health`.

---

## 3. Backend env (backend/.env)

See `backend/.env.example`. Set all variables including the `ORCHESTRATOR_*` values from the VPS.

```bash
cp backend/.env.example backend/.env
```

## 4. Frontend env (frontend/.env)

```bash
cp frontend/.env.example frontend/.env
```

---

## 5. Local development

```bash
# Terminal 1 — backend (needs MONGODB_URI + Google creds set)
cd backend && npm i && npm run dev

# Terminal 2 — frontend
cd frontend && npm i && npm run dev
```

Vite dev proxy forwards `/api` and `/api/ws` to `http://localhost:4000`.

---

## 6. Deploying to Render

1. Push this repo to GitHub.
2. In Render: **New → Blueprint**, connect the repo, select `render.yaml`.
3. Render creates `linuxlab-frontend` (static) and `linuxlab-backend` (web service).
4. Fill the `sync: false` env vars on the backend:
   - `MONGODB_URI` — Atlas connection string
   - `JWT_SECRET` — long random string
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` = `https://linuxlab-backend.onrender.com/api/auth/google/callback`
   - `FRONTEND_URL` = `https://linuxlab-frontend.onrender.com`
   - `ORCHESTRATOR_URL` = `http://<vps-ip>:8080`
   - `ORCHESTRATOR_WS_URL` = `ws://<vps-ip>:8080`
   - `ORCHESTRATOR_TOKEN` = the token from step 2
   - `GEMINI_API_KEY`
   - `ADMIN_EMAILS` = comma-separated Google emails to grant the **admin** role
5. Re-deploy if needed so the backend picks up the final env values.

> The first admin is seeded by `ADMIN_EMAILS`. A user can also be promoted from the Admin → Users page.

---

## 7. Honest notes about the free tier

- **Render free web service** spins down after ~15 min idle → ~60s cold start. Active terminal
  sessions (WebSocket) keep the backend awake.
- **Atlas M0** pauses after 30 days with zero connections; any student login resumes it. 512 MB storage cap.
- **Oracle Cloud ARM** capacity can be unavailable at signup — check every few days or use a fallback VPS.
- **Gemini free tier** has rate limits; the app degrades gracefully when the key/limit is missing.

---

## 8. Security notes

- The orchestrator is reachable only with `ORCHESTRATOR_TOKEN`; the backend never exposes it to clients.
- Lab containers run with resource limits (memory/CPU/PID), a TTL sweeper destroys them, and no
  host paths or host network are shared. systemd support requires elevated container privileges —
  see `orchestrator/README.md` for the hardening trade-off.
- All public traffic is HTTPS via Render. Always use `wss://` for WebSockets.
