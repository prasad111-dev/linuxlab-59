/* One-off: insert the "Offboarding: remove a departed intern" task.
   Uses the new user_absent / group_absent rule types (removal checks).
   Usage:
     cd backend
     MONGODB_URI="<production uri>" node scripts/add-offboarding-task.js
   The task is inserted as published. Safe to re-run (skips if title exists). */
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../src/models/Category');
const Task = require('../src/models/Task');

const TASK = {
  title: 'Offboarding: remove a departed intern',
  categorySlug: 'user-management',
  difficulty: 'intermediate',
  estimatedMinutes: 15,
  points: 120,
  scenario:
    'The intern tim (tkim) finished their rotation and has left. The "interns" group is now empty ' +
    'and must be cleaned up too. Meanwhile a new contractor, rsingh, starts Monday and needs an ' +
    'account in the devops group so they can deploy on day one.',
  objectives: [
    'Remove the departed user tkim and their home directory',
    'Delete the now-empty interns group',
    'Create a new user rsingh',
    'Make rsingh a member of the devops group',
  ],
  requirements: [
    'Root or sudo privileges',
    'The user tkim and the group interns are treated as if they existed (simulated offboarding)',
    'The devops group must exist',
  ],
  instructions: [
    'Delete the user tkim with their home directory and mail spool.',
    'Remove the empty interns group.',
    'Create the devops group if it is missing.',
    'Create the user rsingh with a home directory and /bin/bash login shell.',
    'Add rsingh to the devops group and verify with: id rsingh, getent group interns',
  ],
  expectedOutcome:
    'id tkim and getent group interns return nothing, while id rsingh shows membership in devops.',
  learningOutcomes: [
    'Secure account removal with userdel -r',
    'Group cleanup with groupdel',
    'Creating users with group membership using useradd -G',
  ],
  hints: [
    'userdel has a flag that also removes the home directory.',
    'A group can only be deleted when no user has it as their primary group.',
    'useradd -G devops -m -s /bin/bash rsingh creates the account and membership in one step.',
  ],
  solution:
    'userdel -r tkim\n' +
    'groupdel interns\n' +
    'groupadd devops\n' +
    'useradd -m -s /bin/bash -G devops rsingh',
  setupCommands: [
    'useradd -m -s /bin/bash tkim',
    'touch /var/mail/tkim && chown tkim:mail /var/mail/tkim',
    'groupadd interns',
    'usermod -aG interns tkim',
  ],
  validationRules: [
    { type: 'user_absent', label: 'User tkim is removed', params: { username: 'tkim' } },
    { type: 'group_absent', label: 'Group interns is removed', params: { group: 'interns' } },
    { type: 'user_exists', label: 'User rsingh exists', params: { username: 'rsingh' } },
    { type: 'group_exists', label: 'Group devops exists', params: { group: 'devops' } },
    { type: 'command_contains', label: 'rsingh is in the devops group', params: { command: 'id rsingh', needle: 'devops' } },
  ],
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Set MONGODB_URI (the database connection string) first.');
  await mongoose.connect(uri);
  console.log('[offboarding] connected');

  const existing = await Task.findOne({ title: TASK.title });
  if (existing) {
    console.log('[offboarding] task already exists — nothing to do.');
    await mongoose.disconnect();
    return;
  }

  const cat = await Category.findOne({ slug: TASK.categorySlug });
  if (!cat) {
    await mongoose.disconnect();
    throw new Error(`Category "${TASK.categorySlug}" not found. Run the seed first.`);
  }

  const { categorySlug, ...taskData } = TASK;
  const task = await Task.create({
    ...taskData,
    category: cat._id,
    status: 'published',
    publishedAt: new Date(),
  });
  console.log(`[offboarding] created "${task.title}" (${task.validationRules.length} checks)`);
  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('[offboarding] failed:', e.message);
    process.exit(1);
  });
