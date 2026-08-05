const docker = require('./docker');
const { markActivity } = require('./state');

/**
 * Persistent per-container terminal sessions.
 *
 * A session owns a single long-lived `bash -l` exec stream per lab container.
 * Browser WebSocket connections attach to the session instead of spawning a
 * fresh shell, so a reconnect (panel switch, mobile backgrounding, flaky
 * network) lands you back in the same shell instead of a brand-new root
 * prompt. While no client is attached, output is buffered in a ring buffer
 * and replayed to the next client that attaches.
 */

const sessions = new Map();
const MAX_BUFFER_BYTES = 64 * 1024;

function broadcast(session, chunk) {
  for (const ws of session.clients) {
    if (ws.readyState === ws.OPEN) {
      try {
        ws.send(chunk);
      } catch {
        /* client already closing */
      }
    }
  }
}

function bufferPush(session, chunk) {
  session.buffer.push(chunk);
  session.bufferBytes += chunk.length;
  while (session.bufferBytes > MAX_BUFFER_BYTES && session.buffer.length > 1) {
    session.bufferBytes -= session.buffer[0].length;
    session.buffer.shift();
  }
}

function createSession(containerId) {
  const session = {
    containerId,
    stream: null,
    clients: new Set(),
    buffer: [],
    bufferBytes: 0,
    dead: false,
    ready: null,
  };

  session.ready = new Promise((resolve, reject) => {
    const container = docker.getContainer(containerId);
    (async () => {
      try {
        await container.start();
      } catch {
        /* already running */
      }

      // A root login shell instead of the container console, whose systemd
      // getty would otherwise prompt for a username/password.
      const exec = await container.exec({
        Cmd: ['/bin/bash', '-l'],
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
      });
      const stream = await exec.start({ Detach: false, Tty: true, hijack: true, stdin: true });
      session.stream = stream;
      markActivity(containerId);
      resolve();

      stream.on('data', (chunk) => {
        markActivity(containerId);
        if (session.clients.size > 0) broadcast(session, chunk);
        else bufferPush(session, chunk);
      });

      const die = () => {
        if (session.dead) return;
        session.dead = true;
        sessions.delete(containerId);
        try {
          stream.destroy();
        } catch {
          /* noop */
        }
        for (const ws of session.clients) {
          try {
            ws.close();
          } catch {
            /* noop */
          }
        }
        session.clients.clear();
        session.buffer = [];
        session.bufferBytes = 0;
      };

      stream.on('end', die);
      stream.on('close', die);
      stream.on('error', die);
    })().catch((err) => {
      session.dead = true;
      sessions.delete(containerId);
      reject(err);
    });
  });

  return session;
}

function getSession(containerId) {
  let session = sessions.get(containerId);
  if (session && !session.dead) return session;
  sessions.delete(containerId);
  session = createSession(containerId);
  sessions.set(containerId, session);
  return session;
}

async function attachTerminal(ws, containerId) {
  const session = getSession(containerId);
  await session.ready;

  session.clients.add(ws);

  if (session.buffer.length > 0 && ws.readyState === ws.OPEN) {
    try {
      ws.send(Buffer.concat(session.buffer));
    } catch {
      /* client already closing */
    }
  }

  const onMessage = (data) => {
    markActivity(containerId);
    if (session.dead || !session.stream) return;
    try {
      session.stream.write(data);
    } catch {
      /* shell already gone */
    }
  };
  const onClose = () => {
    session.clients.delete(ws);
    ws.removeListener('message', onMessage);
    ws.removeListener('close', onClose);
    ws.removeListener('error', onClose);
  };

  ws.on('message', onMessage);
  ws.on('close', onClose);
  ws.on('error', onClose);
}

module.exports = { attachTerminal };
