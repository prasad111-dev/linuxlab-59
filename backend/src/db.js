const mongoose = require('mongoose');
const config = require('./config');

async function connectDB() {
  mongoose.connection.on('error', (err) => console.error('[db] connection error', err.message));
  mongoose.connection.on('connected', () => console.log('[db] connected'));

  await mongoose.connect(config.mongodbUri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 15000,
  });
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
