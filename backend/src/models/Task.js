const mongoose = require('mongoose');

const validationRuleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'file_exists',
        'dir_exists',
        'user_exists',
        'user_absent',
        'group_exists',
        'group_absent',
        'package_installed',
        'service_active',
        'service_enabled',
        'port_open',
        'file_contains',
        'file_permissions',
        'file_owner',
        'command_contains',
      ],
    },
    label: { type: String, required: true },
    params: {
      path: { type: String, default: '' },
      username: { type: String, default: '' },
      group: { type: String, default: '' },
      package: { type: String, default: '' },
      service: { type: String, default: '' },
      port: { type: Number, default: null },
      command: { type: String, default: '' },
      needle: { type: String, default: '' },
      expected: { type: String, default: '' },
    },
    points: { type: Number, default: null },
  },
  { _id: false }
);

const taskSectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    instructions: { type: [String], default: [] },
    checks: { type: [validationRuleSchema], default: [] },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
    estimatedMinutes: { type: Number, required: true, min: 1 },
    points: { type: Number, required: true, min: 0 },
    scenario: { type: String, required: true },
    objectives: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    instructions: { type: [String], default: [] },
    expectedOutcome: { type: String, default: '' },
    learningOutcomes: { type: [String], default: [] },
    hints: { type: [String], default: [] },
    solution: { type: String, default: '' },
    validationRules: { type: [validationRuleSchema], default: [] },
    sections: { type: [taskSectionSchema], default: [] },
    setupCommands: { type: [String], default: [] },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.index({ status: 1, category: 1 });
taskSchema.index({ title: 'text', scenario: 'text' });

taskSchema.methods.toStudentJSON = function toStudentJSON() {
  const obj = this.toObject({ virtuals: false });
  delete obj.solution;
  delete obj.setupCommands;
  return { ...obj, id: obj._id.toString(), category: obj.category };
};

taskSchema.methods.toAdminJSON = function toAdminJSON() {
  const obj = this.toObject({ virtuals: false });
  return { ...obj, id: obj._id.toString(), category: obj.category };
};

module.exports = mongoose.model('Task', taskSchema);
