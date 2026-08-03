const Suggestion = require('../models/Suggestion');
const { requireAuth } = require('../middleware/auth');
const { HttpError } = require('../utils/httpError');

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert'];
const MAX_TITLE = 120;
const MAX_SCENARIO = 5000;

module.exports = async function suggestionRoutes(app) {
  app.get('/mine', { preHandler: [requireAuth] }, async (req) => {
    const items = await Suggestion.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return items.map((s) => ({ ...s, id: s._id.toString() }));
  });

  app.post('/', { preHandler: [requireAuth] }, async (req) => {
    const { title, scenario, category, difficulty } = req.body || {};
    const cleanTitle = String(title || '').trim();
    const cleanScenario = String(scenario || '').trim();
    if (!cleanTitle) throw new HttpError(400, 'title is required');
    if (cleanTitle.length > MAX_TITLE) throw new HttpError(400, `title must be ${MAX_TITLE} characters or less`);
    if (!cleanScenario) throw new HttpError(400, 'scenario is required');
    if (cleanScenario.length > MAX_SCENARIO) throw new HttpError(400, `scenario must be ${MAX_SCENARIO} characters or less`);
    if (difficulty && !DIFFICULTIES.includes(difficulty)) throw new HttpError(400, 'invalid difficulty');

    const suggestion = await Suggestion.create({
      user: req.userId,
      title: cleanTitle,
      scenario: cleanScenario,
      category: category || null,
      difficulty: difficulty || '',
    });
    return suggestion.toSuggestionJSON();
  });
};
