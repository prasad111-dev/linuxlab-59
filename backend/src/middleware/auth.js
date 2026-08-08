const { verifyToken } = require('../services/authService');
const { HttpError } = require('../utils/httpError');
const User = require('../models/User');

async function requireAuth(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Authentication required');
  const payload = await verifyToken(token);
  req.userId = payload.sub;
  req.userRole = payload.role || 'student';
  req.userEmail = payload.email || '';
}

async function requireAdmin(req) {
  await requireAuth(req);
  if (req.userRole !== 'admin') {
    throw new HttpError(403, 'Admin access required');
  }
  // Don't trust the role stamped into the JWT forever — a demoted admin must
  // lose access immediately, not on the next login. Re-read from the DB.
  const user = await User.findById(req.userId).select('role').lean();
  if (!user || user.role !== 'admin') {
    throw new HttpError(403, 'Admin access required');
  }
  req.userRole = user.role;
}

async function optionalAuth(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return;
  try {
    const payload = await verifyToken(token);
    req.userId = payload.sub;
    req.userRole = payload.role || 'student';
  } catch {
    /* treat as anonymous */
  }
}

module.exports = { requireAuth, requireAdmin, optionalAuth };
