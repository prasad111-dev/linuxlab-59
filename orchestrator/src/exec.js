const { Writable } = require('stream');
const docker = require('./docker');

/**
 * Run a shell command inside a container (non-interactive).
 * Returns { exitCode, stdout, stderr }.
 */
async function execInContainer(containerId, command, timeoutMs = 15000) {
  const container = docker.getContainer(containerId);
  const exec = await container.exec({
    Cmd: ['/bin/bash', '-lc', command],
    AttachStdout: true,
    AttachStderr: true,
  });
  const stream = await exec.start({ Detach: false, Tty: false });

  const outChunks = [];
  const errChunks = [];
  const out = new Writable({ write(c, _e, cb) { outChunks.push(c); cb(); } });
  const err = new Writable({ write(c, _e, cb) { errChunks.push(c); cb(); } });
  container.modem.demuxStream(stream, out, err);

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`exec timed out after ${timeoutMs}ms`)), timeoutMs);
    stream.on('end', () => { clearTimeout(timer); resolve(); });
    stream.on('error', (e) => { clearTimeout(timer); reject(e); });
  });

  const info = await exec.inspect();
  return {
    exitCode: info.ExitCode,
    stdout: Buffer.concat(outChunks).toString('utf8'),
    stderr: Buffer.concat(errChunks).toString('utf8'),
  };
}

module.exports = { execInContainer };
