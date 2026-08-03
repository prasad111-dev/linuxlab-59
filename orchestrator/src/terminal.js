const { execInContainer } = require('./exec');
const docker = require('./docker');
const { markActivity } = require('./state');

async function attachTerminal(ws, containerId) {
  const container = docker.getContainer(containerId);

  try {
    await container.start();
  } catch {
    /* already running */
  }

  // Spawn a root login shell instead of attaching to the container console,
  // whose systemd getty would otherwise prompt for a username/password.
  const exec = await container.exec({
    Cmd: ['/bin/bash', '-l'],
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
  });
  const stream = await exec.start({ Detach: false, Tty: true, hijack: true, stdin: true });

  markActivity(containerId);

  const send = (data) => {
    if (ws.readyState === ws.OPEN) ws.send(data);
  };

  const onMessage = (data) => {
    stream.write(data);
    markActivity(containerId);
  };
  const onStreamData = (chunk) => {
    send(chunk);
    markActivity(containerId);
  };
  const onClose = () => {
    try {
      stream.destroy();
    } catch {
      /* noop */
    }
    try {
      ws.close();
    } catch {
      /* noop */
    }
  };

  stream.on('data', onStreamData);
  stream.on('end', onClose);
  stream.on('error', onClose);
  ws.on('message', onMessage);
  ws.on('close', onClose);
  ws.on('error', onClose);
}

module.exports = { attachTerminal };
