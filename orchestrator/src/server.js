const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');

const config = require('./config');
const { authMiddleware, checkWsAuth } = require('./middleware');
const routes = require('./routes');
const { attachTerminal } = require('./terminal');
const { isLabContainer } = require('./containers');
const { startSweeper } = require('./cleanup');

const app = express();
app.use(express.json());
app.use(authMiddleware);
app.use(routes);

// Central error handler
app.use((err, _req, res, _next) => {
  const msg = err && err.message ? err.message : 'internal server error';
  res.status(500).json({ error: msg });
});

const server = http.createServer(app);

// Terminal WebSocket: attach a real PTY to a managed container
const wss = new WebSocketServer({ server, path: '/terminal' });

wss.on('connection', async (ws, req) => {
  try {
    if (!checkWsAuth(req)) {
      ws.close(1008, 'unauthorized');
      return;
    }
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const containerId = url.searchParams.get('containerId');
    if (!containerId) {
      ws.close(1008, 'containerId required');
      return;
    }
    if (!(await isLabContainer(containerId))) {
      ws.close(1008, 'container not managed');
      return;
    }
    await attachTerminal(ws, containerId);
  } catch (e) {
    try {
      ws.close(1011, e.message);
    } catch {
      /* noop */
    }
  }
});

server.listen(config.port, () => {
  console.log(`[orchestrator] listening on :${config.port}`);
  startSweeper(console);
  console.log('[orchestrator] sweep loop started');
});

process.on('unhandledRejection', (e) => console.error('[orchestrator] unhandledRejection', e));
process.on('uncaughtException', (e) => console.error('[orchestrator] uncaughtException', e));
