const Task = require('../models/Task');
const Attempt = require('../models/Attempt');
const Category = require('../models/Category');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');
const { HttpError } = require('../utils/httpError');
const { callGemini } = require('../services/geminiService');

const TASK_FIELDS = [
  'title',
  'category',
  'difficulty',
  'estimatedMinutes',
  'points',
  'scenario',
  'objectives',
  'requirements',
  'instructions',
  'expectedOutcome',
  'learningOutcomes',
  'hints',
  'solution',
  'validationRules',
  'sections',
  'setupCommands',
];

function cleanTaskBody(body) {
  const out = {};
  for (const f of TASK_FIELDS) {
    if (body[f] !== undefined) out[f] = body[f];
  }
  return out;
}

function stripCodeFences(text) {
  return String(text)
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
}

module.exports = async function taskRoutes(app) {
  app.get('/', { preHandler: [optionalAuth] }, async (req) => {
    const { category, difficulty, q } = req.query;
    const filter = {};
    if (req.userRole !== 'admin') filter.status = 'published';
    else if (req.query.status) filter.status = req.query.status;
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (q) filter.$text = { $search: String(q) };

    const tasks = await Task.find(filter)
      .populate('category', 'name slug icon color')
      .sort({ createdAt: -1 })
      .lean();

    return tasks.map((t) => {
      const { solution, ...rest } = t;
      return { ...rest, id: t._id.toString() };
    });
  });

  app.get('/:id', { preHandler: [optionalAuth] }, async (req) => {
    const task = await Task.findById(req.params.id).populate('category', 'name slug icon color description');
    if (!task) throw new HttpError(404, 'Task not found');
    if (task.status !== 'published' && req.userRole !== 'admin') {
      throw new HttpError(404, 'Task not found');
    }

    let myBest = null;
    if (req.userId) {
      myBest = await Attempt.findOne({ user: req.userId, task: task._id })
        .sort({ score: -1 })
        .select('score status passed');
    }
    const json = req.userRole === 'admin' ? task.toAdminJSON() : task.toStudentJSON();
    json.myBest = myBest ? { score: myBest.score, passed: myBest.passed, status: myBest.status } : null;
    return json;
  });

  app.post('/', { preHandler: [requireAdmin] }, async (req) => {
    const body = cleanTaskBody(req.body || {});
    if (!body.title || !body.scenario || !body.category) {
      throw new HttpError(400, 'title, scenario and category are required');
    }
    if (!Number(body.points)) throw new HttpError(400, 'points is required');
    if (!Number(body.estimatedMinutes)) throw new HttpError(400, 'estimatedMinutes is required');

    const task = await Task.create({
      ...body,
      category: body.category,
      createdBy: req.userId,
    });
    return task.toAdminJSON();
  });

  app.put('/:id', { preHandler: [requireAdmin] }, async (req) => {
    const task = await Task.findById(req.params.id);
    if (!task) throw new HttpError(404, 'Task not found');
    Object.assign(task, cleanTaskBody(req.body || {}));
    await task.save();
    return task.toAdminJSON();
  });

  app.delete('/:id', { preHandler: [requireAdmin] }, async (req) => {
    const task = await Task.findById(req.params.id);
    if (!task) throw new HttpError(404, 'Task not found');
    await task.deleteOne();
    return { ok: true };
  });

  app.post('/:id/publish', { preHandler: [requireAdmin] }, async (req) => {
    const task = await Task.findById(req.params.id);
    if (!task) throw new HttpError(404, 'Task not found');
    task.status = task.status === 'published' ? 'draft' : 'published';
    task.publishedAt = task.status === 'published' ? new Date() : null;
    await task.save();

    if (task.status === 'published') {
      const students = await User.find({}).select('_id').lean();
      if (students.length > 0) {
        await Notification.insertMany(
          students.map((u) => ({
            user: u._id,
            type: 'task_published',
            title: `New practical: ${task.title}`,
            body: 'A new Linux practical is available.',
            data: { taskId: task._id },
          }))
        );
      }
    }
    return task.toAdminJSON();
  });

  app.post('/ai-generate', { preHandler: [requireAdmin] }, async (req) => {
    const { prompt } = req.body || {};
    if (!prompt || !String(prompt).trim()) throw new HttpError(400, 'prompt is required');

    const categories = await Category.find({}).lean();
    const catNames = categories.map((c) => c.name).join(', ') || 'Linux Basics, SSH, Networking, User Management';
    const system =
      'You are a senior Linux administrator building practical tasks for a cloud lab platform. ' +
      'Given a prompt, respond with ONLY valid JSON (no markdown fences) matching this schema: ' +
      '{ "title": string, "category": string (one of: ' + catNames + '), ' +
      '"difficulty": "beginner" | "intermediate" | "advanced" | "expert", ' +
      '"estimatedMinutes": number, "points": number, ' +
      '"scenario": string (a realistic IT support ticket, not a textbook exercise), ' +
      '"objectives": string[], "requirements": string[], "instructions": string[], ' +
      '"expectedOutcome": string, "learningOutcomes": string[], ' +
      '"hints": string[] (3 escalating, first is smallest clue), "solution": string, ' +
      '"setupCommands": string[] (shell commands run inside the lab container BEFORE the student ' +
      'starts, used to simulate the scenario — e.g. useradd -m asmith, touch /etc/foo.conf; leave ' +
      'empty if the task starts from a clean system), ' +
      '"validationRules": [ { "type": string, "label": string, "params": object } ] } ' +
      'where type is one of: file_exists, dir_exists, user_exists, user_absent, group_exists, ' +
      'group_absent, package_installed, ' +
      'service_active, service_enabled, port_open, file_contains, file_permissions, file_owner, command_contains ' +
      'and params matches the type (path, username, group, package, service, port, needle, command, expected). ' +
      'IMPORTANT: when a task must remove a user/group that was pre-created by setupCommands, the check ' +
      'must use user_absent / group_absent (they pass only when the user/group NO LONGER exists).';

    const raw = await callGemini(system, String(prompt).trim(), { temperature: 0.7, maxTokens: 2048 });

    let draft;
    try {
      draft = JSON.parse(stripCodeFences(raw));
    } catch {
      throw new HttpError(502, 'AI returned invalid JSON. Please try a different prompt.');
    }

    const cat = categories.find((c) => c.name.toLowerCase() === String(draft.category || '').toLowerCase());
    if (cat) draft.category = cat._id.toString();
    delete draft.categoryId;

    return { draft };
  });
};
