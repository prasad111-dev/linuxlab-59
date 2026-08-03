/* One-off: insert the "AdzPilot AI — onboard 4 engineers" task.
   Usage:
     cd backend
     MONGODB_URI="<production uri>" node scripts/add-adzpilot-task.js
   The task is inserted as published. Safe to re-run (skips if title exists). */
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../src/models/Category');
const Task = require('../src/models/Task');

const ADZPILOT_TASK = {
  title: 'AdzPilot AI — Onboard 4 new engineers',
  categorySlug: 'user-management',
  difficulty: 'intermediate',
  estimatedMinutes: 25,
  points: 150,
  scenario:
    'AdzPilot AI is scaling up. Prasad, Jayesh, Yash and Ankit are joining tomorrow as engineers, ' +
    'and it is your job to set up their Linux accounts so they can start on day one. ' +
    'Create exactly these four accounts and nothing else — no extra users.',
  objectives: [
    'Create user accounts for prasad, jayesh, yash and ankit',
    'Give each engineer a home directory and a /bin/bash login shell',
    'Create the engineers group',
    'Add all four engineers to the engineers group',
    'Set the correct owner and permissions on each home directory',
  ],
  requirements: [
    'Users prasad, jayesh, yash and ankit exist',
    'Each engineer uses /bin/bash as their login shell',
    'Group engineers exists',
    'Every engineer is a member of the engineers group',
    'Each home directory is owned by its user with mode 750',
  ],
  instructions: [
    'Create the engineers group first.',
    'Create each user with a home directory and /bin/bash shell.',
    'Add all four engineers to the engineers group.',
    'Fix the owner and permissions of each home directory.',
    'Verify with: id prasad, groups jayesh, ls -ld /home/yash, getent passwd ankit',
  ],
  expectedOutcome:
    'id prasad, id jayesh, id yash and id ankit each show the engineers group, ' +
    'and every /home/<user> is owned by that user with mode 750.',
  learningOutcomes: [
    'Create multiple users and groups with useradd/groupadd',
    'Manage group membership with usermod -aG',
    'Set ownership with chown and modes with chmod',
  ],
  hints: [
    'Run groupadd engineers once, then useradd -m -s /bin/bash <user> for each engineer.',
    'Membership is added with usermod -aG engineers <user>.',
    'A correct home directory looks like drwxr-x--- <user> <user>.',
  ],
  solution:
    'groupadd engineers\n' +
    'useradd -m -s /bin/bash prasad\nuseradd -m -s /bin/bash jayesh\n' +
    'useradd -m -s /bin/bash yash\nuseradd -m -s /bin/bash ankit\n' +
    'usermod -aG engineers prasad\nusermod -aG engineers jayesh\n' +
    'usermod -aG engineers yash\nusermod -aG engineers ankit\n' +
    'chown prasad:prasad /home/prasad && chmod 750 /home/prasad\n' +
    'chown jayesh:jayesh /home/jayesh && chmod 750 /home/jayesh\n' +
    'chown yash:yash /home/yash && chmod 750 /home/yash\n' +
    'chown ankit:ankit /home/ankit && chmod 750 /home/ankit',
  validationRules: [
    { type: 'user_exists', label: 'User prasad exists', params: { username: 'prasad' } },
    { type: 'user_exists', label: 'User jayesh exists', params: { username: 'jayesh' } },
    { type: 'user_exists', label: 'User yash exists', params: { username: 'yash' } },
    { type: 'user_exists', label: 'User ankit exists', params: { username: 'ankit' } },
    { type: 'group_exists', label: 'Group engineers exists', params: { group: 'engineers' } },
    { type: 'command_contains', label: 'prasad is in the engineers group', params: { command: 'groups prasad', needle: 'engineers' } },
    { type: 'command_contains', label: 'jayesh is in the engineers group', params: { command: 'groups jayesh', needle: 'engineers' } },
    { type: 'command_contains', label: 'yash is in the engineers group', params: { command: 'groups yash', needle: 'engineers' } },
    { type: 'command_contains', label: 'ankit is in the engineers group', params: { command: 'groups ankit', needle: 'engineers' } },
    { type: 'command_contains', label: 'prasad login shell is /bin/bash', params: { command: 'getent passwd prasad', needle: '/bin/bash' } },
    { type: 'command_contains', label: 'jayesh login shell is /bin/bash', params: { command: 'getent passwd jayesh', needle: '/bin/bash' } },
    { type: 'command_contains', label: 'yash login shell is /bin/bash', params: { command: 'getent passwd yash', needle: '/bin/bash' } },
    { type: 'command_contains', label: 'ankit login shell is /bin/bash', params: { command: 'getent passwd ankit', needle: '/bin/bash' } },
    { type: 'file_owner', label: '/home/prasad owned by prasad', params: { path: '/home/prasad', expected: 'prasad:prasad' } },
    { type: 'file_owner', label: '/home/jayesh owned by jayesh', params: { path: '/home/jayesh', expected: 'jayesh:jayesh' } },
    { type: 'file_owner', label: '/home/yash owned by yash', params: { path: '/home/yash', expected: 'yash:yash' } },
    { type: 'file_owner', label: '/home/ankit owned by ankit', params: { path: '/home/ankit', expected: 'ankit:ankit' } },
    { type: 'file_permissions', label: '/home/prasad permissions are 750', params: { path: '/home/prasad', expected: '750' } },
    { type: 'file_permissions', label: '/home/jayesh permissions are 750', params: { path: '/home/jayesh', expected: '750' } },
    { type: 'file_permissions', label: '/home/yash permissions are 750', params: { path: '/home/yash', expected: '750' } },
    { type: 'file_permissions', label: '/home/ankit permissions are 750', params: { path: '/home/ankit', expected: '750' } },
  ],
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Set MONGODB_URI (the database connection string) first.');
  await mongoose.connect(uri);
  console.log('[adzpilot] connected');

  const existing = await Task.findOne({ title: ADZPILOT_TASK.title });
  if (existing) {
    console.log('[adzpilot] task already exists — nothing to do.');
    await mongoose.disconnect();
    return;
  }

  const cat = await Category.findOne({ slug: ADZPILOT_TASK.categorySlug });
  if (!cat) {
    await mongoose.disconnect();
    throw new Error(`Category "${ADZPILOT_TASK.categorySlug}" not found. Run the seed first.`);
  }

  const { categorySlug, ...taskData } = ADZPILOT_TASK;
  const task = await Task.create({
    ...taskData,
    category: cat._id,
    status: 'published',
    publishedAt: new Date(),
  });
  console.log(`[adzpilot] created "${task.title}" (${task.validationRules.length} checks)`);
  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('[adzpilot] failed:', e.message);
    process.exit(1);
  });
