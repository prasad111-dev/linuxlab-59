/* One-off: migrate backwards user/group removal rules to the new absent types.
   The "Onboarding and Offboarding Staff Accounts" task checked "Verify old user is
   removed" with type=user_exists (passes when the user EXISTS — backwards).
   Usage:
     cd backend
     MONGODB_URI="<production uri>" node scripts/fix-absent-rules.js
   Safe to re-run: rules already of type user_absent/group_absent are skipped. */
require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../src/models/Task');

const RULES_TO_FIX = [
  // user_exists on a user that must be REMOVED → user_absent
  { type: 'user_exists', label: 'Verify old user is removed', username: 'asmith' },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Set MONGODB_URI (the database connection string) first.');
  await mongoose.connect(uri);
  console.log('[fix-absent-rules] connected');

  const tasks = await Task.find({ status: { $ne: 'draft' } }).select('title validationRules');
  let fixed = 0;

  for (const task of tasks) {
    let changed = false;
    for (const rule of task.validationRules || []) {
      const p = rule.params || {};
      for (const target of RULES_TO_FIX) {
        const wantsAbsent = target.type === 'user_exists' && target.username && p.username === target.username;
        const isReverseLabel = (rule.label || '').toLowerCase().includes('removed');
        if (wantsAbsent && isReverseLabel && rule.type === 'user_exists') {
          rule.type = 'user_absent';
          changed = true;
        }
      }
    }
    if (changed) {
      task.markModified('validationRules');
      await task.save();
      fixed += 1;
      console.log(`[fix-absent-rules] fixed "${task.title}": removal rules now use user_absent`);
    }
  }

  console.log(`[fix-absent-rules] done — updated ${fixed} task(s).`);
  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('[fix-absent-rules] failed:', e.message);
    process.exit(1);
  });
