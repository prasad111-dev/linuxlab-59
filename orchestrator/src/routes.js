const { Router } = require('express');
const config = require('./config');
const docker = require('./docker');
const { createContainer, listContainers, getContainer, destroyContainer } = require('./containers');
const { execInContainer } = require('./exec');
const { markActivity } = require('./state');

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'linuxlab-orchestrator', time: new Date().toISOString() });
});

router.get('/docker', async (_req, res) => {
  const info = await docker.info();
  res.json({
    containers: info.Containers,
    running: info.ContainersRunning,
    memTotal: info.MemTotal,
    serverVersion: info.ServerVersion,
  });
});

router.post('/containers', async (req, res, next) => {
  try {
    const { sessionId, image, memMb, cpu, pids, ttlMinutes } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

    const running = await docker.listContainers({ filters: { label: ['linuxlab.session=true'] } });
    if (running.length >= config.maxContainers) {
      return res.status(503).json({ error: 'max concurrent containers reached on this VPS' });
    }

    const container = await createContainer({
      sessionId,
      image: image || config.labImage,
      memMb: memMb || config.memMb,
      cpu: cpu || config.cpu,
      pids: pids || config.pids,
      ttlMinutes: ttlMinutes || config.ttlMinutes,
      maxLifeMinutes: config.maxLifeMinutes,
    });
    markActivity(container.containerId);
    res.status(201).json(container);
  } catch (e) {
    next(e);
  }
});

router.get('/containers', async (_req, res, next) => {
  try {
    res.json({ containers: await listContainers() });
  } catch (e) {
    next(e);
  }
});

router.get('/containers/:id', async (req, res, next) => {
  try {
    const c = await getContainer(req.params.id);
    if (!c) return res.status(404).json({ error: 'container not found or not managed' });
    res.json(c);
  } catch (e) {
    next(e);
  }
});

router.post('/containers/:id/activity', async (req, res, next) => {
  try {
    const c = await getContainer(req.params.id);
    if (!c) return res.status(404).json({ error: 'container not found or not managed' });
    markActivity(c.containerId);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.post('/containers/:id/exec', async (req, res, next) => {
  try {
    const { command, timeoutMs } = req.body || {};
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'command is required' });
    }
    const c = await getContainer(req.params.id);
    if (!c) return res.status(404).json({ error: 'container not found or not managed' });
    markActivity(c.containerId);
    const result = await execInContainer(c.containerId, command, timeoutMs || 15000);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.delete('/containers/:id', async (req, res, next) => {
  try {
    const result = await destroyContainer(req.params.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
