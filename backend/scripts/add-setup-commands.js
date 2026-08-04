/* One-off: attach setupCommands to existing tasks so removed users/groups
   actually EXIST in the container before the student starts.
   Usage:
     cd backend
     MONGODB_URI="<production uri>" node scripts/add-setup-commands.js
   Safe to re-run (skips tasks that already have setupCommands). */
require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../src/models/Task');

const SETUP = {
  'Onboarding and Offboarding Staff Accounts': [
    'useradd -m -s /bin/bash asmith',
    'touch /var/mail/asmith && chown asmith:mail /var/mail/asmith',
  ],
  'Offboarding: remove a departed intern': [
    'useradd -m -s /bin/bash tkim',
    'touch /var/mail/tkim && chown tkim:mail /var/mail/tkim',
    'groupadd interns',
    'usermod -aG interns tkim',
    'groupadd devops',
  ],
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Set MONGODB_URI (the database connection string) first.');
  await mongoose.connect(uri);
  console.log('[add-setup-commands] connected');

  let updated = 0;
  for (const [title, commands] of Object.entries(SETUP)) {
    const task = await Task.findOne({ title });
    if (!task) {
      console.log(`[add-setup-commands] not found: "${title}"`);
      continue;
    }
    if (Array.isArray(task.setupCommands) && task.setupCommands.length > 0) {
      console.log(`[add-setup-commands] already set for "${title}" — skipping`);
      continue;
    }
    task.setupCommands = commands;
    await task.save();
    updated += 1;
    console.log(`[add-setup-commands] "${title}" now provisions: ${commands.join('; ')}`);
  }

  console.log(`[add-setup-commands] done — updated ${updated} task(s).`);
  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('[add-setup-commands] failed:', e.message);
    process.exit(1);
  });
