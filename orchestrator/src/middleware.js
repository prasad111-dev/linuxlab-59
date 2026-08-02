const config = require('./config');

function authMiddleware(req, res, next) {
  if (req.path === '/health') return next();

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (token === config.token) return next();

  return res.status(401).json({ error: 'unauthorized' });
}

function checkWsAuth(req) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const token = url.searchParams.get('token') || '';
  return token === config.token;
}

module.exports = { authMiddleware, checkWsAuth };
