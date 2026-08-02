const crypto = require('crypto');

// Activity tracker: containerId -> lastActive (ms epoch)
const activity = new Map();

function markActivity(containerId) {
  activity.set(containerId, Date.now());
}

function getLastActive(containerId) {
  return activity.get(containerId) || Date.now();
}

function clearActivity(containerId) {
  activity.delete(containerId);
}

function shortId() {
  return crypto.randomBytes(6).toString('hex');
}

module.exports = { markActivity, getLastActive, clearActivity, shortId };
