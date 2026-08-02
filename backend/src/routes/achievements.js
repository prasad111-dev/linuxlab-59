const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { HttpError } = require('../utils/httpError');
const { getCatalog } = require('../services/achievementService');

module.exports = async function achievementRoutes(app) {
  app.get('/', { preHandler: [requireAuth] }, async (req) => {
    const user = await User.findById(req.userId);
    if (!user) throw new HttpError(404, 'User not found');
    return { achievements: await getCatalog(user), points: user.points };
  });
};
