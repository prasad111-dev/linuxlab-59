const config = require('../config');
const { HttpError } = require('../utils/httpError');

/**
 * Client for the lab orchestrator running on the Ubuntu VPS.
 * The ORCHESTRATOR_TOKEN lives only in the backend — never sent to browsers.
 */
function ensureConfigured() {
  if (!config.orchestrator.url || !config.orchestrator.token) {
    throw new HttpError(503, 'Lab orchestrator is not configured on the server');
  }
}

async function request(path, options = {}) {
  ensureConfigured();
  const res = await fetch(`${config.orchestrator.url}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.orchestrator.token}`,
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    let message = json.error || `Orchestrator error ${res.status}`;
    if (Array.isArray(json.errors) && json.errors.length > 0) {
      const detail = json.errors
        .map((er) => {
          const why = er.error || `exit ${er.exitCode}`;
          return `${er.command}: ${why}${er.stderr ? ` - ${er.stderr}` : ''}`;
        })
        .join('; ');
      message = `${message} (${detail})`;
    }
    throw new HttpError(502, message);
  }
  return json;
}

async function createContainer(sessionId, extra = {}) {
  const result = await request('/containers', {
    method: 'POST',
    body: {
      sessionId,
      memMb: config.container.memMb,
      cpu: config.container.cpu,
      pids: config.container.pids,
      ttlMinutes: config.sessionTtlMinutes,
      ...extra,
    },
  });
  return result;
}

async function destroyContainer(containerId) {
  try {
    return await request(`/containers/${containerId}`, { method: 'DELETE' });
  } catch (e) {
    if (e.status === 502 && /container not found/i.test(e.message)) return { removed: false };
    throw e;
  }
}

async function execInContainer(containerId, command, timeoutMs = 15000) {
  const result = await request(`/containers/${containerId}/exec`, {
    method: 'POST',
    body: { command, timeoutMs },
  });
  return result;
}

async function touchContainer(containerId) {
  await request(`/containers/${containerId}/activity`, { method: 'POST' });
}

async function isContainerAlive(containerId) {
  try {
    const info = await request(`/containers/${containerId}`);
    return Boolean(info.running);
  } catch (e) {
    return false;
  }
}

async function listContainers() {
  const result = await request('/containers');
  return result.containers || [];
}

function terminalUrl(containerId) {
  ensureConfigured();
  return `${config.orchestrator.wsUrl}/terminal?token=${encodeURIComponent(config.orchestrator.token)}&containerId=${encodeURIComponent(containerId)}`;
}

module.exports = {
  createContainer,
  destroyContainer,
  execInContainer,
  touchContainer,
  isContainerAlive,
  listContainers,
  terminalUrl,
};
