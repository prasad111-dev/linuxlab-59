/**
 * Seed a TCS employee onboarding task into the database.
 * Run: MONGODB_URI="<uri>" node scripts/seed-tcs-task.js
 */
const mongoose = require('mongoose');
const config = require('../src/config');
const Task = require('../src/models/Task');
const Category = require('../src/models/Category');

const TCS_TASK = {
  title: 'Onboard a TCS employee',
  difficulty: 'beginner',
  estimatedMinutes: 25,
  points: 120,
  status: 'published',
  publishedAt: new Date(),
  scenario:
    'A new TCS employee, Priya Sharma, is joining the Infrastructure & Cloud team tomorrow morning. ' +
    'She needs a Linux workstation account with the right group memberships, a secured home directory, ' +
    'SSH key-based login, and sudo access for development tools. The HR ticket (INC-4821) is urgent — ' +
    'complete all steps so she can start on day one.',
  objectives: [
    'Create user priya with a home directory and bash shell',
    'Create groups tcs-employees and tcs-infra',
    'Add priya to both groups',
    'Set up SSH key authentication for priya',
    'Grant priya passwordless sudo for common dev tools',
    'Set correct home directory permissions',
  ],
  requirements: [
    'User priya exists with /bin/bash as login shell',
    'Group tcs-employees exists',
    'Group tcs-infra exists',
    'priya is a member of both tcs-employees and tcs-infra',
    '/home/priya/.ssh/authorized_keys exists and is readable by priya',
    'priya has sudo access (is in the sudo group)',
    '/home/priya is owned by priya:priya with permissions 700',
  ],
  instructions: [
    'Create the tcs-employees and tcs-infra groups first.',
    'Create priya with a home directory, bash shell, and primary group priya.',
    'Add priya to both tcs-employees and tcs-infra groups.',
    'Create /home/priya/.ssh and add an authorized_keys file with a test public key.',
    'Add priya to the sudo group for development tool access.',
    'Lock down the home directory: owner priya, mode 700.',
    'Verify with: id priya, ls -la /home/priya/.ssh/, sudo -l -U priya',
  ],
  expectedOutcome:
    'id priya shows membership in priya, sudo, tcs-employees, and tcs-infra groups. ' +
    '/home/priya/.ssh/authorized_keys exists and the home directory is mode 700.',
  learningOutcomes: [
    'Create users and groups for enterprise environments',
    'Set up SSH key-based authentication',
    'Manage sudo access for developers',
    'Secure home directory permissions',
  ],
  hints: [
    'Use groupadd for each group, then useradd -m -s /bin/bash -G tcs-employees,tcs-infra priya.',
    'SSH keys go in /home/priya/.ssh/authorized_keys — create the .ssh dir first.',
    'Add sudo access with: usermod -aG sudo priya',
    'Home directory permissions: chmod 700 /home/priya',
  ],
  solution:
    'groupadd tcs-employees\n' +
    'groupadd tcs-infra\n' +
    'useradd -m -s /bin/bash -G tcs-employees,tcs-infra,sudo priya\n' +
    'mkdir -p /home/priya/.ssh\n' +
    'echo "ssh-rsa AAAA...priya-key" > /home/priya/.ssh/authorized_keys\n' +
    'chmod 700 /home/priya/.ssh\n' +
    'chmod 600 /home/priya/.ssh/authorized_keys\n' +
    'chown -R priya:priya /home/priya/.ssh\n' +
    'chmod 700 /home/priya',
  setupCommands: [
    'apt-get update -qq && apt-get install -y -qq sudo > /dev/null 2>&1',
  ],
  validationRules: [
    { type: 'user_exists', label: 'User priya exists', params: { username: 'priya' } },
    { type: 'group_exists', label: 'Group tcs-employees exists', params: { group: 'tcs-employees' } },
    { type: 'group_exists', label: 'Group tcs-infra exists', params: { group: 'tcs-infra' } },
    { type: 'command_contains', label: 'priya is in tcs-employees group', params: { command: 'groups priya', needle: 'tcs-employees' } },
    { type: 'command_contains', label: 'priya is in tcs-infra group', params: { command: 'groups priya', needle: 'tcs-infra' } },
    { type: 'command_contains', label: 'priya login shell is /bin/bash', params: { command: 'getent passwd priya', needle: '/bin/bash' } },
    { type: 'file_exists', label: '/home/priya/.ssh/authorized_keys exists', params: { path: '/home/priya/.ssh/authorized_keys' } },
    { type: 'file_permissions', label: '/home/priya/.ssh/authorized_keys is 600', params: { path: '/home/priya/.ssh/authorized_keys', expected: '600' } },
    { type: 'file_permissions', label: '/home/priya is mode 700', params: { path: '/home/priya', expected: '700' } },
    { type: 'command_contains', label: 'priya has sudo access', params: { command: 'groups priya', needle: 'sudo' } },
  ],
};

async function main() {
  await mongoose.connect(config.mongodbUri);
  console.log('[seed-tcs] connected to MongoDB');

  const cat = await Category.findOne({ slug: 'user-management' });
  if (!cat) {
    console.error('[seed-tcs] category "user-management" not found');
    process.exit(1);
  }

  const existing = await Task.findOne({ title: TCS_TASK.title });
  if (existing) {
    console.log(`[seed-tcs] task "${TCS_TASK.title}" already exists (id: ${existing._id})`);
    process.exit(0);
  }

  const task = await Task.create({
    ...TCS_TASK,
    category: cat._id,
  });
  console.log(`[seed-tcs] created task: ${task.title} (${task._id})`);
  process.exit(0);
}

main().catch((e) => {
  console.error('[seed-tcs] failed:', e.message);
  process.exit(1);
});
