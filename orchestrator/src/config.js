require('dotenv').config();

function int(name, fallback) {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

const token = process.env.ORCHESTRATOR_TOKEN;
if (!token || token === 'change-me-to-a-long-random-string') {
  throw new Error('ORCHESTRATOR_TOKEN must be set in .env (run: openssl rand -hex 32)');
}

module.exports = {
  port: int('PORT', 8080),
  token,
  labImage: process.env.LAB_IMAGE || 'linuxlab:latest',
  memMb: int('CONTAINER_MEM_MB', 512),
  cpu: Number(process.env.CONTAINER_CPU) || 0.5,
  pids: int('CONTAINER_PIDS', 256),
  ttlMinutes: int('SESSION_TTL_MINUTES', 60),
  maxLifeMinutes: int('MAX_LIFE_MINUTES', 180),
  maxContainers: int('MAX_CONTAINERS', 20),
  sweepIntervalMs: 60_000,
};
