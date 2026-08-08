const crypto = require('crypto');
const Task = require('../models/Task');
const Attempt = require('../models/Attempt');
const orchestrator = require('./orchestratorClient');
const { HttpError } = require('../utils/httpError');

/**
 * Creates a fresh lab session for a student + task.
 * No resume: any previous running attempt for the same task is terminated
 * and its container destroyed before a new one starts.
 */
async function startSession(userId, taskId) {
  const task = await Task.findById(taskId).populate('category');
  if (!task) throw new HttpError(404, 'Task not found');
  if (task.status !== 'published') {
    throw new HttpError(403, 'This task is not published yet');
  }

  await terminateRunning(userId, task._id);

  const attempt = await Attempt.create({
    user: userId,
    task: task._id,
    category: task.category ? task.category._id : null,
    wsTicket: crypto.randomBytes(24).toString('hex'),
  });

  let container;
  try {
    container = await orchestrator.createContainer(attempt._id.toString(), {
      setup: task.setupCommands || [],
    });
  } catch (e) {
    await Attempt.deleteOne({ _id: attempt._id });
    throw new HttpError(503, `Could not start a lab container: ${e.message}`);
  }

  attempt.containerId = container.containerId;
  await attempt.save();
  return { attempt, resumed: false };
}

async function terminateRunning(userId, taskId) {
  const running = await Attempt.find({ user: userId, task: taskId, status: 'running' });
  for (const attempt of running) {
    if (attempt.containerId) {
      await orchestrator.destroyContainer(attempt.containerId).catch(() => {});
    }
    attempt.status = 'terminated';
    await attempt.save();
  }
}

module.exports = { startSession, terminateRunning };
