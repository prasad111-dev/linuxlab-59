const config = require('./config');
const { buildApp } = require('./app');
const { connectDB, disconnectDB } = require('./db');
const { setupTerminalProxy } = require('./ws/terminalProxy');
const { seedDatabase } = require('./seed');

async function main() {
  await connectDB();
  const app = await buildApp();

  await seedDatabase();

  await app.listen({ port: config.port, host: '0.0.0.0' });
  setupTerminalProxy(app.server);

  app.log.info(`LinuxLab backend running on :${config.port} (${config.env})`);
}

async function shutdown(signal) {
  try {
    await disconnectDB();
  } catch {
    /* noop */
  }
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

main().catch((err) => {
  console.error('[server] failed to start:', err.message);
  process.exit(1);
});
