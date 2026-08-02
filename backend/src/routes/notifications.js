const Notification = require('../models/Notification');
const { requireAuth } = require('../middleware/auth');
const { HttpError } = require('../utils/httpError');

module.exports = async function notificationRoutes(app) {
  app.get('/', { preHandler: [requireAuth] }, async (req) => {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const [items, unread] = await Promise.all([
      Notification.find({ user: req.userId }).sort({ createdAt: -1 }).limit(limit).lean(),
      Notification.countDocuments({ user: req.userId, read: false }),
    ]);
    return {
      items: items.map((n) => ({ ...n, id: n._id.toString() })),
      unread,
    };
  });

  app.post('/read-all', { preHandler: [requireAuth] }, async (req) => {
    await Notification.updateMany({ user: req.userId, read: false }, { $set: { read: true } });
    return { ok: true };
  });

  app.post('/:id/read', { preHandler: [requireAuth] }, async (req) => {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: { read: true } },
      { new: true }
    );
    if (!n) throw new HttpError(404, 'Notification not found');
    return { ok: true };
  });
};
