const { WebSocket } = require('ws');
const Attempt = require('../models/Attempt');
const Task = require('../models/Task');
const orchestrator = require('../services/orchestratorClient');
const config = require('../config');
const { createCommandLogger } = require('./commandLogger');
const { createCommandGate } = require('./commandGate');
const { buildPolicy } = require('../services/commandPolicy');

/**
 * Proxies the browser terminal WebSocket to the lab orchestrator.
 * Auth is via a per-attempt ticket (never the JWT) so the token is not
 * leaked into URL logs on the VPS hop.
 *
 * Every typed command line is checked against a policy derived from the
 * task's validation rules — students can only run task-related commands.
 */
const connections = new Map();

function sendToAttempt(attemptId, text) {
  const conn = connections.get(String(attemptId));
  if (!conn || conn.browserWs.readyState !== conn.browserWs.OPEN) return false;
  conn.browserWs.send(Buffer.from(`\x1b[1;93m[Admin notice] ${text}\x1b[0m\r\n`));
  return true;
}

function setupTerminalProxy(server) {
  const { WebSocketServer } = require('ws');
  const wss = new WebSocketServer({ server, path: '/api/ws/terminal' });

  wss.on('connection', async (ws, req) => {
    let interval;
    try {
      const url = new URL(req.url, 'http://localhost');
      const attemptId = url.searchParams.get('attemptId');
      const ticket = url.searchParams.get('ticket');

      if (!attemptId || !ticket) {
        return ws.close(4001, 'missing attemptId or ticket');
      }

      const attempt = await Attempt.findById(attemptId);
      if (!attempt) return ws.close(4004, 'attempt not found');
      if (attempt.wsTicket !== ticket) return ws.close(4003, 'invalid ticket');
      if (attempt.status !== 'running') return ws.close(4003, 'attempt is not running');

      const unregister = () => connections.delete(String(attemptId));
      connections.set(String(attemptId), { browserWs: ws });
      ws.on('close', unregister);
      ws.on('error', unregister);

      const enforcePolicy = config.terminalPolicy === 'task';
      const task = enforcePolicy ? await Task.findById(attempt.task).lean().catch(() => null) : null;

      const upstream = new WebSocket(orchestrator.terminalUrl(attempt.containerId));
      const logger = createCommandLogger();
      const gateOutput = [];

      const send = (bytes) => {
        if (upstream.readyState === WebSocket.OPEN) upstream.send(bytes);
        else gateOutput.push(bytes);
      };

      const gate = enforcePolicy ? createCommandGate(buildPolicy(task), send) : null;

      const persist = () => {
        if (logger.commands.length > 0) {
          const cmds = logger.commands;
          logger.flush();
          // Lightweight write: only append the new commands, keep the last 250
          // so the DB stays small and the server handles many concurrent users.
          Attempt.updateOne(
            { _id: attempt._id },
            { $push: { commandHistory: { $each: cmds, $slice: -250 } } }
          ).catch(() => {});
        }
      };

      upstream.on('open', () => {
        for (const m of gateOutput) upstream.send(m);
        gateOutput.length = 0;
        Attempt.updateOne({ _id: attempt._id }, { $set: { lastActiveAt: new Date() } }).catch(() => {});
      });

      let lastSeenAt = 0;
      ws.on('message', (data) => {
        const now = Date.now();
        if (now - lastSeenAt > 15000) {
          lastSeenAt = now;
          Attempt.updateOne({ _id: attempt._id }, { $set: { lastActiveAt: new Date(now) } }).catch(() => {});
        }
        logger.ingest(data);
        if (gate) gate.push(data);
        else send(data);
      });

      const teardown = () => {
        clearInterval(interval);
        if (gate) gate.flush();
        persist();
        try {
          upstream.close();
        } catch {
          /* noop */
        }
      };

      ws.on('close', teardown);
      ws.on('error', teardown);
      upstream.on('message', (data) => {
        if (ws.readyState === ws.OPEN) ws.send(data);
      });
      upstream.on('close', () => {
        clearInterval(interval);
        if (gate) gate.flush();
        persist();
        try {
          ws.close();
        } catch {
          /* noop */
        }
      });
      upstream.on('error', () => {
        clearInterval(interval);
        try {
          ws.close();
        } catch {
          /* noop */
        }
      });

      interval = setInterval(persist, 30_000);
    } catch (e) {
      clearInterval(interval);
      try {
        ws.close(1011, e.message);
      } catch {
        /* noop */
      }
    }
  });

  wss.on('error', () => {});
}

module.exports = { setupTerminalProxy, sendToAttempt };
