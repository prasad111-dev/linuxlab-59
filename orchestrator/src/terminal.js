const { execInContainer } = require('./exec');
const docker = require('./docker');
const { markActivity } = require('./state');

async function attachTerminal(ws, containerId) {
  const container = docker.getContainer(containerId);
  const stream = await container.attach({
    stream: true,
    stdin: true,
    stdout: true,
    stderr: true,
    hijack: true,
  });

  try {
    await container.start();
  } catch {
    /* already running */
  }

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
  };

  stream.on('data', onStreamData);
  stream.on('end', onClose);
  stream.on('error', onClose);
  ws.on('message', onMessage);
  ws.on('close', onClose);
  ws.on('error', onClose);
}

module.exports = { attachTerminal };
