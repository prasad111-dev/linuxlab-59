const Task = require('../models/Task');
const Attempt = require('../models/Attempt');
const { HttpError } = require('../utils/httpError');

async function startSession(userId, taskId) {
  const task = await Task.findById(taskId).populate('category');
  if (!task) throw new HttpError(404, 'Task not found');

  const running = await Attempt.findOne({ user: userId, task: task._id, status: 'running' });
  if (running) {
    return { attempt: running, resumed: true };
  }

  const attempt = await Attempt.create({
    user: userId,
    task: task._id,
    category: task.category ? task.category._id : null,
  });

  return { attempt, resumed: false };
}

async function terminateRunning(userId, taskId) {
  const running = await Attempt.find({ user: userId, task: taskId, status: 'running' });
  for (const attempt of running) {
    attempt.status = 'terminated';
    await attempt.save();
  }
}

module.exports = { startSession, terminateRunning };
