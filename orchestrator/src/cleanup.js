const config = require('./config');
const docker = require('./docker');
const { getLastActive, clearActivity } = require('./state');

/**
 * Periodically destroys lab containers that are idle past their TTL or too old.
 */
function startSweeper(log = console) {
  const sweep = async () => {
    try {
      const list = await docker.listContainers({
        all: false,
        filters: { label: ['linuxlab.session=true'] },
      });
      const now = Date.now();

      for (const c of list) {
        try {
          const info = await docker.getContainer(c.Id).inspect();
          const ttl = Number(info.Config.Labels['linuxlab.ttl'] || config.ttlMinutes) * 60_000;
          const maxLife = config.maxLifeMinutes * 60_000;
          const startedAt = Date.parse(info.State.StartedAt || new Date().toISOString());
          const lastActive = getLastActive(c.Id);
          const idleFor = now - lastActive;
          const age = now - startedAt;

          if (idleFor > ttl || age > maxLife) {
            log.info(`[sweeper] destroying container ${c.Id} (idle=${Math.round(idleFor / 60000)}m age=${Math.round(age / 60000)}m)`);
            await docker.getContainer(c.Id).kill().catch(() => {});
            await docker.getContainer(c.Id).remove({ force: true, v: true }).catch(() => {});
            clearActivity(c.Id);
          }
        } catch {
          clearActivity(c.Id);
        }
      }
    } catch (e) {
      log.error('[sweeper] error', e.message);
    }
  };

  sweep();
  const timer = setInterval(sweep, config.sweepIntervalMs);
  timer.unref?.();
  return timer;
}

module.exports = { startSweeper };
