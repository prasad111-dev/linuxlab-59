const { Issuer, generators } = require('openid-client');
const { SignJWT, jwtVerify } = require('jose');
const config = require('../config');
const User = require('../models/User');
const { HttpError } = require('../utils/httpError');
const { updateStreak } = require('./streakService');

let clientPromise = null;

function getClient() {
  if (!config.google.clientId || !config.google.clientSecret || !config.google.redirectUri) {
    throw new HttpError(500, 'Google OAuth is not configured on the server');
  }
  if (!clientPromise) {
    clientPromise = Issuer.discover('https://accounts.google.com').then((issuer) =>
      new issuer.Client({
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        redirect_uris: [config.google.redirectUri],
        response_types: ['code'],
      })
    );
  }
  return clientPromise;
}

// In-memory OAuth state store (single-instance on free Render, acceptable).
const pendingStates = new Map();

function normalizeOrigin(value) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function allowedFrontendOrigins() {
  return new Set(
    [config.frontendUrl, ...config.frontendOrigins].map(normalizeOrigin).filter(Boolean)
  );
}

function resolveFrontend(frontend) {
  const origin = normalizeOrigin(frontend);
  return origin && allowedFrontendOrigins().has(origin) ? origin : config.frontendUrl;
}

function buildAuthUrl(frontend) {
  return getClient().then((client) => {
    const state = generators.state();
    const nonce = generators.nonce();
    pendingStates.set(state, { nonce, at: Date.now(), frontend: resolveFrontend(frontend) });
    // Clear stale entries
    for (const [k, v] of pendingStates) {
      if (Date.now() - v.at > 10 * 60 * 1000) pendingStates.delete(k);
    }
    return client.authorizationUrl({
      scope: 'openid email profile',
      state,
      nonce,
      redirect_uri: config.google.redirectUri,
    });
  });
}

async function handleCallback(req) {
  const client = await getClient();
  const params = client.callbackParams(req);
  const stored = pendingStates.get(params.state);
  pendingStates.delete(params.state);
  if (!stored) {
    throw new HttpError(400, 'Invalid or expired OAuth state');
  }
  const tokenSet = await client.callback(config.google.redirectUri, params, {
    nonce: stored.nonce,
    state: params.state,
  });
  const claims = tokenSet.claims();

  const user = await upsertUser({
    googleId: String(claims.sub),
    email: String(claims.email || '').toLowerCase(),
    name: claims.name || claims.email || 'Student',
    picture: claims.picture || '',
  });

  const jwt = await issueToken(user);
  return { user: user.toSafeJSON(), jwt, frontend: stored.frontend || config.frontendUrl };
}

async function upsertUser({ googleId, email, name, picture }) {
  let user = await User.findOne({ googleId });
  if (!user && email) user = await User.findOne({ email });

  const now = new Date();
  if (!user) {
    const role = config.adminEmails.includes(email) ? 'admin' : 'student';
    user = new User({ googleId, email, name, picture, role, lastLoginAt: now });
  } else {
    if (!user.googleId) user.googleId = googleId;
    if (picture) user.picture = picture;
    if (config.adminEmails.includes(email)) user.role = 'admin';
    user.lastLoginAt = now;
  }
  updateStreak(user, now);
  await user.save();
  return user;
}

async function issueToken(user) {
  const secret = new TextEncoder().encode(config.jwtSecret);
  return new SignJWT({
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(config.jwtExpiresIn)
    .sign(secret);
}

async function verifyToken(token) {
  try {
    const secret = new TextEncoder().encode(config.jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }
}

module.exports = { buildAuthUrl, handleCallback, issueToken, verifyToken, upsertUser };
