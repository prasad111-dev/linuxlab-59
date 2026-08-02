const Achievement = require('../models/Achievement');
const Notification = require('../models/Notification');

const CATALOG = [
  { code: 'first_task', name: 'First Steps', icon: '🚀', points: 50, description: 'Complete your first practical', criteria: { type: 'tasks_completed', min: 1 } },
  { code: 'five_tasks', name: 'Getting Trained', icon: '🛠️', points: 100, description: 'Complete 5 practicals', criteria: { type: 'tasks_completed', min: 5 } },
  { code: 'ten_tasks', name: 'Linux Apprentice', icon: '🐧', points: 250, description: 'Complete 10 practicals', criteria: { type: 'tasks_completed', min: 10 } },
  { code: 'perfect_score', name: 'Flawless', icon: '💯', points: 100, description: 'Score 100% on any practical', criteria: { type: 'perfect_score' } },
  { code: 'fast_learner', name: 'Fast Learner', icon: '⚡', points: 75, description: 'Finish a practical in under half the estimated time', criteria: { type: 'fast_learner' } },
  { code: 'streak_3', name: 'On Fire', icon: '🔥', points: 150, description: 'Practice 3 days in a row', criteria: { type: 'streak', min: 3 } },
  { code: 'streak_7', name: 'Unstoppable', icon: '🌋', points: 300, description: 'Practice 7 days in a row', criteria: { type: 'streak', min: 7 } },
  { code: 'explorer', name: 'Explorer', icon: '🧭', points: 100, description: 'Complete practicals in 3 different categories', criteria: { type: 'categories', min: 3 } },
];

async function seedCatalog() {
  for (const a of CATALOG) {
    await Achievement.updateOne({ code: a.code }, { $set: a }, { upsert: true });
  }
}

function evaluateCriteria(achievement, user, ctx) {
  const c = achievement.criteria || {};
  switch (c.type) {
    case 'tasks_completed':
      return ctx.tasksCompleted >= (c.min || 1);
    case 'perfect_score':
      return ctx.perfectScore;
    case 'fast_learner':
      return ctx.fastLearner;
    case 'streak':
      return user.streak.current >= (c.min || 1);
    case 'categories':
      return ctx.categoriesCount >= (c.min || 1);
    default:
      return false;
  }
}

/**
 * ctx = { tasksCompleted, perfectScore, fastLearner, categoriesCount }
 * Returns the newly unlocked achievements.
 */
async function checkAndUnlock(user, ctx) {
  const unlocked = new Set((user.achievements || []).map((a) => a.code));
  const catalog = await Achievement.find({}).lean();
  const newly = [];

  for (const a of catalog) {
    if (unlocked.has(a.code)) continue;
    if (evaluateCriteria(a, user, ctx)) {
      user.achievements.push({ code: a.code, unlockedAt: new Date() });
      user.points += a.points;
      newly.push(a);
      unlocked.add(a.code);
    }
  }
  if (newly.length > 0) {
    await user.save();
    await Notification.insertMany(
      newly.map((a) => ({
        user: user._id,
        type: 'achievement',
        title: `Achievement unlocked: ${a.name}`,
        body: a.description,
        data: { code: a.code, icon: a.icon },
      }))
    );
  }
  return newly;
}

async function getCatalog(user) {
  const catalog = await Achievement.find({}).lean();
  const owned = new Set((user?.achievements || []).map((a) => a.code));
  return catalog.map((a) => ({ ...a, id: a._id.toString(), unlocked: owned.has(a.code) }));
}

module.exports = { CATALOG, seedCatalog, checkAndUnlock, getCatalog };
