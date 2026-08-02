const docker = require('./docker');

const LAB_LABEL = 'linuxlab.session=true';

async function isLabContainer(containerId) {
  try {
    const info = await docker.getContainer(containerId).inspect();
    return Boolean(info.Config && info.Config.Labels && info.Config.Labels['linuxlab.session'] === 'true');
  } catch {
    return false;
  }
}

async function createContainer({ sessionId, image, memMb, cpu, pids, ttlMinutes, maxLifeMinutes }) {
  const container = await docker.createContainer({
    Image: image,
    Tty: true,
    OpenStdin: true,
    StdinOnce: false,
    Hostname: 'lab',
    Labels: {
      'linuxlab.session': 'true',
      'linuxlab.sessionId': String(sessionId),
      'linuxlab.ttl': String(ttlMinutes || 60),
      'linuxlab.maxLife': String(maxLifeMinutes || 180),
    },
    HostConfig: {
      Memory: Math.round((memMb || 512) * 1024 * 1024),
      NanoCpus: Math.round((cpu || 0.5) * 1e9),
      PidsLimit: pids || 256,
      Privileged: true,
      RestartPolicy: { Name: 'no' },
      NetworkMode: 'default',
    },
    Env: ['container=docker', 'LINUXLAB_SESSION=true'],
  });

  await container.start();
  const info = await container.inspect();
  return {
    containerId: container.id,
    sessionId,
    startedAt: info.State.StartedAt,
    image,
  };
}

async function listContainers() {
  const list = await docker.listContainers({ filters: { label: [LAB_LABEL] } });
  return list.map((c) => ({
    containerId: c.Id,
    image: c.Image,
    state: c.State,
    status: c.Status,
    startedAt: c.State === 'running' ? c.Created : null,
  }));
}

async function destroyContainer(containerId) {
  if (!(await isLabContainer(containerId))) {
    return { removed: false, reason: 'not-a-lab-container' };
  }
  const container = docker.getContainer(containerId);
  try {
    await container.kill();
  } catch {
    /* already stopped */
  }
  try {
    await container.remove({ force: true, v: true });
  } catch (e) {
    if (!/No such container/i.test(e.message)) throw e;
  }
  return { removed: true };
}

async function getContainer(containerId) {
  if (!(await isLabContainer(containerId))) return null;
  const info = await docker.getContainer(containerId).inspect();
  return {
    containerId: containerId,
    sessionId: info.Config.Labels['linuxlab.sessionId'],
    running: info.State.Running,
    state: info.State.Status,
    startedAt: info.State.StartedAt,
    startedAtMs: info.State.StartedAt ? Date.parse(info.State.StartedAt) : Date.now(),
    ttlMinutes: Number(info.Config.Labels['linuxlab.ttl'] || 60),
  };
}

module.exports = {
  createContainer,
  listContainers,
  destroyContainer,
  getContainer,
  isLabContainer,
};
