require('dotenv').config();

function required(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

function int(name, fallback) {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  env: process.env.NODE_ENV || 'development',
  isProd,
  port: int('PORT', 4000),
  mongodbUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  orchestrator: {
    url: (process.env.ORCHESTRATOR_URL || 'http://localhost:8080').replace(/\/+$/, ''),
    wsUrl: (process.env.ORCHESTRATOR_WS_URL || 'ws://localhost:8080').replace(/\/+$/, ''),
    token: process.env.ORCHESTRATOR_TOKEN || '',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },
  adminEmails: (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
  sessionTtlMinutes: int('SESSION_TTL_MINUTES', 60),
  container: {
    memMb: int('CONTAINER_MEM_MB', 512),
    cpu: Number(process.env.CONTAINER_CPU) || 0.5,
    pids: int('CONTAINER_PIDS', 256),
  },
  passMark: int('PASS_MARK', 70),
};
