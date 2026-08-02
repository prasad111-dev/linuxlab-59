const { getLeaderboard, getUserRank } = require('../services/leaderboardService');
const { optionalAuth } = require('../middleware/auth');

module.exports = async function leaderboardRoutes(app) {
  app.get('/', { preHandler: [optionalAuth] }, async (req) => {
    const period = ['week', 'month', 'all'].includes(req.query.period) ? req.query.period : 'all';
    const rows = await getLeaderboard(period);
    const myRank = req.userId ? await getUserRank(req.userId) : null;
    return { period, rows, myRank };
  });
};
